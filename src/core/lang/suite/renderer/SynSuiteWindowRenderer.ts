import {SynAutomatedTestResult} from "../SynAutomatedTestResult";
import {SynSuiteInspection} from "../SynSuiteParserTest";

interface SynSuiteResultRenderer {
    render(results: Map<string, SynAutomatedTestResult>): void;
}

/**
 * Renders SynSuite test results by opening a styled popup window with a full
 * pass/fail dashboard: summary stats, AST tree diffs, inspection diffs, and
 * per-phase timing breakdowns.
 *
 * Failed tests are expanded by default; passed tests are collapsed.
 * A filter bar lets the user narrow to Passed / Failed results.
 *
 * @author Atzitz Amos
 * @since 1.0.0
 */
export class SynSuiteWindowRenderer implements SynSuiteResultRenderer {

    render(results: Map<string, SynAutomatedTestResult>): void {
        const popup = window.open(
            "",
            "SynSuiteResults",
            "width=1080,height=800,scrollbars=yes,resizable=yes,menubar=no,toolbar=no,location=no"
        );

        if (!popup) {
            console.error("[SynSuitePopupResultRenderer] Failed to open popup — popups may be blocked by the browser.");
            return;
        }

        popup.document.write(this.buildHtml(results));
        popup.document.close();
        popup.focus();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // HTML construction
    // ─────────────────────────────────────────────────────────────────────────

    private buildHtml(results: Map<string, SynAutomatedTestResult>): string {
        const entries = Array.from(results.entries());
        const total = entries.length;
        const passed = entries.filter(([, r]) => r.passed()).length;
        const failed = total - passed;
        const totalTime = entries.reduce((sum, [, r]) => sum + r.getTotalTime(), 0);
        const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;
        const timestamp = new Date().toLocaleString();

        const testCards = entries
            .map(([key, result], i) => this.buildTestCard(key, result, i))
            .join("\n");

        return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>SynSuite — Test Results</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg:          #0d1117;
      --surface:     #161b26;
      --surface-2:   #1f2536;
      --border:      #272d42;
      --border-soft: #1e2438;
      --text:        #cdd5ef;
      --text-dim:    #6b7599;
      --green:       #3fb950;
      --green-bg:    #0d2a14;
      --green-border:#1a4422;
      --red:         #f85149;
      --red-bg:      #2a0d0d;
      --red-border:  #521010;
      --yellow:      #e3b341;
      --yellow-bg:   #2a1f00;
      --blue:        #58a6ff;
      --purple:      #a371f7;
      --mono:        'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Courier New', monospace;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: var(--bg);
      color: var(--text);
      min-height: 100vh;
      padding: 28px 32px;
      font-size: 14px;
      line-height: 1.5;
    }

    /* ── Header ───────────────────────────────────────────────────────────── */
    .header {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 28px;
      padding-bottom: 20px;
      border-bottom: 1px solid var(--border);
    }

    .logo {
      width: 40px; height: 40px;
      border-radius: 10px;
      background: linear-gradient(135deg, var(--blue) 0%, var(--purple) 100%);
      display: flex; align-items: center; justify-content: center;
      font-size: 19px; font-weight: 900; color: #fff;
      flex-shrink: 0;
      letter-spacing: -1px;
    }

    .header-text h1 { font-size: 18px; font-weight: 700; letter-spacing: -.3px; }
    .header-text p  { font-size: 12px; color: var(--text-dim); margin-top: 2px; }

    /* ── Summary grid ─────────────────────────────────────────────────────── */
    .summary {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 16px;
    }

    .stat {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 18px 20px;
    }

    .stat-label {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: .09em;
      color: var(--text-dim);
      margin-bottom: 8px;
    }

    .stat-value {
      font-size: 30px;
      font-weight: 700;
      font-variant-numeric: tabular-nums;
      line-height: 1;
    }

    .stat-value small {
      font-size: 14px;
      font-weight: 400;
      color: var(--text-dim);
    }

    .c-blue   { color: var(--blue); }
    .c-green  { color: var(--green); }
    .c-red    { color: var(--red); }

    /* ── Progress bar ─────────────────────────────────────────────────────── */
    .progress-wrap {
      display: flex;
      align-items: center;
      gap: 14px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 14px 20px;
      margin-bottom: 20px;
    }

    .progress-label { font-size: 13px; color: var(--text-dim); white-space: nowrap; }

    .progress-track {
      flex: 1;
      height: 7px;
      background: var(--red-bg);
      border: 1px solid var(--red-border);
      border-radius: 99px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--green) 0%, #2ea043 100%);
      border-radius: 99px;
    }

    .progress-pct {
      font-size: 13px;
      font-weight: 700;
      min-width: 38px;
      text-align: right;
      color: var(--green);
    }

    /* ── Filter bar ───────────────────────────────────────────────────────── */
    .filter-bar {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
    }

    .filter-btn {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 6px;
      color: var(--text-dim);
      cursor: pointer;
      font-size: 12px;
      font-weight: 600;
      padding: 6px 14px;
      transition: color .12s, border-color .12s, background .12s;
    }

    .filter-btn:hover  { color: var(--text); background: var(--surface-2); }
    .filter-btn.active { color: var(--blue); border-color: var(--blue); background: var(--surface-2); }

    /* ── Test card ────────────────────────────────────────────────────────── */
    .test-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-left: 3px solid var(--border);
      border-radius: 10px;
      margin-bottom: 10px;
      overflow: hidden;
    }

    .test-card.passed { border-left-color: var(--green); }
    .test-card.failed { border-left-color: var(--red); }

    .test-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 13px 16px;
      cursor: pointer;
      user-select: none;
      transition: background .1s;
    }

    .test-header:hover { background: var(--surface-2); }

    .badge {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: .07em;
      text-transform: uppercase;
      padding: 3px 9px;
      border-radius: 5px;
      flex-shrink: 0;
    }

    .badge-pass { background: var(--green-bg); color: var(--green); border: 1px solid var(--green-border); }
    .badge-fail { background: var(--red-bg);   color: var(--red);   border: 1px solid var(--red-border); }

    .test-key  {
      font-family: var(--mono);
      font-size: 13px;
      font-weight: 600;
      flex-shrink: 0;
    }

    .test-desc {
      font-size: 12px;
      color: var(--text-dim);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      flex: 1;
    }

    .timing-chips {
      display: flex;
      gap: 10px;
      font-size: 11px;
      font-family: var(--mono);
      color: var(--text-dim);
      flex-shrink: 0;
    }

    .chip { display: flex; align-items: center; gap: 4px; }

    .dot {
      width: 6px; height: 6px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .dot-lex     { background: var(--blue); }
    .dot-parse   { background: var(--purple); }
    .dot-inspect { background: var(--yellow); }

    .chevron {
      font-size: 10px;
      color: var(--text-dim);
      flex-shrink: 0;
      transition: transform .2s ease;
    }

    .chevron.open { transform: rotate(180deg); }

    /* ── Test body ────────────────────────────────────────────────────────── */
    .test-body {
      display: none;
      border-top: 1px solid var(--border-soft);
      padding: 18px 20px;
    }

    .test-body.open { display: block; }

    /* ── Sections inside body ─────────────────────────────────────────────── */
    .section-label {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: .09em;
      color: var(--text-dim);
      margin-bottom: 8px;
    }

    .section + .section-label { margin-top: 18px; }

    /* ── Warnings ─────────────────────────────────────────────────────────── */
    .warnings {
      background: var(--yellow-bg);
      border: 1px solid #4a3800;
      border-radius: 8px;
      padding: 10px 14px;
      margin-bottom: 16px;
    }

    .warn-item {
      font-family: var(--mono);
      font-size: 12px;
      color: var(--yellow);
    }

    .warn-item + .warn-item { margin-top: 4px; }

    /* ── Side-by-side panes ───────────────────────────────────────────────── */
    .side-by-side {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .pane {
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      overflow: hidden;
    }

    .pane-header {
      padding: 6px 12px;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: .07em;
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .pane-header.h-expected { background: #0e1929; color: var(--blue); }
    .pane-header.h-match    { background: var(--green-bg); color: var(--green); }
    .pane-header.h-mismatch { background: var(--red-bg);   color: var(--red); }

    .pane-body {
      font-family: var(--mono);
      font-size: 11px;
      line-height: 1.65;
      white-space: pre;
      overflow: auto;
      max-height: 280px;
      padding: 10px 12px;
      color: var(--text);
    }

    /* ── Inspection items ─────────────────────────────────────────────────── */
    .insp-item {
      padding: 8px 12px;
      border-bottom: 1px solid var(--border-soft);
    }

    .insp-item:last-child { border-bottom: none; }

    .insp-key   { font-family: var(--mono); font-size: 11px; font-weight: 600; color: var(--blue); }
    .insp-msg   { font-size: 12px; color: var(--text); margin-top: 3px; }
    .insp-range { font-family: var(--mono); font-size: 10px; color: var(--text-dim); margin-top: 2px; }

    .insp-empty {
      padding: 14px 12px;
      font-size: 12px;
      color: var(--text-dim);
      font-style: italic;
      text-align: center;
    }

    /* ── Timing breakdown ─────────────────────────────────────────────────── */
    .timing-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
    }

    .timing-cell {
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 10px 14px;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
    }

    .timing-name { color: var(--text-dim); flex: 1; }
    .timing-val  { font-family: var(--mono); font-weight: 700; }
  </style>
</head>
<body>

<!-- Header -->
<div class="header">
  <div class="logo">S</div>
  <div class="header-text">
    <h1>SynSuite — Test Results</h1>
    <p>Run completed &middot; ${timestamp}</p>
  </div>
</div>

<!-- Summary stats -->
<div class="summary">
  <div class="stat">
    <div class="stat-label">Total</div>
    <div class="stat-value c-blue">${total}</div>
  </div>
  <div class="stat">
    <div class="stat-label">Passed</div>
    <div class="stat-value c-green">${passed}</div>
  </div>
  <div class="stat">
    <div class="stat-label">Failed</div>
    <div class="stat-value c-red">${failed}</div>
  </div>
  <div class="stat">
    <div class="stat-label">Total Time</div>
    <div class="stat-value">${totalTime.toFixed(1)}<small>ms</small></div>
  </div>
</div>

<!-- Pass rate bar -->
<div class="progress-wrap">
  <span class="progress-label">Pass rate</span>
  <div class="progress-track">
    <div class="progress-fill" style="width:${passRate}%"></div>
  </div>
  <span class="progress-pct">${passRate}%</span>
</div>

<!-- Filter -->
<div class="filter-bar">
  <button class="filter-btn active" onclick="applyFilter('all', this)">All (${total})</button>
  <button class="filter-btn"        onclick="applyFilter('passed', this)">✓ Passed (${passed})</button>
  <button class="filter-btn"        onclick="applyFilter('failed', this)">✗ Failed (${failed})</button>
</div>

<!-- Test cards -->
<div id="test-list">${testCards}</div>

<script>
  function toggle(id) {
    const body    = document.getElementById('body-' + id);
    const chevron = document.getElementById('chev-' + id);
    const open    = body.classList.toggle('open');
    chevron.classList.toggle('open', open);
  }

  function applyFilter(type, btn) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.test-card').forEach(card => {
      card.style.display =
        type === 'all' || card.classList.contains(type) ? '' : 'none';
    });
  }
</script>

</body>
</html>`;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Per-test card
    // ─────────────────────────────────────────────────────────────────────────

    private buildTestCard(key: string, result: SynAutomatedTestResult, index: number): string {
        const pass = result.passed();
        const id = `t${index}`;
        const treeMatch = result.test.expectedTree === result.actualTree;
        const inspMatch = this.inspectionsMatch(result);

        const warningsHtml = result.warnings.length > 0 ? `
    <div class="warnings">
      ${result.warnings.map(w => `<div class="warn-item">⚠ ${this.escape(w)}</div>`).join("")}
    </div>` : "";

        const treeDiff = `
    <div class="section-label section">AST Tree</div>
    <div class="side-by-side">
      <div class="pane">
        <div class="pane-header h-expected">Expected</div>
        <div class="pane-body">${this.escape(result.test.expectedTree)}</div>
      </div>
      <div class="pane">
        <div class="pane-header ${treeMatch ? "h-match" : "h-mismatch"}">${treeMatch ? "✓ Actual — matches" : "✗ Actual — mismatch"}</div>
        <div class="pane-body">${this.escape(result.actualTree)}</div>
      </div>
    </div>`;

        const inspectionsDiff = `
    <div class="section-label section">Inspections</div>
    <div class="side-by-side">
      <div class="pane">
        <div class="pane-header h-expected">Expected (${result.test.expectedInspections.length})</div>
        ${this.renderInspections(result.test.expectedInspections)}
      </div>
      <div class="pane">
        <div class="pane-header ${inspMatch ? "h-match" : "h-mismatch"}">${inspMatch ? "✓" : "✗"} Actual (${result.actualInspections.length})</div>
        ${this.renderInspections(result.actualInspections)}
      </div>
    </div>`;

        const timingDetail = `
    <div class="section-label section">Timing</div>
    <div class="timing-grid">
      <div class="timing-cell">
        <span class="dot dot-lex"></span>
        <span class="timing-name">Lexer</span>
        <span class="timing-val">${result.lexerTime.toFixed(3)}<small style="font-weight:400;color:var(--text-dim)">ms</small></span>
      </div>
      <div class="timing-cell">
        <span class="dot dot-parse"></span>
        <span class="timing-name">Parser</span>
        <span class="timing-val">${result.parserTime.toFixed(3)}<small style="font-weight:400;color:var(--text-dim)">ms</small></span>
      </div>
      <div class="timing-cell">
        <span class="dot dot-inspect"></span>
        <span class="timing-name">Inspections</span>
        <span class="timing-val">${result.inspectionTime.toFixed(3)}<small style="font-weight:400;color:var(--text-dim)">ms</small></span>
      </div>
      <div class="timing-cell" style="border-color:#2e3147">
        <span class="timing-name" style="color:var(--text);font-weight:600">Total</span>
        <span class="timing-val" style="color:var(--blue)">${result.getTotalTime().toFixed(3)}<small style="font-weight:400;color:var(--text-dim)">ms</small></span>
      </div>
    </div>`;

        return `
<div class="test-card ${pass ? "passed" : "failed"}">
  <div class="test-header" onclick="toggle('${id}')">
    <span class="badge ${pass ? "badge-pass" : "badge-fail"}">${pass ? "PASS" : "FAIL"}</span>
    <span class="test-key">${this.escape(key)}</span>
    ${result.test.description ? `<span class="test-desc">${this.escape(result.test.description)}</span>` : `<span class="test-desc"></span>`}
    <div class="timing-chips">
      <span class="chip"><span class="dot dot-lex"></span>${result.lexerTime.toFixed(2)}ms</span>
      <span class="chip"><span class="dot dot-parse"></span>${result.parserTime.toFixed(2)}ms</span>
      <span class="chip"><span class="dot dot-inspect"></span>${result.inspectionTime.toFixed(2)}ms</span>
    </div>
    <span class="chevron ${!pass ? "open" : ""}" id="chev-${id}">▼</span>
  </div>
  <div class="test-body ${!pass ? "open" : ""}" id="body-${id}">
    ${warningsHtml}${treeDiff}${inspectionsDiff}${timingDetail}
  </div>
</div>`;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────────────────

    private renderInspections(inspections: SynSuiteInspection[]): string {
        if (inspections.length === 0) {
            return `<div class="insp-empty">No inspections</div>`;
        }
        return inspections.map(i => `
      <div class="insp-item">
        <div class="insp-key">${this.escape(i.inspectionKey)}</div>
        <div class="insp-msg">${this.escape(i.message)}</div>
        <div class="insp-range">[${i.range.start} – ${i.range.end}]</div>
      </div>`).join("");
    }

    private inspectionsMatch(result: SynAutomatedTestResult): boolean {
        const {expectedInspections, actualInspections} = result.test
            ? {expectedInspections: result.test.expectedInspections, actualInspections: result.actualInspections}
            : {expectedInspections: [], actualInspections: result.actualInspections};

        return expectedInspections.length === result.actualInspections.length &&
            expectedInspections.every(exp =>
                result.actualInspections.some(act =>
                    exp.inspectionKey === act.inspectionKey &&
                    exp.message === act.message &&
                    exp.range.start === act.range.start &&
                    exp.range.end === act.range.end
                )
            );
    }

    /** Escapes a string for safe embedding in HTML. */
    private escape(s: string): string {
        return s
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}
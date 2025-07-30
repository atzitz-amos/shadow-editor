(function () {
    const e = document.createElement("link").relList;
    if (e && e.supports && e.supports("modulepreload")) return;
    for (const r of document.querySelectorAll('link[rel="modulepreload"]')) i(r);
    new MutationObserver(r => {
        for (const o of r) if (o.type === "childList") for (const h of o.addedNodes) h.tagName === "LINK" && h.rel === "modulepreload" && i(h)
    }).observe(document, {childList: !0, subtree: !0});

    function t(r) {
        const o = {};
        return r.integrity && (o.integrity = r.integrity), r.referrerPolicy && (o.referrerPolicy = r.referrerPolicy), r.crossOrigin === "use-credentials" ? o.credentials = "include" : r.crossOrigin === "anonymous" ? o.credentials = "omit" : o.credentials = "same-origin", o
    }

    function i(r) {
        if (r.ep) return;
        r.ep = !0;
        const o = t(r);
        fetch(r.href, o)
    }
})();

class d {
    static createElement(e, t) {
        function i(u, p, g) {
            switch (p) {
                case".":
                    u.classList.add(g);
                    break;
                case"#":
                    u.id = g;
                    break
            }
        }

        let r = "", o = null, h = null;
        for (let u of e) [".", "#"].includes(u) ? (o ? i(o, h, r) : o = document.createElement(r), h = u, r = "") : r += u;
        return i(o, h, r), t && t.appendChild(o), o
    }

    static px(e) {
        return `${e}px`
    }
}

class _ {
    view;
    element
}

class fe extends _ {
    visualLineCount;
    lines;
    edgelines;

    constructor(e, t) {
        super(), this.view = e, this.element = d.createElement("div.editor-layer.layer-inner", t)
    }

    init() {
        this.visualLineCount = this.view.visualLineCount, this.lines = [];
        let e = d.createElement("div.editor-line.editor-line-edge", this.element);
        for (let i = 0; i < this.visualLineCount; i++) this.lines.push(d.createElement("div.editor-line.line-" + i, this.element));
        let t = d.createElement("div.editor-line.editor-line-edge", this.element);
        this.edgelines = [e, t]
    }

    destroy() {
    }

    render() {
    }

    update() {
    }

    renderLine(e, t) {
        this.lines[e].innerHTML = "", this.lines[e].append(...t)
    }

    renderEdgeLine(e, t) {
        this.edgelines[e].innerHTML = "", this.edgelines[e].append(...t)
    }
}

class me extends _ {
    _caret;
    _input;
    _blink;

    constructor(e, t) {
        super(), this.view = e, this.element = d.createElement("div.editor-layer.layer-caret", t), this._caret = d.createElement("div.editor-caret#caret-0", this.element), this._input = d.createElement("input.editor-input", this.element), this._blink = setInterval(() => this.blink(), 750)
    }

    blinkReset() {
        this._caret.classList.remove("blink"), clearInterval(this._blink), this._blink = setInterval(this.blink.bind(this), 750)
    }

    focus() {
        this._input.focus()
    }

    init() {
    }

    setupEventListeners() {
        this._input.addEventListener("input", e => {
            this.view.editor.fire("onInput", e), this.blinkReset()
        }), this._input.addEventListener("keydown", e => {
            this.view.editor.fire("onKeyDown", e)
        }), this._input.addEventListener("keyup", e => {
            this.view.editor.fire("onKeyUp", e)
        }), this._input.addEventListener("focus", e => {
            this.view.editor.fire("onFocus", e), this.blinkReset()
        }), this._input.addEventListener("blur", e => {
            this.view.editor.fire("onBlur", e), this.blinkReset()
        })
    }

    destroy() {
    }

    render() {
        this.update()
    }

    update() {
        this.view.editor.caretModel.forEachCaret(e => {
            let t = this.getCaretElement(e);
            t.style.top = d.px(e.position.toVisual().y), t.style.left = d.px(e.position.toVisual().x)
        })
    }

    getCaretElement(e) {
        return this.element.querySelector(`#caret-${e.id}`)
    }

    blink() {
        this._caret.classList.toggle("blink")
    }
}

class we extends _ {
    constructor(e, t) {
        super(), this.view = e, this.element = d.createElement("div.editor-layer.layer-selection", t)
    }

    init() {
    }

    destroy() {
    }

    render() {
    }

    update() {
    }
}

class ve extends _ {
    _activeLine;

    constructor(e, t) {
        super(), this.view = e, this.element = d.createElement("div.editor-layer.layer-active-line", t), this._activeLine = d.createElement("div.editor-active-line", this.element)
    }

    init() {
        this.view.editor.properties
    }

    destroy() {
    }

    render() {
        this.update()
    }

    update() {
        let e = this.view.editor.caretModel.primary.position.toVisual().y;
        this._activeLine.style.top = d.px(e)
    }
}

class Ee {
    layers_el;
    text;
    caret;
    selection;
    activeLine;

    constructor(e) {
        this.layers_el = d.createElement("div.editor-layers", e.view), this.text = new fe(e, this.layers_el), this.caret = new me(e, this.layers_el), this.selection = new we(e, this.layers_el), this.activeLine = new ve(e, this.layers_el)
    }

    init() {
        this.text.init(), this.caret.init(), this.selection.init(), this.activeLine.init()
    }

    setupEventListeners() {
        this.caret.setupEventListeners()
    }

    destroy() {
        this.text.destroy(), this.caret.destroy(), this.selection.destroy(), this.activeLine.destroy(), this.layers_el.remove()
    }

    render() {
        this.text.render(), this.caret.render(), this.selection.render(), this.activeLine.render()
    }

    update() {
        this.text.update(), this.caret.update(), this.selection.update(), this.activeLine.update()
    }
}

class xe {
    view;
    element;

    constructor(e) {
        this.view = e, this.element = d.createElement("div.editor-gutter", e.view)
    }

    get numberLength() {
        return 1
    }

    init() {
    }

    initCSS() {
        this.update()
    }

    update() {
        this.element.style.setProperty("--editor-gutter-num-size", d.px(this.numberLength * this.view.getCharSize()))
    }

    destroy() {
    }

    render() {
    }
}

class oe {
    onAttached(e, t) {
    }

    onBlur(e, t) {
    }

    onFocus(e, t) {
    }

    onInput(e, t) {
    }

    onKeyDown(e, t) {
    }

    onKeyUp(e, t) {
    }

    onMouseDown(e, t) {
    }

    onMouseMove(e, t) {
    }

    onMouseUp(e, t) {
    }

    onRender(e) {
    }

    onScroll(e, t) {
    }
}

class ke {
    onCaretRemove(e, t) {
    }

    onCaretMove(e, t, i, r) {
    }
}

class ye {
    visualListeners = [];
    editorListeners = [];
    keybindingListeners = new Map;

    addVisualEventListener(e) {
        this.visualListeners.push(e)
    }

    addEditorEventListener(e) {
        this.editorListeners.push(e)
    }

    addKeybindingListener(e, t) {
        this.keybindingListeners.set(e, t)
    }

    fireKeybinding(e, t) {
        for (let [i, r] of this.keybindingListeners.entries()) this.matches(i, e) && r.apply(null, [t, e])
    }

    fire(e, ...t) {
        for (const i of this.visualListeners) {
            const r = i[e];
            r && r.apply(i, t)
        }
        for (const i of this.editorListeners) {
            const r = i[e];
            r && r.apply(i, t)
        }
    }

    matches(e, t) {
        return t.key === e.key && (e.ctrl ? t.ctrlKey : !0) && (e.alt ? t.altKey : !0) && (e.shift ? t.shiftKey : !0)
    }
}

const Le = {
    view: {
        width: 600,
        height: 400,
        gutterWidth: 60,
        lineHeight: 25,
        caretHeight: 20,
        fontSize: 16,
        rootBgColor: "#1e1f24",
        rootBorderColor: "#93969f",
        gutterColor: "#93969f",
        caretColor: "#ffffff",
        selectionColor: "#3a3d44",
        activeLineColor: "#2b2e38"
    }
};

class Se {
    view;
    scrollX;
    scrollY;

    constructor(e, t, i) {
        this.view = e, this.scrollX = t, this.scrollY = i
    }

    get scrollYLines() {
        return Math.ceil(this.scrollY / this.view.getLineHeight())
    }

    set scrollYLines(e) {
        this.scrollY = e * this.view.getLineHeight()
    }

    get scrollXChars() {
        return Math.ceil(this.scrollX / this.view.getCharSize())
    }

    set scrollXChars(e) {
        this.scrollX = e * this.view.getCharSize()
    }

    get scrollYOffset() {
        return this.scrollY % this.view.getLineHeight()
    }

    get scrollXOffset() {
        return this.scrollX % this.view.getCharSize()
    }
}

function be(s) {
    let e = d.createElement("div.editor-sizer", s.view);
    return e.innerHTML = "a", () => e.getBoundingClientRect().width
}

class Ae {
    editor;
    view;
    scroll;
    gutter;
    layers;
    getCharSize;
    getLineHeight;
    visualLineCount;

    constructor(e) {
        this.editor = e, this.editor.addVisualEventListener(new class extends oe {
            onBlur(t, i) {
                t.root.classList.remove("focused")
            }

            onFocus(t, i) {
                t.root.classList.add("focused")
            }

            onMouseDown(t, i) {
                i.preventDefault(), t.view.focus()
            }

            onScroll(t, i) {
                i.preventDefault();
                let r = i.deltaY;
                r !== 0 && t.view.scrollBy(0, r), t.view.resetBlink()
            }
        }), this.editor.addEditorEventListener(new class extends ke {
            onCaretMove(t, i, r, o) {
                i.editor.view.scrollIntoView(o, 1)
            }
        })
    }

    onAttached(e, t) {
        this.view = d.createElement("div.editor-view", t), this.scroll = new Se(this, 0, 0), this.gutter = new xe(this), this.layers = new Ee(this), this.initCSS(), this.setupEventListeners(), this.gutter.init(), this.layers.init(), this.render()
    }

    setCSSProperties(e, t) {
        for (const [i, r] of Object.entries(t)) e.style.setProperty(i, r)
    }

    focus() {
        this.layers.caret.focus()
    }

    scrollBy(e, t) {
        let i = this.scroll.scrollY + t;
        i < 0 ? this.scroll.scrollY = 0 : i > (this.editor.getLineCount() - this.visualLineCount + 2) * this.getLineHeight() ? this.scroll.scrollY = Math.max(0, (this.editor.getLineCount() - this.visualLineCount + 2) * this.getLineHeight()) : this.scroll.scrollY = i
    }

    scrollIntoView(e, t) {
        let i = this.scrollIntoViewAlong(e.y, this.scroll.scrollYLines, this.scroll.scrollYLines + this.visualLineCount - 1);
        i !== null && (this.scroll.scrollY = i * this.getLineHeight())
    }

    animateScroll(e) {
    }

    getRelativePos(e) {
        let t = e.clientX - this.layers.layers_el.getBoundingClientRect().left,
            i = e.clientY - this.layers.layers_el.getBoundingClientRect().top;
        return [t, i]
    }

    render() {
        let e = this.scroll.scrollYLines, t = this.scroll.scrollYOffset, i = this.editor.take(this.visualLineCount, e);
        for (let r = 0; r < this.visualLineCount; r++) this.layers.text.renderLine(r, i[r] || []);
        t && (e > 0 && this.layers.text.renderEdgeLine(0, this.editor.getLine(e - 1)), e + this.visualLineCount < this.editor.getLineCount() && this.layers.text.renderEdgeLine(1, this.editor.getLine(e + this.visualLineCount))), this.setCSSProperties(this.view, {"--editor-scroll-offsetY": d.px(t || this.getLineHeight())}), this.update()
    }

    update() {
        this.gutter.update(), this.layers.update()
    }

    destroy() {
        this.gutter.destroy(), this.layers.destroy(), this.view.remove()
    }

    updateTextLayer() {
        this.layers.text.update(), this.layers.activeLine.update()
    }

    updateCaret() {
        this.layers.caret.update()
    }

    updateSelection() {
        this.layers.selection.update()
    }

    updateActiveLine() {
        this.layers.activeLine.update()
    }

    updateGutter() {
        this.gutter.update()
    }

    resetBlink() {
        this.layers.caret.blinkReset()
    }

    scrollIntoViewAlong(e, t, i) {
        if (e > t && e < i) return null;
        if (e <= t) return Math.max(0, e - 2);
        {
            let r = i - t;
            return e + 1 >= this.editor.getLineCount() ? Math.max(0, this.editor.getLineCount() - r) : Math.max(0, e - r)
        }
    }

    setupEventListeners() {
        this.view.addEventListener("mousedown", e => this.editor.fire("onMouseDown", e)), this.view.addEventListener("mouseup", e => this.editor.fire("onMouseUp", e)), this.view.addEventListener("mousemove", e => this.editor.fire("onMouseMove", e)), this.view.addEventListener("wheel", e => this.editor.fire("onScroll", e)), this.view.addEventListener("contextmenu", e => e.preventDefault()), this.layers.setupEventListeners()
    }

    initCSS() {
        const e = this.editor.properties.view || (this.editor.properties.view = {});

        function t(i) {
            return e[i] || (e[i] = Le.view[i])
        }

        this.setCSSProperties(this.editor.root, {
            "--editor-width": d.px(t("width")),
            "--editor-height": d.px(t("height")),
            "--editor-root-bg": t("rootBgColor"),
            "--editor-root-border-color": t("rootBorderColor"),
            "--editor-font-size": d.px(t("fontSize")),
            "--editor-line-height": d.px(t("lineHeight")),
            "--editor-gutter-width": d.px(t("gutterWidth")),
            "--editor-caret-height": d.px(t("caretHeight")),
            "--editor-gutter-color": t("gutterColor"),
            "--editor-caret-color": t("caretColor"),
            "--editor-selection-color": t("selectionColor"),
            "--editor-active-line-color": t("activeLineColor")
        }), this.getCharSize = be(this), this.getLineHeight = () => e.lineHeight, this.visualLineCount = Math.floor(e.height / this.getLineHeight()), this.setCSSProperties(this.view, {"--editor-scroll-offsetY": d.px(this.getLineHeight())}), this.gutter.initCSS()
    }
}

class Ce {
    name;
    files;

    constructor(e, t) {
        this.name = e, this.files = t || []
    }

    static singleFileProject(e) {
        return new this("unnamed-project", [e])
    }

    addFile(e) {
        for (let t of this.files) if (t.path === e.path) return;
        this.files.push(e)
    }
}

class Re {
    name;
    path;
    type;

    constructor(e, t, i) {
        this.name = e || "temp-file", this.path = t ? t + "/" + this.name : "", this.type = i || "js"
    }

    read() {
        return this.path === "", ""
    }
}

class Te {
    editor;
    plugins;
    lexerProviderMap = new Map;
    highlighterProviderMap = new Map;
    parserProviderMap = new Map;

    constructor(e) {
        this.editor = e, this.plugins = {}
    }

    register(e) {
        this.plugins[e.name] = e, e.onRegistered(this.editor, this)
    }

    registerFileTypeAssociation(e, t, i, r) {
        this.lexerProviderMap.set(e, t), i && this.highlighterProviderMap.set(e, i), r && this.parserProviderMap.set(e, r)
    }

    getLexerForFileType(e) {
        const t = this.lexerProviderMap.get(e);
        if (t) return t()
    }

    getHighlighterForFileType(e) {
        const t = this.highlighterProviderMap.get(e);
        if (t) return t()
    }

    getParserForFileType(e) {
        const t = this.parserProviderMap.get(e);
        if (t) return t()
    }
}

class C {
    weight;
    left;
    right;
    value;

    constructor(e = null, t = null, i = null) {
        this.value = e, this.left = t, this.right = i, e !== null ? this.weight = e.length : t ? this.weight = t.getTotalWeight() : this.weight = 0
    }

    isLeaf() {
        return this.left === null && this.right === null
    }

    getTotalWeight() {
        return this.isLeaf() ? this.value ? this.value.length : 0 : (this.left ? this.left.getTotalWeight() : 0) + (this.right ? this.right.getTotalWeight() : 0)
    }
}

class P {
    root;

    constructor(e = "") {
        this.root = new C(e)
    }

    concat(e) {
        this.root = new C(null, this.root, e.root), this.root.weight = this.root.left.getTotalWeight()
    }

    index(e) {
        return this._index(this.root, e)
    }

    toString() {
        return this._toString(this.root)
    }

    split(e) {
        const [t, i] = this._split(this.root, e), r = new P;
        r.root = t;
        const o = new P;
        return o.root = i, [r, o]
    }

    insert(e, t) {
        const [i, r] = this.split(e), o = new P(t);
        i.concat(o), i.concat(r), this.root = i.root
    }

    delete(e, t) {
        const [i, r] = this.split(e), [o, h] = r.split(t);
        return i.concat(h), this.root = i.root, o.toString()
    }

    length() {
        return this.root.getTotalWeight()
    }

    substring(e, t) {
        if (t === void 0 && (t = this.length()), e < 0 || t > this.length() || e > t) throw new Error("Invalid range for substring");
        return this._toString(this.root).substring(e, t)
    }

    getTextInRange(e) {
        return this.substring(e.begin, e.end)
    }

    _index(e, t) {
        if (e.isLeaf()) {
            if (!e.value || t >= e.value.length) throw new Error("Index out of bounds");
            return e.value[t]
        }
        return t < e.weight ? this._index(e.left, t) : this._index(e.right, t - e.weight)
    }

    _toString(e) {
        return e.isLeaf() ? e.value ?? "" : this._toString(e.left) + this._toString(e.right)
    }

    _split(e, t) {
        if (e.isLeaf()) {
            const i = e.value.substring(0, t), r = e.value.substring(t);
            return [new C(i), new C(r)]
        }
        if (t < e.weight) {
            const [i, r] = this._split(e.left, t), o = new C(null, r, e.right);
            return [i, o]
        } else {
            const [i, r] = this._split(e.right, t - e.weight), o = new C(null, e.left, i);
            return o.weight = e.left.getTotalWeight(), [o, r]
        }
    }
}

class ae {
    components = [];

    add(e) {
        this.components.push(e), e.range
    }

    set(e, t) {
        this.components = this.components.filter(i => !i.range.overlaps(e));
        for (const i of t) this.add(i)
    }

    getRanges() {
        return this.components.map(e => e.range)
    }

    toRenderables(e, t = 0) {
        if (e ??= this.components, !e.length) return [];
        let i = e.flatMap(u => [{pos: u.range.begin, type: "start", component: u}, {
            pos: u.range.end,
            type: "end",
            component: u
        }]);
        i.sort((u, p) => u.pos - p.pos || (u.type === "end" ? 1 : -1));
        const r = [];
        let o = [], h = t;
        for (const u of i) {
            const p = u.pos;
            if (p > h) if (o.length === 0) {
                const g = document.createElement("span");
                g.textContent = " ".repeat(p - h), r.push(g)
            } else {
                const g = o.map(ge => ge.className).join(" ").trim(), k = o[o.length - 1],
                    F = Math.max(h, k.range.begin), de = Math.min(p, k.range.end),
                    pe = k.content.slice(F - k.range.begin, de - k.range.begin), W = document.createElement("span");
                W.className = g, W.textContent = pe, r.push(W)
            }
            if (u.type === "start") o.push(u.component); else {
                const g = o.indexOf(u.component);
                g !== -1 && o.splice(g, 1)
            }
            h = p
        }
        return r
    }

    query(e) {
        return this.components.filter(t => e.contains(t.range))
    }
}

class w {
    static _isLocked = !1;
    static waiting = [];
    static _count = 0;
    static _INSTANCE = null;
    static get INSTANCE() {
        if (!w._INSTANCE) throw new Error("Editor instance not acquired yet. Please call EditorInstance.acquire(editor) first.");
        return w._INSTANCE
    }

    static async acquireAsync(e) {
        if (!this._INSTANCE && !this._isLocked) this._isLocked = !0, this._INSTANCE = e, this._count = 0; else {
            if (this._INSTANCE === e) {
                this._count++;
                return
            }
            await new Promise(t => this.waiting.push([e, t]))
        }
    }

    static release() {
        if (this._count !== 0) {
            this._count--;
            return
        }
        if (!this.waiting.length) this._isLocked = !1, this._INSTANCE = null; else {
            const [e, t] = this.waiting.shift();
            this._INSTANCE = e, t()
        }
    }

    static async with(e, t) {
        await this.acquireAsync(e), t(), this.release()
    }

    static acquire(e) {
        if (!this.waitForFlagSync()) throw new Error("Error: Couldn't acquire editor instance in time. This is probably caused by an abnormal delay in an asynchronously running operation.");
        this._INSTANCE = e
    }

    static waitForFlagSync(e = 2e3) {
        if (!this._INSTANCE && !this._isLocked) return !0;
        console.warn(`Warning: Editor instance is already acquired. Waiting for it to be released for a maximum of ${e}ms...`);
        const t = Date.now();
        for (; Date.now() - t < e;) if (!this._INSTANCE && !this._isLocked) return !0;
        return !1
    }
}

class R {
    x;
    y;

    constructor(e, t) {
        this.x = e, this.y = t
    }
}

class x {
    editor;

    constructor(e, t) {
        this.editor = e, this._offset = t
    }

    _offset;
    get offset() {
        return this._offset
    }

    set offset(e) {
        e < 0 ? this._offset = 0 : e > this.editor.data.raw.length() ? this._offset = this.editor.data.raw.length() : this._offset = e
    }

    get x() {
        return this.toLogical().x
    }

    get y() {
        return this.toLogical().y
    }

    static fromOffset(e, t) {
        return new this(e, t)
    }

    static fromLogical(e, t, i) {
        return new this(e, e.calculateOffset(new R(t, i)))
    }

    static fromAbsolute(e, t, i) {
        return new this(e, e.absoluteToOffset(t, i))
    }

    static fromVisual(e, t, i) {
        let r = e.visualToNearestLogical(t, i);
        return x.fromLogical(e, r.x, r.y)
    }

    set(e, t) {
        this._offset = this.editor.calculateOffset(new R(e, t))
    }

    createLogical(e, t) {
        return x.fromLogical(this.editor, e, t)
    }

    createAbsolute(e, t) {
        return x.fromAbsolute(this.editor, e, t)
    }

    createVisual(e, t) {
        return x.fromVisual(this.editor, e, t)
    }

    toLogical() {
        return this.editor.offsetToLogical(this._offset)
    }

    toAbsolute() {
        return this.editor.offsetToAbsolute(this._offset)
    }

    toVisual() {
        return this.editor.logicalToVisual(this.toLogical())
    }

    toOffset() {
        return this._offset
    }

    isEOL() {
        return this.editor.offsetManager.lineEnd(this._offset) === this._offset
    }

    isBOL() {
        return this.editor.offsetManager.lineBegin(this._offset) === this._offset
    }
}

class S {
    static _INSTANCES = new Map;
    ranges = new Set;
    rangesRegistry = new FinalizationRegistry(e => {
        this.ranges.delete(e)
    });

    static get INSTANCE() {
        return S._INSTANCES.has(w.INSTANCE.id) || S._INSTANCES.set(w.INSTANCE.id, new S), S._INSTANCES.get(w.INSTANCE.id)
    }

    add(e) {
        const t = new WeakRef(e);
        this.ranges.add(t), this.rangesRegistry.register(e, t)
    }

    updateRanges(e, t) {
        for (const i of this.ranges) {
            const r = i.deref();
            if (!r) {
                this.ranges.delete(i);
                continue
            }
            r.begin > e && (r.begin += t), r.end >= e && (r.end += t)
        }
    }
}

class l {
    begin;
    end;

    constructor(e, t) {
        S.INSTANCE.add(this), this.begin = e, this.end = t
    }

    static of(e, t) {
        if (Array.isArray(e)) {
            let i = e.filter(r => r !== null);
            return i.length == 1 ? i[0].range.clone() : i.length == 0 ? new l(0, 0) : new l(i[0].range.begin, i[i.length - 1].range.end)
        }
        return t ? new l(e.range.begin, t.range.end) : e.range.clone()
    }

    static around(e) {
        return new l(e, e + 1)
    }

    moveBy(e) {
        this.begin += e, this.end += e
    }

    overlaps(e) {
        return this.begin <= e.end && this.end >= e.begin
    }

    contains(e) {
        return e instanceof l ? this.begin <= e.begin && this.end >= e.end : this.begin <= e && this.end >= e
    }

    clone() {
        return new l(this.begin, this.end)
    }
}

class Pe {
    edac = new ae;
    raw;
    language = "plaintext";
    srTree;

    constructor(e) {
        this.raw = new P(e)
    }

    get text() {
        return this.raw.toString()
    }

    setLanguage(e) {
        this.language = e
    }

    withContext(e) {
        let t = this.srTree.scoping.toplevel();
        return {
            begin: t.range.begin,
            end: t.range.end,
            text: this.raw.getTextInRange(t.range),
            scope: t,
            containingNode: this.srTree.getContainingNodeAt(e)
        }
    }

    setComponentsAtRange(e, t) {
        this.edac.set(e, t)
    }

    take(e, t, i) {
        let r = [];
        for (let o = 0; o < e; o++) r.push(this.getLine(t + o, i));
        return r
    }

    getLine(e, t) {
        if (t.length <= e) return [];
        {
            let i = new l(t[e], t[e + 1] || this.raw.length());
            return this.edac.toRenderables(this.edac.query(i), t[e])
        }
    }
}

class Me {
    data;
    lineBreaks = [0];

    constructor(e) {
        this.data = e
    }

    offsetToLogical(e) {
        let t = this.findFirstAfter(this.lineBreaks, e), i = t === -1 ? this.lineBreaks.length - 1 : t - 1,
            r = e - this.lineBreaks[i];
        return new R(r, i)
    }

    absoluteToLogical(e) {
        return e
    }

    logicalToAbsolute(e) {
        return e
    }

    calculateOffset(e) {
        return this.lineBreaks[e.y] + e.x
    }

    offset(e, t) {
        this._offsetList(this.lineBreaks, e, t), S.INSTANCE.updateRanges(e, t)
    }

    recomputeNewLines(e, t) {
        let i = this.findFirstAfter(this.lineBreaks, e);
        i === -1 && (i = this.lineBreaks.length);
        for (const r of t.matchAll(/\r\n|\n|\r/g)) {
            let o = e + r.index + r[0].length;
            this.lineBreaks.splice(i, 0, o), i++
        }
    }

    lineBegin(e) {
        for (let t = 1; t < this.lineBreaks.length; t++) if (e < this.lineBreaks[t]) return this.lineBreaks[t - 1];
        return this.lineBreaks[this.lineBreaks.length - 1]
    }

    lineEnd(e) {
        for (let t = 1; t < this.lineBreaks.length; t++) if (e < this.lineBreaks[t]) return this.lineBreaks[t] - 1;
        return this.data.raw.length()
    }

    withLine(e) {
        return this.data.raw.substring(this.lineBegin(e), this.lineEnd(e))
    }

    findFirstAfter(e, t) {
        for (let i = 0; i < e.length; i++) if (e[i] > t) return i;
        return -1
    }

    _offsetList(e, t, i) {
        let r = this.findFirstAfter(e, t);
        if (r !== -1) for (let o = r; o < e.length; o++) e[o] += i
    }
}

class K {
    id = 0;
    isPrimary;
    position;
    editor;
    vertMovementPos = 0;

    constructor(e, t, i) {
        this.editor = e, this.isPrimary = t, this.position = i
    }

    moveToLogical(e, t) {
        let i;
        typeof e == "number" ? i = this.position.createLogical(e, t) : i = this.position.createLogical(e.x, e.y);
        let r = this.position;
        this.position = i, this.editor.fire("onCaretMove", this, r, i)
    }

    moveToAbsolute(e, t) {
        typeof e == "number" ? e = this.position.createAbsolute(e, t) : e = this.position.createAbsolute(e.x, e.y);
        let i = this.position;
        this.position = e, this.editor.fire("onCaretMove", this, i, e)
    }

    shift(e = 1) {
        let t = this.position.offset;
        this.position.offset += e, this.editor.fire("onCaretMove", this, x.fromOffset(this.editor, t), this.position), this.vertMovementPos = 0
    }

    setVertMovementPos() {
        this.vertMovementPos = Math.max(this.vertMovementPos, this.position.x)
    }

    remove() {
        this.editor.fire("onCaretRemove", this)
    }
}

class Fe {
    editor;
    carets = [];

    constructor(e) {
        this.editor = e, this.carets.push(new K(e, !0, e.createLogical(0, 0)))
    }

    get primary() {
        return this.carets.find(e => e.isPrimary)
    }

    addCaret(e) {
        const t = new K(this.editor, !1, e);
        return this.carets.push(t), t
    }

    forEachCaret(e) {
        for (const t of this.carets) e(t)
    }

    shift(e) {
        this.forEachCaret(t => t.shift(e))
    }

    clearAll() {
        for (let e = 0; e < this.carets.length; e++) this.carets[e].isPrimary || (this.carets[e].remove(), this.carets.splice(e, 1), e--)
    }
}

var v = (s => (s.NUM0 = "0", s.NUM1 = "1", s.NUM2 = "2", s.NUM3 = "3", s.NUM4 = "4", s.NUM5 = "5", s.NUM6 = "6", s.NUM7 = "7", s.NUM8 = "8", s.NUM9 = "9", s.A = "A", s.B = "B", s.C = "C", s.D = "D", s.E = "E", s.F = "F", s.G = "G", s.H = "H", s.I = "I", s.J = "J", s.K = "K", s.L = "L", s.M = "M", s.N = "N", s.O = "O", s.P = "P", s.Q = "Q", s.R = "R", s.S = "S", s.T = "T", s.U = "U", s.V = "V", s.W = "W", s.X = "X", s.Y = "Y", s.Z = "Z", s.ESCAPE = "Escape", s.BACKSPACE = "Backspace", s.DELETE = "Delete", s.ENTER = "Enter", s.TAB = "Tab", s.ARROW_UP = "ArrowUp", s.ARROW_DOWN = "ArrowDown", s.ARROW_LEFT = "ArrowLeft", s.ARROW_RIGHT = "ArrowRight", s.PAGE_UP = "PageUp", s.PAGE_DOWN = "PageDown", s.HOME = "Home", s.END = "End", s.SPACE = " ", s.COMMA = ",", s.PERIOD = ".", s.SEMICOLON = ";", s.QUOTE = "'", s.SLASH = "/", s.BACKSLASH = "\\", s.DASH = "-", s.EQUALS = "=", s.LEFT_BRACKET = "[", s.RIGHT_BRACKET = "]", s.QUESTION_MARK = "?", s.TILDE = "~", s.CAPS_LOCK = "CapsLock", s.INSERT = "Insert", s))(v || {});

class c {
    isError = !1;
    type;
    value;
    range;
    isSpecial;
    isComment;

    constructor(e, t, i, r = !1, o = !1) {
        this.type = e, this.value = t, this.range = i, this.isSpecial = r, this.isComment = o
    }
}

class M extends c {
    isError = !0;
    msg;

    constructor(e, t, i, r) {
        super(e, t, r, !1, !1), this.msg = i
    }
}

class Be {
    src;
    index = 0;
    followupError = null;

    constructor(e) {
        this.src = e
    }

    consume() {
        return this.index >= this.src.length ? null : this.src[this.index++]
    }

    seek() {
        return this.index >= this.src.length ? null : this.src[this.index]
    }

    seekNext() {
        return this.src[this.index + 1] || null
    }

    find(e) {
        return this.src.indexOf(e, this.index + 1)
    }

    slice(e) {
        return this.src.slice(this.index + 1, e)
    }

    jump(e) {
        this.index += e
    }

    length() {
        return this.src.length - this.index
    }

    isEmpty() {
        return this.index >= this.src.length
    }

    clearError() {
        let e = this.followupError;
        return this.followupError = null, e
    }
}

class le {
    skipSpecial = !0;
    skipComments = !0;

    static of(...e) {
        return new G(e)
    }
}

class G extends le {
    tokens;
    index = 0;

    constructor(e) {
        super(), this.tokens = e
    }

    clone() {
        return new G(this.tokens.slice())
    }

    isEmpty() {
        return this.index >= this.tokens.length
    }

    seek() {
        return this.seekN(0)
    }

    seekIncludeSpecial() {
        return this.tokens[this.index]
    }

    seekN(e) {
        let t, i = this.index + e;
        do t = this.tokens[i], i += Math.sign(e) || 1; while (t && (this.skipComments && t.isComment || this.skipSpecial && t.isSpecial));
        return t || null
    }

    seekPrevious() {
        return this.seekN(-1)
    }

    consume() {
        const e = this.seek();
        return e && this.index++, e
    }

    exhaust() {
        let e = this.index;
        for (; !this.isEmpty();) this.consume();
        return this.tokens.slice(e)
    }

    includeComments() {
        this.skipComments = !1
    }

    includeSpecial() {
        this.skipSpecial = !1
    }
}

class N extends le {
    lexer;
    src;
    tokens = [];
    index = 0;
    computed = 0;

    constructor(e, t, i = !0) {
        super(), this.lexer = e, this.src = new Be(t), this.skipSpecial = i
    }

    clone() {
        const e = new N(this.lexer, this.src.src, this.skipSpecial);
        return e.index = this.index, e.computed = this.computed, e.tokens = [...this.tokens], this.skipComments || e.includeComments(), e
    }

    isEmpty() {
        return this.src.isEmpty() && !this.src.followupError
    }

    consume() {
        const e = this.seek();
        return this.index++, this.computed--, e
    }

    seek() {
        return this.seekN(0)
    }

    seekIncludeSpecial() {
        let e = this.skipSpecial;
        this.skipSpecial = !1;
        let t = this.seek();
        return this.skipSpecial = e, t
    }

    seekN(e) {
        for (; this.computed <= e;) this.compute();
        return this.tokens[this.index + e] || null
    }

    seekPrevious() {
        return this.seekN(-1)
    }

    exhaust() {
        let e = this.index;
        for (; !this.isEmpty();) this.compute();
        return this.tokens.slice(e)
    }

    includeComments() {
        this.skipComments = !1
    }

    includeSpecial() {
        this.skipSpecial = !1
    }

    compute() {
        const e = this.lexer.tokenize(this.src);
        if (e) {
            if (this.skipSpecial && e.isSpecial) return this.compute();
            if (this.skipComments && e.isComment) return this.compute();
            this.computed++, this.tokens.push(e)
        }
    }
}

class Oe {
    EOF;
    compiledMatchers;
    specialChars = [];
    comments = [];

    setRules(e) {
        this.compiledMatchers = e.map(({matcher: t, type: i, getValue: r}) => ({
            matcher: new RegExp(t.source, "y"),
            type: i,
            getValue: r
        }))
    }

    setEOF(e) {
        this.EOF = e
    }

    setSpecial(...e) {
        this.specialChars = e
    }

    setComments(...e) {
        this.comments = e
    }

    tokenize(e) {
        if (e.isEmpty()) return new c(this.EOF, "", new l(e.index, e.index), !1, !1);
        for (const t of this.compiledMatchers) {
            t.matcher.lastIndex = e.index;
            const i = t.matcher.exec(e.src);
            if (i && (e.jump(i[0].length), t.type !== null)) {
                const r = t.getValue ? t.getValue(i[0]) : i[0], o = this.specialChars.includes(t.type),
                    h = this.comments.includes(t.type);
                return new c(t.type, r, new l(e.index - i[0].length, e.index), o, h)
            }
        }
        throw "Unexpected token at index " + e.index + " in source: " + e.src
    }
}

class He extends Oe {
    constructor() {
        super(), this.setRules([{matcher: /\r\n|\n|\r/, type: "EOL"}, {
            matcher: /([^\r\n]+)/,
            type: "Default"
        }]), this.setEOF("EOF"), this.setSpecial("EOL")
    }

    asTokenStream(e) {
        return new N(this, e)
    }
}

class he {
    * highlight(e) {
        for (; !e.isEmpty();) {
            const t = e.consume();
            if (t) {
                const i = this._impl[`visit${t.type}`];
                let r = i(t);
                r && (yield r)
            }
        }
    }
}

class _e {
    token;
    range;
    span = null;
    className = "default-lang-token";
    content;

    constructor(e) {
        this.token = e, this.range = e.range.clone(), this.content = e.value
    }

    getWidth(e) {
        return this.token.value.length * e.getCharSize()
    }

    render() {
        return this.span = d.createElement("span"), this.span.textContent = this.token.value, this.span
    }

    update() {
    }

    destroy() {
        this.span && (this.span.remove(), this.span = null)
    }
}

class Ne extends he {
    _impl = this;

    visitEOL(e) {
        return null
    }

    visitEOF(e) {
        return null
    }

    visitDefault(e) {
        return new _e(e)
    }
}

class Ie {
    scoping;
    code;
    parser;

    constructor(e, t) {
        this.scoping = e.createScopeManager(), this.code = e.parse(this.scoping.toplevel(), t), this.parser = e
    }

    patch(e, t) {
        e.children !== void 0 && (e.children = t)
    }

    getContainingNodeAt(e) {
        return this.scoping.getContainingNodeAt(e) || this.code
    }
}

class We {
    static componentIdCounter = 0;
    static actionIdCounter = 0;

    static getComponentId(e) {
        return `${e}-${this.componentIdCounter++}`
    }

    static getActionId(e) {
        return `${this.actionIdCounter++}-${e}`
    }
}

class y {
    id;
    name;
    description;
    keybinding;

    constructor() {
        this.id = We.getActionId(this.name)
    }
}

class Ve extends y {
    name = "Delete";
    description = "Delete the selected text or the character after the caret.";
    keybinding = {key: v.DELETE, ctrl: !1, alt: !1, shift: !1};

    run(e, t) {
        e.caretModel.forEachCaret(i => {
            e.deleteAt(i.position.offset)
        }), e.view.resetBlink()
    }
}

class De extends y {
    name = "Backspace";
    description = "Delete the selected text or the character at the caret position.";
    keybinding = {key: v.BACKSPACE, ctrl: !1, alt: !1, shift: !1};

    run(e, t) {
        e.caretModel.forEachCaret(i => {
            e.deleteAt(i.position.offset - 1), i.shift(-1)
        }), e.view.resetBlink()
    }
}

class je extends y {
    name = "MoveCaretLeft";
    description = "Move the caret to the left by one character.";
    keybinding = {key: v.ARROW_LEFT, ctrl: !1, alt: !1, shift: !1};

    run(e, t) {
        e.caretModel.forEachCaret(i => {
            i.shift(-1)
        }), e.view.resetBlink()
    }
}

class Ue extends y {
    name = "MoveCaretRight";
    description = "Move the caret to the right by one character.";
    keybinding = {key: v.ARROW_RIGHT, ctrl: !1, alt: !1, shift: !1};

    run(e, t) {
        e.caretModel.forEachCaret(i => {
            i.shift(1)
        }), e.view.resetBlink()
    }
}

class qe extends y {
    name = "MoveCaretUp";
    description = "Move the caret up one line.";
    keybinding = {key: v.ARROW_UP, ctrl: !1, alt: !1, shift: !1};

    run(e, t) {
        e.view.resetBlink(), e.caretModel.forEachCaret(i => {
            if (i.position.y === 0) return;
            i.setVertMovementPos();
            let r = e.createLogical(Math.min(e.getLineLength(i.position.y - 1), i.vertMovementPos), i.position.y - 1);
            i.moveToLogical(r)
        })
    }
}

class Ye extends y {
    name = "MoveCaretDown";
    description = "Move the caret down one line.";
    keybinding = {key: v.ARROW_DOWN, ctrl: !1, alt: !1, shift: !1};

    run(e, t) {
        e.view.resetBlink(), e.caretModel.forEachCaret(i => {
            if (i.position.y >= e.getLineCount() - 1) return;
            i.setVertMovementPos();
            let r = e.createLogical(Math.min(e.getLineLength(i.position.y + 1), i.vertMovementPos), i.position.y + 1);
            i.moveToLogical(r)
        })
    }
}

class ze extends y {
    name = "MoveCaretToStart";
    description = "Move the caret to the start of the line.";
    keybinding = {key: v.HOME, ctrl: !1, alt: !1, shift: !1};

    run(e, t) {
        e.view.resetBlink(), e.caretModel.forEachCaret(i => {
            i.vertMovementPos = 0, i.moveToLogical(e.createLogical(0, i.position.y))
        })
    }
}

class Xe extends y {
    name = "MoveCaretToEnd";
    description = "Move the caret to the end of the line.";
    keybinding = {key: v.END, ctrl: !1, alt: !1, shift: !1};

    run(e, t) {
        e.view.resetBlink(), e.caretModel.forEachCaret(i => {
            let r = e.getLineLength(i.position.y);
            i.vertMovementPos = r, i.moveToLogical(e.createLogical(r, i.position.y))
        })
    }
}

class Ge extends y {
    name = "TabAction";
    description = "Insert a tab character at the caret position.";
    keybinding = {key: v.TAB, ctrl: !1, alt: !1, shift: !1};

    run(e, t) {
        t.preventDefault(), e.caretModel.forEachCaret(i => {
            e.insertText(i.position.offset, "    "), e.caretModel.shift(4)
        }), e.view.resetBlink()
    }
}

class $e {
    editor;
    actions = [];

    constructor(e) {
        this.editor = e, this.addAction(new je), this.addAction(new Ue), this.addAction(new qe), this.addAction(new Ye), this.addAction(new ze), this.addAction(new Xe), this.addAction(new Ve), this.addAction(new Ge), this.addAction(new De)
    }

    addAction(e) {
        this.actions.push(e), e.keybinding && this.editor.eventsManager.addKeybindingListener(e.keybinding, e.run)
    }
}

class $ extends oe {
    static ID = 0;
    id;
    properties;
    file;
    project;
    view;
    root;
    data;
    caretModel;
    offsetManager;
    eventsManager;
    actions;
    plugins;
    perfCheckRunning = !1;
    defaultLexer = new He;
    defaultHighlighter = new Ne;

    constructor(e, t) {
        super(), this.id = $.ID++, this.properties = t || {}, this.file = this.properties.file || new Re("temp", "", "js"), e && e.addFile(this.file), this.project = e || Ce.singleFileProject(this.file), this.eventsManager = new ye, this.eventsManager.addVisualEventListener(this), this.data = new Pe(this.file.read()), this.data.setLanguage(this.file.type), this.view = new Ae(this), this.offsetManager = new Me(this.data), this.caretModel = new Fe(this), this.actions = new $e(this), this.plugins = new Te(this), setInterval(() => {
            w.with(this, () => {
                this.view.render()
            })
        }, 20)
    }

    attach(e) {
        w.with(this, () => {
            this.data.srTree = new Ie(this.getParserForFileType(this.data.language), this.getLexerForFileType(this.data.language).asTokenStream(this.data.text)), this.root = d.createElement("div.editor", e), this.view.onAttached(this, this.root), this.fire("onAttached", this.root)
        })
    }

    fire(e, ...t) {
        w.with(this, () => this.eventsManager.fire(e, this, ...t))
    }

    fireKeybinding(e) {
        w.with(this, () => this.eventsManager.fireKeybinding(e, this))
    }

    registerPlugin(e) {
        w.with(this, () => {
            this.plugins.register(e)
        })
    }

    addVisualEventListener(e) {
        this.eventsManager.addVisualEventListener(e)
    }

    addEditorEventListener(e) {
        this.eventsManager.addEditorEventListener(e)
    }

    registerKeybinding(e, t) {
        this.eventsManager.addKeybindingListener(e, t)
    }

    getRawData() {
        return this.data.raw
    }

    getLexerForFileType(e) {
        return this.plugins.getLexerForFileType(e) || this.defaultLexer
    }

    getHighlighterForFileType(e) {
        return this.plugins.getHighlighterForFileType(e) || this.defaultHighlighter
    }

    getParserForFileType(e) {
        return this.plugins.getParserForFileType(e)
    }

    getCurrentLexer() {
        return this.getLexerForFileType(this.data.language)
    }

    getCurrentHighlighter() {
        return this.getHighlighterForFileType(this.data.language)
    }

    getCurrentParser() {
        return this.getParserForFileType(this.data.language)
    }

    parse(e, t) {
        return this.getCurrentParser().parse(e, t.clone())
    }

    offsetToLogical(e) {
        return e < 0 ? e = 0 : e > this.data.raw.length() && (e = this.data.raw.length() - 1), this.offsetManager.offsetToLogical(e)
    }

    absoluteToOffset(e, t) {
        return this.offsetManager.calculateOffset(this.offsetManager.absoluteToLogical(new R(e, t)))
    }

    offsetToAbsolute(e) {
        return this.offsetManager.logicalToAbsolute(this.offsetToLogical(e))
    }

    calculateOffset(e) {
        return this.offsetManager.calculateOffset(e)
    }

    visualToNearestLogical(e, t) {
        const i = this.view.getCharSize(), r = this.view.getLineHeight(),
            o = this.view.scroll.scrollXOffset === 0 ? this.view.scroll.scrollXChars : this.view.scroll.scrollXChars - 1,
            h = this.view.scroll.scrollYOffset === 0 ? this.view.scroll.scrollYLines : this.view.scroll.scrollYLines - 1,
            u = Math.round((e + this.view.scroll.scrollXOffset) / i) + o,
            p = Math.floor((t + this.view.scroll.scrollYOffset) / r) + h;
        return new R(u, p)
    }

    logicalToVisual(e) {
        const t = this.view.getCharSize(), i = this.view.getLineHeight(),
            r = this.view.scroll.scrollYOffset === 0 ? this.view.scroll.scrollYLines : this.view.scroll.scrollYLines - 1,
            o = (e.x - this.view.scroll.scrollXChars) * t - this.view.scroll.scrollXOffset,
            h = (e.y - r) * i - this.view.scroll.scrollYOffset;
        return new R(o, h)
    }

    createLogical(e, t) {
        return x.fromLogical(this, e, t)
    }

    createAbsolutePosition(e, t) {
        return x.fromAbsolute(this, e, t)
    }

    createPositionFromOffset(e) {
        return x.fromOffset(this, e)
    }

    createVisualPosition(e, t) {
        return x.fromVisual(this, e, t)
    }

    getFullRange() {
        return new l(0, this.data.raw.length())
    }

    isValidOffset(e) {
        return e >= 0 && e <= this.data.raw.length()
    }

    moveCursorToMouseEvent(e) {
        let [t, i] = this.view.getRelativePos(e), r = this.visualToNearestLogical(t, i);
        r.y < 0 ? r.y = 0 : r.y >= this.getLineCount() && (r.y = this.getLineCount() - 1), r.x = Math.max(0, Math.min(r.x, this.getLineLength(r.y))), this.caretModel.clearAll(), this.caretModel.primary.moveToLogical(r), this.view.resetBlink()
    }

    type(e) {
        w.with(this, () => {
            this.caretModel.forEachCaret(t => {
                this.insertText(t.position.toOffset(), e), t.shift(), this.view.resetBlink()
            })
        })
    }

    insertText(e, t) {
        this.data.raw.insert(e, t), this.offsetManager.offset(e, t.length), this.offsetManager.recomputeNewLines(e, t);
        let i = this.getCurrentLexer(), r = this.getCurrentHighlighter(), o = this.data.withContext(e);
        o.scope.clear();
        let h = i.asTokenStream(o.text);
        this.data.srTree.patch(o.containingNode, this.parse(o.scope, h).children);
        let u = r.highlight(h);
        this.data.setComponentsAtRange(o.scope.range, u)
    }

    deleteAt(e) {
        if (e < 0 || e >= this.data.raw.length()) return;
        let t = this.data.raw.delete(e, 1);
        if (this.offsetManager.offset(e, -1), t === `
`) {
            let p = this.offsetManager.lineBreaks.indexOf(e);
            p !== -1 && this.offsetManager.lineBreaks.splice(p, 1)
        }
        let i = this.getCurrentLexer(), r = this.getCurrentHighlighter(), o = this.data.withContext(e);
        o.scope.clear();
        let h = i.asTokenStream(o.text);
        this.data.srTree.patch(o.containingNode, this.parse(o.scope, h).children);
        let u = r.highlight(h);
        this.data.setComponentsAtRange(o.scope.range, u)
    }

    take(e, t) {
        return this.data.take(e, t, this.offsetManager.lineBreaks)
    }

    getLine(e) {
        return this.data.getLine(e, this.offsetManager.lineBreaks)
    }

    getLineCount() {
        return this.offsetManager.lineBreaks.length
    }

    getLineLength(e) {
        let t = this.offsetManager.lineBreaks[e];
        return (this.offsetManager.lineBreaks[e + 1] - 1 || this.data.raw.length()) - t
    }

    onKeyDown(e, t) {
        if (t.key === v.ENTER) return this.type(`
`);
        this.fireKeybinding(t)
    }

    onMouseDown(e, t) {
        this.moveCursorToMouseEvent(t)
    }

    onMouseUp(e, t) {
    }

    onMouseMove(e, t) {
    }

    onInput(e, t) {
        t.data && this.type(t.data)
    }

    perfCheckBegin() {
        let e = performance.now();
        this.perfCheckRunning = !0;
        let t = () => this.perfCheckRunning;
        requestAnimationFrame(function i(r) {
            let h = 1e3 / (r - e);
            console.log(`FPS: ${h.toFixed(2)}`), e = r, t() && requestAnimationFrame(i)
        })
    }

    perfCheckEnd() {
        this.perfCheckRunning = !1
    }
}

var n = (s => (s.Keyword = "Keyword", s.Identifier = "Identifier", s.Number = "Number", s.String = "String", s.Punctuation = "Punctuation", s.LPAREN = "LeftParen", s.RPAREN = "RightParen", s.LBRACE = "LeftBrace", s.RBrace = "RightBrace", s.LBRACKET = "LeftBracket", s.RBRACKET = "RightBracket", s.Operator = "Operator", s.UnOperator = "UnOperator", s.IncrDecrOp = "IncrDecrOp", s.Equals = "Equals", s.EqualOp = "EqualOp", s.CompareOp = "CompareOp", s.Arrow = "Arrow", s.EOL = "EOL", s.EOF = "EOF", s.SyntaxError = "SyntaxError", s))(n || {});

class I {
    static KEYWORDS = ["var", "let", "const", "if", "else", "switch", "case", "default", "for", "while", "do", "break", "continue", "return", "try", "catch", "finally", "throw", "function", "class", "extends", "super", "this", "new", "await", "async", "yield", "yield*", "in", "instanceof", "delete", "typeof", "void", "debugger", "import", "export", "abstract", "arguments", "boolean", "byte", "char", "double", "enum", "final", "float", "goto", "implements", "int", "interface", "long", "native", "package", "private", "protected", "public", "short", "static", "synchronized", "throws", "transient", "volatile"];

    asTokenStream(e) {
        return new N(this, e)
    }

    tokenize(e) {
        if (e.followupError) return e.clearError();
        for (; ;) {
            if (e.isEmpty()) return new c("EOF", "EOF", new l(e.index, e.index));
            let t = e.consume();
            if (t === `
`) return new c("EOL", `
`, l.around(e.index - 1), !0);
            if (t !== " ") if (t >= "0" && t <= "9") {
                let i = t;
                for (; !e.isEmpty() && e.seek() >= "0" && e.seek() <= "9";) i += e.consume();
                return new c("Number", i, new l(e.index - i.length, e.index))
            } else if (this.isAlphanumeric(t)) {
                let i = t;
                for (; !e.isEmpty() && this.isAlphanumeric(e.seek());) i += e.consume();
                return I.KEYWORDS.includes(i) ? new c("Keyword", i, new l(e.index - i.length, e.index)) : new c("Identifier", i, new l(e.index - i.length, e.index))
            } else {
                if (t === "(") return new c("LeftParen", "(", l.around(e.index - 1));
                if (t === ")") return new c("RightParen", ")", l.around(e.index - 1));
                if (t === "{") return new c("LeftBrace", "{", l.around(e.index - 1));
                if (t === "}") return new c("RightBrace", "}", l.around(e.index - 1));
                if (t === "[") return new c("LeftBracket", "[", l.around(e.index - 1));
                if (t === "]") return new c("RightBracket", "]", l.around(e.index - 1));
                if (t === ".") return e.seek() === "." && e.seekNext() === "." ? (e.consume(), e.consume(), new c("Punctuation", "...", new l(e.index - 3, e.index))) : new c("Punctuation", ".", l.around(e.index - 1));
                if (t === "," || t === ";" || t === ":") return new c("Punctuation", t, l.around(e.index - 1));
                if (t === "=") return e.seek() === "=" ? (e.consume(), e.seek() === "=" ? (e.consume(), new c("CompareOp", "===", new l(e.index - 3, e.index))) : new c("CompareOp", "==", new l(e.index - 2, e.index))) : e.seek() === ">" ? (e.consume(), new c("Arrow", "=>", new l(e.index - 2, e.index))) : new c("Equals", "=", l.around(e.index - 1));
                if (t == "+" || t === "-" || t === "*" || t === "/") return e.seek() === "=" ? (e.consume(), new c("EqualOp", t + "=", new l(e.index - 2, e.index))) : t === e.seek() ? (e.consume(), t === "+" || t === "-" ? new c("IncrDecrOp", t + t, new l(e.index - 2, e.index)) : new c("Operator", t + t, l.around(e.index - 2))) : new c("Operator", t, l.around(e.index - 1));
                if (t === ">" || t === "<") return e.seek() === "=" ? (e.consume(), new c("CompareOp", t + "=", new l(e.index - 2, e.index))) : e.seek() === t ? (e.consume(), t === ">" && e.seek() === ">" ? (e.consume(), new c("Operator", ">>>", new l(e.index - 3, e.index))) : new c("Operator", t + t, new l(e.index - 2, e.index))) : new c("CompareOp", t, l.around(e.index - 1));
                if (t === "|" || t === "&" || t === "?" || t === "^") return e.seek() === "=" ? new c("EqualOp", t + "=", l.around(e.index - 2)) : e.seek() === t && t !== "^" ? (e.consume(), new c("Operator", t + t, new l(e.index - 2, e.index))) : t !== "?" ? new c("Operator", t, l.around(e.index - 1)) : new c("Punctuation", "?", l.around(e.index - 1));
                if (t === "!" || t === "~") return new c("UnOperator", t, l.around(e.index - 1));
                if (t === "'" || t === '"') {
                    let i = t;
                    for (; !e.isEmpty() && e.seek() !== t && e.seek() !== `
`;) i += e.consume();
                    return e.seek() === t ? (i += e.consume(), new c("String", i, new l(e.index - i.length, e.index))) : (e.followupError = new M("SyntaxError", i[i.length - 1], "Unterminated string literal", l.around(e.index - 1)), new c("String", i, new l(e.index - i.length, e.index)))
                } else return new M("SyntaxError", t, "Unexpected char: " + t, l.around(e.index - 1))
            }
        }
    }

    isAlphanumeric(e) {
        return e >= "a" && e <= "z" || e >= "A" && e <= "Z" || e === "_" || e === "$"
    }
}

class f {
    range;
    element = null;
    className;
    content;

    constructor(e, t) {
        this.content = e.value, this.range = e.range.clone(), this.className = "editor-ht " + t
    }

    render() {
        throw new Error("Method not implemented. Use `data.edac.toRenderable()` instead.")
    }

    update() {
        throw new Error("Method not implemented. Use `data.edac.update()` instead.")
    }

    destroy() {
        throw new Error("Method not implemented.")
    }

    getWidth(e) {
        return this.content.length * e.getCharSize()
    }
}

class Qe extends he {
    _impl = this;

    visitEqualOp(e) {
        return new f(e, "js-operator")
    }

    visitCompareOp(e) {
        return new f(e, "js-operator")
    }

    visitArrow(e) {
        return new f(e, "js-operator")
    }

    visitUnOperator(e) {
        return new f(e, "js-operator")
    }

    visitIncrDecrOp = e => new f(e, "js-operator");

    visitString(e) {
        return new f(e, "js-string")
    }

    visitIdentifier(e) {
        return new f(e, "js-identifier")
    }

    visitNumber(e) {
        return new f(e, "js-number")
    }

    visitPunctuation(e) {
        return new f(e, "js-default")
    }

    visitLeftParen(e) {
        return new f(e, "js-left-paren js-default")
    }

    visitRightParen(e) {
        return new f(e, "js-right-paren js-default")
    }

    visitLeftBrace(e) {
        return new f(e, "js-left-brace js-default")
    }

    visitRightBrace(e) {
        return new f(e, "js-right-brace js-default")
    }

    visitLeftBracket(e) {
        return new f(e, "js-left-bracket js-default")
    }

    visitRightBracket(e) {
        return new f(e, "js-right-bracket js-default")
    }

    visitOperator(e) {
        return new f(e, "js-operator")
    }

    visitEquals(e) {
        return new f(e, "js-operator")
    }

    visitEOL(e) {
        return null
    }

    visitEOF(e) {
        return null
    }

    visitSyntaxError(e) {
        return new f(e, "js-syntax-error")
    }

    visitKeyword(e) {
        return new f(e, "js-keyword")
    }
}

class ue {
    static indent(e, t = 4) {
        const i = " ".repeat(t);
        return e.split(`
`).map(r => i + r).join(`
`)
    }
}

class a {
    static tokenToHumanReadableString(e) {
        return e ? e.isError ? `#${e.type}<${e.msg}>` : e.value : "#undef"
    }

    static toHumanReadableString(e) {
        return e ? e.toHumanReadableString() : "#undef"
    }

    static isValidToken(e) {
        return !!e && !e.isError && !e.isSpecial
    }
}

class H {
    static precedenceMap = {"**": 15, "*": 14, "/": 14, "+": 13, "-": 13, "<<": 12, ">>": 12, ">>>": 12};

    static isRightAssociative(e) {
        return e === "**"
    }

    static getPrecedence(e) {
        return H.precedenceMap[e]
    }
}

var A = (s => (s.CodeBlock = "CodeBlock", s.Stmt = "Stmt", s.DeclStmt = "DeclStmt", s.Body = "Body", s.Parameters = "Parameters", s.Param = "Param", s.FuncDeclStmt = "FuncDeclStmt", s.ReturnStmt = "ReturnStmt", s.Expr = "Expr", s.ExprGroup = "ExprGroup", s.ExprCommaExpr = "ExprCommaExpr", s.NumberLiteral = "NumberLiteral", s.StringLiteral = "StringLiteral", s.Args = "Args", s.Identifier = "Identifier", s.SpecialIdentifier = "SpecialIdentifier", s.MemberAccess = "MemberAccess", s.AssignExpr = "AssignExpr", s.UnaryExpr = "UnaryExpr", s.BinaryExpr = "BinaryExpr", s.TernaryExpr = "TernaryExpr", s.CallExpr = "CallExpr", s.NewExpr = "NewExpr", s.ArrayAccess = "ArrayAccess", s.ArrayLiteral = "ArrayLiteral", s.ObjectLiteral = "ObjectLiteral", s.ObjectLiteralProperty = "ObjectLiteralProperty", s.ObjectLiteralPropertyFunction = "ObjectLiteralPropertyFunction", s.Lambda = "Lambda", s))(A || {});

class L {
    range;
    language = "js";
    parent = null;

    constructor() {
        for (let e of this.getAllNodeChildren()) e.parent = this
    }

    getAllNodeChildren() {
        const e = [];
        for (let t in this) this[t] instanceof L && e.push(this[t]);
        return e
    }
}

class ee extends L {
    range;
    children;
    nodeType = "CodeBlock";

    constructor(e) {
        super(), this.children = e, this.range = l.of(e)
    }

    toHumanReadableString() {
        let e = "";
        for (const t of this.children) e += t.toHumanReadableString() + `
`;
        return `{
` + ue.indent(e.substring(0, e.length - 1)) + `
}`
    }

    isWellFormed() {
        return this.children.every(e => e.isWellFormed())
    }
}

class Q extends L {
    range;
    nodeType = "Stmt";

    constructor(e) {
        super(), this.range = e
    }
}

class V extends Q {
    kind;
    name;
    eq;
    decl;
    nodeType = "DeclStmt";

    constructor(e, t, i, r) {
        super(l.of(e, r || t)), this.kind = e, this.name = t, this.eq = i, this.decl = r
    }

    isWellFormed() {
        return this.kind && this.name && a.isValidToken(this.kind) && a.isValidToken(this.name) && (!this.eq || a.isValidToken(this.eq)) && (!this.decl || this.decl.isWellFormed())
    }

    toHumanReadableString() {
        let e = a.tokenToHumanReadableString(this.kind);
        return e += " " + a.tokenToHumanReadableString(this.name) + " = ", e += a.toHumanReadableString(this.decl), e + ";"
    }
}

class D extends Q {
    keyword;
    expr;
    nodeType = "ReturnStmt";

    constructor(e, t) {
        super(l.of([e, t])), this.keyword = e, this.expr = t
    }

    isWellFormed() {
        return a.isValidToken(this.keyword) && (!this.expr || this.expr.isWellFormed())
    }

    toHumanReadableString() {
        return "return " + a.toHumanReadableString(this.expr) + ";"
    }
}

class j extends L {
    openBrace;
    body;
    closeBrace;
    nodeType = "Body";

    constructor(e, t, i) {
        super(), this.range = l.of([e, t, i]), this.openBrace = e, this.body = t, this.closeBrace = i
    }

    isWellFormed() {
        return (!this.openBrace || a.isValidToken(this.openBrace)) && this.body.isWellFormed() && (!this.closeBrace || a.isValidToken(this.closeBrace))
    }

    toHumanReadableString() {
        return a.toHumanReadableString(this.body)
    }
}

class B extends L {
    params;
    commas = [];
    nodeType = "Parameters";

    constructor(e, t = []) {
        super(), this.range = l.of(e), this.params = e, this.commas = t
    }

    toHumanReadableString() {
        return this.params.map(e => a.toHumanReadableString(e)).join(", ")
    }

    isWellFormed() {
        return this.params.every(e => e.isWellFormed())
    }
}

class E extends L {
    restToken;
    name;
    eqSign;
    defaultValue;
    nodeType = "Param";

    constructor(e, t, i, r) {
        super(), this.name = e, this.restToken = t, this.eqSign = i, this.defaultValue = r, this.range = r ? l.of(t || e, r) : l.of(t || e, i || e)
    }

    isWellFormed() {
        return a.isValidToken(this.name) && (!this.restToken || a.isValidToken(this.restToken)) && (!this.eqSign || a.isValidToken(this.eqSign)) && (!this.defaultValue || this.defaultValue.isWellFormed())
    }

    toHumanReadableString() {
        let e = this.restToken ? "..." : "";
        return e += a.tokenToHumanReadableString(this.name), this.eqSign && (e += "=", e += a.toHumanReadableString(this.defaultValue)), e
    }
}

class O extends Q {
    keyword;
    name;
    openParen;
    params;
    closeParen;
    body;
    nodeType = "FuncDeclStmt";

    constructor(e, t, i, r, o, h) {
        super(l.of([e, t, i, r, o, h])), this.keyword = e, this.name = t, this.openParen = i, this.params = r, this.closeParen = o, this.body = h
    }

    isWellFormed() {
        return a.isValidToken(this.keyword) && (!this.name || a.isValidToken(this.name)) && a.isValidToken(this.openParen) && a.isValidToken(this.closeParen) && this.params.isWellFormed() && this.body.isWellFormed()
    }

    toHumanReadableString() {
        let e = a.tokenToHumanReadableString(this.keyword);
        return this.name && (e += " " + a.tokenToHumanReadableString(this.name)), e += "(" + a.toHumanReadableString(this.params) + ")", e + " " + a.toHumanReadableString(this.body)
    }
}

class m extends L {
    error;
    nodeType = "Expr";

    constructor(e = null) {
        super(), this.error = e, e && (this.range = l.of(e))
    }

    toHumanReadableString() {
        return a.tokenToHumanReadableString(this.error)
    }

    isWellFormed() {
        return !this.error
    }
}

class Ze extends m {
    values;
    commas;
    nodeType = "ExprCommaExpr";

    constructor(e, t) {
        super(), this.values = e, this.commas = t, this.range = l.of(e)
    }

    toHumanReadableString() {
        return this.values.map(e => a.toHumanReadableString(e)).join(", ")
    }

    isWellFormed() {
        return this.values.every(e => e.isWellFormed())
    }
}

class Je extends m {
    value;
    nodeType = "NumberLiteral";

    constructor(e) {
        super(), this.range = l.of(e), this.value = e
    }

    toHumanReadableString() {
        return a.tokenToHumanReadableString(this.value)
    }

    isWellFormed() {
        return a.isValidToken(this.value)
    }
}

class Ke extends m {
    value;
    nodeType = "StringLiteral";

    constructor(e) {
        super(), this.range = l.of(e), this.value = e
    }

    toHumanReadableString() {
        return a.tokenToHumanReadableString(this.value)
    }

    isWellFormed() {
        return a.isValidToken(this.value)
    }
}

class te extends m {
    openBracket;
    values;
    closeBracket;
    commas;
    nodeType = "ArrayLiteral";

    constructor(e, t, i, r) {
        super(), this.openBracket = e, this.values = t, this.closeBracket = i, this.commas = r, this.range = l.of([e, ...t, i])
    }

    toHumanReadableString() {
        return "[" + this.values.map(e => a.toHumanReadableString(e)).join(", ") + "]"
    }

    isWellFormed() {
        return a.isValidToken(this.openBracket) && this.values.every(e => e.isWellFormed()) && a.isValidToken(this.closeBracket)
    }
}

class T extends L {
    key;
    colon;
    value;
    nodeType = "ObjectLiteralProperty";

    constructor(e, t, i) {
        super(), this.key = e, this.colon = t, this.value = i, this.range = l.of([e, t, i])
    }

    isWellFormed() {
        return a.isValidToken(this.key) && (!this.colon || a.isValidToken(this.colon)) && (!this.value || this.value.isWellFormed())
    }

    toHumanReadableString() {
        let e = this.key.value;
        return (this.colon && !this.colon.isError || this.value) && (e += ": "), this.value ? e += this.value.toHumanReadableString() : e += "#undef", e
    }
}

class et extends T {
    func;
    nodeType = "ObjectLiteralPropertyFunction";

    constructor(e) {
        super(e.name, null, e), this.func = e
    }

    isWellFormed() {
        return this.func.isWellFormed()
    }

    toHumanReadableString() {
        return a.toHumanReadableString(this.func)
    }
}

class ie extends m {
    openBrace;
    properties;
    closeBrace;
    commas;
    nodeType = "ObjectLiteral";

    constructor(e, t, i, r) {
        super(), this.openBrace = e, this.properties = t, this.closeBrace = i, this.commas = r, this.range = l.of([e, ...t, i])
    }

    isWellFormed() {
        return a.isValidToken(this.openBrace) && this.properties.every(e => e.isWellFormed()) && (!this.closeBrace || a.isValidToken(this.closeBrace))
    }

    toHumanReadableString() {
        if (this.properties.length <= 2 && !this.properties.some(e => e.nodeType === "ObjectLiteralPropertyFunction")) return "{ " + this.properties.map(e => e.toHumanReadableString()).join(", ") + " }";
        {
            let e = `{
`;
            for (const t of this.properties) e += ue.indent(t.toHumanReadableString()) + `,
`;
            return e += "}", e
        }
    }
}

class z extends m {
    token;
    nodeType = "Identifier";

    constructor(e) {
        super(), this.token = e, this.range = l.of(e)
    }

    isWellFormed() {
        return a.isValidToken(this.token)
    }

    toHumanReadableString() {
        return a.tokenToHumanReadableString(this.token)
    }
}

class tt extends z {
    nodeType = "SpecialIdentifier";

    constructor(e) {
        super(e)
    }
}

class it extends m {
    base;
    dot;
    member;
    nodeType = "MemberAccess";

    constructor(e, t, i) {
        super(), this.base = e, this.dot = t, this.member = i, this.range = l.of(e, i)
    }

    isWellFormed() {
        return this.base.isWellFormed() && a.isValidToken(this.dot) && this.member.isWellFormed()
    }

    toHumanReadableString() {
        return a.toHumanReadableString(this.base) + "." + a.toHumanReadableString(this.member)
    }
}

class rt extends m {
    left;
    operator;
    right;
    nodeType = "AssignExpr";

    constructor(e, t, i) {
        super(), this.left = e, this.operator = t, this.right = i, this.range = l.of(e, i || t)
    }

    isWellFormed() {
        return this.left.isWellFormed() && a.isValidToken(this.operator) && (!this.right || this.right.isWellFormed())
    }

    toHumanReadableString() {
        return "(" + a.toHumanReadableString(this.left) + " = " + a.toHumanReadableString(this.right) + ")"
    }
}

class U extends m {
    operator;
    operand;
    nodeType = "UnaryExpr";

    constructor(e, t) {
        super(), this.operator = e, this.operand = t, this.range = l.of(e, t)
    }

    isWellFormed() {
        return a.isValidToken(this.operator) && this.operand.isWellFormed()
    }

    toHumanReadableString() {
        return "(" + a.tokenToHumanReadableString(this.operator) + a.toHumanReadableString(this.operand) + ")"
    }
}

class b extends m {
    left;
    operator;
    right;
    nodeType = "BinaryExpr";

    constructor(e, t, i) {
        super(), this.left = e, this.operator = t, this.right = i, this.range = l.of(e, i)
    }

    isWellFormed() {
        return this.left.isWellFormed() && a.isValidToken(this.operator) && this.right.isWellFormed()
    }

    toHumanReadableString() {
        return "(" + a.toHumanReadableString(this.left) + " " + a.tokenToHumanReadableString(this.operator) + " " + a.toHumanReadableString(this.right) + ")"
    }
}

class re extends m {
    condition;
    questionMark;
    trueExpr;
    colon;
    falseExpr;
    nodeType = "TernaryExpr";

    constructor(e, t, i, r, o) {
        super(), this.condition = e, this.questionMark = t, this.trueExpr = i, this.colon = r, this.falseExpr = o, this.range = l.of(e, o || r)
    }

    isWellFormed() {
        return this.condition.isWellFormed() && a.isValidToken(this.questionMark) && this.trueExpr.isWellFormed() && a.isValidToken(this.colon) && (!this.falseExpr || this.falseExpr.isWellFormed())
    }

    toHumanReadableString() {
        return a.toHumanReadableString(this.condition) + " ? (" + a.toHumanReadableString(this.trueExpr) + ") : (" + a.toHumanReadableString(this.falseExpr) + ")"
    }
}

class X extends m {
    callee;
    openParen;
    args;
    closeParen;
    nodeType = "CallExpr";

    constructor(e, t, i, r) {
        super(), this.callee = e, this.openParen = t, this.args = i, this.closeParen = r, this.range = l.of([e, t, i, r])
    }

    isWellFormed() {
        return this.callee.isWellFormed() && a.isValidToken(this.openParen) && a.isValidToken(this.closeParen) && this.args.isWellFormed()
    }

    toHumanReadableString() {
        return a.toHumanReadableString(this.callee) + "(" + a.toHumanReadableString(this.args) + ")"
    }
}

class se extends m {
    base;
    openBracket;
    index;
    closeBracket;
    nodeType = "ArrayAccess";

    constructor(e, t, i, r) {
        super(), this.base = e, this.openBracket = t, this.index = i, this.closeBracket = r, this.range = l.of([e, t, i, r])
    }

    isWellFormed() {
        return this.base.isWellFormed() && a.isValidToken(this.openBracket) && this.index.isWellFormed() && a.isValidToken(this.closeBracket)
    }

    toHumanReadableString() {
        return a.toHumanReadableString(this.base) + "[" + a.toHumanReadableString(this.index) + "]"
    }
}

class q extends X {
    keyword;
    nodeType = "NewExpr";

    constructor(e, t, i, r, o) {
        super(t, i, r, o), this.keyword = e, this.range.begin = e.range.begin
    }

    isWellFormed() {
        return a.isValidToken(this.keyword) && this.callee.isWellFormed() && a.isValidToken(this.openParen) && this.args.isWellFormed() && a.isValidToken(this.closeParen)
    }

    toHumanReadableString() {
        return "new " + a.toHumanReadableString(this.callee) + "(" + a.toHumanReadableString(this.args) + ")"
    }
}

class st extends m {
    values;
    comma;
    nodeType = "Args";

    constructor(e, t) {
        super(), this.values = e, this.comma = t, this.range = l.of(e)
    }

    isWellFormed() {
        return this.values.every(e => e.isWellFormed())
    }

    toHumanReadableString() {
        return this.values.map(e => a.toHumanReadableString(e)).join(", ")
    }
}

class Y extends m {
    params;
    arrow;
    body;
    nodeType = "Lambda";

    constructor(e, t, i) {
        super(), this.params = e, this.arrow = t, this.body = i, this.range = l.of(e, i || t)
    }

    isWellFormed() {
        return this.params.isWellFormed() && a.isValidToken(this.arrow) && this.body.isWellFormed()
    }

    toHumanReadableString() {
        let e = "((";
        return this.params && (e += a.toHumanReadableString(this.params)), e += ") => ", e += a.toHumanReadableString(this.body) + ")", e
    }
}

class ne extends m {
    openParen;
    expr;
    closeParen;
    nodeType = "ExprGroup";

    constructor(e, t, i) {
        super(), this.expr = t, this.openParen = e, this.closeParen = i, this.range = l.of(e, i || t)
    }

    isWellFormed() {
        return a.isValidToken(this.openParen) && this.expr.isWellFormed() && a.isValidToken(this.closeParen)
    }

    toHumanReadableString() {
        return "(" + a.toHumanReadableString(this.expr) + ")"
    }
}

class nt {
    globalScope = new at(this);

    constructor() {
    }

    toplevel() {
        return this.globalScope
    }

    fullRange() {
        return w.INSTANCE.getFullRange()
    }

    getContainingNodeAt(e) {
        let t = this.getScopeAt(e);
        return t.kind === "function" && t.func.body?.body || null
    }

    getScopeAt(e) {
        return this.recursiveGetScopeAt(this.globalScope, e) || this.globalScope
    }

    recursiveGetScopeAt(e, t) {
        if (e.range.contains(t)) {
            for (const i of e.children) {
                const r = this.recursiveGetScopeAt(i, t);
                if (r) return r.isVirtual() ? r.parent : r
            }
            return e
        }
        return null
    }
}

class ot {
    decl;
    loc;
    scope;
    scopeKind;

    constructor(e, t) {
        this.decl = e, this.loc = e.range, this.scope = t, this.scopeKind = t.kind
    }
}

class Z {
    manager;
    range;
    children = [];
    parent;
    kind;
    declarations = new Map;

    constructor(e) {
        this.parent = e, e && (this.manager = e.manager, e.children.push(this))
    }

    isVirtual() {
        return this.kind === "block" && !!this.parent && this.parent.kind !== "block"
    }

    newBlockScope() {
        return new ht(this)
    }

    newFuncScope() {
        return new lt(this)
    }

    pop() {
        return this.parent ? this.parent : this
    }

    declare(e, t) {
        if (this.isVirtual()) {
            this.parent.declare(e, t);
            return
        }
        this.declarations.set(e, new ot(t, this))
    }

    resolve(e) {
        let t = this;
        for (; t;) {
            if (t.exists(e)) return t.declarations.get(e) || null;
            t = t.parent
        }
        return null
    }

    exists(e) {
        return this.declarations.has(e)
    }

    clear() {
        this.declarations.clear(), this.children = []
    }
}

class at extends Z {
    kind = "global";

    constructor(e) {
        super(null), this.manager = e, this.range = e.fullRange()
    }
}

class lt extends Z {
    kind = "function";
    func
}

class ht extends Z {
    kind = "block";
    block
}

class ut {
    input;
    scope;
    beginOffsets = [];

    constructor(e, t) {
        this.scope = e, this.input = t
    }

    get offset() {
        return this.input.seek().range.begin
    }

    parseBlock() {
        let e = [];
        for (this.scope = this.scope.newBlockScope(); !this.input.isEmpty();) {
            const i = this.input.seek();
            if (i.type === n.EOF || i.type === n.RBrace) break;
            e.push(this.parseStmt()), this.input.seek()?.type === n.Punctuation && this.input.seek()?.value === ";" && this.input.consume()
        }
        let t = new ee(e);
        return this.scope.range = l.of(t), this.scope.block = t, this.scope = this.scope.pop(), t
    }

    eat(e) {
        let t = this.input.seek();
        return t && t.type === e ? (this.input.consume(), t) : null
    }

    reportErrorAfter(e, t, i) {
        return new M(t, " ", i, l.around(e.range.end))
    }

    reportErrorAt(e, t, i) {
        return new M(t, e.value, i, e.range)
    }

    reportErrorAtRange(e, t, i) {
        return new M(t, "", i, e.range.clone())
    }

    closeScope(e) {
        return e.body ? (this.scope.range = l.of(e.body), this.scope.func = e, this.scope = this.scope.pop(), e) : (this.scope = this.scope.pop(), e)
    }

    closeScopeAndDeclare(e) {
        let t = this.closeScope(e);
        return e.isWellFormed() && e.name && this.scope.declare(e.name.value, e), t
    }

    parseBody() {
        if (this.scope = this.scope.newFuncScope(), this.input.seek()?.type !== n.LBRACE) {
            let r = [new D(null, this.parseExpr())];
            return new j(null, new ee(r), null)
        }
        let e = this.eat(n.LBRACE), t = this.parseBlock(), i = this.eat(n.RBrace);
        return i ? new j(e, t, i) : new j(e, t, this.reportErrorAt(this.input.seekPrevious(), n.SyntaxError, "'}' expected"))
    }

    parseStmt() {
        let e = this.input.seek();
        if (e.type == n.Keyword) {
            if (e.value === "let" || e.value === "const" || e.value === "var") return this.parseDeclStmt();
            if (e.value === "function") return this.parseFuncDecl();
            if (e.value === "return") return this.parseReturnStmt()
        }
        return this.parseExpr()
    }

    parseReturnStmt() {
        let e = this.eat(n.Keyword);
        return this.input.seek()?.type === n.Punctuation && this.input.seek()?.value === ";" || this.input.seek()?.type === n.EOF || this.input.seek()?.type === n.RBrace || this.input.seekIncludeSpecial()?.type === n.EOL ? new D(e, null) : new D(e, this.parseExpr())
    }

    parseDeclStmt() {
        let e = this.eat(n.Keyword), t = this.eat(n.Identifier);
        if (!t) return new V(e, this.reportErrorAfter(e, n.SyntaxError, "Expected identifier"));
        let i;
        if (this.input.seek()?.type === n.Equals) {
            let r = this.eat(n.Equals);
            i = new V(e, t, r, this.parseExpr_L0())
        } else i = new V(e, t);
        return this.scope.declare(t.value, i), i
    }

    parseFuncDecl(e = !1) {
        let t = this.eat(n.Keyword), i = this.eat(n.Identifier);
        if (!i && !e) return new O(t, this.reportErrorAfter(t, n.SyntaxError, "Function name expected"), null, null, null, null);
        let r = this.eat(n.LPAREN);
        if (!r) return new O(t, i, this.reportErrorAfter(i || t, n.SyntaxError, "'(' expected"), null, null, null);
        let o = this.parseParams(), h = this.eat(n.RPAREN);
        if (!h) return new O(t, i, r, o, this.reportErrorAfter(this.input.seekPrevious(), n.SyntaxError, "')' expected"), null);
        let u = this.parseBody();
        return this.closeScopeAndDeclare(new O(t, i, r, o, h, u))
    }

    parseParams() {
        let e = [], t = [];
        for (; !this.input.isEmpty() && this.input.seek().type != n.RPAREN;) if (e.push(this.parseParam()), this.input.seek()?.type === n.Punctuation && this.input.seek()?.value === ",") t.push(this.eat(n.Punctuation)); else if (this.input.seek()?.type !== n.RPAREN) t.push(this.reportErrorAfter(this.input.seekPrevious(), n.SyntaxError, "Expected ',' or ')'")); else break;
        return new B(e, t)
    }

    parseParam() {
        let e = null;
        this.input.seek()?.type === n.Punctuation && this.input.seek()?.value === "..." && (e = this.eat(n.Punctuation));
        let t = this.eat(n.Identifier);
        if (t) if (this.input.seek()?.type === n.Equals) {
            if (e) return new E(t, e, this.reportErrorAt(this.input.consume(), n.SyntaxError, "Default value cannot be used with rest parameters"));
            let i = this.eat(n.Equals), r = this.parseExpr_L0();
            return new E(t, null, i, r)
        } else return new E(t, e); else return new E(this.reportErrorAfter(this.input.seekPrevious(), n.SyntaxError, "Parameter name expected"), e)
    }

    parseExpr() {
        let e = [this.parseExpr_L0()], t = [];
        for (; this.input.seek()?.type === n.Punctuation && this.input.seek()?.value === ",";) t.push(this.eat(n.Punctuation)), e.push(this.parseExpr_L0());
        return e.length === 1 ? e[0] : new Ze(e, t)
    }

    parseExpr_L0() {
        let e = this.input.seek();
        if (!e) return new m(this.reportErrorAfter(this.input.seekPrevious(), n.SyntaxError, "Expression expected"));
        if (e.type === n.Punctuation && e.value === "..." || e.type === n.Keyword && e.value === "yield") {
            let i = this.input.consume(), r = this.parseExpr_L1();
            return new U(i, r)
        }
        if (this.input.seek()?.type === n.Identifier && this.input.seekN(1)?.type === n.Arrow) {
            let i = this.eat(n.Identifier), r = this.eat(n.Arrow), o = this.parseBody();
            return this.closeScope(new Y(new B([new E(i, null)]), r, o))
        } else if (this.input.seek()?.type === n.LPAREN && this.input.seekN(1)?.type === n.RPAREN && this.input.seekN(2)?.type === n.Arrow) {
            this.eat(n.LPAREN), this.eat(n.RPAREN);
            let i = this.eat(n.Arrow), r = this.parseBody();
            return this.closeScope(new Y(new B([], []), i, r))
        }
        let t = this.parseExpr_L1();
        if (t.nodeType === A.ExprGroup && this.input.seek()?.type === n.Arrow) {
            let i, r;
            if (t.expr.nodeType === A.ExprCommaExpr) {
                let p = t.expr;
                i = p.values, r = p.commas
            } else i = [t.expr], r = [];
            let o = this.eat(n.Arrow), h = this.parseBody(), u = [];
            for (let p = 0; p < i.length; p++) {
                let g = i[p];
                if (g.nodeType === A.UnaryExpr && g.operator.value === "...") {
                    let k = g.operator, F = g.operand;
                    F.nodeType !== A.Identifier ? u.push(new E(this.reportErrorAfter(k, n.SyntaxError, "Expected identifier"), k)) : u.push(new E(F.token, k))
                } else g.nodeType === A.AssignExpr ? u.push(new E(g.left.token, null, g.operator, g.right)) : g.nodeType !== A.Identifier ? u.push(new E(this.reportErrorAfter(r[p], n.SyntaxError, "Expected identifier"), null)) : u.push(new E(g.token, null))
            }
            return this.closeScope(new Y(new B(u, r), o, h))
        }
        if (this.input.seek()?.type === n.Punctuation && this.input.seek()?.value === "?") {
            let i = this.eat(n.Punctuation), r = this.parseExpr_L0();
            if (this.input.seek()?.type !== n.Punctuation || this.input.seek()?.value !== ":") return new re(t, i, r, this.reportErrorAfter(this.input.seekPrevious(), n.SyntaxError, "Expected ':' for ternary operator"), null);
            let o = this.eat(n.Punctuation), h = this.parseExpr_L0();
            return new re(t, i, r, o, h)
        }
        if (this.input.seek()?.type === n.EqualOp || this.input.seek()?.type === n.Equals) {
            let i = this.input.consume();
            return new rt(t, i, this.parseExpr())
        }
        return t
    }

    parseExpr_L1() {
        let e = this.parseExpr_L2(), t = this.input.seek();
        if (t?.type !== n.Operator) return e;
        if (t?.value === "??" || t?.value === "||") {
            let i = this.eat(n.Operator), r = this.parseExpr_L2();
            return new b(e, i, r)
        } else if (t?.value === "&&") {
            let i = this.eat(n.Operator), r = this.parseExpr_L2();
            return new b(e, i, r)
        } else if (t?.value === "|") {
            let i = this.eat(n.Operator), r = this.parseExpr_L2();
            return new b(e, i, r)
        } else if (t?.value === "^") {
            let i = this.eat(n.Operator), r = this.parseExpr_L2();
            return new b(e, i, r)
        } else if (t?.value === "&") {
            let i = this.eat(n.Operator), r = this.parseExpr_L2();
            return new b(e, i, r)
        } else return e
    }

    parseExpr_L2() {
        let e = this.parseExpr_L3(), t = this.input.seek();
        for (; t?.type === n.CompareOp || t?.type === n.Keyword;) {
            if (t.type === n.Keyword && t.value !== "in" && t.value !== "instanceof") return e;
            e = new b(e, this.input.consume(), this.parseExpr_L3()), t = this.input.seek()
        }
        return e
    }

    parseExpr_L3(e = 0) {
        let t = this.parseExpr_L4();
        for (; this.input.seek()?.type === n.Operator;) {
            let i = this.input.consume();
            if (H.getPrecedence(i.value) < e) break;
            let r = this.parseExpr_L3(H.isRightAssociative(i.value) ? e : e + 1);
            t = new b(t, i, r)
        }
        return t
    }

    parseExpr_L4() {
        let e = this.input.seek();
        if (e?.type === n.Keyword && e.value === "new") {
            this.eat(n.Keyword);
            let i = this.parseExpr_L5();
            if (this.input.seek()?.type === n.LPAREN) {
                let r = this.eat(n.LPAREN), o = this.parseArgs(), h = this.eat(n.RPAREN);
                return h ? new q(e, i, r, o, h) : new q(e, i, r, o, this.reportErrorAfter(this.input.seekPrevious(), n.SyntaxError, "')' expected"))
            }
            return new q(e, i, null, null, null)
        } else if (e?.type === n.UnOperator || e?.type === n.Keyword && ["typeof", "void", "delete", "await"].includes(e.value) || e?.type === n.Operator && (e.value === "+" || e.value === "-")) {
            let i = this.input.consume(), r = this.parseExpr_L4();
            return new U(i, r)
        } else if (e?.type === n.IncrDecrOp) {
            let i = this.input.consume(), r = this.parseExpr_L5();
            return new U(i, r)
        }
        let t = this.parseExpr_L5();
        for (; ;) if (this.input.seek()?.type === n.LPAREN) {
            let i = this.eat(n.LPAREN), r = this.parseArgs(), o = this.eat(n.RPAREN);
            if (!o) return new X(t, i, r, this.reportErrorAfter(this.input.seekPrevious(), n.SyntaxError, "')' expected"));
            t = this.parseExpr_L5(new X(t, i, r, o))
        } else if (this.input.seek()?.type === n.LBRACKET) {
            let i = this.eat(n.LBRACKET), r = this.parseExpr(), o = this.eat(n.RBRACKET);
            if (!o) return new se(t, i, r, this.reportErrorAt(this.input.seekPrevious(), n.SyntaxError, "']' expected"));
            t = this.parseExpr_L5(new se(t, i, r, o))
        } else return t
    }

    parseExpr_L5(e) {
        for (e = e || this.parseExpr_L6(); this.input.seek()?.type === n.Punctuation && this.input.seek()?.value === ".";) {
            let t = this.eat(n.Punctuation);
            e = new it(e, t, this.parseExpr_L6())
        }
        return e
    }

    parseExpr_L6() {
        let e = this.input.seek();
        if (e?.type === n.Keyword) return e.value !== "this" && e.value !== "super" && e.value !== "null" && e.value !== "true" && e.value !== "false" ? new m(this.reportErrorAt(this.input.consume(), n.SyntaxError, "Unexpected keyword")) : new tt(this.input.consume());
        if (e?.type === n.LPAREN) {
            let t = this.eat(n.LPAREN), i = this.parseExpr(), r = this.eat(n.RPAREN);
            return r ? new ne(t, i, r) : new ne(t, i, this.reportErrorAt(this.input.seekPrevious(), n.SyntaxError, "')' expected"))
        } else {
            if (e?.type === n.Identifier) return new z(this.input.consume());
            if (e?.type === n.Number) return new Je(this.input.consume());
            if (e?.type === n.String) return new Ke(this.input.consume());
            if (e?.type === n.LBRACKET) {
                let t = this.eat(n.LBRACKET), i = [], r = [];
                for (; !this.input.isEmpty() && this.input.seek()?.type !== n.RBRACKET && (i.push(this.parseExpr_L0()), this.input.seek()?.type === n.Punctuation && this.input.seek()?.value === ",");) r.push(this.eat(n.Punctuation));
                let o = this.eat(n.RBRACKET);
                return o ? new te(t, i, o, r) : new te(t, i, this.reportErrorAt(this.input.seekPrevious(), n.SyntaxError, "']' expected"), r)
            } else {
                if (e?.type === n.LBRACE) return this.parseObjectLiteral();
                if (!e) return new m(this.reportErrorAfter(this.input.seekPrevious(), n.SyntaxError, "Unexpected EOF"))
            }
        }
        return new m(this.reportErrorAt(this.input.consume(), n.SyntaxError, "Unexpected token"))
    }

    parseArgs() {
        let e = [], t = [];
        for (; !this.input.isEmpty() && this.input.seek()?.type !== n.RPAREN && (e.push(this.parseExpr_L0()), this.input.seek()?.type === n.Punctuation && this.input.seek()?.value === ",");) t.push(this.eat(n.Punctuation));
        return new st(e, t)
    }

    parseObjectLiteral() {
        let e = this.eat(n.LBRACE), t = [], i = [];
        for (; !this.input.isEmpty() && this.input.seek()?.type !== n.RBrace;) {
            let o = this.input.seek();
            if (o.type !== n.Identifier && o.type !== n.String) t.push(new T(this.reportErrorAt(this.input.consume(), n.SyntaxError, "Expected identifier or string as key"), null, null)); else if (o.type === n.Identifier && (o.value === "get" || o.value === "set") && this.input.seekN(1)?.type === n.Identifier) {
                let h = this.input.consume(), u = this.parseFuncDecl();
                u.keyword = h, t.push(new et(u))
            } else if (o.type === n.Identifier || o.type === n.String) {
                let h = this.input.consume(), u = this.input.seek();
                if (u?.type !== n.Punctuation || u.value !== ":") h.type === n.String ? t.push(new T(o, this.reportErrorAfter(o, n.SyntaxError, "':' expected"), null)) : t.push(new T(h, null, new z(h))); else {
                    this.eat(n.Punctuation);
                    let p = this.parseExpr_L0();
                    t.push(new T(h, u, p))
                }
            }
            if (this.input.seek()?.type !== n.Punctuation || this.input.seek()?.value !== ",") break;
            i.push(this.eat(n.Punctuation))
        }
        let r = this.eat(n.RBrace);
        return r ? new ie(e, t, r, i) : new ie(e, t, this.reportErrorAfter(this.input.seekPrevious(), n.SyntaxError, "'}' expected"), i)
    }
}

class ce {
    createScopeManager() {
        return new nt
    }

    parse(e, t) {
        return new ut(e, t).parseBlock()
    }
}

class ct {
    name = "js-lang-plugin";
    description = "JavaScript Language Plugin for Editor";

    constructor() {
    }

    onRegistered(e, t) {
        t.registerFileTypeAssociation("js", () => new I, () => new Qe, () => new ce)
    }
}

const J = new $;
J.registerPlugin(new ct);
J.attach(document.querySelector(".editor-c"));
window.editor = J;
window.EditorInstance = w;
window.js = new I;
window.JSParsingUtils = a;
window.TextRangeManager = S;
window.EditorComponentsData = ae;
window.HighlightedToken = f;
window.p = s => console.log(a.toHumanReadableString(parser.parse(null, js.asTokenStream(s))));
window.parser = new ce;

(function () {
    const e = document.createElement("link").relList;
    if (e && e.supports && e.supports("modulepreload")) return;
    for (const s of document.querySelectorAll('link[rel="modulepreload"]')) i(s);
    new MutationObserver(s => {
        for (const n of s) if (n.type === "childList") for (const l of n.addedNodes) l.tagName === "LINK" && l.rel === "modulepreload" && i(l)
    }).observe(document, {childList: !0, subtree: !0});

    function t(s) {
        const n = {};
        return s.integrity && (n.integrity = s.integrity), s.referrerPolicy && (n.referrerPolicy = s.referrerPolicy), s.crossOrigin === "use-credentials" ? n.credentials = "include" : s.crossOrigin === "anonymous" ? n.credentials = "omit" : n.credentials = "same-origin", n
    }

    function i(s) {
        if (s.ep) return;
        s.ep = !0;
        const n = t(s);
        fetch(s.href, n)
    }
})();

class c {
    static createElement(e, t) {
        function i(u, d, g) {
            switch (d) {
                case".":
                    u.classList.add(g);
                    break;
                case"#":
                    u.id = g;
                    break
            }
        }

        let s = "", n = null, l = null;
        for (let u of e) [".", "#"].includes(u) ? (n ? i(n, l, s) : n = document.createElement(s), l = u, s = "") : s += u;
        return i(n, l, s), t && t.appendChild(n), n
    }

    static px(e) {
        return `${e}px`
    }

    static isInBound(e, t, i, s = 5) {
        let n = e.getBoundingClientRect();
        return n.left - s <= t && n.right + s >= t && n.top - s <= i && n.bottom + s >= i
    }
}

class V {
    view;
    element
}

class xe extends V {
    visualLineCount;
    lines;
    edgelines;

    constructor(e, t) {
        super(), this.view = e, this.element = c.createElement("div.editor-layer.layer-inner", t)
    }

    init() {
        this.visualLineCount = this.view.visualLineCount, this.lines = [];
        let e = c.createElement("div.editor-line.editor-line-edge", this.element);
        for (let i = 0; i < this.visualLineCount; i++) this.lines.push(c.createElement("div.editor-line.line-" + i, this.element));
        let t = c.createElement("div.editor-line.editor-line-edge", this.element);
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

class Le extends V {
    _caret;
    _input;
    _blink;

    constructor(e, t) {
        super(), this.view = e, this.element = c.createElement("div.editor-layer.layer-caret", t), this._caret = c.createElement("div.editor-caret#caret-0", this.element), this._input = c.createElement("input.editor-input", this.element), this._blink = setInterval(() => this.blink(), 750)
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
            t.style.top = c.px(e.position.toVisual().y), t.style.left = c.px(e.position.toVisual().x)
        })
    }

    getCaretElement(e) {
        return this.element.querySelector(`#caret-${e.id}`)
    }

    blink() {
        this._caret.classList.toggle("blink")
    }
}

class Se {
    view;
    caret;
    selectionStartEl;
    selectionBodyEl;
    selectionEndEl;

    constructor(e, t) {
        this.view = e.view, this.caret = t, this.selectionStartEl = c.createElement("div.editor-selection.selection-start", e.element), this.selectionBodyEl = c.createElement("div.editor-selection.selection-body", e.element), this.selectionEndEl = c.createElement("div.editor-selection.selection-end", e.element)
    }

    render() {
        this.selectionStartEl.style.display = "none", this.selectionBodyEl.style.display = "none", this.selectionEndEl.style.display = "none";
        let e = this.caret.selectionModel;
        if (e.isSelectionActive && e.start && e.end) {
            let t = e.start.toVisual(), i = e.end.toVisual(), s = t.x, n = t.y, l = i.x, u = i.y;
            n > u ? ([n, u] = [u, n], [s, l] = [l, s]) : n === u && s > l && ([s, l] = [l, s]);
            let d = (u - n) / this.view.getLineHeight();
            n === u ? (this.selectionStartEl.style.display = "block", this.selectionStartEl.style.left = c.px(s), this.selectionStartEl.style.top = c.px(n), this.selectionStartEl.style.width = c.px(l - s)) : (this.selectionStartEl.style.display = "block", this.selectionStartEl.style.left = c.px(s), this.selectionStartEl.style.top = c.px(n), this.selectionStartEl.style.width = c.px(this.view.getViewWidth()), d > 1 && (this.selectionBodyEl.style.display = "block", this.selectionBodyEl.style.top = c.px(n + this.view.getLineHeight()), this.selectionBodyEl.style.height = c.px((d - 1) * this.view.getLineHeight())), this.selectionEndEl.style.display = "block", this.selectionEndEl.style.top = c.px(u), this.selectionEndEl.style.width = c.px(l))
        }
    }
}

class be extends V {
    selectionElements = new Map;

    constructor(e, t) {
        super(), this.view = e, this.element = c.createElement("div.editor-layer.layer-selection", t)
    }

    init() {
        this.view.editor.caretModel.forEachCaret(e => {
            this.selectionElements.set(e.id, new Se(this, e))
        })
    }

    destroy() {
    }

    render() {
        this.update()
    }

    update() {
        this.selectionElements.forEach(e => e.render())
    }
}

class Ce extends V {
    _activeLine;

    constructor(e, t) {
        super(), this.view = e, this.element = c.createElement("div.editor-layer.layer-active-line", t), this._activeLine = c.createElement("div.editor-active-line", this.element)
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
        this._activeLine.style.top = c.px(e)
    }
}

class Ae {
    layers_el;
    text;
    caret;
    selection;
    activeLine;

    constructor(e) {
        this.layers_el = c.createElement("div.editor-layers", e.view), this.text = new xe(e, this.layers_el), this.caret = new Le(e, this.layers_el), this.selection = new be(e, this.layers_el), this.activeLine = new Ce(e, this.layers_el)
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

class Re {
    view;
    element;
    digits = 1;
    lines = [];
    edgelines = [];

    constructor(e) {
        this.view = e, this.element = c.createElement("div.editor-gutter", e.view)
    }

    init() {
        this.lines = [];
        let e = c.createElement("div.editor-gutter-line.editor-line-edge", this.element);
        for (let i = 0; i < this.view.visualLineCount; i++) this.lines.push(c.createElement("div.editor-gutter-line.gutter-line-" + i, this.element));
        let t = c.createElement("div.editor-gutter-line.editor-line-edge", this.element);
        this.edgelines = [e, t]
    }

    initCSS() {
        this.update()
    }

    update() {
        this.element.style.setProperty("--editor-gutter-num-size", c.px(this.digits * this.view.getCharSize()))
    }

    destroy() {
    }

    renderLine(e, t) {
        this.lines[e].innerHTML = "", this.lines[e].append(...t)
    }

    renderEdgeLine(e, t) {
        this.edgelines[e].innerHTML = "", this.edgelines[e].append(...t)
    }
}

var v = (r => (r.NUM0 = "0", r.NUM1 = "1", r.NUM2 = "2", r.NUM3 = "3", r.NUM4 = "4", r.NUM5 = "5", r.NUM6 = "6", r.NUM7 = "7", r.NUM8 = "8", r.NUM9 = "9", r.A = "a", r.B = "b", r.C = "c", r.D = "d", r.E = "e", r.F = "f", r.G = "g", r.H = "h", r.I = "i", r.J = "j", r.K = "k", r.L = "l", r.M = "m", r.N = "n", r.O = "o", r.P = "p", r.Q = "q", r.R = "r", r.S = "s", r.T = "t", r.U = "u", r.V = "v", r.W = "w", r.X = "x", r.Y = "y", r.Z = "z", r.ESCAPE = "Escape", r.BACKSPACE = "Backspace", r.DELETE = "Delete", r.ENTER = "Enter", r.TAB = "Tab", r.ARROW_UP = "ArrowUp", r.ARROW_DOWN = "ArrowDown", r.ARROW_LEFT = "ArrowLeft", r.ARROW_RIGHT = "ArrowRight", r.PAGE_UP = "PageUp", r.PAGE_DOWN = "PageDown", r.HOME = "Home", r.END = "End", r.SPACE = " ", r.COMMA = ",", r.PERIOD = ".", r.SEMICOLON = ";", r.QUOTE = "'", r.SLASH = "/", r.BACKSLASH = "\\", r.DASH = "-", r.EQUALS = "=", r.LEFT_BRACKET = "[", r.RIGHT_BRACKET = "]", r.QUESTION_MARK = "?", r.TILDE = "~", r.CAPS_LOCK = "CapsLock", r.INSERT = "Insert", r.LeftClick = "LClick", r.LeftDoubleClick = "LDoubleClick", r.LeftTripleClick = "LTripleClick", r.MIDDLE_CLICK = "MiddleClick", r.RCLICK = "RClick", r.RDOUBLE_CLICK = "RDoubleClick", r))(v || {});

class E {
    static INSTANCE;
    isCtrlPressed = !1;
    isAltPressed = !1;
    isShiftPressed = !1;
    isMouseDown = !1;
    isDragging = !1;

    static get isCtrlPressed() {
        return this.getInstance().isCtrlPressed
    }

    static get isAltPressed() {
        return this.getInstance().isAltPressed
    }

    static get isShiftPressed() {
        return this.getInstance().isShiftPressed
    }

    static get isMouseDown() {
        return this.getInstance().isMouseDown
    }

    static get isDragging() {
        return this.getInstance().isDragging
    }

    static getInstance() {
        return this.INSTANCE || (this.INSTANCE = new E), this.INSTANCE
    }

    set(e) {
        this.isCtrlPressed = e.ctrlKey ?? !1, this.isAltPressed = e.altKey ?? !1, this.isShiftPressed = e.shiftKey ?? !1, this.isMouseDown = e.button !== void 0 && e.button === 0
    }

    setIsDragging(e) {
        this.isDragging = e
    }

    clear() {
        this.isCtrlPressed = !1, this.isAltPressed = !1, this.isShiftPressed = !1, this.isMouseDown = !1
    }
}

class ee {
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

class Pe {
    onSrLoaded(e, t, i, s) {
    }

    onCaretRemove(e, t) {
    }

    onCaretMove(e, t, i, s) {
    }
}

class Me {
    onSrLoaded(e, t, i, s) {
    }

    onAttached(e, t) {
    }

    onRender(e) {
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

    onScroll(e, t) {
    }

    onFocus(e, t) {
    }

    onBlur(e, t) {
    }

    onCaretMove(e, t, i, s) {
    }

    onCaretRemove(e, t) {
    }

    onRegistered(e, t) {
    }
}

class Te {
    visualListeners = [];
    editorListeners = [];
    langListeners = {};
    keybindingListeners = new Map;

    addVisualEventListener(e) {
        this.visualListeners.push(e)
    }

    addEditorEventListener(e) {
        this.editorListeners.push(e)
    }

    addLangEventListener(e, t) {
        this.langListeners[e] || (this.langListeners[e] = []), this.langListeners[e].push(t)
    }

    addKeybindingListener(e, t) {
        this.keybindingListeners.set(e, t)
    }

    removeVisualEventListener(e) {
        this.visualListeners.splice(this.visualListeners.indexOf(e), 1)
    }

    fireKeybinding(e, t) {
        for (let [i, s] of this.keybindingListeners.entries()) this.matches(i, e) && s.apply(null, [t, e])
    }

    fireMouseKeybinding(e, t) {
        for (let [i, s] of this.keybindingListeners.entries()) this.matches(i, e) && (e.button === 0 ? i.key === v.LeftClick ? s.apply(null, [t, e]) : i.key === v.LeftDoubleClick && e.detail === 2 ? s.apply(null, [t, e]) : i.key === v.LeftTripleClick && e.detail === 3 && s.apply(null, [t, e]) : e.button === 1 && i.key === v.MIDDLE_CLICK ? s.apply(null, [t, e]) : i.key === v.RCLICK ? s.apply(null, [t, e]) : i.key === v.RDOUBLE_CLICK && e.detail === 2 && s.apply(null, [t, e]))
    }

    fire(e, ...t) {
        for (const i of this.visualListeners) {
            const s = i[e];
            s && s.apply(i, t)
        }
        for (const i of this.editorListeners) {
            const s = i[e];
            s && s.apply(i, t)
        }
    }

    fireLangEvent(e, t, ...i) {
        const s = this.langListeners[e];
        if (s) for (const n of s) {
            const l = n[t];
            l && l.apply(n, i)
        }
    }

    matches(e, t) {
        return (!("key" in t) || t.key === e.key) && (e.ctrl !== void 0 ? t.ctrlKey === e.ctrl : !0) && (e.alt !== void 0 ? t.altKey === e.alt : !0) && (e.shift !== void 0 ? t.shiftKey === e.shift : !0)
    }
}

const Be = {
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
        selectionColor: "#214283",
        activeLineColor: "#2b2e38"
    }
};

class Oe {
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

function Fe(r) {
    let e = c.createElement("div.editor-sizer", r.view);
    return e.innerHTML = "a", () => e.getBoundingClientRect().width
}

class Ie {
    editor;
    view;
    scroll;
    gutter;
    layers;
    getCharSize;
    getLineHeight;
    getViewWidth;
    getViewHeight;
    visualLineCount;
    visualCharCount;
    popups = [];
    lines;
    isDirty = !0;

    constructor(e) {
        this.editor = e, this.editor.addVisualEventListener(new class extends ee {
            onBlur(t, i) {
                t.root.classList.remove("focused")
            }

            onFocus(t, i) {
                t.root.classList.add("focused")
            }

            onMouseDown(t, i) {
                i.preventDefault(), t.view.focus()
            }

            onMouseMove(t, i) {
                for (let s of t.view.popups) s.isInBound(i.x, i.y) || s.close()
            }

            onScroll(t, i) {
                i.preventDefault();
                let s = i.deltaY;
                s !== 0 && t.view.scrollBy(0, s), t.view.resetBlink()
            }
        }), this.editor.addEditorEventListener(new class extends Pe {
            onCaretMove(t, i, s, n) {
                t.view.ensureCaretVisible()
            }
        })
    }

    onAttached(e, t) {
        this.view = c.createElement("div.editor-view", t), this.scroll = new Oe(this, 0, 0), this.gutter = new Re(this), this.layers = new Ae(this), this.initCSS(), this.setupEventListeners(), this.gutter.init(), this.layers.init()
    }

    setCSSProperties(e, t) {
        for (const [i, s] of Object.entries(t)) e.style.setProperty(i, s)
    }

    focus() {
        this.layers.caret.focus()
    }

    scrollBy(e, t) {
        let i = this.scroll.scrollY + t;
        i < 0 ? this.scroll.scrollY = 0 : i > (this.editor.getLineCount() - this.visualLineCount + 2) * this.getLineHeight() ? this.scroll.scrollY = Math.max(0, (this.editor.getLineCount() - this.visualLineCount + 2) * this.getLineHeight()) : this.scroll.scrollY = i, this.triggerRepaint()
    }

    scrollIntoView(e, t) {
        let i = this.scrollIntoViewAlong(e.y, this.scroll.scrollYLines, this.scroll.scrollYLines + this.visualLineCount - 1);
        i !== null && (this.scroll.scrollY = i * this.getLineHeight()), this.triggerRepaint()
    }

    ensureCaretVisible() {
        this.offScreen(this.editor.caretModel.primary.position) && this.scrollIntoView(this.editor.caretModel.primary.position, 0)
    }

    animateScroll(e) {
    }

    getRelativePos(e) {
        let t = e.clientX - this.layers.layers_el.getBoundingClientRect().left,
            i = e.clientY - this.layers.layers_el.getBoundingClientRect().top;
        return [t, i]
    }

    render() {
        this.isDirty && (this.isDirty = !1, this.repaint()), this.update()
    }

    repaint() {
        let e = this.scroll.scrollYLines, t = this.scroll.scrollYOffset,
            i = this.lines = this.editor.take(this.visualLineCount, e);
        for (let s = 0; s < this.visualLineCount; s++) this.layers.text.renderLine(s, i[s].content), this.gutter.renderLine(s, i[s].gutter);
        if (this.gutter.digits = Math.floor(Math.log10(this.editor.getLineCount())) + 1, t) {
            if (e > 0) {
                let s = this.editor.getLine(e - 1);
                this.layers.text.renderEdgeLine(0, s.content), this.gutter.renderEdgeLine(0, s.gutter), this.lines.unshift(s)
            }
            if (e + this.visualLineCount < this.editor.getLineCount()) {
                let s = this.editor.getLine(e + this.visualLineCount);
                this.layers.text.renderEdgeLine(1, s.content), this.gutter.renderEdgeLine(1, s.gutter), this.lines.push(s)
            }
        }
        this.setCSSProperties(this.view, {"--editor-scroll-offsetY": c.px(t || this.getLineHeight())})
    }

    triggerRepaint() {
        this.isDirty = !0
    }

    update() {
        this.gutter.update(), this.layers.update()
    }

    destroy() {
        this.gutter.destroy(), this.layers.destroy(), this.view.remove()
    }

    addPopup(e) {
        let t = e.render(this);
        this.layers.layers_el.appendChild(t), this.popups.push(e)
    }

    showPopup(e, t, i) {
        let s = e.element;
        e.show();
        let n = this.layers.layers_el.getBoundingClientRect().left,
            l = this.layers.layers_el.getBoundingClientRect().top, u = t - n,
            d = Math.ceil((i - l) / this.getLineHeight()) * this.getLineHeight();
        s.style.left = c.px(u), s.style.top = c.px(d)
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

    offScreen(e) {
        let t = e.toVisual();
        return t.x < 0 || t.x >= this.getViewWidth() || t.y < 0 || t.y >= this.getViewHeight()
    }

    scrollIntoViewAlong(e, t, i) {
        if (e > t && e < i) return null;
        if (e <= t) return Math.max(0, e - 2);
        {
            let s = i - t;
            return e + 1 >= this.editor.getLineCount() ? Math.max(0, this.editor.getLineCount() - s) : Math.max(0, e - s)
        }
    }

    setupEventListeners() {
        this.view.addEventListener("mousedown", e => this.editor.fire("onMouseDown", e)), this.view.addEventListener("mouseup", e => this.editor.fire("onMouseUp", e)), this.view.addEventListener("mousemove", e => this.editor.fire("onMouseMove", e)), this.view.addEventListener("wheel", e => this.editor.fire("onScroll", e)), this.view.addEventListener("contextmenu", e => e.preventDefault()), this.layers.setupEventListeners()
    }

    initCSS() {
        const e = this.editor.properties.view || (this.editor.properties.view = {});

        function t(i) {
            return e[i] || (e[i] = Be.view[i])
        }

        this.setCSSProperties(this.editor.root, {
            "--editor-width": c.px(t("width")),
            "--editor-height": c.px(t("height")),
            "--editor-root-bg": t("rootBgColor"),
            "--editor-root-border-color": t("rootBorderColor"),
            "--editor-font-size": c.px(t("fontSize")),
            "--editor-line-height": c.px(t("lineHeight")),
            "--editor-gutter-width": c.px(t("gutterWidth")),
            "--editor-caret-height": c.px(t("caretHeight")),
            "--editor-gutter-color": t("gutterColor"),
            "--editor-caret-color": t("caretColor"),
            "--editor-selection-color": t("selectionColor"),
            "--editor-active-line-color": t("activeLineColor")
        }), this.getCharSize = Fe(this), this.getLineHeight = () => e.lineHeight, this.getViewWidth = () => e.width, this.getViewHeight = () => e.height, this.visualLineCount = Math.floor(e.height / this.getLineHeight()), this.visualCharCount = Math.floor(e.width / this.getCharSize()), this.setCSSProperties(this.view, {"--editor-scroll-offsetY": c.px(this.getLineHeight())}), this.gutter.initCSS()
    }
}

class He {
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

class Ne {
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

class _e extends Me {
    name;
    description
}

class De {
    editor;
    plugins;
    lexerProviderMap = new Map;
    highlighterProviderMap = new Map;
    parserProviderMap = new Map;

    constructor(e) {
        this.editor = e, this.plugins = {}
    }

    register(e) {
        this.plugins[e.name] = e, e.onRegistered(this.editor, this), this.editor.addEditorEventListener(e), this.editor.addVisualEventListener(e)
    }

    registerFileTypeAssociation(e, t, i, s) {
        this.lexerProviderMap.set(e, t), i && this.highlighterProviderMap.set(e, i), s && this.parserProviderMap.set(e, s)
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

class M {
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

class F {
    root;

    constructor(e = "") {
        this.root = new M(e)
    }

    concat(e) {
        this.root = new M(null, this.root, e.root), this.root.weight = this.root.left.getTotalWeight()
    }

    index(e) {
        return this._index(this.root, e)
    }

    toString() {
        return this._toString(this.root)
    }

    split(e) {
        const [t, i] = this._split(this.root, e), s = new F;
        s.root = t;
        const n = new F;
        return n.root = i, [s, n]
    }

    insert(e, t) {
        const [i, s] = this.split(e), n = new F(t);
        i.concat(n), i.concat(s), this.root = i.root
    }

    delete(e, t) {
        const [i, s] = this.split(e), [n, l] = s.split(t);
        return i.concat(l), this.root = i.root, n.toString()
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
            const i = e.value.substring(0, t), s = e.value.substring(t);
            return [new M(i), new M(s)]
        }
        if (t < e.weight) {
            const [i, s] = this._split(e.left, t), n = new M(null, s, e.right);
            return [i, n]
        } else {
            const [i, s] = this._split(e.right, t - e.weight), n = new M(null, e.left, i);
            return n.weight = e.left.getTotalWeight(), [n, s]
        }
    }
}

class B {
    static componentIdCounter = 0;
    static actionIdCounter = 0;
    static popups = new Map;

    static getComponentId(e) {
        return `${e}-${this.componentIdCounter++}`
    }

    static getActionId(e) {
        return `${this.actionIdCounter++}-${e}`
    }

    static getPopup(e) {
        return console.log(this.popups.get(e.id)), this.popups.has(e.id) || this.popups.set(e.id, e.createPopup()), this.popups.get(e.id)
    }

    static registerPopup(e, t) {
        return this.popups.set(e.id, t), this.getComponentId("popup")
    }
}

class We {
    id;
    line;
    element;

    constructor(e) {
        this.id = B.getComponentId("gutter-line"), this.line = e
    }

    onDestroy(e) {
    }

    render() {
        return this.element || (this.element = document.createElement("span"), this.element.className = "gutter-line-number", this.element.textContent = (this.line + 1).toString()), this.element
    }

    getWidth(e) {
        return this.element.getBoundingClientRect().width
    }
}

class me {
    editor;
    components = [];
    gutterComponents = [];

    constructor(e) {
        this.editor = e
    }

    add(e) {
        this.components.push(e), e.range
    }

    set(e, t) {
        this.components, this.clearRange(e);
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
        i.sort((u, d) => u.pos - d.pos || (u.type === "end" ? 1 : -1));
        const s = [];
        let n = [], l = t;
        for (const u of i) {
            const d = u.pos;
            if (d > l) if (n.length === 0) {
                const g = document.createElement("span");
                g.textContent = " ".repeat(d - l), s.push(g)
            } else {
                const g = n.map(Y => Y.className).join(" ").trim(), b = n[0], H = Math.max(l, b.range.begin),
                    ye = Math.min(d, b.range.end), ke = b.content.slice(H - b.range.begin, ye - b.range.begin),
                    N = document.createElement("span");
                N.className = g, N.textContent = ke, n.forEach(Y => Y.onRender(this.editor, N)), s.push(N)
            }
            if (u.type === "start") n.push(u.component); else {
                const g = n.indexOf(u.component);
                g !== -1 && n.splice(g, 1)
            }
            l = d
        }
        return s
    }

    query(e) {
        return this.components.filter(t => e.contains(t.range))
    }

    gutterToRenderables(e) {
        return this.gutterComponents.filter(i => i.line === e).concat([new We(e)]).map(i => i.render())
    }

    clearRange(e) {
        let t = [], i = [];
        for (let s of this.components) s.range.overlaps(e) ? s.onDestroy(this.editor) : t.push(s);
        for (let s of this.gutterComponents) {
            let n = this.editor.createPositionFromOffset(e.begin), l = this.editor.createPositionFromOffset(e.end);
            s.line >= n.y && s.line <= l.y ? s.onDestroy(this.editor) : i.push(s)
        }
        this.components = t, this.gutterComponents = i
    }

    registerError(e) {
        this.components.push(e)
    }
}

class w {
    static _isLocked = !1;
    static waiting = [];
    static _count = 0;
    static _Instance = null;
    static get Instance() {
        if (!w._Instance) throw new Error("Editor instance not acquired yet. Please call EditorInstance.acquire(editor) first.");
        return w._Instance
    }

    static async acquireAsync(e) {
        if (!this._Instance && !this._isLocked) this._isLocked = !0, this._Instance = e, this._count = 0; else {
            if (this._Instance === e) {
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
        if (!this.waiting.length) this._isLocked = !1, this._Instance = null; else {
            const [e, t] = this.waiting.shift();
            this._Instance = e, t()
        }
    }

    static async with(e, t) {
        await this.acquireAsync(e), t(), this.release()
    }

    static acquire(e) {
        if (!this.waitForFlagSync()) throw new Error("Error: Couldn't acquire editor instance in time. This is probably caused by an abnormal delay in an asynchronously running operation.");
        this._Instance = e
    }

    static waitForFlagSync(e = 2e3) {
        if (!this._Instance && !this._isLocked) return !0;
        console.warn(`Warning: Editor instance is already acquired. Waiting for it to be released for a maximum of ${e}ms...`);
        const t = Date.now();
        for (; Date.now() - t < e;) if (!this._Instance && !this._isLocked) return !0;
        return !1
    }
}

class T {
    x;
    y;

    constructor(e, t) {
        this.x = e, this.y = t
    }
}

class y {
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
        return new this(e, e.calculateOffset(new T(t, i)))
    }

    static fromAbsolute(e, t, i) {
        return new this(e, e.absoluteToOffset(t, i))
    }

    static fromVisual(e, t, i) {
        let s = e.visualToNearestLogical(t, i);
        return y.fromLogical(e, s.x, s.y)
    }

    set(e, t) {
        this._offset = this.editor.calculateOffset(new T(e, t))
    }

    createLogical(e, t) {
        return y.fromLogical(this.editor, e, t)
    }

    createAbsolute(e, t) {
        return y.fromAbsolute(this.editor, e, t)
    }

    createVisual(e, t) {
        return y.fromVisual(this.editor, e, t)
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

    clone() {
        return new y(this.editor, this._offset)
    }
}

class P {
    static _INSTANCES = new Map;
    ranges = new Set;
    rangesRegistry = new FinalizationRegistry(e => {
        this.ranges.delete(e)
    });

    static get INSTANCE() {
        return P._INSTANCES.has(w.Instance.id) || P._INSTANCES.set(w.Instance.id, new P), P._INSTANCES.get(w.Instance.id)
    }

    add(e) {
        const t = new WeakRef(e);
        this.ranges.add(t), this.rangesRegistry.register(e, t)
    }

    updateRanges(e, t) {
        for (const i of this.ranges) {
            const s = i.deref();
            if (!s) {
                this.ranges.delete(i);
                continue
            }
            s.begin > e && (s.begin += t), s.end >= e && (s.end += t)
        }
    }
}

class h {
    begin;
    end;

    constructor(e, t) {
        P.INSTANCE.add(this), this.begin = e, this.end = t
    }

    static of(e, t) {
        if (Array.isArray(e)) {
            let i = e.filter(s => s !== null);
            return i.length == 1 ? i[0].range.clone() : i.length == 0 ? new h(0, 0) : new h(i[0].range.begin, i[i.length - 1].range.end)
        }
        return t ? new h(e.range.begin, t.range.end) : e.range.clone()
    }

    static around(e) {
        return new h(e, e + 1)
    }

    moveBy(e) {
        this.begin += e, this.end += e
    }

    overlaps(e) {
        return this.begin <= e.end && this.end >= e.begin
    }

    contains(e) {
        return e instanceof h ? this.begin <= e.begin && this.end >= e.end : this.begin <= e && this.end >= e
    }

    clone() {
        return new h(this.begin, this.end)
    }
}

class Ve {
    edac;
    raw;
    language = "plaintext";
    srTree;

    constructor(e, t) {
        this.raw = new F(t), this.edac = new me(e)
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

    getWordAt(e, t, i) {
        let s = i.withLine(e), n = i.lineBegin(e);
        e -= n;

        function l(g) {
            return t.lastIndex = 0, t.test(g)
        }

        let u = -1;
        for (let g = e; g >= 0; g--) if (l(s[g])) {
            u = g;
            break
        }
        let d = -1;
        for (let g = e; g < s.length; g++) if (l(s[g])) {
            d = g;
            break
        }
        return u = u === -1 ? 0 : u + 1, d === -1 && (d = s.length), new h(u + n, d + n)
    }

    setComponentsAtRange(e, t) {
        this.edac.set(e, t)
    }

    take(e, t, i) {
        let s = [];
        for (let n = 0; n < e; n++) s.push(this.getLine(t + n, i));
        return s
    }

    getLine(e, t) {
        if (t.length <= e) return {gutter: [], content: [], line: e};
        {
            let i = this.raw.length() + 1, s = new h(t[e], t[e + 1] || i);
            return {
                content: this.edac.toRenderables(this.edac.query(s), t[e]),
                gutter: this.edac.gutterToRenderables(e),
                line: e
            }
        }
    }

    registerError(e) {
        this.edac.registerError(e)
    }
}

class je {
    data;
    lineBreaks = [0];

    constructor(e) {
        this.data = e
    }

    offsetToLogical(e) {
        let t = this.findFirstAfter(this.lineBreaks, e), i = t === -1 ? this.lineBreaks.length - 1 : t - 1,
            s = e - this.lineBreaks[i];
        return new T(s, i)
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
        this._offsetList(this.lineBreaks, e, t), P.INSTANCE.updateRanges(e, t)
    }

    recomputeNewLines(e, t, i = !1) {
        let s = this.findFirstAfter(this.lineBreaks, e);
        s === -1 && (s = this.lineBreaks.length);
        for (const n of t.matchAll(/\r\n|\n|\r/g)) if (i) this.lineBreaks.splice(this.lineBreaks.indexOf(e + n.index + n[0].length), 1); else {
            let l = e + n.index + n[0].length;
            this.lineBreaks.splice(s, 0, l), s++
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
        let s = this.findFirstAfter(e, t);
        if (s !== -1) for (let n = s; n < e.length; n++) e[n] += i
    }
}

var A = (r => (r[r.LEFT = 0] = "LEFT", r[r.RIGHT = 1] = "RIGHT", r[r.UNKNOWN = 2] = "UNKNOWN", r))(A || {});

class Ue {
    isSelectionActive;
    caret;
    start;
    end = null;

    constructor(e) {
        this.caret = e, this.isSelectionActive = !1
    }

    get direction() {
        return !this.isSelectionActive || !this.start || !this.end ? 2 : this.start.offset < this.end.offset ? 1 : 0
    }

    setStart(e) {
        this.start = e.clone()
    }

    setEnd(e) {
        this.end = e.clone()
    }

    setActive(e) {
        this.isSelectionActive = e
    }

    clear() {
        this.isSelectionActive = !1, this.setStart(this.caret.position), this.end = null
    }

    onCaretMove() {
        if (!E.isShiftPressed && !E.isDragging) return this.setStart(this.caret.position), this.clear();
        this.setEnd(this.caret.position), this.isSelectionActive || this.setActive(!0)
    }

    getStart() {
        let e = this.start || this.caret.position;
        return this.end && this.end.offset < e.offset ? this.end : e
    }

    getEnd() {
        let e = this.end || this.caret.position;
        return this.start && this.start.offset > e.offset ? this.start : e
    }

    set(e, t) {
        this.start = y.fromOffset(this.caret.editor, e), this.end = y.fromOffset(this.caret.editor, t), this.isSelectionActive = !0
    }
}

class ae {
    id = 0;
    isPrimary;
    position;
    editor;
    vertMovementPos = 0;
    selectionModel;

    constructor(e, t, i) {
        this.editor = e, this.isPrimary = t, this.position = i, this.selectionModel = new Ue(this)
    }

    moveToLogical(e, t) {
        let i;
        typeof e == "number" ? i = this.position.createLogical(e, t) : i = this.position.createLogical(e.x, e.y);
        let s = this.position;
        this.position = i, this.onCaretMove(s, i)
    }

    onCaretMove(e, t) {
        this.editor.fire("onCaretMove", this, e, t), this.selectionModel.onCaretMove()
    }

    moveToAbsolute(e, t) {
        let i;
        typeof e == "number" ? i = this.position.createAbsolute(e, t) : i = this.position.createAbsolute(e.x, e.y), this.setPosition(i)
    }

    setPosition(e) {
        let t = this.position;
        this.position = e, this.onCaretMove(t, e)
    }

    shift(e = 1) {
        let t = this.position.offset;
        this.position.offset += e, this.onCaretMove(y.fromOffset(this.editor, t), this.position), this.vertMovementPos = 0
    }

    setVertMovementPos() {
        this.vertMovementPos = Math.max(this.vertMovementPos, this.position.x)
    }

    remove() {
        this.editor.fire("onCaretRemove", this)
    }
}

class qe {
    editor;
    carets = [];

    constructor(e) {
        this.editor = e, this.carets.push(new ae(e, !0, e.createLogical(0, 0)))
    }

    get primary() {
        return this.carets.find(e => e.isPrimary)
    }

    addCaret(e) {
        const t = new ae(this.editor, !1, e);
        return this.carets.push(t), t
    }

    forEachCaret(e) {
        for (const t of this.carets) e(t)
    }

    shift(e) {
        this.forEachCaret(t => t.shift(e))
    }

    removeAll() {
        for (let e = 0; e < this.carets.length; e++) this.carets[e].isPrimary || (this.carets[e].remove(), this.carets.splice(e, 1), e--)
    }
}

class p {
    isError = !1;
    type;
    value;
    range;
    isSpecial;
    isComment;

    constructor(e, t, i, s = !1, n = !1) {
        this.type = e, this.value = t, this.range = i, this.isSpecial = s, this.isComment = n
    }
}

class I extends p {
    isError = !0;
    msg;

    constructor(e, t, i, s) {
        super(e, t, s, !1, !1), this.msg = i
    }
}

class Ye {
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

class we {
    skipSpecial = !0;
    skipComments = !0;

    static of(...e) {
        return new te(e)
    }
}

class te extends we {
    tokens;
    index = 0;

    constructor(e) {
        super(), this.tokens = e
    }

    clone() {
        return new te(this.tokens.slice())
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

class j extends we {
    lexer;
    src;
    tokens = [];
    index = 0;
    computed = 0;

    constructor(e, t, i = !0) {
        super(), this.lexer = e, this.src = new Ye(t), this.skipSpecial = i
    }

    clone() {
        const e = new j(this.lexer, this.src.src, this.skipSpecial);
        return e.index = this.index, e.computed = this.computed, e.tokens = [...this.tokens], this.skipComments || e.includeComments(), e
    }

    isEmpty() {
        return this.index >= this.tokens.length && this.src.isEmpty()
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

class ze {
    EOF;
    compiledMatchers;
    specialChars = [];
    comments = [];

    setRules(e) {
        this.compiledMatchers = e.map(({matcher: t, type: i, getValue: s}) => ({
            matcher: new RegExp(t.source, "y"),
            type: i,
            getValue: s
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
        if (e.isEmpty()) return new p(this.EOF, "", new h(e.index, e.index), !1, !1);
        for (const t of this.compiledMatchers) {
            t.matcher.lastIndex = e.index;
            const i = t.matcher.exec(e.src);
            if (i && (e.jump(i[0].length), t.type !== null)) {
                const s = t.getValue ? t.getValue(i[0]) : i[0], n = this.specialChars.includes(t.type),
                    l = this.comments.includes(t.type);
                return new p(t.type, s, new h(e.index - i[0].length, e.index), n, l)
            }
        }
        throw "Unexpected token at index " + e.index + " in source: " + e.src
    }
}

class Ge extends ze {
    constructor() {
        super(), this.setRules([{matcher: /\r\n|\n|\r/, type: "EOL"}, {
            matcher: /([^\r\n]+)/,
            type: "Default"
        }]), this.setEOF("EOF"), this.setSpecial("EOL")
    }

    asTokenStream(e) {
        return new j(this, e)
    }
}

class Xe {
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

class x {
    id;
    name;
    description;
    keybinding;

    constructor() {
        this.id = B.getActionId(this.name)
    }
}

class $e extends x {
    name = "Delete";
    description = "Delete the selected text or the character after the caret.";
    keybinding = {key: v.DELETE, ctrl: !1, alt: !1, shift: !1};

    run(e, t) {
        e.caretModel.forEachCaret(i => {
            i.selectionModel.isSelectionActive ? e.deleteSelection(i) : e.deleteAt(i.position.offset)
        }), e.view.resetBlink()
    }
}

class Ke extends x {
    name = "Backspace";
    description = "Delete the selected text or the character at the caret position.";
    keybinding = {key: v.BACKSPACE, ctrl: !1, alt: !1, shift: !1};

    run(e, t) {
        e.caretModel.forEachCaret(i => {
            i.selectionModel.isSelectionActive ? e.deleteSelection(i) : (e.deleteAt(i.position.offset - 1), i.shift(-1))
        }), e.view.resetBlink()
    }
}

function U(r, e) {
    let t = r.selectionModel.start;
    r.selectionModel.clear(), e && r.moveToLogical(t)
}

class Qe extends x {
    name = "MoveCaretLeft";
    description = "Move the caret to the left by one character.";
    keybinding = {key: v.ARROW_LEFT, ctrl: !1, alt: !1};

    run(e, t) {
        e.caretModel.forEachCaret(i => {
            let s = i.selectionModel.direction;
            !t.shiftKey && s !== A.UNKNOWN ? U(i, s === A.RIGHT) : i.shift(-1)
        }), e.view.resetBlink()
    }
}

class Ze extends x {
    name = "MoveCaretRight";
    description = "Move the caret to the right by one character.";
    keybinding = {key: v.ARROW_RIGHT, ctrl: !1, alt: !1};

    run(e, t) {
        e.caretModel.forEachCaret(i => {
            let s = i.selectionModel.direction;
            !t.shiftKey && s !== A.UNKNOWN ? U(i, s === A.LEFT) : i.shift(1)
        }), e.view.resetBlink()
    }
}

class Je extends x {
    name = "MoveCaretUp";
    description = "Move the caret up one line.";
    keybinding = {key: v.ARROW_UP, ctrl: !1, alt: !1};

    run(e, t) {
        e.view.resetBlink(), e.caretModel.forEachCaret(i => {
            if (!t.shiftKey && i.selectionModel.direction !== A.UNKNOWN && U(i, i.selectionModel.direction === A.RIGHT), i.position.y === 0) return;
            i.setVertMovementPos();
            let s = e.createLogical(Math.min(e.getLineLength(i.position.y - 1), i.vertMovementPos), i.position.y - 1);
            i.moveToLogical(s)
        })
    }
}

class et extends x {
    name = "MoveCaretDown";
    description = "Move the caret down one line.";
    keybinding = {key: v.ARROW_DOWN, ctrl: !1, alt: !1};

    run(e, t) {
        e.view.resetBlink(), e.caretModel.forEachCaret(i => {
            if (!t.shiftKey && i.selectionModel.direction !== A.UNKNOWN && U(i, i.selectionModel.direction === A.LEFT), i.position.y >= e.getLineCount() - 1) return;
            i.setVertMovementPos();
            let s = e.createLogical(Math.min(e.getLineLength(i.position.y + 1), i.vertMovementPos), i.position.y + 1);
            i.moveToLogical(s)
        })
    }
}

class tt extends x {
    name = "MoveCaretToStart";
    description = "Move the caret to the start of the line.";
    keybinding = {key: v.HOME, ctrl: !1, alt: !1};

    run(e, t) {
        e.view.resetBlink(), e.caretModel.forEachCaret(i => {
            i.vertMovementPos = 0, i.moveToLogical(e.createLogical(0, i.position.y))
        })
    }
}

class it extends x {
    name = "MoveCaretToEnd";
    description = "Move the caret to the end of the line.";
    keybinding = {key: v.END, ctrl: !1, alt: !1};

    run(e, t) {
        e.view.resetBlink(), e.caretModel.forEachCaret(i => {
            let s = e.getLineLength(i.position.y);
            i.vertMovementPos = s, i.moveToLogical(e.createLogical(s, i.position.y))
        })
    }
}

class st extends x {
    name = "TabAction";
    description = "Insert a tab character at the caret position.";
    keybinding = {key: v.TAB, ctrl: !1, alt: !1, shift: !1};

    run(e, t) {
        t.preventDefault(), e.caretModel.forEachCaret(i => {
            e.insertText(i.position.offset, "    "), e.caretModel.shift(4)
        }), e.view.resetBlink()
    }
}

class rt extends x {
    name = "SelectAll";
    description = "Select all text in the editor.";
    keybinding = {key: v.A, ctrl: !0, alt: !1, shift: !1};

    run(e, t) {
        e.caretModel.removeAll(), e.caretModel.primary.selectionModel.set(0, e.data.raw.length()), e.view.resetBlink()
    }
}

class ie extends x {
    static DELIMITER = /[\s.,;:!?(){}[\]<>]/;
    name = "SelectDoubleClick";
    description = "Select word under the caret.";
    keybinding = {key: v.LeftDoubleClick, shift: !1};

    run(e) {
        const t = e.caretModel.primary.position, i = e.getWordAt(t.offset, ie.DELIMITER);
        e.caretModel.primary.selectionModel.set(i.begin, i.end), e.view.resetBlink()
    }
}

class nt {
    editor;
    actions = [];

    constructor(e) {
        this.editor = e, this.addAction(new Qe), this.addAction(new Ze), this.addAction(new Je), this.addAction(new et), this.addAction(new tt), this.addAction(new it), this.addAction(new $e), this.addAction(new st), this.addAction(new Ke), this.addAction(new rt), this.addAction(new ie)
    }

    addAction(e) {
        this.actions.push(e), e.keybinding && this.editor.eventsManager.addKeybindingListener(e.keybinding, e.run)
    }
}

class ot {
    id;
    isRendered = !1;
    isShown = !1;
    owner;
    element;

    constructor(e) {
        this.owner = e, this.id = B.registerPopup(e, this)
    }

    onDestroy(e) {
    }

    isInBound(e, t) {
        if (!this.isShown || !this.element) return !1;
        let i = this.owner.element;
        return c.isInBound(this.element, e, t) || i && c.isInBound(i, e, t)
    }

    close() {
        this.isShown = !1, this.element.style.display = "none"
    }

    show() {
        this.isShown = !0, this.element.style.display = "flex"
    }
}

class lt extends ot {
    msg;

    constructor(e, t) {
        super(e), this.msg = t
    }

    render(e) {
        this.element = document.createElement("div"), this.element.className = "editor-popup popup-message-box md";
        let t = this.msg.toHTML();
        for (let i of t) this.element.appendChild(i);
        return this.isRendered = !0, this.element
    }
}

class at {
}

class ht {
    parts;

    constructor(e) {
        this.parts = e
    }

    toHTML() {
        return this.parts.map(e => e.render())
    }
}

class ut extends at {
    text;
    effects;

    constructor(e, t) {
        super(), this.text = e, this.effects = t
    }

    render() {
        let e = document.createElement("span");
        return e.innerText = this.text, this.effects.apply(e), e
    }
}

class k {
    static HEADER_LEVEL_TO_ELEMENT = ["h1", "h2", "h3", "h4", "h5", "h6"];
    isBold;
    isItalic;
    isUnderline;
    isStrikethrough;
    myHeaderLevel;

    constructor(e) {
        this.isBold = e.bold ?? !1, this.isItalic = e.italic ?? !1, this.isUnderline = e.underline ?? !1, this.isStrikethrough = e.strikethrough ?? !1, this.myHeaderLevel = e.headerLevel ?? 3
    }

    static none() {
        return new k({})
    }

    static bold() {
        return new k({bold: !0})
    }

    static italic() {
        return new k({italic: !0})
    }

    static underline() {
        return new k({underline: !0})
    }

    static strikethrough() {
        return new k({strikethrough: !0})
    }

    static h1() {
        return new k({headerLevel: 1})
    }

    static h2() {
        return new k({headerLevel: 2})
    }

    static h3() {
        return new k({headerLevel: 3})
    }

    static h4() {
        return new k({headerLevel: 4})
    }

    static h5() {
        return new k({headerLevel: 5})
    }

    static h6() {
        return new k({headerLevel: 6})
    }

    bold() {
        return this.isBold = !0, this
    }

    italic() {
        return this.isItalic = !0, this
    }

    underline() {
        return this.isUnderline = !0, this
    }

    strikethrough() {
        return this.isStrikethrough = !0, this
    }

    headerLevel(e) {
        return this.myHeaderLevel = e, this
    }

    h1() {
        return this.myHeaderLevel = 1, this
    }

    h2() {
        return this.myHeaderLevel = 2, this
    }

    h3() {
        return this.myHeaderLevel = 3, this
    }

    h4() {
        return this.myHeaderLevel = 4, this
    }

    h5() {
        return this.myHeaderLevel = 5, this
    }

    h6() {
        return this.myHeaderLevel = 6, this
    }

    apply(e) {
        this.isBold && (e.style.fontWeight = "bold"), this.isItalic && (e.style.fontStyle = "italic"), this.isUnderline && (e.style.textDecoration = "underline"), this.isStrikethrough && (e.style.textDecoration = "line-through"), e.classList.add(k.HEADER_LEVEL_TO_ELEMENT[this.myHeaderLevel - 1])
    }
}

class ct {
    static parse(e) {
        return new ht([new ut(e, k.none())])
    }
}

class dt {
    id;
    element;
    className = "js-error-marker";
    content;
    msg;
    range;

    constructor(e, t, i, s) {
        this.id = B.getComponentId("inline-error"), this.range = e, this.className += " " + t, this.content = i, this.msg = s;
        let n = e.end - e.begin - this.content.length;
        n > 0 && (this.content += " ".repeat(n))
    }

    onDestroy(e) {
    }

    onRender(e, t) {
        this.element = t, t.addEventListener("mouseover", i => {
            setTimeout(() => {
                c.isInBound(this.element, i.x, i.y, 2) && e.openPopup(i.x, i.y, B.getPopup(this))
            }, 800)
        }), t.addEventListener("click", () => {
        })
    }

    createPopup() {
        return new lt(this, ct.parse(this.msg))
    }
}

class se extends ee {
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
    defaultLexer = new Ge;
    defaultHighlighter;
    renderingProcess;

    constructor(e, t) {
        super(), this.id = se.ID++, this.properties = t || {}, this.file = this.properties.file || new Ne("temp", "", "js"), e && e.addFile(this.file), this.project = e || He.singleFileProject(this.file), this.eventsManager = new Te, this.eventsManager.addVisualEventListener(this), this.data = new Ve(this, this.file.read()), this.data.setLanguage(this.file.type), this.view = new Ie(this), this.offsetManager = new je(this.data), this.caretModel = new qe(this), this.actions = new nt(this), this.plugins = new De(this), this.renderingProcess = setInterval(() => {
            w.with(this, () => {
                this.view.render()
            })
        }, 20)
    }

    get lang() {
        return this.data.language
    }

    attach(e) {
        w.with(this, () => {
            this.data.srTree = new Xe(this.getParserForFileType(this.data.language), this.getLexerForFileType(this.data.language).asTokenStream(this.data.text)), this.root = c.createElement("div.editor", e), this.view.onAttached(this, this.root), this.fire("onAttached", this.root)
        })
    }

    fire(e, ...t) {
        w.with(this, () => this.eventsManager.fire(e, this, ...t))
    }

    fireLangEvent(e, ...t) {
        w.with(this, () => this.eventsManager.fireLangEvent(this.lang, e, this, ...t))
    }

    fireKeybinding(e) {
        w.with(this, () => this.eventsManager.fireKeybinding(e, this))
    }

    fireMouseKeybinding(e) {
        w.with(this, () => this.eventsManager.fireMouseKeybinding(e, this))
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

    addLangEventListener(e, t) {
        this.eventsManager.addLangEventListener(e, t)
    }

    removeVisualEventListener(e) {
        this.eventsManager.removeVisualEventListener(e)
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
        return this.offsetManager.calculateOffset(this.offsetManager.absoluteToLogical(new T(e, t)))
    }

    offsetToAbsolute(e) {
        return this.offsetManager.logicalToAbsolute(this.offsetToLogical(e))
    }

    calculateOffset(e) {
        return this.offsetManager.calculateOffset(e)
    }

    visualToNearestLogical(e, t) {
        const i = this.view.getCharSize(), s = this.view.getLineHeight(),
            n = this.view.scroll.scrollXOffset === 0 ? this.view.scroll.scrollXChars : this.view.scroll.scrollXChars - 1,
            l = this.view.scroll.scrollYOffset === 0 ? this.view.scroll.scrollYLines : this.view.scroll.scrollYLines - 1,
            u = Math.round((e + this.view.scroll.scrollXOffset) / i) + n,
            d = Math.floor((t + this.view.scroll.scrollYOffset) / s) + l;
        return new T(u, d)
    }

    logicalToVisual(e) {
        const t = this.view.getCharSize(), i = this.view.getLineHeight(),
            s = this.view.scroll.scrollYOffset === 0 ? this.view.scroll.scrollYLines : this.view.scroll.scrollYLines - 1,
            n = (e.x - this.view.scroll.scrollXChars) * t - this.view.scroll.scrollXOffset,
            l = (e.y - s) * i - this.view.scroll.scrollYOffset;
        return new T(n, l)
    }

    createLogical(e, t) {
        return y.fromLogical(this, e, t)
    }

    createAbsolutePosition(e, t) {
        return y.fromAbsolute(this, e, t)
    }

    createPositionFromOffset(e) {
        return y.fromOffset(this, e)
    }

    createVisualPosition(e, t) {
        return y.fromVisual(this, e, t)
    }

    getFullRange() {
        return new h(0, this.data.raw.length())
    }

    isValidOffset(e) {
        return e >= 0 && e <= this.data.raw.length()
    }

    moveCursorToMouseEvent(e) {
        let [t, i] = this.view.getRelativePos(e), s = this.visualToNearestLogical(t, i);
        s.y < 0 ? s.y = 0 : s.y >= this.getLineCount() && (s.y = this.getLineCount() - 1), s.x = Math.max(0, Math.min(s.x, this.getLineLength(s.y))), this.caretModel.primary.moveToLogical(s), this.view.resetBlink()
    }

    type(e) {
        w.with(this, () => {
            this.caretModel.forEachCaret(t => {
                t.selectionModel.isSelectionActive && this.deleteSelection(t), this.insertText(t.position.toOffset(), e), t.shift(), this.view.resetBlink()
            })
        })
    }

    insertText(e, t) {
        this.data.raw.insert(e, t), this.offsetManager.offset(e, t.length), this.offsetManager.recomputeNewLines(e, t);
        let i = this.getCurrentLexer(), s = this.getCurrentHighlighter(), n = this.data.withContext(e);
        n.scope.clear();
        let l = i.asTokenStream(n.text), u = this.parse(n.scope, l).children;
        this.data.srTree.patch(n.containingNode, u);
        let d = s.highlight(l);
        this.data.setComponentsAtRange(n.scope.range, d), this.fireLangEvent("onSrLoaded", n, u, l), this.view.triggerRepaint()
    }

    deleteAt(e, t = 1) {
        if (e < 0 || e >= this.data.raw.length()) return;
        let i = this.data.raw.delete(e, t);
        this.offsetManager.recomputeNewLines(e, i, !0), this.offsetManager.offset(e, -t);
        let s = this.getCurrentLexer(), n = this.getCurrentHighlighter(), l = this.data.withContext(e);
        l.scope.clear();
        let u = s.asTokenStream(l.text), d = this.parse(l.scope, u).children;
        this.data.srTree.patch(l.containingNode, d), this.data.setComponentsAtRange(l.scope.range, n.highlight(u.clone())), this.fireLangEvent("onSrLoaded", l, d, u), this.view.triggerRepaint()
    }

    deleteSelection(e) {
        let t = e.selectionModel;
        if (!t.isSelectionActive) return;
        let i = t.getStart().toOffset(), s = t.getEnd().toOffset();
        this.deleteAt(i, s - i), e.moveToLogical(y.fromOffset(this, i))
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
        return (e + 1 < this.offsetManager.lineBreaks.length ? this.offsetManager.lineBreaks[e + 1] - 1 : this.data.raw.length()) - t
    }

    getWordAt(e, t = /\s/) {
        return this.data.getWordAt(e, t, this.offsetManager)
    }

    addErrorAt(e, t, i, s) {
        this.data.registerError(new dt(e, t, i, s))
    }

    openPopup(e, t, i) {
        i.isRendered || this.view.addPopup(i), i.isShown || this.view.showPopup(i, e, t)
    }

    onKeyUp(e, t) {
        E.getInstance().set(t)
    }

    onKeyDown(e, t) {
        if (t.key === v.ENTER) return E.getInstance().clear(), this.type(`
`);
        E.getInstance().set(t), this.fireKeybinding(t)
    }

    onMouseDown(e, t) {
        E.getInstance().set(t), this.caretModel.removeAll(), this.moveCursorToMouseEvent(t), this.fireMouseKeybinding(t)
    }

    onMouseUp(e, t) {
        E.getInstance().set(t), E.getInstance().setIsDragging(!1), E.getInstance().isMouseDown = !1
    }

    onMouseMove(e, t) {
        E.isMouseDown && (E.getInstance().setIsDragging(!0), this.moveCursorToMouseEvent(t))
    }

    onInput(e, t) {
        E.getInstance().clear(), t.data && this.type(t.data)
    }

    perfCheckBegin() {
        let e = performance.now();
        this.perfCheckRunning = !0;
        let t = () => this.perfCheckRunning;
        requestAnimationFrame(function i(s) {
            let l = 1e3 / (s - e);
            console.log(`FPS: ${l.toFixed(2)}`), e = s, t() && requestAnimationFrame(i)
        })
    }

    perfCheckEnd() {
        this.perfCheckRunning = !1
    }

    pauseRender() {
        clearInterval(this.renderingProcess)
    }

    resumeRender() {
        this.renderingProcess = setInterval(() => {
            w.with(this, () => {
                this.view.render()
            })
        }, 20)
    }
}

var o = (r => (r.Keyword = "Keyword", r.Identifier = "Identifier", r.Number = "Number", r.String = "String", r.Punctuation = "Punctuation", r.LPAREN = "LeftParen", r.RPAREN = "RightParen", r.LBRACE = "LeftBrace", r.RBrace = "RightBrace", r.LBRACKET = "LeftBracket", r.RBRACKET = "RightBracket", r.Operator = "Operator", r.UnOperator = "UnOperator", r.IncrDecrOp = "IncrDecrOp", r.Equals = "Equals", r.EqualOp = "EqualOp", r.CompareOp = "CompareOp", r.Arrow = "Arrow", r.EOL = "EOL", r.EOF = "EOF", r.SyntaxError = "SyntaxError", r))(o || {});

class q {
    static KEYWORDS = ["var", "let", "const", "if", "else", "switch", "case", "default", "for", "while", "do", "break", "continue", "return", "try", "catch", "finally", "throw", "function", "class", "extends", "super", "this", "new", "await", "async", "yield", "yield*", "in", "instanceof", "delete", "typeof", "void", "debugger", "import", "export", "abstract", "arguments", "boolean", "byte", "char", "double", "enum", "final", "float", "goto", "implements", "int", "interface", "long", "native", "package", "private", "protected", "public", "short", "static", "synchronized", "throws", "transient", "volatile"];

    asTokenStream(e) {
        return new j(this, e)
    }

    tokenize(e) {
        if (e.followupError) return e.clearError();
        for (; ;) {
            if (e.isEmpty()) return new p("EOF", "", new h(e.index, e.index + 1));
            let t = e.consume();
            if (t === `
`) return new p("EOL", `
`, h.around(e.index - 1), !0);
            if (t !== " ") if (t >= "0" && t <= "9") {
                let i = t;
                for (; !e.isEmpty() && e.seek() >= "0" && e.seek() <= "9";) i += e.consume();
                return new p("Number", i, new h(e.index - i.length, e.index))
            } else if (this.isAlphanumeric(t)) {
                let i = t;
                for (; !e.isEmpty() && (this.isAlphanumeric(e.seek()) || e.seek() >= "0" && e.seek() <= "9");) i += e.consume();
                return q.KEYWORDS.includes(i) ? new p("Keyword", i, new h(e.index - i.length, e.index)) : new p("Identifier", i, new h(e.index - i.length, e.index))
            } else {
                if (t === "(") return new p("LeftParen", "(", h.around(e.index - 1));
                if (t === ")") return new p("RightParen", ")", h.around(e.index - 1));
                if (t === "{") return new p("LeftBrace", "{", h.around(e.index - 1));
                if (t === "}") return new p("RightBrace", "}", h.around(e.index - 1));
                if (t === "[") return new p("LeftBracket", "[", h.around(e.index - 1));
                if (t === "]") return new p("RightBracket", "]", h.around(e.index - 1));
                if (t === ".") return e.seek() === "." && e.seekNext() === "." ? (e.consume(), e.consume(), new p("Punctuation", "...", new h(e.index - 3, e.index))) : new p("Punctuation", ".", h.around(e.index - 1));
                if (t === "," || t === ";" || t === ":") return new p("Punctuation", t, h.around(e.index - 1));
                if (t === "=") return e.seek() === "=" ? (e.consume(), e.seek() === "=" ? (e.consume(), new p("CompareOp", "===", new h(e.index - 3, e.index))) : new p("CompareOp", "==", new h(e.index - 2, e.index))) : e.seek() === ">" ? (e.consume(), new p("Arrow", "=>", new h(e.index - 2, e.index))) : new p("Equals", "=", h.around(e.index - 1));
                if (t == "+" || t === "-" || t === "*" || t === "/") return e.seek() === "=" ? (e.consume(), new p("EqualOp", t + "=", new h(e.index - 2, e.index))) : t === e.seek() ? (e.consume(), t === "+" || t === "-" ? new p("IncrDecrOp", t + t, new h(e.index - 2, e.index)) : new p("Operator", t + t, h.around(e.index - 2))) : new p("Operator", t, h.around(e.index - 1));
                if (t === ">" || t === "<") return e.seek() === "=" ? (e.consume(), new p("CompareOp", t + "=", new h(e.index - 2, e.index))) : e.seek() === t ? (e.consume(), t === ">" && e.seek() === ">" ? (e.consume(), new p("Operator", ">>>", new h(e.index - 3, e.index))) : new p("Operator", t + t, new h(e.index - 2, e.index))) : new p("CompareOp", t, h.around(e.index - 1));
                if (t === "|" || t === "&" || t === "?" || t === "^") return e.seek() === "=" ? new p("EqualOp", t + "=", h.around(e.index - 2)) : e.seek() === t && t !== "^" ? (e.consume(), new p("Operator", t + t, new h(e.index - 2, e.index))) : t !== "?" ? new p("Operator", t, h.around(e.index - 1)) : new p("Punctuation", "?", h.around(e.index - 1));
                if (t === "!" || t === "~") return new p("UnOperator", t, h.around(e.index - 1));
                if (t === "'" || t === '"') {
                    let i = t;
                    for (; !e.isEmpty() && e.seek() !== t && e.seek() !== `
`;) i += e.consume();
                    return e.seek() === t ? (i += e.consume(), new p("String", i, new h(e.index - i.length, e.index))) : (e.followupError = new I("SyntaxError", i[i.length - 1], "Unterminated string literal", h.around(e.index - 1)), new p("String", i, new h(e.index - i.length, e.index)))
                } else return new I("SyntaxError", t, "Unexpected char: " + t, h.around(e.index - 1))
            }
        }
    }

    isAlphanumeric(e) {
        return e >= "a" && e <= "z" || e >= "A" && e <= "Z" || e === "_" || e === "$"
    }
}

class f {
    id;
    range;
    element = null;
    className;
    content;

    constructor(e, t) {
        this.id = B.getComponentId("highlighted-token"), this.content = e.value, this.range = e.range.clone(), this.className = "editor-ht " + t
    }

    onDestroy(e) {
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

    onRender(e, t) {
    }
}

class pt {
    * highlight(e) {
        for (; !e.isEmpty();) {
            const t = e.consume();
            if (t) {
                const i = this._impl[`visit${t.type}`];
                let s = i(t);
                s && (yield s)
            }
        }
    }
}

class gt extends pt {
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

class ve {
    static indent(e, t = 4) {
        const i = " ".repeat(t);
        return e.split(`
`).map(s => i + s).join(`
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

class W {
    static precedenceMap = {"**": 15, "*": 14, "/": 14, "+": 13, "-": 13, "<<": 12, ">>": 12, ">>>": 12};

    static isRightAssociative(e) {
        return e === "**"
    }

    static getPrecedence(e) {
        return W.precedenceMap[e]
    }
}

var C = (r => (r.CodeBlock = "CodeBlock", r.Stmt = "Stmt", r.DeclStmt = "DeclStmt", r.Body = "Body", r.Parameters = "Parameters", r.Param = "Param", r.FuncDeclStmt = "FuncDeclStmt", r.ReturnStmt = "ReturnStmt", r.Expr = "Expr", r.ExprGroup = "ExprGroup", r.ExprCommaExpr = "ExprCommaExpr", r.NumberLiteral = "NumberLiteral", r.StringLiteral = "StringLiteral", r.Args = "Args", r.Identifier = "Identifier", r.SpecialIdentifier = "SpecialIdentifier", r.MemberAccess = "MemberAccess", r.AssignExpr = "AssignExpr", r.UnaryExpr = "UnaryExpr", r.BinaryExpr = "BinaryExpr", r.TernaryExpr = "TernaryExpr", r.CallExpr = "CallExpr", r.NewExpr = "NewExpr", r.ArrayAccess = "ArrayAccess", r.ArrayLiteral = "ArrayLiteral", r.ObjectLiteral = "ObjectLiteral", r.ObjectLiteralProperty = "ObjectLiteralProperty", r.ObjectLiteralPropertyFunction = "ObjectLiteralPropertyFunction", r.Lambda = "Lambda", r))(C || {});

class S {
    declares = [];
    range;
    language = "js";
    parent = null;

    constructor() {
        for (let e of this.getAllNodeChildren()) e.parent = this
    }

    getAllNodeChildren() {
        const e = [];
        for (let t in this) this[t] instanceof S && e.push(this[t]);
        return e
    }

    getNodeContent() {
        const e = [];
        for (let t of this.declares) {
            let i = this[t];
            (i instanceof p || i instanceof S) && e.push(i)
        }
        return e
    }
}

class he extends S {
    range;
    children;
    nodeType = "CodeBlock";

    constructor(e) {
        super(), this.children = e, this.range = h.of(e)
    }

    toHumanReadableString() {
        let e = "";
        for (const t of this.children) e += t.toHumanReadableString() + `
`;
        return `{
` + ve.indent(e.substring(0, e.length - 1)) + `
}`
    }

    isWellFormed() {
        return this.children.every(e => e.isWellFormed())
    }

    getNodeContent() {
        return this.children
    }
}

class re extends S {
    range;
    nodeType = "Stmt";

    constructor(e) {
        super(), this.range = e
    }
}

class z extends re {
    declares = ["kind", "name", "eq", "decl"];
    kind;
    name;
    eq;
    decl;
    nodeType = "DeclStmt";

    constructor(e, t, i, s) {
        super(h.of(e, s || t)), this.kind = e, this.name = t, this.eq = i, this.decl = s
    }

    isWellFormed() {
        return this.kind && this.name && a.isValidToken(this.kind) && a.isValidToken(this.name) && (!this.eq || a.isValidToken(this.eq)) && (!this.decl || this.decl.isWellFormed())
    }

    toHumanReadableString() {
        let e = a.tokenToHumanReadableString(this.kind);
        return e += " " + a.tokenToHumanReadableString(this.name) + " = ", e += a.toHumanReadableString(this.decl), e + ";"
    }
}

class G extends re {
    declares = ["keyword", "expr"];
    keyword;
    expr;
    nodeType = "ReturnStmt";

    constructor(e, t) {
        super(h.of([e, t])), this.keyword = e, this.expr = t
    }

    isWellFormed() {
        return a.isValidToken(this.keyword) && (!this.expr || this.expr.isWellFormed())
    }

    toHumanReadableString() {
        return "return " + a.toHumanReadableString(this.expr) + ";"
    }
}

class X extends S {
    declares = ["openBrace", "body", "closeBrace"];
    openBrace;
    body;
    closeBrace;
    nodeType = "Body";

    constructor(e, t, i) {
        super(), this.range = h.of([e, t, i]), this.openBrace = e, this.body = t, this.closeBrace = i
    }

    isWellFormed() {
        return (!this.openBrace || a.isValidToken(this.openBrace)) && this.body.isWellFormed() && (!this.closeBrace || a.isValidToken(this.closeBrace))
    }

    toHumanReadableString() {
        return a.toHumanReadableString(this.body)
    }
}

class _ extends S {
    declares = [];
    params;
    commas = [];
    nodeType = "Parameters";

    constructor(e, t = []) {
        super(), this.range = h.of(e), this.params = e, this.commas = t
    }

    toHumanReadableString() {
        return this.params.map(e => a.toHumanReadableString(e)).join(", ")
    }

    isWellFormed() {
        return this.params.every(e => e.isWellFormed())
    }

    getNodeContent() {
        let e = [];
        for (let t = 0; t < this.params.length; t++) e.push(this.params[t]), t < this.commas.length && e.push(this.commas[t]);
        return e
    }
}

class L extends S {
    declares = ["restToken", "name", "eqSign", "defaultValue"];
    restToken;
    name;
    eqSign;
    defaultValue;
    nodeType = "Param";

    constructor(e, t, i, s) {
        super(), this.name = e, this.restToken = t, this.eqSign = i, this.defaultValue = s, this.range = s ? h.of(t || e, s) : h.of(t || e, i || e)
    }

    isWellFormed() {
        return a.isValidToken(this.name) && (!this.restToken || a.isValidToken(this.restToken)) && (!this.eqSign || a.isValidToken(this.eqSign)) && (!this.defaultValue || this.defaultValue.isWellFormed())
    }

    toHumanReadableString() {
        let e = this.restToken ? "..." : "";
        return e += a.tokenToHumanReadableString(this.name), this.eqSign && (e += "=", e += a.toHumanReadableString(this.defaultValue)), e
    }
}

class D extends re {
    declares = ["keyword", "name", "openParen", "params", "closeParen", "body"];
    keyword;
    name;
    openParen;
    params;
    closeParen;
    body;
    nodeType = "FuncDeclStmt";

    constructor(e, t, i, s, n, l) {
        super(h.of([e, t, i, s, n, l])), this.keyword = e, this.name = t, this.openParen = i, this.params = s, this.closeParen = n, this.body = l
    }

    isWellFormed() {
        return a.isValidToken(this.keyword) && (!this.name || a.isValidToken(this.name)) && a.isValidToken(this.openParen) && a.isValidToken(this.closeParen) && this.params.isWellFormed() && this.body.isWellFormed()
    }

    toHumanReadableString() {
        let e = a.tokenToHumanReadableString(this.keyword);
        return this.name && (e += " " + a.tokenToHumanReadableString(this.name)), e += "(" + a.toHumanReadableString(this.params) + ")", e + " " + a.toHumanReadableString(this.body)
    }
}

class m extends S {
    declares = ["error"];
    error;
    nodeType = "Expr";

    constructor(e = null) {
        super(), this.error = e, e && (this.range = h.of(e))
    }

    toHumanReadableString() {
        return a.tokenToHumanReadableString(this.error)
    }

    isWellFormed() {
        return !this.error
    }
}

class ft extends m {
    values;
    commas;
    nodeType = "ExprCommaExpr";

    constructor(e, t) {
        super(), this.values = e, this.commas = t, this.range = h.of(e)
    }

    toHumanReadableString() {
        return this.values.map(e => a.toHumanReadableString(e)).join(", ")
    }

    isWellFormed() {
        return this.values.every(e => e.isWellFormed())
    }

    getNodeContent() {
        let e = [];
        for (let t = 0; t < this.values.length; t++) e.push(this.values[t]), t < this.commas.length && e.push(this.commas[t]);
        return e
    }
}

class mt extends m {
    declares = ["value"];
    value;
    nodeType = "NumberLiteral";

    constructor(e) {
        super(), this.range = h.of(e), this.value = e
    }

    toHumanReadableString() {
        return a.tokenToHumanReadableString(this.value)
    }

    isWellFormed() {
        return a.isValidToken(this.value)
    }
}

class wt extends m {
    declares = ["value"];
    value;
    nodeType = "StringLiteral";

    constructor(e) {
        super(), this.range = h.of(e), this.value = e
    }

    toHumanReadableString() {
        return a.tokenToHumanReadableString(this.value)
    }

    isWellFormed() {
        return a.isValidToken(this.value)
    }
}

class ue extends m {
    openBracket;
    values;
    closeBracket;
    commas;
    nodeType = "ArrayLiteral";

    constructor(e, t, i, s) {
        super(), this.openBracket = e, this.values = t, this.closeBracket = i, this.commas = s, this.range = h.of([e, ...t, i])
    }

    toHumanReadableString() {
        return "[" + this.values.map(e => a.toHumanReadableString(e)).join(", ") + "]"
    }

    isWellFormed() {
        return a.isValidToken(this.openBracket) && this.values.every(e => e.isWellFormed()) && a.isValidToken(this.closeBracket)
    }

    getNodeContent() {
        let e = [];
        e.push(this.openBracket);
        for (let t = 0; t < this.values.length; t++) e.push(this.values[t]), t < this.commas.length && e.push(this.commas[t]);
        return this.closeBracket && e.push(this.closeBracket), e
    }
}

class O extends S {
    declares = ["key", "colon", "value"];
    key;
    colon;
    value;
    nodeType = "ObjectLiteralProperty";

    constructor(e, t, i) {
        super(), this.key = e, this.colon = t, this.value = i, this.range = h.of([e, t, i])
    }

    isWellFormed() {
        return a.isValidToken(this.key) && (!this.colon || a.isValidToken(this.colon)) && (!this.value || this.value.isWellFormed())
    }

    toHumanReadableString() {
        let e = this.key.value;
        return (this.colon && !this.colon.isError || this.value) && (e += ": "), this.value ? e += this.value.toHumanReadableString() : e += "#undef", e
    }
}

class vt extends O {
    declares = ["func"];
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

class ce extends m {
    openBrace;
    properties;
    closeBrace;
    commas;
    nodeType = "ObjectLiteral";

    constructor(e, t, i, s) {
        super(), this.openBrace = e, this.properties = t, this.closeBrace = i, this.commas = s, this.range = h.of([e, ...t, i])
    }

    isWellFormed() {
        return a.isValidToken(this.openBrace) && this.properties.every(e => e.isWellFormed()) && (!this.closeBrace || a.isValidToken(this.closeBrace))
    }

    toHumanReadableString() {
        if (this.properties.length <= 2 && !this.properties.some(e => e.nodeType === "ObjectLiteralPropertyFunction")) return "{ " + this.properties.map(e => e.toHumanReadableString()).join(", ") + " }";
        {
            let e = `{
`;
            for (const t of this.properties) e += ve.indent(t.toHumanReadableString()) + `,
`;
            return e += "}", e
        }
    }

    getNodeContent() {
        let e = [];
        e.push(this.openBrace);
        for (let t = 0; t < this.properties.length; t++) e.push(this.properties[t]), t < this.commas.length && e.push(this.commas[t]);
        return this.closeBrace && e.push(this.closeBrace), e
    }
}

class Z extends m {
    declares = ["token"];
    token;
    nodeType = "Identifier";

    constructor(e) {
        super(), this.token = e, this.range = h.of(e)
    }

    isWellFormed() {
        return a.isValidToken(this.token)
    }

    toHumanReadableString() {
        return a.tokenToHumanReadableString(this.token)
    }
}

class Et extends Z {
    nodeType = "SpecialIdentifier";

    constructor(e) {
        super(e)
    }
}

class yt extends m {
    declares = ["base", "dot", "member"];
    base;
    dot;
    member;
    nodeType = "MemberAccess";

    constructor(e, t, i) {
        super(), this.base = e, this.dot = t, this.member = i, this.range = h.of(e, i)
    }

    isWellFormed() {
        return this.base.isWellFormed() && a.isValidToken(this.dot) && this.member.isWellFormed()
    }

    toHumanReadableString() {
        return a.toHumanReadableString(this.base) + "." + a.toHumanReadableString(this.member)
    }
}

class kt extends m {
    declares = ["left", "operator", "right"];
    left;
    operator;
    right;
    nodeType = "AssignExpr";

    constructor(e, t, i) {
        super(), this.left = e, this.operator = t, this.right = i, this.range = h.of(e, i || t)
    }

    isWellFormed() {
        return this.left.isWellFormed() && a.isValidToken(this.operator) && (!this.right || this.right.isWellFormed())
    }

    toHumanReadableString() {
        return "(" + a.toHumanReadableString(this.left) + " = " + a.toHumanReadableString(this.right) + ")"
    }
}

class $ extends m {
    declares = ["operator", "operand"];
    operator;
    operand;
    nodeType = "UnaryExpr";

    constructor(e, t) {
        super(), this.operator = e, this.operand = t, this.range = h.of(e, t)
    }

    isWellFormed() {
        return a.isValidToken(this.operator) && this.operand.isWellFormed()
    }

    toHumanReadableString() {
        return "(" + a.tokenToHumanReadableString(this.operator) + a.toHumanReadableString(this.operand) + ")"
    }
}

class R extends m {
    declares = ["left", "operator", "right"];
    left;
    operator;
    right;
    nodeType = "BinaryExpr";

    constructor(e, t, i) {
        super(), this.left = e, this.operator = t, this.right = i, this.range = h.of(e, i)
    }

    isWellFormed() {
        return this.left.isWellFormed() && a.isValidToken(this.operator) && this.right.isWellFormed()
    }

    toHumanReadableString() {
        return "(" + a.toHumanReadableString(this.left) + " " + a.tokenToHumanReadableString(this.operator) + " " + a.toHumanReadableString(this.right) + ")"
    }
}

class de extends m {
    declares = ["condition", "questionMark", "trueExpr", "colon", "falseExpr"];
    condition;
    questionMark;
    trueExpr;
    colon;
    falseExpr;
    nodeType = "TernaryExpr";

    constructor(e, t, i, s, n) {
        super(), this.condition = e, this.questionMark = t, this.trueExpr = i, this.colon = s, this.falseExpr = n, this.range = h.of(e, n || s)
    }

    isWellFormed() {
        return this.condition.isWellFormed() && a.isValidToken(this.questionMark) && this.trueExpr.isWellFormed() && a.isValidToken(this.colon) && (!this.falseExpr || this.falseExpr.isWellFormed())
    }

    toHumanReadableString() {
        return a.toHumanReadableString(this.condition) + " ? (" + a.toHumanReadableString(this.trueExpr) + ") : (" + a.toHumanReadableString(this.falseExpr) + ")"
    }
}

class J extends m {
    declares = ["callee", "openParen", "args", "closeParen"];
    callee;
    openParen;
    args;
    closeParen;
    nodeType = "CallExpr";

    constructor(e, t, i, s) {
        super(), this.callee = e, this.openParen = t, this.args = i, this.closeParen = s, this.range = h.of([e, t, i, s])
    }

    isWellFormed() {
        return this.callee.isWellFormed() && a.isValidToken(this.openParen) && a.isValidToken(this.closeParen) && this.args.isWellFormed()
    }

    toHumanReadableString() {
        return a.toHumanReadableString(this.callee) + "(" + a.toHumanReadableString(this.args) + ")"
    }
}

class pe extends m {
    declares = ["base", "openBracket", "index", "closeBracket"];
    base;
    openBracket;
    index;
    closeBracket;
    nodeType = "ArrayAccess";

    constructor(e, t, i, s) {
        super(), this.base = e, this.openBracket = t, this.index = i, this.closeBracket = s, this.range = h.of([e, t, i, s])
    }

    isWellFormed() {
        return this.base.isWellFormed() && a.isValidToken(this.openBracket) && this.index.isWellFormed() && a.isValidToken(this.closeBracket)
    }

    toHumanReadableString() {
        return a.toHumanReadableString(this.base) + "[" + a.toHumanReadableString(this.index) + "]"
    }
}

class K extends J {
    declares = ["keyword", "callee", "openParen", "args", "closeParen"];
    keyword;
    nodeType = "NewExpr";

    constructor(e, t, i, s, n) {
        super(t, i, s, n), this.keyword = e, this.range.begin = e.range.begin
    }

    isWellFormed() {
        return a.isValidToken(this.keyword) && this.callee.isWellFormed() && a.isValidToken(this.openParen) && this.args.isWellFormed() && a.isValidToken(this.closeParen)
    }

    toHumanReadableString() {
        return "new " + a.toHumanReadableString(this.callee) + "(" + a.toHumanReadableString(this.args) + ")"
    }
}

class xt extends m {
    declares = ["values", "comma"];
    values;
    comma;
    nodeType = "Args";

    constructor(e, t) {
        super(), this.values = e, this.comma = t, this.range = h.of(e)
    }

    isWellFormed() {
        return this.values.every(e => e.isWellFormed())
    }

    toHumanReadableString() {
        return this.values.map(e => a.toHumanReadableString(e)).join(", ")
    }
}

class Q extends m {
    declares = ["params", "arrow", "body"];
    params;
    arrow;
    body;
    nodeType = "Lambda";

    constructor(e, t, i) {
        super(), this.params = e, this.arrow = t, this.body = i, this.range = h.of(e, i || t)
    }

    isWellFormed() {
        return this.params.isWellFormed() && a.isValidToken(this.arrow) && this.body.isWellFormed()
    }

    toHumanReadableString() {
        let e = "((";
        return this.params && (e += a.toHumanReadableString(this.params)), e += ") => ", e += a.toHumanReadableString(this.body) + ")", e
    }
}

class ge extends m {
    declares = ["openParen", "expr", "closeParen"];
    openParen;
    expr;
    closeParen;
    nodeType = "ExprGroup";

    constructor(e, t, i) {
        super(), this.expr = t, this.openParen = e, this.closeParen = i, this.range = h.of(e, i || t)
    }

    isWellFormed() {
        return a.isValidToken(this.openParen) && this.expr.isWellFormed() && a.isValidToken(this.closeParen)
    }

    toHumanReadableString() {
        return "(" + a.toHumanReadableString(this.expr) + ")"
    }
}

class Lt {
    globalScope = new bt(this);

    constructor() {
    }

    toplevel() {
        return this.globalScope
    }

    fullRange() {
        return w.Instance.getFullRange()
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
                const s = this.recursiveGetScopeAt(i, t);
                if (s) return s.isVirtual() ? s.parent : s
            }
            return e
        }
        return null
    }
}

class St {
    decl;
    loc;
    scope;
    scopeKind;

    constructor(e, t) {
        this.decl = e, this.loc = e.range, this.scope = t, this.scopeKind = t.kind
    }
}

class ne {
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
        return new At(this)
    }

    newFuncScope() {
        return new Ct(this)
    }

    pop() {
        return this.parent ? this.parent : this
    }

    declare(e, t) {
        if (this.isVirtual()) {
            this.parent.declare(e, t);
            return
        }
        this.declarations.set(e, new St(t, this))
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

class bt extends ne {
    kind = "global";

    constructor(e) {
        super(null), this.manager = e, this.range = e.fullRange()
    }
}

class Ct extends ne {
    kind = "function";
    func
}

class At extends ne {
    kind = "block";
    block
}

class Rt {
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
            if (i.type === o.EOF || i.type === o.RBrace) break;
            e.push(this.parseStmt()), this.input.seek()?.type === o.Punctuation && this.input.seek()?.value === ";" && this.input.consume()
        }
        let t = new he(e);
        return this.scope.range = h.of(t), this.scope.block = t, this.scope = this.scope.pop(), t
    }

    eat(e) {
        let t = this.input.seek();
        return t && t.type === e ? (this.input.consume(), t) : null
    }

    reportErrorAfter(e, t, i) {
        return new I(t, " ", i, h.around(e.range.end))
    }

    reportErrorAt(e, t, i) {
        return new I(t, e.value, i, e.range)
    }

    reportErrorAtRange(e, t, i) {
        return new I(t, "", i, e.range.clone())
    }

    closeScope(e) {
        return e.body ? (this.scope.range = h.of(e.body), this.scope.func = e, this.scope = this.scope.pop(), e) : (this.scope = this.scope.pop(), e)
    }

    closeScopeAndDeclare(e) {
        let t = this.closeScope(e);
        return e.isWellFormed() && e.name && this.scope.declare(e.name.value, e), t
    }

    parseBody() {
        if (this.scope = this.scope.newFuncScope(), this.input.seek()?.type !== o.LBRACE) {
            let s = [new G(null, this.parseExpr())];
            return new X(null, new he(s), null)
        }
        let e = this.eat(o.LBRACE), t = this.parseBlock(), i = this.eat(o.RBrace);
        return i ? new X(e, t, i) : new X(e, t, this.reportErrorAt(this.input.seekPrevious(), o.SyntaxError, "'}' expected"))
    }

    parseStmt() {
        let e = this.input.seek();
        if (e.type == o.Keyword) {
            if (e.value === "let" || e.value === "const" || e.value === "var") return this.parseDeclStmt();
            if (e.value === "function") return this.parseFuncDecl();
            if (e.value === "return") return this.parseReturnStmt()
        }
        return this.parseExpr()
    }

    parseReturnStmt() {
        let e = this.eat(o.Keyword);
        return this.input.seek()?.type === o.Punctuation && this.input.seek()?.value === ";" || this.input.seek()?.type === o.EOF || this.input.seek()?.type === o.RBrace || this.input.seekIncludeSpecial()?.type === o.EOL ? new G(e, null) : new G(e, this.parseExpr())
    }

    parseDeclStmt() {
        let e = this.eat(o.Keyword), t = this.eat(o.Identifier);
        if (!t) return new z(e, this.reportErrorAfter(e, o.SyntaxError, "Expected identifier"));
        let i;
        if (this.input.seek()?.type === o.Equals) {
            let s = this.eat(o.Equals);
            i = new z(e, t, s, this.parseExpr_L0())
        } else i = new z(e, t);
        return this.scope.declare(t.value, i), i
    }

    parseFuncDecl(e = !1) {
        let t = this.eat(o.Keyword), i = this.eat(o.Identifier);
        if (!i && !e) return new D(t, this.reportErrorAfter(t, o.SyntaxError, "Function name expected"), null, null, null, null);
        let s = this.eat(o.LPAREN);
        if (!s) return new D(t, i, this.reportErrorAfter(i || t, o.SyntaxError, "'(' expected"), null, null, null);
        let n = this.parseParams(), l = this.eat(o.RPAREN);
        if (!l) return new D(t, i, s, n, this.reportErrorAfter(this.input.seekPrevious(), o.SyntaxError, "')' expected"), null);
        let u = this.parseBody();
        return this.closeScopeAndDeclare(new D(t, i, s, n, l, u))
    }

    parseParams() {
        let e = [], t = [];
        for (; !this.input.isEmpty() && this.input.seek().type != o.RPAREN && this.input.seek().type != o.EOF;) if (e.push(this.parseParam()), this.input.seek()?.type === o.Punctuation && this.input.seek()?.value === ",") t.push(this.eat(o.Punctuation)); else if (this.input.seek()?.type !== o.RPAREN) t.push(this.reportErrorAfter(this.input.seekPrevious(), o.SyntaxError, "Expected ',' or ')'")); else break;
        return new _(e, t)
    }

    parseParam() {
        let e = null;
        this.input.seek()?.type === o.Punctuation && this.input.seek()?.value === "..." && (e = this.eat(o.Punctuation));
        let t = this.eat(o.Identifier);
        if (t) if (this.input.seek()?.type === o.Equals) {
            if (e) return new L(t, e, this.reportErrorAt(this.input.consume(), o.SyntaxError, "Default value cannot be used with rest parameters"));
            let i = this.eat(o.Equals), s = this.parseExpr_L0();
            return new L(t, null, i, s)
        } else return new L(t, e); else return new L(this.reportErrorAfter(this.input.seekPrevious(), o.SyntaxError, "Parameter name expected"), e)
    }

    parseExpr() {
        let e = [this.parseExpr_L0()], t = [];
        for (; this.input.seek()?.type === o.Punctuation && this.input.seek()?.value === ",";) t.push(this.eat(o.Punctuation)), e.push(this.parseExpr_L0());
        return e.length === 1 ? e[0] : new ft(e, t)
    }

    parseExpr_L0() {
        let e = this.input.seek();
        if (!e) return new m(this.reportErrorAfter(this.input.seekPrevious(), o.SyntaxError, "Expression expected"));
        if (e.type === o.Punctuation && e.value === "..." || e.type === o.Keyword && e.value === "yield") {
            let i = this.input.consume(), s = this.parseExpr_L1();
            return new $(i, s)
        }
        if (this.input.seek()?.type === o.Identifier && this.input.seekN(1)?.type === o.Arrow) {
            let i = this.eat(o.Identifier), s = this.eat(o.Arrow), n = this.parseBody();
            return this.closeScope(new Q(new _([new L(i, null)]), s, n))
        } else if (this.input.seek()?.type === o.LPAREN && this.input.seekN(1)?.type === o.RPAREN && this.input.seekN(2)?.type === o.Arrow) {
            this.eat(o.LPAREN), this.eat(o.RPAREN);
            let i = this.eat(o.Arrow), s = this.parseBody();
            return this.closeScope(new Q(new _([], []), i, s))
        }
        let t = this.parseExpr_L1();
        if (t.nodeType === C.ExprGroup && this.input.seek()?.type === o.Arrow) {
            let i, s;
            if (t.expr.nodeType === C.ExprCommaExpr) {
                let d = t.expr;
                i = d.values, s = d.commas
            } else i = [t.expr], s = [];
            let n = this.eat(o.Arrow), l = this.parseBody(), u = [];
            for (let d = 0; d < i.length; d++) {
                let g = i[d];
                if (g.nodeType === C.UnaryExpr && g.operator.value === "...") {
                    let b = g.operator, H = g.operand;
                    H.nodeType !== C.Identifier ? u.push(new L(this.reportErrorAfter(b, o.SyntaxError, "Expected identifier"), b)) : u.push(new L(H.token, b))
                } else g.nodeType === C.AssignExpr ? u.push(new L(g.left.token, null, g.operator, g.right)) : g.nodeType !== C.Identifier ? u.push(new L(this.reportErrorAfter(s[d], o.SyntaxError, "Expected identifier"), null)) : u.push(new L(g.token, null))
            }
            return this.closeScope(new Q(new _(u, s), n, l))
        }
        if (this.input.seek()?.type === o.Punctuation && this.input.seek()?.value === "?") {
            let i = this.eat(o.Punctuation), s = this.parseExpr_L0();
            if (this.input.seek()?.type !== o.Punctuation || this.input.seek()?.value !== ":") return new de(t, i, s, this.reportErrorAfter(this.input.seekPrevious(), o.SyntaxError, "Expected ':' for ternary operator"), null);
            let n = this.eat(o.Punctuation), l = this.parseExpr_L0();
            return new de(t, i, s, n, l)
        }
        if (this.input.seek()?.type === o.EqualOp || this.input.seek()?.type === o.Equals) {
            let i = this.input.consume();
            return new kt(t, i, this.parseExpr())
        }
        return t
    }

    parseExpr_L1() {
        let e = this.parseExpr_L2(), t = this.input.seek();
        if (t?.type !== o.Operator) return e;
        if (t?.value === "??" || t?.value === "||") {
            let i = this.eat(o.Operator), s = this.parseExpr_L2();
            return new R(e, i, s)
        } else if (t?.value === "&&") {
            let i = this.eat(o.Operator), s = this.parseExpr_L2();
            return new R(e, i, s)
        } else if (t?.value === "|") {
            let i = this.eat(o.Operator), s = this.parseExpr_L2();
            return new R(e, i, s)
        } else if (t?.value === "^") {
            let i = this.eat(o.Operator), s = this.parseExpr_L2();
            return new R(e, i, s)
        } else if (t?.value === "&") {
            let i = this.eat(o.Operator), s = this.parseExpr_L2();
            return new R(e, i, s)
        } else return e
    }

    parseExpr_L2() {
        let e = this.parseExpr_L3(), t = this.input.seek();
        for (; t?.type === o.CompareOp || t?.type === o.Keyword;) {
            if (t.type === o.Keyword && t.value !== "in" && t.value !== "instanceof") return e;
            e = new R(e, this.input.consume(), this.parseExpr_L3()), t = this.input.seek()
        }
        return e
    }

    parseExpr_L3(e = 0) {
        let t = this.parseExpr_L4();
        for (; this.input.seek()?.type === o.Operator;) {
            let i = this.input.consume();
            if (W.getPrecedence(i.value) < e) break;
            let s = this.parseExpr_L3(W.isRightAssociative(i.value) ? e : e + 1);
            t = new R(t, i, s)
        }
        return t
    }

    parseExpr_L4() {
        let e = this.input.seek();
        if (e?.type === o.Keyword && e.value === "new") {
            this.eat(o.Keyword);
            let i = this.parseExpr_L5();
            if (this.input.seek()?.type === o.LPAREN) {
                let s = this.eat(o.LPAREN), n = this.parseArgs(), l = this.eat(o.RPAREN);
                return l ? new K(e, i, s, n, l) : new K(e, i, s, n, this.reportErrorAfter(this.input.seekPrevious(), o.SyntaxError, "')' expected"))
            }
            return new K(e, i, null, null, null)
        } else if (e?.type === o.UnOperator || e?.type === o.Keyword && ["typeof", "void", "delete", "await"].includes(e.value) || e?.type === o.Operator && (e.value === "+" || e.value === "-")) {
            let i = this.input.consume(), s = this.parseExpr_L4();
            return new $(i, s)
        } else if (e?.type === o.IncrDecrOp) {
            let i = this.input.consume(), s = this.parseExpr_L5();
            return new $(i, s)
        }
        let t = this.parseExpr_L5();
        for (; ;) if (this.input.seek()?.type === o.LPAREN) {
            let i = this.eat(o.LPAREN), s = this.parseArgs(), n = this.eat(o.RPAREN);
            if (!n) return new J(t, i, s, this.reportErrorAfter(this.input.seekPrevious(), o.SyntaxError, "')' expected"));
            t = this.parseExpr_L5(new J(t, i, s, n))
        } else if (this.input.seek()?.type === o.LBRACKET) {
            let i = this.eat(o.LBRACKET), s = this.parseExpr(), n = this.eat(o.RBRACKET);
            if (!n) return new pe(t, i, s, this.reportErrorAt(this.input.seekPrevious(), o.SyntaxError, "']' expected"));
            t = this.parseExpr_L5(new pe(t, i, s, n))
        } else return t
    }

    parseExpr_L5(e) {
        for (e = e || this.parseExpr_L6(); this.input.seek()?.type === o.Punctuation && this.input.seek()?.value === ".";) {
            let t = this.eat(o.Punctuation);
            e = new yt(e, t, this.parseExpr_L6())
        }
        return e
    }

    parseExpr_L6() {
        let e = this.input.seek();
        if (e?.type === o.Keyword) return e.value !== "this" && e.value !== "super" && e.value !== "null" && e.value !== "true" && e.value !== "false" ? new m(this.reportErrorAt(this.input.consume(), o.SyntaxError, "Unexpected keyword")) : new Et(this.input.consume());
        if (e?.type === o.LPAREN) {
            let t = this.eat(o.LPAREN), i = this.parseExpr(), s = this.eat(o.RPAREN);
            return s ? new ge(t, i, s) : new ge(t, i, this.reportErrorAt(this.input.seekPrevious(), o.SyntaxError, "')' expected"))
        } else {
            if (e?.type === o.Identifier) return new Z(this.input.consume());
            if (e?.type === o.Number) return new mt(this.input.consume());
            if (e?.type === o.String) return new wt(this.input.consume());
            if (e?.type === o.LBRACKET) {
                let t = this.eat(o.LBRACKET), i = [], s = [];
                for (; !this.input.isEmpty() && this.input.seek()?.type !== o.RBRACKET && (i.push(this.parseExpr_L0()), this.input.seek()?.type === o.Punctuation && this.input.seek()?.value === ",");) s.push(this.eat(o.Punctuation));
                let n = this.eat(o.RBRACKET);
                return n ? new ue(t, i, n, s) : new ue(t, i, this.reportErrorAt(this.input.seekPrevious(), o.SyntaxError, "']' expected"), s)
            } else {
                if (e?.type === o.LBRACE) return this.parseObjectLiteral();
                if (!e) return new m(this.reportErrorAfter(this.input.seekPrevious(), o.SyntaxError, "Unexpected EOF"))
            }
        }
        return new m(this.reportErrorAt(this.input.consume(), o.SyntaxError, "Unexpected token"))
    }

    parseArgs() {
        let e = [], t = [];
        for (; !this.input.isEmpty() && this.input.seek()?.type !== o.RPAREN && (e.push(this.parseExpr_L0()), this.input.seek()?.type === o.Punctuation && this.input.seek()?.value === ",");) t.push(this.eat(o.Punctuation));
        return new xt(e, t)
    }

    parseObjectLiteral() {
        let e = this.eat(o.LBRACE), t = [], i = [];
        for (; !this.input.isEmpty() && this.input.seek()?.type !== o.RBrace;) {
            let n = this.input.seek();
            if (n.type !== o.Identifier && n.type !== o.String) t.push(new O(this.reportErrorAt(this.input.consume(), o.SyntaxError, "Expected identifier or string as key"), null, null)); else if (n.type === o.Identifier && (n.value === "get" || n.value === "set") && this.input.seekN(1)?.type === o.Identifier) {
                let l = this.input.consume(), u = this.parseFuncDecl();
                u.keyword = l, t.push(new vt(u))
            } else if (n.type === o.Identifier || n.type === o.String) {
                let l = this.input.consume(), u = this.input.seek();
                if (u?.type !== o.Punctuation || u.value !== ":") l.type === o.String ? t.push(new O(n, this.reportErrorAfter(n, o.SyntaxError, "':' expected"), null)) : t.push(new O(l, null, new Z(l))); else {
                    this.eat(o.Punctuation);
                    let d = this.parseExpr_L0();
                    t.push(new O(l, u, d))
                }
            }
            if (this.input.seek()?.type !== o.Punctuation || this.input.seek()?.value !== ",") break;
            i.push(this.eat(o.Punctuation))
        }
        let s = this.eat(o.RBrace);
        return s ? new ce(e, t, s, i) : new ce(e, t, this.reportErrorAfter(this.input.seekPrevious(), o.SyntaxError, "'}' expected"), i)
    }
}

class Ee {
    createScopeManager() {
        return new Lt
    }

    parse(e, t) {
        return new Rt(e, t).parseBlock()
    }
}

class oe {
    static visitAll(e, t) {
        let i = [];
        for (let s of e) i = i.concat(oe.recursiveVisit(s, t));
        return i
    }

    static recursiveVisit(e, t) {
        if (e instanceof p) {
            let i = t[`visitToken${e.type}`];
            if (i) {
                let s = i(e);
                if (s != null) return [s]
            }
        } else {
            let i = [], s = t[`visitNode${e.nodeType}`];
            if (s) {
                let n = s(e);
                n != null && i.push(n)
            }
            for (let n of e.getNodeContent()) i = i.concat(this.recursiveVisit(n, t));
            return i
        }
        return []
    }
}

class fe {
    id;
    className = "js-link";
    content;
    range;
    element;
    target;
    listeners = [];

    constructor(e, t) {
        this.content = e.value, this.range = e.range, this.target = t
    }

    onDestroy(e) {
        this.listeners.forEach(t => e.removeVisualEventListener(t))
    }

    onRender(e, t) {
        this.element = t, t.addEventListener("click", () => {
            w.with(e, () => {
                if (E.isCtrlPressed) {
                    let s = e.caretModel;
                    s.removeAll(), s.primary.setPosition(y.fromOffset(e, this.target)), this.onLeave()
                }
            })
        }), t.addEventListener("mousemove", () => w.with(e, () => this.onEnter())), t.addEventListener("mouseleave", () => this.onLeave());
        let i = new class extends ee {
            onKeyUp(s, n) {
                n.key === "Control" && t.classList.remove("js-link-hover")
            }
        };
        e.addVisualEventListener(i), this.listeners.push(i)
    }

    onEnter() {
        E.isCtrlPressed ? this.element?.classList.add("js-link-hover") : this.element?.classList.remove("js-link-hover")
    }

    onLeave() {
        this.element?.classList.remove("js-link-hover")
    }
}

class Pt extends _e {
    name = "js-lang-plugin";
    description = "JavaScript Language Plugin for Editor";

    constructor() {
        super()
    }

    onRegistered(e, t) {
        t.registerFileTypeAssociation("js", () => new q, () => new gt, () => new Ee), e.addLangEventListener("js", this)
    }

    onSrLoaded(e, t, i, s) {
        oe.visitAll(i, new class {
            visitNodeIdentifier(n) {
                let l = n, u = e.data.srTree.scoping.getScopeAt(l.range.begin);
                if (!u) return;
                let d = u.resolve(l.token.value);
                if (!d) {
                    e.addErrorAt(l.range, "js-identifier-not-found", l.token.value, `Undefined identifier: ${l.token.value}`);
                    return
                }
                if (d.decl.nodeType === C.FuncDeclStmt) {
                    e.data.edac.add(new f(l.token, "js-function-name"));
                    let g = d.decl;
                    e.data.edac.add(new fe(l.token, g.name.range.begin))
                }
                if (d.decl.nodeType === C.DeclStmt) {
                    e.data.edac.add(new f(l.token, "js-variable-name"));
                    let g = d.decl;
                    e.data.edac.add(new fe(l.token, g.name.range.begin))
                }
            }

            visitTokenSyntaxError(n) {
                let l = n;
                e.addErrorAt(l.range, "js-syntax-error", l.value, l.msg)
            }
        })
    }
}

const le = new se;
le.registerPlugin(new Pt);
le.attach(document.querySelector(".editor-c"));
window.editor = le;
window.EditorInstance = w;
window.js = new q;
window.JSParsingUtils = a;
window.TextRange = h;
window.EditorComponentsData = me;
window.HighlightedToken = f;
window.p = r => console.log(a.toHumanReadableString(parser.parse(null, js.asTokenStream(r))));
window.parser = new Ee;

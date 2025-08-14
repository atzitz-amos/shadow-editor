import {SRCodeBlock, SRNode} from "../../core/lang/parser/ast";
import {TextRange} from "../../core/Position";
import {JS} from "./jsLexer";
import {Token} from "../../core/lang/lexer/TokenStream";
import {StringUtils} from "../../utils/StringUtils";
import {JSParsingUtils} from "./jsUtils";


export enum JSNodeType {
    CodeBlock = "CodeBlock",
    Stmt = "Stmt",
    DeclStmt = "DeclStmt",
    Body = "Body",
    Parameters = "Parameters",
    Param = "Param",
    FuncDeclStmt = "FuncDeclStmt",
    ReturnStmt = "ReturnStmt",
    Expr = "Expr",
    ExprGroup = "ExprGroup",
    ExprCommaExpr = "ExprCommaExpr",
    NumberLiteral = "NumberLiteral",
    StringLiteral = "StringLiteral",
    Args = "Args",
    Identifier = "Identifier",
    SpecialIdentifier = "SpecialIdentifier",
    MemberAccess = "MemberAccess",
    AssignExpr = "AssignExpr",
    UnaryExpr = "UnaryExpr",
    BinaryExpr = "BinaryExpr",
    TernaryExpr = "TernaryExpr",
    CallExpr = "CallExpr",
    NewExpr = "NewExpr",
    ArrayAccess = "ArrayAccess",
    ArrayLiteral = "ArrayLiteral",
    ObjectLiteral = "ObjectLiteral",
    ObjectLiteralProperty = "ObjectLiteralProperty",
    ObjectLiteralPropertyFunction = "ObjectLiteralPropertyFunction",
    Lambda = "Lambda",
}

export abstract class JSSrNode implements SRNode {
    declares: string[] = [];

    range: TextRange;
    language = "js";
    parent: SRNode | null = null;
    abstract nodeType: JSNodeType;

    protected constructor() {
        for (let node of this.getAllNodeChildren()) {
            node.parent = this;
        }
    }

    abstract toHumanReadableString(): string;

    abstract isWellFormed(): boolean;

    getAllNodeChildren(): JSSrNode[] {
        const children: JSSrNode[] = [];
        for (let key in this) {
            if (this[key] instanceof JSSrNode) {
                children.push(this[key] as JSSrNode);
            }
        }
        return children;
    }

    getNodeContent(): (Token<any> | SRNode)[] {
        const result: (Token<any> | SRNode)[] = [];
        for (let key of this.declares) {
            let props = this[key];
            if (props instanceof Token) {
                result.push(props as Token<any>);
            } else if (props instanceof JSSrNode) {
                result.push(props as JSSrNode);
            }
        }
        return result;
    }
}

export class JSCodeBlock extends JSSrNode implements SRCodeBlock {
    range: TextRange;
    children: JSSrNode[];
    nodeType = JSNodeType.CodeBlock;

    constructor(children: JSSrNode[]) {
        super();
        this.children = children;
        this.range = TextRange.of(children);
    }

    toHumanReadableString(): string {
        let s = "";
        for (const child of this.children) {
            s += child.toHumanReadableString() + "\n";
        }
        return "{\n" + StringUtils.indent(s.substring(0, s.length - 1)) + "\n}";
    }

    isWellFormed(): boolean {
        return this.children.every(child => child.isWellFormed());
    }

    getNodeContent(): (Token<any> | SRNode)[] {
        return this.children;
    }
}

export abstract class JSStmt extends JSSrNode {
    range: TextRange;
    nodeType = JSNodeType.Stmt;

    protected constructor(range: TextRange) {
        super();
        this.range = range;
    }
}

export class JSDeclStmt extends JSStmt {
    declares = ["kind", "name", "eq", "decl"];

    kind: Token<JS>;
    name: Token<JS>;
    eq?: Token<JS>;
    decl?: JSExpr;
    nodeType = JSNodeType.DeclStmt;

    constructor(kind: Token<JS>,
                name: Token<JS>,
                eq?: Token<JS>,
                decl?: JSExpr) {

        super(TextRange.of(kind, decl || name));
        this.kind = kind;
        this.name = name;
        this.eq = eq;
        this.decl = decl;
    }

    isWellFormed(): boolean {
        return this.kind && this.name
            && JSParsingUtils.isValidToken(this.kind)
            && JSParsingUtils.isValidToken(this.name)
            && (!this.eq || JSParsingUtils.isValidToken(this.eq))
            && (!this.decl || this.decl.isWellFormed());
    }

    toHumanReadableString(): string {
        let s = JSParsingUtils.tokenToHumanReadableString(this.kind);
        s += " " + JSParsingUtils.tokenToHumanReadableString(this.name) + " = ";
        s += JSParsingUtils.toHumanReadableString(this.decl);
        return s + ";";
    }
}

export class JSReturnStmt extends JSStmt {
    declares = ["keyword", "expr"];

    keyword: Token<JS> | null;
    expr: JSExpr | null;
    nodeType = JSNodeType.ReturnStmt;

    constructor(keyword: Token<JS> | null, expr: JSExpr | null) {
        super(TextRange.of([keyword, expr]));
        this.keyword = keyword;
        this.expr = expr;
    }

    isWellFormed(): boolean {
        return JSParsingUtils.isValidToken(this.keyword) && (!this.expr || this.expr.isWellFormed());
    }

    toHumanReadableString(): string {
        return "return " + JSParsingUtils.toHumanReadableString(this.expr) + ";";
    }
}

export class JSBody extends JSSrNode {
    declares = ["openBrace", "body", "closeBrace"];

    openBrace: Token<JS> | null;
    body: JSCodeBlock;
    closeBrace: Token<JS> | null;
    nodeType = JSNodeType.Body;

    constructor(openBrace: Token<JS> | null, body: JSCodeBlock, closeBrace: Token<JS> | null) {
        super();
        this.range = TextRange.of([openBrace, body, closeBrace]);
        this.openBrace = openBrace;
        this.body = body;
        this.closeBrace = closeBrace;
    }

    isWellFormed(): boolean {
        return (!this.openBrace || JSParsingUtils.isValidToken(this.openBrace)) &&
            this.body.isWellFormed() &&
            (!this.closeBrace || JSParsingUtils.isValidToken(this.closeBrace));
    }

    toHumanReadableString(): string {
        return JSParsingUtils.toHumanReadableString(this.body);
    }
}

export class JSParameters extends JSSrNode {
    declares = [];

    params: JSParam[];
    commas: Token<JS>[] = [];

    nodeType = JSNodeType.Parameters;

    constructor(params: JSParam[], commas: Token<JS>[] = []) {
        super();
        this.range = TextRange.of(params);
        this.params = params;
        this.commas = commas;
    }

    toHumanReadableString(): string {
        return this.params.map(e => JSParsingUtils.toHumanReadableString(e)).join(', ');
    }

    isWellFormed(): boolean {
        return this.params.every(param => param.isWellFormed());
    }

    getNodeContent(): (Token<any> | SRNode)[] {
        let result: (Token<any> | SRNode)[] = [];
        for (let i = 0; i < this.params.length; i++) {
            result.push(this.params[i]);
            if (i < this.commas.length) {
                result.push(this.commas[i]);
            }
        }
        return result;
    }
}

export class JSParam extends JSSrNode {
    declares = ["restToken", "name", "eqSign", "defaultValue"];

    restToken: Token<JS> | null;
    name: Token<JS>;
    eqSign?: Token<JS>;
    defaultValue?: JSExpr;
    nodeType = JSNodeType.Param;

    constructor(name: Token<JS>,
                restToken: Token<JS> | null,
                eqSign?: Token<JS>,
                defaultValue?: JSExpr) {
        super();
        this.name = name;
        this.restToken = restToken;
        this.eqSign = eqSign;
        this.defaultValue = defaultValue;
        this.range = defaultValue ? TextRange.of(restToken || name, defaultValue) : TextRange.of(restToken || name, eqSign || name);
    }

    isWellFormed(): boolean {
        return JSParsingUtils.isValidToken(this.name) &&
            (!this.restToken || JSParsingUtils.isValidToken(this.restToken)) &&
            (!this.eqSign || JSParsingUtils.isValidToken(this.eqSign)) &&
            (!this.defaultValue || this.defaultValue.isWellFormed());
    }

    toHumanReadableString(): string {
        let s = this.restToken ? "..." : "";
        s += JSParsingUtils.tokenToHumanReadableString(this.name);
        if (this.eqSign) {
            s += "=";
            s += JSParsingUtils.toHumanReadableString(this.defaultValue);
        }
        return s;
    }
}

export class JSFuncDecl extends JSStmt {
    declares = ["keyword", "name", "openParen", "params", "closeParen", "body"];

    keyword: Token<JS>;
    name: Token<JS> | null;
    openParen: Token<JS> | null;
    params: JSParameters | null;
    closeParen: Token<JS> | null;
    body: JSBody | null;

    nodeType = JSNodeType.FuncDeclStmt;

    constructor(keyword: Token<JS>,
                name: Token<JS> | null,
                openParen: Token<JS> | null,
                params: JSParameters | null,
                closeParen: Token<JS> | null,
                body: JSBody | null) {

        super(TextRange.of([keyword, name, openParen, params, closeParen, body]));
        this.keyword = keyword;
        this.name = name;
        this.openParen = openParen;
        this.params = params;
        this.closeParen = closeParen;
        this.body = body;
    }

    isWellFormed(): boolean {
        return JSParsingUtils.isValidToken(this.keyword)
            && (!this.name || JSParsingUtils.isValidToken(this.name))
            && JSParsingUtils.isValidToken(this.openParen)
            && JSParsingUtils.isValidToken(this.closeParen)
            && this.params!.isWellFormed()
            && this.body!.isWellFormed();
    }

    toHumanReadableString(): string {
        let s = JSParsingUtils.tokenToHumanReadableString(this.keyword);
        if (this.name) {
            s += " " + JSParsingUtils.tokenToHumanReadableString(this.name);
        }
        s += "(" + JSParsingUtils.toHumanReadableString(this.params) + ")";
        return s + " " + JSParsingUtils.toHumanReadableString(this.body);
    }
}

export class JSExpr extends JSSrNode {
    declares = ["error"];

    error: Token<JS> | null;

    nodeType = JSNodeType.Expr;

    constructor(error: Token<JS> | null = null) {
        super();
        this.error = error;
        if (error) {
            this.range = TextRange.of(error);
        }
    }

    toHumanReadableString(): string {
        return JSParsingUtils.tokenToHumanReadableString(this.error)
    }

    isWellFormed(): boolean {
        return !this.error;
    }
}

export class JSExprCommaExpr extends JSExpr {
    values: JSSrNode[];
    commas: Token<JS>[];

    nodeType = JSNodeType.ExprCommaExpr;

    constructor(values: JSSrNode[], commas: Token<JS>[]) {
        super();
        this.values = values;
        this.commas = commas;
        this.range = TextRange.of(values);
    }

    toHumanReadableString(): string {
        return this.values.map(e => JSParsingUtils.toHumanReadableString(e)).join(", ");
    }

    isWellFormed(): boolean {
        return this.values.every(value => value.isWellFormed());
    }

    getNodeContent(): (Token<any> | SRNode)[] {
        let result: (Token<any> | SRNode)[] = [];
        for (let i = 0; i < this.values.length; i++) {
            result.push(this.values[i]);
            if (i < this.commas.length) {
                result.push(this.commas[i]);
            }
        }
        return result;
    }
}

export class JSNumberLiteral extends JSExpr {
    declares = ["value"];

    value: Token<JS>;

    nodeType = JSNodeType.NumberLiteral;

    constructor(token: Token<JS>) {
        super();
        this.range = TextRange.of(token);
        this.value = token;
    }

    toHumanReadableString(): string {
        return JSParsingUtils.tokenToHumanReadableString(this.value);
    }

    isWellFormed(): boolean {
        return JSParsingUtils.isValidToken(this.value);
    }
}

export class JSStringLiteral extends JSExpr {
    declares = ["value"];

    value: Token<JS>;

    nodeType = JSNodeType.StringLiteral;

    constructor(token: Token<JS>) {
        super();
        this.range = TextRange.of(token);
        this.value = token;
    }

    toHumanReadableString(): string {
        return JSParsingUtils.tokenToHumanReadableString(this.value);
    }

    isWellFormed(): boolean {
        return JSParsingUtils.isValidToken(this.value);
    }
}

export class JSArrayLiteral extends JSExpr {
    openBracket: Token<JS>;
    values: JSSrNode[];
    closeBracket: Token<JS> | null;

    commas: Token<JS>[];

    nodeType = JSNodeType.ArrayLiteral;

    constructor(openBracket: Token<JS>, values: JSSrNode[], closeBracket: Token<JS> | null, commas: Token<JS>[]) {
        super();
        this.openBracket = openBracket;
        this.values = values;
        this.closeBracket = closeBracket;
        this.commas = commas;
        this.range = TextRange.of([openBracket, ...values, closeBracket]);
    }

    toHumanReadableString(): string {
        return "[" + this.values.map(e => JSParsingUtils.toHumanReadableString(e)).join(", ") + "]";
    }

    isWellFormed(): boolean {
        return JSParsingUtils.isValidToken(this.openBracket) &&
            this.values.every(value => value.isWellFormed()) &&
            JSParsingUtils.isValidToken(this.closeBracket);
    }

    getNodeContent(): (Token<any> | SRNode)[] {
        let result: (Token<any> | SRNode)[] = [];
        result.push(this.openBracket);
        for (let i = 0; i < this.values.length; i++) {
            result.push(this.values[i]);
            if (i < this.commas.length) {
                result.push(this.commas[i]);
            }
        }
        if (this.closeBracket) {
            result.push(this.closeBracket);
        }
        return result;
    }
}

export class JSObjectProperty extends JSSrNode {
    declares = ["key", "colon", "value"];

    key: Token<JS>;  // Either an identifier or a string literal
    colon: Token<JS> | null;
    value: JSSrNode | null;

    nodeType = JSNodeType.ObjectLiteralProperty;

    constructor(key: Token<JS>, colon: Token<JS> | null, value: JSSrNode | null) {
        super();
        this.key = key;
        this.colon = colon;
        this.value = value;
        this.range = TextRange.of([key, colon, value]);
    }

    isWellFormed(): boolean {
        return JSParsingUtils.isValidToken(this.key) &&
            (!this.colon || JSParsingUtils.isValidToken(this.colon)) &&
            (!this.value || this.value.isWellFormed());
    }

    toHumanReadableString(): string {
        let s = this.key.value;
        if (this.colon && !this.colon.isError || this.value) {
            s += ": ";
        }
        if (this.value) {
            s += this.value.toHumanReadableString();
        } else {
            s += "#undef";
        }
        return s;
    }
}

export class JSObjectPropertyFunction extends JSObjectProperty {
    declares = ["func"];

    func: JSFuncDecl;

    nodeType = JSNodeType.ObjectLiteralPropertyFunction;

    constructor(func: JSFuncDecl) {
        super(
            func.name!,
            null,
            func
        );
        this.func = func;
    }

    isWellFormed(): boolean {
        return this.func.isWellFormed();
    }

    toHumanReadableString(): string {
        return JSParsingUtils.toHumanReadableString(this.func);
    }
}

export class JSObjectLiteral extends JSExpr {
    openBrace: Token<JS>;
    properties: JSObjectProperty[];
    closeBrace: Token<JS> | null;

    commas: Token<JS>[];

    nodeType = JSNodeType.ObjectLiteral;

    constructor(openBrace: Token<JS>, properties: JSObjectProperty[], closeBrace: Token<JS> | null, commas: Token<JS>[]) {
        super();
        this.openBrace = openBrace;
        this.properties = properties;
        this.closeBrace = closeBrace;
        this.commas = commas;
        this.range = TextRange.of([openBrace, ...properties, closeBrace]);
    }

    isWellFormed(): boolean {
        return JSParsingUtils.isValidToken(this.openBrace) &&
            this.properties.every(prop => prop.isWellFormed()) &&
            (!this.closeBrace || JSParsingUtils.isValidToken(this.closeBrace));
    }

    toHumanReadableString(): string {
        if (this.properties.length <= 2 && !this.properties.some(x => x.nodeType === JSNodeType.ObjectLiteralPropertyFunction)) {  // inline view
            return "{ " + this.properties.map(p => p.toHumanReadableString()).join(", ") + " }";
        } else {  // multiline view
            let s = "{\n";
            for (const prop of this.properties) {
                s += StringUtils.indent(prop.toHumanReadableString()) + ",\n";
            }
            s += "}";
            return s;
        }
    }

    getNodeContent(): (Token<any> | SRNode)[] {
        let result: (Token<any> | SRNode)[] = [];
        result.push(this.openBrace);
        for (let i = 0; i < this.properties.length; i++) {
            result.push(this.properties[i]);
            if (i < this.commas.length) {
                result.push(this.commas[i]);
            }
        }
        if (this.closeBrace) {
            result.push(this.closeBrace);
        }
        return result;
    }
}

export class JSIdentifier extends JSExpr {
    declares = ["token"];

    token: Token<JS>;
    nodeType = JSNodeType.Identifier;

    constructor(token: Token<JS>) {
        super();
        this.token = token;
        this.range = TextRange.of(token);
    }

    isWellFormed(): boolean {
        return JSParsingUtils.isValidToken(this.token);
    }

    toHumanReadableString(): string {
        return JSParsingUtils.tokenToHumanReadableString(this.token);
    }
}

/**
 * Represents a special identifier (e.g `this` or `super`) */
export class JSSpecialIdentifier extends JSIdentifier {
    nodeType = JSNodeType.SpecialIdentifier;

    constructor(token: Token<JS>) {
        super(token);
    }
}

export class JSMemberAccess extends JSExpr {
    declares = ["base", "dot", "member"];

    base: JSExpr;
    dot: Token<JS>;
    member: JSExpr;

    nodeType = JSNodeType.MemberAccess;

    constructor(base: JSExpr, dot: Token<JS>, member: JSExpr) {
        super();
        this.base = base;
        this.dot = dot;
        this.member = member;
        this.range = TextRange.of(base, member);
    }

    isWellFormed(): boolean {
        return this.base.isWellFormed() && JSParsingUtils.isValidToken(this.dot) && this.member.isWellFormed();
    }

    toHumanReadableString(): string {
        return JSParsingUtils.toHumanReadableString(this.base) + "." + JSParsingUtils.toHumanReadableString(this.member);
    }
}

export class JSAssignExpr extends JSExpr {
    declares = ["left", "operator", "right"];

    left: JSExpr;
    operator: Token<JS>;
    right: JSExpr | null;

    nodeType = JSNodeType.AssignExpr;

    constructor(left: JSExpr, operator: Token<JS>, right: JSExpr | null) {
        super();
        this.left = left;
        this.operator = operator;
        this.right = right;
        this.range = TextRange.of(left, right || operator);
    }

    isWellFormed(): boolean {
        return this.left.isWellFormed() && JSParsingUtils.isValidToken(this.operator) &&
            (!this.right || this.right.isWellFormed());
    }

    toHumanReadableString(): string {
        return "(" + JSParsingUtils.toHumanReadableString(this.left) + " = " + JSParsingUtils.toHumanReadableString(this.right) + ")";
    }
}

export class JSUnaryExpr extends JSExpr {
    declares = ["operator", "operand"];

    operator: Token<JS>;
    operand: JSSrNode;

    nodeType = JSNodeType.UnaryExpr;

    constructor(operator: Token<JS>, operand: JSSrNode) {
        super();
        this.operator = operator;
        this.operand = operand;
        this.range = TextRange.of(operator, operand);
    }

    isWellFormed(): boolean {
        return JSParsingUtils.isValidToken(this.operator) && this.operand.isWellFormed();
    }

    toHumanReadableString(): string {
        return "(" + JSParsingUtils.tokenToHumanReadableString(this.operator) + JSParsingUtils.toHumanReadableString(this.operand) + ")";
    }
}

export class JSBinaryExpr extends JSExpr {
    declares = ["left", "operator", "right"];

    left: JSSrNode;
    operator: Token<JS>;
    right: JSSrNode;

    nodeType = JSNodeType.BinaryExpr;

    constructor(left: JSSrNode, operator: Token<JS>, right: JSSrNode) {
        super();
        this.left = left;
        this.operator = operator;
        this.right = right;
        this.range = TextRange.of(left, right);
    }

    isWellFormed(): boolean {
        return this.left.isWellFormed() && JSParsingUtils.isValidToken(this.operator) && this.right.isWellFormed();
    }

    toHumanReadableString(): string {
        return "(" + JSParsingUtils.toHumanReadableString(this.left) + " " +
            JSParsingUtils.tokenToHumanReadableString(this.operator) + " " +
            JSParsingUtils.toHumanReadableString(this.right) + ")";
    }
}

export class JSTernaryExpr extends JSExpr {
    declares = ["condition", "questionMark", "trueExpr", "colon", "falseExpr"];

    condition: JSExpr;
    questionMark: Token<JS>;
    trueExpr: JSExpr;
    colon: Token<JS>;
    falseExpr: JSExpr | null;

    nodeType = JSNodeType.TernaryExpr;

    constructor(condition: JSExpr, questionMark: Token<JS>, trueExpr: JSExpr, colon: Token<JS>, falseExpr: JSExpr | null) {
        super();
        this.condition = condition;
        this.questionMark = questionMark;
        this.trueExpr = trueExpr;
        this.colon = colon;
        this.falseExpr = falseExpr;
        this.range = TextRange.of(condition, falseExpr || colon);
    }

    isWellFormed(): boolean {
        return this.condition.isWellFormed() &&
            JSParsingUtils.isValidToken(this.questionMark) &&
            this.trueExpr.isWellFormed() &&
            JSParsingUtils.isValidToken(this.colon) &&
            (!this.falseExpr || this.falseExpr.isWellFormed());
    }

    toHumanReadableString(): string {
        return JSParsingUtils.toHumanReadableString(this.condition) + " ? (" +
            JSParsingUtils.toHumanReadableString(this.trueExpr) + ") : (" +
            JSParsingUtils.toHumanReadableString(this.falseExpr) + ")";
    }
}

export class JSCallExpr extends JSExpr {
    declares = ["callee", "openParen", "args", "closeParen"];

    callee: JSExpr;
    openParen: Token<JS> | null;
    args: JSArgs | null;
    closeParen: Token<JS> | null;

    nodeType = JSNodeType.CallExpr;

    constructor(callee: JSExpr,
                openParen: Token<JS> | null,
                args: JSArgs | null,
                closeParen: Token<JS> | null) {
        super();
        this.callee = callee;
        this.openParen = openParen;
        this.args = args;
        this.closeParen = closeParen;
        this.range = TextRange.of([callee, openParen, args, closeParen]);
    }

    isWellFormed(): boolean {
        return this.callee.isWellFormed() &&
            JSParsingUtils.isValidToken(this.openParen) &&
            JSParsingUtils.isValidToken(this.closeParen) &&
            this.args!.isWellFormed();
    }

    toHumanReadableString(): string {
        return JSParsingUtils.toHumanReadableString(this.callee) + "(" + JSParsingUtils.toHumanReadableString(this.args) + ")";
    }
}

export class JSArrayAccess extends JSExpr {
    declares = ["base", "openBracket", "index", "closeBracket"];

    base: JSExpr;
    openBracket: Token<JS>;
    index: JSExpr | null;
    closeBracket: Token<JS> | null;

    nodeType = JSNodeType.ArrayAccess;

    constructor(callee: JSExpr,
                openBracket: Token<JS>,
                index: JSExpr | null,
                closeBracket: Token<JS> | null) {
        super();
        this.base = callee;
        this.openBracket = openBracket;
        this.index = index;
        this.closeBracket = closeBracket;
        this.range = TextRange.of([callee, openBracket, index, closeBracket]);
    }

    isWellFormed(): boolean {
        return this.base.isWellFormed() &&
            JSParsingUtils.isValidToken(this.openBracket) &&
            this.index!.isWellFormed() &&
            JSParsingUtils.isValidToken(this.closeBracket);
    }

    toHumanReadableString(): string {
        return JSParsingUtils.toHumanReadableString(this.base) + "[" + JSParsingUtils.toHumanReadableString(this.index) + "]";
    }
}

export class JSNewExpr extends JSCallExpr {
    declares = ["keyword", "callee", "openParen", "args", "closeParen"];

    keyword: Token<JS>;

    nodeType = JSNodeType.NewExpr;

    constructor(keyword: Token<JS>,
                callee: JSExpr,
                openParen: Token<JS> | null,
                args: JSArgs | null,
                closeParen: Token<JS> | null) {
        super(callee, openParen, args, closeParen);
        this.keyword = keyword;

        this.range.begin = keyword.range.begin;
    }

    isWellFormed(): boolean {
        return JSParsingUtils.isValidToken(this.keyword) &&
            this.callee.isWellFormed() &&
            JSParsingUtils.isValidToken(this.openParen) &&
            this.args!.isWellFormed() &&
            JSParsingUtils.isValidToken(this.closeParen);
    }

    toHumanReadableString(): string {
        return "new " + JSParsingUtils.toHumanReadableString(this.callee) + "(" + JSParsingUtils.toHumanReadableString(this.args) + ")";
    }
}

export class JSArgs extends JSExpr {
    declares = ["values", "comma"];

    values: JSExpr[];
    comma: Token<JS>[];

    nodeType = JSNodeType.Args;

    constructor(values: JSExpr[], comma: Token<JS>[]) {
        super();
        this.values = values;
        this.comma = comma;

        this.range = TextRange.of(values);
    }

    isWellFormed(): boolean {
        return this.values.every(value => value.isWellFormed());
    }

    toHumanReadableString(): string {
        return this.values.map(e => JSParsingUtils.toHumanReadableString(e)).join(", ");
    }
}

export class JSLambda extends JSExpr {
    declares = ["params", "arrow", "body"];

    params: JSParameters;
    arrow: Token<JS>;
    body: JSBody | null;

    nodeType = JSNodeType.Lambda;

    constructor(params: JSParameters, arrow: Token<JS>, body: JSBody | null) {
        super();
        this.params = params;
        this.arrow = arrow;
        this.body = body;
        this.range = TextRange.of(params, body || arrow);
    }

    isWellFormed(): boolean {
        return this.params.isWellFormed() &&
            JSParsingUtils.isValidToken(this.arrow) &&
            this.body!.isWellFormed();
    }

    toHumanReadableString(): string {
        let s = "((";
        if (this.params) {
            s += JSParsingUtils.toHumanReadableString(this.params);
        }
        s += ") => ";
        s += JSParsingUtils.toHumanReadableString(this.body) + ")";
        return s;
    }
}

export class JsExprGroup extends JSExpr {
    declares = ["openParen", "expr", "closeParen"];

    openParen: Token<JS>;
    expr: JSExpr;
    closeParen: Token<JS> | null;

    nodeType = JSNodeType.ExprGroup;

    constructor(openParen: Token<JS>, expr: JSExpr, closeParen: Token<JS> | null) {
        super();
        this.expr = expr;
        this.openParen = openParen;
        this.closeParen = closeParen;
        this.range = TextRange.of(openParen, closeParen || expr);
    }

    isWellFormed(): boolean {
        return JSParsingUtils.isValidToken(this.openParen) &&
            this.expr.isWellFormed() &&
            JSParsingUtils.isValidToken(this.closeParen);
    }

    toHumanReadableString(): string {
        return "(" + JSParsingUtils.toHumanReadableString(this.expr) + ")";
    }
}

import {ASTNode} from "./ASTNode";
import {SynNode} from "../../syntax/api/SynNode";
import {SynCodeBlock} from "../../syntax/api/SynCodeBlock";

export enum ASTGrammarRole {
    DEFAULT,
    CODEBLOCK,
    TOKEN,
    EXPR,
    ERROR,
}

export class ASTType {
    constructor(public debugName: string, public role: ASTGrammarRole, public treeBuilder?: (node: ASTNode) => SynNode) {
    }
}

export class ASTGrammar {
    public static readonly TOKEN = new ASTType("TOKEN", ASTGrammarRole.TOKEN);
    public static readonly SYNTAX_ERROR = new ASTType("SYNTAX_ERROR", ASTGrammarRole.ERROR);
    public static readonly Expression = new ASTType("EXPR", ASTGrammarRole.EXPR);

    public static create(debugName: string, treeBuilder?: (node: ASTNode) => SynNode): ASTType {
        return new ASTType(debugName, ASTGrammarRole.DEFAULT, treeBuilder);
    }

    public static createCodeBlock(debugName: string, treeBuilder: (node: ASTNode) => SynCodeBlock): ASTType {
        return new ASTType(debugName, ASTGrammarRole.CODEBLOCK, treeBuilder);
    }
}

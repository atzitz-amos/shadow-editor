import {TreeComponentBase} from "../tree/TreeComponentBase";

export enum ASTGrammarRole {
    DEFAULT,
    CODEBLOCK,
    TOKEN,
    ERROR
}

export class ASTType {
    constructor(public debugName: string, public role: ASTGrammarRole, public treeBuilder?: (node: ASTGrammar) => TreeComponentBase) {
    }
}

export class ASTGrammar {
    public static readonly TOKEN = new ASTType("TOKEN", ASTGrammarRole.TOKEN);
    public static readonly SYNTAX_ERROR = new ASTType("SYNTAX_ERROR", ASTGrammarRole.ERROR);

    public static create(debugName: string, treeBuilder?: (node: ASTGrammar) => TreeComponentBase): ASTType {
        return new ASTType(debugName, ASTGrammarRole.DEFAULT, treeBuilder);
    }

    public static createCodeBlock(debugName: string, treeBuilder?: (node: ASTGrammar) => TreeComponentBase): ASTType {
        return new ASTType(debugName, ASTGrammarRole.CODEBLOCK, treeBuilder);
    }
}

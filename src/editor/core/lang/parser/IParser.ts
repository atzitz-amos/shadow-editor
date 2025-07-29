import {TokenStream} from "../lexer/TokenStream";
import {SRCodeBlock} from "./ast";
import {IScope, ScopeManager} from "../Scoping";

export interface IParser<T> {

    /**
     * Parses the input string into an abstract syntax tree (AST).
     * @param scope The scope in which the parsing occurs, providing context for variable resolution and scope management.
     * @param input The input string to parse.
     * @returns The root node of the AST.
     */
    parse(scope: IScope, input: TokenStream<T>): SRCodeBlock;

    createScopeManager(): ScopeManager;
}

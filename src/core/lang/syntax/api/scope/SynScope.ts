import {URILocatedResource} from "../../../../uri/URILocatedResource";
import {SynScopeType} from "./SynScopeType";
import {SynCodeBlock} from "../SynCodeBlock";
import {SynDeclaration} from "../../impl/reference/SynDeclaration";

export interface SynScope extends URILocatedResource {
    getType(): SynScopeType;

    getAssociatedCodeBlock(): SynCodeBlock;

    getParent(): SynScope;

    getDeclarations(): Map<String, SynDeclaration>;

    resolve(name: string): SynDeclaration | null;
}
import {SynDocument} from "../../api/document/SynDocument";
import {CodeAnalysisPass} from "../../../codeAnalysis/analysis/api/CodeAnalysisPass";
import {Editor} from "../../../../editor/Editor";

/**
 *
 * @author Atzitz Amos
 * @date 10/22/2026
 * @since 1.0.0
 */
export class SynDocumentCodeAnalysisHolder {
    private lastUpdatedTimestamp: number = -1;
    private codeAnalysisPasses: CodeAnalysisPass<any>[] = [];

    constructor(private readonly synDocument: SynDocument) {
    }

    setCodeAnalysisPasses(passes: CodeAnalysisPass<any>[]) {
        this.codeAnalysisPasses = passes;
        this.lastUpdatedTimestamp = this.synDocument.getModificationTimestamp();
    }

    getLastUpdatedTimestamp(): number {
        return this.lastUpdatedTimestamp;
    }

    getAllCodeAnalysisPasses(): CodeAnalysisPass<any>[] {
        return this.codeAnalysisPasses;
    }

    getCodeAnalysisPass<T extends CodeAnalysisPass<any>>(passClass: new (...args: any[]) => T): T | null {
        for (const pass of this.codeAnalysisPasses) {
            if (pass instanceof passClass) {
                return pass as T;
            }
        }
        return null;
    }

    forEach(callback: (pass: CodeAnalysisPass<any>) => void) {
        for (const pass of this.codeAnalysisPasses) {
            callback(pass);
        }
    }

    applyAll(editor: Editor) {
        this.forEach(pass => pass.processResults(editor));
    }
}

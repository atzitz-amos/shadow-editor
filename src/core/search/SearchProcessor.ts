import {ProjectFile} from "../project/filesystem/tree/ProjectFile";
import {ProjectDirectory} from "../project/filesystem/tree/ProjectDirectory";
import {GlobalState} from "../global/GlobalState";
import {TextRange} from "../../editor/core/coordinate/range/TextRange";
import {LogicalPosition} from "../../editor/core/coordinate/LogicalPosition";
import {Scheduler} from "../scheduler/Scheduler";

export type SearchResult = {
    line: string;
    lineNo: number;
    appears: TextRange[];
    file: ProjectFile;
    query: string;
    type: string;
};

export type SearchBatch = {
    results: SearchResult[],
    byFile: Map<string, LogicalPosition[]>,
}

/** Number of file reads kept in flight while scanning. */
const READ_AHEAD = 16;

/**
 *
 * @author Atzitz Amos
 * @date 10/1/2026
 * @since 1.0.0
 */
export class SearchProcessor {
    constructor(private readonly root: ProjectDirectory) {
    }

    public async* batchSearch(query: string, budgetMs = 8): AsyncGenerator<SearchBatch, void, undefined> {
        if (!query || query.includes("\n")) return;

        const project = GlobalState.getCurrentProject();
        const byFile = new Map<string, LogicalPosition[]>();
        let results: SearchResult[] = [];
        let deadline = performance.now() + budgetMs;

        // Reading files one at a time serializes every OPFS round trip; keep a window of reads in flight instead
        const files = project.getFS().recursiveGetAllFiles();
        const reads: (Promise<string> | undefined)[] = new Array(files.length);
        const read = (i: number) => {
            if (i < files.length) reads[i] = files[i].getTextContent().catch(() => "");
        };
        for (let i = 0; i < READ_AHEAD; i++) read(i);

        for (let i = 0; i < files.length; i++) {
            if (performance.now() >= deadline) {
                yield {results, byFile};           // even if empty: lets the consumer stop us
                results = [];
                await Scheduler.yield();
                deadline = performance.now() + budgetMs;
            }

            const file = files[i];
            const content = await reads[i]!;
            reads[i] = undefined;
            read(i + READ_AHEAD);
            const fileId = file.getId();
            let positions: LogicalPosition[] | undefined;

            let lineNo = 0;
            let lineStart = 0;
            let nextNl = content.indexOf("\n");
            let pos = content.indexOf(query);

            while (pos !== -1) {
                if (performance.now() >= deadline) {
                    yield {results, byFile};
                    results = [];
                    await Scheduler.yield();
                    deadline = performance.now() + budgetMs;
                }

                while (nextNl !== -1 && nextNl < pos) {
                    lineNo++;
                    lineStart = nextNl + 1;
                    nextNl = content.indexOf("\n", lineStart);
                }
                const lineEnd = nextNl === -1 ? content.length : nextNl;

                if (!positions) {
                    positions = [];
                    byFile.set(fileId, positions);
                }

                const appears: TextRange[] = [];
                while (pos !== -1 && pos < lineEnd) {
                    const col = pos - lineStart;
                    appears.push(new TextRange(col, col + query.length));
                    positions.push(new LogicalPosition(col, lineNo));
                    pos = content.indexOf(query, pos + query.length);
                }

                results.push({
                    line: content.slice(lineStart, lineEnd),
                    lineNo: lineNo + 1,
                    appears,
                    file,
                    query,
                    type: "match",
                });
            }
        }

        yield {results, byFile};
    }
}
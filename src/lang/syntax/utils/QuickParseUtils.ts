import {SynTree} from "../api/tree/SynTree";
import {TokenStream} from "../builder/tokens/TokenStream";
import {LanguageBase} from "../../LanguageBase";
import {SynDocumentManager} from "../manager/SynDocumentManager";
import {IParser} from "../builder/parser/IParser";
import {SynNode} from "../api/SynNode";
import {ASTFactoryBuilder} from "../builder/parser/builder/ASTFactoryBuilder";
import {EmptyKillSignal, TimeoutKillSignal} from "../../../core/utils/KillSignal";
import {LanguageParserDefinition} from "../../definitions/LanguageParserDefinition";
import {Marker} from "../builder/parser/builder/Marker";

/**
 *
 * @author Atzitz Amos
 * @date 9/9/2026
 * @since 1.0.0
 */
export class QuickParseUtils {
    public static quickParse(language: LanguageBase, text: string): QuickParseResult {
        const document = SynDocumentManager.createVirtualSynDocumentForText(text, language);
        return {
            tokenStream: document.makeTokenStream(),
            tree: document.getTree()
        }
    }

    public static quickParseElementFactory<T extends IParser>(language: LanguageBase, text: string, parseFunc: (parser: T, marker: Marker) => void): SynNode {
        const document = SynDocumentManager.createDetachedSynDocumentForText(text, language);
        const builder = new ASTFactoryBuilder(
            document,
            language,
            !!window["isParseTimeBombDisabled"] ? new EmptyKillSignal() : new TimeoutKillSignal(1000)
        );

        const parserFactory = LanguageParserDefinition.getParserDefinition(language);
        if (!parserFactory) {
            throw new Error(`No parser definition found for language: ${language.getDisplayName()}`);
        }
        const parser = parserFactory.createParser(builder) as T;
        const marker = builder.mark();
        parseFunc(parser, marker);
        return builder.getFactoryRootElement();
    }
}


export type QuickParseResult = { tokenStream: TokenStream, tree: SynTree };
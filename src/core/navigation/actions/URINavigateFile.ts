import {AbstractURINavigate} from "./AbstractURINavigate";
import {EditorURI} from "../uri/EditorURI";
import {EditorTabsHelper} from "../../../app/core/tabs/EditorTabsHelper";

/**
 *
 * @author Atzitz Amos
 * @date 11/17/2026
 * @since 1.0.0
 */
export class URINavigateFile extends AbstractURINavigate {

    constructor(private readonly uri: EditorURI) {
        super();
    }

    async doNavigate(): Promise<void> {
        await EditorTabsHelper.makeVisible(this.uri);
    }

    async restore(): Promise<void> {

    }

}

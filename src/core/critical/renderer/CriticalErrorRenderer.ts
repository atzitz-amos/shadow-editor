import {StartupPhase} from "../../lifecycle/startup/StartupPhase";
import {LaunchComponent} from "../../../app/ui/launch/LaunchComponent";
import {CriticalErrorRendererWidget} from "./CriticalErrorRendererWidget";

/**
 *
 * @author Atzitz Amos
 * @date 11/16/2026
 * @since 1.0.0
 */
export class CriticalErrorRenderer {
    public static renderCriticalError(source: string, error: Error) {
        const splash = LaunchComponent.getCurrentInstance()?.getSplashElement();
        if (splash) {
            CriticalErrorRendererWidget.renderStartupError(splash, source, error)
        } else {
            CriticalErrorRendererWidget.showOverlay(source, error)
        }
    }

    public static renderStartupWarning(source: string, message: string): Promise<void> {
        const splash = LaunchComponent.getCurrentInstance()?.getSplashElement();
        if (splash) {
            return CriticalErrorRendererWidget.renderStartupWarning(splash, source, message)
        }

        return Promise.resolve();
    }
}

/**
 *
 * @author Atzitz Amos
 * @date 8/12/2026
 * @since 1.0.0
 */
export class BrowserUtils {
    public static getBrowserName() {
        const userAgent = navigator.userAgent;
        if (userAgent.indexOf("Chrome") > -1) {
            return "Chrome";
        } else if (userAgent.indexOf("Firefox") > -1) {
            return "Firefox";
        } else if (userAgent.indexOf("Safari") > -1) {
            return "Safari";
        } else if (userAgent.indexOf("Edge") > -1) {
            return "Edge";
        } else if (userAgent.indexOf("Opera") > -1 || userAgent.indexOf("OPR") > -1) {
            return "Opera";
        } else {
            return "Unknown";
        }
    }
}

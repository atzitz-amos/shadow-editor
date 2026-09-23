import {Service} from "../../../../core/threaded/service/Service";
import {IntentsAnalysis} from "./IntentsAnalysis";
import {IntentsRegistry} from "./IntentsRegistry";

/**
 *
 * @author Atzitz Amos
 * @date 9/23/2026
 * @since 1.0.0
 */
@Service
export class IntentAnalysisService {
    private static readonly _instance: IntentAnalysisService = new IntentAnalysisService();

    public static getInstance(): IntentAnalysisService {
        return IntentAnalysisService._instance;
    }

    begin() {

    }

    getIntentAnalysis() {
        return IntentsAnalysis.getInstance();
    }

    getAllIntents() {
        return IntentsRegistry.getAllIntents();
    }
}

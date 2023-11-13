import { AStepper, TWorld } from '@haibun/core/build/lib/defs.js';
import { AStorage } from '@haibun/domain-storage';
declare class haibunSolidLiteStepper extends AStepper {
    options: {
        STORAGE: {
            required: boolean;
            desc: string;
            parse: (input: string) => {
                error: string;
                result?: undefined;
            } | {
                result: string;
                error?: undefined;
            };
        };
        FOLDER: {
            required: boolean;
            desc: string;
            parse: (input: string) => {
                error: string;
                result?: undefined;
            } | {
                result: string;
                error?: undefined;
            };
        };
    };
    storage?: AStorage;
    folder: string;
    setWorld(world: TWorld, steppers: AStepper[]): Promise<void>;
    steps: {
        addSolidLiteRoutes: {
            gwta: string;
            action: () => Promise<import("@haibun/core/build/lib/defs.js").TOKActionResult>;
        };
    };
}
export default haibunSolidLiteStepper;

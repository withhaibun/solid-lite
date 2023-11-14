import { AStepper } from '@haibun/core/build/lib/defs.js';
import { actionOK, findStepperFromOption, getFromRuntime, getStepperOption, stringOrError } from '@haibun/core/build/lib/util/index.js';
import { WEBSERVER } from '@haibun/web-server-express/build/defs.js';
import { setSolidLiteRoutes } from './lib/haibunSolidLite.js';
const STORAGE = 'STORAGE';
const FOLDER = 'FOLDER';
class haibunSolidLiteStepper extends AStepper {
    options = {
        [STORAGE]: {
            required: true,
            desc: 'Storage type for files',
            parse: (input) => stringOrError(input),
        },
        [FOLDER]: {
            required: true,
            desc: 'Folder for files',
            parse: (input) => stringOrError(input),
        },
    };
    storage;
    folder;
    async setWorld(world, steppers) {
        await super.setWorld(world, steppers);
        this.storage = findStepperFromOption(steppers, this, this.getWorld().extraOptions, STORAGE);
        this.folder = getStepperOption(this, FOLDER, this.getWorld().extraOptions);
    }
    steps = {
        addSolidLiteRoutes: {
            gwta: 'start solid lite routes',
            action: async () => {
                const webserver = getFromRuntime(this.getWorld().runtime, WEBSERVER);
                setSolidLiteRoutes(webserver, this.storage, this.folder);
                return actionOK();
            },
        },
        fulfills: {
            gwta: 'fulfills: {what}',
            action: async () => {
                return actionOK();
            },
        }
    };
}
export default haibunSolidLiteStepper;
//# sourceMappingURL=haibunSolidLite-stepper.js.map
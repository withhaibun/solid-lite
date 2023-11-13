import { AStepper, TWorld } from '@haibun/core/build/lib/defs.js';
import { actionOK, findStepperFromOption, getFromRuntime, stringOrError } from '@haibun/core/build/lib/util/index.js';
import { AStorage } from '@haibun/domain-storage';
import { IWebServer, WEBSERVER } from '@haibun/web-server-express/build/defs.js';
import { setSolidLiteRoutes } from './lib/haibunSolidLite.js';

const STORAGE = 'STORAGE';
const FOLDER = 'FOLDER';

class haibunSolidLiteStepper extends AStepper {
  options = {
    [STORAGE]: {
      required: true,
      desc: 'Storage type for files',
      parse: (input: string) => stringOrError(input),
    },
    [FOLDER]: {
      required: true,
      desc: 'Folder for files',
      parse: (input: string) => stringOrError(input),
    },

  };
  storage?: AStorage;
  folder: string;
  async setWorld(world: TWorld, steppers: AStepper[]) {
    await super.setWorld(world, steppers);
    this.storage = findStepperFromOption(steppers, this, this.getWorld().extraOptions, STORAGE);
    this.folder = findStepperFromOption(steppers, this, this.getWorld().extraOptions, FOLDER);
  }

  steps = {
    addSolidLiteRoutes: {
      gwta: 'start tally route at {loc}',
      action: async () => {
        const webserver: IWebServer = getFromRuntime(this.getWorld().runtime, WEBSERVER);
        setSolidLiteRoutes(webserver, this.storage, this.folder)
        return actionOK();
      },
    },
  }
}

export default haibunSolidLiteStepper;


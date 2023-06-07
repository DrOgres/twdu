import TWDUItemSheet from "./sheet/TWDUItemSheet.js";
import TWDUActorSheet from "./sheet/TWDUActorSheet.js";
import {twdu} from "../module/config.js";

Hooks.once('init', async function () {
    console.log("TWDU | Initializing TWDU");

    CONFIG.twdu = twdu;

    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("twdu", TWDUItemSheet, { makeDefault: true });

    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("twdu", TWDUActorSheet, { makeDefault: true });

      // Preload Handlebars Templates
 //  preloadHandlebarsTemplates(); define in templates.js once we have our tabs defined

  Handlebars.registerHelper('TWDUconcat', function () {
    console.log('TWDU | TWDUconcat');
    let outStr = '';
    for (let arg in arguments) {
      if (typeof arguments[arg] != 'object') {
        outStr += arguments[arg];
      }
    }
    return outStr;
  });
    
});
    
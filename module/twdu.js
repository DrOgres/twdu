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
    console.log('TWDU | TWDUconcat: ' + arguments[0] + ' : ' + arguments[1]);
    let outStr = '';
    for (let arg in arguments) {
      if (typeof arguments[arg] != 'object') {
        outStr += arguments[arg];
      }
    }
    return outStr;
  });

  Handlebars.registerHelper('skillBlock', function () {
    console.log('TWDU | skillBlock ' + arguments[0] + ' : ' + arguments[1]);
    let arg = arguments[0];
    let outStr = '';
    for(let skill in arguments[1]) {
      if (arguments[1][skill].attribute == arg) {
        console.log('TWDU | skillBlock found ' + arg + ' : ' + arguments[1][skill].label);
        outStr += `<div>`+ game.i18n.localize('twdu.'+arguments[1][skill].label)+`</div> <input type="text" name="system.skills.`+arguments[1][skill].name+`" value="`+arguments[1][skill].value+`">`;
      }
    }
  
    return outStr;
  });
    

    
});
    
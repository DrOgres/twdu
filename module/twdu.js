import TWDUItemSheet from "./sheet/TWDUItemSheet.js";
import TWDUActorSheet from "./sheet/TWDUActorSheet.js";
import { preloadHandlebarsTemplates } from "./util/templates.js";
import { twdu } from "../module/config.js";

Hooks.once("init", async function () {
  console.log("TWDU | Initializing TWDU");

  CONFIG.twdu = twdu;

  CONFIG.TextEditor.enrichers = CONFIG.TextEditor.enrichers.concat([
    {
      pattern: /@RAW\[(.+?)\]/gm,
      enricher: async (match, options) => {
        const myData = await $.ajax({
          url: match[1],
          type: "GET",
        });
        const doc = document.createElement("span");
        doc.innerHTML = myData;
        return doc;
      },
    },
  ]);

  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("twdu", TWDUItemSheet, { makeDefault: true });

  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("twdu", TWDUActorSheet, { makeDefault: true });

  // Preload Handlebars Templates
  preloadHandlebarsTemplates();

  Handlebars.registerHelper("enrichHtmlHelper", function (rawText) {
    return TextEditor.enrichHTML(rawText, { async: false });
  });

  Handlebars.registerHelper("TWDUconcat", function () {
    console.log("TWDU | TWDUconcat: " + arguments[0] + " : " + arguments[1]);
    let outStr = "";
    for (let arg in arguments) {
      if (typeof arguments[arg] != "object") {
        outStr += arguments[arg];
      }
    }
    return outStr;
  });

});

import TWDUItemSheet from "./sheet/TWDUItemSheet.js";
import TWDUActorSheet from "./sheet/TWDUActorSheet.js";
import { preloadHandlebarsTemplates } from "./util/templates.js";
import { twdu } from "../module/config.js";
import FoundryOverrides from "./util/overrides.js";
import { increaseThreatLevel, decreaseThreatLevel } from "./util/threat.js";
import { YearZeroRollManager } from "./util/yzur.js";
import { ThreatLevelDisplay } from "./util/threat.js";
import { registerGameSettings } from "./util/settings.js";

Hooks.once("init", async function () {
  console.log("TWDU | Initializing TWDU");

  CONFIG.twdu = twdu;
  console.log("TWDU | CONFIG.twdu: ", CONFIG.twdu);

  //yzur init
  YearZeroRollManager.register("twdu", {
    "ROLL.chatTemplate": "systems/twdu/templates/dice/roll.hbs",
    "ROLL.tooltipTemplate": "systems/twdu/templates/dice/tooltip.hbs",
    "ROLL.infosTemplate": "systems/twdu/templates/dice/infos.hbs",
  });

  // Register custom system settings
  registerGameSettings();

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

  // Initialize the Threat Level
  ThreatLevelDisplay.initialize();

  Handlebars.registerHelper("enrichHtmlHelper", function (rawText) {
    return TextEditor.enrichHTML(rawText, { async: true });
  });

  Handlebars.registerHelper("TWDUconcat", function () {
    let outStr = "";
    for (let arg in arguments) {
      if (typeof arguments[arg] != "object") {
        outStr += arguments[arg];
      }
    }
    return outStr;
  });

  Handlebars.registerHelper("times", function (n, content) {
    let result = "";
    for (let i = 0; i < n; ++i) {
      content.data.index = i + 1;
      result = result + content.fn(i);
    }
    return result;
  });

  Handlebars.registerHelper("TWDUinvert", function () {
    let keys = Object.keys(arguments[0]);
    keys.sort(function (a, b) {
      return b - a;
    });
    let sorted = [];
    for (let i = 0; i < keys.length; i++) {
      let k = keys[i];
      sorted.push(arguments[0][k]);
    }
    return sorted;
  });

  Handlebars.registerHelper("subtract", function () {
    return arguments[0] - arguments[1];
  });

  // returns a count of the number of items in an array that match specified parameters
  // the arguments are [0] = array, up to length-1 = parameters to match
  Handlebars.registerHelper("TWDUEquippedCount", function () {
    let array = arguments[0];
    let count = 0;
    console.log("TWDU | array: ", array);
    console.log("TWDU | arguments[1]", arguments[1]);
    let parameter = arguments[1];

    let filteredArray = array.filter(function (item) {
      console.log("TWDU | item: ", item);
      return item[parameter];
    });
    console.log("TWDU | filteredArray: ", filteredArray);

    console.log("TWDU | filteredArray.length: ", filteredArray.length);
    for (let i = 0; i < filteredArray.length; i++) {
      console.log("TWDU | filteredArray[i]: ", filteredArray[i]);
      let test = filteredArray[i];
      console.log("TWDU | test: ", test);
      if (test.system.isEquipped) {
        count++;
      }
    }
    return count;
  });

  Handlebars.registerHelper("TWDUunEquippedCount", function () {
    let array = arguments[0];
    let count = 0;
    console.log("TWDU | array: ", array);
    console.log("TWDU | arguments[1]", arguments[1]);
    let parameter = arguments[1];

    let filteredArray = array.filter(function (item) {
      console.log("TWDU | item: ", item);
      return item[parameter];
    });
    console.log("TWDU | filteredArray: ", filteredArray);

    console.log("TWDU | filteredArray.length: ", filteredArray.length);
    for (let i = 0; i < filteredArray.length; i++) {
      console.log("TWDU | filteredArray[i]: ", filteredArray[i]);
      let test = filteredArray[i];
      console.log("TWDU | test: ", test);
      if (!test.system.isEquipped) {
        count++;
      }
    }
    return count;
  });
});

Hooks.on("getSceneControlButtons", (controls) => {
  let group = controls.find((c) => c.name === "token");
  group.tools.push(
    {
      name: "add",
      // TODO localize this
      title: "Increase Threat Level",
      icon: "fas fa-plus",
      buttons: true,
      visible: game.user.isGM,
      onClick: () => increaseThreatLevel(1),
    },
    {
      name: "subtract",
      // TODO localize this
      title: "Decrease Threat Level",
      icon: "fas fa-minus",
      buttons: true,
      visible: game.user.isGM,
      onClick: () => decreaseThreatLevel(1),
    },
    {
      name: "showInterface",
      title: "Show Threat Interface",
      icon: "fas fa-biohazard",
      buttons: true,
      visible: game.settings.get("twdu", "threatLevelVisibility")
        ? true
        : game.user.isGM,
      onClick: () => {
        ThreatLevelDisplay.render();
      },
    }
  );
});

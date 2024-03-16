import TWDUItemSheet from "./sheet/TWDUItemSheet.js";
import TWDUActorSheet from "./sheet/TWDUActorSheet.js";
import TWDUActor from "./TWDUActor.js";
import { preloadHandlebarsTemplates } from "./util/templates.js";
import { twdu } from "../module/config.js";
import FoundryOverrides from "./util/overrides.js";
import { increaseThreatLevel, decreaseThreatLevel } from "./util/threat.js";
import { YearZeroRollManager } from "./util/yzur.js";
import { ThreatLevelDisplay } from "./util/threat.js";
import { registerGameSettings } from "./util/settings.js";
import { migrate } from "./util/migration.js";

Hooks.once("init", async function () {
  console.log("TWDU | Initializing TWDU");
  CONFIG.twdu = twdu;
  console.log("TWDU | CONFIG.twdu: ", CONFIG.twdu);

  CONFIG.Actor.documentClass = TWDUActor;

  

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

  Handlebars.registerHelper("parseActor", function (actorId, part) {
    let actor = game.actors.get(actorId);
    if(part === "name"){return actor.name;}
    else {return actorId;}
  
  });

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
    let parameter = arguments[1];

    let filteredArray = array.filter(function (item) {     
      return item[parameter];
    });

    for (let i = 0; i < filteredArray.length; i++) {
      let test = filteredArray[i];
      if (test.system.isEquipped) {
        count++;
      }
    }
    return count;
  });

  Handlebars.registerHelper("TWDUunEquippedCount", function () {
    let array = arguments[0];
    let count = 0;
    let parameter = arguments[1];

    let filteredArray = array.filter(function (item) {
      return item[parameter];
    });
    for (let i = 0; i < filteredArray.length; i++) {
      let test = filteredArray[i];
      if (!test.system.isEquipped) {
        count++;
      }
    }
    return count;
  });

  Handlebars.registerHelper("TWDU_checked", function (value, test) {
    console.log("TWDU | TWDU_checked: ", value, test);
    if(value == undefined) return "";
    return value == test ? "checked" : "";
  });
});

  
Hooks.on("renderPause", (_app, html) => {
  html
    .find("img")
    .attr("src", "systems/twdu/assets/images/misc/hand.png");
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

Hooks.once("diceSoNiceReady", (dice3d) => {
  dice3d.addSystem({ id: "twdu", name: "The Walking Dead Universe" }, "true");
  dice3d.addColorset({
    name: "twduz",
    description: "The Walking Dead Stress Dice",
    category: "The Walking Dead Universe",
    foreground: "#000",
    background: "#ac1431",
    outline: "#ac1433",
    material: "plastic",
    default: true,
  });
  dice3d.addColorset({
    name: "twdu",
    description: "The Walking Dead Base Dice",
    category: "The Walking Dead Universe",
    foreground: "#fff",
    background: "#000",
    outline: "#000",
    material: "plastic",
    default: true,
  });
  dice3d.addDicePreset({
    type: "d6",
    labels: [
      "systems/twdu/assets/images/dsn/dsn-ds-1.png",
      "systems/twdu/assets/images/dsn/dsn-ds-2.png",
      "systems/twdu/assets/images/dsn/dsn-ds-3.png",
      "systems/twdu/assets/images/dsn/dsn-ds-4.png",
      "systems/twdu/assets/images/dsn/dsn-ds-5.png",
      "systems/twdu/assets/images/dsn/dsn-ds-6.png",
    ],
    colorset: "twdu",
    system: "twdu",
  });
  dice3d.addDicePreset(
    {
      type: "ds",
      labels: [
        "systems/twdu/assets/images/dsn/dsn-ds-1.png",
        "systems/twdu/assets/images/dsn/dsn-ds-2.png",
        "systems/twdu/assets/images/dsn/dsn-ds-3.png",
        "systems/twdu/assets/images/dsn/dsn-ds-4.png",
        "systems/twdu/assets/images/dsn/dsn-ds-5.png",
        "systems/twdu/assets/images/dsn/dsn-ds-6.png",
      ],
      colorset: "twdu",
      system: "twdu",
    },
    "d6"
  );
  dice3d.addDicePreset(
    {
      type: "dz",
      labels: [
        "systems/twdu/assets/images/dsn/dsn-dz-1.png",
        "systems/twdu/assets/images/dsn/dsn-dz-2.png",
        "systems/twdu/assets/images/dsn/dsn-dz-3.png",
        "systems/twdu/assets/images/dsn/dsn-dz-4.png",
        "systems/twdu/assets/images/dsn/dsn-dz-5.png",
        "systems/twdu/assets/images/dsn/dsn-dz-6.png",
      ],
      colorset: "twduz",
      system: "twdu",
    },
    "d6"
  );
});


Hooks.on('preCreateToken', async (document, tokenData, options, userID) => {

  const actor = game.actors.get(tokenData.actorId);
  const actorId = actor.id;
  console.log("test | preCreateToken", document, actor, actorId);
  
  if (actor.type === 'npc') {
    document.update({_id: actorId , disposition: CONST.TOKEN_DISPOSITIONS.HOSTILE, actorLink: false });
  }
});

Hooks.on('dropActorSheetData', async (actor, sheet, data) => {
  // When dropping something on a haven sheet.
  if (actor.type === 'haven' || actor.type === 'challenge') {
    // When dropping an actor on a haven sheet.
    if (data.type === 'Actor') {
      let survivor = await fromUuid(data.uuid);
      sheet._dropSurvivor(survivor.id);
    }

    // let survivor = await fromUuid(data.uuid);
    // if (data.type === 'Actor') sheet._dropSurvivor(survivor.id);
  }
});

Hooks.once("ready", async function () {
  migrate();
  //FoundryOverrides.override();
});

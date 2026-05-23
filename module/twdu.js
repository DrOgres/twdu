import TWDUItemSheet from "./sheet/TWDUItemSheet.js";
import TWDUActor from "./TWDUActor.js";
import { preloadHandlebarsTemplates } from "./util/templates.js";
import { twdu } from "../module/config.js";
import { increaseThreatLevel, decreaseThreatLevel } from "./util/threat.js";
import { YearZeroRollManager } from "./util/yzur.js";
import { ThreatLevelDisplay } from "./util/threat.js";
import { registerGameSettings } from "./util/settings.js";
import { migrate } from "./util/migration.js";
import TWDUActorSheetPC from "./sheet/TWDUActorSheetPC.js";
import TWDUActorSheetNPC from "./sheet/TWDUActorSheetNPC.js";
import TWDUActorSheetAnimal from "./sheet/TWDUActorSheetAnimal.js";
import TWDUActorSheetHaven from "./sheet/TWDUActorSheetHaven.js";
import TWDUActorSheetChallenge from "./sheet/TWDUActorSheetChallenge.js";
import ChatMessageTWDU from "./util/chat.js";

Hooks.once("init", async function () {
  console.log("TWDU | Initializing TWDU");
  CONFIG.twdu = twdu;
  console.log("TWDU | CONFIG.twdu: ", CONFIG.twdu);

  CONFIG.Actor.documentClass = TWDUActor;
  CONFIG.ChatMessage.documentClass = ChatMessageTWDU;

  

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
        console.log("TWDU | enricher: ", doc);
        return doc;
      },
    },
  ]);

  const { ActorSheetV2, ItemSheetV2 } = foundry.applications.sheets;
  const { DocumentSheetConfig } = foundry.applications.apps;

  try {
    DocumentSheetConfig.unregisterSheet(foundry.documents.Item, "core", ItemSheetV2);
  } catch (_error) {
    // Core sheet availability can vary between Foundry builds.
  }

  DocumentSheetConfig.registerSheet(foundry.documents.Item, "twdu", TWDUItemSheet, { makeDefault: true });

  try {
    DocumentSheetConfig.unregisterSheet(foundry.documents.Actor, "core", ActorSheetV2);
  } catch (_error) {
    // Core sheet availability can vary between Foundry builds.
  }
  DocumentSheetConfig.registerSheet(foundry.documents.Actor, "twdu", TWDUActorSheetPC, { types: ["character"], makeDefault: true, label: "TWDU.SheetClassCharacter" });
  DocumentSheetConfig.registerSheet(foundry.documents.Actor, "twdu", TWDUActorSheetNPC, { types: ["npc"], makeDefault: true, label: "TWDU.SheetClassNPC" });
  DocumentSheetConfig.registerSheet(foundry.documents.Actor, "twdu", TWDUActorSheetAnimal, { types: ["animal"], makeDefault: true, label: "TWDU.SheetClassAnimal" });
  DocumentSheetConfig.registerSheet(foundry.documents.Actor, "twdu", TWDUActorSheetHaven, { types: ["haven"], makeDefault: true, label: "TWDU.SheetClassHaven" });
  DocumentSheetConfig.registerSheet(foundry.documents.Actor, "twdu", TWDUActorSheetChallenge, { types: ["challenge"], makeDefault: true, label: "TWDU.SheetClassChallenge" });

  // "Actor": {
  //   "types": [
  //       "character",
  //       "challenge",
  //       "haven",
  //       "npc",
  //       "animal"
        
  //   ],

  Hooks.on("renderChatMessageHTML", (app, html, data) => {
    ChatMessageTWDU.activateListeners(html);
    ChatMessageTWDU.hideChatActionButtons(app, html, data);
  });
  


  // Preload Handlebars Templates
  preloadHandlebarsTemplates();

  // Initialize the Threat Level
  ThreatLevelDisplay.initialize();

  Handlebars.registerHelper("parseActor", function (actorId, part) {
    let actor = game.actors.get(actorId);
    if(part === "name"){return actor.name;}
    else if(part === "img"){return actor.img;}
    else if(part === "archetype"){return actor.system.archetype;}
    else if(part === "background"){return actor.system.background;}
    else {return actorId;}
  
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
    // console.log("TWDU | TWDU_checked: ", value, test);
    if(value == undefined) return "";
    return value == test ? "checked" : "";
  });
});

Handlebars.registerHelper('lookupOrDefault', function (object, propertyName, defaultValue, options) {
  let result = options.lookupProperty(object, propertyName)
  if (result != '') {
      return result
  };
  return defaultValue;
});
  
Hooks.on("renderPause", (_app, html) => {
  html.querySelector("img")?.setAttribute("src", "systems/twdu/assets/images/misc/hand.png");
});

Handlebars.registerHelper('lowercase', function (string){
  let result = string.toLowerCase();
  return result;
});



Hooks.on("getSceneControlButtons", (controls) => {

  const tokenControls = Array.isArray(controls)
				? controls.find((c) => c.name === "token")
				: controls.tokens;
	if (!tokenControls) return;

  const tools = tokenControls.tools;

    tools['threatLevelIncrease'] = {
      icon: "fas fa-plus",
      name: "threatLevelIncrease",
      order: 90,
      title: "CONTROL.addThreatLevel",
      visible: game.user.isGM,
      onChange: () => increaseThreatLevel(1),
       button: true
    }

        tools['threatLevelDecrease'] = {
      icon: "fas fa-minus",
      name: "threatLevelDecrease",
      order: 91,
      title: "CONTROL.subThreatLevel",
      visible: game.user.isGM,
      onChange: () => decreaseThreatLevel(1),
       button: true
    }

        tools['threatLevelVisibility'] = {
      icon: "fas fa-biohazard",
      name: "threatLevelVisibility",
      order: 92,
      title: "CONTROL.displayThreatLevel",
      visible: game.settings.get("twdu", "threatLevelVisibility")
        ? true
        : game.user.isGM,
      onChange: () => {
        ThreatLevelDisplay.render();
      },
       button: true
    }

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

  const actor = game.actors.get(tokenData.actorId ?? document.actorId);
  if (!actor) return;
  
  if (actor.type === 'npc') {
    document.updateSource({ disposition: CONST.TOKEN_DISPOSITIONS.HOSTILE, actorLink: false });
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
});

import TWDUItemSheet from "./sheet/TWDUItemSheet.js";
// import TWDUActorSheet from "./sheet/TWDUActorSheet.js";
import TWDUActor from "./TWDUActor.js";
import { preloadHandlebarsTemplates } from "./util/templates.js";
import { twdu } from "../module/config.js";
import FoundryOverrides from "./util/overrides.js";
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
// import TWDUActorSheetPCv2 from "./sheet/TWDUActorSheetPCv2.js";

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
        console.log("TWDU | enricher: ", doc);
        return doc;
      },
    },
  ]);

  Items.unregisterSheet("core", ItemSheet);

  Items.registerSheet("twdu", TWDUItemSheet, { makeDefault: true });

  Actors.unregisterSheet("core", ActorSheet);
  //TODO set up sheets for each actor type to be able to set default options correctly for each type
  // Actors.registerSheet("twdu", TWDUActorSheet, { makeDefault: true });

  Actors.registerSheet("twdu", TWDUActorSheetPC, { types: ["character"], makeDefault: true, label: "TWDU.SheetClassCharacter" });
  Actors.registerSheet("twdu", TWDUActorSheetNPC, { types: ["npc"], makeDefault: true, label: "TWDU.SheetClassNPC" });
  Actors.registerSheet("twdu", TWDUActorSheetAnimal, { types: ["animal"], makeDefault: true, label: "TWDU.SheetClassAnimal" });
  Actors.registerSheet("twdu", TWDUActorSheetHaven, { types: ["haven"], makeDefault: true, label: "TWDU.SheetClassHaven" });
  Actors.registerSheet("twdu", TWDUActorSheetChallenge, { types: ["challenge"], makeDefault: true, label: "TWDU.SheetClassChallenge" });



  // Actors.registerSheet("dnd5e", ActorSheet5eCharacter, {
  //   types: ["character"],
  //   label: "DND5E.SheetClassCharacterLegacy"
  // });
  // DocumentSheetConfig.registerSheet(Actor, "dnd5e", ActorSheet5eCharacter2, {
  //   types: ["character"],
  //   makeDefault: true,
  //   label: "DND5E.SheetClassCharacter"
  // });

  // "Actor": {
  //   "types": [
  //       "character",
  //       "challenge",
  //       "haven",
  //       "npc",
  //       "animal"
        
  //   ],




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
  html
    .find("img")
    .attr("src", "systems/twdu/assets/images/misc/hand.png");
});

Handlebars.registerHelper('lowercase', function (string){
  let result = string.toLowerCase();
  return result;
});



Hooks.on("getSceneControlButtons", function (controls) {

  console.log(controls);
  let group = controls.tokens;
  let tools = group.tools;
  const newButtonGroup = {
    threatLevelIncrease : {
      icon: "fas fa-plus",
      name: "add",
      order: 90,
      title: "CONTROL.addThreatLevel",
      visible: game.user.isGM,
      onChange: ()=> increaseThreatLevel(1),
       button: true
    },
    threatLevelDecrease:
    {
      name: "subtract",
      title: "CONTROL.subThreatLevel",
      icon: "fas fa-minus",
      button: true,
      visible: game.user.isGM,
      order: 91,
      onClick: () => decreaseThreatLevel(1),
    },
    threatLevelVisibility:
    {
      name: "showInterface",
      title: "CONTROL.displayThreatLevel",
      icon: "fas fa-biohazard",
      button: true,
      order: 92,
      visible: game.settings.get("twdu", "threatLevelVisibility")
        ? true
        : game.user.isGM,
      onClick: () => {
        ThreatLevelDisplay.render();
      },
    }
  };
  let newTools = {...tools, ...newButtonGroup};
 group.tools = {...tools, ...newButtonGroup};
  console.log("SceneControlTool: ", controls.tokens.tools.threatLevelIncrease);
  console.log("Button boolean on add button: ", controls.tokens.tools.threatLevelIncrease.button );
  console.log(controls);
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

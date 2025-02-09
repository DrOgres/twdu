import { displayThreatLevel, getThreatLevel } from "./threat.js";


export const registerGameSettings = function () {
  game.settings.register("twdu", "threatLevel", {
    name: game.i18n.localize("twdu.threatLevel"),
    hint: game.i18n.localize("twdu.threatLevel"),
    scope: "world",
    config: false,
    type: Number,
    default: 1,
    onChange: () => {
      displayThreatLevel(getThreatLevel());
    },
  });



  game.settings.register("twdu", "threatLevelVisibility", {
    name: game.i18n.localize("twdu.threatDisplay"),
    hint: game.i18n.localize("twdu.threatDisplayHint"),
    scope: "world",
    config: true,
    type: Boolean,
    default: false,
    onChange: foundry.utils.debouncedReload,
  });

  game.settings.register("twdu", "defaultTokenSettings", {
    name: "twdu.prototypeTokenSettings",
    hint: "twdu.prototypeTokenSettingsHint",
    scope: "world",
    config: true,
    default: true,
    type: Boolean,
    onChange: foundry.utils.debouncedReload,
  });

  game.settings.register("twdu", "havenSurvivorDisplaySetting", {
    name: "twdu.havenSurvivorDisplay",
    hint: "twdu.havenSurvivorDisplayHint",
    scope: "client",
    config: true,
    restricted: false,
    type: Boolean,
    default: true,
    onChange: foundry.utils.debouncedReload,
  });

  game.settings.register("twdu", "systemMigrationVersion", {
    config: false,
    scope: "world",
    type: String,
    default: "",
  });
};

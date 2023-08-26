/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function () {
  // Define template paths to load
  const templatePaths = [
    // Actor Sheet Partials
    "systems/twdu/templates/sheets/parts/character-inventory.hbs",
    "systems/twdu/templates/sheets/parts/character-notes.hbs",
    "systems/twdu/templates/sheets/parts/character-talents.hbs",
    "systems/twdu/templates/sheets/parts/character-main.hbs",

    // sheet templates
    "systems/twdu/templates/sheets/character-sheet.hbs",
    "systems/twdu/templates/sheets/gear-sheet.hbs",
    "systems/twdu/templates/sheets/vehicle-sheet.hbs",
    "systems/twdu/templates/sheets/weapon-sheet.hbs",
    "systems/twdu/templates/sheets/armor-sheet.hbs",
    "systems/twdu/templates/sheets/challenge-sheet.hbs",
    "systems/twdu/templates/sheets/criticalInjury-sheet.hbs",
    "systems/twdu/templates/sheets/haven-sheet.hbs",
    "systems/twdu/templates/sheets/project-sheet.hbs",
    "systems/twdu/templates/sheets/talent-sheet.hbs",
    "systems/twdu/templates/sheets/tinyItem-sheet.hbs",

    // dice templates
    "systems/twdu/templates/dice/infos.hbs",
    "systems/twdu/templates/dice/roll.hbs",
    "systems/twdu/templates/dice/tooltip.hbs",

    //chat templates
    "systems/twdu/templates/ui/threat-level-display.html",
    "systems/twdu/templates/chat/chatWeapon.hbs",
    "systems/twdu/templates/chat/chatArmor.hbs"
  ];

  // Load the template parts
  return loadTemplates(templatePaths);
};

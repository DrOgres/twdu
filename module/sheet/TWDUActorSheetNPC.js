import TWDUActorSheet from "./TWDUActorSheet.js";

export default class TWDUActorSheetNPC extends TWDUActorSheet {
  static DEFAULT_OPTIONS = foundry.utils.mergeObject(super.DEFAULT_OPTIONS, {
    classes: ["twdu", "sheet", "actor", "npc"],
    position: { width: 800, height: 800 },
  }, { inplace: false });

  static PARTS = {
    sheet: { template: "systems/twdu/templates/sheets/npc-sheet.hbs" },
  };
}

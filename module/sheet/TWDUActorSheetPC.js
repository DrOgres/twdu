import TWDUActorSheet from "./TWDUActorSheet.js";

export default class TWDUActorSheetPC extends TWDUActorSheet {
  static DEFAULT_OPTIONS = foundry.utils.mergeObject(super.DEFAULT_OPTIONS, {
    classes: ["twdu", "sheet", "actor", "pc"],
    position: { width: 800, height: 800 },
  }, { inplace: false });

  static PARTS = {
    sheet: { template: "systems/twdu/templates/sheets/character-sheet.hbs" },
  };
}

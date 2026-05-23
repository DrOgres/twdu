import TWDUActorSheet from "./TWDUActorSheet.js";

export default class TWDUActorSheetHaven extends TWDUActorSheet {
  static DEFAULT_OPTIONS = foundry.utils.mergeObject(super.DEFAULT_OPTIONS, {
    classes: ["twdu", "sheet", "actor", "haven"],
    position: { width: 800, height: "auto" },
  }, { inplace: false });

  static PARTS = {
    sheet: { template: "systems/twdu/templates/sheets/haven-sheet.hbs" },
  };
}

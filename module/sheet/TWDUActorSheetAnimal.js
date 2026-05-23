import TWDUActorSheet from "./TWDUActorSheet.js";

export default class TWDUActorSheetAnimal extends TWDUActorSheet {
  static DEFAULT_OPTIONS = foundry.utils.mergeObject(super.DEFAULT_OPTIONS, {
    classes: ["twdu", "sheet", "actor", "animal"],
    position: { width: 800, height: 460 },
  }, { inplace: false });

  static PARTS = {
    sheet: { template: "systems/twdu/templates/sheets/animal-sheet.hbs" },
  };
}

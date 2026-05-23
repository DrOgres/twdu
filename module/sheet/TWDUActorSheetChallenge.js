import TWDUActorSheet from "./TWDUActorSheet.js";

export default class TWDUActorSheetChallenge extends TWDUActorSheet {
  static DEFAULT_OPTIONS = foundry.utils.mergeObject(super.DEFAULT_OPTIONS, {
    classes: ["twdu", "sheet", "actor", "challenge"],
    position: { width: 850, height: "auto" },
  }, { inplace: false });

  static PARTS = {
    sheet: { template: "systems/twdu/templates/sheets/challenge-sheet.hbs" },
  };
}

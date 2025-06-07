import TWDUActorSheet from "./TWDUActorSheet.js";

export default class TWDUActorSheetAnimal extends TWDUActorSheet {

    /** @override */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
        classes: ["twdu", "sheet", "actor", "animal"],
        template: "systems/twdu/templates/sheets/animal-sheet.hbs",
        width: 800,
        height: 460,
       tabs: [
        {
          navSelector: ".sheet-tabs",
          contentSelector: ".sheet-body",
          initial: "main",
        },
      ],
        dragDrop: [{ dragSelector: ".item-list .item", dropSelector: null }],
        });
    }

}
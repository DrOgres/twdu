import TWDUActorSheet from "./TWDUActorSheet.js";

export default class TWDUActorSheetPC extends TWDUActorSheet {

    /** @override */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
        classes: ["twdu", "sheet", "actor", "pc"],
        template: "systems/twdu/templates/sheets/character-sheet.hbs",
        width: 800,
        height: 800,
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
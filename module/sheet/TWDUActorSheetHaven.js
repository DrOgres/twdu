import TWDUActorSheet from "./TWDUActorSheet.js";

export default class TWDUActorSheetHaven extends TWDUActorSheet {

    /** @override */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
        classes: ["twdu", "sheet", "actor", "haven"],
        template: "systems/twdu/templates/actor/haven-sheet.html",
        width: 800,
        height: "min-content",
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
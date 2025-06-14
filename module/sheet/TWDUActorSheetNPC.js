import TWDUActorSheet from "./TWDUActorSheet.js";

export default class TWDUActorSheetNPC extends TWDUActorSheet {

    /** @override */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
        classes: ["twdu", "sheet", "actor", "npc"],
        template: "systems/twdu/templates/sheets/npc-sheet.hbs",
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
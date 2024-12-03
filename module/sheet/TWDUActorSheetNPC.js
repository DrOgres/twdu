import TWDUActorSheet from "./TWDUActorSheet.js";

export default class TWDUActorSheetNPC extends TWDUActorSheet {

    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
        classes: ["twdu", "sheet", "actor", "npc"],
        template: "systems/twdu/templates/actor/npc-sheet.html",
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
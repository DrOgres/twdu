import TWDUActorSheet from "./TWDUActorSheet.js";

export default class TWDUActorSheetChallenge extends TWDUActorSheet {

    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
        classes: ["twdu", "sheet", "actor", "challenge"],
        template: "systems/twdu/templates/actor/challenge-sheet.html",
        width: 850,
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
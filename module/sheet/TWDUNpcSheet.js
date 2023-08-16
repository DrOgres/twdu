import { TWDUActorSheet } from "./TWDUActorSheet.js";

export  class TWDUNPCSheet extends TWDUActorSheet {

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
          classes: ["twdu", "sheet", "actor"],
          width: 750,
          height: 750 ,
          resizable: true,
          tabs: [
            {
              navSelector: ".sheet-tabs",
              contentSelector: ".sheet-body",
              initial: "main",
            },
          ],
        });
      }


}
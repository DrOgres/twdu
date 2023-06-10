export default class TWDUActorSheet extends ActorSheet {

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
          classes: ["twdu", "sheet", "actor"],
          width: 750,
          height: 800 - 'min-content',
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

    get template() {
        return `systems/twdu/templates/sheets/${this.actor.type}-sheet.hbs`;
    }   

    getData() { 
        const data = super.getData();
        console.log('TWDU | getData()', this.actor.system.skills);
        data.config = CONFIG.twdu;
        return data;
    }

}
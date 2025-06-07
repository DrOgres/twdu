import Clock from "../util/clock.js";


export default class TWDUItemSheet extends foundry.appv1.sheets.ItemSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["twdu", "sheet", "item", "item-sheet"],
      width: 550,
      // height: 489 + 'max-content',
      // height: 566 - 'max-content',
      height: 370 - "max-content",
      tabs: [
        {
          navSelector: ".sheet-tabs",
          contentSelector: ".sheet-body",
          initial: "general",
        },
      ],
    });
  }



  get template() {
    return `systems/twdu/templates/sheets/${this.item.type}-sheet.hbs`;
  }

  async itemClock() {
    // Only item types that have a clock should return a clock
    const newClock = new Clock(6);
    const clockTypes = ["rumor", "endgame", "faction"];
    console.log("TWDU | clock: ", newClock );
    console.log("TWDU | clockTypes: ", clockTypes);
    console.log("TWDU | item: ", this.item.type);
    if (!clockTypes.includes(this.item.type)) {
      return newClock;
    }
    

      console.log("TWDU | item: ", this.item.type);
      console.log("TWDU | clock: ", this.clock);

   return;
    //return new Clock();
  }

  async getData() {
    const data = super.getData();
    const source = this.item.toObject();
    data.config = CONFIG.twdu;
    data.source = source;
    data.user = game.user;
    console.log(data.user);
    
    this.itemClock().then((clock) => {
      console.log("TWDU | clock: ", clock);
      data.clock = clock;
      console.log("TWDU | data: ", data);

    });
    console.log("TWDU | data: ", data);
    return data;
  }

  activateListeners(html) {
    super.activateListeners(html);
    html.find(".toggle-boolean").click(this._onToggleClick.bind(this));
    html.find(".type-change").click(this._onTypeChange.bind(this));
  }

  // force sheet update when type changes
  async _onTypeChange(event) {
    this.item.update();
  }

  _onToggleClick(event) {
    console.log("TWDU | _onToggleClick: ", event);
    event.preventDefault();
    const element = event.currentTarget;
    const path = element.dataset.path;
    switch (path) {
      case "hasBonus":
        {
          const value = this.item.system.hasBonus;
          this.item.update({ "system.hasBonus": !value });
        }
        break;
      case "isExplosive": {
        const value = this.item.system.isExplosive;
        this.item.update({ "system.isExplosive": !value });
      }
      break;
      case "isSecret": {
        const value = this.item.system.isSecret;
        this.item.update({ "system.isSecret": !value });
      }
      break;
    }
  }
}

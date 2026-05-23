import Clock from "../util/clock.js";

const { ItemSheetV2 } = foundry.applications.sheets;
const { HandlebarsApplicationMixin } = foundry.applications.api;

export default class TWDUItemSheet extends HandlebarsApplicationMixin(ItemSheetV2) {
  static DEFAULT_OPTIONS = {
    tag: "div",
    classes: ["twdu", "sheet", "item", "item-sheet"],
    position: { width: 550, height: "auto" },
    window: { resizable: true },
    form: {
      handler: async function (event, form, formData) {
        const submitData = this._prepareSubmitData(event, form, formData);
        await this._processSubmitData(event, form, submitData);
      },
      submitOnChange: true,
      closeOnSubmit: false,
    },
  };

  static PARTS = {
    sheet: { template: "systems/twdu/templates/sheets/item-sheet-v2.hbs" },
  };

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

  get object() {
    return this.document;
  }

  get form() {
    return this.element?.querySelector("form") ?? null;
  }

  _toggleDisabled(disabled) {
    const form = this.form;
    if (!form) return;
    for (const element of form.elements) element.disabled = disabled;
    for (const img of form.querySelectorAll("img[data-edit]")) {
      img.classList.toggle("disabled", disabled);
    }
  }

  async _prepareContext(options) {
    const data = await super._prepareContext(options);
    const source = this.item.toObject();
    data.config = CONFIG.twdu;
    data.cssClass = this.constructor.DEFAULT_OPTIONS.classes.join(" ");
    data.item = this.item;
    data.data = source;
    data.source = source;
    data.user = game.user;
    data.sheetTemplate = `systems/twdu/templates/sheets/${this.item.type}-sheet.hbs`;
    data.clock = await this.itemClock();
    return data;
  }

  async _onRender(context, options) {
    await super._onRender(context, options);
    this._activateFormListeners();
    this.activateListeners($(this.element));
  }

  _activateFormListeners() {
    const form = this.form;
    if (!form) return;
    form.addEventListener("change", this._onLegacyFormSubmit.bind(this));
    form.addEventListener("submit", this._onLegacyFormSubmit.bind(this));
  }

  async _onLegacyFormSubmit(event) {
    event.preventDefault();
    if (!this.isEditable) return;
    const form = this.form;
    if (!form) return;
    const formData = new foundry.applications.ux.FormDataExtended(form);
    const submitData = this._prepareSubmitData(event, form, formData);
    await this._processSubmitData(event, form, submitData);
  }

  activateListeners(html) {
    html.find("img[data-edit]").click(this._onEditImage.bind(this));
    html.find(".toggle-boolean").click(this._onToggleClick.bind(this));
    html.find(".type-change").click(this._onTypeChange.bind(this));
  }

  _onEditImage(event) {
    event.preventDefault();
    const attr = event.currentTarget.dataset.edit;
    const current = foundry.utils.getProperty(this.item, attr);
    new foundry.applications.apps.FilePicker({
      type: "image",
      current,
      callback: (path) => this.item.update({ [attr]: path }),
      document: this.item,
    }).render({ force: true });
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

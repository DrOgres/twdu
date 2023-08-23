export default class TWDUItemSheet extends ItemSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
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

  async getData() {
    const data = super.getData();
    const source = this.item.toObject();
    data.config = CONFIG.twdu;
    data.source = source;
    console.log("TWDU | data: ", data);
    if (data.source.type == "gear") {
      data.gearNotesHTML = await TextEditor.enrichHTML(
        data.source.system.description,
        {
          async: true,
        }
      );
    }
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
    }
  }
}

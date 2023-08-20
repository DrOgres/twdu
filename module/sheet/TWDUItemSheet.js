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
        data.source.system.notes,
        {
          async: true,
        }
      );
      
    }
    return data;
  }
}

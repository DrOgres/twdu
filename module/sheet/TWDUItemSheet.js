export default class TWDUItemSheet extends ItemSheet {

    get template() {
        return `systems/twdu/templates/sheets/${this.item.type}-sheet.hbs`;
    }   

    getData() { 
        const data = super.getData();
        data.config = CONFIG.twdu;
        return data;
    }

}
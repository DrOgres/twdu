export default class TWDUActorSheet extends ActorSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["twdu", "sheet", "actor"],
      width: 750,
      height: 800 - "min-content",
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

  async getData() {
    const source = this.actor.toObject();
    const actorData = this.actor.toObject(false);

    const context = {
      actor: actorData,
      source: source.system,
      system: actorData.system,
      flags: this.actor.flags,
      items: actorData.items,
      effects: actorData.effects,
      owner: this.actor.isOwner,
      limited: this.actor.limited,
      options: this.options,
      editable: this.isEditable,
      type: this.actor.type,
      isPlayer: this.actor.type === "character",
      isHaven: this.actor.type === "haven",
      isChallenge: this.actor.type === "challenge",
      isNPC: this.actor.type === "npc",
      encumbrance: 0,
    };
    console.log("TWDU | context: ", context);
    console.log("TWDU | context.system.notes: ", context.system.notes);
    context.config = CONFIG.twdu;

    if (context.isPlayer) {
      console.log("TWDU | Enriching HTML");
      context.notesHTML = await TextEditor.enrichHTML(
        context.system.notes.value,
        {
          async: true,
        }
      );
    }

    if (context.isHaven) {
      context.havenNotes = await TextEditor.enrichHTML(
        context.system.notes.value,
        { async: true }
      );
    }

    this.computeItems(context);
    if (context.isPlayer) {
      this.computeSkills(context);
      context.encumbrance = this.computeEncumbrance(context);
    }
    return context;
  }

  computeSkills(context) {
    console.log("TWDU | computeSkills: ", context.system.skills);
    for (let skill of Object.values(context.system.skills)) {
      skill.hasStrength = skill.attribute === "str";
      skill.hasAgility = skill.attribute === "agl";
      skill.hasWits = skill.attribute === "wit";
      skill.hasEmpathy = skill.attribute === "emp";
    }
  }

  computeItems(data) {
    for (let item of Object.values(data.items)) {
      item.isWeapon = item.type === "weapon";
      item.isArmor = item.type === "armor";
      item.isGear = item.type === "gear";
      item.isTinyItem = item.type === "tinyItem";
      item.isTalent = item.type === "talent";
      item.isCriticalInjury = item.type === "criticalInjury";
      item.isProject = item.type === "project";
    }
  }

  computeEncumbrance(data) {
    // get the equiped items and sum their weight

    let encumbrance = 0;
    for(let item of Object.values(data.items)) {
      console.log("TWDU | item: ", item);
      if(item.system.isEquipped) {
        encumbrance += item.system.weight;
      }
    }

    console.log("TWDU | encumbrance: ", encumbrance);
    return encumbrance;
  }

  activateListeners(html) {
    super.activateListeners(html);
    html.find(".toggle-boolean").click(this._onToggleClick.bind(this));
    html.find(".equip").click(this._onEquipClick.bind(this));
  }

  _onToggleClick(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const path = element.dataset.path;
    switch (path) {
      case "driveUsed":
        {
          const value = this.actor.system.driveUsed;
          this.actor.update({ "system.driveUsed": !value });
        }
        break;
    }
  }

  _onEquipClick(event) {
    event.preventDefault();
    console.log("TWDU | _onEquipClick: ", event);
    const div = $(event.currentTarget).parents(".item");
    const item = this.actor.items.get(div.data("itemId"));
    // get the item id from the data attribute
    //const itemId = element.dataset.itemId;
    console.log("TWDU | item: ", item);
    //item.system.isEquipped = !item.system.isEquipped;
    item.update({ "system.isEquipped": !item.system.isEquipped });

  }
}

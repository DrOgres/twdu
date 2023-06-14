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
    };
    console.log("TWDU | context: " + context);
    context.config = CONFIG.twdu;
    this.computeItems(context);
    this.computeSkills(context);

    return context;
  }

  
  computeSkills(context) {
    console.log("TWDU | computeSkills: " + context.system.skills);
    for (let skill of Object.values(context.system.skills)) {
      skill.hasStrength = skill.attribute === "str";
      skill.hasAgility = skill.attribute === "agl";
      skill.hasWits = skill.attribute === "wit";
      skill.hasEmpathy = skill.attribute === "emp";
    }
  }


  computeItems(data) {
    for(let item of Object.values(data.items)) {
      item.isWeapon = item.type === "weapon";
      item.isArmor = item.type === "armor";
      item.isGear = item.type === "gear";
      item.isTinyItem = item.type === "tinyItem";
      item.isTalent = item.type === "talent";
      item.isCriticalInjury = item.type === "criticalInjury";
      item.isProject = item.type === "project";

    }
}

}


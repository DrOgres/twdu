import { buildChatCard } from "../util/chat.js";
import { prepareRollDialog } from "../util/roll.js";


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
      maxEncumbrance: 0,
    };
    console.log("TWDU | context: ", context);
    console.log("TWDU | context.system.notes: ", context.system.notes);
    context.config = CONFIG.twdu;

    if (context.isPlayer) {

      context.maxEncumbrance = context.system.attributes.str.value + 2;
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
        encumbrance += Number(item.system.weight);
      }
    }
    console.log("TWDU | encumbrance: ", encumbrance);
    return encumbrance;
  }

  //TODO break out specific listeners to files for each type of sheet
  activateListeners(html) {
    super.activateListeners(html);
    html.find(".toggle-boolean").click(this._onToggleClick.bind(this));
    html.find(".equip").click(this._onEquipClick.bind(this));
    html
    .find(".exp-boxes")
    .on("click contextmenu", this._onExpChange.bind(this));
    html.find(".add-item").click(this._onItemCreate.bind(this));
    html.find(".item-delete").click(this._onItemDelete.bind(this));
    html.find(".item-edit").click(this._onItemEdit.bind(this));
    html.find(".to-chat").click(this._onItemToChat.bind(this));
    html.find(".rollable").click(this._onRoll.bind(this));
  }

  _onRoll(event) {
    event.preventDefault();
    console.log("TWDU | _onRoll: ", event);
    let target = event.currentTarget;
    let key = target.dataset.key;
    console.log("TWDU | sheet: ", this  );
    let options = {
      sheet: this,
      testName: "", 
      attributeDefault: 0,
      skillDefault: 0,
      bonusDefault: 0,
      damageDefault: 0,
      attName: "",
      skillName: "",
    };

    options.testName = game.i18n.localize(target.dataset.test);
    // determine the roll type from key
    switch (key) {
      case "attribute":
        {
          options.attName = target.dataset.attribute;
          options.attributeDefault = this.actor.system.attributes[options.attName].value;
          console.log("TWDU | attribute: ", options.attName);
        }
        break;
      case "skill":
        {
          options.skillName = target.dataset.skill;
          options.skillDefault = this.actor.system.skills[options.skillName].value;
          // get the attribute for the skill and set the default and name
          console.log("TWDU | skill attribute: ", this.actor.system.skills[options.skillName].attribute);
          options.attName = this.actor.system.skills[options.skillName].attribute;
          options.attributeDefault = this.actor.system.attributes[options.attName].value;
          console.log("TWDU | skill: ", options.skillName);
        }
        break;
      case "weapon":
        {
          console.log("TWDU | weapon: ", target.dataset.weapon);
          const item = this.actor.items.get(target.dataset.itemId);
          console.log("TWDU | item: ", item);
          options.testName = target.dataset.test;
          options.skillName = item.system.skill;
          options.skillDefault = this.actor.system.skills[options.skillName].value;
          options.attName = this.actor.system.skills[options.skillName].attribute;
          options.attributeDefault = this.actor.system.attributes[options.attName].value;
          options.damageDefault = item.system.damage;

        }
        break;
        case "armor":
          {
            console.log("TWDU | armor: ", target.dataset.armor);
            let proection = target.dataset.protection;
            console.log("TWDU | proection: ", proection);
          }
          break;
      }
      console.log("TWDU | options", options);
   
    prepareRollDialog(options);
  }

  _onItemToChat(event) {
    event.preventDefault();
    console.log("TWDU | _onItemToChat: ", event);
    const div = $(event.currentTarget).parents(".item");
    const item = this.actor.items.get(div.data("itemId"));
    let type = item.type;
    let chatData = buildChatCard(type, item);
    ChatMessage.create(chatData, {});
  }

  _onItemEdit(event) {
    event.preventDefault();
    console.log("TWDU | _onItemEdit: ", event);
    const div = $(event.currentTarget).parents(".item");
    const item = this.actor.items.get(div.data("itemId"));
    item.sheet.render(true);
  }

  _onItemDelete(event) {
    event.preventDefault();
    console.log("TWDU | _onItemDelete: ", event);
    const key = event.currentTarget.dataset.key;
    const type = event.currentTarget.dataset.type;
    console.log("TWDU | key: ", key);
    console.log("TWDU | type: ", type);

    // Embeded documents
    if (type === "item"){
      const div = $(event.currentTarget).parents(".item");
      this.actor.deleteEmbeddedDocuments("Item", [div.data("itemId")]);
      div.slideUp(200, () => this.render(false));
    }

    // issues
    if (type === "issue") {
      const issues = this.actor.system.issues;
      console.log("TWDU | delete Item issues: ", Object(this.actor.system.issues));
      const newIssues = Object.keys(issues)
        .filter((k) => k !== key)
        .reduce((obj, k) => {
          obj[k] = issues[k];
          return obj;
        }, {});
      console.log("TWDU | newIssues: ", newIssues);
      this.actor.update({ "system.issues": '' });
      this.actor.system.issues = newIssues;
      
      console.log("TWDU | issues: ", this.actor.system.issues);
      this.actor.update({ "system.issues": newIssues});
      console.log("TWDU | actor: ", this.actor.system);
    }
  }

  _onItemCreate(event) {
    event.preventDefault();
    console.log("TWDU | _onItemCreate: ", event);

    // determine the item type from the dataset
    const type = event.currentTarget.dataset.type;
    console.log("TWDU | type: ", type);

    // create and add the item to the actor
    switch (type) {
      case "issue":
        {
          // add a new string to the system.issues array
          console.log("TWDU | Adding an issue");
          const issues = this.actor.system.issues;
          let length = Object.keys(issues).length;
          //TODO  generate a uniqe key
          const newIssues = {...issues, [length]: "New" }; //TODO localize this string
          this.actor.update({ "system.issues": newIssues });

        }
        break;
      }
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

  _onExpChange(event) {
    event.preventDefault();

    let actor = this.actor;
    let currentCount = actor.system.experience.value;

    let newCount =
      event.type == "click"
        ? Math.min(currentCount + 1, 10)
        : Math.max(currentCount - 1, 0);

    actor.update({ "system.experience.value": newCount });
  }
}

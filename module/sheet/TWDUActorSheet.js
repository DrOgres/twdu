import { buildChatCard } from "../util/chat.js";
import { prepareRollDialog } from "../util/roll.js";
import { twdu } from "../config.js";

export default class TWDUActorSheet extends ActorSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["twdu", "sheet", "actor"],
      width: 750,
      height: 750 - "max-content",
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
      maxpop: 0,
    };
    console.log("TWDU | context: ", context);
    context.config = CONFIG.twdu;
    console.log("TWDU | context.config: ", context.config);

    this.computeItems(context);

    if (context.isPlayer) {
      context.maxEncumbrance = context.system.attributes.str.value + 2;
      console.log("TWDU | Enriching HTML");
      context.notesHTML = await TextEditor.enrichHTML(
        context.system.notes.value,
        {
          async: true,
        }
      );
      this.computeSkills(context);
      context.encumbrance = this.computeEncumbrance(context);
    }

    if (context.isHaven) {
      context.maxpop = this.calculatePopulation(context);
      context.havenNotes = await TextEditor.enrichHTML(
        context.system.notes.value,
        { async: true }
      );
    }

    if (context.isNPC) {
      this.computeSkills(context);
      this.equipItems(context);
    }

    return context;
  }

  calculatePopulation(context) {
    let maxpop = 0;
    let capacity = context.system.capacity.value;
    if (capacity === 0) {
      maxpop = 0;
    }
    if (capacity === 1) {
      maxpop = 10;
    }
    if (capacity === 2) {
      maxpop = 20;
    }
    if (capacity === 3) {
      maxpop = 50;
    }
    if (capacity === 4) {
      maxpop = 80;
    }
    if (capacity === 5) {
      maxpop = 200;
    }
    if (capacity === 6) {
      maxpop = 500;
    }
    return maxpop;
  }

  computeSkills(context) {
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
      item.isIssue = item.type === "issue";
      item.isVehicle = item.type === "vehicle";
    }
  }

  computeEncumbrance(data) {
    // get the equiped items and sum their weight
    let encumbrance = 0;
    for (let item of Object.values(data.items)) {
      if (item.system.isEquipped) {
        encumbrance += Number(item.system.weight);
      }
    }
    return encumbrance;
  }

  equipItems(data) {
    // this will equip all owned items for an NPC, this is primarily so that armor penalties on mobility can be calculated
    let items = data.items;
    items.forEach((item) => {
      this.actor.items.get(item._id).update({ "system.isEquiped": true });
      // item.update({ "system.isEquipped":  true});
    });
  }

  activateListeners(html) {
    super.activateListeners(html);
    html.find(".toggle-boolean").click(this._onToggleClick.bind(this));
    html.find(".equip").click(this._onEquipClick.bind(this));
    html
      .find(".exp-boxes")
      .on("click contextmenu", this._onExpChange.bind(this));
    html.find(".add-item").click(this._onItemCreate.bind(this));
    html.find(".item-delete").click(this._onItemDelete.bind(this));
    html.find(".actor-delete").click(this._onActorDelete.bind(this));
    html.find(".item-edit").click(this._onItemEdit.bind(this));
    html.find(".actor-edit").click(this._onShowActor.bind(this));
    html.find(".to-chat").click(this._onItemToChat.bind(this));
    html.find(".rollable").click(this._onRoll.bind(this));
    // stress buttons
    html.find(".stress-up").click(this._onStressUp.bind(this));
    html.find(".stress-down").click(this._onStressDown.bind(this));
    html.find(".show-details").click(this._onShowDetails.bind(this));
  }

  async _onShowDetails(event) {
    event.preventDefault();
    console.log("TWDU | _onShowDetails: ", event);
    let div = $(event.currentTarget).parents(".item"),
      item = this.actor.items.get(div.data("itemId")),
      chatData = null,
      sum = "",
      actorType = this.actor.type;

    console.log("TWDU | item: ", item);

    console.log("TWDU | _onShowDetails: ", actorType);

    //TODO check for actor type if haven use a different template
    switch (item.type) {
      case "weapon":
      case "armor":
      case "gear":
      case "tinyItem":
      case "issue":
        await renderTemplate(
          "systems/twdu/templates/ui/description.hbs",
          item
        ).then((html) => {
          chatData = html;
        });
        console.log("TWDU | chatData: ", chatData);
        sum = $(
          `<div class="item-summary span-7 justify-self-start">${chatData}</div>`
        );
        break;
      case "talent":
        await renderTemplate(
          "systems/twdu/templates/ui/talentRollDown.hbs",
          item
        ).then((html) => {
          chatData = html;
        });
        console.log("TWDU | chatData: ", chatData);
        sum = $(
          `<div class="item-summary span-7 justify-self-start">${chatData}</div>`
        );
        break;
      case "criticalInjury":
        console.log("TWDU | criticalInjury: ", item);
        await renderTemplate(
          "systems/twdu/templates/ui/criticalRollDown.hbs", item).then((html) => {
          chatData = html;
        });
        console.log("TWDU | chatData: ", chatData);
        sum = $(
          `<div class="item-summary span-7 justify-self-start">${chatData}</div>`
        );
        break;
    }

    if (chatData === null) {
      return;
    } else if (div.hasClass("expanded")) {
      sum = div.children(".item-summary");
      sum.slideUp(200, () => sum.remove());
    } else {
      div.append(sum.hide());
      sum.slideDown(200);
    }
    div.toggleClass("expanded");
  }

  _onRoll(event) {
    event.preventDefault();
    let actor = this.actor;
    let health = actor.system.health.value;
    if (health < 1) {
      ui.notifications.warn(game.i18n.localize("twdu.ui.cantRollWhenBroken"));
      return;
    }
    let target = event.currentTarget;
    let key = target.dataset.key;
    let options = {
      type: key,
      sheet: this,
      actorType: this.actor.type,
      testName: "",
      attName: "",
      attributeDefault: 0,
      skillName: "",
      skillDefault: 0,
      bonusDefault: 0,
      damageDefault: 0,
      armorItem: "",
    };

    options.testName = game.i18n.localize(target.dataset.test);
    // determine the roll type from key
    switch (key) {
      case "attribute":
        {
          options.attName = target.dataset.attribute;
          options.attributeDefault =
            this.actor.system.attributes[options.attName].value;
        }
        break;
      case "skill":
        {
          if (options.actorType === "npc") {
            options.skillName = target.dataset.skill;
            let skillLevel =
              this.actor.system.skills[target.dataset.skill].level;
            if (skillLevel == "base") {
              options.skillDefault = 4;
            }
            if (skillLevel == "trained") {
              options.skillDefault = 6;
            }
            if (skillLevel == "expert") {
              options.skillDefault = 8;
            }
            if (skillLevel == "master") {
              options.skillDefault = 10;
            }
          } else {
            options.testName = game.i18n.localize(target.dataset.test);
            options.skillName = game.i18n.localize(target.dataset.test);
            options.skillDefault =
              this.actor.system.skills[target.dataset.skill].value;
            // get the attribute for the skill and set the default and name
            options.attName =
              this.actor.system.skills[target.dataset.skill].attribute;
            options.attributeDefault =
              this.actor.system.attributes[options.attName].value;
          }
        }
        break;
      case "weapon":
        {
          const item = this.actor.items.get(target.dataset.itemId);
          console.log("TWDU | actorType: ", options.actorType);
          options.testName = target.dataset.test;
          options.skillName = game.i18n.localize(item.system.skill);
          let skill = item.system.skill.split(".")[1];
          if (options.actorType === "character") {
            options.skillDefault = this.actor.system.skills[skill].value;
            console.log("TWDU | skillDefault: ", options.skillDefault);
          } else {
            let skillLevel = this.actor.system.skills[skill].level;
            console.log("TWDU | skillLevel: ", skillLevel);
            if (skillLevel == "base") {
              options.skillDefault = 4;
            }
            if (skillLevel == "trained") {
              options.skillDefault = 6;
            }
            if (skillLevel == "expert") {
              options.skillDefault = 8;
            }
            if (skillLevel == "master") {
              options.skillDefault = 10;
            }
          }
          if (options.actorType === "character") {
            options.attName = this.actor.system.skills[skill].attribute;
            options.attributeDefault =
              this.actor.system.attributes[options.attName].value;
          }
          options.damageDefault = item.system.damage;
          console.log("TWDU | damageDefault: ", options.damageDefault);
        }
        break;
      case "armor":
        {
          console.log("TWDU | armor: ", target.dataset.armor);
          let protection = target.dataset.protection;
          options.armorItem = this.actor.items.find(
            (item) => item.type === "armor" && item.system.isEquipped
          );
          options.testName = options.armorItem.name;
        }
        break;
    }

    console.log("TWDU | options", options);

    prepareRollDialog(options);
  }

  _onItemToChat(event) {
    event.preventDefault();
    const div = $(event.currentTarget).parents(".item");
    const item = this.actor.items.get(div.data("itemId"));
    let type = item.type;
    buildChatCard(type, item);
  }

  _onItemEdit(event) {
    event.preventDefault();
    console.log("TWDU | _onItemEdit: ", event);
    const div = $(event.currentTarget).parents(".item");
    const item = this.actor.items.get(div.data("itemId"));
    item.sheet.render(true);
  }

  _onShowActor(event) {
    event.preventDefault();
    console.log("TWDU | _onShowActor: ", event);
    const actorID = event.currentTarget.dataset.actorId;
    const actor = game.actors.get(actorID);
    actor.sheet.render(true);
  }

  _onActorDelete(event) {
    event.preventDefault();
    const target = game.actors.get(this.object.id);
    console.log("TWDU | _onActorDelete: ", event);
    const actorID = event.currentTarget.dataset.actorId;
    const survivors = this.actor.system.survivors;
    survivors.npcs = survivors.npcs.filter((o) => o.id !== actorID);
    target.update({ "data.survivors.npcs": survivors.npcs });
    target.update({ "data.survivors.population": survivors.npcs.length });
  }

  _onItemDelete(event) {
    event.preventDefault();
    const key = event.currentTarget.dataset.key;
    const type = event.currentTarget.dataset.type;

    const div = $(event.currentTarget).parents(".item");
    this.actor.deleteEmbeddedDocuments("Item", [div.data("itemId")]);
    div.slideUp(200, () => this.render(false));
  }

  _onItemCreate(event) {
    event.preventDefault();
    let header = event.currentTarget;
    let data = duplicate(header.dataset);

    data["name"] = `New ${data.type.capitalize()}`;
    this.actor.createEmbeddedDocuments("Item", [data]);
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
    const div = $(event.currentTarget).parents(".item");
    const item = this.actor.items.get(div.data("itemId"));
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

  _onStressUp(event) {
    event.preventDefault();
    let actor = this.actor;
    let newCount = actor.system.stress.value + 1;
    actor.update({ "system.stress.value": newCount });
  }

  _onStressDown(event) {
    event.preventDefault();
    let actor = this.actor;
    let newCount = Math.max(actor.system.stress.value - 1, 0);
    actor.update({ "system.stress.value": newCount });
  }

  _dropSurvivor(actorId) {
    const survivor = game.actors.get(actorId);
    const actorData = this.actor;
    if (!survivor) return;
    if (survivor.type === "haven" && survivor.type === "haven")
      return ui.notifications.info("Havens cannot be dropped on a Havens");
    if (survivor.type !== "character" && survivor.type !== "npc") return;
    if (actorData.type === "haven") {
      return this.addSurvivor(actorId);
    }
  }

  addSurvivor(ID) {
    console.log("TWDU | addSurvivor: ", ID);
    const target = game.actors.get(this.object.id);
    if (target.type !== "haven") return;
    const data = target.system;

    const actor = game.actors.get(ID);
    const survivorType = actor.type;
    const survivor = {
      id: ID,
      type: survivorType,
    };
    // Removes duplicates.
    if (data.survivors.npcs.some((o) => o.id === ID)) this.removeSurvivor(ID);

    // Adds the new survivor.
    data.survivors.npcs.push(survivor);
    target.update({ "data.survivors.npcs": data.survivors.npcs });

    target.update({ "data.survivors.population": data.survivors.npcs.length });

    return survivor;
  }

  removeSurvivor(Id) {
    console.log("TWDU | removeSurvivor: ", Id);
    const target = game.actors.get(this.object.id);
    if (target.type !== "haven") return;
    const survivors = target.system.survivors;
    survivors.npcs = survivors.npcs.filter((o) => o.id !== Id);
    return survivors.npcs;
  }

  /** @override */
  async _onDropItemCreate(itemData) {
    const type = itemData.type;
    console.log("TWDU | drag and drop items", this);
    const alwaysAllowedItems = twdu.physicalItems;
    const allowedItems = {
      haven: ["weapon", "armor", "gear", "project", "vehicle", "issue"],
      character: [
        "weapon",
        "armor",
        "gear",
        "issue",
        "criticalInjury",
        "talent",
        "tinyItem",
        "vehicle",
      ],
      npc: ["weapon", "armor", "gear", "issue"],
    };
    let allowed = true;
    if (!alwaysAllowedItems.includes(type)) {
      if (!allowedItems[this.actor.type].includes(type)) {
        allowed = false;
      }
    }

    if (!allowed) {
      const msg = game.i18n.format("twdu.ui.wrongItemType", {
        type: type,
        actor: this.actor.type,
      });
      console.warn(`TWDU| ${msg}`);
      ui.notifications.warn(msg);
      return false;
    }
    return super._onDropItemCreate(itemData);
  }
}

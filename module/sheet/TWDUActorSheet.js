import ChatMessageTWDU, { buildChatCard } from "../util/chat.js";
import { prepareRollDialog, rollClockTest } from "../util/roll.js";
import { twdu } from "../config.js";

const { ActorSheetV2 } = foundry.applications.sheets;
const { HandlebarsApplicationMixin } = foundry.applications.api;

export default class TWDUActorSheet extends HandlebarsApplicationMixin(ActorSheetV2) {
  static draggedItem = null;
  activeTab = "main";
  editors = {};

  static DEFAULT_OPTIONS = {
    tag: "div",
    classes: ["twdu", "sheet", "actor"],
    position: { width: 800, height: 800 },
    window: { resizable: true },
    form: {
      handler: async function (event, form, formData) {
        const submitData = this._prepareSubmitData(event, form, formData);
        await this._processSubmitData(event, form, submitData);
      },
      submitOnChange: true,
      closeOnSubmit: false,
    },
    dragDrop: [{ dragSelector: ".item-list .item", dropSelector: ".sheet-container" }],
  };

  static PARTS = {
    sheet: {
      template: "systems/twdu/templates/sheets/character-sheet.hbs",
    },
  };

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
    const context = await super._prepareContext(options);
    const source = this.actor.toObject();
    const actorData = this.actor.toObject(false);

    Object.assign(context, {
      actor: actorData,
      cssClass: this.constructor.DEFAULT_OPTIONS.classes.join(" "),
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
      isAnimal: this.actor.type === "animal",
      encumbrance: 0,
      maxEncumbrance: 0,
      maxpop: 0,
      portrait: true,
      user: game.user,
    });
    // console.log("TWDU | context: ", context);
    context.config = CONFIG.twdu;
    //console.log("TWDU | context.config: ", context.config);

    // console.log("TWDU | context: ", context);

    this.computeItems(context);

    if (context.isPlayer) {
      context.maxEncumbrance = context.system.attributes.str.value + 2;
      //console.log("TWDU | Enriching HTML");
      context.notesHTML =
        await foundry.applications.ux.TextEditor.implementation.enrichHTML(
          this.actor.system.notes.value,
          {
            secrets: this.actor.isOwner,
            rollData: context.rollData,
            async: true,
            relativeTo: this.actor,
          }
        );
      // console.log("TWDU | context: ", context.notesHTML);
      this.computeSkills(context);
      context.encumbrance = this.computeEncumbrance(context);
      // update context with the data we just got
      context.actor = this.actor;
      context.system = this.actor.system;
      //console.log("TWDU | context: ", context);
    }

    if (context.isHaven) {
      //check all survivors and remove any that are not in the world

      const survivors = this.actor.system.survivors;
      // console.log("TWDU | haven survivors: ", survivors);

      for (let survivor of survivors.npcs) {
        let actor = game.actors.get(survivor.id);
        if (!actor) {
          // console.log("TWDU | haven survivor not found: ", survivor);

          const msg = game.i18n.localize(
            "twdu.ui.survivorNotFound" + ": " + survivor.id
          );
          this.removeSurvivor(survivor.id);
          ui.notifications.warn(msg);
        }
      }
      //console.log("TWDU | haven survivors: ", survivors);
      context.system.survivors = survivors;

      context.maxpop = this.calculatePopulation(context);
      context.havenNotes =
        await foundry.applications.ux.TextEditor.implementation.enrichHTML(
          this.actor.system.notes.value,
          {
            secrets: this.actor.isOwner,
            rollData: context.rollData,
            async: true,
            relativeTo: this.actor,
          }
        );
      //console.log("TWDU | haven context: ", context);
    }

    if (context.isNPC) {
      context.npcSkill = twdu.npcSkill;
      context.npcSkillStore = twdu.npcSkillStore;
      this.computeSkills(context);
      this.equipItems(context);
      context.notesHTML =
        await foundry.applications.ux.TextEditor.implementation.enrichHTML(
          context.system.notes.value,
          {
            secrets: this.actor.isOwner,
            rollData: context.rollData,
            async: true,
            relativeTo: this.actor,
          }
        );
    }

    if (context.isAnimal) {
      //console.log("TWDU | isAnimal: ", context.isAnimal);
      context.animalHTML =
        await foundry.applications.ux.TextEditor.implementation.enrichHTML(
          context.system.notes.value,
          {
            secrets: this.actor.isOwner,
            rollData: context.rollData,
            async: true,
            relativeTo: this.actor,
          }
        );
    }

    if (context.isChallenge) {
      //console.log("TWDU | isChallenge: ", this.actor);
      //check all survivors and remove any that are not in the world
      const survivors = this.actor.system.survivors;
      //console.log("TWDU | challenge survivors: ", survivors);
      for (let survivor of survivors.npcs) {
        let actor = game.actors.get(survivor.id);
        if (!actor) {
          // console.log("TWDU | challenge survivor not found: ", survivor);
          const msg = game.i18n.localize(
            "twdu.ui.survivorNotFound" + ": " + survivor.id
          );
          this.removeSurvivor(survivor.id);
          ui.notifications.warn(
            "Challenge survivor ID  not found removing from list"
          );
        }
      }
      //console.log("TWDU | challenge survivors: ", survivors);
      context.system.survivors = survivors;

      //context.survivors = this.actor.system.survivors;
    }
    // const drag = this.prepDragDrop();
    // console.log("TWDU | drag: ", drag);
    // console.log("TWDU | data: ", this);

    if (this.actor.type === "haven") {
      this.setPortrait(context);
      // this.setPosition({width: 800, height: 800});
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
    if (capacity > 6) {
      maxpop = 500;
    }
    return maxpop;
  }

  computeSkills(context) {
    //console.log("compute skills", context);

    for (let skill of Object.values(context.system.skills)) {
      skill.hasStrength = skill.attribute === "str";
      skill.hasAgility = skill.attribute === "agl";
      skill.hasWits = skill.attribute === "wit";
      skill.hasEmpathy = skill.attribute === "emp";
      //console.log("skill computed", skill);
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
      item.isRumor = item.type === "rumor";
      item.isChallenge = item.type === "challenges";
      item.isEndgame = item.type === "endgame";
      item.isFaction = item.type === "faction";
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
    //console.log("TWDU | equipItems: ", items);
    items.forEach((item) => {
      this.actor.items.get(item._id).update({ "system.isEquipped": true });
      // item.update({ "system.isEquipped":  true});
    });
  }

  setPortrait(context) {
    context.portrait = game.settings.get("twdu", "havenSurvivorDisplaySetting");
    // console.log("TWDU | setPortrait: ", context.portrait);
  }

  _getFormFieldValue(name) {
    const field = this.form?.elements.namedItem(name);
    if (!field) return undefined;
    if (field instanceof RadioNodeList) return field.value;
    return field.value;
  }

  _getCurrentSystemNumber(path, fallback = 0) {
    const formValue = this._getFormFieldValue(`system.${path}`);
    const value =
      formValue ?? foundry.utils.getProperty(this.actor.system, path) ?? fallback;
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
  }

  async _onRender(context, options) {
    await super._onRender(context, options);
    this._activateEditors();
    this._activateFormListeners();
    this.activateListeners($(this.element));
    this._activateSheetTab(this.activeTab);
  }

  _activateEditors() {
    this.editors = {};
    for (const div of this.element.querySelectorAll(".editor-content[data-edit]")) {
      this._activateEditor(div);
    }
  }

  async activateEditor(name, options = {}, initialContent = "") {
    const editor = this.editors[name];
    if (!editor) throw new Error(`${name} is not a registered editor name!`);
    options = foundry.utils.mergeObject(editor.options, options);
    if (!options.fitToSize) options.height = options.target.offsetHeight;
    if (editor.hasButton) editor.button.style.display = "none";
    const instance = editor.instance =
      await foundry.applications.ux.TextEditor.implementation.create(
        options,
        initialContent || editor.initial
      );
    options.target.closest(".editor")?.classList.add(options.engine ?? "prosemirror");
    editor.changed = false;
    editor.active = true;
    return instance;
  }

  async saveEditor(name, { remove = true, preventRender } = {}) {
    const editor = this.editors[name];
    if (!editor?.instance) throw new Error(`${name} is not an active editor name!`);
    editor.active = false;
    const event = new Event("submit", { cancelable: true });
    await this._onLegacyFormSubmit(event, { preventRender });

    if (remove) {
      editor.instance.destroy();
      editor.instance = null;
      if (editor.hasButton) editor.button.style.display = "block";
      this.render({ force: true });
    }
    editor.changed = false;
  }

  _activateEditor(div) {
    const name = div.dataset.edit;
    const engine = div.dataset.engine || "prosemirror";
    const collaborate = div.dataset.collaborate === "true";
    const button = div.previousElementSibling;
    const hasButton = button?.classList.contains("editor-edit") ?? false;
    const wrap = div.parentElement.parentElement;
    const wc = div.closest(".window-content");
    const heights = [wrap.offsetHeight, wc ? wc.offsetHeight : null];
    if (div.offsetHeight > 0) heights.push(div.offsetHeight);
    const height = Math.min(...heights.filter((h) => Number.isFinite(h)));

    const options = {
      target: div,
      fieldName: name,
      save_onsavecallback: () => this.saveEditor(name),
      height,
      engine,
      collaborate,
    };
    if (engine === "prosemirror") {
      options.plugins = this._configureProseMirrorPlugins(name, { remove: hasButton });
    } else if (!(engine in CONFIG.TextEditor.engines)) {
      console.warn(`Unrecognized text editor engine '${engine}'`);
      return;
    }

    const initial = foundry.utils.getProperty(this.object, name);
    const editor = (this.editors[name] = {
      options,
      target: name,
      button,
      hasButton,
      instance: null,
      active: !hasButton,
      changed: false,
      initial,
    });

    const activate = () => {
      editor.initial = foundry.utils.getProperty(this.object, name);
      this.activateEditor(name, {}, editor.initial);
    };
    if (hasButton) button.onclick = activate;
    else activate();
  }

  _configureProseMirrorPlugins(name, { remove = true } = {}) {
    const { defaultSchema, plugins } = foundry.prosemirror;
    return {
      menu: plugins.ProseMirrorMenu.build(defaultSchema, {
        destroyOnSave: remove,
        onSave: () => this.saveEditor(name, { remove }),
      }),
      keyMaps: plugins.ProseMirrorKeyMaps.build(defaultSchema, {
        onSave: () => this.saveEditor(name, { remove }),
      }),
    };
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
    const formData = new foundry.applications.ux.FormDataExtended(form, {
      editors: this.editors,
    });
    const submitData = this._prepareSubmitData(event, form, formData);
    await this._processSubmitData(event, form, submitData);
  }

  activateListeners(html) {
    html.find("img[data-edit]").click(this._onEditImage.bind(this));
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
    // drag and drop
    html.find(".sheet-container").on("drop", this._onItemDrop.bind(this));
    html.find(".draggable").on("dragstart", this._onItemDrag.bind(this));
    //item clocks
    html.find(".item-clock").click(this._onIncreaseClock.bind(this));
    html.find(".item-clock").contextmenu(this._onDecreaseClock.bind(this));
    html.find(".test-clock").click(this._onTestClock.bind(this));
    // challenge sheet listeners
    html.find(".set-fate").change(this._onSetFate.bind(this));
    html.find(".set-source").change(this._onSetSource.bind(this));
    html.find(".sheet-tabs [data-tab]").click(this._onTabClick.bind(this));
  }

  _onTabClick(event) {
    event.preventDefault();
    this._activateSheetTab(event.currentTarget.dataset.tab);
  }

  _activateSheetTab(tabName = "main") {
    this.activeTab = tabName;
    const root = this.element;
    if (!root) return;

    for (const tab of root.querySelectorAll(".sheet-body .tab[data-tab]")) {
      const active = tab.dataset.tab === tabName;
      tab.classList.toggle("active", active);
      tab.style.display = active ? "" : "none";
    }

    for (const link of root.querySelectorAll(".sheet-tabs [data-tab]")) {
      link.classList.toggle("active", link.dataset.tab === tabName);
    }
  }

  _onEditImage(event) {
    event.preventDefault();
    const attr = event.currentTarget.dataset.edit;
    const current = foundry.utils.getProperty(this.actor, attr);
    new foundry.applications.apps.FilePicker({
      type: "image",
      current,
      callback: (path) => this.actor.update({ [attr]: path }),
      document: this.actor,
    }).render({ force: true });
  }

  _onSetSource(event) {
    //console.log("TWDU | _onSetSource: ", event);
    let currentTarget = event.currentTarget;
    let item = this.actor.items.get(currentTarget.dataset.itemId);
    let newSource = currentTarget.value;
    item.update({ "system.source": newSource });
  }

  _onSetFate(event) {
    let currentTarget = event.currentTarget;
    let survivorIndex = currentTarget.dataset.survivor;
    let newFate = currentTarget.value;
    let item = this.actor.items.get(currentTarget.dataset.itemId);

    this.actor.system.survivors.npcs[survivorIndex].fate = newFate;
    // console.log("TWDU | _onSetFate: ", this.actor.system.survivors.npcs[survivorIndex]);
    // console.log("TWDU | _onSetFate: ", item);
    this.actor.update({
      "system.survivors.npcs": this.actor.system.survivors.npcs,
    });
  }

  _onTestClock(event) {
    // console.log("TWDU | _onTestClock: ", event);
    let div = $(event.currentTarget).parents(".item"),
      item = this.actor.items.get(div.data("itemId"));

    // if the clock is less than 6 roll a d6 and if the result is greater than the clock value increase the clock by 1
    if (item.system.clock < 6) {
      let roll = rollClockTest(this.actor, this, item);
      roll.then((result) => console.log("TWDU | result: ", result));
      roll.then((result) => {
        // console.log(result.total, item.system.clock);
        if (result.total > item.system.clock) {
          item.update({ "system.clock": item.system.clock + 1 });
        }
      });
    }
  }

  _onIncreaseClock(event) {
    // console.log("TWDU | _onIncreaseClock: ", event);
    let div = $(event.currentTarget).parents(".item"),
      item = this.actor.items.get(div.data("itemId"));
    // console.log("TWDU | _onIncreaseClock: ", div);
    // console.log("TWDU | _onIncreaseClock: ", item);
    let clockCount = item.system.clock;
    if (item.system.clock < 6) {
      clockCount++;
    }
    item.update({ "system.clock": clockCount });
  }

  _onDecreaseClock(event) {
    // console.log("TWDU | _onDecreaseClock: ", event);
    let div = $(event.currentTarget).parents(".item"),
      item = this.actor.items.get(div.data("itemId"));
    let clockCount = item.system.clock;
    if (item.system.clock > 0) {
      clockCount--;
    }
    item.update({ "system.clock": clockCount });
  }

  _onDragStart(event) {
    // console.log(
    //   "start drag",
    //   event.srcElement.firstElementChild.dataset.rolled
    // );
    // console.log(
    //   "start drag skill?",
    //   event.currentTarget.classList.contains("skill")
    // );
    // console.log(
    //   "start drag attribute?",
    //   event.currentTarget.classList.contains("attribute")
    // );

    if (
      event.currentTarget.classList.contains("skill") ||
      event.currentTarget.classList.contains("attribute")
    ) {
      // console.log("a skill or attribute");
      const rollItemDragged = event.srcElement.firstElementChild.dataset.rolled;
      // console.log("rollItemDragged", rollItemDragged);

      return;
    } else {
      // console.log("not a skill or attribute");
      super._onDragStart(event);
      return;
    }
  }

  _onItemDrag(event) {
    const item = this.actor.getEmbeddedDocument(
      "Item",
      event.currentTarget.closest(".item").dataset.itemId
    );
    TWDUActorSheet.draggedItem = item;
    event.originalEvent?.dataTransfer?.setData("text/plain", JSON.stringify(item.toDragData()));
  }

  //prevent sidebar triggering this code?
  _onItemDrop(event) {
    event.preventDefault();
    //  console.log("TWDU | _onItemDrop: ", event);
    let actor = this.actor;
    let item = TWDUActorSheet.draggedItem;
    //  console.log("TWDU | _onItemDrop item: ", item);
    if (item === undefined || item === null) {
      return;
    }
    actor.createEmbeddedDocuments("Item", [item]);
    //  console.log("TWDU | _onItemDrop actor: ", actor.id);
    let storedItem = TWDUActorSheet.draggedItem;
    if (storedItem === null) {
      return;
    }
    // remove the item from the original actor
    let originalActor = storedItem.actor;
    //  console.log("TWDU | originalActor: ", originalActor.id);
    // if (originalActor.id === actor.id) {
    //    console.log("TWDU |  id match on drop action - returning ");
    //   storedItem = null;
    //   item = null;
    //   return;
    // }

    originalActor.deleteEmbeddedDocuments("Item", [storedItem.id]);
    //  console.log("TWDU | storedItem: ", storedItem);
    //  console.log("TWDU | item: ", item);

    TWDUActorSheet.draggedItem = null;
    storedItem = null;
    item = null;
    //  console.log("TWDU | storedItem: ", storedItem);
    //  console.log("TWDU | item: ", item);
    return;
  }

  async _onShowDetails(event) {
    event.preventDefault();
    // console.log("TWDU | _onShowDetails: ", event);
    let div = $(event.currentTarget).parents(".item"),
      item = this.actor.items.get(div.data("itemId")),
      chatData = null,
      sum = "",
      actorType = this.actor.type;

    switch (item.type) {
      case "weapon":
      case "armor":
      case "gear":
      case "tinyItem":
      case "issue":
      case "rumor":
      case "challenges":
        chatData = await foundry.applications.handlebars.renderTemplate(
          "systems/twdu/templates/ui/description.hbs",
          item
        );
        // console.log("TWDU | chatData: ", chatData);
        sum = $(
          `<div class="item-summary span-7 justify-self-start">${chatData}</div>`
        );
        break;
      case "talent":
        chatData = await foundry.applications.handlebars.renderTemplate(
          "systems/twdu/templates/ui/talentRollDown.hbs",
          item
        );
        sum = $(
          `<div class="item-summary span-7 justify-self-start">${chatData}</div>`
        );
        break;
      case "criticalInjury":
        chatData = await foundry.applications.handlebars.renderTemplate(
          "systems/twdu/templates/ui/criticalRollDown.hbs",
          item
        );
        sum = $(
          `<div class="item-summary span-7 justify-self-start">${chatData}</div>`
        );
        break;
      case "project":
        chatData = await foundry.applications.handlebars.renderTemplate(
          "systems/twdu/templates/ui/projectRollDown.hbs",
          item
        );
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
    console.log("TWDU | _onRoll: ", event);
    event.preventDefault();
    let actor = this.actor;
    console.log("TWDU | rolling actor: ", actor);
    let health;
    if (actor.type === "animal") {
      health = actor.system.healthMax.value;
    } else {
      health = actor.system.health.value;
    }
    if (health < 1) {
      ui.notifications.warn(game.i18n.localize("twdu.ui.cantRollWhenBroken"));
      return;
    }
    let target = event.currentTarget;
    console.log("TWDU | target: ", target);
    let key = target.dataset.key;
    if (key === undefined) {
      console.log("TWDU | key is undefined");
      key = target.dataset.itemType;
      //return;
    }
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
          options.attName =
            "twdu." +
            this.actor.system.attributes[target.dataset.attribute].label;
          options.attributeDefault = this._getCurrentSystemNumber(
            `attributes.${target.dataset.attribute}.value`,
            this.actor.system.attributes[target.dataset.attribute].value
          );
        }
        break;
      case "skill":
        {
          if (options.actorType === "npc") {
            console.log("TWDU | npc skill: ", target.dataset.skill);
            options.skillKey = target.dataset.skill;
            options.skillName = game.i18n.localize(target.dataset.test);
            let skillLevel =
              this.actor.system.skills[target.dataset.skill].level;
            if (skillLevel == "base") {
              options.skillDefault = 4;
            }
            if (skillLevel == "trained") {
              options.skillDefault = 5;
            }
            if (skillLevel == "expert") {
              options.skillDefault = 8;
            }
            if (skillLevel == "master") {
              options.skillDefault = 10;
            }
          } else {
            console.log("TWDU | character skill: ", target.dataset.skill);
            options.testName = game.i18n.localize(target.dataset.test);
            options.skillKey = target.dataset.skill;
            options.skillName = game.i18n.localize(target.dataset.test);
            options.skillDefault = this._getCurrentSystemNumber(
              `skills.${target.dataset.skill}.value`,
              this.actor.system.skills[target.dataset.skill].value
            );
            // get the attribute for the skill and set the default and name

            let abv = this.actor.system.skills[target.dataset.skill].attribute;
            options.attName = "twdu." + this.actor.system.attributes[abv].label;
            options.attributeDefault = this._getCurrentSystemNumber(
              `attributes.${abv}.value`,
              this.actor.system.attributes[abv].value
            );
          }
        }
        break;
      case "weapon":
        {
          const item = this.actor.items.get(target.dataset.itemId);
          // console.log("TWDU | actorType: ", options.actorType);
          options.testName = target.dataset.test;
          options.skillKey = item.system.skill;
          options.skillName = game.i18n.localize(item.system.skill);
          if (options.skillName === "" || options.skillName === undefined) {
            ui.notifications.warn(game.i18n.localize("twdu.ui.noSkill"));
            return;
          }
          console.log("TWDU | skillName: ", options.skillName);
          // let skill = item.system.skill.split(".")[1];
          // console.log("TWDU | skill: ", skill);
          if (options.actorType === "character") {
            options.skillDefault = this._getCurrentSystemNumber(
              `skills.${options.skillKey}.value`,
              this.actor.system.skills[options.skillKey].value
            );
            // console.log("TWDU | skillDefault: ", options.skillDefault);
          } else {
            let skillLevel = this.actor.system.skills[options.skillName].level;
            // console.log("TWDU | skillLevel: ", skillLevel);
            if (skillLevel == "base") {
              options.skillDefault = 4;
            }
            if (skillLevel == "trained") {
              options.skillDefault = 5;
            }
            if (skillLevel == "expert") {
              options.skillDefault = 8;
            }
            if (skillLevel == "master") {
              options.skillDefault = 10;
            }
          }
          if (options.actorType === "character") {
            let abv = this.actor.system.skills[options.skillKey].attribute;
            options.attName = "twdu." + this.actor.system.attributes[abv].label;
            options.attributeDefault = this._getCurrentSystemNumber(
              `attributes.${abv}.value`,
              this.actor.system.attributes[abv].value
            );
          }

          if (item.system.isExplosive) {
            //if this is explosive use BP: generate a random number between 1 and 6 a number of times eaual to the item.system.damage value
            let damage = 0;
            for (let i = 0; i < item.system.damage; i++) {
              damage += Math.floor(Math.random() * 6) + 1;
              //console.log("TWDU | damage: ", damage);
            }
            options.damageDefault = damage;
          } else {
            options.damageDefault = item.system.damage;
          }
          options.weaponName = item.name;
          options.weaponBonusDefault = item.system.bonus;
          //console.log("TWDU | damageDefault: ", options.damageDefault);
        }
        break;
      case "armor":
        {
          let protection = target.dataset.protection;
          options.armorItem = this.actor.items.find(
            (item) => item.type === "armor" && item.system.isEquipped
          );
          options.testName = options.armorItem.name;
          options.armorName = options.armorItem.name;
          options.armorDefault = options.armorItem.system.protection;
        }
        break;
      case "vehicle":
        {
          let vehicle = this.actor.items.get(target.dataset.itemId);
          console.log("TWDU | vehicle: ", vehicle);
          options.testName = vehicle.name;
          options.vehicleName = vehicle.name;
          options.skillKey = "twdu.mobility";
          options.skillName = game.i18n.localize("twdu.mobility");
          options.actorName = this.actor.name;
          options.actorID = this.actor.id;
          options.vehicleDefault = vehicle.system.maneuverability || 0;
          console.log("TWDU | options: ", options);
        }
        break;
    }

    // console.log("TWDU | options", options);

    prepareRollDialog(options);
  }

  async _onItemToChat(event) {
    event.preventDefault();
    const div = $(event.currentTarget).parents(".item");
    const item = this.actor.items.get(div.data("itemId"));
    let type = item.type;
    //TODO remove the render step from the build chat card function
    // console.log(ChatMessageTWDU.buildChatCard(type, item));
    let chatData = await buildChatCard(type, item, {});
    await ChatMessageTWDU.create(chatData, {});
  }

  _onItemEdit(event) {
    event.preventDefault();
    // console.log("TWDU | _onItemEdit: ", event);
    const div = $(event.currentTarget).parents(".item");
    const item = this.actor.items.get(div.data("itemId"));
    item.sheet.render({ force: true });
  }

  _onShowActor(event) {
    event.preventDefault();
    // console.log("TWDU | _onShowActor: ", event);
    const actorID = event.currentTarget.dataset.actorId;
    const actor = game.actors.get(actorID);
    actor.sheet.render({ force: true });
  }

  _onActorDelete(event) {
    // console.log("TWDU | _onActorDelete event: ", event);
    event.preventDefault();
    const target = game.actors.get(this.object.id);
    // console.log("TWDU | _onActorDelete: ", target);

    if (target.type === "character") {
      // console.log("TWDU | _onActorDelete: ", "character");
      let haven = game.actors.get(target.system.haven);
      let pcActor = game.actors.get(target._id);
      // console.log("TWDU | _onActorDelete: ", haven);

      haven.update({
        "system.survivors.npcs": haven.system.survivors.npcs.filter(
          (o) => o.id !== target.id
        ),
      });
      pcActor.update({ "system.haven": "" });
      //this.actor.update({ "data.system.haven": "" });
      // console.log("TWDU | _onActorDelete: haven ", pcActor.system.haven);
      // console.log("TWDU | _onActorDelete: ", pcActor);
      return;
    }

    const actorID = event.currentTarget.dataset.actorId;
    this.removeSurvivor(actorID);
    const survivors = this.actor.system.survivors;
    survivors.npcs = survivors.npcs.filter((o) => o.id !== actorID);
    target.update({ "system.survivors.npcs": survivors.npcs });
    target.update({ "system.survivors.population": survivors.npcs.length });
  }

  _onItemDelete(event) {
    event.preventDefault();
    const key = event.currentTarget.dataset.key;
    const type = event.currentTarget.dataset.type;

    const div = $(event.currentTarget).parents(".item");
    this.actor.deleteEmbeddedDocuments("Item", [div.data("itemId")]);
    div.slideUp(200, () => this.render({ force: false }));
  }

  _onItemCreate(event) {
    event.preventDefault();
    let header = event.currentTarget;
    let data = foundry.utils.duplicate(header.dataset);

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
      case "isSecret":
        {
          const item = this.actor.items.get(element.dataset.itemId);
          const value = item.system.isSecret;
          item.update({ "system.isSecret": !value });
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
        ? Math.min(currentCount + 1, 15)
        : Math.max(currentCount - 1, 0);

    actor.update({ "system.experience.value": newCount });
  }

  _onStressUp(event) {
    event.preventDefault();
    let actor = this.actor;
    let newCount = actor.system.stress.value + 1;
    // if the new count is greater than the max stress then update max stress to new count +1
    if (newCount > actor.system.stress.max) {
      actor.update({ "system.stress.max": newCount + 1 });
    }
    actor.update({ "system.stress.value": newCount });
  }

  _onStressDown(event) {
    event.preventDefault();
    let actor = this.actor;
    let newCount = Math.max(actor.system.stress.value - 1, 0);
    actor.update({ "system.stress.value": newCount });
  }

  _dropSurvivor(actorId) {
    //TODO let user add a haven to a PC by dragging the haven to the PC
    //TODO test the PC to see if it already has a haven, if so warn the user that they will be removing the PC from the current haven and adding it to the new haven let them confirm before proceeding
    // TODO remove the PC from the current haven and add it to the new haven if the user confirms also update the haven on the PC

    const survivor = game.actors.get(actorId);
    // console.log("TWDU | _dropSurvivor: ", survivor);
    const actorData = this.actor;
    const msg = game.i18n.localize("twdu.ui.havenOnHavenDrop");
    if (!survivor) return;
    if (survivor.type === "haven" || survivor.type === "challenge")
      return ui.notifications.info(msg);
    if (survivor.type !== "character" && survivor.type !== "npc") return;
    if (actorData.type === "haven" || actorData.type === "challenge") {
      return this.addSurvivor(actorId);
    }
  }

  addSurvivor(ID) {
    // console.log("TWDU | addSurvivor: ", ID);
    const target = game.actors.get(this.object.id);
    // console.log("TWDU | addSurvivor: ", target.type);
    if (target.type !== "haven" && target.type !== "challenge") return;
    const data = target.system;
    // console.log("TWDU | addSurvivor data: ", data);
    const actor = game.actors.get(ID);
    const survivorType = actor.type;
    const fate = "";
    const survivor = {
      id: ID,
      type: survivorType,
      fate: fate,
    };
    // Removes duplicates.
    if (data.survivors.npcs.some((o) => o.id === ID)) this.removeSurvivor(ID);

    // Adds the new survivor.
    data.survivors.npcs.push(survivor);
    target.update({ "system.survivors.npcs": data.survivors.npcs });
    // put this haven on the character
    if (actor.type === "character" && target.type === "haven") {
      actor.update({ "system.haven": target._id });
      // console.log("TWDU | addSurvivor actor: ", actor);
      // Updates the population on a Haven not a Challenge.
    }
    if (target.type === "haven") {
      target.update({
        "system.survivors.population": data.survivors.npcs.length,
      });
    }

    //target.update({ "data.survivors.npcs": data.survivors.npcs });
    // console.log("TWDU | data.survivors.npcs: ", data.survivors.npcs);
    // console.log("TWDU | target: ", target);
    return survivor;
  }

  removeSurvivor(Id) {
    // console.log("TWDU | removeSurvivor: ", Id);
    const target = game.actors.get(this.object.id);
    const survivors = target.system.survivors;
    // console.log("TWDU | removeSurvivor target: ", target);
    // console.log("TWDU | removeSurvivor survivors: ", survivors);

    // console.log("TWDU | removeSurvivor target: ", target.type);
    // console.log("TWDU | removeSurvivor target: ", target);

    let actor = game.actors.get(Id);
    // console.log("TWDU | removeSurvivor actor: ", actor);

    if (!actor) {
      // console.log("TWDU | removeSurvivor actor not found: ", actor);
      survivors.npcs = survivors.npcs.filter((o) => o.id !== Id);
    }

    if (target.type === "haven") {
      if (actor !== undefined && actor.type === "character") {
        actor.update({ "system.haven": "" });
      }
    }

    survivors.npcs = survivors.npcs.filter((o) => o.id !== Id);
    target.update({ "system.survivors.npcs": survivors.npcs });
    //console.log("TWDU | removeSurvivor survivors updated: ", target.system.survivors);
    return survivors.npcs;
  }

  /** @override */
  async _onDropItemCreate(itemData) {
    console.log("TWDU | _onDropItemCreate: ", itemData);
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
      npc: ["weapon", "armor", "gear", "issue", "vehicle"],
      challenge: ["issue"],
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
    console.log("TWDU | _onDropItemCreate: ", itemData);
    return super._onDropItemCreate(itemData);
  }
}

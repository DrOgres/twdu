// initialize and track the threat level for the game.
// this will be tracked via a flag on the game object
// we will implement a button in the base select UI to increment and decrement the threat level

export async function increaseThreatLevel(amount) {
  console.log("threat up");
  let threatLevel = getThreatLevel();
  if (threatLevel === undefined) {
    threatLevel = 0;
    await setThreatLevel(threatLevel);
    return;
  }

  if (threatLevel >= 6) {
    await setThreatLevel(6);
    return;
  }
  threatLevel += amount;
  await setThreatLevel(threatLevel);
}

export async function decreaseThreatLevel(amount) {
  let threatLevel = getThreatLevel();
  if (threatLevel === undefined) {
    threatLevel = 0;
    await setThreatLevel(threatLevel);
    return;
  }

  if (threatLevel <= 0) {
    await setThreatLevel(0);
    return;
  }
  threatLevel -= amount;
  await setThreatLevel(threatLevel);
}

export async function setThreatLevel(threatLevel) {
  await game.settings.set("twdu", "threatLevel", threatLevel);
  ThreatLevelDisplay.update();
}

export function getThreatLevel() {
  return game.settings.get("twdu", "threatLevel");
}

// display the treat level in the chat
export async function displayThreatLevel() {
  if (!game.user.isGM) {
    return;
  }
  let threatLevel = getThreatLevel();
  // get the gm user
  let gm = game.users.find((u) => u.isGM && u.active);


  if (gm === undefined) {
    console.error("TWDU | displayThreatLevel: no GM found");
    return;
  }

  

  //speaker: ChatMessage.getSpeaker(),
  let messageData = {
    user: gm._id,
    
  };

  

  messageData.content = await foundry.applications.handlebars.renderTemplate(
    "systems/twdu/templates/ui/threat-level.html",
    { threatLevel: threatLevel }
  );

  await ChatMessage.create(messageData);
}

// show a UI dialog to allow the GM to set the threat level
export async function threatLevelDialog() {
 
  ThreatLevel.render({ force: true });
}

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class ThreatLevelDisplay extends HandlebarsApplicationMixin(ApplicationV2) {
  static initialize() {
    this.threatLevel = new ThreatLevelDisplay();
  }

  static update() {
    this.threatLevel.update();
  }

  static render() {
  
    this.threatLevel.render({ force: true });
  }

  static DEFAULT_OPTIONS = {
      id: "threat-level-display",
      position: { top: 100, left: 120, height: 200, width: 275 },
      window: {
        title: "Threat Level",
        resizable: false,
        minimizable: false,
      },
    actions: {
      increase: () => increaseThreatLevel(1),
      decrease: () => decreaseThreatLevel(1),
    },
  };

  static PARTS = {
    sheet: { template: "systems/twdu/templates/ui/threat-level-display.html" },
  };

  async _onRender(context, options) {
    await super._onRender(context, options);
    this.element.querySelector(".threat-level-up")?.addEventListener("click", () => increaseThreatLevel(1));
    this.element.querySelector(".threat-level-down")?.addEventListener("click", () => decreaseThreatLevel(1));
  }

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    return foundry.utils.mergeObject(context, {
      threatLevel: getThreatLevel(),
      gm: game.user.isGM,
    }, { inplace: false });
  }

  update() {
    if (this.rendered) {
      this.render({ force: true });
    }
  }
}

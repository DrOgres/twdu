// initialize and track the threat level for the game.
// this will be tracked via a flag on the game object
// we will implement a button in the base select UI to increment and decrement the threat level

export async function increaseThreatLevel(amount) {
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

  

  messageData.content = await renderTemplate(
    "systems/twdu/templates/ui/threat-level.html",
    { threatLevel: threatLevel }
  );

  await ChatMessage.create(messageData);
}

// show a UI dialog to allow the GM to set the threat level
export async function threatLevelDialog() {
 
  ThreatLevel.render(true);
}

export class ThreatLevelDisplay extends Application {
  static initialize() {
    this.threatLevel = new ThreatLevelDisplay();
  }

  static update() {
    this.threatLevel.update();
  }

  static render() {
  
    this.threatLevel.render(true);
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: "threat-level-display",
      template: "/systems/twdu/templates/ui/threat-level-display.html",
      top: 100,
      left: 120,
      height: 200,
      width: 275,
      zIndex: 100,
      popOut: true,
      resizable: false,
      minimizable: false,
      title: "Threat Level",
    });
  }

  constructor() {
    super();
  }

  // activateListeners(html)

  activateListeners(html) {
    super.activateListeners(html);
    html.find(".threat-level-up").click((event) => increaseThreatLevel(1));
    html.find(".threat-level-down").click((event) => decreaseThreatLevel(1));
  }

  getData() {
    return {
      threatLevel: getThreatLevel(),
      gm: game.user.isGM,
    };
  }

  update() {
    if (this.rendered) {
      this.render(true);
    }
  }
}

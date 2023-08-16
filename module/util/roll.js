import { YearZeroRoll } from "./yzur.js";

export function prepareRollDialog(options) {
  // create a dialog for the roll,
  // options:
  // type: "attribute" || "skill" || "weapon" || "armor"
  // sheet - the sheet to use for the roll
  // testName - the name of the test
  // attributeDefault - the value of the attribute that is contributiong to the roll
  // skillDefault - the value of the skill that is contributiong to the roll
  // bonusDefault = a bonuis from items or other sources
  // damageDefault = the damage of the weapon or attack being used
  // attName - the name of the attribute being used
  // skillName - the name of the skill being used

  //TODO build dialog and show it

  let actorID = options.sheet.object.id;
  let actor = game.actors.get(actorID);
  console.log("TWDU | actor: ", actor);

  console.log("TWDU | dialog sheet: ", options.sheet);
  //TODO check armor and apply modifiers to the pool

  let armor = actor.items.find((item) => item.type === "armor");
  console.log("TWDU | armor: ", armor);

  let stressDice = 0;
  if(actor.type === "character") {
  stressDice = actor.system.stress.value;
  }

  console.log("TWDU | stressDice: ", stressDice);
  let dialogHtml = "";
  if (options.type === "weapon") {
    dialogHtml = buildHTMLDialog(
      options.attName,
      options.attributeDefault,
      "attribute"
    );
    dialogHtml += buildHTMLDialog(
      options.skillName,
      options.skillDefault,
      "skill"
    );
    dialogHtml += buildHTMLDialog("Damage", options.damageDefault, "damage");
    dialogHtml += buildHTMLDialog("stress", stressDice, "stress");
  }
  if (options.type === "attribute") {
    dialogHtml = buildHTMLDialog(
      options.attName,
      options.attributeDefault,
      "attribute"
    );
    dialogHtml += buildHTMLDialog("stress", stressDice, "stress");
  }
  if (options.type === "skill") {
    // TODO check for Mobility and adjust for armor.
    dialogHtml = buildHTMLDialog(
      options.attName,
      options.attributeDefault,
      "attribute"
    );
    dialogHtml += buildHTMLDialog(
      options.skillName,
      options.skillDefault,
      "skill"
    );
    if (options.skillName === "Mobility") {
      //get the armor of the character that is equipped
      let armor = actor.items.find((item) => item.type === "armor" && item.system.isEquipped );
      console.log("TWDU | armor: ", armor);
      if (armor) {
        dialogHtml += buildHTMLDialog(
          "Armor Penalty",
          (0 - armor.system.agility),
          "armor"
        );

        options.armorPenalty = (0 - armor.system.agility);
      }
    }

    dialogHtml += buildHTMLDialog("stress", stressDice, "stress");
  }
  if (options.type === "armor") {
    dialogHtml = buildHTMLDialog(
      options.armorName,
      options.armorDefault,
      "armor"
    );
  }
  //TODO localize this
  let bonusHtml = buildInputDialog("Bonus", options.bonusDefault, "bonus");

  let d = new Dialog(
    {
      title: game.i18n.localize("twdu.ROLL.TEST") + ": " + options.testName,
      content: buildDivHtmlDialog(
        `
            <div class="roll-fields">
            <h2>` +
          game.i18n.localize("twdu.ROLL.TEST") +
          ": " +
          ` ${options.testName}</h2>
            ${dialogHtml}
            </hr>
            ${bonusHtml}
            </div>
            `
      ),
      buttons: {
        roll: {
          icon: '<i class="fas fa-check"></i>',
          label: game.i18n.localize("twdu.ROLL.ROLL"),
          callback: (html) => {
            let attribute = options.attributeDefault;
            console.log("TWDU | attribute: ", attribute);
            let skill = options.skillDefault;
            console.log("TWDU | skill: ", skill);
            let bonus = html.find("#bonus")[0].value;
            console.log("TWDU | bonus: ", bonus);
            let damage = options.damageDefault;
            console.log("TWDU | damage: ", damage);
            roll(
              options.sheet,
              options.testName,
              parseInt(attribute, 10),
              parseInt(skill, 10),
              parseInt(bonus, 10),
              parseInt(damage, 10),
              options.armorPenalty
            );
          },
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: game.i18n.localize("twdu.ROLL.CANCEL"),
          callback: () => {},
        },
      },
      default: "roll",
      close: () => {},
    },
    { width: "407", height: "auto" }
  );
  d.render(true);
}

export function roll(sheet, testName, attribute, skill, bonus, damage, armorPenalty) {
  // roll the dice
  console.log(
    "TWDU | roll: ",
    sheet,
    testName,
    attribute,
    skill,
    bonus,
    damage,
    (armorPenalty || 0)
  );
  sheet.roll = new YearZeroRoll();
  sheet.lastTestName = testName;
  sheet.lastDamage = damage;
  let dicePool = attribute + skill + bonus + (armorPenalty || 0);
  rollDice(sheet, dicePool);
}

Hooks.on('renderChatLog', (app, html, data) => {
    html.on('click', '.dice-button.push', _onPush);
  });
  
  async function _onPush(event) {
    event.preventDefault();
  
    // Get the message.
    let chatCard = event.currentTarget.closest('.chat-message');
    let messageId = chatCard.dataset.messageId;
    let message = game.messages.get(messageId);
  
    let actor = game.actors.get(message.speaker.actor);
    console.log("TWDU | actor: ", actor);
  
    let newStress = actor.system.stress.value + 1;
    await actor.update({ "system.stress.value": newStress });
    
    console.log("TWDU | message rolls: ", message.rolls);
    // Copy the roll.
    let roll = message.rolls[0].duplicate();

  
    // Delete the previous message.
    await message.delete();

    // add the stress dice to the roll
    await roll.addDice(1, 'stress');
    // Push the roll and send it.
    await roll.push({ async: true });
    await roll.toMessage();
  }
  


async function rollDice(sheet, numberOfDice) {
  console.log("TWDU | rollDice: ", sheet, numberOfDice);
  let actor = game.actors.get(sheet.object._id);
  let token = actor.prototypeToken.texture.src;
  console.log("actor", actor);
  console.log("token", token);
  console.log("sheet", sheet);

  let stressDice = 0;
  if(actor.type === "character") {
  stressDice = actor.system.stress.value;
  }

  let formula = numberOfDice + "ds" + " + " + stressDice + "dz";

  if (numberOfDice <= 0) {
    numberOfDice = 1;
  }

  let dice = {
    term: "s",
    number: numberOfDice,
  };

  let data = {
    owner: actor.id,
    name: sheet.lastTestName,
    damage: sheet.lastDamage,
  };

  let options = {
    name: sheet.lastTestName,
    damage: sheet.lastDamage,
    token: token,
    owner: actor.id,
    actorType: actor.type,
    formula: formula,
  };

  let r;

  if (stressDice > 0) {
    r = new YearZeroRoll(formula, data, options);
  } else {
    r = YearZeroRoll.forge(dice, data, options);
  }
  console.log("forged roll", r);

  await r.toMessage({
    speaker: ChatMessage.getSpeaker({ actor: actor, token: actor.img }),
  });

  console.log(r.getTerms("skill"));
  sheet.roll = r.duplicate();
}

function showDice() {}

function buildInputDialog(name, value, type) {
  return (
    `
        <div class="flex row" style="flex-basis: 35%; justify-content: space-between;">
        <p style="text-transform: capitalize; white-space:nowrap;">` +
    name +
    `: </p>
        <input id="` +
    type +
    `" style="text-align: center" type="text" value="` +
    value +
    `"/></div>`
  );
}

function buildHTMLDialog(diceName, diceValue, type) {
  return (
    `
    <h4 class="header">` +
    type +
    `</h4>
    <div class="flex-row" style="flex-basis: 35%; justify-content: space-between;">
       <p style="text-transform: capitalize; white-space:nowrap;">` +
    diceName +
    `: </p>
      <p id="` +
    type +
    `" style="text-align: center">` +
    diceValue +
    `</p></div>`
  );
}

function buildDivHtmlDialog(divContent) {
  return "<div class='twdu roll-dialog '>" + divContent + "</div>";
}

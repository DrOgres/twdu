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

  let actor = options.sheet.object;

  let criticals = parseCriticalInjuries(actor);
  options.criticalPenalty = 0 - criticals;

  let talents = actor.items.filter(
    (item) => item.type === "talent" && item.system.hasBonus
  );
  
  let stressDice = 0;
  if (actor.type === "character") {
    stressDice = actor.system.stress.value;
  }
  console.log("TWDU | stressDice: ", stressDice);

  let dialogHtml = "";
  if (options.type === "weapon") {
    if(options.attName){
    dialogHtml = buildHTMLDialog(
      options.attName,
      options.attributeDefault,
      "attribute"
    );
    };
    dialogHtml += buildHTMLDialog(
      options.skillName,
      options.skillDefault,
      "skill"
    );
    dialogHtml += buildHTMLDialog(
      game.i18n.localize("twdu.ROLL.DAMAGE"),
      options.damageDefault,
      "damage"
    );

    // add damage bonus from talents

    if (options.type === "weapon") {
      let damageTalents = talents.filter(
        (item) => item.system.bonusType === "twdu.damage"
      );

      console.log("TWDU | damageTalents: ", damageTalents);
      if (damageTalents.length > 0) {
        // build a select dialog for the talents that we found
        dialogHtml += buildSelectDialog(
          game.i18n.localize("twdu.ROLL.TALENT"),
          damageTalents,
          "damageTalent"
        );
      }
    }

    if(actor.type === "character" && stressDice > 0){
    dialogHtml += buildHTMLDialog(
      game.i18n.localize("twdu.ROLL.STRESS"),
      stressDice,
      "stress"
    );
    }
  }
  if (options.type === "attribute") {
    dialogHtml = buildHTMLDialog(
      options.attName,
      options.attributeDefault,
      "attribute"
    );

    if(actor.type === "character" && stressDice > 0){
    dialogHtml += buildHTMLDialog(
      game.i18n.localize("twdu.ROLL.STRESS"),
      stressDice,
      "stress"
    );
    }
  }
  if (options.type === "skill") {
    console.log("TWDU | skill options: ", options);
    if (options.attName) {
      dialogHtml = buildHTMLDialog(
        options.attName,
        options.attributeDefault,
        "attribute"
      );
    }
    dialogHtml += buildHTMLDialog(
      options.skillName,
      options.skillDefault,
      "skill"
    );
    if (options.skillName === "Mobility" || options.skillName === "mobility") {
      let armor = options.armorItem;
      if (armor) {
        dialogHtml += buildHTMLDialog(
          "Armor Penalty",
          0 - armor.system.agility,
          "armor"
        );
        options.armorPenalty = 0 - armor.system.agility;
      }
    }

    // add a field to show the critical penalty if there is one
    if (criticals > 0) {
      dialogHtml += buildHTMLDialog(
        game.i18n.localize("twdu.ROLL.CRITICAL"),
        options.criticalPenalty,
        "critical"
      );
    }

    if (stressDice > 0) {
      console.log("TWDU | stressDice: ", stressDice);
      dialogHtml += buildHTMLDialog(
        game.i18n.localize("twdu.ROLL.STRESS"),
        stressDice,
        "stress"
      );
    }
  }
  if (options.type === "armor") {
    dialogHtml = buildHTMLDialog(
      options.armorName,
      options.armorDefault,
      "armor"
    );
  }

  //TODO add a summary of the dice pool thus far to the dialog

  if (options.type === "skill") {
    let gear = actor.items.filter(
      (item) => item.type === "gear" && item.system.isEquipped
    );
    console.log("TWDU | gear: ", gear);
    console.log("TWDU | options.skillName: ", options.skillName.toLowerCase());
    let skillGear = gear.filter(
      (item) => item.system.skill === "twdu." + options.skillName.toLowerCase()
    );
    console.log("TWDU | skillGear: ", skillGear);
    if (skillGear.length > 0) {
      dialogHtml += buildSelectDialog(
        game.i18n.localize("twdu.ROLL.GEAR"),
        skillGear,
        "gear"
      );
    }

    console.log("TWDU | talents: ", talents);
    let skillTalents = talents.filter(
      (item) => item.system.skill === "twdu." + options.skillName.toLowerCase()
    );
    console.log("TWDU | skillTalents: ", skillTalents);
    if (skillTalents.length > 0) {
      dialogHtml += buildSelectDialog(
        game.i18n.localize("twdu.ROLL.TALENT"),
        skillTalents,
        "talent"
      );
    }
  }

  let bonusHtml = buildInputDialog(
    game.i18n.localize("twdu.ROLL.BONUS"),
    options.bonusDefault,
    "bonus"
  );

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
            let critPenalty = options.criticalPenalty;
            console.log("TWDU | critPenalty: ", critPenalty);

            // get the gear bonus
            let gearBonus = 0;
            if (options.type === "skill") {
              let gearSelect = html.find("#gear")[0];
              console.log("TWDU | gearSelect: ", gearSelect);
              if (gearSelect) {
                gearBonus = parseInt(gearSelect.value, 10);
              }
            }
            console.log("TWDU | gearBonus: ", gearBonus);

            let talentDamageBonus = 0;
            if (options.type === "weapon") {
              let damageTalentSelect = html.find("#damageTalent")[0];
              console.log("TWDU | damageTalentSelect: ", damageTalentSelect);
              if (damageTalentSelect) {
                talentDamageBonus = parseInt(damageTalentSelect.value, 10);
              }
            }
            console.log("TWDU | talentDamageBonus: ", talentDamageBonus);
            damage += talentDamageBonus;

            // get the talent bonus
            let talentBonus = 0;
            if (options.type === "skill") {
              let talentSelect = html.find("#talent")[0];
              console.log("TWDU | talentSelect: ", talentSelect);
              if (talentSelect) {
                talentBonus = parseInt(talentSelect.value, 10);
              }
            }
            console.log("TWDU | talentBonus: ", talentBonus);

            roll(
              options.sheet,
              options.testName,
              parseInt(attribute, 10),
              parseInt(skill, 10),
              parseInt(bonus, 10),
              parseInt(damage, 10),
              options.armorPenalty,
              options.criticalPenalty,
              gearBonus,
              talentBonus
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

function parseCriticalInjuries(actor) {
  console.log("TWDU | parseCriticalInjuries: ", actor);
  let criticals = actor.items.filter((item) => item.type === "criticalInjury");
  let total = 0;
  console.log("TWDU | criticals: ", criticals);
  // get the criticalInjury.effect value from each item in criticals
  // add them together
  for (let i = 0; i < criticals.length; i++) {
    let critical = criticals[i];
    console.log("TWDU | critical: ", critical);
    total += critical.system.effect;
  }
  console.log("TWDU | total: ", total);
  return total;
}

export function roll(
  sheet,
  testName,
  attribute,
  skill,
  bonus,
  damage,
  armorPenalty,
  criticalPenalty,
  gearBonus
) {
  // roll the dice
  console.log(
    "TWDU | roll: ",
    sheet,
    testName,
    attribute,
    skill,
    bonus,
    damage,
    armorPenalty || 0,
    criticalPenalty || 0
  );
  sheet.roll = new YearZeroRoll();
  sheet.lastTestName = testName;
  sheet.lastDamage = damage;
  let dicePool =
    attribute +
    skill +
    bonus +
    (armorPenalty || 0) +
    (criticalPenalty || 0) +
    (gearBonus || 0);
  rollDice(sheet, dicePool);
}

Hooks.on("renderChatLog", (app, html, data) => {
  html.on("click", ".dice-button.push", _onPush);
});

async function _onPush(event) {
  event.preventDefault();

  // Get the message.
  let chatCard = event.currentTarget.closest(".chat-message");
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
  await roll.addDice(1, "stress");
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
  if (actor.type === "character") {
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
        <div class="flex-row pi-1" style="flex-basis: 35%; justify-content: space-between;">
        <p style="text-transform: capitalize; white-space:nowrap;">` +
    name +
    `: </p>
        <input id="` +
    type +
    `" style="text-align: right" type="text" value="` +
    value +
    `"/></div>`
  );
}

function buildSelectDialog(name, value, type) {
  console.log("TWDU | buildSelectDialog: ", name, value, type);

  // parse out the value to get the <optionm> tags for the select
  let options = "";
  for (let i = 0; i < value.length; i++) {
    let item = value[i];
    options +=
      "<option id='" +
      item.id +
      "' value='" +
      item.system.bonus +
      "'>" +
      item.name +
      ": &nbsp;" +
      item.system.bonus +
      "</option>";
  }

  return (
    `<div >
   <h4 class="header">` +
    name +
    `</h4>
   <select id="` +
    type +
    `" style="width: 100%; margin-bottom: 10px;"> 
   <option id="none" value="0">None</option>
   ` +
    options +
    `   
   </select> 
  </div>`
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

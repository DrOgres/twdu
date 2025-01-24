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


//TODO on roll by clicking vehicle item set up the dialog for a mobility roll with the vehicle as a predefined gear bonus.

  let actor = options.sheet.object;

  if (actor.type === "animal") {
    let attackDice = actor.system.attack;
    let damage = actor.system.damage;
    options.sheet.lastDamage = damage;

    // roll the dice without a dialog
    rollDice("animal", options.sheet, attackDice);
    
    return;
  }


  let criticals = parseCriticalInjuries(actor);
  options.criticalPenalty = 0 - criticals;

  let talents = actor.items.filter(
    (item) => item.type === "talent" && item.system.hasBonus
  );

  let stressDice = 0;
  if (actor.type === "character") {
    stressDice = actor.system.stress.value;
  }

  let dialogHtml = "";
  if (options.type === "weapon") {
    if (options.attName) {
      dialogHtml = buildHTMLDialog(
        game.i18n.localize(options.attName),
        options.attributeDefault,
        "attribute"
      );
    }
    dialogHtml += buildHTMLDialog(
      options.skillName,
      options.skillDefault,
      "skill"
    );
    dialogHtml += buildHTMLDialog(
      options.weaponName,
      options.weaponBonusDefault,
      "weaponBonus"
    );
    // dialogHtml += buildHTMLDialog(
    //   game.i18n.localize("twdu.ROLL.DAMAGE"),
    //   options.damageDefault,
    //   "damage"
    // );

    // add damage bonus from talents

   

     // add a field to show the critical penalty if there is one
     if (criticals > 0) {
      dialogHtml += buildHTMLDialog(
        game.i18n.localize("twdu.ROLL.CRITICAL"),
        options.criticalPenalty,
        "critical"
      );
    }
    if (actor.type === "character" && stressDice > 0) {
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

     // add a field to show the critical penalty if there is one
     if (criticals > 0) {
      dialogHtml += buildHTMLDialog(
        game.i18n.localize("twdu.ROLL.CRITICAL"),
        options.criticalPenalty,
        "critical"
      );
    }

    if (actor.type === "character" && stressDice > 0) {
      dialogHtml += buildHTMLDialog(
        game.i18n.localize("twdu.ROLL.STRESS"),
        stressDice,
        "stress"
      );
    }
  }

  if (options.type === "skill") {
    if (options.attName) {
      dialogHtml = buildHTMLDialog(
        game.i18n.localize(options.attName),
        options.attributeDefault,
        "attribute"
      );
    }
    dialogHtml += buildHTMLDialog(
      options.skillName,
      options.skillDefault,
      "skill"
    );
     // if the skill is mobility, add the armor penalty for equipped armor if more than one armor is equipped use the highest penalty
     if (options.skillName === "Mobility" || options.skillName === "mobility") {
      let armor = actor.items.filter(
        (item) => item.type === "armor" && item.system.isEquipped
      );
      if (armor.length > 0) {
        armor.sort((a, b) => (a.system.agility > b.system.agility ? -1 : 1));
        
        options.armorPenalty = armor[0].system.agility;

        dialogHtml += buildHTMLDialog(
          game.i18n.localize("twdu.armor") + " " + game.i18n.localize("twdu.penalty"),         
          options.armorPenalty,
          "armorPenalty"
        );
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

  //TODO add the vehicle clicked roll dialog here

  if (options.type === "vehicle") {
    console.log("TWDU | vehicle options: ", options);
    // dialogHtml = buildHTMLDialog(
    //   options.vehicleName,
    //   options.vehicleDefault,
    //   "vehicle"
    // );
  }

  //add a summary of the dice pool thus far to the dialog unless this is armor
  if (options.type !== "armor"){
  let subtotal =
    (options.attributeDefault || 0) +
    (options.skillDefault || 0) +
    (options.weaponBonusDefault || 0) -
    (Math.abs(options.armorPenalty) || 0) +
    (options.criticalPenalty || 0);
    console.log("TWDU | options: ", options);
  console.log("TWDU | subtotal: ", subtotal);
  dialogHtml += buildSubTotalDialog(subtotal, stressDice);
  }

  if (options.type === "weapon") {
    console.log("TWDU | skillName: ", options.skillName);
    let damageTalents = talents.filter(
      (item) => item.system.bonusType === "twdu.damage"
    );

    if (damageTalents.length > 0) {
      // build a select dialog for the talents that we found
      dialogHtml += buildSelectDialog(
        game.i18n.localize("twdu.ROLL.TALENT_DAMAGE"),
        damageTalents,
        "damageTalent"
      );
    }

    let skillTalents = talents.filter(
      (item) => item.system.skill ===  options.skillName.toLowerCase().toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase())
    
    );
    if (skillTalents.length > 0) {
      console.log("TWDU | skillTalents: ", skillTalents);
      dialogHtml += buildSelectDialog(
        game.i18n.localize("twdu.ROLL.TALENTSKILL"),
        skillTalents,
        "talent"
      );
    }
  }

  if (options.type === "skill") {
    let gear = actor.items.filter(
      (item) => item.type === "gear" && item.system.isEquipped
    );
    
    let skillGear = gear.filter(
      (item) => item.system.skill === options.skillName.toLowerCase()
    );

    // if the skill is mobility add any vehicle items to skillGear
    if (options.skillName === "Mobility" || options.skillName === "mobility") {
      let vehicles = actor.items.filter(
        (item) => item.type === "vehicle" 
      );
      for (let i = 0; i < vehicles.length; i++) {
        skillGear.push(vehicles[i]);
      }
    }

    if (skillGear.length > 0) {
      dialogHtml += buildSelectDialog(
        game.i18n.localize("twdu.ROLL.GEAR"),
        skillGear,
        "gear"
      );
    }

   
   
    

    let skillTalents = talents.filter(
      (item) => item.system.skill === options.skillName.toLowerCase().toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase())
    
    );
    if (skillTalents.length > 0) {
      console.log("TWDU | skillTalents: ", skillTalents);
      dialogHtml += buildSelectDialog(
        game.i18n.localize("twdu.ROLL.TALENTSKILL"),
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
            <div class="roll-fields pi-8 mb-1">
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
            let skill = options.skillDefault;
            let bonus = html.find("#bonus")[0].value;
            let weaponBonus = options.weaponBonusDefault;
            let damage = options.damageDefault;
            let critPenalty = options.criticalPenalty;
            let armorPenalty = options.armorPenalty;

            console.log("TWDU | Armor Penalty: ", armorPenalty);

            // get the gear bonus
            let gearBonus = 0;
            if (options.type === "skill") {
              let gearSelect = html.find("#gear")[0];
              if (gearSelect) {
                gearBonus = parseInt(gearSelect.value, 10);
              }
            }

            // get the talent damage bonus
            let talentDamageBonus = 0;
            if (options.type === "weapon") {
              let damageTalentSelect = html.find("#damageTalent")[0];
              if (damageTalentSelect) {
                talentDamageBonus = parseInt(damageTalentSelect.value, 10);
              }
            }
            damage += talentDamageBonus;

            // get the talent skill bonus
            let talentBonus = 0;
            if (options.type === "skill") {
              let talentSelect = html.find("#talent")[0];
              if (talentSelect) {
                talentBonus = parseInt(talentSelect.value, 10);
              }
            }

            roll(
              options.type,
              options.sheet,
              options.testName,
              parseInt(attribute, 10),
              parseInt(skill, 10),
              parseInt(bonus, 10),
              parseInt(weaponBonus, 10),
              parseInt(damage, 10),
              options.armorPenalty,
              critPenalty,
              gearBonus,
              talentBonus,
              parseInt(options.armorDefault, 10)
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
  let criticals = actor.items.filter((item) => item.type === "criticalInjury");
  let total = 0;
  // get the criticalInjury.effect value from each item in criticals
  // add them together
  for (let i = 0; i < criticals.length; i++) {
    
    let critical = criticals[i];
    total += Number(critical.system.effect);
  }
  return total;
}

export function roll(
  type,
  sheet,
  testName,
  attribute,
  skill,
  bonus,
  weaponBonus,
  damage,
  armorPenalty,
  criticalPenalty,
  gearBonus,
  talentBonus,
  armorBonus,
  
) {

  console.log("TWUD | roll: ", type, sheet, testName, attribute, skill, bonus, weaponBonus, damage, armorPenalty, criticalPenalty, gearBonus, talentBonus, armorBonus);
  // roll the dice
  sheet.roll = new YearZeroRoll();
  sheet.lastTestName = testName;
  sheet.lastDamage = damage;
  let dicePool = 0;

  if (type !== "armor") {
  dicePool =
    attribute +
    skill +
    bonus +
    (weaponBonus || 0) -
    (Math.abs(armorPenalty) || 0) +
    (criticalPenalty || 0) +
    (gearBonus || 0)
    + (talentBonus || 0)
    ;
  } else {
    dicePool = armorBonus;
  }
  rollDice(type, sheet, dicePool);
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
  let newStress = actor.system.stress.value + 1;
  await actor.update({ "system.stress.value": newStress });

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

async function rollDice(type, sheet, numberOfDice) {
  let actor = game.actors.get(sheet.object._id);
  let token = actor.prototypeToken.texture.src;

  let stressDice = 0;
  if (actor.type === "character" && type !== "armor") {
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

  await r.toMessage({
    speaker: ChatMessage.getSpeaker({ actor: actor, token: actor.img }),
  });
  sheet.roll = r.duplicate();

}

export async function rollClockTest(actor, sheet, item){
  let clock = item.system.clock;
  let formula = 1 + "d6";
  let token = actor.prototypeToken.texture.src;


  let data = {
    owner: actor.id,
    name: item.name
  };

  let options = {
    name: item.name,
    token: token,
    owner: actor.id,
    actorType: actor.type,
    formula: formula,
  };

  let r = new YearZeroRoll(formula, data, options);
  console.log("TWDU | rollClockTest: ", r);
  await r.evaluate();
  let totalResult =  r._total;
  console.log("TWDU | rollClockTest total: ", r._total);
  console.log("TWDU | rollClockTest evaluated: ", r._evaluated);
  let chatMessage = `
  <div class="card-holder flex-row w-100" style="position: relative;">
    <div class="roll-token m-0 p-1 header group">
      <img src="systems/twdu/assets/images/twdu-challenge.png" width="45" class="roll-token">
    </div>
    <div class="chat-card grow m-0 pi-1" data-owner-id="${actor.id}">
      <div class="card-content group">
        <div class="dice-roll">
          <div class="text-center header border-bottom">${item.name} Clock</div>
          <div class="dice-result m-1 p-1">
            <div class="dice-formula">${formula}</div>
            <div class="dice-tooltip expanded" style="display: block;">
              <section class="tooltip-part ">
                <div class="dice">
                  <header class="part-header flexrow">
                  <span class="part-formula">${formula}</span>
                  <span class="part-total">${r._total}</span>
                  </header>
                </div>
             </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  `;
  console.log("TWDU | clock: ", clock);
  if (clock > r._total) {
    //TODO localize this
    chatMessage += `
    <div class="flex-col group pi-1 subtotal" style="flex-basis: 35%; justify-content: space-between; margin-block: 5px;">
      Clock did not advance
    </div>
    `;
  } else {
    //TODO localize this
    chatMessage += `
    <div class="flex-col group pi-1 subtotal" style="flex-basis: 35%; justify-content: space-between; margin-block: 5px;">
      Clock advanced
    </div>
    `;
  }

  // test the roll against the clock and increment the clock if roll is less than clock value
  await r.toMessage({content: chatMessage,
    speaker: ChatMessage.getSpeaker({actor: actor, token: actor.img }),
  });
  sheet.roll = r.duplicate();
  return r;
}

function buildSubTotalDialog(basevalue, stressvalue) {
  return (
    ` <div class="flex-col group pi-1 subtotal" style="flex-basis: 35%; justify-content: space-between; margin-block: 5px;">
       <h4 >` +
    game.i18n.localize("twdu.ui.subtotal") +
    `: </h4>
      <div id="subtotal" style="text-align: center" class="flex-row space-between middle w-100 pi-2"><div>` +
    game.i18n.localize("twdu.ui.skillDice") + `</div><div class="grow text-right pi-4 border-bottom">` +
    basevalue +
    `</div></div>
    <div id="subtotal" style="text-align: center" class="flex-row space-between middle w-100 pi-2"><div>` +
    game.i18n.localize("twdu.ui.stressDice") + `</div><div class="grow text-right pi-4 border-bottom">` +
    stressvalue +
    `</div></div>
    </div>`
  );
}

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

  // parse out the value to get the <option> tags for the select
  let options = "";
  for (let i = 0; i < value.length; i++) {
    let item = value[i];
    console.log("TWDU | item: ", item);
    if(item.type !== "vehicle"){
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
  } else {
  options += "<option id='" + item.id +
  "' value='" + item.system.maneuverability + "'>" + item.name + ": &nbsp;" + item.system.maneuverability + "</option>";
}
  }

  return (
    `<div >
   <div class="subheader">` +
    name +
    `</div>
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
    <div class="flex-row " style="flex-basis: 35%; justify-content: space-between;">
    <h4 class="subheader middle">` +
    diceName +
    ` : &nbsp;</h4>
      <p id="` +
    type +
    `" style="text-align: right" class="grow pi-2 border-bottom">` +
    diceValue +
    `</p></div>`
  );
}

function buildDivHtmlDialog(divContent) {
  return "<div class='twdu roll-dialog sidebar-dark'>" + divContent + "</div>";
}

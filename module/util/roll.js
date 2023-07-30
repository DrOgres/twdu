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

  let stressDice = actor.system.stress.value;

  console.log("TWDU | stressDice: ", stressDice);
  let dialogHtml = "";
  if (options.type === "weapon") {
    dialogHtml = buildHTMLDialog(options.attName, options.attributeDefault, "attribute");
    dialogHtml += buildHTMLDialog(options.skillName, options.skillDefault,"skill");
    dialogHtml += buildHTMLDialog("Damage", options.damageDefault, "damage");
    dialogHtml += buildHTMLDialog("stress", stressDice, "stress");
  }
  if (options.type === "attribute") {
    dialogHtml = buildHTMLDialog(options.attName, options.attributeDefault, "attribute");
    dialogHtml += buildHTMLDialog("stress", stressDice, "stress");
  }
  if (options.type === "skill") {
    dialogHtml = buildHTMLDialog(options.attName, options.attributeDefault, "attribute");
    dialogHtml += buildHTMLDialog(options.skillName, options.skillDefault,"skill");
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
            <h2>`+
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
            let attribute = html.find("#attribute")[0].value;
            let skill = html.find("#skill")[0].value;
            let bonus = html.find("#bonus")[0].value;
            let damage = html.find("#damage")[0].value;
            roll(
              sheet,
              testName,
              parseInt(attribute, 10),
              parseInt(skill, 10),
              parseInt(bonus, 10),
              parseInt(damage, 10)
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
    { width: "407",
      height: "auto", }
  );
  d.render(true);
}

export function roll() {
  // roll the dice
}

export function push() {
  // get the old roll
  // add stress to the character and add the stress dice to the roll
  // re-roll all dice that are not 6 while keeping the 6s
  // add the new dice to the old dice
  // return the new roll
}

async function rollDice(options) {}

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
    <h4 class="header">` + type + `</h4>
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

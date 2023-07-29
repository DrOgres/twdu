import { YearZeroRoll } from "./yzur.js";

export function prepareRollDialog(options){
    // create a dialog for the roll, 
    // options:
    // type: "attribute", "skill", "weapon", "armor"
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
    let attributeHtml = buildHTMLDialog(options.attName, options.attributeDefault, "attribute");
    let skillHtml = buildHTMLDialog(options.skillName, options.skillDefault, "skill");
    //TODO localize this
    let bonusHtml = buildInputDialog("Bonus", options.bonusDefault, "bonus");

    let stressDice = actor.system.stress.value;
    console.log("TWDU | stressDice: ", stressDice);
}


 export function roll(){
    // roll the dice
 }

 export function push(){

 }

 async function  rollDice(options){
 }

 function showDice(){

 }

 function buildInputDialog(){

 }

 function buildHTMLDialog(){

 }


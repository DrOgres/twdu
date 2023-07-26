import { YearZeroRoll } from "./yzur.js";

export function prepareRollDialog(options){
    // create a dialog for the roll, 
    // options:
    // sheet - the sheet to use for the roll
    // testName - the name of the test
    // attributeDefault - the value of the attribute that is contributiong to the roll
    // skillDefault - the value of the skill that is contributiong to the roll
    // bonusDefault = a bonuis from items or other sources
    // damageDefault = the damage of the weapon or attack being used
    // attName - the name of the attribute being used
    // skillName - the name of the skill being used
    //TODO build dialog and show it

    let attributeHtml = buildHTMLDialog(options.attName, options.attributeDefault, "attribute");
    let skillHtml = buildHTMLDialog(options.skillName, options.skillDefault, "skill");
    //TODO localize this
    let bonusHtml = buildInputDialog("Bonus", options.bonusDefault, "bonus");
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


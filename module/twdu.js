import TWDUItemSheet from "./sheet/TWDUItemSheet.js";
import TWDUActorSheet from "./sheet/TWDUActorSheet.js";
import {twdu} from "../module/config.js";

Hooks.once("init", ()=> {
    console.log("TWDU | Initializing TWDU");

    CONFIG.twdu = twdu;

    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("twdu", TWDUItemSheet, { makeDefault: true });

    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("twdu", TWDUActorSheet, { makeDefault: true });
    
});
    
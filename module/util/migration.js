export function migrate(){
    if (!game.user.isGM) return;


    const currentVersion = game.settings.get("twdu", "systemMigrationVersion");
    console.log("Data CurrentVersion", currentVersion);

    Object.keys(migrations).forEach(function(key) {
        if (!currentVersion || isNewerVersion(key, currentVersion))
          migrations[key]();
      });

  
    

}


const migrations = {
    "1.2.1" : migrateTo1_2_1
  }


  async function migrateTo1_2_1() {
    console.log("Migrating to 1.2.1");
    const options = {permanent: true};
    ui.notifications.warn("Migrating your data to version 1.2.1. Please, wait until it finishes.", options);

    for( let actor of game.actors.contents ){
        const updateData = migrateActorData(actor, "1.2.1");
        if (!foundry.utils.isEmpty(updateData)) {
            console.log("TWDU Migration",{actor: actor, changes: updateData});
            await actor.update(updateData);
          }
      
    }

    await game.settings.set("twdu", "systemMigrationVersion", game.system.version);


  }


  function migrateActorData(actor, version){
    const updateData = {};
    if (actor.type !== "character") return updateData;

    switch (version) {
      case "1.2.1":
        console.log("Migrating actor to 1.2.1 | ", actor);
        let stressMax = actor.system.stress.max;
        console.log("Stress Max | ", stressMax);
        if (stressMax < 10 ) {
            updateData["system.stress.max"] = 10;
            
        }
        
        break;
    }
    console.log(updateData);
    return updateData;
  }
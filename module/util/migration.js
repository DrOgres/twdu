export function migrate() {
  if (!game.user.isGM) return;

  const currentVersion = game.settings.get("twdu", "systemMigrationVersion");
  console.log("Data CurrentVersion", currentVersion);

  Object.keys(migrations).forEach(function (key) {
    console.log("Data Key", key);
    console.log("Data CurrentVersion", currentVersion);
    if (!currentVersion || foundry.utils.isNewerVersion(key, currentVersion))
      migrations[key]();
  });
}

const migrations = {
  "1.2.1": migrateTo1_2_1,
  "3.0.0": migrateTo3_0_0,
  "3.0.1": migrateTo3_0_1,
  "3.0.12": migrateTo3_0_12,
};

async function migrateTo3_0_12() {
  // for all actors, the items they have in particular weapons need their skill updated top the new format
  console.log("Migrating to 3.0.12");
  const options = { permanent: false };
  ui.notifications.warn(
    "Migrating your data to version 3.0.12. Please, wait until it finishes.",
    options
  );

  for (let actor of game.actors.contents) {
    const updateData = migrateActorData(actor, "3.0.12");
    if (!foundry.utils.isEmpty(updateData)) {
      // console.log("TWDU Migration",{actor: actor, changes: updateData});
      // for each item in updateData the key is the item id and the value is the new skill
      // update the document in the actor with the id that matches the key with the value of the key
      for (let key in updateData) {
        let item = actor.items.get(key);
        if (item) {
          // console.log("Item | ", item);
          item.update({ "system.skill": updateData[key] });
        }
      }
    }
  }

  // for all items in the game, if the item has a system.skill defined check to see if it starts with twdu. and if it does remove twdu. from the data
  for (let item of game.items.contents) {
    if (item.system.skill && item.system.skill.startsWith("twdu.")) {
      let skill = item.system.skill.replace("twdu.", "");
      // console.log("Skill | ", skill);
      await item.update({ "system.skill": skill });
    }

    if (item.system.range && item.system.range.startsWith("twdu.")) {
      let range = item.system.range.replace("twdu.", "");
      console.log("Range | ", range);
      await item.update({ "system.range": range });
    }
  }

  await game.settings.set(
    "twdu",
    "systemMigrationVersion",
    game.system.version
  );
  ui.notifications.info("Migration to 3.0.12 completed!", options);
}

async function migrateTo3_0_1() {
  // for all actors, the items they have in particular weapons need their skill updated top the new format
  console.log("Migrating to 3.0.1");
  const options = { permanent: false };
  ui.notifications.warn(
    "Migrating your data to version 3.0.1. Please, wait until it finishes.",
    options
  );

  for (let actor of game.actors.contents) {
    const updateData = migrateActorData(actor, "3.0.1");
    if (!foundry.utils.isEmpty(updateData)) {
      // console.log("TWDU Migration",{actor: actor, changes: updateData});
      // for each item in updateData the key is the item id and the value is the new skill
      // update the document in the actor with the id that matches the key with the value of the key
      for (let key in updateData) {
        let item = actor.items.get(key);
        if (item) {
          // console.log("Item | ", item);
          item.update({ "system.skill": updateData[key] });
        }
      }
    }
  }

  // for all items in the game, if the item has a system.skill defined check to see if it starts with twdu. and if it does remove twdu. from the data
  for (let item of game.items.contents) {
    if (item.system.skill && item.system.skill.startsWith("twdu.")) {
      let skill = item.system.skill.replace("twdu.", "");
      // console.log("Skill | ", skill);
      await item.update({ "system.skill": skill });
    }
    if (item.system.range && item.system.range.startsWith("twdu.")) {
      let range = item.system.range.replace("twdu.", "");
      console.log("Range | ", range);
      await item.update({ "system.range": range });
    }
  }

  await game.settings.set(
    "twdu",
    "systemMigrationVersion",
    game.system.version
  );
  ui.notifications.info("Migration to 3.0.1 completed!", options);
}

async function migrateTo3_0_0() {
  console.log("Migrating to 3.0.0");
  const options = { permanent: false };
  ui.notifications.warn(
    "Migrating your data to version 3.0.0. Please, wait until it finishes.",
    options
  );
  for (let actor of game.actors.contents) {
    const updateData = migrateActorData(actor, "3.0.0");
    if (!foundry.utils.isEmpty(updateData)) {
      // console.log("TWDU Migration",{actor: actor, changes: updateData});
      await actor.update(updateData);
    }
    if (actor.type === "animal") {
      // console.log("Animal Actor", actor);
      setToken(actor);
    }

    if (
      actor.type === "animal" &&
      actor.img === "systems/twdu/assets/images/misc/walker_classic.webp"
    ) {
      await actor.update({ img: "systems/twdu/assets/images/twdu-animal.png" });
      // also change the prototype token to this same image
      let token = actor.prototypeToken;
      // console.log("Token", token);
      token.texture.src = "systems/twdu/assets/images/twdu-animal.png";
      await actor.update({ prototypeToken: token });
    } else if (
      actor.type === "npc" &&
      actor.img === "icons/svg/mystery-man.svg"
    ) {
      await actor.update({ img: "systems/twdu/assets/images/twdu-npc.png" });
    }
  }

  await game.settings.set(
    "twdu",
    "systemMigrationVersion",
    game.system.version
  );
  ui.notifications.info("Migration to 3.0.0 completed!", options);
}

async function migrateTo1_2_1() {
  console.log("Migrating to 1.2.1");
  const options = { permanent: false };
  ui.notifications.warn(
    "Migrating your data to version 1.2.1. Please, wait until it finishes.",
    options
  );

  for (let actor of game.actors.contents) {
    const updateData = migrateActorData(actor, "1.2.1");
    if (!foundry.utils.isEmpty(updateData)) {
      // console.log("TWDU Migration",{actor: actor, changes: updateData});
      await actor.update(updateData);
    }
  }

  await game.settings.set(
    "twdu",
    "systemMigrationVersion",
    game.system.version
  );
  ui.notifications.info("Migration to 1.2.1 completed!", options);
}

// function migrateItemData(item, version){
//   const updateData = {};

// }

function migrateActorData(actor, version) {
  const updateData = {};

  switch (version) {
    case "1.2.1":
      if (actor.type !== "character") return updateData;
      console.log("Migrating actor to 1.2.1 | ", actor);
      let stressMax = actor.system.stress.max;
      console.log("Stress Max | ", stressMax);
      if (stressMax < 10) {
        updateData["system.stress.max"] = 10;
      }
      break;
    case "3.0.0":
      if (actor.type !== "animal") return updateData;
      console.log("Migrating actor to 3.0.0 | ", actor);
      updateData["system.healthMax.value"] = actor.system.health;
      updateData["system.healthMax.max"] = actor.system.health;

      console.log("Health Max | ", updateData);
      break;

    case "3.0.1": {
      let items = actor.items;
      console.log("Items | ", items);
      for (let item of items) {
        console.log("Item | ", item);
        // if the item has a system.skill defined check to see if it starts with twdu. and if it does remove twdu. from the data
        if (item.system.skill && item.system.skill.startsWith("twdu.")) {
          let skill = item.system.skill.replace("twdu.", "");
          console.log("Skill | ", skill);
          updateData[item.id] = skill;
        }

        if (item.system.range && item.system.range.startsWith("twdu.")) {
          let range = item.system.range.replace("twdu.", "");
          console.log("Range | ", range);
          updateData[item.id] = range;
        }
      }
      break;
    }
    case "3.0.12": {
      let items = actor.items;
      console.log("Items | ", items);
      for (let item of items) {
        console.log("Item | ", item);
        // if the item has a system.skill defined check to see if it starts with twdu. and if it does remove twdu. from the data
        if (item.system.skill && item.system.skill.startsWith("twdu.")) {
          let skill = item.system.skill.replace("twdu.", "");
          console.log("Skill | ", skill);
          updateData[item.id] = skill;
        }

        if (item.system.range && item.system.range.startsWith("twdu.")) {
          let range = item.system.range.replace("twdu.", "");
          console.log("Range | ", range);
          updateData[item.id] = range;
        }
      }
      break;
    }
  }
  console.log(updateData);
  return updateData;
}

function setToken(actor) {
  if (actor.type !== "animal") return;
  console.log("Setting Token Image for Animal Actor | ", actor);
  console.log("Token", actor.prototypeToken);
  let token = actor.prototypeToken;
  console.log("Token", token);
  token.texture.src = "systems/twdu/assets/images/twdu-animal.png";
  token.bar1 = { attribute: "healthMax" };
  actor.update({ prototypeToken: token });
}

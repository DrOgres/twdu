export const hideChatActionButtons = function (message, html, data) {
  const card = html.find(".twdu.chat-card");

  if (card.length > 0) {
    let user = game.actors.get(card.attr("data-owner-id"));

    if (user && !user.isOwner) {
      const buttons = card.find(".push");
      buttons.each((_i, btn) => {
        btn.style.display = "none";
      });
    }
  }
};

export const buildChatCard = function (type, data) {
  console.log("TWDU | buildChatCard: ", type, data);

  let message = "";
  let token = "";
  const actor = game.actors.get(ChatMessage.getSpeaker().actor);
  if (actor) {
    token = actor.img;
  } else {
    token = "systems/twdu/assets/images/info.png";
  }

  switch (type) {
    case "weapon":
      console.log("TWDU | weapon: ", data);
      let skill = "";
      if (data.system.skill == "closeCombat") {
        skill = game.i18n.localize("SKILL.CLOSE_COMBAT");
      } else if (data.system.skill == "rangedCombat") {
        skill = game.i18n.localize("SKILL.RANGED_COMBAT");
      } else {
        skill = game.i18n.localize("SKILL.FORCE");
      }
      message =
        `<div class="card-holder" style="position: relative;">
            <img src="` +
        token +
        `" width="45" height="45" class="roll-token" />
            <div class='chat-flavor'>` +
        data.name.toUpperCase() +
        "</div>" +
        "<div class='flex row center'><img src='" +
        data.img +
        "' width=50 height=50/></div>" +
        "<div class='chat-item-info flex column'>" +
        "<b>" +
        game.i18n.localize("WEAPON.DAMAGE") +
        ": </b>" +
        data.system.damage +
        "</br>" +
        "<b>" +
        game.i18n.localize("WEAPON.RANGE") +
        ": </b>" +
        data.system.range +
        "</br>" +
        "<b>" +
        game.i18n.localize("WEAPON.BONUS") +
        ": </b>" +
        data.system.bonus +
        "</br>" +
        "<b>" +
        game.i18n.localize("WEAPON.AVAILABILITY") +
        ": </b>" +
        data.system.availability +
        "</br>" +
        "<b>" +
        game.i18n.localize("WEAPON.SKILL") +
        ": </b>" +
        skill +
        "</br>" +
        `</div></div>`;
      break;
    case "armor":
      console.log("TWDU | armor: ", data);
      message =
        `<div class="card-holder" style="position: relative;">
              <img src="` +
        token +
        `" width="45" height="45" class="roll-token" />
              <div class='chat-flavor'>` +
        data.name.toUpperCase() +
        "</div>" +
        "<div class='flex row center'><img src='" +
        data.img +
        "' width=50 height=50/></div>" +
        "<div class='chat-item-info flex column'>" +
        "<div><b>" +
        game.i18n.localize("ARMOR.PROTECTION") +
        ": </b>" +
        data.system.protection +
        "</div>" +
        "<div><b>" +
        game.i18n.localize("ARMOR.AGILITY") +
        ": </b>" +
        data.system.agility +
        "</div>" +
        "<div><b>" +
        game.i18n.localize("ARMOR.AVAILABILITY") +
        ": </b>" +
        data.system.availability +
        "</div>" +
        `</div></div>`;
      break;
    case "gear":
      console.log("TWDU | gear: ", data);
      let description = "";
      let risk = "";
      if (data.system.description != "") {
        description =
          "<b>" +
          game.i18n.localize("GEAR.DESCRIPTION") +
          ": </b>" +
          data.system.description +
          "</br>";
      }
      if (data.system.risk != "") {
        risk =
          "<b>" +
          game.i18n.localize("GEAR.RISK") +
          ": </b>" +
          data.system.risk +
          "</br>";
      }

      message =
        `<div class="card-holder" style="position: relative;">
                  <img src="` +
        token +
        `" width="45" height="45" class="roll-token" />
                  <div class='chat-flavor'>` +
        data.name.toUpperCase() +
        "</div>" +
        "<div class='flex row center'><img src='" +
        data.img +
        "' width=50 height=50/></div>" +
        "<div class='chat-item-info flex column'>" +
        "<b>" +
        game.i18n.localize("GEAR.BONUS") +
        ": </b>" +
        data.system.bonus +
        "</br>" +
        "<b>" +
        game.i18n.localize("GEAR.AVAILABILITY") +
        ": </b>" +
        data.system.availability +
        "</br>" +
        "<b>" +
        game.i18n.localize("GEAR.EFFECT") +
        ": </b>" +
        data.system.effect +
        "</br>" +
        description +
        risk +
        `</div></div>`;
      chatData = {
        speaker: ChatMessage.getSpeaker(),
        user: game.user.id,
        rollMode: game.settings.get("core", "rollMode"),
        content: message,
      };
      break;
    case "tinyItem":
      console.log("TWDU | tinyItem: ", data);
      break;
    case "talent":
      console.log("TWDU | talent: ", data);
      message =
        `<div class="card-holder" style="position: relative;">
          <img src="` +
        token +
        `" width="45" height="45" class="roll-token" />
          <div class='chat-flavor'>` +
        data.name.toUpperCase() +
        "</div>" +
        "<div class='flex row center'><img src='" +
        data.img +
        "' width=50 height=50/></div>" +
        "<div class='chat-item-info flex column'>" +
        "<b>" +
        game.i18n.localize("TALENT.DESCRIPTION") +
        ": </b>" +
        data.system.description +
        "</br>" +
        `</div></div>`;
      break;
    case "criticalInjury":
      console.log("TWDU | criticalInjury: ", data);
      let timeLimit = "";
      if (data.system.timeLimit != "") {
        timeLimit =
          "<b>" +
          game.i18n.localize("CRITICAL_INJURY.TIME_LIMIT") +
          ": </b>" +
          data.system.timeLimit +
          "</br>";
      }

      message =
        `<div class="card-holder" style="position: relative;">
            <img src="` +
        token +
        `" width="45" height="45" class="roll-token" />
            <div class='chat-flavor'>` +
        game.i18n.localize("CRITICAL_INJURY.NAME") +
        ": " +
        data.name.toUpperCase() +
        "</div>" +
        "<div class='flex row center'><img src='" +
        data.img +
        "' width=50 height=50/></div>" +
        "<div class='chat-item-info flex column'>" +
        "<b>" +
        game.i18n.localize("CRITICAL_INJURY.TYPE") +
        `: </b><span class="title-case">` +
        data.system.type +
        "</span></br>" +
        "<b>" +
        game.i18n.localize("CRITICAL_INJURY.FATAL") +
        ": </b>" +
        data.system.fatal +
        "</br>" +
        timeLimit +
        "<b>" +
        game.i18n.localize("CRITICAL_INJURY.EFFECT") +
        ": </b>" +
        data.system.effect +
        "</br>" +
        `</div></div>`;
      break;
    case "project":
      console.log("TWDU | project: ", data);
      break;
    default:
      console.log("TWDU | default: ", data);
      console.error("TWDU | buildChatCard: we should not be here");
      break;
  }
  console.log("TWDU | message: ", message);
  let chatData = {
    speaker: ChatMessage.getSpeaker(),
    user: game.user.id,
    rollMode: game.settings.get("core", "rollMode"),
    content: message,
  };

  return chatData;
};

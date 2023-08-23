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

//TODO templateize the various chat cards

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
        skill = game.i18n.localize("twdu.closeCombat");
      } else if (data.system.skill == "rangedCombat") {
        skill = game.i18n.localize("twdu.rangedCombat");
      } else {
        skill = game.i18n.localize("twdu.force");
      }
      message =
        `<div class="card-holder" style="position: relative;">
            <img src="` +
        token +
        `" width="45" class="roll-token" />
            <div class='chat-flavor'>` +
        data.name.toUpperCase() +
        "</div>" +
        "<div class='flex-row center'><img src='" +
        data.img +
        "' width=50 height=50/></div>" +
        "<div class='chat-item-info grid two-col justify'>" +
        "<b>" +
        game.i18n.localize("twdu.damage") +
        ": </b>" +
        data.system.damage +
        "</br>" +
        "<b>" +
        game.i18n.localize("twdu.range") +
        ": </b>" +
        data.system.range +
        "</br>" +
        "<b>" +
        game.i18n.localize("twdu.bonus") +
        ": </b>" +
        data.system.bonus +
        "</br>" +
        "<b>" +
        game.i18n.localize("twdu.encSlots") +
        ": </b>" +
        data.system.weight +
        "</br>" +
        "<b>" +
        game.i18n.localize("twdu.skill") +
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
        `" width="45"  class="roll-token" />
              <div class='chat-flavor'>` +
        data.name.toUpperCase() +
        "</div>" +
        "<div class='flex row center'><img src='" +
        data.img +
        "' width=50 height=50/></div>" +
        "<div class='chat-item-info grid two-col'>" +
        "<div><b>" +
        game.i18n.localize("twdu.protection") +
        ": </b>" +
        data.system.protection +
        "</div>" +
        "<div><b>" +
        game.i18n.localize("twdu.agilityPenalty") +
        ": </b>" +
        data.system.agility +
        "</div>" +
        `</div>`;
      break;
    case "gear":
      console.log("TWDU | gear: ", data);
      let description = "";
      let risk = "";
      if (data.system.description != "") {
        description =
          "<b>" +
          game.i18n.localize("twdu.description") +
          ": </b>" +
          data.system.description +
          "</br>";
      }
      if (data.system.risk != "") {
        risk =
          "<b>" +
          game.i18n.localize("twdu.risk") +
          ": </b>" +
          data.system.risk +
          "</br>";
      }

      message =
        `<div class="card-holder" style="position: relative;">
                  <img src="` +
        token +
        `" width="45"  class="roll-token" />
                  <div class='chat-flavor'>` +
        data.name.toUpperCase() +
        "</div>" +
        "<div class='flex row center'><img src='" +
        data.img +
        "' width=50 height=50/></div>" +
        "<div class='chat-item-info grid two-col'>" +
        "<b>" +
        game.i18n.localize("twdu.bonus") +
        ": </b>" +
        data.system.bonus +
        "</br>" +
        "<b>" +
        game.i18n.localize("twdu.weight") +
        ": </b>" +
        data.system.weight +
        "</br>" +
        "<b>" +
        game.i18n.localize("twdu.effect") +
        ": </b>" +
        data.system.effect +
        "</br>" +
        description +
        risk +
        `</div></div>`;

      break;
    case "tinyItem":
      console.log("TWDU | tinyItem: ", data);
      message =
        `<div class="card-holder" style="position: relative;">
      <img src="` +
        token +
        `" width="45" class="roll-token" />
      <div class='chat-flavor'>` +
        data.name.toUpperCase() +
        "</div>" +
        "<div class='flex row center'><img src='" +
        data.img +
        "' width=50 height=50/></div>" +
        "<div class='chat-item-info grid two-col'>" +
        "<b>" +
        game.i18n.localize("twdu.description") +
        ": </b>" +
        data.system.description +
        "</br>" +
        `</div></div>`;
      break;
    case "issue":
      console.log("TWDU | issue: ", data);
      message =
        `<div class="card-holder" style="position: relative;">
      <img src="` +
        token +
        `" width="45" class="roll-token" />
      <div class='chat-flavor'>` +
        data.name.toUpperCase() +
        "</div>" +
        "<div class='flex row center'><img src='" +
        data.img +
        "' width=50 height=50/></div>" +
        "<div class='chat-item-info grid two-col'>" +
        "<b>" +
        game.i18n.localize("twdu.description") +
        ": </b>" +
        data.system.description +
        "</br>" +
        `</div></div>`;
      break;
    case "talent":
      console.log("TWDU | talent: ", data);
      message =
        `<div class="card-holder" style="position: relative;">
          <img src="` +
        token +
        `" width="45" class="roll-token" />
          <div class='chat-flavor'>` +
        data.name.toUpperCase() +
        "</div>" +
        "<div class='flex row center'><img src='" +
        data.img +
        "' width=50 height=50/></div>" +
        "<div class='chat-item-info grid two-col'>" +
        "<b>" +
        game.i18n.localize("twdu.description") +
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
          game.i18n.localize("twdu.timeLimit") +
          ": </b>" +
          data.system.timeLimit +
          "</br>";
      }

      message =
        `<div class="card-holder" style="position: relative;">
            <img src="` +
        token +
        `" width="45"  class="roll-token" />
            <div class='chat-flavor'>` +
        game.i18n.localize("twdu.name") +
        ": " +
        data.name.toUpperCase() +
        "</div>" +
        "<div class='flex row center'><img src='" +
        data.img +
        "' width=50 height=50/></div>" +
        "<div class='chat-item-info grid two-col'>" +
        "<b>" +
        game.i18n.localize("twdu.type") +
        `: </b><span class="title-case">` +
        data.system.type +
        "</span></br>" +
        "<b>" +
        game.i18n.localize("twdu.lethal") +
        ": </b>" +
        data.system.fatal +
        "</br>" +
        timeLimit +
        "<b>" +
        game.i18n.localize("twdu.effect") +
        ": </b>" +
        data.system.effect +
        "</br>" +
        `</div></div>`;
      break;
    case "project":
      console.log("TWDU | project: ", data);
      message =
        `<div class="card-holder" style="position: relative;">
      <img src="` +
        token +
        `" width="45"  class="roll-token" />
      <div class='chat-flavor'>` +
        game.i18n.localize("twdu.project") +
        ": " +
        data.name.toUpperCase() +
        "</div>" +
        "<div class='flex row center'><img src='" +
        data.img +
        "' width=50 height=50/></div>" +
        "<div class='description'>" +
        data.system.description +
        "<div class='chat-item-info grid two-col'>" +
        "<b>" +
        game.i18n.localize("twdu.effect") +
        `: </b><span class="title-case">` +
        data.system.effect +
        "</span></br>" +
        "<b>" +
        game.i18n.localize("twdu.workforce") +
        ": </b>" +
        data.system.workforce +
        "</br> <b>" +
        game.i18n.localize("twdu.finishDate") +
        ": </b>" +
        data.system.finishDate +
        "</br>" +
        `</div></div>`;

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

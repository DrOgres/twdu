export const hideChatActionButtons = function (message, html, data) {
  const card = html.find(".vaesen.chat-card");

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
  let chatData = {};
  let token = "";
  const actor = game.actors.get(ChatMessage.getSpeaker().actor);
  if (actor) {
    token = actor.img;
  } else {
    token = "systems/twdu/assets/info.png";
  }

  switch (type) {
    case "weapon":
      console.log("TWDU | weapon: ", data);
      break;
    case "armor":
      console.log("TWDU | armor: ", data);
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
      break;
    case "criticalInjury":
      console.log("TWDU | criticalInjury: ", data);
      break;
    case "project":
      console.log("TWDU | project: ", data);
      break;
    default:
      console.log("TWDU | default: ", data);
      break;
  }

    return chatData;
};

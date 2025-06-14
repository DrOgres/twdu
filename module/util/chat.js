export default class ChatMessageTWDU extends foundry.documents.ChatMessage {
  prepareData() {
    super.prepareData();
  }
  static activateListeners(html) {
    // console.log("Activating listeners", html);
    html.find(".dice-button.push").click((ev) => {
      // console.log("Button clicked", ev);
      _onPush(ev);
    });
    html.find(".dice-button.apply-damage").click((ev) => {
      // console.log("Button clicked", ev);
      _onApplyDamage(ev);
    });
  }
}

export async function buildChatCard(type, item, chatOptions = {}) {
  let token = "";
  const actor = game.actors.get(ChatMessage.getSpeaker().actor);
  if (actor) {
    token = actor.img;
  } else {
    token = "systems/twdu/assets/images/info.png";
  }

  let skill = "";
  if (type === "weapon") {
    if (item.system.skill == "closeCombat") {
      skill = game.i18n.localize("twdu.closeCombat");
    } else if (item.system.skill == "rangedCombat") {
      skill = game.i18n.localize("twdu.rangedCombat");
    } else {
      skill = game.i18n.localize("twdu.force");
    }
  }

  const data = {
    item: item,
    token: token,
    name: item.name,
    img: item.img,
    system: item.system,
    skill: skill,
  };

  const isPrivate = chatOptions.isPrivate;

  let chatData = {
    speaker: ChatMessage.getSpeaker(),
    user: game.user.id,
    rollMode: game.settings.get("core", "rollMode"),
  };

  if (isPrivate) {
    chatData.whisper = ChatMessage.getWhisperRecipients("GM");
  }

  switch (type) {
    case "weapon":
      chatData.content = await foundry.applications.handlebars.renderTemplate(
        twduChat.template.weapon,
        data
      );
      break;

    case "armor":
      chatData.content = await foundry.applications.handlebars.renderTemplate(
        twduChat.template.armor,
        data
      );
      break;

    case "gear":
      chatData.content = await foundry.applications.handlebars.renderTemplate(
        twduChat.template.gear,
        data
      );
      break;
    case "tinyItem":
    case "issue":
    case "rumor":
    case "faction":
    case "challenges":
    case "endgame":
      chatData.content = await foundry.applications.handlebars.renderTemplate(
        twduChat.template.simpleItem,
        data
      );
      break;
    case "talent":
      chatData.content = await foundry.applications.handlebars.renderTemplate(
        twduChat.template.talent,
        data
      );
      break;
    case "criticalInjury":
      chatData.content = await foundry.applications.handlebars.renderTemplate(
        twduChat.template.injury,
        data
      );
      break;
    case "project":
      chatData.content = await foundry.applications.handlebars.renderTemplate(
        twduChat.template.project,
        data
      );
      break;
    case "vehicle":
      chatData.content = await foundry.applications.handlebars.renderTemplate(
        twduChat.template.vehicle,
        data
      );
      break;
    default:
      console.error("TWDU | buildChatCard: we should not be here", data);
      break;
  }

  return chatData;
}

async function _onPush(event) {
  console.log(event);
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

export const hideChatActionButtons = function (message, html, data) {
  const card = html.find(".twdu.chat-card");

  if (card.length > 0) {
    let user = game.actors.get(card.attr("data-owner-id"));

    if (user && !user.isOwner) {
      console.log("card render is user owner? ".user.isOwner);
      const buttons = card.find(".push");
      buttons.each((_i, btn) => {
        btn.style.display = "none";
      });
    }
  }
};

const twduChat = {
  template: {
    weapon: "systems/twdu/templates/chat/chatWeapon.hbs",
    armor: "systems/twdu/templates/chat/chatArmor.hbs",
    gear: "systems/twdu/templates/chat/chatGear.hbs",
    simpleItem: "systems/twdu/templates/chat/chatSimpleItem.hbs",
    talent: "systems/twdu/templates/chat/chatTalent.hbs",
    injury: "systems/twdu/templates/chat/chatInjury.hbs",
    project: "systems/twdu/templates/chat/chatProject.hbs",
    vehicle: "systems/twdu/templates/chat/chatVehicle.hbs",
  },
};

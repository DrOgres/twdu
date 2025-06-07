export class ChatMessageTWDU extends ChatMessage {
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
      console.log("card render is user owner? ". user.isOwner);
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

async function renderChatMessage(chatOptions, dataSource) {
  const data = dataSource;
  return await Promise.resolve(renderTemplate(chatOptions.template, data));
}


export const buildChatCard = function (type, item, chatOptions = {}) {
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
    skill: skill
   };

  switch (type) {
    case "weapon": 
      chatOptions = foundry.utils.mergeObject(
        {
          user: game.user.id,
          flavor: data.name,
          template: twduChat.template.weapon,
          blind: false,
        },
        chatOptions
      );

      break;
    
    case "armor": 
      chatOptions = foundry.utils.mergeObject(
        {
          user: game.user.id,
          flavor: data.name,
          template: twduChat.template.armor,
          blind: false,
        },
        chatOptions
      );
      break;
    
    case "gear":
      chatOptions = foundry.utils.mergeObject(
        {
          user: game.user.id,
          flavor: data.name,
          template: twduChat.template.gear,
          blind: false,
        },
        chatOptions
      );
      break;
    case "tinyItem":
    case "issue":
    case "rumor":
    case "faction":
    case "challenges":
    case "endgame":
      chatOptions = foundry.utils.mergeObject(
        {
          user: game.user.id,
          flavor: data.name,
          template: twduChat.template.simpleItem,
          blind: false,
        },
        chatOptions
      );
      break;
    case "talent":
      chatOptions = foundry.utils.mergeObject(
        {
          user: game.user.id,
          flavor: data.name,
          template: twduChat.template.talent,
          blind: false,
        },
        chatOptions
      );
      break;
    case "criticalInjury":
      chatOptions = foundry.utils.mergeObject(
        {
          user: game.user.id,
          flavor: data.name,
          template: twduChat.template.injury,
          blind: false,
        },
        chatOptions
      );
      break;
    case "project":
      chatOptions = foundry.utils.mergeObject(
        {
          user: game.user.id,
          flavor: data.name,
          template: twduChat.template.project,
          blind: false,
        },
        chatOptions
      );

      break;
    case "vehicle":
      chatOptions = foundry.utils.mergeObject(
        {
          user: game.user.id,
          flavor: data.name,
          template: twduChat.template.vehicle,
          blind: false,
        },
        chatOptions
      );
      break;
    default:
      console.error("TWDU | buildChatCard: we should not be here", data);
      break;
  }
  const isPrivate = chatOptions.isPrivate;
  renderChatMessage(chatOptions, data).then((html) => {
    let chatData = {
      speaker: ChatMessage.getSpeaker(),
      user: game.user.id,
      rollMode: game.settings.get("core", "rollMode"),
      content: html,
    };
    if (isPrivate) {
      chatData.whisper = ChatMessage.getWhisperRecipients("GM");
    }
    ChatMessage.create(chatData);
  });
};

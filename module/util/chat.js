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

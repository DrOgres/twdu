export default class TWDUActor extends Actor {
  prepareData() {
    super.prepareData();
    const actorData = this._source;
    const data = actorData.system;
    const flags = this.flags;
  }

  async _preCreate(data, options, user) {
    await super._preCreate(data, options, user);

    let tokenProto = {
      "prototypeToken.displayName": CONST.TOKEN_DISPLAY_MODES.OWNER,
      "prototypeToken.displayBars": CONST.TOKEN_DISPLAY_MODES.OWNER,
      "prototypeToken.disposition": CONST.TOKEN_DISPOSITIONS.FRIENDLY,
      "prototypeToken.name": `${data.name}`,
      "prototypeToken.bar1": { attribute: "health" },
      "prototypeToken.bar2": { attribute: "None" },
      "prototypeToken.actorLink": true,
      "prototypeToken.sight.enabled": "true",
      "prototypeToken.sight.range": "12",
    };
    if (game.settings.get("twdu", "defaultTokenSettings")) {
      switch (data.type) {
        case "character":
          tokenProto["prototypeToken.bar2"] = { attribute: "stress" };
          break;
        case "haven":
          tokenProto["prototypeToken.bar1"] = { attribute: "None" };
          break;
        default:
          break;
      }
    }
    this.updateSource(tokenProto);
  }

  _prepareTokenImg() {
    if (game.settings.get("twdu", "defaultTokenSettings")) {
      if (
        this.token.img == "icons/svg/mystery-man.svg" &&
        this.token.img != this.img
      ) {
        this.token.img = this.img;
      }
    }
  }

  /**
   * Override initializing a character to set default portraits.
   * @param {object} data object of an initialized character.
   * @param {object?} options optional object of options.
   */
  static async create(data, options) {
    if (!data.img) {
      switch (data.type) {
        case "haven":
          data.img = "systems/twdu/assets/icons/triple-gate.svg";
          break;
        case "npc":
          data.img = "systems/twdu/assets/images/twdu-npc.webp";
          break;
        default:
          data.img = `systems/twdu/assets/images/twdu-${data.type}.png`;
          break;
      }
    }
    return super.create(data, options);
  }
}


export default class TWDUActor extends Actor {

    prepareData() {
        super.prepareData();
        const actorData = this._source;
        const data = actorData.system;
        const flags = this.flags;


    }

    async _preCreate(data, options, user) {
        console.log("TWDU | _preCreate: ", data, options, user);
        await super._preCreate(data, options, user);

      
    
        console.log("TWDU | _preCreate: default token settings", game.settings.get('twdu', 'defaultTokenSettings'));
        
        let tokenProto = {
          'prototypeToken.displayName': CONST.TOKEN_DISPLAY_MODES.OWNER,
          'prototypeToken.displayBars': CONST.TOKEN_DISPLAY_MODES.OWNER,
          'prototypeToken.disposition': CONST.TOKEN_DISPOSITIONS.FRIENDLY,
          'prototypeToken.name': `${data.name}`,
          'prototypeToken.bar1': { attribute: 'health' },
          'prototypeToken.bar2': { attribute: 'None' },
          'prototypeToken.actorLink': true,
          'prototypeToken.sight.enabled': 'true',
          'prototypeToken.sight.range': '12',
        };
        if (game.settings.get('twdu', 'defaultTokenSettings')) {
          switch (data.type) {
            case 'character':
              tokenProto['prototypeToken.bar2'] = { attribute: 'stress' };
              break;
            case 'haven':
              tokenProto['prototypeToken.bar1'] = { attribute: 'None' };
              break;
            default:
              break;
          }
        }
        this.updateSource(tokenProto);
      }

      _prepareTokenImg() {
        if (game.settings.get('twdu', 'defaultTokenSettings')) {
          if (this.token.img == 'icons/svg/mystery-man.svg' && this.token.img != this.img) {
            this.token.img = this.img;
          }
        }
      }
}
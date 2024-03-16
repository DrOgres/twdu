# The Walking Dead Universe
The Walking Dead Universe RPG system for Foundry VTT


- TODO - Code Cleanup
- TODO - Ensure all Localization is Complete


## Release Notes:

Release 1.2.1:
- CHanged default for Max Stress to 10
- Max Stress now increases when it is over the current max stress, this should make for more useful status bars on tokens, that reflect use during play.
- Migrate actors to new stress system
- Changed verbage on equip/store items to be more clear

Release: 1.2.0
- Added ability to assign PC to Haven which will show on the character sheet and Haven sheet. [#18](https://github.com/DrOgres/twdu/issues/18)
- Added drag and drop items  between all actors. [#16](https://github.com/DrOgres/twdu/issues/16) and [#13](https://github.com/DrOgres/twdu/issues/13)
- 

Release: 1.1.0
- Fixed bug where non-gm users were shown an error when the GM changed threat level [[#24](https://github.com/DrOgres/twdu/issues/24)]

Release: 1.0.9
- fixed bug where multiple chat cards would be created for every active user when threat level was changed, now only the GM user creates a card [#22](https://github.com/DrOgres/twdu/issues/22)

Release: 1.0.8  
- updated token defaults to make vision less annoying for GM's and Players.

Release: 1.0.7  
- Added French Localization || Localisation française ajoutée (Thanks to [Kyllianm85]) [#19](https://github.com/DrOgres/twdu/issues/19)
- changed max stress on template for better representation on status bars for tokens.

Release: 1.0.6  
- Fixed issue with shown info on critial injuries on sheet always showing injuries as lethal. [#17](https://github.com/DrOgres/twdu/issues/17)

Release: 1.0.5
- Fixed height of inputs in h1 sections.

Release: 1.0.4
- Fixed weapon sheet to display Ranged Combat skill correctly in drop down. 
- Fixed injury chat card to display correct information for letality.

Release: 1.0.3
- Fixed NPC rolling too many dice for Trained Skills [#8](https://github.com/DrOgres/twdu/issues/8)
- Fixed Talents for weapon skills not showing up in the roll dialog [#10](https://github.com/DrOgres/twdu/issues/10)
- Fixed arbitrary cap on XP set to 10 [#11](https://github.com/DrOgres/twdu/issues/11)
- Fixed armor penalty not applying to Mobility tests [#9](https://github.com/DrOgres/twdu/issues/9)


Release: 1.0.2
- Added Brazilian Portuguese Localization || Adicionada localização em português do Brasil (Thanks to [shuanz])
- Adjusted collumn widths in main tab of character sheet to ensure data and headers align properly.

Release: 1.0.1
- Fixed CSS on settings menu sidebar set up for content modules unreadable without them (fixes Issue [#2](https://github.com/DrOgres/twdu/issues/2))
- Added German Localization ||  Deutsche Lokalisierung hinzugefügt (Thanks to [Tobbot]) 

Release: 1.0.0
- Initial Release

Beta 5:
- Added animal as an actor type.
- Fixed: Emathy skill set on NPC sheet had incorrect id for base skill check boxes.
- Fixed: CSS for chat card flavor-text was unreadable on light background. 

Beta 4:
- Added BP boolean to weapon sheet to allow explosive damage to be rolled properly. 
- Fixed: check boxes sometimes not working properly
- Added vehicles to PC and NPC sheets

Beta 3:
- added bonus to weapon listing in inventory
- added Dice So Nice support
- Fixed: Notes on Haven not editable
- Fixed: New characters showing wrong health
- Fixed: NPC background field not saving properly
- Fixed: tooltip for Experience Boxes. 

-CSS - Increased minimum size of TinyMCE editor.

Beta 2:
- Fixed: Weapon Sheet not showing bonus field
- Fixed: Weapon on Roll Dialog
- Fixed: Armor was Rolling Stress and Critical Injury Dice (not RAW)
- Fixed: Missing localization on Settings

- Adjustment - CSS for weapon sheet to acomidate new field and fix minor border issue


Beta 1:
- initial Testing release

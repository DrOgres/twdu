# The Walking Dead Universe
The Walking Dead Universe RPG system for Foundry VTT


- TODO - Code Cleanup


## Release Notes:

Release 4.0.3
- Fixed ranged combat for gear [#93](https://github.com/DrOgres/twdu/issues/93)
- French Localization update for item types in creation menu 

Release 4.0.2
- Fixed context menu for chat cards postitioned under other cards [#87](https://github.com/DrOgres/twdu/issues/87)
- CSS color improved slightly in dark mode until such time as we can do a full rework of css for new foundry [#88](https://github.com/DrOgres/twdu/issues/88)
- Added localization flags for items [#91](https://github.com/DrOgres/twdu/issues/91)
- Fixed Gear not appearing as an option for Close Combat skill rolls [#93](https://github.com/DrOgres/twdu/issues/93)
- Fixed CSS on audio looping to make it visible [#86](https://github.com/DrOgres/twdu/issues/86)
- Adjusted CSS filter on non-whispered chat cards to clean up the appearance [#84](https://github.com/DrOgres/twdu/issues/84)
- Added css to distinguih selected state on token hud icons [#83](https://github.com/DrOgres/twdu/issues/83)
- Reduced font size in sidebar listings [#82](https://github.com/DrOgres/twdu/issues/82)
- French Localization updated Thanks [Cereb](https://github.com/CptCereb) | Localisation française mise à jour Merci Cereb

Release 4.0.1
- A host of CSS fixes to improve readability and usability in the system this should address [#79](https://github.com/DrOgres/twdu/issues/79) and related issues [#81](https://github.com/DrOgres/twdu/issues/81)  and [#80](https://github.com/DrOgres/twdu/issues/80) 

Release 4.0.0
- V13 compatability
- updated German Localization thanks [KaiderWeise](https://github.com/KaiderWeise) 
- Fixex: NPC sheets changing skill levels only ever trageted the first opened sheet [#69](https://github.com/DrOgres/twdu/issues/69)

Release 3.0.13
- Fixed: NPC sheets completely borked [#77](https://github.com/DrOgres/twdu/issues/77)


Release 3.0.12
- Fixed: mirgated weapons to match new data structure
- Animals: now attack properly
- V13 prepwork

Release 3.0.11
- Locaized 'severity' letter on critical rolldowns

Release 3.0.10
- Fix [#70](https://github.com/DrOgres/twdu/issues/70) Rollables not getting dice set correctly on main tab
- Fix [#71](https://github.com/DrOgres/twdu/issues/70) Localization incorrect on roll down for critical injury

Release 3.0.9
- Fix [#68](https://github.com/DrOgres/twdu/issues/68) NPC not rolling when items are usable

Release 3.0.8
- minor update push

Release 3.0.7
- Fix typo on localize helper

Release 3.0.6
- Fix: [#56](https://github.com/DrOgres/twdu/issues/56) Items were duplicating themselves when dropped on originating actor
- Fix: [#62](https://github.com/DrOgres/twdu/issues/62) Weapon names overflowing into other text when they are very long 
- Fix Localization completed this also addreses [#65](https://github.com/DrOgres/twdu/issues/65)


Release 3.0.5
- Fix: [#61](https://github.com/DrOgres/twdu/issues/61) Non-english localizations were not showing gear or talents in roll dialog

Release 3.0.4
- added vehicle items to the drop down for gear when rolling mobility.
- fix: fix css area for drop listener on npc sheet to accept dropped items on whole sheet [#50](https://github.com/DrOgres/twdu/issues/50)
- fix: fix haven sheet not listening for dropped items [#52](https://github.com/DrOgres/twdu/issues/52)
- Feature: you may now make a Vehicle Maneuverability Roll by clicking the vehicle item in the inventory. [#49](https://github.com/DrOgres/twdu/issues/49)
- Weapons that have no skill selected now warn when attempting to use them to roll

Release 3.0.3
- Fix: add vehicle on NPC sheet not working

Release 3.0.2
- Fix [#44](https://github.com/DrOgres/twdu/issues/44)


Release 3.0.1
- Fix: existing items on characters did not have the correct skill nomenclature which broke the rolling [#43](https://github.com/DrOgres/twdu/issues/43)
- Fix: roll dialog was not showing applicable gear and talents for rolls
- Fix: migrated all exisitng items to new schema

Release 3.0.0
- Deprecation Hunt: prepared for v13 NO LONGER BACKARDS COMPATABLE REQUIRES FOUNDRY V12 or higher!
- Secrets for Haven and NPC issue are here.  show and hide to your players or not. [#40](https://github.com/DrOgres/twdu/issues/40)


Release 2.0.6:
- Fix: [#39](https://github.com/DrOgres/twdu/issues/39) Secrets were not showing for GM 
- UI: Migrated to Prose Mirror for editors to enhance functionality of system
- UI: Added size specific actor sheet types to make layout more consistent and usable

Release 2.0.5:
- Fix: changed Animal health to have a range (mix/max) so tokens can use health bars [#36](https://github.com/DrOgres/twdu/issues/36)
- UI: Improved Readability for selected state of skill level on NPC sheet [#35](https://github.com/DrOgres/twdu/issues/35)
- UI: Added Portrait and Archetype information to Survivors on Haven sheet [#37](https://github.com/DrOgres/twdu/issues/37)
- UI: Added roll down for Project details on the Haven Sheet [#38](https://github.com/DrOgres/twdu/issues/38)

Release 2.0.4:
- Fix: made chat card text for roll table results more ledgible 

Release 2.0.3:
- Fix: Journal sheets were capped out and not filling the entire window
- Fix: made header text more ledgible 

Release 2.0.2:
- Fix: Haven and Challenge sheets failed to open when an Actor in their list of survivors is missing or has had it's ID change.  Currently removes the missing Actor ID 
- cleaned up templates and log output

Release 2.0.1:
- Fix: buttons to change threat level were being selfish with focus.  this fixes issue [#33](https://github.com/DrOgres/twdu/issues/33)
- added localization to tool tips for threat level buttons

Release 2.0.0:
NOTE: This is a major release to make this system v12 compatable. BACKUP YOUR DATA BEFORE USE.
- v12 Compatibility issue [#32](https://github.com/DrOgres/twdu/issues/32)
- added Challenge sheet as an actor type (Solo players rejoice) issue [#7](https://github.com/DrOgres/twdu/issues/7)

Release 1.2.6:
- Fixed a bug where items would duplicate on character sheets after being transfered to a differnt actor. [#31](https://gitghub.com/DrOgres/twdu/issues/31)

Release 1.2.5: 
- Fixed a bug where Armor was not rollable from an NPC sheet. [#30](https://github.com/DrOgres/twdu/issues/30)

Release 1.2.4:
- Spanish Localization added || Localización en español añadida (Thanks to [NandoNO82]) [#29](https://github.com/DrOgres/twdu/issues/29)

Release 1.2.3:
- Fixed a bug where the critical injury penalty was not being treated as a number when calculating it's impact on a roll [#28](https://github.com/DrOgres/twdu/issues/28)

Release 1.2.2:
- Fixed bug the handlebars parsing changed the way it handled booleans breaking the skill boxes on the character sheet. [#26](https://github.com/DrOgres/twdu/issues/26)

Release 1.2.1:
- Changed default for Max Stress to 10 [#25](https://github.com/DrOgres/twdu/issues/25)
- Max Stress now increases when it is over the current max stress, this should make for more useful status bars on tokens, that reflect use during play.
- Migrate actors to new stress system
- Changed verbage on equip/store items to be more clear

Release: 1.2.0
- Added ability to assign PC to Haven which will show on the character sheet and Haven sheet. [#18](https://github.com/DrOgres/twdu/issues/18)
- Added drag and drop items  between all actors. [#16](https://github.com/DrOgres/twdu/issues/16) and [#13](https://github.com/DrOgres/twdu/issues/13)


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

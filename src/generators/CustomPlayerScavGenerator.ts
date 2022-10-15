import {inject, injectable} from "tsyringe";
import {BotGenerator} from "@spt-aki/generators/BotGenerator";
import {SaveServer} from "@spt-aki/servers/SaveServer";
import {JsonUtil} from "@spt-aki/utils/JsonUtil";
import {DatabaseServer} from "@spt-aki/servers/DatabaseServer";
import {FenceService} from "@spt-aki/services/FenceService";
import {ProfileHelper} from "@spt-aki/helpers/ProfileHelper";
import {PlayerScavGenerator} from "@spt-aki/generators/PlayerScavGenerator";
import {ILogger} from "@spt-aki/models/spt/utils/ILogger";
import {BotLootCacheService} from "@spt-aki/services/BotLootCacheService";
import {BotHelper} from "@spt-aki/helpers/BotHelper";
import {ConfigServer} from "@spt-aki/servers/ConfigServer";
import {IPmcData} from "@spt-aki/models/eft/common/IPmcData";
import {IBotType} from "@spt-aki/models/eft/common/tables/IBotType";
import {Settings} from "@spt-aki/models/eft/common/tables/IBotBase";
import {adjustPlayerScavKarmaSettingsWithKarmaSpecificUserSettings} from "../utils";
import {KarmaLevel} from "@spt-aki/models/spt/config/IPlayerScavConfig";

@injectable()
export class CustomPlayerScavGenerator extends PlayerScavGenerator {

    constructor(
        @inject("WinstonLogger") logger: ILogger,
        @inject("DatabaseServer") databaseServer: DatabaseServer,
        @inject("SaveServer") saveServer: SaveServer,
        @inject("ProfileHelper") profileHelper: ProfileHelper,
        @inject("BotHelper") botHelper: BotHelper,
        @inject("JsonUtil") jsonUtil: JsonUtil,
        @inject("FenceService") fenceService: FenceService,
        @inject("BotLootCacheService") botLootCacheService: BotLootCacheService,
        @inject("BotGenerator") botGenerator: BotGenerator,
        @inject("ConfigServer") configServer: ConfigServer
    ) {
        super(
            logger,
            databaseServer,
            saveServer,
            profileHelper,
            botHelper,
            jsonUtil,
            fenceService,
            botLootCacheService,
            botGenerator,
            configServer
        );
    }

    override generate(sessionID: string): IPmcData {
        const profile = this.saveServer.getProfile(sessionID);
        const pmcData = profile.characters.pmc;
        const existingScavData = profile.characters.scav;

        const scavKarmaLevel = Object.keys(existingScavData).length === 0 ? 0 : this.getScavKarmaLevel(pmcData);

        const playerScavKarmaSettings = this.playerScavConfig.karmaLevel[scavKarmaLevel];
        if (!playerScavKarmaSettings) {
            this.logger.error(`unable to get karma settings for level ${scavKarmaLevel}`);
        }

        // Adjust the default PlayerScavKarmaSettings with the karma specific settings provided by the user.
        adjustPlayerScavKarmaSettingsWithKarmaSpecificUserSettings(scavKarmaLevel, playerScavKarmaSettings)

        this.logger.debug(`generated player scav loadout with karma level ${scavKarmaLevel}`)

        const baseBotNode: IBotType = this.constructBotBaseTemplate(playerScavKarmaSettings.botTypeForLoot);
        this.adjustBotTemplateWithKarmaSpecificSettings(playerScavKarmaSettings, baseBotNode);

        let scavData = this.botGenerator.generatePlayerScav(sessionID, playerScavKarmaSettings.botTypeForLoot.toLowerCase(), "easy", baseBotNode);
        this.botLootCacheService.clearCache();

        scavData._id = pmcData.savage;
        scavData.aid = sessionID;
        scavData.Info.Settings = {} as Settings;
        scavData.TradersInfo = this.jsonUtil.clone(pmcData.TradersInfo);
        scavData.Skills = this.getScavSkills(existingScavData);
        scavData.Stats = this.getScavStats(existingScavData);
        scavData.Info.Level = this.getScavLevel(existingScavData);
        scavData.Info.Experience = this.getScavExperience(existingScavData);

        scavData = this.profileHelper.removeSecureContainer(scavData);

        scavData = this.setScavCooldownTimer(scavData, pmcData);

        this.saveServer.getProfile(sessionID).characters.scav = scavData;

        return scavData;
    }

    protected override adjustBotTemplateWithKarmaSpecificSettings(karmaSettings: KarmaLevel, baseBotNode: IBotType) {
        super.adjustBotTemplateWithKarmaSpecificSettings(karmaSettings, baseBotNode);

        // Adjust BotTemplate with whitelisted equipment from the karma specific user settings.
        for (const equipmentType in karmaSettings.equipmentWhitelist) {
            baseBotNode.inventory.equipment[equipmentType] = Object.assign(
                {},
                baseBotNode.inventory.equipment[equipmentType],
                karmaSettings.equipmentWhitelist[equipmentType]
            );
        }

        //Adjust BodyParts health with karma specific user settings.
        for (const bodyPart in karmaSettings.health) {
            baseBotNode.health.BodyParts[0][bodyPart] = {min: karmaSettings.health[bodyPart], max: karmaSettings.health[bodyPart]};
        }
    }
}

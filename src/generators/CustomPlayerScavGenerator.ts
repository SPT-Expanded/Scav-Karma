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

}

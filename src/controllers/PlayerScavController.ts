import {DependencyContainer} from "tsyringe";
import {IPmcData, Settings, Skills, Stats} from "@spt-aki/models/eft/common/IPmcData";
import {ProfileHelper} from "@spt-aki/helpers/ProfileHelper";
import {IGenerateBotsRequestData} from "@spt-aki/models/eft/bot/IGenerateBotsRequestData";
import {BotGenerator} from "@spt-aki/generators/BotGenerator";
import {SaveServer} from "@spt-aki/servers/SaveServer";
import {JsonUtil} from "@spt-aki/utils/JsonUtil";
import {ItemHelper} from "@spt-aki/helpers/ItemHelper";
import {DatabaseServer} from "@spt-aki/servers/DatabaseServer";
import {FenceService} from "@spt-aki/services/FenceService";

export class PlayerScavController {
    private saveServer: SaveServer;
    private databaseServer: DatabaseServer;
    private itemHelper: ItemHelper;
    private fenceService: FenceService;
    private botGenerator: BotGenerator;
    private profileHelper: ProfileHelper;
    private jsonUtil: JsonUtil;

    constructor(container: DependencyContainer) {
        this.saveServer = container.resolve("SaveServer");
        this.databaseServer = container.resolve("DatabaseServer");
        this.itemHelper = container.resolve("ItemHelper");
        this.fenceService = container.resolve("FenceService");
        this.botGenerator = container.resolve("BotGenerator");
        this.profileHelper = container.resolve("ProfileHelper");
        this.jsonUtil = container.resolve("JsonUtil");
    }

    generatePlayerScav(sessionID: string): IPmcData {
        const pmcData = this.profileHelper.getPmcProfile(sessionID);
        const scavKarma = this.getScavKarma(pmcData);

        const settings: IGenerateBotsRequestData = {
            conditions: [
                {
                    Role: "assault",
                    Limit: 1,
                    Difficulty: "normal"
                }
            ]
        }
        let scavData = <IPmcData><unknown>this.botGenerator.generate(settings, true)[0];

        scavData._id = pmcData.savage;
        scavData.aid = sessionID;
        scavData.Info.Settings = {} as Settings;
        scavData.TradersInfo = this.jsonUtil.clone(pmcData.TradersInfo);
        scavData.Skills = this.getScavSkills(sessionID);
        scavData.Stats = this.getScavStats(sessionID);
        scavData.Info.Level = this.getScavLevel(sessionID);
        scavData.Info.Experience = this.getScavExperience(sessionID);

        scavData = this.removeSecureContainer(scavData);
        scavData = this.setScavCooldownTimer(scavData, pmcData);

        this.saveServer.getProfile(sessionID).characters.scav = scavData;
        return scavData;
    }

    getScavKarma(pmcData: IPmcData): number | string {
        const fence: TraderInfo = pmcData.TradersInfo["579dc571d53a0658a154fbec"];
        if (!fence.unlocked) {
            return 1
        }
        return fence.standing < 0 ? "negative" : Math.round(fence.standing) || 1;
    }

    modifyBotNode(node: IBotType, scavKarma: number | string): void {
        const config = require("../../config/config.json");
        const overwriteConfig = require(`../../config/levels/${scavKarma}.json`);

        if (config.overwriteItemGeneration) {
            this.overwriteItemGeneration(node, overwriteConfig);
        }
        if (config.overwriteEquipmentChances) {
            this.overwriteEquipmentChances(node, overwriteConfig);
        }
        if (config.overwriteModsChances) {
            this.overwriteModsChances(node, overwriteConfig);
        }
        if (config.addEquipment) {
            this.addEquipment(node, overwriteConfig);
        }
        if (config.removeEquipment) {
            this.removeEquipment(node, overwriteConfig);
        }
        if (config.overwriteHealth) {
            this.overwriteHealth(node, overwriteConfig);
        }
    }

    overwriteItemGeneration(node: IBotType, overwriteConfig) {
        for (const item in overwriteConfig.itemGeneration) {
            node.generation.items[item] = overwriteConfig.itemGeneration[item];
        }
    }

    overwriteEquipmentChances(node: IBotType, overwriteConfig) {
        node.chances.equipment = overwriteConfig.equipmentChances;
    }

    overwriteModsChances(node: IBotType, overwriteConfig) {
        node.chances.mods = overwriteConfig.modsChances;
    }

    addEquipment(node: IBotType, overwriteConfig) {
        const equipment = overwriteConfig.addEquipment;
        for (const slot in equipment) {
            for (const item in equipment[slot]) {
                node.inventory.equipment[slot][item] = equipment[slot][item];
            }
        }
    }

    removeEquipment(node: IBotType, overwriteConfig) {
        const equipment = overwriteConfig.removeEquipment;
        for (const slot in equipment) {
            for (const item in equipment[slot]) {
                delete node.inventory.equipment[slot][equipment[slot][item]];
            }
        }
    }

    overwriteHealth(node: IBotType, overwriteConfig) {
        for (const preset of node.health.BodyParts) {
            for (const bodyPart in preset) {
                preset[bodyPart].max *= overwriteConfig.overwriteHealth[bodyPart];
                preset[bodyPart].min *= overwriteConfig.overwriteHealth[bodyPart];
            }
        }
    }

    removeSecureContainer(profile: IPmcData): IPmcData {
        const items = profile.Inventory.items;

        for (const item of items) {
            if (item.slotId === "SecuredContainer") {
                const toRemove = this.itemHelper.findAndReturnChildrenByItems(items, item._id);
                let n = items.length;

                while (n-- > 0) {
                    if (toRemove.includes(items[n]._id)) {
                        items.splice(n, 1);
                    }
                }
                break;
            }
        }

        profile.Inventory.items = items;
        return profile;
    }

    setScavCooldownTimer(profile: IPmcData, pmcData: IPmcData): IPmcData {
        let scavLockDuration = this.databaseServer.getTables().globals.config.SavagePlayCooldown;
        let modifier = 1;

        for (const bonus of pmcData.Bonuses) {
            if (bonus.type === "ScavCooldownTimer") {
                modifier += bonus.value / 100;
            }
        }

        const fenceInfo = this.fenceService.getFenceInfo(pmcData);
        modifier *= fenceInfo.SavageCooldownModifier;

        scavLockDuration *= modifier;
        profile.Info.SavageLockTime = (Date.now() / 1000) + scavLockDuration;
        return profile;
    }

    getScavSkills(sessionID: string): Skills {
        const profile = this.saveServer.getProfile(sessionID);
        if (profile.characters.scav.Skills) {
            return profile.characters.scav.Skills;
        }

        return {
            Common: [],
            Mastering: [],
            Bonuses: undefined,
            Points: 0
        };
    }

    getScavStats(sessionID: string): Stats {
        const profile = this.saveServer.getProfile(sessionID)
        if (profile && profile.characters.scav.Stats) {
            return profile.characters.scav.Stats;
        }

        return this.profileHelper.getDefaultCounters();
    }

    getScavLevel(sessionID: string): number {
        const profile = this.saveServer.getProfile(sessionID);
        if (!profile.characters.scav.Info || !profile.characters.scav.Info.Level) {
            return 1;
        }

        return profile.characters.scav.Info.Level;
    }

    getScavExperience(sessionID: string): number {
        const profile = this.saveServer.getProfile(sessionID);
        if (!profile.characters.scav.Info || !profile.characters.scav.Info.Experience) {
            return 0;
        }

        return profile.characters.scav.Info.Experience;
    }
}

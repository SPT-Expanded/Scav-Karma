import {DatabaseServer} from "@spt-aki/servers/DatabaseServer";
import {Health as PmcHealth} from "@spt-aki/models/eft/common/IPmcData";
import {JsonUtil} from "@spt-aki/utils/JsonUtil";
import {DependencyContainer} from "tsyringe";
import {Common, Health, IBotType, Inventory, Mastering, Skills} from "@spt-aki/models/eft/common/tables/IBotType";
import {IBotBase} from "@spt-aki/models/eft/common/tables/IBotBase";
import {RandomUtil} from "@spt-aki/utils/RandomUtil";
import {GameEventHelper} from "@spt-aki/helpers/GameEventHelper";
import {BotInventoryGenerator} from "@spt-aki/generators/BotInventoryGenerator";
import {HashUtil} from "@spt-aki/utils/HashUtil";
import {WinstonLogger} from "@spt-aki/utils/Logger";

export class ScavDataGenerator {
    private databaseServer: DatabaseServer;
    private jsonUtil: JsonUtil;
    private randomUtil: RandomUtil;
    private gameEventHelper: GameEventHelper;
    private botInventoryGenerator: BotInventoryGenerator;
    private hashUtil: HashUtil;
    private logger: WinstonLogger;

    constructor(container: DependencyContainer) {
        this.databaseServer = container.resolve("DatabaseServer");
        this.jsonUtil = container.resolve("JsonUtil");
        this.randomUtil = container.resolve("RandomUtil");
        this.gameEventHelper = container.resolve("GameEventHelper");
        this.botInventoryGenerator = container.resolve("BotInventoryGenerator");
        this.hashUtil = container.resolve("HashUtil");
        this.logger = container.resolve("WinstonLogger");
    }

    public generateScavData() {
        let scavData: IBotBase = this.jsonUtil.clone(this.databaseServer.getTables().bots.base);
        let node: IBotType = this.databaseServer.getTables().bots.types.assault;

        scavData.Info.Settings.BotDifficulty = "normal";
        scavData.Info.Side = "Savage";
        scavData.Info.Nickname = `${this.randomUtil.getArrayValue(node.firstName)} ${this.randomUtil.getArrayValue(node.lastName) || ""}`;

        const levelResult = this.generateRandomLevel(node.experience.level.min, node.experience.level.max);
        scavData.Info.Experience = levelResult.exp;
        scavData.Info.Level = levelResult.level;

        scavData.Info.Settings.Experience = this.randomUtil.getInt(node.experience.reward.min, node.experience.reward.max);
        scavData.Info.Settings.StandingForKill = node.experience.standingForKill;
        scavData.Info.Voice = this.randomUtil.getArrayValue(node.appearance.voice);
        scavData.Health = this.generateHealth(node.health);
        scavData.Skills = this.generateSkills(node.skills);
        scavData.Customization.Head = this.randomUtil.getArrayValue(node.appearance.head);
        scavData.Customization.Body = this.randomUtil.getArrayValue(node.appearance.body);
        scavData.Customization.Feet = this.randomUtil.getArrayValue(node.appearance.feet);
        scavData.Customization.Hands = this.randomUtil.getArrayValue(node.appearance.hands);

        const skipChristmasItems = !this.gameEventHelper.christmasEventEnabled();
        if (skipChristmasItems) {
            this.removeChristmasItemsFromBotInventory(node.inventory);
        }

        scavData.Inventory = this.botInventoryGenerator.generateInventory(node.inventory, node.chances, node.generation, "Savage", false);

        scavData = this.generateID(scavData)
        this.logger.warning(scavData._id);
        scavData = this.generateInventoryID(scavData);

        return scavData;
    }

    protected generateRandomLevel(min: number, max: number) {
        const expTable = this.databaseServer.getTables().globals.config.exp.level.exp_table;
        const maxLevel = Math.min(max, expTable.length);

        let exp = 0;
        const level = this.randomUtil.getInt(min, maxLevel);

        for (let i = 0; i < level; i++) {
            exp += expTable[i].exp;
        }

        if (level < expTable.length - 1) {
            exp += this.randomUtil.getInt(0, expTable[level].exp - 1);
        }

        return {level, exp};
    }

    protected generateHealth(healthObj: Health): PmcHealth {
        const bodyParts = healthObj.BodyParts[0];

        return {
            Hydration: {
                Current: this.randomUtil.getInt(healthObj.Hydration.min, healthObj.Hydration.max),
                Maximum: healthObj.Hydration.max
            },
            Energy: {
                Current: this.randomUtil.getInt(healthObj.Energy.min, healthObj.Energy.max),
                Maximum: healthObj.Energy.max
            },
            Temperature: {
                Current: this.randomUtil.getInt(healthObj.Temperature.min, healthObj.Temperature.max),
                Maximum: healthObj.Temperature.max
            },
            BodyParts: {
                Head: {
                    Health: {
                        Current: this.randomUtil.getInt(bodyParts.Head.min, bodyParts.Head.max),
                        Maximum: bodyParts.Head.max
                    }
                },
                Chest: {
                    Health: {
                        Current: this.randomUtil.getInt(bodyParts.Chest.min, bodyParts.Chest.max),
                        Maximum: bodyParts.Chest.max
                    }
                },
                Stomach: {
                    Health: {
                        Current: this.randomUtil.getInt(bodyParts.Stomach.min, bodyParts.Stomach.max),
                        Maximum: bodyParts.Stomach.max
                    }
                },
                LeftArm: {
                    Health: {
                        Current: this.randomUtil.getInt(bodyParts.LeftArm.min, bodyParts.LeftArm.max),
                        Maximum: bodyParts.LeftArm.max
                    }
                },
                RightArm: {
                    Health: {
                        Current: this.randomUtil.getInt(bodyParts.RightArm.min, bodyParts.RightArm.max),
                        Maximum: bodyParts.RightArm.max
                    }
                },
                LeftLeg: {
                    Health: {
                        Current: this.randomUtil.getInt(bodyParts.LeftLeg.min, bodyParts.LeftLeg.max),
                        Maximum: bodyParts.LeftLeg.max
                    }
                },
                RightLeg: {
                    Health: {
                        Current: this.randomUtil.getInt(bodyParts.RightLeg.min, bodyParts.RightLeg.max),
                        Maximum: bodyParts.RightLeg.max
                    }
                }
            },
            UpdateTime: 0
        };
    }

    protected generateSkills(skillsObj: Skills): Skills {
        const skills = [];
        const masteries = [];

        if (skillsObj.Common) {
            for (const skillId in skillsObj.Common) {
                const skill: Common = {
                    Id: skillId,
                    Progress: this.randomUtil.getInt(skillsObj.Common[skillId].min, skillsObj.Common[skillId].max)
                }

                skills.push(skill);
            }
        }

        if (skillsObj.Mastering) {
            for (const masteringId in skillsObj.Mastering) {
                const mastery: Mastering = {
                    Id: masteringId,
                    Progress: this.randomUtil.getInt(skillsObj.Mastering[masteringId].min, skillsObj.Mastering[masteringId].max)
                };
                masteries.push(mastery);
            }
        }

        return {
            Common: skills,
            Mastering: masteries,
            Points: 0
        };
    }

    protected removeChristmasItemsFromBotInventory(nodeInventory: Inventory): void {
        const christmasItems = this.gameEventHelper.christmasEventItems;
        const locationsToFilter = ["FaceCover", "Headwear", "Backpack", "Pockets", "TacticalVest"];
        for (const equipmentItem in nodeInventory.equipment) {
            if (!locationsToFilter.includes(equipmentItem)) {
                continue;
            }

            const equipment: Record<string, number> = nodeInventory.equipment[equipmentItem];
            nodeInventory.equipment[equipmentItem] = Object.fromEntries(Object.entries(equipment).filter(([index, val]) => !christmasItems.includes(index)));
        }

        for (const itemContainer in nodeInventory.items) {
            if (!locationsToFilter.includes(itemContainer)) {
                continue;
            }

            const loot: string[] = nodeInventory.items[itemContainer];
            nodeInventory.items[itemContainer] = loot.filter(x => !christmasItems.includes(x));
        }
    }

    protected generateID(bot: IBotBase): IBotBase {
        const botId = this.hashUtil.generate();

        bot._id = botId;
        bot.aid = botId;
        return bot;
    }

    protected generateInventoryID(profile: IBotBase): IBotBase {
        const defaultInventory = "55d7217a4bdc2d86028b456d";
        const itemsByParentHash = {};
        const inventoryItemHash = {};
        let inventoryId = "";

        for (const item of profile.Inventory.items) {
            inventoryItemHash[item._id] = item;

            if (item._tpl === defaultInventory) {
                inventoryId = item._id;
                continue;
            }

            if (!("parentId" in item)) {
                continue;
            }

            if (!(item.parentId in itemsByParentHash)) {
                itemsByParentHash[item.parentId] = [];
            }

            itemsByParentHash[item.parentId].push(item);
        }

        const newInventoryId = this.hashUtil.generate();
        inventoryItemHash[inventoryId]._id = newInventoryId;
        profile.Inventory.equipment = newInventoryId;

        if (inventoryId in itemsByParentHash) {
            for (const item of itemsByParentHash[inventoryId]) {
                item.parentId = newInventoryId;
            }
        }

        return profile;
    }

}

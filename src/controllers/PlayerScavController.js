"use strict";

class PlayerScavController {
    static generateScav(sessionId) {
        const pmcData = ProfileController.getPmcProfile(sessionId);
        let bot = JsonUtil.clone(DatabaseServer.tables.bots.base);
        let node = JsonUtil.clone(DatabaseServer.tables.bots.types.assault);

        const scavKarma = pmcData.TradersInfo["579dc571d53a0658a154fbec"].standing;
        node = PlayerScavController.modifyBotNode(node, scavKarma)

        bot.Info.Settings.BotDifficulty = "normal";
        bot.Info.Settings.Role = "assault";
        bot.Info.Side = "Savage";
        bot.Info.Nickname = `${RandomUtil.getArrayValue(node.firstName)} ${RandomUtil.getArrayValue(node.lastName) || ""}`;

        if (BotConfig.showTypeInNickname) {
            bot.Info.Nickname += ` ${bot.Info.Settings.Role}`;
        };

        bot.Info.Settings.StandingForKill = node.experience.standingForKill;
        bot.Info.Voice = RandomUtil.getArrayValue(node.appearance.voice);
        bot.Health = BotController.generateHealth(node.health, bot.Info.Side === "Savage");
        bot.Skills = BotController.generateSkills(node.skills);
        bot.Customization.Head = RandomUtil.getArrayValue(node.appearance.head);
        bot.Customization.Body = RandomUtil.getArrayValue(node.appearance.body);
        bot.Customization.Feet = RandomUtil.getArrayValue(node.appearance.feet);
        bot.Customization.Hands = RandomUtil.getArrayValue(node.appearance.hands);
        bot.Inventory = BotGenerator.generateInventory(node.inventory, node.chances, node.generation);
        Logger.warning(bot.Inventory);

        bot = InventoryHelper.generateInventoryID(bot);

        bot._id = pmcData.savage;
        bot.aid = sessionId;
        bot.Info.Settings = {};
        bot.TradersInfo = JsonUtil.clone(pmcData.TradersInfo);
        bot.Skills = ProfileController.getScavSkills(sessionId);
        bot.Stats = ProfileController.getScavStats(sessionId);
        bot.Info.Level = ProfileController.getScavLevel(sessionId);
        bot.Info.Experience = ProfileController.getScavExperience(sessionId);

        bot = InventoryHelper.removeSecureContainer(bot);
        bot = ProfileController.setScavCooldownTimer(bot, pmcData);

        ProfileController.setScavProfile(sessionId, bot);
        return bot;
    };

    static modifyBotNode(node, scavKarma) {
        const config = require("../../config/config.json");

        scavKarma = scavKarma < 0 ? "negative" : Math.round(scavKarma) || 1; 
        const overwriteConfig = require(`../../config/levels/${scavKarma}.json`);

        if (config.changeItemGeneration) {
            node.generation = overwriteConfig.generation;
        } else if (config.changeChances.equipment) {
            node.chances.equipment = overwriteConfig.chances.equipment;
        } else if (config.changeChances.mods) {
            node.chances.mods = overwriteConfig.chances.mods;
        };
        return node;
    };
};

module.exports = PlayerScavController;
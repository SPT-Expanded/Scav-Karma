import {ItemLimits, KarmaLevel, Modifiers} from "@spt-aki/models/spt/config/IPlayerScavConfig";
import config = require("../config/config.json");
import fs from "fs";

export function adjustPlayerScavKarmaSettingsWithKarmaSpecificUserSettings(scavKarmaLevel: number, karmaLevel: KarmaLevel) {
    if (!fs.existsSync(`../config/levels/${scavKarmaLevel}.json`)) return;
    const settings: KarmaLevel = require(`../config/levels/${scavKarmaLevel}.json`);

    if (config.adjustBotTypeForLoot) adjustBotTypeForLoot(settings.botTypeForLoot, karmaLevel);
    if (config.enableBlacklist) adjustEquipmentBlacklist(settings.equipmentBlacklist, karmaLevel);
    if (config.enableWhitelist) adjustEquipmentWhitelist(settings.equipmentWhitelist, karmaLevel);
    if (config.adjustModifiers) adjustModifiers(settings.modifiers, karmaLevel);
    if (config.adjustItemLimits) adjustItemLimits(settings.itemLimits, karmaLevel);
    if (config.adjustHealth) adjustHealth(settings.health, karmaLevel);
}

function adjustBotTypeForLoot(botTypeForLoot: string, karmaLevel: KarmaLevel) {
    if (!botTypeForLoot) {
        return;
    }

    karmaLevel.botTypeForLoot = botTypeForLoot;
}

function adjustEquipmentBlacklist(equipmentBlacklist: Record<string, string[]>, karmaLevel: KarmaLevel) {
    if (!equipmentBlacklist) {
        return;
    }

    for (const equipmentType in equipmentBlacklist) {
        if (!karmaLevel.equipmentBlacklist[equipmentType]) {
            karmaLevel.equipmentBlacklist[equipmentType] = equipmentBlacklist[equipmentType];
            continue;
        }
        karmaLevel.equipmentBlacklist[equipmentType] = [
            ...karmaLevel.equipmentBlacklist[equipmentType],
            ...equipmentBlacklist[equipmentType],
        ];

    }
}

function adjustEquipmentWhitelist(equipmentWhitelist: Record<string, string[]>, karmaLevel: KarmaLevel) {
    if (!equipmentWhitelist) {
        return;
    }

    karmaLevel.equipmentWhitelist = {};

    for (const equipmentType in equipmentWhitelist) {
        karmaLevel.equipmentWhitelist[equipmentType] = equipmentWhitelist[equipmentType];
    }
}

function adjustModifiers(modifiers: Modifiers, karmaLevel: KarmaLevel) {
    if (!modifiers) {
        return;
    }

    if (modifiers.equipment) {
        adjustEquipment();
    }

    if (modifiers.mod) {
        adjustMod();
    }

    function adjustEquipment() {
        for (const equipmentType in modifiers.equipment) {
            karmaLevel.modifiers.equipment[equipmentType] = modifiers.equipment[equipmentType];
        }
    }

    function adjustMod() {
        for (const modType in modifiers.mod) {
            karmaLevel.modifiers.mod[modType] = modifiers.mod[modType];
        }
    }
}

function adjustItemLimits(itemLimits: ItemLimits, karmaLevel: KarmaLevel) {
    if (!itemLimits) {
        return;
    }

    for (const itemType in itemLimits) {
        for (const setting in itemLimits[itemType]) {
            karmaLevel.itemLimits[itemType][setting] = itemLimits[itemType][setting];
        }
    }
}

function adjustHealth(health: Record<string, number>, karmaLevel: KarmaLevel) {
    if (!health) {
        return;
    }

    karmaLevel.health = {};

    for (const bodyPart in health) {
        karmaLevel.health[bodyPart] = health[bodyPart];
    }
}
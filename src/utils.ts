import {ItemLimits, KarmaLevel, Modifiers} from "@spt-aki/models/spt/config/IPlayerScavConfig";

export function adjustPlayerScavKarmaSettingsWithKarmaSpecificUserSettings(scavKarmaLevel: number, karmaLevel: KarmaLevel) {
    const settings: KarmaLevel = require(`../config/levels/${scavKarmaLevel}.json`);

    adjustBotTypeForLoot(settings.botTypeForLoot, karmaLevel);
    adjustEquipmentBlacklist(settings.equipmentBlacklist, karmaLevel);
    adjustEquipmentWhitelist(settings.equipmentWhitelist, karmaLevel);
    adjustModifiers(settings.modifiers, karmaLevel);
    adjustItemLimits(settings.itemLimits, karmaLevel);
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


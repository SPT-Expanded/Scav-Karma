import {DependencyContainer} from "tsyringe";
import {IMod} from "@spt-aki/models/external/mod";
import {ProfileController} from "@spt-aki/controllers/ProfileController";

class Mod implements IMod {
    private config = require("../config/config.json");

    public load(container: DependencyContainer): void {
        if (!this.config.enableMod) {
            return;
        }
    }

    public delayedLoad(container: DependencyContainer): void {
    }
}

module.exports = {mod: new Mod()}

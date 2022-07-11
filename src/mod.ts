import {DependencyContainer} from "tsyringe";
import {IMod} from "@spt-aki/models/external/mod";
import {ProfileController} from "@spt-aki/controllers/ProfileController";

import {PlayerScavController} from "./controllers/PlayerScavController";

class Mod implements IMod {
    private config = require("../config/config.json");

    public load(container: DependencyContainer): void {
        if (!this.config.enableMod) {
            return;
        }
        container.afterResolution("ProfileController", (_t, result: ProfileController) => {
            result.generatePlayerScav = (sessionID: string) => {
                return new PlayerScavController(container).generatePlayerScav(sessionID);
            }
        }, {frequency: "Always"});
    }

    public delayedLoad(container: DependencyContainer): void {
    }
}

module.exports = {mod: new Mod()}

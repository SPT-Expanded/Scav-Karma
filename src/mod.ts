import {DependencyContainer} from "tsyringe";
import {IMod} from "@spt-aki/models/external/mod";
import {StaticRouterModService} from "@spt-aki/services/mod/staticRouter/StaticRouterModService";
import {HttpResponseUtil} from "@spt-aki/utils/HttpResponseUtil";

import {PlayerScavController} from "./controllers/PlayerScavController";

class Mod implements IMod {
    private config = require("../config/config.json");

    public load(container: DependencyContainer): void {
        const staticRouterModService = container.resolve<StaticRouterModService>("StaticRouterModService");
        const httpResponse = container.resolve<HttpResponseUtil>("HttpResponseUtil");

        if (!this.config.enableMod) {
            return;
        }

        staticRouterModService.registerStaticRouter(
            "StaticRouteRegeneratePlayerScav",
            [{
                url: "/client/game/profile/savage/regenerate",
                action: (url, info, sessionID, output) => {
                    return httpResponse.getBody([new PlayerScavController(container).generatePlayerScav(sessionID)]);
                }
            }],
            "aki"
        )
    }

    public delayedLoad(container: DependencyContainer): void {
    }
}

module.exports = {mod: new Mod()}

import {DependencyContainer} from "tsyringe";
import {IPreAkiLoadMod} from "@spt-aki/models/external/IPreAkiLoadMod";
import {StaticRouterModService} from "@spt-aki/services/mod/staticRouter/StaticRouterModService";
import {HttpResponseUtil} from "@spt-aki/utils/HttpResponseUtil";

import {PlayerScavGenerator} from "./generators/PlayerScavGenerator";

class Mod implements IPreAkiLoadMod {
    private config = require("../config/config.json");

    public preAkiLoad(container: DependencyContainer): void {
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
                    return httpResponse.getBody([new PlayerScavGenerator(container).generatePlayerScav(sessionID)]);
                }
            }],
            "aki"
        )
    }
}

module.exports = {mod: new Mod()}

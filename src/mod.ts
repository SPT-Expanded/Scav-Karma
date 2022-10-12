import {DependencyContainer} from "tsyringe";
import {PlayerScavGenerator} from "@spt-aki/generators/PlayerScavGenerator";
import {CustomPlayerScavGenerator} from "./generators/CustomPlayerScavGenerator";
import {IPostAkiLoadMod} from "@spt-aki/models/external/IPostAkiLoadMod";

class Mod implements IPostAkiLoadMod {
    private config = require("../config/config.json");

    postAkiLoad(container: DependencyContainer): void {
        if (!this.config.enable) {
            return;
        }

        container.register<CustomPlayerScavGenerator>("CustomPlayerScavGenerator", CustomPlayerScavGenerator);
        container.register("PlayerScavGenerator", {useToken: "CustomPlayerScavGenerator"});
    }
}

module.exports = {mod: new Mod()}

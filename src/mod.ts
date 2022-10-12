import {DependencyContainer} from "tsyringe";
import {PlayerScavGenerator} from "@spt-aki/generators/PlayerScavGenerator";
import {CustomPlayerScavGenerator} from "./generators/CustomPlayerScavGenerator";
import {IPostAkiLoadMod} from "@spt-aki/models/external/IPostAkiLoadMod";

class Mod implements IPostAkiLoadMod {
    public postAkiLoad(container: DependencyContainer): void {
        container.register<CustomPlayerScavGenerator>("CustomPlayerScavGenerator", CustomPlayerScavGenerator);
        container.register("PlayerScavGenerator", {useToken: "CustomPlayerScavGenerator"})
    }
}

module.exports = {mod: new Mod()}

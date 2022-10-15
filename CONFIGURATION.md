## Configuration
To add a configuration for a Scav Karma level create a file under `config/levels` and name it `-7` through `6` with
`.json` at the end. Example: `0.json` for Scav Karma level `0`-`0.99` and `1.json` for Scav Karma level `1`-`1.99`.

The configuration options can be found in the `template.json` file. You only have to add the options in the file which
you want to adjust. A minimal example config can be found in `example.json`.

###### botTypeForLoot
This option defines the base template for the Player Scav, it defines the possible loot, weapons, mods, etc. the bot
can spawn with. Possible values are all filenames in `Aki_Data/Server/database/bots/types`.

###### equipmentBlacklist
If you want to exclude equipment from the Player Scav generation add the _id_ of the equipment in the respective
category. _IDs_ of items can be found in the URL of the equipment piece on https://tarkov-database.com/.

###### equipmentWhitelist
It does the opposite of `equipmentBlacklist`. To include an equipment piece in the generation add the _id_ and the
probability of the equipment spawning in the respective category. An example can be found in `example.json`.

###### modifiers
The `equipment` modifiers influence the spawn rate of the equipment category the value after the category can range from
`0` (not spawning) to `100` (spawns every time).

The `mod` modifiers influence the spawn rate of weapon attachments like scopes, etc. The value after the mod name can
also range from `0` to `100`.

###### itemLimits
The `min` is the guaranteed amount of the item type to spawn everytime and `max` is the maximum amount.

###### health
The starting health can be set to any positive number.
/* oxlint-disable import/first */
function mergeIntoGlobal(object) {
  for (const key in object) {
    if (key === "default") {
      // Skip default exports
      continue;
    }
    const value = object[key];
    const existingValue = window[key];
    if (existingValue !== undefined) {
      throw new Error(`Property ${key} already exists in global context`);
    }

    window[key] = value;
  }
}

import * as Utils from "./utils/index.js";
mergeIntoGlobal(Utils);

import * as GameMechanics from "./core/game-mechanics/index.js";
mergeIntoGlobal(GameMechanics);

import * as GameDB from "./core/secret-formula/index.js";
mergeIntoGlobal(GameDB);

// This is a list of legacy stuff, please don't add
// any more globals to the component files

import * as AutomatorBlockEditor from "@/components/tabs/automator/AutomatorBlockEditor.vue";
mergeIntoGlobal(AutomatorBlockEditor);

import * as AutomatorBlocks from "@/components/tabs/automator/AutomatorBlocks.vue";
mergeIntoGlobal(AutomatorBlocks);

import * as AutomatorTextEditor from "@/components/tabs/automator/AutomatorTextEditor.vue";
mergeIntoGlobal(AutomatorTextEditor);

import * as PerksTab from "@/components/tabs/perks/PerksTab.vue";
mergeIntoGlobal(PerksTab);

// End of legacy stuff

import * as core from "./core/globals.js";
mergeIntoGlobal(core);

import * as game from "./game.js";
mergeIntoGlobal(game);

// oxlint-disable no-unassigned-import
import "drag-drop-touch";
import "./shims.js";
import "./merge-globals.js";
import { browserCheck, init } from "./game.js";
import { DEV } from "./env.js";
import { watchLatestCommit } from "./commit-watcher.js";

if (browserCheck()) init();
if (DEV) watchLatestCommit();

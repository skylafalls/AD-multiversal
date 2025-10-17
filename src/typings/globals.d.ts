import type D from "./break_eternity";
import type { GameCache as GC } from "#utils/cache.js";

declare global {
  class Decimal extends D {}
  const GameCache: typeof GC;
}

import type D from "./break_eternity";
import type { GameCache as GC } from "#utils/cache.js";

declare namespace global {
  class Decimal extends D {}
  class TimeSpan extends TimeSpan {}
  const GameCache: typeof GC;
}

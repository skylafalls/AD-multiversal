import type Decimal from "break_eternity.js";

export abstract class Notation {
  public abstract get name(): string;
  public abstract get isSlog(): boolean;
  public abstract formatLDecimal(value: Decimal, places: number): string;
}

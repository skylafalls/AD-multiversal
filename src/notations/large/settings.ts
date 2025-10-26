import Decimal from "break_eternity.js";

// eslint-disable-next-line @typescript-eslint/naming-convention
export const BigSettings = {
  isInfinite: (decimal: Decimal): boolean => decimal.gte(Decimal.tetrate(10, 1e16)),
  numCommas: 100000,
  exponentDefaultPlaces: 3
};

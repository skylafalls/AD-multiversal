import Decimal from "break_eternity.js";

export const BigSettings = {
  isInfinite: (decimal: Decimal): boolean => decimal.gte(Decimal.tetrate(10, 1e16)),
  numCommas: 100000,
  exponentDefaultPlaces: 3,
};

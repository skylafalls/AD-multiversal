import { END_STATE_MARKERS } from "#utils/constants.js";
import { isDecimal } from "../../../utils/type-check";

export const GameEnd = {
  get endState() {
    if (this.removeAdditionalEnd || player.bypassEnd) return this.additionalEnd;
    return Math.max(player.celestials.pelle.records.totalAntimatter.add(1).log10().add(1).log10().sub(8.7)
      .div(Math.log10(9e15) - 8.7).min(1).toNumber() + this.additionalEnd, 0);
  },

  _additionalEnd: 0,
  get additionalEnd() {
    return (player.isGameEnd || this.removeAdditionalEnd) ? this._additionalEnd : 0;
  },
  set additionalEnd(x) {
    this._additionalEnd = (player.isGameEnd || this.removeAdditionalEnd) ? x : 0;
  },

  removeAdditionalEnd: false,

  creditsClosed: false,
  creditsEverClosed: false,

  gameLoop(diffr) {
    const diff = isDecimal(diffr) ? diffr.toNumber() : diffr;
    if (this.removeAdditionalEnd) {
      this.additionalEnd -= Math.min(diff / 200, 0.5);
      if (this.additionalEnd < 4) {
        this.additionalEnd = 0;
        this.removeAdditionalEnd = false;
      }
    }
    if (!this.removeAdditionalEnd && this.endState >= END_STATE_MARKERS.GAME_END
      && ui.$viewModel.modal.progressBar === undefined) {
      player.isGameEnd = true;
      this.additionalEnd += Math.min(diff / 1000 / 20, 0.1);
    }
  },
};

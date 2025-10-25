// oxlint-disable max-classes-per-file
import { GAME_EVENT } from "./constants.js";

class GameEvent extends Event {
  constructor(eventType: GAME_EVENT, args: Record<string, unknown>) {
    super(eventType, { ...args });
  }
}

type HandlerTargetMap = Record<GAME_EVENT, {
  fn: (evt: GameEvent) => void
  target: any
}[]>;

class EventHub extends EventTarget {
  _handlerTargetMap: HandlerTargetMap = {
    [GAME_EVENT.GAME_TICK_BEFORE]: [],
    [GAME_EVENT.GAME_TICK_AFTER]: [],
    [GAME_EVENT.REPLICANTI_TICK_BEFORE]: [],
    [GAME_EVENT.REPLICANTI_TICK_AFTER]: [],
    [GAME_EVENT.DIMBOOST_BEFORE]: [],
    [GAME_EVENT.DIMBOOST_AFTER]: [],
    [GAME_EVENT.GALAXY_RESET_BEFORE]: [],
    [GAME_EVENT.GALAXY_RESET_AFTER]: [],
    [GAME_EVENT.SACRIFICE_RESET_BEFORE]: [],
    [GAME_EVENT.SACRIFICE_RESET_AFTER]: [],
    [GAME_EVENT.BIG_CRUNCH_BEFORE]: [],
    [GAME_EVENT.BIG_CRUNCH_AFTER]: [],
    [GAME_EVENT.ETERNITY_RESET_BEFORE]: [],
    [GAME_EVENT.ETERNITY_RESET_AFTER]: [],
    [GAME_EVENT.REALITY_RESET_BEFORE]: [],
    [GAME_EVENT.REALITY_RESET_AFTER]: [],
    [GAME_EVENT.SINGULARITY_RESET_BEFORE]: [],
    [GAME_EVENT.SINGULARITY_RESET_AFTER]: [],
    [GAME_EVENT.ARMAGEDDON_BEFORE]: [],
    [GAME_EVENT.ARMAGEDDON_AFTER]: [],
    [GAME_EVENT.GLYPHS_EQUIPPED_CHANGED]: [],
    [GAME_EVENT.GLYPHS_CHANGED]: [],
    [GAME_EVENT.GLYPH_SACRIFICED]: [],
    [GAME_EVENT.GLYPH_SET_SAVE_CHANGE]: [],
    [GAME_EVENT.GLYPH_VISUAL_CHANGE]: [],
    [GAME_EVENT.BREAK_INFINITY]: [],
    [GAME_EVENT.FIX_INFINITY]: [],
    [GAME_EVENT.INFINITY_DIMENSION_UNLOCKED]: [],
    [GAME_EVENT.INFINITY_CHALLENGE_COMPLETED]: [],
    [GAME_EVENT.INFINITY_UPGRADE_BOUGHT]: [],
    [GAME_EVENT.INFINITY_UPGRADE_CHARGED]: [],
    [GAME_EVENT.INFINITY_UPGRADES_DISCHARGED]: [],
    [GAME_EVENT.ACHIEVEMENT_UNLOCKED]: [],
    [GAME_EVENT.CHALLENGE_FAILED]: [],
    [GAME_EVENT.REALITY_UPGRADE_BOUGHT]: [],
    [GAME_EVENT.REALITY_UPGRADE_TEN_BOUGHT]: [],
    [GAME_EVENT.PERK_BOUGHT]: [],
    [GAME_EVENT.BLACK_HOLE_UNLOCKED]: [],
    [GAME_EVENT.BLACK_HOLE_UPGRADE_BOUGHT]: [],
    [GAME_EVENT.GAME_LOAD]: [],
    [GAME_EVENT.OFFLINE_CURRENCY_GAINED]: [],
    [GAME_EVENT.SAVE_CONVERTED_FROM_PREVIOUS_VERSION]: [],
    [GAME_EVENT.REALITY_FIRST_UNLOCKED]: [],
    [GAME_EVENT.AUTOMATOR_TYPE_CHANGED]: [],
    [GAME_EVENT.AUTOMATOR_SAVE_CHANGED]: [],
    [GAME_EVENT.AUTOMATOR_CONSTANT_CHANGED]: [],
    [GAME_EVENT.PELLE_STRIKE_UNLOCKED]: [],
    [GAME_EVENT.ACHIEVEMENT_EVENT_OTHER]: [],
    [GAME_EVENT.ENTER_PRESSED]: [],
    [GAME_EVENT.ARROW_KEY_PRESSED]: [],
    [GAME_EVENT.UPDATE]: [],
    [GAME_EVENT.TAB_CHANGED]: [],
    [GAME_EVENT.CLOSE_MODAL]: [],
  };

  on(event: GAME_EVENT, fn: (evt: GameEvent) => void, target: any) {
    this.addEventListener(event, fn);
    this._handlerTargetMap[event].push({ fn, target });
  }

  override addEventListener(
    type: GAME_EVENT,
    callback: ((evt: GameEvent) => void) | null,
    options?: AddEventListenerOptions | boolean,
  ): void {
    super.addEventListener(type, callback, options);
  }

  offAll(target: any) {
    for (const event of Object.keys(this._handlerTargetMap)) {
      const removeArray = this._handlerTargetMap[event as GAME_EVENT].filter(handler => handler.target === target);
      for (const handler of removeArray) {
        this.removeEventListener(event, handler.fn);
      }
      this._handlerTargetMap[event as GAME_EVENT] = this._handlerTargetMap[event as GAME_EVENT].filter(handler => handler.target !== target);
    }
  }

  dispatch(event: GAME_EVENT, args: Record<string, unknown>) {
    this.dispatchEvent(new GameEvent(event, args));
  }

  static dispatch(event: GAME_EVENT, ...args: unknown[]) {
    EventHub.logic.dispatch(event, args);
    GameUI.dispatch(event, args);
  }

  static logic = new EventHub();
  static ui = new EventHub();
}

type GlobalThis = typeof globalThis & {
  EventHub: typeof EventHub
};
(globalThis as GlobalThis).EventHub = EventHub;

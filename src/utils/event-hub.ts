// oxlint-disable max-classes-per-file
import type { GAME_EVENT } from "./constants.js";

class GameEvent<T extends any[] = any[]> extends Event {
  args: T;
  constructor(eventType: GAME_EVENT, args: T) {
    super(eventType);
    this.args = args;
  }
}

class ModalAbortController extends AbortController {
  target: any;

  constructor(target: any) {
    super();
    this.target = target;
  }
}

// I should NOT need these many types to convince the thing to work

type LooseAutocomplete<T extends string> = T | Omit<string, T>;
type GameEventType = LooseAutocomplete<keyof typeof GAME_EVENT>;
interface GameEventListenerObject<T extends any[]> {
  handleEvent(evt: GameEvent<T>): void
}
type GameEventListener<T extends any[]> = (evt: GameEvent<T>) => void;
type GameEventListenerOrListenerObject<T extends any[]> = GameEventListener<T> | GameEventListenerObject<T>;

class EventHub extends EventTarget {
  private _targetControllers: ModalAbortController[] = [];

  on<T extends any[]>(event: GAME_EVENT | GameEventType, fn: (evt: GameEvent<T>) => void, target: any) {
    const index = this._targetControllers.push(new ModalAbortController(target)) - 1;
    this.addEventListener(event, fn, {
      signal: this._targetControllers[index]?.signal,
    });
  }

  override addEventListener<T extends any[]>(
    type: GAME_EVENT | GameEventType,
    callback: GameEventListenerOrListenerObject<T> | null,
    options?: AddEventListenerOptions | boolean,
  ): void {
    super.addEventListener(type as string, callback as any, options);
  }

  offAll(target: any) {
    for (const controller of this._targetControllers) {
      if (controller.target === target) {
        controller.abort();
      }
    }
  }

  dispatch(event: GAME_EVENT, args: any[]) {
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

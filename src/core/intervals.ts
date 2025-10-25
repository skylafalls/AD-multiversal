import { isLocalEnvironment } from "./devtools.js";

class GameIntervalState {
  private _id: number | undefined;
  private _handler: () => void;
  private _timeout: () => number;
  constructor(handler: () => void, timeout: (() => number) | number) {
    this._handler = handler;
    this._timeout = typeof timeout === "number" ? () => timeout : timeout;
  }

  get isStarted() {
    return this._id !== undefined;
  }

  start() {
    if (this.isStarted) {
      throw new Error("An already started interval cannot be started again.");
    } else {
      this._id = setInterval(this._handler, this._timeout());
    }
  }

  stop() {
    // This stops the interval if it isn't already stopped,
    // and does nothing if it is already stopped.
    clearInterval(this._id);
    this._id = undefined;
  }

  restart() {
    this.stop();
    this.start();
  }
}

export const GameIntervals = {
  // Not a getter because getter will cause stack overflow
  all(): GameIntervalState[] {
    return Object.values(GameIntervals).filter(i => i instanceof GameIntervalState);
  },
  start() {
    for (const interval of this.all()) {
      interval.start();
    }
  },
  stop() {
    for (const interval of this.all()) {
      interval.stop();
    }
  },
  restart() {
    for (const interval of this.all()) {
      interval.restart();
    }
  },
  gameLoop: new GameIntervalState(() => gameLoop(), () => player.options.updateRate),
  save: new GameIntervalState(() => GameStorage.save(), () =>
    player.options.autosaveInterval - Math.clampMin(0, Date.now() - GameStorage.lastSaveTime),
  ),
  checkCloudSave: new GameIntervalState(() => {
    if (player.options.cloudEnabled && Cloud.loggedIn) Cloud.saveCheck();
  }, 600 * 1000),
  // This simplifies auto-backup code to check every second instead of dynamically stopping and
  // restarting the interval every save operation, and is how it's structured on Android as well
  checkEverySecond: new GameIntervalState(() => {
    if (Math.random() < 0.00001) SecretAchievement(18).unlock();
    GameStorage.tryOnlineBackups();
  }, 1000),
  checkForUpdates: new GameIntervalState(() => {
    if (isLocalEnvironment()) return;
    fetch("version.txt")
      .then(response => response.json())
      .then((json) => {
        if (json.version > player.version) {
          Modal.message.show(json.message, { callback: updateRefresh }, 3);
        }
      })
      .catch((err: unknown) => {
        console.error(err);
      });
  }, 60000),
};

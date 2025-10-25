// oxlint-disable max-classes-per-file
import { DC } from "#utils/constants.js";
import type { DecimalSource } from "break_eternity.js";

interface MathOperations {
  add(left: unknown, right: unknown): unknown
  subtract(left: unknown, right: unknown): unknown
  multiply(left: unknown, right: unknown): unknown
  divide(left: unknown, right: unknown): unknown
  max(left: unknown, right: unknown): unknown
  min(left: unknown, right: unknown): unknown
  eq(left: unknown, right: unknown): unknown
  gt(left: unknown, right: unknown): unknown
  gte(left: unknown, right: unknown): unknown
  lt(left: unknown, right: unknown): unknown
  lte(left: unknown, right: unknown): unknown
}

namespace MathOperations {
  export const number = new class NumberMathOperations implements MathOperations {
    add(left: number, right: number): number {
      return left + right;
    }

    subtract(left: number, right: number): number {
      return left - right;
    }

    multiply(left: number, right: number): number {
      return left * right;
    }

    divide(left: number, right: number): number {
      return left / right;
    }

    max(left: number, right: number): number {
      return Math.max(left, right);
    }

    min(left: number, right: number): number {
      return Math.min(left, right);
    }

    eq(left: number, right: number): number {
      return left === right;
    }

    gt(left: number, right: number): number {
      return left > right;
    }

    gte(left: number, right: number): number {
      return left >= right;
    }

    lt(left: number, right: number): number {
      return left < right;
    }

    lte(left: number, right: number): number {
      return left <= right;
    }
  }();

  export const decimal = new class DecimalMathOperations implements MathOperations {
    add(left: DecimalSource, right: DecimalSource) {
      return Decimal.add(left, right);
    }

    subtract(left: DecimalSource, right: DecimalSource) {
      return Decimal.subtract(left, right);
    }

    multiply(left: DecimalSource, right: DecimalSource) {
      return Decimal.multiply(left, right);
    }

    divide(left: DecimalSource, right: DecimalSource) {
      return Decimal.divide(left, right);
    }

    max(left: DecimalSource, right: DecimalSource) {
      return Decimal.max(left, right);
    }

    min(left: DecimalSource, right: DecimalSource) {
      return Decimal.min(left, right);
    }

    eq(left: DecimalSource, right: DecimalSource) {
      return Decimal.eq(left, right);
    }

    gt(left: DecimalSource, right: DecimalSource) {
      return Decimal.gt(left, right);
    }

    gte(left: DecimalSource, right: DecimalSource) {
      return Decimal.gte(left, right);
    }

    lt(left: DecimalSource, right: DecimalSource) {
      return Decimal.lt(left, right);
    }

    lte(left: DecimalSource, right: DecimalSource) {
      return Decimal.lte(left, right);
    }
  }();

}

export abstract class Currency {
  abstract get value(): any;
  abstract set value(value: any);
  abstract get operations(): MathOperations;

  add(amount: any) {
    this.value = this.operations.add(this.value, amount);
  }

  subtract(amount: any) {
    this.value = this.operations.max(this.operations.subtract(this.value, amount), 0);
  }

  multiply(amount: any) {
    this.value = this.operations.multiply(this.value, amount);
  }

  divide(amount: any) {
    this.value = this.operations.divide(this.value, amount);
  }

  eq(amount: any) {
    return this.operations.eq(this.value, amount);
  }

  gt(amount: any) {
    return this.operations.gt(this.value, amount);
  }

  gte(amount: any) {
    return this.operations.gte(this.value, amount);
  }

  lt(amount: any) {
    return this.operations.lt(this.value, amount);
  }

  lte(amount: any) {
    return this.operations.lte(this.value, amount);
  }

  purchase(cost: any) {
    if (!this.gte(cost)) return false;
    this.subtract(cost);
    return true;
  }

  bumpTo(value: any) {
    this.value = this.operations.max(this.value, value);
  }

  dropTo(value: any) {
    this.value = this.operations.min(this.value, value);
  }

  abstract get startingValue(): any;

  reset() {
    this.value = this.startingValue;
  }
}

abstract class NumberCurrency extends Currency {
  get operations() {
    return MathOperations.number;
  }

  get startingValue() {
    return 0;
  }
}

abstract class DecimalCurrency extends Currency {
  get operations() {
    return MathOperations.decimal;
  }

  get sign() {
    return this.value.sign;
  }

  get mag() {
    return this.value.mag;
  }

  get layer() {
    return this.value.layer;
  }

  get startingValue() {
    return DC.D0;
  }
}

type GlobalThis = typeof globalThis & {
  DecimalCurrency: typeof DecimalCurrency
};

(globalThis as GlobalThis).DecimalCurrency = DecimalCurrency;

export namespace Currency {
  export const antimatter = new class extends DecimalCurrency {
    get value() {
      return player.antimatter;
    }

    set value(value) {
      if (InfinityChallenges.nextIC) InfinityChallenges.notifyICUnlock(value);
      if (GameCache.cheapestAntimatterAutobuyer.value && value.gte(GameCache.cheapestAntimatterAutobuyer.value)) {
      // Clicking into the automation tab clears the trigger and prevents it from retriggering as long as the player
      // stays on the tab; leaving the tab with an available autobuyer will immediately force it to trigger again
        TabNotification.newAutobuyer.clearTrigger();
        TabNotification.newAutobuyer.tryTrigger();
      }
      player.antimatter = value;
      player.records.thisInfinity.maxAM = player.records.thisInfinity.maxAM.max(value);
      player.records.thisEternity.maxAM = player.records.thisEternity.maxAM.max(value);
      player.records.thisReality.maxAM = player.records.thisReality.maxAM.max(value);

      if (Pelle.isDoomed) {
        player.celestials.pelle.records.totalAntimatter = player.celestials.pelle.records.totalAntimatter.max(value);
      }
    }

    add(amount: DecimalSource) {
      super.add(amount);
      if (amount.gt(0)) {
        player.records.totalAntimatter = player.records.totalAntimatter.add(amount);
        player.requirementChecks.reality.noAM = false;
      }
    }

    get productionPerSecond() {
      return NormalChallenge(12).isRunning
        ? AntimatterDimension(1).productionPerRealSecond.plus(AntimatterDimension(2).productionPerRealSecond)
        : AntimatterDimension(1).productionPerRealSecond;
    }

    get startingValue() {
      if (Pelle.isDisabled()) return new Decimal(100);
      return Effects.max(
        DC.E1,
        Perk.startAM,
        Achievement(21),
        Achievement(37),
        Achievement(54),
        Achievement(55),
        Achievement(78),
      );
    }
  }();

  export const matter = new class extends DecimalCurrency {
    get value() {
      return player.matter;
    }

    set value(value) {
      player.matter = Decimal.min(value, DC.BEMAX);
    }
  }();

  export const infinities = new class extends DecimalCurrency {
    get value() {
      return player.infinities;
    }

    set value(value) {
      player.infinities = value;
    }
  }();

  export const infinitiesBanked = new class extends DecimalCurrency {
    get value() {
      return player.infinitiesBanked;
    }

    set value(value) {
      player.infinitiesBanked = value;
    }
  }();

  export const infinitiesTotal = new class extends DecimalCurrency {
    get value() {
      return player.infinities.plus(player.infinitiesBanked);
    }

    set value(value) {
      player.infinities = value;
    }
  }();

  export const infinityPoints = new class extends DecimalCurrency {
    get value() {
      return player.infinityPoints;
    }

    set value(value) {
      player.infinityPoints = value;
      player.records.thisEternity.maxIP = player.records.thisEternity.maxIP.max(value);
      player.records.thisReality.maxIP = player.records.thisReality.maxIP.max(value);

      if (Pelle.isDoomed) {
        player.celestials.pelle.records.totalInfinityPoints
          = player.celestials.pelle.records.totalInfinityPoints.max(value);
      }
    }

    get startingValue() {
      if (Pelle.isDisabled()) return new Decimal();
      return Effects.max(
        new Decimal(),
        Perk.startIP1,
        Perk.startIP2,
        Achievement(104),
      );
    }

    reset() {
      super.reset();
      player.records.thisEternity.maxIP = this.startingValue;
    }
  }();

  export const infinityPower = new class extends DecimalCurrency {
    get value() {
      return player.infinityPower;
    }

    set value(value) {
      player.infinityPower = value;
    }
  }();

  export const eternities = new class extends DecimalCurrency {
    get value() {
      return player.eternities;
    }

    set value(value) {
      player.eternities = value;
    }

    get startingValue() {
      if (Pelle.isDoomed) return new Decimal(0);
      return Effects.max(
        0,
        RealityUpgrade(10),
      );
    }
  }();

  export const eternityPoints = new class extends DecimalCurrency {
    get value() {
      return player.eternityPoints;
    }

    set value(value) {
      player.eternityPoints = value;
      player.records.thisReality.maxEP = player.records.thisReality.maxEP.max(value);
      if (player.records.bestReality.bestEP.lt(value)) {
        player.records.bestReality.bestEP = value;
        player.records.bestReality.bestEPSet = Glyphs.copyForRecords(Glyphs.active.filter((g: null) => g !== null));
      }

      if (Pelle.isDoomed) {
        player.celestials.pelle.records.totalEternityPoints
          = player.celestials.pelle.records.totalEternityPoints.max(value);
      }
    }

    get startingValue() {
      if (Pelle.isDisabled()) return new Decimal(0);
      return Effects.max(
        0,
        Perk.startEP1,
        Perk.startEP2,
        Perk.startEP3,
      );
    }

    reset() {
      super.reset();
      player.records.thisReality.maxEP = this.startingValue;
    }
  }();

  export const timeShards = new class extends DecimalCurrency {
    get value() {
      return player.timeShards;
    }

    set value(value) {
      player.timeShards = value;
    }
  }();

  export const timeTheorems = new class extends DecimalCurrency {
    get value() {
      return player.timestudy.theorem;
    }

    set value(value) {
      player.timestudy.theorem = value;
      player.timestudy.maxTheorem = value.plus(TimeTheorems.calculateTimeStudiesCost());
    }

    get max() {
      return player.timestudy.maxTheorem;
    }

    add(amount: DecimalSource) {
      super.add(amount);
      player.timestudy.maxTheorem = player.timestudy.maxTheorem.plus(amount);
    }

    reset() {
      respecTimeStudies(true);
      super.reset();
      TimeTheoremPurchaseType.am.reset();
      TimeTheoremPurchaseType.ip.reset();
      TimeTheoremPurchaseType.ep.reset();
      player.timestudy.maxTheorem = this.startingValue;
    }
  }();

  export const tachyonParticles = new class extends DecimalCurrency {
    get value() {
      return player.dilation.tachyonParticles;
    }

    set value(value) {
      player.dilation.tachyonParticles = value;
    }
  }();

  export const dilatedTime = new class extends DecimalCurrency {
    get value() {
      return player.dilation.dilatedTime;
    }

    set value(value) {
      player.dilation.dilatedTime = value;
      player.records.thisReality.maxDT = player.records.thisReality.maxDT.max(value);
    }
  }();

  export const realities = new class extends DecimalCurrency {
    get value() {
      return player.realities;
    }

    set value(value) {
      player.realities = value;
    }
  }();

  export const realityMachines = new class extends DecimalCurrency {
    get value() {
      return player.reality.realityMachines;
    }

    set value(value) {
      const newValue = Decimal.min(value, MachineHandler.hardcapRM);
      const addedThisReality = newValue.minus(player.reality.realityMachines);
      player.reality.realityMachines = newValue;
      player.reality.maxRM = Decimal.max(player.reality.maxRM, newValue);
      if (player.records.bestReality.RM.lt(addedThisReality)) {
        player.records.bestReality.RM = addedThisReality;
        player.records.bestReality.RMSet = Glyphs.copyForRecords(Glyphs.active.filter((g: null) => g !== null));
      }
    }
  }();

  export const perkPoints = new class extends DecimalCurrency {
    get value() {
      return player.reality.perkPoints;
    }

    set value(value) {
      player.reality.perkPoints = value;
    }
  }();

  export const relicShards = new class extends DecimalCurrency {
    get value() {
      return player.celestials.effarig.relicShards;
    }

    set value(value) {
      player.celestials.effarig.relicShards = value;
    }
  }();

  export const imaginaryMachines = new class extends DecimalCurrency {
    get value() {
      return player.reality.imaginaryMachines;
    }

    set value(value) {
      player.reality.imaginaryMachines = Decimal.clampMax(value, MachineHandler.currentIMCap);
    }
  }();

  export const darkMatter = new class extends DecimalCurrency {
    get value() {
      return player.celestials.laitela.darkMatter;
    }

    set value(value) {
      const capped = Decimal.min(value, Number.MAX_VALUE);
      player.celestials.laitela.darkMatter = capped;
      player.celestials.laitela.maxDarkMatter = player.celestials.laitela.maxDarkMatter.max(capped);
    }

    get max() {
      return player.celestials.laitela.maxDarkMatter;
    }

    set max(value) {
      player.celestials.laitela.maxDarkMatter = value;
    }
  }();

  export const darkEnergy = new class extends DecimalCurrency {
    get value() {
      return player.celestials.laitela.darkEnergy;
    }

    set value(value) {
      player.celestials.laitela.darkEnergy = value;
    }

    get productionPerSecond() {
      return DarkMatterDimensions.all
        .map((d: { productionPerSecond: any }) => d.productionPerSecond)
        .sum();
    }
  }();

  export const singularities = new class extends DecimalCurrency {
    get value() {
      return player.celestials.laitela.singularities;
    }

    set value(value) {
      player.celestials.laitela.singularities = value;
    }
  }();

  export const remnants = new class extends DecimalCurrency {
    get value() {
      return player.celestials.pelle.remnants;
    }

    set value(value) {
      player.celestials.pelle.remnants = value;
    }
  }();

  export const realityShards = new class extends DecimalCurrency {
    get value() {
      return player.celestials.pelle.realityShards;
    }

    set value(value) {
      player.celestials.pelle.realityShards = value;
    }
  }();

  export const replicanti = new class extends DecimalCurrency {
    get value() {
      return player.replicanti.amount;
    }

    set value(value) {
      player.replicanti.amount = value;
    }
  }();

  export const galaxyGeneratorGalaxies = new class extends DecimalCurrency {
    get value() {
      return player.galaxies.add(GalaxyGenerator.galaxies);
    }

    set value(value) {
      const spent = player.galaxies.add(GalaxyGenerator.galaxies).sub(value);
      player.celestials.pelle.galaxyGenerator.spentGalaxies
        = player.celestials.pelle.galaxyGenerator.spentGalaxies.add(spent);
    }
  }();

}

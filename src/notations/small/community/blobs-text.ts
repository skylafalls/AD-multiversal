import { BlobsNotation } from "../blobs";
import { Decimal } from "#utils/break_eternity.js";

export class BlobsTextNotation extends BlobsNotation {
  public override get name(): string {
    return "Blobs (Text)";
  }

  protected get prefixes() {
    return ["", "big", "large", "great", "grand", "huge", "super", "ultra", "mega", "giga", "omega"] as const;
  }

  protected get suffixes() {
    return ["", "think", "wave", "hug", "nom", "sad", "pats", "yes", "no", "heart", "sleep"] as const;
  }

  protected get prefixNegative(): string {
    return "notlike";
  }

  protected get suffixInfinity(): string {
    return "finity";
  }

  public override get negativeInfinite(): string {
    return this.blobConstructor(this.prefixNegative, this.suffixInfinity);
  }

  public override get infinite(): string {
    return this.blobConstructor("", this.suffixInfinity);
  }

  public override formatVerySmallNegativeDecimal(num: Decimal): string {
    return this.blobify(Decimal.sub(0, num));
  }

  public override formatNegativeUnder1000(num: number): string {
    return this.blobify(new Decimal(-num));
  }

  public override formatNegativeDecimal(num: Decimal): string {
    return this.blobify(Decimal.sub(0, num));
  }

  protected override blobify(num: Decimal): string {
    let prefix = "", suffix = "";
    let number = this.reduceNumber(num.abs());
    if (num.sign === -1) {
      prefix = this.prefixNegative;
      // To allow the combination :notlikeblob: to appear
      number = Math.max(0, number - 1);
    }

    const indexes = [
      Math.floor(number / (this.suffixes.length * this.prefixes.length)),
      Math.floor(number / this.suffixes.length) % this.prefixes.length,
      number % this.suffixes.length,
    ];

    if (indexes[0] >= 1) {
      suffix = `-${indexes[0] + 1}`;
    }

    return this.blobConstructor(prefix + this.prefixes[Math.floor(indexes[1])],
      this.suffixes[Math.floor(indexes[2])] + suffix);
  }

  protected blobConstructor(prefix: string, suffix: string): string {
    return `:${prefix}blob${suffix}:`;
  }
}

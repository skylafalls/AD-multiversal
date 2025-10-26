import { BlobsTextNotation } from "./blobs-text";
import type { Decimal } from "#utils/break_eternity.js";

export class BlobsShortTextNotation extends BlobsTextNotation {
  public override get name(): string {
    return "Blobs (Short Text)";
  }

  protected override get prefixNegative(): string {
    return "un";
  }

  protected override blobify(num: Decimal): string {
    let prefix = "", suffix = "";
    let number = this.reduceNumber(num.abs());
    if (num.sign === -1) {
      prefix = this.prefixNegative;
      // To allow the combination :unblob: to appear
      number = Math.max(0, number - 1);
    }

    const indexes = [
      Math.floor(number / this.suffixes.length),
      number % this.suffixes.length,
    ] as const;

    if (indexes[0] >= 1) {
      suffix = `-${indexes[0] + 1}`;
    }

    return this.blobConstructor(prefix, this.suffixes[Math.floor(indexes[1])]! + suffix);
  }
}

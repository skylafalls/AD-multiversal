import { deflateSync, inflateSync } from "fflate";
import { decodeBase64Url, encodeBase64Url } from "@std/encoding";

export const GameSaveSerializer = {
  serialize(save) {
    const json = JSON.stringify(save, (k, v) => this.jsonConverter(k, v));
    return this.encodeText(json, "savefile");
  },

  jsonConverter(key, value) {
    if (value === Infinity) {
      return "Infinity";
    }
    if (value instanceof Set) {
      return [...value.keys()];
    }
    return value;
  },
  deserialize(data) {
    if (typeof data !== "string") return;
    const json = this.decodeText(data, "savefile");

    return JSON.parse(json, (k, v) => ((v === Infinity) ? "Infinity" : v));
  },
  // Define these now so we don't keep creating new ones, which vaguely seems bad.
  encoder: new TextEncoder(),
  decoder: new TextDecoder(),
  // These are magic strings that savefiles/automator scripts should start with.
  // Due to the way atob/btoa work, old saves (before the reality update and for
  // a significant part of its development) always started with eYJ even though
  // it wasn't explicitly added. If you want to make a mod of AD, you may want to
  // rename "savefile" to "modless savefile" or something and create a new
  // "savefile" or "mod savefile" property with a string like
  // "AntimatterDimensions[mod name]SavefileFormatAAA", so that people don't
  // confuse your saves with AD saves but can still import AD saves (this will
  // also require changing some other code slightly, particularly decode).
  startingString: {
    "savefile": "AntimatterDimensionsSavefileFormat",
    "automator script": "AntimatterDimensionsAutomatorScriptFormat",
    "automator data": "AntimatterDimensionsAutomatorDataFormat",
    "glyph filter": "AntimatterDimensionsGlyphFilterFormat",
  },
  // The ending strings aren't as verbose so that we can save a little space.
  endingString: {
    "savefile": "EndOfSavefile",
    "automator script": "EndOfAutomatorScript",
    "automator data": "EndOfAutomatorData",
    "glyph filter": "EndOfGlyphFilter",
  },
  // This should always be three characters long, and should ideally go AAA, AAB, AAC, etc.
  // so that we can do inequality tests on it to compare versions (though skipping a version
  // shouldn't be a problem).
  version: "AAC",
  // Steps are given in encoding order.
  // Export and cloud save use the same steps because the maximum ~15% saving
  // from having them be different seems not to be worth it.
  // It's important that `this` is what it should be in these function calls
  // (encoder/decoded for the first element, window for the fourth)
  // which is why we shouldn't do e.g. { encode: encoder.encode, decode: encoder.decode }
  // In the fifth element, order of operations is important: we don't want to encode 0s we added in encoding
  // (i.e. + -> 0b -> 0ab is undesired) or to accidentally decode 0ac -> 0c -> / (slash)
  // when encoding says (as it should) 0c -> 0ac.
  // These functions contain the code that does different things in different versions.
  // Right now we only have code for steps to only apply in certain versions; add a condition to the step.
  // It wouldn't be too hard to allow steps to depend on version though.
  steps: [
    // This step transforms saves into unsigned 8-bit arrays, as pako requires.
    { encode: x => GameSaveSerializer.encoder.encode(x), decode: x => GameSaveSerializer.decoder.decode(x) },
    // This step is  where the compression actually happens. The pako library works with unsigned 8-bit arrays.
    { encode: x => deflateSync(x), decode: x => inflateSync(x) },
    // This step makes the characters in saves printable. At this point in the process, all characters
    // will already have codepoints less than 256 (from the previous step), so emoji in the original save
    // won't break this.
    { encode: x => encodeBase64Url(x), decode: x => decodeBase64Url(x) },
    {
      encode: (x, type) => x + GameSaveSerializer.endingString[type],
      decode: (x, type) => x.slice(0, x.length - GameSaveSerializer.endingString[type].length),
      condition: version => version >= "AAB",
    },
  ],
  getSteps(type, version) {
    // This is a version marker, as well as indicating to players that this is from AD
    // and whether it's a save or automator script. We can change the last 3 letters
    // of the string savefiles start with from AAA to something else,
    // if we want a new version of savefile encoding.
    return this.steps.filter(i => (!i.condition) || i.condition(version)).concat({
      encode: x => `${GameSaveSerializer.startingString[type] + GameSaveSerializer.version}${x}`,
      decode: x => x.slice(GameSaveSerializer.startingString[type].length + 3),
    });
  },
  // Apply each step's encode function in encoding order.
  encodeText(text, type) {
    return this.getSteps(type, this.version).reduce((x, step) => step.encode(x, type), text);
  },
  // Apply each step's decode function, in decoding order (which is the reverse
  // of encoding order). We only do this if we recognize the string which tells
  // us the save version. If we don't see it, we assume the save's old and just
  // use atob. If you're adding a new savefile version, make sure its length is
  // three characters and alter the encoding/decoding functions as is described
  // in the comment above the definition of steps. If you're making a mod, then
  // add another case to this conditional. Old saves (before the reality update
  // and for a significant part of its development) always started with eYJ and
  // old automator scripts (where this function is also used) are very unlikely
  // to start with our magic string because it is longer than a few characters.
  decodeText(text, type) {
    if (text.startsWith(this.startingString[type])) {
      const len = this.startingString[type].length;
      const version = text.slice(len, len + 3);
      return this.getSteps(type, version).reduceRight((x, step) => step.decode(x, type), text);
    }
    return atob(text);
  },
};

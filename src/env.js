export const DEV = import.meta.env.VITE_DEV === "true";
export const STEAM = import.meta.env.VUITE_STEAM === "true";
// oxlint-disable-next-line prefer-global-this
export const MAC = window.navigator.platform === "MacIntel"; // eslint-disable-line @typescript-eslint/no-deprecated

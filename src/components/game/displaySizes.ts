import type { DisplaySize } from "@/game/storage";

export const cameraViewSizeClass: Record<DisplaySize, string> = {
  small: "w-[46vw] max-w-48 sm:w-64 sm:max-w-none",
  medium: "w-[55vw] max-w-56 sm:w-80 sm:max-w-none",
  large: "w-[65vw] max-w-72 sm:w-[23rem] sm:max-w-none",
};

export const signExampleSizeClass: Record<DisplaySize, string> = {
  small: "w-[30vw] max-w-32 sm:w-40 sm:max-w-none",
  medium: "w-[36vw] max-w-40 sm:w-48 sm:max-w-none",
  large: "w-[42vw] max-w-48 sm:w-56 sm:max-w-none",
};

export const signExampleHeightClass: Record<DisplaySize, string> = {
  small: "h-20 sm:h-28",
  medium: "h-28 sm:h-36",
  large: "h-36 sm:h-48",
};

export const cameraGridSizeClass: Record<DisplaySize, string> = {
  small: "sm:grid-cols-[16rem_minmax(0,1fr)]",
  medium: "sm:grid-cols-[22rem_minmax(0,1fr)]",
  large: "sm:grid-cols-[28rem_minmax(0,1fr)]",
};

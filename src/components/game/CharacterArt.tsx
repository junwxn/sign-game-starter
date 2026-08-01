import castSheet from "@/assets/cast-v6-kai-centered.webp";
import characterHaziq from "@/assets/character-haziq-v5-normalized.webp";
import characterKai from "@/assets/character-kai-v6-centered.webp";
import characterMei from "@/assets/character-mei-v5-normalized.webp";
import characterPriya from "@/assets/character-priya-v5-normalized.webp";
import poseEat from "@/assets/sign-eat-v6-normalized.webp";
import poseFriend from "@/assets/sign-friend-v6-normalized.webp";
import poseGood from "@/assets/sign-good-v6-normalized.webp";
import poseHello from "@/assets/sign-hello-v6-normalized.webp";
import poseHelp from "@/assets/sign-help-v6-normalized.webp";
import poseNo from "@/assets/sign-no-v6-normalized.webp";
import posePlease from "@/assets/sign-please-v6-normalized.webp";
import poseSorry from "@/assets/sign-sorry-v6-normalized.webp";
import poseThankYou from "@/assets/sign-thankyou-v6-normalized.webp";
import poseWater from "@/assets/sign-water-v6-normalized.webp";
import poseYes from "@/assets/sign-yes-v6-normalized.webp";
import { cn } from "@/lib/utils";

export const CHARACTERS = [
  { name: "Mei", role: "Quick learner", colour: "coral" },
  { name: "Haziq", role: "Steady defender", colour: "teal" },
  { name: "Priya", role: "Pattern expert", colour: "gold" },
  { name: "Kai", role: "Combo specialist", colour: "purple" },
] as const;

const characterImages = [characterMei, characterHaziq, characterPriya, characterKai];

export function CharacterArt({
  index,
  selected = false,
  className,
  label,
}: {
  index?: number;
  selected?: boolean;
  className?: string;
  label?: string;
}) {
  const characterIndex = index === undefined ? undefined : index % CHARACTERS.length;
  return (
    <span
      role="img"
      aria-label={
        label ??
        (characterIndex === undefined
          ? "Selected player character"
          : CHARACTERS[characterIndex].name)
      }
      className={cn(
        "character-art block",
        characterIndex !== undefined && "character-art--single",
        selected && "character-art--selected",
        className,
      )}
      style={{
        backgroundImage: `url(${characterIndex === undefined ? castSheet : characterImages[characterIndex]})`,
        backgroundPosition:
          characterIndex === undefined ? "var(--character-position, 0%) center" : "center",
      }}
    />
  );
}

const poseMap: Record<string, string> = {
  hello: poseHello,
  water: poseWater,
  help: poseHelp,
  eat: poseEat,
  thankyou: poseThankYou,
  please: posePlease,
  sorry: poseSorry,
  yes: poseYes,
  no: poseNo,
  friend: poseFriend,
  good: poseGood,
};

export function SignPose({
  signId,
  label,
  className,
}: {
  signId: string;
  label: string;
  className?: string;
}) {
  const pose = poseMap[signId];
  if (!pose) {
    const fallbackIndex = [...signId].reduce((sum, char) => sum + char.charCodeAt(0), 0) % 4;
    return (
      <CharacterArt
        index={fallbackIndex}
        className={cn("sign-pose sign-pose--fallback", className)}
        label={`${label} mascot preview; reference lesson required`}
      />
    );
  }
  return (
    <span
      role="img"
      aria-label={`Stylised ${label} mascot pose; use the verified reference for accuracy`}
      className={cn("sign-pose block", className)}
      style={{
        backgroundImage: `url(${pose})`,
        backgroundPosition: "center",
        backgroundSize: "contain",
      }}
    />
  );
}

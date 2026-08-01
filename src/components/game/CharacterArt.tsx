import castSheet from "@/assets/cast-v6-kai-centered.webp";
import characterHaziq from "@/assets/character-haziq-v5-normalized.webp";
import characterKai from "@/assets/character-kai-v6-centered.webp";
import characterMei from "@/assets/character-mei-v5-normalized.webp";
import characterPriya from "@/assets/character-priya-v5-normalized.webp";

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

import castSheet from "@/assets/cast-v6-kai-centered.webp";
import characterHaziq from "@/assets/character-haziq-v5-normalized.webp";
import characterKai from "@/assets/character-kai-v6-centered.webp";
import characterMei from "@/assets/character-mei-v5-normalized.webp";
import characterPriya from "@/assets/character-priya-v5-normalized.webp";
import poseFriend from "@/assets/sign-friend-v6-normalized.webp";
import poseGood from "@/assets/sign-good-v6-normalized.webp";
import poseHello from "@/assets/sign-hello-v6-normalized.webp";
import poseHelp from "@/assets/sign-help-v6-normalized.webp";
import poseNo from "@/assets/sign-no-v6-normalized.webp";
import posePlease from "@/assets/sign-please-v6-normalized.webp";
import poseSorry from "@/assets/sign-sorry-v6-normalized.webp";
import poseThankYou from "@/assets/sign-thankyou-v6-normalized.webp";
import poseWater from "@/assets/sign-water-v6-normalized.webp";
import { SIGN_REFERENCES } from "@/signReferences";
import poseYes from "@/assets/sign-yes-v6-normalized.webp";

import poseYou from "@/assets/sign-you-v8-sgsl-halfbody.webp";
import poseMe from "@/assets/sign-me-v8-sgsl-halfbody.webp";
import poseHow from "@/assets/sign-how-v8-sgsl-halfbody.webp";
import poseWhere from "@/assets/sign-where-v8-sgsl-halfbody.webp";
import poseToilet from "@/assets/sign-toilet-v8-sgsl-halfbody.webp";
import poseSchool from "@/assets/sign-school-v8-sgsl-halfbody.webp";
import poseLearn from "@/assets/sign-learn-v8-sgsl-halfbody.webp";
import poseWhat from "@/assets/sign-what-v8-sgsl-halfbody.webp";
import poseName from "@/assets/sign-name-v8-sgsl-halfbody.webp";
import poseWant from "@/assets/sign-want-v8-sgsl-halfbody.webp";
import poseCan from "@/assets/sign-can-v8-sgsl-halfbody.webp";
import poseAlex from "@/assets/sign-alex-v8-sgsl-halfbody.webp";
import poseMeet from "@/assets/sign-meet-v8-sgsl-halfbody.webp";
import poseSignLanguage from "@/assets/sign-signlanguage-v8-sgsl-halfbody.webp";
import poseTomorrow from "@/assets/sign-tomorrow-v8-sgsl-halfbody.webp";
import poseSee from "@/assets/sign-see-v8-sgsl-halfbody.webp";
import poseGo from "@/assets/sign-go-v8-sgsl-halfbody.webp";

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
  style,
}: {
  index?: number;
  selected?: boolean;
  className?: string;
  label?: string;
  style?: React.CSSProperties;
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
        ...style,
      }}
    />
  );
}

const poseMap: Record<string, string> = {
  hello: poseHello,
  water: poseWater,
  help: poseHelp,
  eat: SIGN_REFERENCES.eat.mediaUrl,
  thankyou: poseThankYou,
  please: posePlease,
  sorry: poseSorry,
  yes: poseYes,
  no: poseNo,
  friend: poseFriend,
  good: poseGood,
  you: poseYou,
  me: poseMe,
  how: poseHow,
  where: poseWhere,
  toilet: poseToilet,
  school: poseSchool,
  learn: poseLearn,
  what: poseWhat,
  name: poseName,
  want: poseWant,
  can: poseCan,
  alex: poseAlex,
  meet: poseMeet,
  signlanguage: poseSignLanguage,
  tomorrow: poseTomorrow,
  see: poseSee,
  go: poseGo,
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
      <span
        role="img"
        aria-label={`${label} mascot preview; reference lesson required`}
        className={cn(
          "sign-pose block flex items-center justify-center rounded-xl bg-magic/10 p-1 text-center font-display text-xs font-black text-ink",
          className,
        )}
      >
        <CharacterArt
          index={fallbackIndex}
          className="h-full w-full opacity-90"
          style={
            { backgroundPosition: "center 8%", backgroundSize: "contain" } as React.CSSProperties
          }
        />
      </span>
    );
  }
  return (
    <span
      role="img"
      aria-label={`${label} sign example; use the verified reference for accuracy`}
      className={cn("sign-pose block", className)}
      style={{
        backgroundImage: `url(${pose})`,
        backgroundPosition: "center",
        backgroundSize: "contain",
      }}
    />
  );
}

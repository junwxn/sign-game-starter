import { Heart, Star } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/lib/settings-store";
import type { Sign } from "@/lib/sign-data";
import { cn } from "@/lib/utils";

export function DifficultyPill({ difficulty }: { difficulty: Sign["difficulty"] }) {
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-0.5 text-[11px] font-extrabold",
        difficulty === "Beginner" && "bg-mint/25 text-mint-foreground",
        difficulty === "Intermediate" && "bg-sunny/30 text-sunny-foreground",
        difficulty === "Advanced" && "bg-bubble/25 text-bubble",
      )}
    >
      {difficulty}
    </span>
  );
}

export function SignDetailsDialog({
  sign,
  open,
  onOpenChange,
}: {
  sign: Sign | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const { favourites, toggleFavourite, markPractised, practised } = useSettings();
  if (!sign) return null;
  const isFav = favourites.includes(sign.id);
  const isPractised = practised.includes(sign.id) || sign.practised;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] max-w-2xl overflow-y-auto rounded-3xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-extrabold">{sign.name}</DialogTitle>
          <DialogDescription>{sign.description}</DialogDescription>
        </DialogHeader>

        <div className="grid h-44 place-items-center rounded-2xl bg-gradient-sky text-6xl">
          <span aria-hidden>{sign.emoji}</span>
        </div>
        <p className="text-center text-xs font-semibold text-muted-foreground">
          Illustration placeholder — prototype only
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <DifficultyPill difficulty={sign.difficulty} />
          <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-extrabold text-secondary-foreground">
            {sign.category}
          </span>
          {isPractised && (
            <span className="rounded-full bg-primary/12 px-2.5 py-0.5 text-[11px] font-extrabold text-primary">
              Practised
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <MiniStat label="Accuracy" value={`${sign.accuracy}%`} />
          <MiniStat label="Attempts" value={String(sign.practiceCount)} />
          <MiniStat label="Category" value={sign.category} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <section className="rounded-2xl bg-muted/60 p-4">
            <h3 className="mb-2 flex items-center gap-2 text-sm font-extrabold">
              <Star className="h-4 w-4 text-accent" /> Step by step
            </h3>
            <ol className="space-y-2 text-sm text-muted-foreground">
              {sign.steps.map((s, i) => (
                <li key={s} className="flex gap-2">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary text-[11px] font-extrabold text-primary-foreground">
                    {i + 1}
                  </span>
                  <span>{s}</span>
                </li>
              ))}
            </ol>
          </section>
          <section className="rounded-2xl bg-destructive/8 p-4">
            <h3 className="mb-2 text-sm font-extrabold">Common mistakes</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {sign.mistakes.map((m) => (
                <li key={m} className="flex gap-2">
                  <span aria-hidden>⚠️</span>
                  <span>{m}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button className="flex-1 rounded-xl font-extrabold" onClick={() => markPractised(sign.id)}>
            Practise this sign
          </Button>
          <Button
            variant="outline"
            className="rounded-xl font-extrabold"
            onClick={() => toggleFavourite(sign.id)}
          >
            <Heart className={cn("mr-1.5 h-4 w-4", isFav && "fill-bubble text-bubble")} />
            {isFav ? "Favourited" : "Favourite"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-secondary/70 p-3 text-center">
      <p className="font-display text-lg font-extrabold text-secondary-foreground">{value}</p>
      <p className="text-[11px] font-bold text-muted-foreground">{label}</p>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { GameStoreProvider } from "@/game/store";
import { Game } from "@/game/Game";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sign Game — Arcade Singapore Sign Language Battles" },
      {
        name: "description",
        content:
          "Sign fast, save the words. An arcade prototype for learning Singapore Sign Language: word battles, sentence quests and simulated multiplayer.",
      },
      { property: "og:title", content: "Sign Game — Sign fast. Save the words." },
      {
        property: "og:description",
        content:
          "Protect the communication crystal by completing signs for falling word creatures in this SgSL arcade prototype.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <GameStoreProvider>
      <main>
        <h1 className="sr-only">Sign Game — arcade Singapore Sign Language prototype</h1>
        <Game />
      </main>
    </GameStoreProvider>
  );
}

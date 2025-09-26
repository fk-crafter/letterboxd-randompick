"use client";

import { useState } from "react";
import Image from "next/image"; // ✅ pour remplacer <img>
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

type Film = {
  title: string;
  url: string | null;
  poster?: string | null;
};

export default function HomePage() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [films, setFilms] = useState<Film[]>([]);
  const [randomFilm, setRandomFilm] = useState<Film | null>(null);
  const [error, setError] = useState("");

  async function fetchFilms() {
    if (!username) return;
    setLoading(true);
    setError("");
    setRandomFilm(null);

    try {
      const res = await fetch(`/api/watchlist?user=${username}`);
      const data = await res.json();

      if (data.error) {
        setError(data.error);
        setFilms([]);
      } else {
        setFilms(data.films);
        if (data.films.length === 0) {
          setError("Aucun film trouvé 😢");
        }
      }
    } catch (err) {
      console.error("Erreur côté client:", err);
      setError("Impossible de charger la watchlist");
    } finally {
      setLoading(false);
    }
  }

  function pickRandomFilm() {
    if (films.length === 0) return;
    const random = films[Math.floor(Math.random() * films.length)];
    setRandomFilm(random);
  }

  return (
    <main className="min-h-dvh flex items-center justify-center p-6">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle>🎬 Letterboxd Picker</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Pseudo Letterboxd (ex: tarantino)"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
            <Button onClick={fetchFilms} disabled={loading}>
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Charger"
              )}
            </Button>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          {films.length > 0 && (
            <div className="space-y-3">
              <Button onClick={pickRandomFilm} variant="secondary">
                Choisir un film au hasard
              </Button>
              {randomFilm && (
                <div className="p-3 border rounded-md space-y-2 text-center">
                  {randomFilm.poster && (
                    <Image
                      src={randomFilm.poster}
                      alt={randomFilm.title ?? "Poster"}
                      width={160}
                      height={240}
                      className="mx-auto rounded-md shadow-md"
                    />
                  )}
                  <p className="font-semibold">{randomFilm.title}</p>
                  {randomFilm.url && (
                    <a
                      href={randomFilm.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 text-sm"
                    >
                      Voir sur Letterboxd →
                    </a>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}

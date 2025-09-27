"use client";

import { useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

type Film = {
  title: string;
  url: string;
  poster: string;
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
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-zinc-950 to-zinc-900 p-4 sm:p-6">
      <Card className="w-full max-w-2xl shadow-xl border border-zinc-800">
        <CardHeader>
          <CardTitle className="text-center text-xl sm:text-2xl font-bold">
            Letterboxd Picker
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="pseudo"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="flex-1"
            />
            <Button onClick={fetchFilms} disabled={loading} className="sm:w-32">
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Rechercher"
              )}
            </Button>
          </div>

          {error && <p className="text-red-500 text-center text-sm">{error}</p>}

          {films.length > 0 && (
            <div className="space-y-4 text-center">
              <Button
                onClick={pickRandomFilm}
                variant="secondary"
                className="w-full sm:w-auto"
              >
                Choisir un film au hasard
              </Button>

              <AnimatePresence>
                {randomFilm && (
                  <motion.div
                    key={randomFilm.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                    className="p-4 border rounded-lg bg-zinc-900 text-center space-y-3"
                  >
                    <Image
                      src={randomFilm.poster}
                      alt={randomFilm.title}
                      width={200}
                      height={300}
                      className="mx-auto rounded-lg shadow-lg"
                    />
                    <p className="text-lg font-semibold">{randomFilm.title}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}

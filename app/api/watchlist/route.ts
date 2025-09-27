import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const user = searchParams.get("user");

    if (!user) {
      return NextResponse.json(
        { error: "Missing 'user' param" },
        { status: 400 }
      );
    }

    const url = `https://letterboxd.com/${user}/watchlist/`;

    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch watchlist" },
        { status: 500 }
      );
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    const films = $(".poster.film-poster")
      .map((_, el) => {
        const title =
          $(el).attr("data-film-name") ||
          $(el).attr("aria-label") ||
          $(el).find("img").attr("alt") ||
          "Untitled";

        const link = $(el).attr("data-target-link");
        const slug = $(el).attr("data-film-slug");

        let poster = $(el).find("img").attr("src") || null;
        if (poster) {
          poster = poster.replace("/image-150/", "/image-600/"); // meilleure qualité
        }

        return {
          title,
          url: link
            ? `https://letterboxd.com${link}`
            : slug
            ? `https://letterboxd.com/film/${slug}/`
            : null,
          poster,
        };
      })
      .get();

    return NextResponse.json({ films });
  } catch (err) {
    console.error("Erreur API watchlist:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

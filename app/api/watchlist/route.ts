import { NextResponse } from "next/server";
import { chromium } from "playwright";

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

    // Lance Chromium en mode headless
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "domcontentloaded" });

    // Attend que les posters soient visibles
    await page.waitForSelector(".film-poster");

    // Récupère les films
    const films = await page.$$eval(".film-poster", (elements) =>
      elements.map((el) => {
        const title =
          el.getAttribute("data-film-name") ||
          el.getAttribute("aria-label") ||
          (el.querySelector("img")?.getAttribute("alt") ?? "");

        const link = el.getAttribute("data-target-link");
        const slug = el.getAttribute("data-film-slug");

        const img = el.querySelector("img");
        let poster: string | null = null;

        if (img) {
          const srcset = img.getAttribute("srcset");
          if (srcset) {
            // On prend la dernière URL (souvent le 2x en HD)
            poster = srcset.split(",").pop()?.trim().split(" ")[0] || null;
          } else {
            poster = img.getAttribute("src");
          }
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
    );

    await browser.close();

    // Debug dans ton terminal
    console.log("Films trouvés:", films.length);
    if (films.length > 0) {
      console.log("Premier film:", films[0]);
    }

    return NextResponse.json({ films });
  } catch (err) {
    console.error("Erreur API watchlist:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

import { db } from "@/db";
import { Books } from "@/db/schema";
import { and, eq, notInArray } from "drizzle-orm";
import puppeteer from "puppeteer";

async function scrapeGoodreads() {
  const browser = await puppeteer.launch({ headless: false }); // headless false para depuración
  const page = await browser.newPage();

  try {
    const trendingBooks = []; // Se almacenan todos los libros trending
    const baseUrl = "https://www.goodreads.com/shelf/show/trending";

    const url = `${baseUrl}`;
    await page.goto(url, { waitUntil: "domcontentloaded" });

    const books = await page.evaluate(() => {
      const bookElements = document.querySelectorAll(".elementList"); // Ajustar selector según Goodreads
      const links: string[] = [];

      bookElements.forEach((book) => {
        const link = book.querySelector(".bookTitle")?.getAttribute("href");
        if (link) {
          links.push(`https://www.goodreads.com${link}`);
        }
      });

      return links;
    });

    for (const bookUrl of books) {
      await page.goto(bookUrl, { waitUntil: "domcontentloaded" });
      await page.waitForSelector(".Text__title1"); // Esperar a que el título esté disponible
      await page.waitForSelector(".ContributorLink__name"); // Esperar a que el autor esté disponible
      await page.waitForSelector(".ResponsiveImage"); // Esperar a que la imagen esté disponible
      await page.waitForSelector(".Formatted"); // Esperar a que la descripción esté disponible

      const bookDetails = await page.evaluate(() => {
        const title =
          document.querySelector(".Text__title1")?.textContent?.trim() || "N/A";
        const author =
          document
            .querySelector(".ContributorLink__name")
            ?.textContent?.trim() || "N/A";
        const img =
          document.querySelector(".ResponsiveImage")?.getAttribute("src") ||
          "N/A";
        const description =
          document.querySelector(".Formatted")?.textContent?.trim() || "N/A";

        return { title, author, img, description };
      });

      const existingBook = await db
        .select()
        .from(Books)
        .where(eq(Books.title, bookDetails.title));

      if (existingBook.length > 0) {
        // Si el libro ya existe, actualizar is_trending a true
        await db
          .update(Books)
          .set({ is_trending: true })
          .where(eq(Books.id, existingBook[0].id))
          .run();
        console.log(`Updated trending status for book: ${bookDetails.title}`);
      } else {
        // Si el libro no existe, agregarlo como trending
        trendingBooks.push({
          title: bookDetails.title,
          author: bookDetails.author,
          synopsis: bookDetails.description,
          cover_url: bookDetails.img,
          is_trending: true,
        });
        console.log(`Scraped new trending book: ${bookDetails.title}`);
      }
    }

    // Insertar nuevos libros trending en la base de datos
    if (trendingBooks.length > 0) {
     await db.insert(Books).values(trendingBooks).run();
      console.log(
        `Inserted ${trendingBooks.length} new trending books into the database.`
      );
    }

    // Desmarcar libros que ya no son trending
    await db
      .update(Books)
      .set({ is_trending: false })
      .where(
        and(
          notInArray(
            Books.title,
            trendingBooks.map((book) => book.title)
          ),
          eq(Books.is_trending, true)
        )
      )
      .run();
    console.log("Updated books that are no longer trending.");
  } catch (error) {
    console.error("Error scraping Goodreads:", error);
  } finally {
    await browser.close();
  }
}

scrapeGoodreads();

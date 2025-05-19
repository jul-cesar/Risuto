import { db } from "@/db";
import { BookGenres, Books, Genres } from "@/db/schema";
import { and, eq, notInArray } from "drizzle-orm";
import puppeteer from "puppeteer";

async function scrapeGoodreadsTrending() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  const processedPages = new Set<string>();
  const processedUrls = new Set<string>();
  const trendingBooks: any[] = [];
  const baseUrl = "https://www.goodreads.com/shelf/show/trending";

  try {
    let pageNum = 1;
    let shouldContinue = true;

    while (shouldContinue && pageNum <= 10) {
      const url = `${baseUrl}?page=${pageNum}`;
      if (processedPages.has(url)) {
        console.log(`Skipped already processed page: ${url}`);
        pageNum++;
        continue;
      }

      try {
        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });

        const currentUrl = page.url();
        if (!currentUrl.includes(`page=${pageNum}`)) {
          console.log(`Redirection detected at ${url}. Skipping.`);
          pageNum++;
          continue;
        }

        processedPages.add(url);
      } catch (error) {
        console.error(`Failed to load page: ${url}`, error);
        pageNum++;
        continue;
      }

      const bookLinks: string[] = await page.evaluate(() => {
        const bookElements = document.querySelectorAll(".elementList");
        const links: string[] = [];

        bookElements.forEach((book) => {
          const link = book.querySelector(".bookTitle")?.getAttribute("href");
          if (link) {
            links.push(new URL(link, "https://www.goodreads.com").toString());
          }
        });

        return links;
      });

      if (bookLinks.length === 0) {
        console.log(`No books found on ${url}. Ending pagination.`);
        shouldContinue = false;
        break;
      }

      for (const bookUrl of bookLinks) {
        if (processedUrls.has(bookUrl)) {
          console.log(`Skipped already processed book URL: ${bookUrl}`);
          continue;
        }

        processedUrls.add(bookUrl);

        try {
          await page.goto(bookUrl, { waitUntil: "domcontentloaded", timeout: 60000 });

          await page.waitForSelector(".Text__title1", { timeout: 10000 });
          await page.waitForSelector(".ContributorLink__name", { timeout: 10000 });
          await page.waitForSelector(".ResponsiveImage", { timeout: 10000 });
          await page.waitForSelector(".Formatted", { timeout: 10000 });
          await page.waitForSelector(
            ".BookPageMetadataSection__genreButton .Button__labelItem",
            { timeout: 10000 }
          );
        } catch (error) {
          console.error(`Failed to load or parse book page: ${bookUrl}`, error);
          continue;
        }

        const bookDetails = await page.evaluate(() => {
          const title = document.querySelector(".Text__title1")?.textContent?.trim() || "N/A";
          const author = document.querySelector(".ContributorLink__name")?.textContent?.trim() || "N/A";
          const img = document.querySelector(".ResponsiveImage")?.getAttribute("src") || "N/A";
          const description = document.querySelector(".Formatted")?.textContent?.trim() || "N/A";
          const publicationInfo = document.querySelector('[data-testid="publicationInfo"]')?.textContent?.trim() || "N/A";  
          const genres = Array.from(
            document.querySelectorAll(".BookPageMetadataSection__genreButton .Button__labelItem")
          ).map((el) => el.textContent?.trim() || "N/A");

          return { title, author, img, description, publicationInfo, genres };
        });

        const existingBook = await db
          .select()
          .from(Books)
          .where(and(eq(Books.title, bookDetails.title), eq(Books.author, bookDetails.author)))
          .get();

        let bookId;

        if (existingBook) {
          bookId = existingBook.id;

          // Update trending flag
          await db
            .update(Books)
            .set({ is_trending: true })
            .where(eq(Books.id, bookId))
            .run();

          console.log(`Updated trending: ${bookDetails.title}`);
        } else {
          const inserted = await db
            .insert(Books)
            .values({
              title: bookDetails.title,
              author: bookDetails.author,
              cover_url: bookDetails.img,
              synopsis: bookDetails.description,
              publishedAt: bookDetails.publicationInfo,
              is_trending: true,
            })
            .returning()
            .get();

          bookId = inserted.id;
          console.log(`Inserted new trending book: ${bookDetails.title}`);
        }

        trendingBooks.push(bookDetails.title);

        // Process genres
        for (const genreName of bookDetails.genres) {
          if (genreName === "N/A") continue;

          let genre = await db
            .select()
            .from(Genres)
            .where(eq(Genres.name, genreName))
            .get();

          if (!genre) {
            genre = await db.insert(Genres).values({ name: genreName }).returning().get();
            console.log(`Inserted genre: ${genreName}`);
          }

          const existingRelation = await db
            .select()
            .from(BookGenres)
            .where(and(eq(BookGenres.book_id, bookId), eq(BookGenres.genre_id, genre.id)))
            .get();

          if (!existingRelation) {
            await db.insert(BookGenres).values({ book_id: bookId, genre_id: genre.id });
            console.log(`Linked book "${bookDetails.title}" to genre "${genreName}"`);
          }
        }
      }

      pageNum++;
    }

    // Desmarcar los que ya no son trending
    await db
      .update(Books)
      .set({ is_trending: false })
      .where(
        and(
          notInArray(Books.title, trendingBooks),
          eq(Books.is_trending, true)
        )
      )
      .run();

    console.log("Updated books no longer trending.");
  } catch (error) {
    console.error("Error scraping Goodreads trending:", error);
  } finally {
    await browser.close();
  }
}

scrapeGoodreadsTrending();

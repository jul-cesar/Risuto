import { db } from "@/db";
import { Book, BookGenres, Books, Genres } from "@/db/schema";
import { sql } from "drizzle-orm";
import puppeteer from "puppeteer";

async function scrapeGoodreads(urls: string[]) {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    protocolTimeout: 120000, // Aumenta el tiempo de espera del protocolo a 120 segundos
  });
  const page = await browser.newPage();
  const processedUrls = new Set<string>(); // Conjunto para rastrear URLs de libros procesadas
  const processedPages = new Set<string>(); // Conjunto para rastrear URLs de páginas procesadas

  try {
    const allBooks: Book[] = [];

    for (const baseUrl of urls) {
      for (let pageNum = 1; pageNum <= 3; pageNum++) {
        const url = `${baseUrl}?page=${pageNum}`;
        if (processedPages.has(url)) {
          console.log(`Skipped already processed page: ${url}`);
          continue; // Salta si la página ya fue procesada
        }

        try {
          await page.goto(url, {
            waitUntil: "domcontentloaded",
            timeout: 60000,
          }); // Aumenta el tiempo de espera a 60 segundos

          // Verifica si la URL actual después de la navegación coincide con la esperada
          const currentUrl = page.url();
          if (!currentUrl.includes(`page=${pageNum}`)) {
            console.log(
              `Detected redirection to a different page: ${currentUrl}. Skipping this page and continuing pagination.`
            );
            continue; // Salta a la siguiente página de la paginación
          }

          // Marca la página como procesada
          processedPages.add(url);
        } catch (error) {
          console.error(`Failed to load page: ${url}`, error);
          continue; // Salta a la siguiente página si hay un error
        }

        const books = await page.evaluate(() => {
          const bookElements = document.querySelectorAll(".elementList");
          const links: string[] = [];

          bookElements.forEach((book) => {
            const link = book.querySelector(".bookTitle")?.getAttribute("href");
            if (link) {
              links.push(new URL(link, "https://www.goodreads.com").toString()); // Normaliza la URL
            }
          });

          return links;
        });

        for (const bookUrl of books) {
          if (processedUrls.has(bookUrl)) {
            console.log(`Skipped already processed URL: ${bookUrl}`);
            continue; // Salta si la URL ya fue procesada
          }

          processedUrls.add(bookUrl); // Marca la URL como procesada

          try {
            await page.goto(bookUrl, {
              waitUntil: "domcontentloaded",
              timeout: 60000,
            }); // Aumenta el tiempo de espera
          } catch (error) {
            console.error(`Failed to load book page: ${bookUrl}`, error);
            continue; // Salta al siguiente libro si hay un error
          }

          try {
            await page.waitForSelector(".Text__title1", { timeout: 10000 });
            await page.waitForSelector(".ContributorLink__name", {
              timeout: 10000,
            });
            await page.waitForSelector(".ResponsiveImage", { timeout: 10000 });
            await page.waitForSelector(".Formatted", { timeout: 10000 });
            await page.waitForSelector(
              ".BookPageMetadataSection__genreButton .Button__labelItem",
              { timeout: 10000 }
            ); // Espera por los géneros
          } catch (error) {
            console.error(
              `Failed to find selectors on page: ${bookUrl}`,
              error
            );
            continue; // Salta al siguiente libro si los selectores no están disponibles
          }

          const bookDetails = await page.evaluate(() => {
            const title =
              document.querySelector(".Text__title1")?.textContent?.trim() ||
              "N/A";
            const author =
              document
                .querySelector(".ContributorLink__name")
                ?.textContent?.trim() || "N/A";
            const img =
              document.querySelector(".ResponsiveImage")?.getAttribute("src") ||
              "N/A";
            const description =
              document.querySelector(".Formatted")?.textContent?.trim() ||
              "N/A";
            const genres = Array.from(
              document.querySelectorAll(
                ".BookPageMetadataSection__genreButton .Button__labelItem"
              )
            ).map((genre) => genre.textContent?.trim() || "N/A");

            return { title, author, img, description, genres };
          });

          const existingBook = await db
            .select()
            .from(Books)
            .where(
              sql`${Books.title} = ${bookDetails.title} AND ${Books.author} = ${bookDetails.author}`
            )
            .get();

          let bookId;
          if (!existingBook) {
            const insertedBook = await db
              .insert(Books)
              .values({
                title: bookDetails.title,
                author: bookDetails.author,
                synopsis: bookDetails.description,
                cover_url: bookDetails.img,
              })
              .returning()
              .get();

            bookId = insertedBook.id;
            console.log(
              `Scraped book: ${bookDetails.title} by ${bookDetails.author}`
            );
          } else {
            bookId = existingBook.id;
            console.log(
              `Skipped duplicate book: ${bookDetails.title} by ${bookDetails.author}`
            );
          }

          // Procesa los géneros
          for (const genreName of bookDetails.genres) {
            if (genreName === "N/A") continue;

            let genre = await db
              .select()
              .from(Genres)
              .where(sql`${Genres.name} = ${genreName}`)
              .get();

            if (!genre) {
              genre = await db
                .insert(Genres)
                .values({ name: genreName })
                .returning()
                .get();
              console.log(`Inserted new genre: ${genreName}`);
            }

            const existingRelation = await db
              .select()
              .from(BookGenres)
              .where(
                sql`${BookGenres.book_id} = ${bookId} AND ${BookGenres.genre_id} = ${genre.id}`
              )
              .get();

            if (!existingRelation) {
              await db.insert(BookGenres).values({
                book_id: bookId,
                genre_id: genre.id,
              });
              console.log(
                `Linked book "${bookDetails.title}" with genre "${genreName}"`
              );
            }
          }
        }
      }
    }

    if (allBooks.length > 0) {
      await db.insert(Books).values(allBooks).run();
      console.log(`Inserted ${allBooks.length} books into the database.`);
    }
  } catch (error) {
    console.error("Error scraping Goodreads:", error);
  } finally {
    await browser.close();
  }
}

scrapeGoodreads([
  "https://www.goodreads.com/shelf/show/comics",
  "https://www.goodreads.com/shelf/show/graphic-novels",
  "https://www.goodreads.com/shelf/show/psychology",
  "https://www.goodreads.com/shelf/show/popular",
  "https://www.goodreads.com/shelf/show/art",
  "https://www.goodreads.com/shelf/show/biography",
  "https://www.goodreads.com/shelf/show/children",
  "https://www.goodreads.com/shelf/show/health",
  "https://www.goodreads.com/shelf/show/history",
  "https://www.goodreads.com/shelf/show/fiction",
  "https://www.goodreads.com/shelf/show/non-fiction",
  "https://www.goodreads.com/shelf/show/fantasy",
  "https://www.goodreads.com/shelf/show/science-fiction",
  "https://www.goodreads.com/shelf/show/mystery",
  "https://www.goodreads.com/shelf/show/romance",
  "https://www.goodreads.com/shelf/show/horror",
  "https://www.goodreads.com/shelf/show/young-adult",
  "https://www.goodreads.com/shelf/show/classics",
]);

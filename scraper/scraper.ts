import { db } from "@/db";
import { Books } from "@/db/schema";
import { sql } from "drizzle-orm";
import puppeteer from "puppeteer";

async function scrapeGoodreads(urls: string[]) {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  const processedUrls = new Set<string>(); 

  try {
    const allBooks = [];

    for (const baseUrl of urls) {
      let repeatedPageCount = 0; // Contador para páginas repetidas

      for (let pageNum = 1; pageNum <= 3; pageNum++) {
        const url = `${baseUrl}?page=${pageNum}`;
        try {
          await page.goto(url, {
            waitUntil: "domcontentloaded",
            timeout: 60000,
          }); // Aumenta el tiempo de espera a 60 segundos

          // Verifica si la URL actual después de la navegación coincide con la esperada
          const currentUrl = page.url();
          if (!currentUrl.includes(`page=${pageNum}`)) {
            console.log(
              `Detected redirection to a repeated page: ${currentUrl}.`
            );
            repeatedPageCount++;

            // Si se detecta la misma redirección varias veces, detén la paginación
            if (repeatedPageCount >= 2) {
              console.log(
                `Stopping pagination for this category due to repeated redirections.`
              );
              break;
            }

            continue; // Intenta con la siguiente página
          }

          // Reinicia el contador si la página es válida
          repeatedPageCount = 0;
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

            return { title, author, img, description };
          });

          const existingBook = await db
            .select()
            .from(Books)
            .where(
              sql`${Books.title} = ${bookDetails.title} AND ${Books.author} = ${bookDetails.author}`
            )
            .get();

          if (!existingBook) {
            allBooks.push({
              title: bookDetails.title,
              author: bookDetails.author,
              synopsis: bookDetails.description,
              cover_url: bookDetails.img,
            });

            console.log(
              `Scraped book: ${bookDetails.title} by ${bookDetails.author}`
            );
          } else {
            console.log(
              `Skipped duplicate book: ${bookDetails.title} by ${bookDetails.author}`
            );
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

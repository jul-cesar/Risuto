import { db } from "@/db";
import { BookGenres, Books, Genres } from "@/db/schema";
import "dotenv/config";
import { sql } from "drizzle-orm";
import puppeteer, { Page } from "puppeteer";

async function loginGoodreads(page: Page, email: string, password: string) {
  await page.goto(
    "https://www.goodreads.com/ap/signin?language=en_US&openid.assoc_handle=amzn_goodreads_web_na&openid.claimed_id=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.identity=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&openid.mode=checkid_setup&openid.ns=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0&openid.pape.max_auth_age=0&openid.return_to=https%3A%2F%2Fwww.goodreads.com%2Fap-handler%2Fsign-in&siteState=eyJyZXR1cm5fdXJsIjoiaHR0cHM6Ly93d3cuZ29vZHJlYWRzLmNvbS8ifQ%3D%3D",
    {
      waitUntil: "networkidle2",
    }
  );

  // Escribir email
  await page.waitForSelector(".a-input-text");
  await page.type(".a-input-text", email, { delay: 50 });

  // Escribir contraseña
  await page.waitForSelector("#ap_password");
  await page.type("#ap_password", password, { delay: 50 });

  // Hacer click en el botón submit
  await Promise.all([
    page.click("input#signInSubmit"),
    page.waitForNavigation({ waitUntil: "networkidle2" }),
  ]);

  console.log("Login successful");
}

async function scrapeGoodreads(urls: string[]) {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    protocolTimeout: 120000,
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    userDataDir:
      "C:/Users/julio/AppData/Local/Google/Chrome/User Data Puppeteer",
  });
  const page = await browser.newPage();
  // await loginGoodreads(page, process.env.emailgr!, process.env.passgr!);
  const processedUrls = new Set<string>();
  const processedPages = new Set<string>();

  try {
    for (const baseUrl of urls) {
      let pageNum = 1;
      let shouldContinue = true;

      while (shouldContinue && pageNum <= 10) {
        const url = `${baseUrl}?page=${pageNum}`;
        console.log(`Processing URL: ${url}`);

        if (processedPages.has(url)) {
          console.log(`Skipped already processed page: ${url}`);
          pageNum++;
          continue;
        }

        try {
          await page.goto(url, {
            waitUntil: "domcontentloaded",
            timeout: 60000,
          });

          const currentUrl = page.url();

          // Si la URL actual no incluye la paginación esperada, asumimos que no hay más páginas válidas
          if (!currentUrl.includes(`page=${pageNum}`)) {
            console.log(
              `Redirection detected at ${url}. Assuming no more pages. Stopping pagination.`
            );
            shouldContinue = false;
            break;
          }

          // Marcar la página como procesada solo si cargó correctamente y sin redirección
          processedPages.add(url);
        } catch (error) {
          console.error(`Failed to load page: ${url}`, error);
          pageNum++;
          continue;
        }

        const books = await page.evaluate(() => {
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

        if (books.length === 0) {
          console.log(
            `No books found on ${url}. Ending pagination for this shelf.`
          );
          shouldContinue = false;
          break;
        }

        for (const bookUrl of books) {
          if (processedUrls.has(bookUrl)) {
            console.log(`Skipped already processed URL: ${bookUrl}`);
            continue;
          }

          processedUrls.add(bookUrl);

          try {
            await page.goto(bookUrl, {
              waitUntil: "domcontentloaded",
              timeout: 60000,
            });
          } catch (error) {
            console.error(`Failed to load book page: ${bookUrl}`, error);
            continue;
          }

          try {
            await page.waitForSelector(".Text__title1", { timeout: 10000 });
            await page.waitForSelector(".ContributorLink__name", {
              timeout: 10000,
            });
            await page.waitForSelector(".ResponsiveImage", { timeout: 10000 });
            await page.waitForSelector(".Formatted", { timeout: 10000 });
            await page.waitForSelector('[data-testid="publicationInfo"]', {
              timeout: 10000,
            });

            await page.waitForSelector(
              ".BookPageMetadataSection__genreButton .Button__labelItem",
              { timeout: 10000 }
            );
          } catch (error) {
            console.error(
              `Failed to find selectors on page: ${bookUrl}`,
              error
            );
            continue;
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
            const publicationInfo =
              document
                .querySelector('[data-testid="publicationInfo"]')
                ?.textContent?.trim() || "N/A";
            const pagesInfo =
              document
                .querySelector('[data-testid="pagesFormat"]')
                ?.textContent?.trim() || "N/A";
            const genres = Array.from(
              document.querySelectorAll(
                ".BookPageMetadataSection__genreButton .Button__labelItem"
              )
            ).map((genre) => genre.textContent?.trim() || "N/A");

            return {
              title,
              author,
              img,
              description,
              publicationInfo,
              pagesInfo,
              genres,
            };
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
                publishedAt: bookDetails.publicationInfo,
                pagesInfo: bookDetails.pagesInfo,
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

        pageNum++;
      }
    }
  } catch (error) {
    console.error("Error scraping Goodreads:", error);
  } finally {
    await browser.close();
  }
}

scrapeGoodreads([
  "https://www.goodreads.com/shelf/show/anime",
  "https://www.goodreads.com/shelf/show/magical-realism",
  "https://www.goodreads.com/shelf/show/romantic-comedy",

  "https://www.goodreads.com/shelf/show/isekai",

  "https://www.goodreads.com/shelf/show/fantasy-romance",

  "https://www.goodreads.com/shelf/show/shonen",
  "https://www.goodreads.com/shelf/show/shoujo",
  "https://www.goodreads.com/shelf/show/seinen",
  "https://www.goodreads.com/shelf/show/josei",

  "https://www.goodreads.com/shelf/show/yuri",
  "https://www.goodreads.com/shelf/show/slice-of-life",
  "https://www.goodreads.com/shelf/show/supernatural",
  "https://www.goodreads.com/shelf/show/fantasy-manga",
  "https://www.goodreads.com/shelf/show/science-fiction-manga",
  "https://www.goodreads.com/shelf/show/spanish-literature",
  "https://www.goodreads.com/shelf/show/graphic-novels-manga",
  "https://www.goodreads.com/shelf/show/historical-fiction",
  "https://www.goodreads.com/shelf/show/romance-manga",
  "https://www.goodreads.com/genres/latin-american-literature",

  "https://www.goodreads.com/shelf/show/manga",
  "https://www.goodreads.com/shelf/show/yaoi",
  "https://www.goodreads.com/shelf/show/japanese",
  "https://www.goodreads.com/shelf/show/pirates",
  "https://www.goodreads.com/shelf/show/adventure",
  "https://www.goodreads.com/shelf/show/read-manga",
  "https://www.goodreads.com/shelf/show/contemporary",
  "https://www.goodreads.com/shelf/show/poetry",
  "https://www.goodreads.com/shelf/show/short-stories",
  "https://www.goodreads.com/shelf/show/essays",
  "https://www.goodreads.com/shelf/show/novels",
  "https://www.goodreads.com/shelf/show/novella",
  "https://www.goodreads.com/shelf/show/plays",
  "https://www.goodreads.com/shelf/show/true-crime",
  "https://www.goodreads.com/shelf/show/graphic-novel",
  "https://www.goodreads.com/shelf/show/anthology",

  "https://www.goodreads.com/shelf/show/comics",
  "https://www.goodreads.com/shelf/show/graphic-novels",
  "https://www.goodreads.com/shelf/show/illustrated",
  "https://www.goodreads.com/shelf/show/illustration",
  "https://www.goodreads.com/shelf/show/photography",

  "https://www.goodreads.com/shelf/show/psychology",
  "https://www.goodreads.com/shelf/show/philosophy",
  "https://www.goodreads.com/shelf/show/self-help",
  "https://www.goodreads.com/shelf/show/business",
  "https://www.goodreads.com/shelf/show/economics",
  "https://www.goodreads.com/shelf/show/politics",
  "https://www.goodreads.com/shelf/show/religion",
  "https://www.goodreads.com/shelf/show/science",
  "https://www.goodreads.com/shelf/show/technology",
  "https://www.goodreads.com/shelf/show/parenting",
  "https://www.goodreads.com/shelf/show/cooking",
  "https://www.goodreads.com/shelf/show/travel",
  "https://www.goodreads.com/shelf/show/food",
  "https://www.goodreads.com/shelf/show/health-and-fitness",
  "https://www.goodreads.com/shelf/show/true-crime",
  "https://www.goodreads.com/shelf/show/biography-and-memoir",

  "https://www.goodreads.com/shelf/show/popular",
  "https://www.goodreads.com/shelf/show/best-sellers",
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

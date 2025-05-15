import { db } from '@/db';
import { Books } from '@/db/schema';
import puppeteer from 'puppeteer';

async function scrapeGoodreads(urls: string[]) {
    const browser = await puppeteer.launch({ headless: false }); //headless false sino no sirve
    const page = await browser.newPage();

    try {
        const allBooks = []; // se almacenas todos los libros para guardarlos de una y no 1x1

        for (const baseUrl of urls) {
            for (let pageNum = 1; pageNum <= 3; pageNum++) { //solo las 3 primeras paginas de cada genero
                const url = `${baseUrl}?page=${pageNum}`;
                await page.goto(url, { waitUntil: 'domcontentloaded' });

                const books = await page.evaluate(() => {
                    const bookElements = document.querySelectorAll('.elementList'); 
                    const links: string[] = [];

                    bookElements.forEach(book => {
                        const link = book.querySelector('.bookTitle')?.getAttribute('href');
                        if (link) {
                            links.push(`https://www.goodreads.com${link}`);
                        }
                    });

                    return links;
                });

                for (const bookUrl of books) {
                    await page.goto(bookUrl, { waitUntil: 'domcontentloaded' });
                    await page.waitForSelector('.Text__title1'); 
                    await page.waitForSelector('.ContributorLink__name');
                    await page.waitForSelector('.ResponsiveImage'); 
                    await page.waitForSelector('.Formatted');   

                    const bookDetails = await page.evaluate(() => {
                        const title = document.querySelector('.Text__title1')?.textContent?.trim() || 'N/A';
                        const author = document.querySelector('.ContributorLink__name')?.textContent?.trim() || 'N/A';
                        const img = document.querySelector('.ResponsiveImage')?.getAttribute('src') || 'N/A';
                        const description = document.querySelector('.Formatted')?.textContent?.trim() || 'N/A';

                        return { title, author, img, description };
                    });

                    allBooks.push({
                        title: bookDetails.title,
                        author: bookDetails.author,
                        synopsis: bookDetails.description,
                        cover_url: bookDetails.img,
                    });

                    console.log(`Scraped book: ${bookDetails.title} by ${bookDetails.author}`);
                }
            }
        }

     
        if (allBooks.length > 0) {
            await db.insert(Books).values(allBooks).run();
            console.log(`Inserted ${allBooks.length} books into the database.`);
        }
    } catch (error) {
        console.error('Error scraping Goodreads:', error);
    } finally {
        await browser.close();
    }
}


scrapeGoodreads([
    'https://www.goodreads.com/shelf/show/popular',
    'https://www.goodreads.com/shelf/show/fiction',
    'https://www.goodreads.com/shelf/show/non-fiction',
    'https://www.goodreads.com/shelf/show/fantasy',
    'https://www.goodreads.com/shelf/show/science-fiction',
    'https://www.goodreads.com/shelf/show/mystery',
    'https://www.goodreads.com/shelf/show/romance',
    'https://www.goodreads.com/shelf/show/horror',
    'https://www.goodreads.com/shelf/show/young-adult',
    'https://www.goodreads.com/shelf/show/classics'
]);

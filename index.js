import axios from 'axios';
import cheerio from 'cheerio';
import express from 'express';
// import res from 'express/lib/response.js';
// import puppeteer from 'puppeteer';

// import { scrapeAndPush } from './src/scrape.js';
// import { jobData } from './src/scrape.js';

const PORT = process.env.PORT || 3000;

// Will eventually add an input for users(me) to use custom query parameters
var URL = 'https://www.indeed.com/jobs?q=Web%20Developer&l=Dayton%2C%20OH';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// This retrieves the url of the full job description, then sends it to the scraping function.
app.get('/jobs', async (req, res) => {
	const promises = [];
	const jobs = [];

	for (let i = 0; i <= 20; i += 10) {
		promises.push(
			axios({ method: 'get', url: `${URL}&start${i}` })
				.then((response) => {
					const htmlData = response.data;
					const $ = cheerio.load(htmlData);

					$('#mosaic-provider-jobcards > a', htmlData).each((index, element) => {
						const title = $(element).find('.jobTitle > span').text().trim();
						const company = $(element).find('.companyName').text().trim();
						const location = $(element).find('.companyLocation').text().trim();
						const pay = $(element).find('.attribute_snippet').text().trim();
						const description = $(element).find('.job-snippet > ul').text().trim();
						const linkToFullJob = $(element).attr('href');

						// const encodedLink = encodeURIComponent(linkToFullJob);

						if (company !== 'Revature') {
							jobs.push({
								title: title,
								company: company,
								location: location,
								pay: pay,
								description: description,
								linkToFullJob: 'https://indeed.com' + linkToFullJob,
							});
						}
					});
				})
				.catch((err) => console.error(err))
		);
	}

	Promise.all(promises)
		.then(() => {
			console.log(jobs);
			console.log(jobs.length);
			setTimeout(() => res.status(200).json(jobs), 5000);
		})
		.catch((err) => console.error(err));
});

app.listen(PORT, () => console.log('App is listening on port: ' + PORT));

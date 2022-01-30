import axios from 'axios';
import cheerio from 'cheerio';
import express from 'express';
// import res from 'express/lib/response.js';
// import puppeteer from 'puppeteer';

// import { scrapeAndPush } from './src/scrape.js';
// import { jobData } from './src/scrape.js';

const PORT = process.env.PORT || 3000;

// Will eventually add an input for users(me) to use custom query parameters
var indeedURL = 'https://www.indeed.com/jobs?q=Web%20Developer&l=Dayton%2C%20OH';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/indeedJobs', async (req, res) => {
	const promises = [];
	const jobs = [];

	// indeed pages increment by 10. Store a promise with an axios call for each page
	for (let i = 0; i <= 20; i += 10) {
		promises.push(
			axios({ method: 'get', url: `${indeedURL}&start=${i}` })
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

	console.log(promises);

	// Run the axios calls from the promises array
	Promise.all(promises)
		.then(() => {
			console.log(jobs);
			console.log(jobs.length);

			// Allow jobs array to populate, then return
			setTimeout(() => res.status(200).json(jobs), 5000);
		})
		.catch((err) => console.error(err));
});

app.listen(PORT, () => console.log('App is listening on port: ' + PORT));

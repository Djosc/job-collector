import axios from 'axios';
import cheerio from 'cheerio';
import express from 'express';
import puppeteer from 'puppeteer';

import { scrapeIndeed } from './src/scrape.js';
// import { jobData } from './src/scrape.js';

const PORT = process.env.PORT || 3000;

// Will eventually add an input for users(me) to use custom query parameters
var indeedURL = 'https://www.indeed.com/jobs?q=Web%20Developer&l=Dayton%2C%20OH';
var glassdoorURL =
	'https://www.glassdoor.com/Job/springboro-oh-web-developer-jobs-SRCH_IL.0,13_IC1145756_KO14,27.htm?clickSource=searchBox';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Get Indeed Job Data and Links
app.get('/indeedJobs', async (req, res) => {
	const queryParams = {
		jobQuery: 'Web Developer',
		cityQuery: 'Dayton, OH',
		numberOfPages: 10,
	};

	scrapeIndeed(queryParams)
		.then((data) => {
			console.log(data.length);
			setTimeout(() => res.status(200).json(data), 2000);
		})
		.catch((err) => res.status(500));
});

//Get GlassDoor Job Data and Links
app.get('/glassdoorJobs', (req, res) => {
	const promises = [];
	const jobs = [];

	// for (let i = 0; i <= 2; i++) {
	promises.push(
		axios({ method: 'get', url: `${glassdoorURL}` })
			.then((response) => {
				const htmlData = response.data;
				const $ = cheerio.load(htmlData);

				$('.react-job-listing', htmlData).each((index, element) => {
					const title = $(element).find('a[data-test="job-link"]').first().text().trim();
					// fix company
					const company = $(element).find('a > span').first().text().trim();
					// const company = $(element).find('.').text().trim();
					// const location = $(element).find('.').text().trim();
					// const pay = $(element).find('.').text().trim();
					const linkToFullJob = $(element).find('a').attr('href');

					// const encodedLink = encodeURIComponent(linkToFullJob);

					// if (company !== 'Revature') {
					jobs.push({
						title: title,
						company: company,
						// location: location,
						// pay: pay,
						// description: description,
						linkToFullJob: 'https://glassdoor.com' + linkToFullJob,
					});
					// }
				});
			})
			.catch((err) => console.error(err))
	);
	// }

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

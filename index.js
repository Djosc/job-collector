import axios from 'axios';
import cheerio from 'cheerio';
import express from 'express';
import res from 'express/lib/response.js';
import puppeteer from 'puppeteer';

import { scrapeAndPush } from './src/scrape.js';
import { jobData } from './src/scrape.js';

const PORT = process.env.PORT || 3000;

// Will eventually add an input for users(me) to use custom query parameters
const URL = 'https://www.indeed.com/jobs?q=Web+Developer&l=Dayton%2C+OH';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// This retrieves the url of the full job description, then sends it to the scraping function.
app.get('/jobs', (req, res) => {
	axios(URL)
		.then((response) => {
			const htmlData = response.data;
			const $ = cheerio.load(htmlData);

			$('#mosaic-provider-jobcards > a', htmlData).each((index, element) => {
				const linkToFullJob = $(element).attr('href');
				scrapeAndPush(linkToFullJob, index);
			});
		})
		.then(() => {
			setTimeout(() => res.status(200).json(jobData), 4000);
		})
		.catch((err) => {
			console.log(err);
			res.status(500).send('Error: ' + err);
		});
});

app.listen(PORT, () => console.log('App is listening on port: ' + PORT));

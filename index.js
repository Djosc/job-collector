import axios from 'axios';
import cheerio from 'cheerio';
import express from 'express';
import puppeteer from 'puppeteer';

import { scrapeAndPush } from './src/scrape.js';

const PORT = process.env.PORT || 3000;

// Will eventually add an input for users(me) to use custom query parameters
const URL = 'https://www.indeed.com/jobs?q=Web+Developer&l=Dayton%2C+OH';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// const scrapeAndPush = async (url, arrIndex) => {
// 	url = 'https://www.indeed.com' + url;
// 	axios(url).then((res) => {
// 		const htmlData = res.data;
// 		const $ = cheerio.load(htmlData);

// 		$('.jobsearch-ViewJobLayout-jobDisplay', htmlData).each((index, element) => {
// 			const title = $(element)
// 				.find('.jobsearch-JobInfoHeader-title-container > h1')
// 				.text();
// 			const company = $(element)
// 				.find('.jobsearch-CompanyInfoContainer')
// 				.find('a')
// 				.first()
// 				.text();
// 			const location = $(element).find('.jobsearch-jobLocationHeader-location').text();
// 			jobData.push({
// 				arrIndex,
// 				title,
// 				company,
// 				location,
// 			});
// 			console.log(title);
// 			console.log(company);
// 			console.log(location + '\n');
// 		});
// 	});
// };

// This will be contained within an api endpoint
// This retrieves the url of the full job description, then sends it to the scraping function.
axios(URL)
	.then((res) => {
		const htmlData = res.data;
		const $ = cheerio.load(htmlData);

		$('#mosaic-provider-jobcards > a', htmlData).each((index, element) => {
			const linkToFullJob = $(element).attr('href');
			// console.log(linkToFullJob);
			scrapeAndPush(linkToFullJob, index);
		});
	})
	.catch((err) => console.log(err));

app.listen(PORT, () => console.log('App is listening on port: ' + PORT));

import axios from 'axios';
import cheerio from 'cheerio';
import express from 'express';
import cors from 'cors';

import { join, dirname } from 'path';
import { Low, JSONFile } from 'lowdb';
import { fileURLToPath } from 'url';

import { scrapeIndeed } from './src/scrape.js';
import { filterIndeed } from './src/filter.js';
// import { jobData } from './src/scrape.js';

const PORT = process.env.PORT || 8080;

// Will eventually add an input for users(me) to use custom query parameters
var indeedURL = 'https://www.indeed.com/jobs?q=Web%20Developer&l=Dayton%2C%20OH';
var glassdoorURL =
	'https://www.glassdoor.com/Job/springboro-oh-web-developer-jobs-SRCH_IL.0,13_IC1145756_KO14,27.htm?clickSource=searchBox';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

// lowDB setup
const __dirname = dirname(fileURLToPath(import.meta.url));

const file = join(__dirname, '/src/data/db.json');
const adapter = new JSONFile(file);
const db = new Low(adapter);

await db.read();

// console.log(db.data);

db.data ||= { jobs: [] };

const { jobs } = db.data;
// jobs.push('test');

// await db.write();

// Get Indeed Job Data and Links
app.get('/indeedJobs', async (req, res) => {
	const queryParams = {
		jobQuery: req.query.job || 'Web Developer',
		cityQuery: req.query.city || 'Dayton, OH',
		radius: req.query.radius || '25',
		sort: req.query.sort || 'relevance',
		numberOfPages: req.query.pages * 10 - 10 || 0,
	};

	// var jobLinksArr = [];

	console.log(queryParams.numberOfPages);

	scrapeIndeed(queryParams)
		.then((data) => {
			console.log(data.length);
			setTimeout(() => {
				res.status(200).json(data);
			}, 2000);
		})
		.catch((err) => res.status(500));

	// ! code block with function to filter indeed TODO
	// scrapeIndeed(queryParams)
	// 	.then((data) => {
	// 		console.log(data.length);
	// 		// console.log(data);
	// 		setTimeout(() => {
	// 			data.forEach((el) => {
	// 				jobLinksArr.push(el.linkToFullJob);
	// 			});
	// 			// res.status(200).json(jobLinksArr);
	// 		}, 2000);
	// 	}).then(() => {

	// 	})
	// 	.catch((err) => res.status(500));
});

// Returns the whole watch list(object containing array of objects) as JSON
app.get('/watchList', async (req, res) => {
	await db.read();
	console.log(db.data);

	res.status(200).json(db.data);
});

app.post('/addJob', async (req, res) => {
	await db.read();
	const { jobs } = db.data;

	const job = jobs.filter((j) => j.description.includes(req.body.description));

	if (job.length > 0) {
		res.status(200).send('Entry already exists');
	} else {
		db.data.jobs.push({
			...req.body,
		});
		db.write();
		res.status(201).send('Entry added successfully');
	}
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

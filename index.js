import express from 'express';
import cors from 'cors';

import { join, dirname } from 'path';
import { Low, JSONFile } from 'lowdb';
import { fileURLToPath } from 'url';

import { scrapeIndeed } from './src/scrape.js';

const PORT = process.env.PORT || 8080;

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

db.data ||= { jobs: [] };

const { jobs } = db.data;

// Get Indeed Job Data and Links
app.get('/indeedJobs', async (req, res) => {
	const queryParams = {
		jobQuery: req.query.job || 'Web Developer',
		cityQuery: req.query.city || 'Dayton, OH',
		radius: req.query.radius || '25',
		sort: req.query.sort || 'relevance',
		numberOfPages: req.query.pages * 10 - 10 || 0,
	};

	console.log(queryParams.numberOfPages);

	scrapeIndeed(queryParams)
		.then((data) => {
			console.log(data.length);
			setTimeout(() => {
				res.status(200).json(data);
			}, 2000);
		})
		.catch((err) => res.status(500));
});

// Returns the whole watch list(object containing array of objects) as JSON
app.get('/watchList', async (req, res) => {
	await db.read();
	// console.log(db.data);

	res.status(200).json(db.data);
});

// Adds a single job the the JSON db file
// If the entry exists already, return string saying so. Otherwise, push the request body to DB
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

// ! slight asynchronous fishiness here when an entry does not exist
// find and delete entry if the req.body exists in the db
app.delete('/removeJob', async (req, res) => {
	await db.read();
	const { jobs } = db.data;

	try {
		for (const [idx, job] of jobs.entries()) {
			if (job.description.includes(req.body.description)) {
				jobs.splice(idx, 1);
				await db.write();
				res.status(200).send('Entry successfully removed');
			}
		}
		res.send('Entry does not exist');
	} catch {
		// res.send('Entry does not exist');
	}
});

app.put('/markApplied', async (req, res) => {
	await db.read();
	const { jobs } = db.data;

	try {
		for (const job of jobs) {
			if (job.description.includes(req.body.description)) {
				if (req.body.applied === true) {
					res.status(200).send('Entry already marked as applied');
				} else {
					job.applied = true;
					await db.write();
					res.status(200).send('Entry successfully marked as applied');
				}
			}
		}
		res.send('Entry does not exist');
	} catch {
		// res.send('Entry does not exist');
	}
});

app.put('/unmarkApplied', async (req, res) => {
	await db.read();
	const { jobs } = db.data;

	try {
		for (const job of jobs) {
			if (job.description.includes(req.body.description)) {
				if (req.body.applied === false) {
					res.status(200).send('Entry already unmarked');
				} else {
					job.applied = false;
					await db.write();
					res.status(200).send('Entry successfully unmarked as applied');
				}
			}
		}
		res.send('Entry does not exist');
	} catch {
		// res.send('Entry does not exist');
	}
});

app.listen(PORT, () => console.log('App is listening on port: ' + PORT));

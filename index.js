import axios from 'axios';
import cheerio from 'cheerio';
import express from 'express';

const PORT = process.env.PORT || 3000;

const URL =
	'https://www.indeed.com/jobs?q=Web%20Developer&l=Dayton%2C%20OH&rqf=1&vjk=8e4cedd921cd6b58';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

axios(URL)
	.then((res) => {
		const htmlData = res.data;
		const $ = cheerio.load(htmlData);
		const jobData = [];

		$('.job_seen_beacon', htmlData).each((index, element) => {
			const title = $(element).find('.jobTitle').text();
			const companyName = $(element).find('.companyName').text();
			if (companyName !== 'Revature') {
				jobData.push({
					title,
					companyName,
				});
			}
		});
		console.log(jobData);
		console.log(jobData.length);
	})
	.catch((err) => console.log(err));

app.listen(PORT, () => console.log('App is listening on port: ' + PORT));

import axios from 'axios';
import cheerio from 'cheerio';

export const scrapeIndeed = async (queryParams) => {
	const indeedURL = 'https://www.indeed.com/';
	const { jobQuery, cityQuery, numberOfPages } = queryParams;

	// Combine the query strings and encode the Url
	let queryURL = indeedURL + 'jobs';
	queryURL += '?q=' + jobQuery;
	queryURL += '&l=' + cityQuery;

	const qURLEncoded = encodeURI(queryURL);

	const promises = [];
	const jobs = [];

	// indeed pages increment by 10. Store a promise with an axios call for each page
	for (let i = 0; i <= numberOfPages; i += 10) {
		promises.push(
			axios({ method: 'get', url: `${qURLEncoded}&start=${i}` })
				.then((response) => {
					const htmlData = response.data;
					const $ = cheerio.load(htmlData);

					$('#mosaic-provider-jobcards > a', htmlData).each((index, element) => {
						const title = $(element).find('.jobTitle > span').text().trim();
						const company = $(element).find('.companyName').text().trim();
						const location = $(element).find('.companyLocation').text().trim();
						const tags = $(element).find('.attribute_snippet').text().trim();
						const postDate = $(element).find('.date').text().trim();
						const description = $(element).find('.job-snippet > ul').text().trim();
						const linkToFullJob = $(element).attr('href');

						if (company !== 'Revature') {
							jobs.push({
								title: title,
								company: company,
								location: location,
								tags: tags,
								postDate: postDate,
								description: description,
								linkToFullJob: 'https://indeed.com' + linkToFullJob,
							});
						}
					});
				})
				.catch((err) => console.error(err))
		);
	}

	/**
	 * Run all of the promises in the promise array, Then return a promise with the job data
	 * back to the endpoint to be sent in a json response
	 */
	await Promise.all(promises);

	return new Promise((resolve, reject) => {
		resolve(jobs);
	});

	// setTimeout(() => {
	// 	Promise.all(promises);

	// }, 3000)
};

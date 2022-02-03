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
						const tags = $(element).find('.attribute_snippet').text();
						const description = $(element).find('.job-snippet > ul').text().trim();
						const linkToFullJob = $(element).attr('href');

						if (company !== 'Revature') {
							jobs.push({
								title: title,
								company: company,
								location: location,
								tags: tags,
								description: description,
								linkToFullJob: 'https://indeed.com' + linkToFullJob,
							});
						}
					});
					return jobs;
				})
				.catch((err) => console.error(err))
		);
	}

	// Run the axios calls from the promises array.
	// This resolves to a single promise containing the job data, which is returned to the endpoint,
	// Then the data is sent in a json response.
	return Promise.all(promises);
};

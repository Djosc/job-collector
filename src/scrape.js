import axios from 'axios';
import cheerio from 'cheerio';

export const jobData = [];

export const scrapeAndPush = (url) => {
	url = 'https://www.indeed.com' + url;
	axios(url).then((res) => {
		const htmlData = res.data;
		const $ = cheerio.load(htmlData);
		// console.log(url);

		$('.jobsearch-ViewJobLayout-jobDisplay', htmlData).each((index, element) => {
			const title = $(element)
				.find('.jobsearch-JobInfoHeader-title-container > h1')
				.text();

			const company = $(element)
				.find('.jobsearch-CompanyInfoContainer')
				.find('a')
				.first()
				.text();

			const location = $(element).find('.jobsearch-jobLocationHeader-location').text();

			const qualifications = $(element)
				.find('#jobDescriptionText')
				.find(
					'p:contains("qualifications"), p:contains("minimum"), p:contains("requirements")'
				)
				.text()
				.trim();
			// const description = $(element)
			// 	.find('#jobDescriptionText')
			// 	.find('p:contains("required")')
			// 	.text()
			// 	.trim();

			if (company !== 'Revature') {
				jobData.push({
					title,
					company,
					location,
					qualifications,
					// description,
				});
			}
		});
	});
};

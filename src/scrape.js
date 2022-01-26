import axios from 'axios';
import cheerio from 'cheerio';

export const jobData = [];

export const scrapeAndPush = (url, arrIndex) => {
	url = 'https://www.indeed.com' + url;
	axios(url).then((res) => {
		const htmlData = res.data;
		const $ = cheerio.load(htmlData);

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
			jobData.push({
				arrIndex,
				title,
				company,
				location,
			});
			console.log(title);
			console.log(company);
			console.log(location + '\n');
		});
	});
};

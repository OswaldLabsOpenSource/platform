const reader = require("./reader");

test("reading mode for example.com", () => {
	return reader
		.promise({ url: "https://example.com" })
		.then(data =>
			expect(JSON.stringify(data)).toEqual(
				'{"title":"Example Domain","author":null,"date_published":null,"dek":null,"lead_image_url":null,"content":"<div> <p>This domain is established to be used for illustrative examples in documents. You may use this domain in examples without prior coordination or asking for permission.</p> <p><a href=\"http://www.iana.org/domains/example\">More information...</a></p>\n</div>","next_page_url":null,"url":"https://example.com","domain":"example.com","excerpt":"This domain is established to be used for illustrative examples in documents. You may use this domain in examples without prior coordination or asking for permission. More information...","word_count":28,"direction":"ltr","total_pages":1,"rendered_pages":1}'
			)
		);
});

const AWS = require('aws-sdk');
const lambda = require('./synthesize');

const mockEvent = {
	"id": "aHR0cHM6Ly93d3cubWFkZXdpdGh0ZWEuY29tL21pbmltYWxpc20tdGhlLWFydC1vZi1saXZpbmctd2l0aC1sZXNzLmh0bWw%3D",
	"author": "Jendrik Poloczek",
	"published": "2017-01-28T10:58:03.961Z",
	"title": "Minimalism: The Art of Living with Less",
	"text": "In this article, I will give a short introduction into the minimalism also known as the simple living lifestyle. Minimalism is about reducing ones possessions. It is a voluntary lifestyle choice. Because I am a practitioner myself, I am highly motivated when writing about the lifestyle of living with less. It is a life-long journey. However, starting is easy and highly recommended. This quote is often-cited:\nA man is rich in proportion to the number of things which he can afford to let alone. Henry David Thoreau\nWe own countless things, other people could use, but we store it somewhere, just in case we want to get back to them or use them for the first time. It is a burden we do not want to face. But believe me, getting rid of unused things by selling or throwing them into the trash, is a relieving experience. It is about time to let go.\n"
};


const configFilePath = '../config.json';
const setConfig = () => {
	console.log("Setting AWS config");
	const config = AWS.config.loadFromPath(configFilePath);
	AWS.config.update(config);
	console.log("Config set!");
};


const callback = (error, success) => {
	if (error) {
		console.log(error);
	} else {
		console.log(JSON.stringify(success, null, 2));
	}
};

setConfig();
lambda.handler(mockEvent, null, callback);
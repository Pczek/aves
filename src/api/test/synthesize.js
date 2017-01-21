"use strict";
const AWS = require('aws-sdk');
const DynamoDB = require('aws-sdk/clients/dynamodb');
const S3 = require('aws-sdk/clients/s3');
const Polly = require('aws-sdk/clients/Polly');

const configFilePath = '../config.json';

const setConfig = () => {
	console.log("Setting AWS config");
	const config = AWS.config.loadFromPath(configFilePath);
	AWS.config.update(config);
	console.log("Config set!");
};

const synthesize = text => {
	const params = {
		OutputFormat: "mp3",
		SampleRate: "8000",
		Text: text,
		TextType: "text",
		VoiceId: "Joey"
	};

	const polly = new Polly();
	return polly.synthesizeSpeech(params).promise();
};

const saveAudioStream = (as, customer, resourceName) => {
	const bucket = "carrotbit.com";
	const key = `${customer}/${resourceName}.mp3`;
	const params = {
		Bucket: bucket,
		Key: key,
		ACL: "public-read",
		ContentType: "audio/mpeg",
		Body: as,
	};

	const s3 = new S3();
	return s3.upload(params).promise();
};

const addMappingItem = mapping => {
	const TableName = "mapping";
	const params = {
		TableName,
		Item: mapping,
	};

	var docClient = new DynamoDB.DocumentClient();
	return docClient.put(params).promise();
};

setConfig();

const callback = (error, success) => {
	if (error) {
		console.log(error);
	} else {
		console.log(JSON.stringify(success, null, 2));
	}
};

const handleError = error => {
	callback(error, null);
};

const URL = "https://www.madewithtea.com/mindfulness-in-the-culture-of-distraction.html";
// TODO: Extract CUSTOMER/ARTICLE from URL
const CUSTOMER = "madewithtea.com";
const ARTICLE = "mindfulness-in-the-culture-of-distraction";

synthesize("Hello, I have an awesome voice, don't you think?").then(data =>
	saveAudioStream(data.AudioStream, CUSTOMER, ARTICLE).then(data=>
		addMappingItem({
			url: URL,
			location: data.Location,
			customer: CUSTOMER
		}).then(data=>
			callback(null, {location: "location"})
		).catch(handleError)
	).catch(handleError)
).catch(handleError);
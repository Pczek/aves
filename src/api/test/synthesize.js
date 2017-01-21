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

const speak = text => {
	console.log("speak()");
	const params = {
		OutputFormat: "mp3",
		SampleRate: "8000",
		Text: text,
		TextType: "text",
		VoiceId: "Joey"
	};
	console.log(JSON.stringify(params, null, 2));
	const polly = new Polly();
	polly.synthesizeSpeech(params, (err, data)=> {
		console.log(JSON.stringify(err, null, 2));
		console.log(Object.keys(data));
		if (!err) {
			saveAudioFile(data.AudioStream, "madewithtea.com", "article_02.mp3");
		} else {
			console.log(err);
		}
	})
};

const saveAudioFile = (file, customer, resourceName) => {
	console.log("saveAudioFile()");
	const bucket = "carrotbit.com";
	const key = `${customer}/${resourceName}`;
	const params = {
		Bucket: bucket,
		Key: key,
		ACL: "public-read",
		ContentType: "audio/mpeg",
		Body: file,
	};
	const s3 = new S3();
	s3.upload(params, function (err, data) {
		if (err) {
			console.log(err)
		} else {
			console.log(JSON.stringify(data, null, 2));
			addMappingItem({
				url: "madewithtea.com/mindfulness-in-the-culture-of-distraction.html",
				location: data.Location,
				customer: customer
			})
		}
	});

};

const addMappingItem = mapping => {
	const TableName = "mapping";
	var docClient = new DynamoDB.DocumentClient();
	const params = {
		TableName,
		Item: mapping,
	};

	docClient.put(params).promise()
		.then(data=> {
			console.log("Mapping Saved:");
			console.log(JSON.stringify(data, null, 2));
		})
		.catch(err=> {
			console.log("Error While Saving Mapping");
			console.log(JSON.stringify(err, null, 2));
		});
};

setConfig();
speak("Hello, I have an awesome voice, don't you think?");

// addMappingItem({url: "example.com", location: "bucketId"});

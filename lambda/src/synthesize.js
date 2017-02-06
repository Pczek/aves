"use strict";
const DynamoDB = require('aws-sdk/clients/dynamodb');
const S3 = require('aws-sdk/clients/s3');
const Polly = require('aws-sdk/clients/polly');


const synthesize = text => {
	console.log("synthesizing Text with Polly");
	const params = {
		Text: text,
		OutputFormat: "mp3",
		SampleRate: "22050",
		TextType: "text",
		VoiceId: "Salli"
	};

	const polly = new Polly();
	return polly.synthesizeSpeech(params).promise();
};

const saveAudioStream = (audioStream, domain, resource) => {
	console.log("saving Audio Stream to S3");
	const bucket = "getaves.com";
	const key = domain + resource + ".mp3";
	const params = {
		Bucket: bucket,
		Key: key,
		ACL: "public-read",
		ContentType: "audio/mpeg",
		Body: audioStream,
	};

	const s3 = new S3();
	return s3.upload(params).promise();
};

const addMappingItem = mapping => {
	console.log("adding Mapping to Dynamo");
	const TableName = "mapping";
	const params = {
		TableName,
		Item: mapping,
	};

	const docClient = new DynamoDB.DocumentClient();
	return docClient.put(params).promise();
};

const handleError = (service, error, callback) => {
	console.error("An Error occurred using " + service);
	console.error("error", error);
	callback(error, null);
};

exports.handler = (event, context, callback) => {
	let location = null;
	// shorten text, max 1500 chars
	if (event.text.length > 1500) {
		event.text = event.text.substring(0, 1500);
	}
	synthesize(event.text).then(pollyData => {
		saveAudioStream(pollyData.AudioStream, event.host, event.resource).then(s3Data => {
			location = s3Data.Location;
			addMappingItem({
				url: event.host + event.resource,
				location: s3Data.Location,
				customer: event.host
			}).then(dynamoData => {
				const result = {location: location};
				console.log("Returning Result", JSON.stringify(result, null, 2));
				callback(null, result)
			}).catch(error => handleError("DynamoDB", error, callback))
		}).catch(error => handleError("S3", error, callback))
	}).catch(error => handleError("Polly", error, callback));
};
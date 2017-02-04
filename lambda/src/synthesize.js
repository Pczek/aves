"use strict";
const DynamoDB = require('aws-sdk/clients/dynamodb');
const S3 = require('aws-sdk/clients/s3');
const Polly = require('aws-sdk/clients/polly');


const synthesize = text => {
	console.log("synthesizing Text with Polly");
	const params = {
		Text: text,
		OutputFormat: "mp3",
		SampleRate: "8000",
		TextType: "text",
		VoiceId: "Joey"
	};

	const polly = new Polly();
	return polly.synthesizeSpeech(params).promise();
};

const saveAudioStream = (as, domain, resource) => {
	console.log("saving Audio Stream to S3");
	const bucket = "getaves.com";
	const key = `${domain}/${resource}.mp3`;
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
	console.log("adding Mapping to Dynamo");
	const TableName = "mapping";
	const params = {
		TableName,
		Item: mapping,
	};

	const docClient = new DynamoDB.DocumentClient();
	return docClient.put(params).promise();
};

const parseURL = rawURL => {
	console.log("parsing ID");
	const uriDecoded = decodeURIComponent(rawURL);
	const url = new Buffer(uriDecoded, 'base64').toString('ascii'); // reverse base64 encoding
	const regex = /https?\:\/\/(?:www\.)?([^\/?#]+)(?:[\/?#]|$)/i;
	const elements = url.match(regex);

	return {
		domain: elements[1],
		resource: url.replace(elements[0], ""),
		url: url
	};
};

const handleError = (service, error, callback) => {
	console.error("An Error occured using " + service);
	console.error("error", error);
	callback(error, null);
};

exports.handler = (event, context, callback) => {
	if (!event) {
		callback("No Event passed!", null);
	}

	const obj = parseURL(event.id);
	let location = null;
	console.log("Synthesizing text...");
	synthesize(event.text).then(pollyData => {
		console.log("Synthesizing success!");
		console.log("Saving AudioStream...");
		saveAudioStream(pollyData.AudioStream, obj.domain, obj.resource).then(s3Data => {
			console.log("Saving success!");
			console.log("Mapping Location and Id...");
			location = s3Data.Location;
			addMappingItem({
				url: obj.url,
				location: s3Data.Location,
				customer: obj.domain
			}).then(dynamoData => {
				console.log("Mapping success!");
				const result = {location: location};
				console.log("Returning Result", JSON.stringify(result, null, 2));
				callback(null, result)
			}).catch(error => handleError("DynamoDB", error, callback))
		}).catch(error => handleError("S3", error, callback))
	}).catch(error => handleError("Polly", error, callback));
};
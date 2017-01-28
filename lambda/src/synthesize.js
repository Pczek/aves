"use strict";
const DynamoDB = require('aws-sdk/clients/dynamodb');
const S3 = require('aws-sdk/clients/s3');
const Polly = require('aws-sdk/clients/polly');


const synthesize = text => {
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
	const TableName = "mapping";
	const params = {
		TableName,
		Item: mapping,
	};

	const docClient = new DynamoDB.DocumentClient();
	return docClient.put(params).promise();
};


const parseURL = rawURL => {
	const uriDecoded = decodeURIComponent(rawURL);
	const url = new Buffer(uriDecoded, 'base64').toString('ascii'); // reverse base64 encoding
	console.log('url', url);
	const regex = /https?\:\/\/(?:www\.)?([^\/?#]+)(?:[\/?#]|$)/i;
	const elements = url.match(regex);

	return {
		domain: elements[1],
		resource: url.replace(elements[0], ""),
		url: url
	};
};

const handleError = (error, callback)=> {
	callback(error, null);
};

exports.handler = (event, context, callback) => {
	if (!event) {
		callback("No Event passed!", null);
	}
	const obj = parseURL(event.id);
	let location = null;
	synthesize(event.text).then(pollyData =>
		saveAudioStream(pollyData.AudioStream, obj.domain, obj.resource).then(s3Data=> {
				location = s3Data.Location;
				addMappingItem({
					url: obj.url,
					location: s3Data.Location,
					customer: obj.domain
				}).then(dynamoData=>
					callback(null, {location: location})
				).catch(error => handleError(error, callback))
			}
		).catch(error => handleError(error, callback))
	).catch(error => handleError(error, callback));
};
"use strict";
const DynamoDB = require('aws-sdk/clients/dynamodb');
const S3 = require('aws-sdk/clients/s3');
const Polly = require('aws-sdk/clients/polly');

const DYNAMO_TABLE = "mapping";

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
	const params = {
		TableName: DYNAMO_TABLE,
		Item: mapping,
	};

	const docClient = new DynamoDB.DocumentClient();
	return docClient.put(params).promise();
};

const getMappingItem = url => {
	console.log("get Mapping from Dynamo");
	const params = {
		TableName: DYNAMO_TABLE,
		Key: {
			"url": url
		}
	};
	const docClient = new DynamoDB.DocumentClient();
	return docClient.get(params).promise();
};

const increasePlayCount = item => {
	console.log(`updating play count of '${item.url}'`);
	const params = {
		TableName: DYNAMO_TABLE,
		Key: {
			"url": item.url
		},
		UpdateExpression: "set plays = plays + :val, updated=:u",
		ExpressionAttributeValues: {
			":val": 1,
			":u": new Date().toISOString()
		},
		ReturnValues: "UPDATED_NEW"
	};
	const docClient = new DynamoDB.DocumentClient();
	return docClient.update(params).promise();
};

const isEmpty = obj => {
	return Object.keys(obj).length === 0;
};

const handleError = (service, error, callback) => {
	console.error("An Error occurred using " + service);
	console.error("error", error);
	callback(error, null);
};

const handleGetRequest = (event, callback) => {
	console.log("Handling GET Request");

	getMappingItem(`${event.host}${event.resource}`).then(result => {
		if (!isEmpty(result)) {
			if (result.Item.location) {
				increasePlayCount(result.Item).then(dynamoData => {
					console.log(`updated: ${dynamoData.Attributes.updated}`);
				}).catch(error => handleError("DynamoDB", error, callback));
				callback(null, {location: result.Item.location})
			}
		} else {
			callback("No Mapping found")
		}
	}).catch(error => handleError("DynamoDB", error, callback));
};

const handlePostRequest = (event, callback) => {
	console.log("Handling POST Request");

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
				customer: event.host,
				plays: 1, // this is the first play
				location: s3Data.Location,
				created: new Date().toISOString(),
			}).then(dynamoData => {
				const result = {location: location};
				console.log("Returning Result", JSON.stringify(result, null, 2));
				callback(null, result)
			}).catch(error => handleError("DynamoDB", error, callback))
		}).catch(error => handleError("S3", error, callback))
	}).catch(error => handleError("Polly", error, callback));
};

exports.handler = (event, context, callback) => {

	switch (event.http_method) {
		case "GET":
			handleGetRequest(event, callback);
			break;
		case "POST":
			handlePostRequest(event, callback);
			break;
		default:
			callback("not yet implemented")
	}

};
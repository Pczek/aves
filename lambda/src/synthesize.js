"use strict";
const DynamoDB = require("aws-sdk/clients/dynamodb");
const S3 = require("aws-sdk/clients/s3");
const Polly = require("aws-sdk/clients/polly");
const crypto = require("crypto");

const DYNAMO_TABLE = "mapping";
const S3_BUCKET = "aves-audiodata";

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

const saveAudioStream = (audioStream, domain, resource, partNo) => {
	console.log("saving Audio Stream to S3");
	const key = `${domain}${resource}.part${partNo}.mp3`;
	const params = {
		Bucket: S3_BUCKET,
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
	console.log(`get Mapping from Dynamo: "${url}"`);
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
	console.log(`updating play count of "${item.url}"`);
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

const digestText = text => {
	const hash = crypto.createHash("md5");
	hash.update(new Buffer(text.join(""), "utf8"));
	return hash.digest("hex");
};

const handleGetRequest = (event, callback) => {
	console.log("Handling GET Request");

	getMappingItem(`${event.host}${event.resource}`).then(result => {
		if (!isEmpty(result)) {
			console.log("result", result);
			if (result.Item.locations) {
				increasePlayCount(result.Item).then(dynamoData => {
					console.log(`updated: ${dynamoData.Attributes.updated}`);
				}).catch(error => handleError("DynamoDB", error, callback));
				callback(null, {
					hash: result.Item.hash,
					player_version: result.Item.player_version || 1,
					locations: result.Item.locations
				})
			}
		} else {
			callback("No Mapping found")
		}
	}).catch(error => handleError("DynamoDB", error, callback));
};

const handlePostRequest = (event, callback) => {
	console.log("Handling POST Request");

	Promise.all(event.text.map(part => synthesize(part))).then(pollyResults => {
		Promise.all(
			pollyResults.map((pollyData, partNo) => saveAudioStream(pollyData.AudioStream, event.host, event.resource, partNo))
		).then(s3Results => {
			const locations = s3Results.map(s3Data => s3Data.Location);
			const hash = digestText(event.text);
			const player_version = event.player_version;
			addMappingItem({
				url: event.host + event.resource,
				hash: hash,
				player_version: player_version,
				customer: event.host,
				plays: 1, // this is the first play
				locations: locations,
				created: new Date().toISOString(),
			}).then(dynamoData => {
				const result = {
					hash: hash,
					player_version: player_version,
					locations: locations
				};
				callback(null, result)
			}).catch(dynamoError => handleError("DynamoDB", dynamoError, callback));
		}).catch(s3Errors => handleError("S3", s3Errors, callback));
	}).catch(pollyErrors => handleError("Polly", pollyErrors, callback));
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
const AWS = require('aws-sdk');
const lambda = require('./synthesize');

const mockEvent = {
	"http_method": "POST",
	"host": "localhost",
	"resource": "/aves/player/Blogging.html",
	"text": [
		"Blogging Tips, I Wish I Knew When I Started",
		"Tue 07 February 2017",
		"- 5 min read\nIt's simple. Start to write and put it online, the rest will follow. However, if you are willing to learn or to get inspired by my experiences I am going to write about, get focussed and soak it in. I'll cover motivation, writing process, content, tools, audience, and marketing. I want to share concrete tips and action points with which you can start right away. It is important for me to set realistic expectations since there is a lot of optimistic marketing bullshit out there. First of all, let's begin with a big \"Why?\".",
		"Motivation\nMaybe you love writing stories, maybe you want to share your first-hand expert knowledge or maybe you just want state your opinion on things. Whatever it is, ask yourself the question \"Why do I want to start a blog?\". You could do other things, grabbing low hanging fruits and such. What I am trying to say is, have your reason to start writing and let it become your mantra.\nAnother essential question is: \"What is my relation to the audience?\". Are you a storyteller, mediator of facts, or a writer who has an intimate relationship with his or her audience. I casually jump from one to the other, it depends on the topic. I started out, because I wanted to improve writing and English. Besides, I like to share first-hand knowledge on programming.\nRoughly five years later I stuck to it, plus, I enjoy myself writing this now on my OLKB Preonic with Cherry MX blues - props to the typists out there. Strong consumer and weak producer, sounds familiar? Let's try to change this."
	]
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
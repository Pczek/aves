import ReactDOM from "react-dom";
import React, {
	Component,
	PropTypes,
} from "react";
import reqwest from "reqwest";
import Readability from "readability";
import dynamics from "dynamics.js";

class AvesPlayer extends Component {
	static propTypes = {
		fill: PropTypes.bool,
		activeColor: PropTypes.string,
		inActiveColor: PropTypes.string,
	};
	static defaultProps = {
		fill: false,
		activeColor: "#000000",
		inActiveColor: "#EEEEEE"
	};

	static POLLY_MAX_CHARS = 1500;
	static API_URL = "https://svbdwjhyck.execute-api.eu-west-1.amazonaws.com/development/audio";

	static biteSize = part => {
		if (part.length < AvesPlayer.POLLY_MAX_CHARS + 1) {
			return part;
		}
		console.log("biteSizing:", part.slice(0, 15));
		const length = part.length;
		const subPartsAmount = Math.ceil(length / AvesPlayer.POLLY_MAX_CHARS);
		const sentences = part.split(". ");
		const chunkSize = sentences.length / subPartsAmount;
		let subParts = [];

		//TODO not the best implementation yet, because it does not take into account the amount of subParts it should be. Thereby the length of the last part varies!
		for (let subPartIndex = 0; subPartIndex < subPartsAmount; subPartIndex++) {
			subParts[subPartIndex] = []; //initialize each subPart
			while (sentences[0] && (subParts[subPartIndex].map(sp => sp.length).reduce((a, b) => a + b, 0) + sentences[0].length) < AvesPlayer.POLLY_MAX_CHARS) {
				subParts[subPartIndex] = subParts[subPartIndex].concat(sentences.splice(0, 1));
			}
			subParts[subPartIndex] = subParts[subPartIndex].join(". ");
		}

		return subParts;
	};

	constructor(props) {
		super(props);
		this.state = {
			locations: null,
			ready: false,
			isPlaying: false,
		};
	}

	componentDidMount() {
		// 0. Check if Article on Current Page
		const article = new Readability({}, document.cloneNode(true)).parse();
		if (article) {
			console.log("Article found");

			const onSuccess = locations => {
				this.setState({
					locations: locations,
					ready: true,
				}, () => {
					this.feedPlayer();
					console.log("this.audioPlayer", this.audioPlayer);
					this.audioPlayer.addEventListener("ended", this.feedPlayer);
					this.animateReady();
				});
			};

			// 1. Check if Audio is already available
			this.requestAudio().then(onSuccess).catch(error => {
				console.log("request error:", error);
				// 2. Synthesize Audio if not Available
				this.synthesizeAudio(article).then(onSuccess).catch(error => {
					console.log("synth error:", error);
				});
			});
		} else {
			console.log("no article found");
		}
	}

	requestAudio = () => {
		console.log("Requesting Audio...");
		return new Promise((resolve, reject) => {
			const getPayload = {
				"host": encodeURIComponent(btoa(document.location.hostname)),
				"resource": encodeURIComponent(btoa(document.location.pathname)),
			};
			reqwest({
				url: AvesPlayer.API_URL,
				method: "GET",
				contentType: "application/json",
				crossOrigin: true,
				data: getPayload,
			}).fail((error, message) => {
				console.log("An Error occurred");
				console.log("error", error);
				console.log("message", message);
				reject(error);
			}).then(response => {
				console.log("Response arrived");
				console.log("response", response);

				//TODO Work around for wrong HTTP status codes from API Gateway #26
				if (response.locations) {
					resolve(response.locations);
				} else {
					reject(response.errorMessage)
				}
			});
		})
	};

	synthesizeAudio = article => {
		return new Promise((resolve, reject) => {
			// Preparing Text to synthesize
			// split article into lines
			const lineList = article.textContent.trim().split('\n').map(line => line.trim()).filter(line => line.length);
			// concat lines into parts
			let parts = [];
			let partNo = 0;
			lineList.forEach((line, index) => {
				if (index == 0) {
					parts[partNo] = line;
				} else {
					if (line.includes(".")) {
						parts[partNo] = parts[partNo] + `\n${line}`
					} else {
						partNo += 1;
						// TODO add SSML Break because new section. Break before new heading and afterwards!
						parts[partNo] = line
					}
				}
			});
			parts.unshift(article.title);

			// chunk too long parts
			parts = parts.map(part => AvesPlayer.biteSize(part)).reduce((acc, cur) => acc.concat(cur), []);

			// Packing POST Payload
			const payload = {
				"host": document.location.hostname,
				"resource": document.location.pathname,
				"text": parts,
			};
			console.log("Payload packed", payload);

			// Calling Lambda Function
			console.log("making a synth request");
			reqwest({
				url: AvesPlayer.API_URL,
				method: "POST",
				contentType: "application/json",
				crossOrigin: true,
				data: JSON.stringify(payload),
			}).fail((error, message) => {
				console.log("An Error occurred");
				console.log("error", error);
				console.log("message", message);
				reject(error);
			}).then(response => {
				console.log("Response arrived");
				console.log("response", response);
				//TODO Work around for wrong HTTP status codes from API Gateway #26
				if (response.locations) {
					resolve(response.locations);
				} else {
					reject(response.errorMessage)
				}
			});

		})
	};

	feedPlayer = () => {
		const {locations} = this.state;
		const currentlyPlaying = this.audioPlayer.src;
		if (currentlyPlaying) {
			console.log("currentlyPlaying", currentlyPlaying);
			const upNextIndex = locations.findIndex(location => location == currentlyPlaying) + 1;
			if (upNextIndex < locations.length) {
				// insert record
				this.audioPlayer.src = locations[upNextIndex];
				// starting new record
				this.audioPlayer.play();
				return;
			} else {
				// last part was played return to paused status
				this.animatePause();
				this.setState({
					isPlaying: false,
				});
			}
		}
		this.audioPlayer.src = locations[0];
	};

	animateReady = () => {
		const {activeColor} = this.props;
		dynamics.animate(this.triangle, {
			rotateZ: 90,
			stroke: activeColor,
			fill: activeColor,
		}, {
			type: dynamics.spring,
			friction: 400,
			duration: 1300
		});
	};
	animatePlaying = () => {

		dynamics.animate(this.triangle, {
			rotateZ: 180,
		}, {
			type: dynamics.spring,
			friction: 400,
			duration: 1300
		});
	};

	animatePause = () => {
		dynamics.animate(this.triangle, {
			rotateZ: 90,
		}, {
			type: dynamics.spring,
			friction: 400,
			duration: 1300
		});
	};

	onClick = event => {
		event.preventDefault();
		if (this.audioPlayer) {
			const {isPlaying} = this.state;
			if (isPlaying) {
				console.log("pausing");
				this.animatePause();
				this.audioPlayer.pause();
			} else {
				console.log("isPlaying");
				this.animatePlaying();
				this.audioPlayer.play();
			}
			this.setState({
				isPlaying: !isPlaying,
			})
		}
	};

	render() {
		const {inActiveColor, fill} = this.props;
		const {locations} = this.state;
		const styles = {
			container: {
				position: "absolute",
				top: "1em",
				left: "1em",
			}
		};
		return (
			<div style={styles.container}>
				<svg
					ref={triangle => this.triangle = triangle}
					onClick={locations ? this.onClick : null}
					stroke={inActiveColor}
					strokeWidth="6"
					fill={inActiveColor}
					fillOpacity={fill ? 1 : 0}
					strokeLinecap="butt"
					width="50"
					height="50"
					viewBox="5 5 95 95"
				>
					<path d="M 10 90 L 90 90 L 50 20 z" />
				</svg>

				<audio ref={audioElement => this.audioPlayer = audioElement} />
			</div>
		);
	}
}

const aves = (anchorEl, settings) => {
	console.log("settings", settings);
	if (!anchorEl) {
		anchorEl = document.createElement("div");
		document.body.appendChild(anchorEl);
	}
	ReactDOM.render(
		<AvesPlayer inActiveColor={settings.inActiveColor} fill={settings.fill} />,
		anchorEl
	);
};

window.Aves = aves;

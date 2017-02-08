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

	static API_URL = "https://svbdwjhyck.execute-api.eu-west-1.amazonaws.com/development/audio";

	constructor(props) {
		super(props);
		this.state = {
			location: null,
			playing: false,
		};

	}

	componentDidMount() {
		const doRequest = false;

		// 0. Check if Article on Current Page
		const article = new Readability({}, document.cloneNode(true)).parse();
		if (!article) {
			return;
		}
		console.log("Article found");

		// 1. Check if Audio is already available
		const getPayload = {
			"host": encodeURIComponent(btoa(document.location.hostname)),
			"resource": encodeURIComponent(btoa(document.location.pathname)),
		};
		if (doRequest) {
			reqwest({
				url: AvesPlayer.API_URL,
				method: "GET",
				contentType: "application/json",
				crossOrigin: true,
				data: getPayload,
			}).fail((error, message) => {
				console.log("An Error occured");
				console.log("error", error);
				console.log("message", message);
			}).then(response => {
				console.log("Response arrived");
				console.log("response", response);

			});
		}


		// 3. Packing Payload
		const payload = {
			"host": document.location.hostname,
			"resource": document.location.pathname,
			"title": article.title,
			"text": article.textContent.trim(),
		};
		console.log("Payload packed", payload);

		// 4. Calling Lambda Function
		if (doRequest) {
			reqwest({
				url: AvesPlayer.API_URL,
				method: "POST",
				contentType: "application/json",
				crossOrigin: true,
				data: JSON.stringify(payload),
			}).fail((error, message) => {
				console.log("An Error occured");
				console.log("error", error);
				console.log("message", message);
			})
			// 5. Adding Result to Player
				.then(response => {
					console.log("Response arrived");
					console.log("response", response);
					this.setState({
						location: response.location,
					});
					this.audioPlayer.src = response.location;
					this.setState({
						ready: true,
					});
					this.animateReady();
				});
		}
	}

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
			if (this.state.playing) {
				console.log("pausing");
				this.animatePause();
				this.audioPlayer.pause();
			} else {
				console.log("playing");
				this.animatePlaying();
				this.audioPlayer.play();
			}
			this.setState({
				playing: !this.state.playing,
			})
		}
	};

	render() {
		const {inActiveColor, fill} = this.props;
		const {location} = this.state;
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
					onClick={location ? this.onClick : null}
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

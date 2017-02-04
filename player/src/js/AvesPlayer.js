import ReactDOM from "react-dom";
import React, {
	Component,
	PropTypes,
} from "react";
import reqwest from "reqwest";
import Readability from "readability";

class AvesPlayer extends Component {

	static API_URL = "https://svbdwjhyck.execute-api.eu-west-1.amazonaws.com/development/audio";

	constructor(props) {
		super(props);
		this.state = {
			location: null,
			playing: false,
		}
	}

	componentDidMount() {
		// 1. Check if Audio is already available
		// 2. Extract Article from Current Page
		const article = new Readability({}, document.cloneNode(true)).parse();
		if (!article) {
			return;
		}
		console.log("Article found");

		// 3. Packing Payload
		const payload = {
			"host": document.location.hostname,
			"resource": document.location.pathname,
			"title": article.title,
			"text": article.textContent.trim(),
		};
		console.log("Payload packed", payload);

		// 4. Calling Lambda Function
		if (true) {
			reqwest({
				url: AvesPlayer.API_URL,
				method: "POST",
				contentType: 'application/json',
				crossOrigin: true,
				data: JSON.stringify(payload),
			})
				.fail((error, message) => {
					console.log("An Error occured");
					console.log('error', error);
					console.log('message', message);
				})
				// 5. Adding Result to Player
				.then(response => {
					console.log("Response arrived");
					console.log('response', response);
					this.setState({
						location: response.location,
					});
					this.audioPlayer.src = response.location;
				});
		}
	}

	onClick = event => {
		event.preventDefault();
		if (this.audioPlayer) {
			if (this.state.playing) {
				console.log("pausing");

				this.audioPlayer.pause();
			} else {
				console.log("playing");
				this.audioPlayer.play();
			}
			this.setState({
				playing: !this.state.playing,
			})
		}
	};

	render() {
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
				<svg onClick={this.onClick} width="64" height="64" fill="#000000">
					<path d="M 0 0 L 55 32 L 0 64 z" />
				</svg>

				<audio ref={audioElement => this.audioPlayer = audioElement} />
			</div>
		);
	}
}
export default AvesPlayer;

const PlayerAnchor = document.createElement('div');
document.body.appendChild(PlayerAnchor);
ReactDOM.render(
	<AvesPlayer />,
	PlayerAnchor
);
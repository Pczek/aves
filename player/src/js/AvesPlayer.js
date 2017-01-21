import ReactDOM from "react-dom";
import React, {
	Component,
	PropTypes,
} from "react";

class AvesPlayer extends Component {

	constructor(props) {
		super(props);
	}

	componentWillMount() {
	}


	componentDidMount() {

	}

	onClick = event =>{
		event.preventDefault();
		console.log("Starting Playback");
	};

	render() {
		const styles = {
			container: {
				position: "absolute",
				top: "1em",
				left: "1em",
			}
		};
		return (
			<div style={styles.container}>
				<svg onClick={this.onClick} width="270" height="240">
					<path d="M5,5H265L135,230"/>
				</svg>
			</div>
		);
	}
}
export default AvesPlayer;

const PlayerAnchor = document.createElement('div');
document.body.appendChild(PlayerAnchor);
ReactDOM.render(
	<AvesPlayer/>,
	PlayerAnchor
);
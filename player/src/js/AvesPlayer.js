import ReactDOM from 'react-dom'
import React, {
  Component,
  PropTypes,
} from 'react'
import reqwest from 'reqwest'
import Readability from 'readability'
import dynamics from 'dynamics.js'
import { createHash } from 'crypto'
import bopsFrom from 'bops/from'

class AvesPlayer extends Component {
  static VERSION = 1.0

  static propTypes = {
    size: PropTypes.number,
    fill: PropTypes.bool,
    color: PropTypes.string,
    inactiveColor: PropTypes.string,
    apiKey: PropTypes.string,
    autoPlay: PropTypes.bool,
  }

  static defaultProps = {
    size: 30,
    fill: true,
    color: '#000000',
    inactiveColor: '#EEEEEE',
    apiKey: '',
    autoPlay: false,
  }

  static POLLY_MAX_CHARS = 1500
  static API_URL = 'https://svbdwjhyck.execute-api.eu-west-1.amazonaws.com/development/audio'

  static biteSize = part => {
    if (part.length < AvesPlayer.POLLY_MAX_CHARS + 1) {
      return part
    }
    console.log('biteSizing:', part.slice(0, 15))
    const length = part.length
    const subPartsAmount = Math.ceil(length / AvesPlayer.POLLY_MAX_CHARS)
    const sentences = part.split('. ')
    const chunkSize = sentences.length / subPartsAmount
    let subParts = []

    //TODO not the best implementation yet, because it does not take into account the amount of subParts it should be. Thereby the length of the last part varies!
    for (let subPartIndex = 0; subPartIndex < subPartsAmount; subPartIndex++) {
      subParts[subPartIndex] = [] //initialize each subPart
      while (sentences[0] && (subParts[subPartIndex].map(sp => sp.length).reduce((a, b) => a + b, 0) + sentences[0].length) < AvesPlayer.POLLY_MAX_CHARS) {
        subParts[subPartIndex] = subParts[subPartIndex].concat(sentences.splice(0, 1))
      }
      subParts[subPartIndex] = subParts[subPartIndex].join('. ')
    }

    return subParts
  }

  constructor (props) {
    super(props)
    this.state = {
      locations: null,
      ready: false,
      isPlaying: false,
    }
  }

  componentDidMount () {
    // 0. Check if Article on Current Page
    const article = new Readability({}, document.cloneNode(true)).parse()
    if (article) {
      console.log('Article found')
      const text = this.prepareText(article)
      const hash = this.digestText(text)

      const onSuccess = locations => {
        this.setState({
          locations: locations,
          ready: true,
        }, () => {
          this.feedPlayer()
          this.audioPlayer.addEventListener('ended', this.feedPlayer)
          this.animateReady(this.props.autoPlay ? () => {
            this.onClick(null)
          } : () => {
          })
        })
      }

      // 1. Check if Audio is already available
      this.requestAudio(hash).then(onSuccess).catch(error => {
        console.log('Error during AUDIO request:', error)
        // 2. Synthesize Audio if not Available
        this.synthesizeAudio(text).then(onSuccess).catch(error => {
          console.log('Error during SYNTH request:', error)
        })
      })
    } else {
      console.info('No article found. Your text might be to short.')
    }
  }

  digestText = text => {
    const hash = createHash('md5')
    hash.update(bopsFrom(text.join(''), 'utf8'))
    return hash.digest('hex')
  }

  requestAudio = hash => {
    console.log('Requesting Audio...')
    return new Promise((resolve, reject) => {
      const getPayload = {
        'host': encodeURIComponent(btoa(document.location.hostname)),
        'resource': encodeURIComponent(btoa(document.location.pathname)),
      }
      reqwest({
        url: AvesPlayer.API_URL,
        method: 'GET',
        contentType: 'application/json',
        crossOrigin: true,
        data: getPayload,
      }).fail((error, message) => {
        console.log('An Error occurred')
        console.log('error', error)
        console.log('message', message)
        reject(error)
      }).then(response => {
        console.log('Response arrived')
        console.log('response', response)

        //TODO Work around for wrong HTTP status codes from API Gateway #26
        if (response.locations && response.hash) {
          if (response.hash === hash && response.player_version === AvesPlayer.VERSION) {
            resolve(response.locations)
          } else {
            console.log('hash or version is different!')
            reject('article changed')
          }
        } else {
          reject(response.errorMessage)
        }
      })
    })
  }

  prepareText = article => {
    // Preparing Text to synthesize
    // split article into lines
    const lineList = article.textContent.trim().split('\n').map(line => line.trim()).filter(line => line.length)
    // concat lines into parts
    let parts = []
    let partNo = 0
    lineList.forEach((line, index) => {
      if (index === 0) {
        parts[partNo] = line
      } else {
        if (line.includes('.')) {
          parts[partNo] = parts[partNo] + `\n${line}`
        } else {
          partNo += 1
          // TODO add SSML Break because new section. Break before new heading and afterwards!
          parts[partNo] = line
        }
      }
    })
    parts.unshift(article.title)

    // chunk too long parts
    return parts.map(part => AvesPlayer.biteSize(part)).reduce((acc, cur) => acc.concat(cur), [])
  }

  synthesizeAudio = text => {
    return new Promise((resolve, reject) => {
      // Packing POST Payload
      const payload = {
        'host': document.location.hostname,
        'player_version': AvesPlayer.VERSION,
        'resource': document.location.pathname,
        'text': text,
      }
      console.log('Payload packed', payload)

      // Calling Lambda Function
      console.log('making a synth request')
      reqwest({
        url: AvesPlayer.API_URL,
        method: 'POST',
        contentType: 'application/json',
        crossOrigin: true,
        headers: {
          'x-api-key': this.props.apiKey,
        },
        data: JSON.stringify(payload),
      }).fail((error, message) => {
        console.log('An Error occurred')
        console.log('error', error)
        console.log('message', message)
        reject(error)
      }).then(response => {
        console.log('Response arrived')
        console.log('response', response)
        //TODO Work around for wrong HTTP status codes from API Gateway #26
        if (response.locations) {
          resolve(response.locations)
        } else {
          reject(response.errorMessage)
        }
      })
    })
  }

  feedPlayer = () => {
    const {locations} = this.state
    const currentlyPlaying = this.audioPlayer.src
    if (currentlyPlaying) {
      console.log('currentlyPlaying', currentlyPlaying)
      const upNextIndex = locations.findIndex(location => location === currentlyPlaying) + 1
      if (upNextIndex < locations.length) {
        // insert record
        this.audioPlayer.src = locations[upNextIndex]
        // starting new record
        this.audioPlayer.play()
        return
      } else {
        // last part was played return to paused status
        this.animatePause()
        this.setState({
          isPlaying: false,
        })
      }
    }
    this.audioPlayer.src = locations[0]
  }

  animateReady = callback => {
    const {color} = this.props
    dynamics.animate(this.triangle, {
      rotateZ: 0,
      stroke: color,
      fill: color,
    }, {
      type: dynamics.spring,
      friction: 400,
      duration: 2500,
      complete: callback,
    })
  }
  animatePlaying = callback => {

    dynamics.animate(this.triangle, {
      rotateZ: 90,
    }, {
      type: dynamics.spring,
      friction: 400,
      duration: 1300,
      complete: callback,
    })
  }

  animatePause = callback => {
    dynamics.animate(this.triangle, {
      rotateZ: 0,
    }, {
      type: dynamics.spring,
      friction: 400,
      duration: 1300,
      complete: callback,
    })
  }

  onClick = (event = null) => {
    if (event !== null) {
      event.preventDefault()
    }
    if (this.audioPlayer) {
      const {isPlaying} = this.state
      if (isPlaying) {
        this.animatePause()
        this.audioPlayer.pause()
      } else {
        this.animatePlaying()
        this.audioPlayer.play()
      }
      this.setState({
        isPlaying: !isPlaying,
      })
    }
  }

  render () {
    const {size, inactiveColor, fill} = this.props
    const {locations} = this.state
    const styles = {
      container: {
        width: size,
        height: size,
      },
      player: {}
    }
    return (
      <div style={styles.container}>
        <svg
          ref={triangle => this.triangle = triangle}
          onClick={locations ? this.onClick : null}
          stroke={inactiveColor}
          strokeWidth="6"
          fill={inactiveColor}
          fillOpacity={fill ? 1 : 0}
          strokeLinecap="butt"
          width={size}
          height={size}
          viewBox="0 0 100 100"
        >
          <polygon points="9.459 95.219,87.781 50, 9.459 4.781" />
        </svg>

        <audio ref={audioElement => this.audioPlayer = audioElement} />
      </div>
    )
  }
}

/**
 * Aves Initializing Call exposed to Window
 * @param anchorEl element the player will be attached to
 * @param settings object containing settings concerning the player
 * @param apiKey API Gateway key to use, uses default trial key
 */
const aves = (anchorEl = null, settings = {}, apiKey = 'jT3gkpqB949wMOj8H6h0i5AtYya8lrA66Z2ft2LJ') => {
  // Log some debug information
  console.log('anchorEl', anchorEl)
  console.log('settings', settings)
  console.log('apiKey', apiKey)

  if (!anchorEl) { // handle missing anchor element
    anchorEl = document.createElement('div')
    anchorEl.style.position = 'fixed'
    anchorEl.style.top = '1em'
    anchorEl.style.right = '1em'
    document.body.insertBefore(anchorEl, document.body.firstChild)
  } else { // prepare given anchor element
    // adjust styling to position player properly
    anchorEl.style.display = 'flex'
    anchorEl.style.flexDirection = 'row'
    anchorEl.style.justifyContent = 'center'
    let positionValue = 'center'
    if (settings.position) {
      switch (settings.position) {
        case 'top':
          positionValue = 'flex-start'
          break
        case 'bottom':
          positionValue = 'flex-end'
          break
      }
    }
    anchorEl.style.alignItems = positionValue
  }

  // Attaching Player to DOM
  ReactDOM.render(
    <AvesPlayer
      color={settings.color}
      inactiveColor={settings.inactiveColor}
      size={settings.size}
      fill={settings.fill}
      autoPlay={settings.autoPlay}
      apiKey="jT3gkpqB949wMOj8H6h0i5AtYya8lrA66Z2ft2LJ"
    />,
    anchorEl
  )
}

// Expose Function to Window
window.Aves = aves

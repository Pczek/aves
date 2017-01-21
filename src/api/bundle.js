/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(1);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var AWS = __webpack_require__(2);

	var configFilePath = '../config.json';

	var setConfig = function setConfig() {
		console.log("Setting AWS config");
		var config = AWS.config.loadFromPath(configFilePath);
		AWS.config.update(config);
		console.log("Config set!");
	};

	var addMappingItem = function addMappingItem(mapping) {
		var TableName = "mapping";
		var docClient = new AWS.DynamoDB.DocumentClient();
		var params = {
			TableName: TableName,
			Item: mapping
		};

		docClient.put(params, function (err, data) {
			if (err) {
				console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
			} else {
				console.log("Added item:", JSON.stringify(data, null, 2));
			}
		});
	};

	setConfig();

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(3);

	var AWS = __webpack_require__(5);

	// Load all service classes
	__webpack_require__(148);
	module.exports = AWS;


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	var util = __webpack_require__(4);

	// node.js specific modules
	util.crypto.lib = __webpack_require__(108);
	util.Buffer = __webpack_require__(125).Buffer;
	util.domain = __webpack_require__(126);
	util.stream = __webpack_require__(127);
	util.url = __webpack_require__(128);
	util.querystring = __webpack_require__(129);

	var AWS = __webpack_require__(5);

	// Use default API loader function
	__webpack_require__(94);

	// Load the xml2js XML parser
	AWS.XML.Parser = __webpack_require__(130);

	// Load Node HTTP client
	__webpack_require__(138);

	// Load custom credential providers
	__webpack_require__(141);
	__webpack_require__(143);
	__webpack_require__(144);
	__webpack_require__(145);
	__webpack_require__(146);

	// Setup default chain providers
	// If this changes, please update documentation for
	// AWS.CredentialProviderChain.defaultProviders in
	// credentials/credential_provider_chain.js
	AWS.CredentialProviderChain.defaultProviders = [
	  function () { return new AWS.EnvironmentCredentials('AWS'); },
	  function () { return new AWS.EnvironmentCredentials('AMAZON'); },
	  function () { return new AWS.SharedIniFileCredentials(); },
	  function () {
	    if (AWS.ECSCredentials.prototype.getECSRelativeUri() !== undefined) {
	      return new AWS.ECSCredentials();
	    }
	    return new AWS.EC2MetadataCredentials();
	  }
	];

	// Update configuration keys
	AWS.util.update(AWS.Config.prototype.keys, {
	  credentials: function () {
	    var credentials = null;
	    new AWS.CredentialProviderChain([
	      function () { return new AWS.EnvironmentCredentials('AWS'); },
	      function () { return new AWS.EnvironmentCredentials('AMAZON'); },
	      function () { return new AWS.SharedIniFileCredentials({ disableAssumeRole: true }); }
	    ]).resolve(function(err, creds) {
	      if (!err) credentials = creds;
	    });
	    return credentials;
	  },
	  credentialProvider: function() {
	    return new AWS.CredentialProviderChain();
	  },
	  region: function() {
	    return process.env.AWS_REGION || process.env.AMAZON_REGION;
	  }
	});

	// Reset configuration
	AWS.config = new AWS.Config();


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	/* eslint guard-for-in:0 */
	var AWS;

	/**
	 * A set of utility methods for use with the AWS SDK.
	 *
	 * @!attribute abort
	 *   Return this value from an iterator function {each} or {arrayEach}
	 *   to break out of the iteration.
	 *   @example Breaking out of an iterator function
	 *     AWS.util.each({a: 1, b: 2, c: 3}, function(key, value) {
	 *       if (key == 'b') return AWS.util.abort;
	 *     });
	 *   @see each
	 *   @see arrayEach
	 * @api private
	 */
	var util = {
	  engine: function engine() {
	    if (util.isBrowser() && typeof navigator !== 'undefined') {
	      return navigator.userAgent;
	    } else {
	      var engine = process.platform + '/' + process.version;
	      if (process.env.AWS_EXECUTION_ENV) {
	        engine += ' exec-env/' + process.env.AWS_EXECUTION_ENV;
	      }
	      return engine;
	    }
	  },

	  userAgent: function userAgent() {
	    var name = util.isBrowser() ? 'js' : 'nodejs';
	    var agent = 'aws-sdk-' + name + '/' + __webpack_require__(5).VERSION;
	    if (name === 'nodejs') agent += ' ' + util.engine();
	    return agent;
	  },

	  isBrowser: function isBrowser() { return process && process.browser; },
	  isNode: function isNode() { return !util.isBrowser(); },
	  uriEscape: function uriEscape(string) {
	    var output = encodeURIComponent(string);
	    output = output.replace(/[^A-Za-z0-9_.~\-%]+/g, escape);

	    // AWS percent-encodes some extra non-standard characters in a URI
	    output = output.replace(/[*]/g, function(ch) {
	      return '%' + ch.charCodeAt(0).toString(16).toUpperCase();
	    });

	    return output;
	  },

	  uriEscapePath: function uriEscapePath(string) {
	    var parts = [];
	    util.arrayEach(string.split('/'), function (part) {
	      parts.push(util.uriEscape(part));
	    });
	    return parts.join('/');
	  },

	  urlParse: function urlParse(url) {
	    return util.url.parse(url);
	  },

	  urlFormat: function urlFormat(url) {
	    return util.url.format(url);
	  },

	  queryStringParse: function queryStringParse(qs) {
	    return util.querystring.parse(qs);
	  },

	  queryParamsToString: function queryParamsToString(params) {
	    var items = [];
	    var escape = util.uriEscape;
	    var sortedKeys = Object.keys(params).sort();

	    util.arrayEach(sortedKeys, function(name) {
	      var value = params[name];
	      var ename = escape(name);
	      var result = ename + '=';
	      if (Array.isArray(value)) {
	        var vals = [];
	        util.arrayEach(value, function(item) { vals.push(escape(item)); });
	        result = ename + '=' + vals.sort().join('&' + ename + '=');
	      } else if (value !== undefined && value !== null) {
	        result = ename + '=' + escape(value);
	      }
	      items.push(result);
	    });

	    return items.join('&');
	  },

	  readFileSync: function readFileSync(path) {
	    if (util.isBrowser()) return null;
	    return __webpack_require__(123).readFileSync(path, 'utf-8');
	  },

	  base64: {
	    encode: function encode64(string) {
	      if (typeof string === 'number') {
	        throw util.error(new Error('Cannot base64 encode number ' + string));
	      }
	      var buf = (typeof util.Buffer.from === 'function' && util.Buffer.from !== Uint8Array.from) ? util.Buffer.from(string) : new util.Buffer(string);
	      return buf.toString('base64');
	    },

	    decode: function decode64(string) {
	      if (typeof string === 'number') {
	        throw util.error(new Error('Cannot base64 decode number ' + string));
	      }
	      return (typeof util.Buffer.from === 'function' && util.Buffer.from !== Uint8Array.from) ? util.Buffer.from(string, 'base64') : new util.Buffer(string, 'base64');
	    }

	  },

	  buffer: {
	    toStream: function toStream(buffer) {
	      if (!util.Buffer.isBuffer(buffer)) buffer = new util.Buffer(buffer);

	      var readable = new (util.stream.Readable)();
	      var pos = 0;
	      readable._read = function(size) {
	        if (pos >= buffer.length) return readable.push(null);

	        var end = pos + size;
	        if (end > buffer.length) end = buffer.length;
	        readable.push(buffer.slice(pos, end));
	        pos = end;
	      };

	      return readable;
	    },

	    /**
	     * Concatenates a list of Buffer objects.
	     */
	    concat: function(buffers) {
	      var length = 0,
	          offset = 0,
	          buffer = null, i;

	      for (i = 0; i < buffers.length; i++) {
	        length += buffers[i].length;
	      }

	      buffer = new util.Buffer(length);

	      for (i = 0; i < buffers.length; i++) {
	        buffers[i].copy(buffer, offset);
	        offset += buffers[i].length;
	      }

	      return buffer;
	    }
	  },

	  string: {
	    byteLength: function byteLength(string) {
	      if (string === null || string === undefined) return 0;
	      if (typeof string === 'string') string = new util.Buffer(string);

	      if (typeof string.byteLength === 'number') {
	        return string.byteLength;
	      } else if (typeof string.length === 'number') {
	        return string.length;
	      } else if (typeof string.size === 'number') {
	        return string.size;
	      } else if (typeof string.path === 'string') {
	        return __webpack_require__(123).lstatSync(string.path).size;
	      } else {
	        throw util.error(new Error('Cannot determine length of ' + string),
	          { object: string });
	      }
	    },

	    upperFirst: function upperFirst(string) {
	      return string[0].toUpperCase() + string.substr(1);
	    },

	    lowerFirst: function lowerFirst(string) {
	      return string[0].toLowerCase() + string.substr(1);
	    }
	  },

	  ini: {
	    parse: function string(ini) {
	      var currentSection, map = {};
	      util.arrayEach(ini.split(/\r?\n/), function(line) {
	        line = line.split(/(^|\s)[;#]/)[0]; // remove comments
	        var section = line.match(/^\s*\[([^\[\]]+)\]\s*$/);
	        if (section) {
	          currentSection = section[1];
	        } else if (currentSection) {
	          var item = line.match(/^\s*(.+?)\s*=\s*(.+?)\s*$/);
	          if (item) {
	            map[currentSection] = map[currentSection] || {};
	            map[currentSection][item[1]] = item[2];
	          }
	        }
	      });

	      return map;
	    }
	  },

	  fn: {
	    noop: function() {},

	    /**
	     * Turn a synchronous function into as "async" function by making it call
	     * a callback. The underlying function is called with all but the last argument,
	     * which is treated as the callback. The callback is passed passed a first argument
	     * of null on success to mimick standard node callbacks.
	     */
	    makeAsync: function makeAsync(fn, expectedArgs) {
	      if (expectedArgs && expectedArgs <= fn.length) {
	        return fn;
	      }

	      return function() {
	        var args = Array.prototype.slice.call(arguments, 0);
	        var callback = args.pop();
	        var result = fn.apply(null, args);
	        callback(result);
	      };
	    }
	  },

	  /**
	   * Date and time utility functions.
	   */
	  date: {

	    /**
	     * @return [Date] the current JavaScript date object. Since all
	     *   AWS services rely on this date object, you can override
	     *   this function to provide a special time value to AWS service
	     *   requests.
	     */
	    getDate: function getDate() {
	      if (!AWS) AWS = __webpack_require__(5);
	      if (AWS.config.systemClockOffset) { // use offset when non-zero
	        return new Date(new Date().getTime() + AWS.config.systemClockOffset);
	      } else {
	        return new Date();
	      }
	    },

	    /**
	     * @return [String] the date in ISO-8601 format
	     */
	    iso8601: function iso8601(date) {
	      if (date === undefined) { date = util.date.getDate(); }
	      return date.toISOString().replace(/\.\d{3}Z$/, 'Z');
	    },

	    /**
	     * @return [String] the date in RFC 822 format
	     */
	    rfc822: function rfc822(date) {
	      if (date === undefined) { date = util.date.getDate(); }
	      return date.toUTCString();
	    },

	    /**
	     * @return [Integer] the UNIX timestamp value for the current time
	     */
	    unixTimestamp: function unixTimestamp(date) {
	      if (date === undefined) { date = util.date.getDate(); }
	      return date.getTime() / 1000;
	    },

	    /**
	     * @param [String,number,Date] date
	     * @return [Date]
	     */
	    from: function format(date) {
	      if (typeof date === 'number') {
	        return new Date(date * 1000); // unix timestamp
	      } else {
	        return new Date(date);
	      }
	    },

	    /**
	     * Given a Date or date-like value, this function formats the
	     * date into a string of the requested value.
	     * @param [String,number,Date] date
	     * @param [String] formatter Valid formats are:
	     #   * 'iso8601'
	     #   * 'rfc822'
	     #   * 'unixTimestamp'
	     * @return [String]
	     */
	    format: function format(date, formatter) {
	      if (!formatter) formatter = 'iso8601';
	      return util.date[formatter](util.date.from(date));
	    },

	    parseTimestamp: function parseTimestamp(value) {
	      if (typeof value === 'number') { // unix timestamp (number)
	        return new Date(value * 1000);
	      } else if (value.match(/^\d+$/)) { // unix timestamp
	        return new Date(value * 1000);
	      } else if (value.match(/^\d{4}/)) { // iso8601
	        return new Date(value);
	      } else if (value.match(/^\w{3},/)) { // rfc822
	        return new Date(value);
	      } else {
	        throw util.error(
	          new Error('unhandled timestamp format: ' + value),
	          {code: 'TimestampParserError'});
	      }
	    }

	  },

	  crypto: {
	    crc32Table: [
	     0x00000000, 0x77073096, 0xEE0E612C, 0x990951BA, 0x076DC419,
	     0x706AF48F, 0xE963A535, 0x9E6495A3, 0x0EDB8832, 0x79DCB8A4,
	     0xE0D5E91E, 0x97D2D988, 0x09B64C2B, 0x7EB17CBD, 0xE7B82D07,
	     0x90BF1D91, 0x1DB71064, 0x6AB020F2, 0xF3B97148, 0x84BE41DE,
	     0x1ADAD47D, 0x6DDDE4EB, 0xF4D4B551, 0x83D385C7, 0x136C9856,
	     0x646BA8C0, 0xFD62F97A, 0x8A65C9EC, 0x14015C4F, 0x63066CD9,
	     0xFA0F3D63, 0x8D080DF5, 0x3B6E20C8, 0x4C69105E, 0xD56041E4,
	     0xA2677172, 0x3C03E4D1, 0x4B04D447, 0xD20D85FD, 0xA50AB56B,
	     0x35B5A8FA, 0x42B2986C, 0xDBBBC9D6, 0xACBCF940, 0x32D86CE3,
	     0x45DF5C75, 0xDCD60DCF, 0xABD13D59, 0x26D930AC, 0x51DE003A,
	     0xC8D75180, 0xBFD06116, 0x21B4F4B5, 0x56B3C423, 0xCFBA9599,
	     0xB8BDA50F, 0x2802B89E, 0x5F058808, 0xC60CD9B2, 0xB10BE924,
	     0x2F6F7C87, 0x58684C11, 0xC1611DAB, 0xB6662D3D, 0x76DC4190,
	     0x01DB7106, 0x98D220BC, 0xEFD5102A, 0x71B18589, 0x06B6B51F,
	     0x9FBFE4A5, 0xE8B8D433, 0x7807C9A2, 0x0F00F934, 0x9609A88E,
	     0xE10E9818, 0x7F6A0DBB, 0x086D3D2D, 0x91646C97, 0xE6635C01,
	     0x6B6B51F4, 0x1C6C6162, 0x856530D8, 0xF262004E, 0x6C0695ED,
	     0x1B01A57B, 0x8208F4C1, 0xF50FC457, 0x65B0D9C6, 0x12B7E950,
	     0x8BBEB8EA, 0xFCB9887C, 0x62DD1DDF, 0x15DA2D49, 0x8CD37CF3,
	     0xFBD44C65, 0x4DB26158, 0x3AB551CE, 0xA3BC0074, 0xD4BB30E2,
	     0x4ADFA541, 0x3DD895D7, 0xA4D1C46D, 0xD3D6F4FB, 0x4369E96A,
	     0x346ED9FC, 0xAD678846, 0xDA60B8D0, 0x44042D73, 0x33031DE5,
	     0xAA0A4C5F, 0xDD0D7CC9, 0x5005713C, 0x270241AA, 0xBE0B1010,
	     0xC90C2086, 0x5768B525, 0x206F85B3, 0xB966D409, 0xCE61E49F,
	     0x5EDEF90E, 0x29D9C998, 0xB0D09822, 0xC7D7A8B4, 0x59B33D17,
	     0x2EB40D81, 0xB7BD5C3B, 0xC0BA6CAD, 0xEDB88320, 0x9ABFB3B6,
	     0x03B6E20C, 0x74B1D29A, 0xEAD54739, 0x9DD277AF, 0x04DB2615,
	     0x73DC1683, 0xE3630B12, 0x94643B84, 0x0D6D6A3E, 0x7A6A5AA8,
	     0xE40ECF0B, 0x9309FF9D, 0x0A00AE27, 0x7D079EB1, 0xF00F9344,
	     0x8708A3D2, 0x1E01F268, 0x6906C2FE, 0xF762575D, 0x806567CB,
	     0x196C3671, 0x6E6B06E7, 0xFED41B76, 0x89D32BE0, 0x10DA7A5A,
	     0x67DD4ACC, 0xF9B9DF6F, 0x8EBEEFF9, 0x17B7BE43, 0x60B08ED5,
	     0xD6D6A3E8, 0xA1D1937E, 0x38D8C2C4, 0x4FDFF252, 0xD1BB67F1,
	     0xA6BC5767, 0x3FB506DD, 0x48B2364B, 0xD80D2BDA, 0xAF0A1B4C,
	     0x36034AF6, 0x41047A60, 0xDF60EFC3, 0xA867DF55, 0x316E8EEF,
	     0x4669BE79, 0xCB61B38C, 0xBC66831A, 0x256FD2A0, 0x5268E236,
	     0xCC0C7795, 0xBB0B4703, 0x220216B9, 0x5505262F, 0xC5BA3BBE,
	     0xB2BD0B28, 0x2BB45A92, 0x5CB36A04, 0xC2D7FFA7, 0xB5D0CF31,
	     0x2CD99E8B, 0x5BDEAE1D, 0x9B64C2B0, 0xEC63F226, 0x756AA39C,
	     0x026D930A, 0x9C0906A9, 0xEB0E363F, 0x72076785, 0x05005713,
	     0x95BF4A82, 0xE2B87A14, 0x7BB12BAE, 0x0CB61B38, 0x92D28E9B,
	     0xE5D5BE0D, 0x7CDCEFB7, 0x0BDBDF21, 0x86D3D2D4, 0xF1D4E242,
	     0x68DDB3F8, 0x1FDA836E, 0x81BE16CD, 0xF6B9265B, 0x6FB077E1,
	     0x18B74777, 0x88085AE6, 0xFF0F6A70, 0x66063BCA, 0x11010B5C,
	     0x8F659EFF, 0xF862AE69, 0x616BFFD3, 0x166CCF45, 0xA00AE278,
	     0xD70DD2EE, 0x4E048354, 0x3903B3C2, 0xA7672661, 0xD06016F7,
	     0x4969474D, 0x3E6E77DB, 0xAED16A4A, 0xD9D65ADC, 0x40DF0B66,
	     0x37D83BF0, 0xA9BCAE53, 0xDEBB9EC5, 0x47B2CF7F, 0x30B5FFE9,
	     0xBDBDF21C, 0xCABAC28A, 0x53B39330, 0x24B4A3A6, 0xBAD03605,
	     0xCDD70693, 0x54DE5729, 0x23D967BF, 0xB3667A2E, 0xC4614AB8,
	     0x5D681B02, 0x2A6F2B94, 0xB40BBE37, 0xC30C8EA1, 0x5A05DF1B,
	     0x2D02EF8D],

	    crc32: function crc32(data) {
	      var tbl = util.crypto.crc32Table;
	      var crc = 0 ^ -1;

	      if (typeof data === 'string') {
	        data = new util.Buffer(data);
	      }

	      for (var i = 0; i < data.length; i++) {
	        var code = data.readUInt8(i);
	        crc = (crc >>> 8) ^ tbl[(crc ^ code) & 0xFF];
	      }
	      return (crc ^ -1) >>> 0;
	    },

	    hmac: function hmac(key, string, digest, fn) {
	      if (!digest) digest = 'binary';
	      if (digest === 'buffer') { digest = undefined; }
	      if (!fn) fn = 'sha256';
	      if (typeof string === 'string') string = new util.Buffer(string);
	      return util.crypto.lib.createHmac(fn, key).update(string).digest(digest);
	    },

	    md5: function md5(data, digest, callback) {
	      return util.crypto.hash('md5', data, digest, callback);
	    },

	    sha256: function sha256(data, digest, callback) {
	      return util.crypto.hash('sha256', data, digest, callback);
	    },

	    hash: function(algorithm, data, digest, callback) {
	      var hash = util.crypto.createHash(algorithm);
	      if (!digest) { digest = 'binary'; }
	      if (digest === 'buffer') { digest = undefined; }
	      if (typeof data === 'string') data = new util.Buffer(data);
	      var sliceFn = util.arraySliceFn(data);
	      var isBuffer = util.Buffer.isBuffer(data);
	      //Identifying objects with an ArrayBuffer as buffers
	      if (util.isBrowser() && typeof ArrayBuffer !== 'undefined' && data && data.buffer instanceof ArrayBuffer) isBuffer = true;

	      if (callback && typeof data === 'object' &&
	          typeof data.on === 'function' && !isBuffer) {
	        data.on('data', function(chunk) { hash.update(chunk); });
	        data.on('error', function(err) { callback(err); });
	        data.on('end', function() { callback(null, hash.digest(digest)); });
	      } else if (callback && sliceFn && !isBuffer &&
	                 typeof FileReader !== 'undefined') {
	        // this might be a File/Blob
	        var index = 0, size = 1024 * 512;
	        var reader = new FileReader();
	        reader.onerror = function() {
	          callback(new Error('Failed to read data.'));
	        };
	        reader.onload = function() {
	          var buf = new util.Buffer(new Uint8Array(reader.result));
	          hash.update(buf);
	          index += buf.length;
	          reader._continueReading();
	        };
	        reader._continueReading = function() {
	          if (index >= data.size) {
	            callback(null, hash.digest(digest));
	            return;
	          }

	          var back = index + size;
	          if (back > data.size) back = data.size;
	          reader.readAsArrayBuffer(sliceFn.call(data, index, back));
	        };

	        reader._continueReading();
	      } else {
	        if (util.isBrowser() && typeof data === 'object' && !isBuffer) {
	          data = new util.Buffer(new Uint8Array(data));
	        }
	        var out = hash.update(data).digest(digest);
	        if (callback) callback(null, out);
	        return out;
	      }
	    },

	    toHex: function toHex(data) {
	      var out = [];
	      for (var i = 0; i < data.length; i++) {
	        out.push(('0' + data.charCodeAt(i).toString(16)).substr(-2, 2));
	      }
	      return out.join('');
	    },

	    createHash: function createHash(algorithm) {
	      return util.crypto.lib.createHash(algorithm);
	    }

	  },

	  /** @!ignore */

	  /* Abort constant */
	  abort: {},

	  each: function each(object, iterFunction) {
	    for (var key in object) {
	      if (Object.prototype.hasOwnProperty.call(object, key)) {
	        var ret = iterFunction.call(this, key, object[key]);
	        if (ret === util.abort) break;
	      }
	    }
	  },

	  arrayEach: function arrayEach(array, iterFunction) {
	    for (var idx in array) {
	      if (Object.prototype.hasOwnProperty.call(array, idx)) {
	        var ret = iterFunction.call(this, array[idx], parseInt(idx, 10));
	        if (ret === util.abort) break;
	      }
	    }
	  },

	  update: function update(obj1, obj2) {
	    util.each(obj2, function iterator(key, item) {
	      obj1[key] = item;
	    });
	    return obj1;
	  },

	  merge: function merge(obj1, obj2) {
	    return util.update(util.copy(obj1), obj2);
	  },

	  copy: function copy(object) {
	    if (object === null || object === undefined) return object;
	    var dupe = {};
	    // jshint forin:false
	    for (var key in object) {
	      dupe[key] = object[key];
	    }
	    return dupe;
	  },

	  isEmpty: function isEmpty(obj) {
	    for (var prop in obj) {
	      if (Object.prototype.hasOwnProperty.call(obj, prop)) {
	        return false;
	      }
	    }
	    return true;
	  },

	  arraySliceFn: function arraySliceFn(obj) {
	    var fn = obj.slice || obj.webkitSlice || obj.mozSlice;
	    return typeof fn === 'function' ? fn : null;
	  },

	  isType: function isType(obj, type) {
	    // handle cross-"frame" objects
	    if (typeof type === 'function') type = util.typeName(type);
	    return Object.prototype.toString.call(obj) === '[object ' + type + ']';
	  },

	  typeName: function typeName(type) {
	    if (Object.prototype.hasOwnProperty.call(type, 'name')) return type.name;
	    var str = type.toString();
	    var match = str.match(/^\s*function (.+)\(/);
	    return match ? match[1] : str;
	  },

	  error: function error(err, options) {
	    var originalError = null;
	    if (typeof err.message === 'string' && err.message !== '') {
	      if (typeof options === 'string' || (options && options.message)) {
	        originalError = util.copy(err);
	        originalError.message = err.message;
	      }
	    }
	    err.message = err.message || null;

	    if (typeof options === 'string') {
	      err.message = options;
	    } else if (typeof options === 'object' && options !== null) {
	      util.update(err, options);
	      if (options.message)
	        err.message = options.message;
	      if (options.code || options.name)
	        err.code = options.code || options.name;
	      if (options.stack)
	        err.stack = options.stack;
	    }

	    if (typeof Object.defineProperty === 'function') {
	      Object.defineProperty(err, 'name', {writable: true, enumerable: false});
	      Object.defineProperty(err, 'message', {enumerable: true});
	    }

	    err.name = options && options.name || err.name || err.code || 'Error';
	    err.time = new Date();

	    if (originalError) err.originalError = originalError;

	    return err;
	  },

	  /**
	   * @api private
	   */
	  inherit: function inherit(klass, features) {
	    var newObject = null;
	    if (features === undefined) {
	      features = klass;
	      klass = Object;
	      newObject = {};
	    } else {
	      var ctor = function ConstructorWrapper() {};
	      ctor.prototype = klass.prototype;
	      newObject = new ctor();
	    }

	    // constructor not supplied, create pass-through ctor
	    if (features.constructor === Object) {
	      features.constructor = function() {
	        if (klass !== Object) {
	          return klass.apply(this, arguments);
	        }
	      };
	    }

	    features.constructor.prototype = newObject;
	    util.update(features.constructor.prototype, features);
	    features.constructor.__super__ = klass;
	    return features.constructor;
	  },

	  /**
	   * @api private
	   */
	  mixin: function mixin() {
	    var klass = arguments[0];
	    for (var i = 1; i < arguments.length; i++) {
	      // jshint forin:false
	      for (var prop in arguments[i].prototype) {
	        var fn = arguments[i].prototype[prop];
	        if (prop !== 'constructor') {
	          klass.prototype[prop] = fn;
	        }
	      }
	    }
	    return klass;
	  },

	  /**
	   * @api private
	   */
	  hideProperties: function hideProperties(obj, props) {
	    if (typeof Object.defineProperty !== 'function') return;

	    util.arrayEach(props, function (key) {
	      Object.defineProperty(obj, key, {
	        enumerable: false, writable: true, configurable: true });
	    });
	  },

	  /**
	   * @api private
	   */
	  property: function property(obj, name, value, enumerable, isValue) {
	    var opts = {
	      configurable: true,
	      enumerable: enumerable !== undefined ? enumerable : true
	    };
	    if (typeof value === 'function' && !isValue) {
	      opts.get = value;
	    }
	    else {
	      opts.value = value; opts.writable = true;
	    }

	    Object.defineProperty(obj, name, opts);
	  },

	  /**
	   * @api private
	   */
	  memoizedProperty: function memoizedProperty(obj, name, get, enumerable) {
	    var cachedValue = null;

	    // build enumerable attribute for each value with lazy accessor.
	    util.property(obj, name, function() {
	      if (cachedValue === null) {
	        cachedValue = get();
	      }
	      return cachedValue;
	    }, enumerable);
	  },

	  /**
	   * TODO Remove in major version revision
	   * This backfill populates response data without the
	   * top-level payload name.
	   *
	   * @api private
	   */
	  hoistPayloadMember: function hoistPayloadMember(resp) {
	    var req = resp.request;
	    var operation = req.operation;
	    var output = req.service.api.operations[operation].output;
	    if (output.payload) {
	      var payloadMember = output.members[output.payload];
	      var responsePayload = resp.data[output.payload];
	      if (payloadMember.type === 'structure') {
	        util.each(responsePayload, function(key, value) {
	          util.property(resp.data, key, value, false);
	        });
	      }
	    }
	  },

	  /**
	   * Compute SHA-256 checksums of streams
	   *
	   * @api private
	   */
	  computeSha256: function computeSha256(body, done) {
	    if (util.isNode()) {
	      var Stream = util.stream.Stream;
	      var fs = __webpack_require__(123);
	      if (body instanceof Stream) {
	        if (typeof body.path === 'string') { // assume file object
	          var settings = {};
	          if (typeof body.start === 'number') {
	            settings.start = body.start;
	          }
	          if (typeof body.end === 'number') {
	            settings.end = body.end;
	          }
	          body = fs.createReadStream(body.path, settings);
	        } else { // TODO support other stream types
	          return done(new Error('Non-file stream objects are ' +
	                                'not supported with SigV4'));
	        }
	      }
	    }

	    util.crypto.sha256(body, 'hex', function(err, sha) {
	      if (err) done(err);
	      else done(null, sha);
	    });
	  },

	  /**
	   * @api private
	   */
	  isClockSkewed: function isClockSkewed(serverTime) {
	    if (serverTime) {
	      util.property(AWS.config, 'isClockSkewed',
	        Math.abs(new Date().getTime() - serverTime) >= 300000, false);
	      return AWS.config.isClockSkewed;
	    }
	  },

	  applyClockOffset: function applyClockOffset(serverTime) {
	    if (serverTime)
	      AWS.config.systemClockOffset = serverTime - new Date().getTime();
	  },

	  /**
	   * @api private
	   */
	  extractRequestId: function extractRequestId(resp) {
	    var requestId = resp.httpResponse.headers['x-amz-request-id'] ||
	                     resp.httpResponse.headers['x-amzn-requestid'];

	    if (!requestId && resp.data && resp.data.ResponseMetadata) {
	      requestId = resp.data.ResponseMetadata.RequestId;
	    }

	    if (requestId) {
	      resp.requestId = requestId;
	    }

	    if (resp.error) {
	      resp.error.requestId = requestId;
	    }
	  },

	  /**
	   * @api private
	   */
	  addPromises: function addPromises(constructors, PromiseDependency) {
	    if (PromiseDependency === undefined && AWS && AWS.config) {
	      PromiseDependency = AWS.config.getPromisesDependency();
	    }
	    if (PromiseDependency === undefined && typeof Promise !== 'undefined') {
	      PromiseDependency = Promise;
	    }
	    if (typeof PromiseDependency !== 'function') var deletePromises = true;
	    if (!Array.isArray(constructors)) constructors = [constructors];

	    for (var ind = 0; ind < constructors.length; ind++) {
	      var constructor = constructors[ind];
	      if (deletePromises) {
	        if (constructor.deletePromisesFromClass) {
	          constructor.deletePromisesFromClass();
	        }
	      } else if (constructor.addPromisesToClass) {
	        constructor.addPromisesToClass(PromiseDependency);
	      }
	    }
	  },

	  /**
	   * @api private
	   */
	  promisifyMethod: function promisifyMethod(methodName, PromiseDependency) {
	    return function promise() {
	      var self = this;
	      return new PromiseDependency(function(resolve, reject) {
	        self[methodName](function(err, data) {
	          if (err) {
	            reject(err);
	          } else {
	            resolve(data);
	          }
	        });
	      });
	    };
	  },

	  /**
	   * @api private
	   */
	  isDualstackAvailable: function isDualstackAvailable(service) {
	    if (!service) return false;
	    var metadata = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/metadata.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	    if (typeof service !== 'string') service = service.serviceIdentifier;
	    if (typeof service !== 'string' || !metadata.hasOwnProperty(service)) return false;
	    return !!metadata[service].dualstackAvailable;
	  },

	  /**
	   * @api private
	   */
	  calculateRetryDelay: function calculateRetryDelay(retryCount, retryDelayOptions) {
	    if (!retryDelayOptions) retryDelayOptions = {};
	    var customBackoff = retryDelayOptions.customBackoff || null;
	    if (typeof customBackoff === 'function') {
	      return customBackoff(retryCount);
	    }
	    var base = retryDelayOptions.base || 100;
	    var delay = Math.random() * (Math.pow(2, retryCount) * base);
	    return delay;
	  },

	  /**
	   * @api private
	   */
	  handleRequestWithRetries: function handleRequestWithRetries(httpRequest, options, cb) {
	    if (!options) options = {};
	    var http = AWS.HttpClient.getInstance();
	    var httpOptions = options.httpOptions || {};
	    var retryCount = 0;

	    var errCallback = function(err) {
	      var maxRetries = options.maxRetries || 0;
	      if (err && err.code === 'TimeoutError') err.retryable = true;
	      if (err && err.retryable && retryCount < maxRetries) {
	        retryCount++;
	        var delay = util.calculateRetryDelay(retryCount, options.retryDelayOptions);
	        setTimeout(sendRequest, delay + (err.retryAfter || 0));
	      } else {
	        cb(err);
	      }
	    };

	    var sendRequest = function() {
	      var data = '';
	      http.handleRequest(httpRequest, httpOptions, function(httpResponse) {
	        httpResponse.on('data', function(chunk) { data += chunk.toString(); });
	        httpResponse.on('end', function() {
	          var statusCode = httpResponse.statusCode;
	          if (statusCode < 300) {
	            cb(null, data);
	          } else {
	            var retryAfter = parseInt(httpResponse.headers['retry-after'], 10) * 1000 || 0;
	            var err = util.error(new Error(),
	              { retryable: statusCode >= 500 || statusCode === 429 }
	            );
	            if (retryAfter && err.retryable) err.retryAfter = retryAfter;
	            errCallback(err);
	          }
	        });
	      }, errCallback);
	    };

	    process.nextTick(sendRequest);
	  }

	};

	module.exports = util;


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * The main AWS namespace
	 */
	var AWS = { util: __webpack_require__(4) };

	/**
	 * @api private
	 * @!macro [new] nobrowser
	 *   @note This feature is not supported in the browser environment of the SDK.
	 */
	var _hidden = {}; _hidden.toString(); // hack to parse macro

	module.exports = AWS;

	AWS.util.update(AWS, {

	  /**
	   * @constant
	   */
	  VERSION: '2.7.27',

	  /**
	   * @api private
	   */
	  Signers: {},

	  /**
	   * @api private
	   */
	  Protocol: {
	    Json: __webpack_require__(6),
	    Query: __webpack_require__(9),
	    Rest: __webpack_require__(13),
	    RestJson: __webpack_require__(14),
	    RestXml: __webpack_require__(15)
	  },

	  /**
	   * @api private
	   */
	  XML: {
	    Builder: __webpack_require__(16),
	    Parser: null // conditionally set based on environment
	  },

	  /**
	   * @api private
	   */
	  JSON: {
	    Builder: __webpack_require__(7),
	    Parser: __webpack_require__(8)
	  },

	  /**
	   * @api private
	   */
	  Model: {
	    Api: __webpack_require__(82),
	    Operation: __webpack_require__(83),
	    Shape: __webpack_require__(11),
	    Paginator: __webpack_require__(84),
	    ResourceWaiter: __webpack_require__(85)
	  },

	  util: __webpack_require__(4),

	  /**
	   * @api private
	   */
	  apiLoader: function() { throw new Error('No API loader set'); }
	});

	__webpack_require__(86);
	__webpack_require__(89);

	__webpack_require__(90);
	__webpack_require__(91);
	__webpack_require__(92);
	__webpack_require__(97);
	__webpack_require__(98);
	__webpack_require__(102);

	__webpack_require__(103);
	__webpack_require__(104);
	__webpack_require__(105);
	__webpack_require__(110);
	__webpack_require__(113);
	__webpack_require__(114);
	__webpack_require__(115);
	__webpack_require__(122);

	/**
	 * @readonly
	 * @return [AWS.SequentialExecutor] a collection of global event listeners that
	 *   are attached to every sent request.
	 * @see AWS.Request AWS.Request for a list of events to listen for
	 * @example Logging the time taken to send a request
	 *   AWS.events.on('send', function startSend(resp) {
	 *     resp.startTime = new Date().getTime();
	 *   }).on('complete', function calculateTime(resp) {
	 *     var time = (new Date().getTime() - resp.startTime) / 1000;
	 *     console.log('Request took ' + time + ' seconds');
	 *   });
	 *
	 *   new AWS.S3().listBuckets(); // prints 'Request took 0.285 seconds'
	 */
	AWS.events = new AWS.SequentialExecutor();


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	var util = __webpack_require__(4);
	var JsonBuilder = __webpack_require__(7);
	var JsonParser = __webpack_require__(8);

	function buildRequest(req) {
	  var httpRequest = req.httpRequest;
	  var api = req.service.api;
	  var target = api.targetPrefix + '.' + api.operations[req.operation].name;
	  var version = api.jsonVersion || '1.0';
	  var input = api.operations[req.operation].input;
	  var builder = new JsonBuilder();

	  if (version === 1) version = '1.0';
	  httpRequest.body = builder.build(req.params || {}, input);
	  httpRequest.headers['Content-Type'] = 'application/x-amz-json-' + version;
	  httpRequest.headers['X-Amz-Target'] = target;
	}

	function extractError(resp) {
	  var error = {};
	  var httpResponse = resp.httpResponse;

	  error.code = httpResponse.headers['x-amzn-errortype'] || 'UnknownError';
	  if (typeof error.code === 'string') {
	    error.code = error.code.split(':')[0];
	  }

	  if (httpResponse.body.length > 0) {
	    var e = JSON.parse(httpResponse.body.toString());
	    if (e.__type || e.code) {
	      error.code = (e.__type || e.code).split('#').pop();
	    }
	    if (error.code === 'RequestEntityTooLarge') {
	      error.message = 'Request body must be less than 1 MB';
	    } else {
	      error.message = (e.message || e.Message || null);
	    }
	  } else {
	    error.statusCode = httpResponse.statusCode;
	    error.message = httpResponse.statusCode.toString();
	  }

	  resp.error = util.error(new Error(), error);
	}

	function extractData(resp) {
	  var body = resp.httpResponse.body.toString() || '{}';
	  if (resp.request.service.config.convertResponseTypes === false) {
	    resp.data = JSON.parse(body);
	  } else {
	    var operation = resp.request.service.api.operations[resp.request.operation];
	    var shape = operation.output || {};
	    var parser = new JsonParser();
	    resp.data = parser.parse(body, shape);
	  }
	}

	module.exports = {
	  buildRequest: buildRequest,
	  extractError: extractError,
	  extractData: extractData
	};


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	var util = __webpack_require__(4);

	function JsonBuilder() { }

	JsonBuilder.prototype.build = function(value, shape) {
	  return JSON.stringify(translate(value, shape));
	};

	function translate(value, shape) {
	  if (!shape || value === undefined || value === null) return undefined;

	  switch (shape.type) {
	    case 'structure': return translateStructure(value, shape);
	    case 'map': return translateMap(value, shape);
	    case 'list': return translateList(value, shape);
	    default: return translateScalar(value, shape);
	  }
	}

	function translateStructure(structure, shape) {
	  var struct = {};
	  util.each(structure, function(name, value) {
	    var memberShape = shape.members[name];
	    if (memberShape) {
	      if (memberShape.location !== 'body') return;
	      var locationName = memberShape.isLocationName ? memberShape.name : name;
	      var result = translate(value, memberShape);
	      if (result !== undefined) struct[locationName] = result;
	    }
	  });
	  return struct;
	}

	function translateList(list, shape) {
	  var out = [];
	  util.arrayEach(list, function(value) {
	    var result = translate(value, shape.member);
	    if (result !== undefined) out.push(result);
	  });
	  return out;
	}

	function translateMap(map, shape) {
	  var out = {};
	  util.each(map, function(key, value) {
	    var result = translate(value, shape.value);
	    if (result !== undefined) out[key] = result;
	  });
	  return out;
	}

	function translateScalar(value, shape) {
	  return shape.toWireFormat(value);
	}

	module.exports = JsonBuilder;


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	var util = __webpack_require__(4);

	function JsonParser() { }

	JsonParser.prototype.parse = function(value, shape) {
	  return translate(JSON.parse(value), shape);
	};

	function translate(value, shape) {
	  if (!shape || value === undefined) return undefined;

	  switch (shape.type) {
	    case 'structure': return translateStructure(value, shape);
	    case 'map': return translateMap(value, shape);
	    case 'list': return translateList(value, shape);
	    default: return translateScalar(value, shape);
	  }
	}

	function translateStructure(structure, shape) {
	  if (structure == null) return undefined;

	  var struct = {};
	  var shapeMembers = shape.members;
	  util.each(shapeMembers, function(name, memberShape) {
	    var locationName = memberShape.isLocationName ? memberShape.name : name;
	    if (Object.prototype.hasOwnProperty.call(structure, locationName)) {
	      var value = structure[locationName];
	      var result = translate(value, memberShape);
	      if (result !== undefined) struct[name] = result;
	    }
	  });
	  return struct;
	}

	function translateList(list, shape) {
	  if (list == null) return undefined;

	  var out = [];
	  util.arrayEach(list, function(value) {
	    var result = translate(value, shape.member);
	    if (result === undefined) out.push(null);
	    else out.push(result);
	  });
	  return out;
	}

	function translateMap(map, shape) {
	  if (map == null) return undefined;

	  var out = {};
	  util.each(map, function(key, value) {
	    var result = translate(value, shape.value);
	    if (result === undefined) out[key] = null;
	    else out[key] = result;
	  });
	  return out;
	}

	function translateScalar(value, shape) {
	  return shape.toType(value);
	}

	module.exports = JsonParser;


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	var AWS = __webpack_require__(5);
	var util = __webpack_require__(4);
	var QueryParamSerializer = __webpack_require__(10);
	var Shape = __webpack_require__(11);

	function buildRequest(req) {
	  var operation = req.service.api.operations[req.operation];
	  var httpRequest = req.httpRequest;
	  httpRequest.headers['Content-Type'] =
	    'application/x-www-form-urlencoded; charset=utf-8';
	  httpRequest.params = {
	    Version: req.service.api.apiVersion,
	    Action: operation.name
	  };

	  // convert the request parameters into a list of query params,
	  // e.g. Deeply.NestedParam.0.Name=value
	  var builder = new QueryParamSerializer();
	  builder.serialize(req.params, operation.input, function(name, value) {
	    httpRequest.params[name] = value;
	  });
	  httpRequest.body = util.queryParamsToString(httpRequest.params);
	}

	function extractError(resp) {
	  var data, body = resp.httpResponse.body.toString();
	  if (body.match('<UnknownOperationException')) {
	    data = {
	      Code: 'UnknownOperation',
	      Message: 'Unknown operation ' + resp.request.operation
	    };
	  } else {
	    data = new AWS.XML.Parser().parse(body);
	  }

	  if (data.requestId && !resp.requestId) resp.requestId = data.requestId;
	  if (data.Errors) data = data.Errors;
	  if (data.Error) data = data.Error;
	  if (data.Code) {
	    resp.error = util.error(new Error(), {
	      code: data.Code,
	      message: data.Message
	    });
	  } else {
	    resp.error = util.error(new Error(), {
	      code: resp.httpResponse.statusCode,
	      message: null
	    });
	  }
	}

	function extractData(resp) {
	  var req = resp.request;
	  var operation = req.service.api.operations[req.operation];
	  var shape = operation.output || {};
	  var origRules = shape;

	  if (origRules.resultWrapper) {
	    var tmp = Shape.create({type: 'structure'});
	    tmp.members[origRules.resultWrapper] = shape;
	    tmp.memberNames = [origRules.resultWrapper];
	    util.property(shape, 'name', shape.resultWrapper);
	    shape = tmp;
	  }

	  var parser = new AWS.XML.Parser();

	  // TODO: Refactor XML Parser to parse RequestId from response.
	  if (shape && shape.members && !shape.members._XAMZRequestId) {
	    var requestIdShape = Shape.create(
	      { type: 'string' },
	      { api: { protocol: 'query' } },
	      'requestId'
	    );
	    shape.members._XAMZRequestId = requestIdShape;
	  }

	  var data = parser.parse(resp.httpResponse.body.toString(), shape);
	  resp.requestId = data._XAMZRequestId || data.requestId;

	  if (data._XAMZRequestId) delete data._XAMZRequestId;

	  if (origRules.resultWrapper) {
	    if (data[origRules.resultWrapper]) {
	      util.update(data, data[origRules.resultWrapper]);
	      delete data[origRules.resultWrapper];
	    }
	  }

	  resp.data = data;
	}

	module.exports = {
	  buildRequest: buildRequest,
	  extractError: extractError,
	  extractData: extractData
	};


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	var util = __webpack_require__(4);

	function QueryParamSerializer() {
	}

	QueryParamSerializer.prototype.serialize = function(params, shape, fn) {
	  serializeStructure('', params, shape, fn);
	};

	function ucfirst(shape) {
	  if (shape.isQueryName || shape.api.protocol !== 'ec2') {
	    return shape.name;
	  } else {
	    return shape.name[0].toUpperCase() + shape.name.substr(1);
	  }
	}

	function serializeStructure(prefix, struct, rules, fn) {
	  util.each(rules.members, function(name, member) {
	    var value = struct[name];
	    if (value === null || value === undefined) return;

	    var memberName = ucfirst(member);
	    memberName = prefix ? prefix + '.' + memberName : memberName;
	    serializeMember(memberName, value, member, fn);
	  });
	}

	function serializeMap(name, map, rules, fn) {
	  var i = 1;
	  util.each(map, function (key, value) {
	    var prefix = rules.flattened ? '.' : '.entry.';
	    var position = prefix + (i++) + '.';
	    var keyName = position + (rules.key.name || 'key');
	    var valueName = position + (rules.value.name || 'value');
	    serializeMember(name + keyName, key, rules.key, fn);
	    serializeMember(name + valueName, value, rules.value, fn);
	  });
	}

	function serializeList(name, list, rules, fn) {
	  var memberRules = rules.member || {};

	  if (list.length === 0) {
	    fn.call(this, name, null);
	    return;
	  }

	  util.arrayEach(list, function (v, n) {
	    var suffix = '.' + (n + 1);
	    if (rules.api.protocol === 'ec2') {
	      // Do nothing for EC2
	      suffix = suffix + ''; // make linter happy
	    } else if (rules.flattened) {
	      if (memberRules.name) {
	        var parts = name.split('.');
	        parts.pop();
	        parts.push(ucfirst(memberRules));
	        name = parts.join('.');
	      }
	    } else {
	      suffix = '.member' + suffix;
	    }
	    serializeMember(name + suffix, v, memberRules, fn);
	  });
	}

	function serializeMember(name, value, rules, fn) {
	  if (value === null || value === undefined) return;
	  if (rules.type === 'structure') {
	    serializeStructure(name, value, rules, fn);
	  } else if (rules.type === 'list') {
	    serializeList(name, value, rules, fn);
	  } else if (rules.type === 'map') {
	    serializeMap(name, value, rules, fn);
	  } else {
	    fn(name, rules.toWireFormat(value).toString());
	  }
	}

	module.exports = QueryParamSerializer;


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	var Collection = __webpack_require__(12);

	var util = __webpack_require__(4);

	function property(obj, name, value) {
	  if (value !== null && value !== undefined) {
	    util.property.apply(this, arguments);
	  }
	}

	function memoizedProperty(obj, name) {
	  if (!obj.constructor.prototype[name]) {
	    util.memoizedProperty.apply(this, arguments);
	  }
	}

	function Shape(shape, options, memberName) {
	  options = options || {};

	  property(this, 'shape', shape.shape);
	  property(this, 'api', options.api, false);
	  property(this, 'type', shape.type);
	  property(this, 'enum', shape.enum);
	  property(this, 'min', shape.min);
	  property(this, 'max', shape.max);
	  property(this, 'pattern', shape.pattern);
	  property(this, 'location', shape.location || this.location || 'body');
	  property(this, 'name', this.name || shape.xmlName || shape.queryName ||
	    shape.locationName || memberName);
	  property(this, 'isStreaming', shape.streaming || this.isStreaming || false);
	  property(this, 'isComposite', shape.isComposite || false);
	  property(this, 'isShape', true, false);
	  property(this, 'isQueryName', shape.queryName ? true : false, false);
	  property(this, 'isLocationName', shape.locationName ? true : false, false);
	  property(this, 'isIdempotent', shape.idempotencyToken === true);

	  if (options.documentation) {
	    property(this, 'documentation', shape.documentation);
	    property(this, 'documentationUrl', shape.documentationUrl);
	  }

	  if (shape.xmlAttribute) {
	    property(this, 'isXmlAttribute', shape.xmlAttribute || false);
	  }

	  // type conversion and parsing
	  property(this, 'defaultValue', null);
	  this.toWireFormat = function(value) {
	    if (value === null || value === undefined) return '';
	    return value;
	  };
	  this.toType = function(value) { return value; };
	}

	/**
	 * @api private
	 */
	Shape.normalizedTypes = {
	  character: 'string',
	  double: 'float',
	  long: 'integer',
	  short: 'integer',
	  biginteger: 'integer',
	  bigdecimal: 'float',
	  blob: 'binary'
	};

	/**
	 * @api private
	 */
	Shape.types = {
	  'structure': StructureShape,
	  'list': ListShape,
	  'map': MapShape,
	  'boolean': BooleanShape,
	  'timestamp': TimestampShape,
	  'float': FloatShape,
	  'integer': IntegerShape,
	  'string': StringShape,
	  'base64': Base64Shape,
	  'binary': BinaryShape
	};

	Shape.resolve = function resolve(shape, options) {
	  if (shape.shape) {
	    var refShape = options.api.shapes[shape.shape];
	    if (!refShape) {
	      throw new Error('Cannot find shape reference: ' + shape.shape);
	    }

	    return refShape;
	  } else {
	    return null;
	  }
	};

	Shape.create = function create(shape, options, memberName) {
	  if (shape.isShape) return shape;

	  var refShape = Shape.resolve(shape, options);
	  if (refShape) {
	    var filteredKeys = Object.keys(shape);
	    if (!options.documentation) {
	      filteredKeys = filteredKeys.filter(function(name) {
	        return !name.match(/documentation/);
	      });
	    }
	    if (filteredKeys === ['shape']) { // no inline customizations
	      return refShape;
	    }

	    // create an inline shape with extra members
	    var InlineShape = function() {
	      refShape.constructor.call(this, shape, options, memberName);
	    };
	    InlineShape.prototype = refShape;
	    return new InlineShape();
	  } else {
	    // set type if not set
	    if (!shape.type) {
	      if (shape.members) shape.type = 'structure';
	      else if (shape.member) shape.type = 'list';
	      else if (shape.key) shape.type = 'map';
	      else shape.type = 'string';
	    }

	    // normalize types
	    var origType = shape.type;
	    if (Shape.normalizedTypes[shape.type]) {
	      shape.type = Shape.normalizedTypes[shape.type];
	    }

	    if (Shape.types[shape.type]) {
	      return new Shape.types[shape.type](shape, options, memberName);
	    } else {
	      throw new Error('Unrecognized shape type: ' + origType);
	    }
	  }
	};

	function CompositeShape(shape) {
	  Shape.apply(this, arguments);
	  property(this, 'isComposite', true);

	  if (shape.flattened) {
	    property(this, 'flattened', shape.flattened || false);
	  }
	}

	function StructureShape(shape, options) {
	  var requiredMap = null, firstInit = !this.isShape;

	  CompositeShape.apply(this, arguments);

	  if (firstInit) {
	    property(this, 'defaultValue', function() { return {}; });
	    property(this, 'members', {});
	    property(this, 'memberNames', []);
	    property(this, 'required', []);
	    property(this, 'isRequired', function() { return false; });
	  }

	  if (shape.members) {
	    property(this, 'members', new Collection(shape.members, options, function(name, member) {
	      return Shape.create(member, options, name);
	    }));
	    memoizedProperty(this, 'memberNames', function() {
	      return shape.xmlOrder || Object.keys(shape.members);
	    });
	  }

	  if (shape.required) {
	    property(this, 'required', shape.required);
	    property(this, 'isRequired', function(name) {
	      if (!requiredMap) {
	        requiredMap = {};
	        for (var i = 0; i < shape.required.length; i++) {
	          requiredMap[shape.required[i]] = true;
	        }
	      }

	      return requiredMap[name];
	    }, false, true);
	  }

	  property(this, 'resultWrapper', shape.resultWrapper || null);

	  if (shape.payload) {
	    property(this, 'payload', shape.payload);
	  }

	  if (typeof shape.xmlNamespace === 'string') {
	    property(this, 'xmlNamespaceUri', shape.xmlNamespace);
	  } else if (typeof shape.xmlNamespace === 'object') {
	    property(this, 'xmlNamespacePrefix', shape.xmlNamespace.prefix);
	    property(this, 'xmlNamespaceUri', shape.xmlNamespace.uri);
	  }
	}

	function ListShape(shape, options) {
	  var self = this, firstInit = !this.isShape;
	  CompositeShape.apply(this, arguments);

	  if (firstInit) {
	    property(this, 'defaultValue', function() { return []; });
	  }

	  if (shape.member) {
	    memoizedProperty(this, 'member', function() {
	      return Shape.create(shape.member, options);
	    });
	  }

	  if (this.flattened) {
	    var oldName = this.name;
	    memoizedProperty(this, 'name', function() {
	      return self.member.name || oldName;
	    });
	  }
	}

	function MapShape(shape, options) {
	  var firstInit = !this.isShape;
	  CompositeShape.apply(this, arguments);

	  if (firstInit) {
	    property(this, 'defaultValue', function() { return {}; });
	    property(this, 'key', Shape.create({type: 'string'}, options));
	    property(this, 'value', Shape.create({type: 'string'}, options));
	  }

	  if (shape.key) {
	    memoizedProperty(this, 'key', function() {
	      return Shape.create(shape.key, options);
	    });
	  }
	  if (shape.value) {
	    memoizedProperty(this, 'value', function() {
	      return Shape.create(shape.value, options);
	    });
	  }
	}

	function TimestampShape(shape) {
	  var self = this;
	  Shape.apply(this, arguments);

	  if (this.location === 'header') {
	    property(this, 'timestampFormat', 'rfc822');
	  } else if (shape.timestampFormat) {
	    property(this, 'timestampFormat', shape.timestampFormat);
	  } else if (this.api) {
	    if (this.api.timestampFormat) {
	      property(this, 'timestampFormat', this.api.timestampFormat);
	    } else {
	      switch (this.api.protocol) {
	        case 'json':
	        case 'rest-json':
	          property(this, 'timestampFormat', 'unixTimestamp');
	          break;
	        case 'rest-xml':
	        case 'query':
	        case 'ec2':
	          property(this, 'timestampFormat', 'iso8601');
	          break;
	      }
	    }
	  }

	  this.toType = function(value) {
	    if (value === null || value === undefined) return null;
	    if (typeof value.toUTCString === 'function') return value;
	    return typeof value === 'string' || typeof value === 'number' ?
	           util.date.parseTimestamp(value) : null;
	  };

	  this.toWireFormat = function(value) {
	    return util.date.format(value, self.timestampFormat);
	  };
	}

	function StringShape() {
	  Shape.apply(this, arguments);

	  if (this.api) {
	    switch (this.api.protocol) {
	      case 'rest-xml':
	      case 'query':
	      case 'ec2':
	        this.toType = function(value) { return value || ''; };
	    }
	  }
	}

	function FloatShape() {
	  Shape.apply(this, arguments);

	  this.toType = function(value) {
	    if (value === null || value === undefined) return null;
	    return parseFloat(value);
	  };
	  this.toWireFormat = this.toType;
	}

	function IntegerShape() {
	  Shape.apply(this, arguments);

	  this.toType = function(value) {
	    if (value === null || value === undefined) return null;
	    return parseInt(value, 10);
	  };
	  this.toWireFormat = this.toType;
	}

	function BinaryShape() {
	  Shape.apply(this, arguments);
	  this.toType = util.base64.decode;
	  this.toWireFormat = util.base64.encode;
	}

	function Base64Shape() {
	  BinaryShape.apply(this, arguments);
	}

	function BooleanShape() {
	  Shape.apply(this, arguments);

	  this.toType = function(value) {
	    if (typeof value === 'boolean') return value;
	    if (value === null || value === undefined) return null;
	    return value === 'true';
	  };
	}

	/**
	 * @api private
	 */
	Shape.shapes = {
	  StructureShape: StructureShape,
	  ListShape: ListShape,
	  MapShape: MapShape,
	  StringShape: StringShape,
	  BooleanShape: BooleanShape,
	  Base64Shape: Base64Shape
	};

	module.exports = Shape;


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	var memoizedProperty = __webpack_require__(4).memoizedProperty;

	function memoize(name, value, fn, nameTr) {
	  memoizedProperty(this, nameTr(name), function() {
	    return fn(name, value);
	  });
	}

	function Collection(iterable, options, fn, nameTr) {
	  nameTr = nameTr || String;
	  var self = this;

	  for (var id in iterable) {
	    if (Object.prototype.hasOwnProperty.call(iterable, id)) {
	      memoize.call(self, id, iterable[id], fn, nameTr);
	    }
	  }
	}

	module.exports = Collection;


/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	var util = __webpack_require__(4);

	function populateMethod(req) {
	  req.httpRequest.method = req.service.api.operations[req.operation].httpMethod;
	}

	function generateURI(endpointPath, operationPath, input, params) {
	  var uri = [endpointPath, operationPath].join('/');
	  uri = uri.replace(/\/+/g, '/');

	  var queryString = {}, queryStringSet = false;
	  util.each(input.members, function (name, member) {
	    var paramValue = params[name];
	    if (paramValue === null || paramValue === undefined) return;
	    if (member.location === 'uri') {
	      var regex = new RegExp('\\{' + member.name + '(\\+)?\\}');
	      uri = uri.replace(regex, function(_, plus) {
	        var fn = plus ? util.uriEscapePath : util.uriEscape;
	        return fn(String(paramValue));
	      });
	    } else if (member.location === 'querystring') {
	      queryStringSet = true;

	      if (member.type === 'list') {
	        queryString[member.name] = paramValue.map(function(val) {
	          return util.uriEscape(String(val));
	        });
	      } else if (member.type === 'map') {
	        util.each(paramValue, function(key, value) {
	          if (Array.isArray(value)) {
	            queryString[key] = value.map(function(val) {
	              return util.uriEscape(String(val));
	            });
	          } else {
	            queryString[key] = util.uriEscape(String(value));
	          }
	        });
	      } else {
	        queryString[member.name] = util.uriEscape(String(paramValue));
	      }
	    }
	  });

	  if (queryStringSet) {
	    uri += (uri.indexOf('?') >= 0 ? '&' : '?');
	    var parts = [];
	    util.arrayEach(Object.keys(queryString).sort(), function(key) {
	      if (!Array.isArray(queryString[key])) {
	        queryString[key] = [queryString[key]];
	      }
	      for (var i = 0; i < queryString[key].length; i++) {
	        parts.push(util.uriEscape(String(key)) + '=' + queryString[key][i]);
	      }
	    });
	    uri += parts.join('&');
	  }

	  return uri;
	}

	function populateURI(req) {
	  var operation = req.service.api.operations[req.operation];
	  var input = operation.input;

	  var uri = generateURI(req.httpRequest.endpoint.path, operation.httpPath, input, req.params);
	  req.httpRequest.path = uri;
	}

	function populateHeaders(req) {
	  var operation = req.service.api.operations[req.operation];
	  util.each(operation.input.members, function (name, member) {
	    var value = req.params[name];
	    if (value === null || value === undefined) return;

	    if (member.location === 'headers' && member.type === 'map') {
	      util.each(value, function(key, memberValue) {
	        req.httpRequest.headers[member.name + key] = memberValue;
	      });
	    } else if (member.location === 'header') {
	      value = member.toWireFormat(value).toString();
	      req.httpRequest.headers[member.name] = value;
	    }
	  });
	}

	function buildRequest(req) {
	  populateMethod(req);
	  populateURI(req);
	  populateHeaders(req);
	}

	function extractError() {
	}

	function extractData(resp) {
	  var req = resp.request;
	  var data = {};
	  var r = resp.httpResponse;
	  var operation = req.service.api.operations[req.operation];
	  var output = operation.output;

	  // normalize headers names to lower-cased keys for matching
	  var headers = {};
	  util.each(r.headers, function (k, v) {
	    headers[k.toLowerCase()] = v;
	  });

	  util.each(output.members, function(name, member) {
	    var header = (member.name || name).toLowerCase();
	    if (member.location === 'headers' && member.type === 'map') {
	      data[name] = {};
	      var location = member.isLocationName ? member.name : '';
	      var pattern = new RegExp('^' + location + '(.+)', 'i');
	      util.each(r.headers, function (k, v) {
	        var result = k.match(pattern);
	        if (result !== null) {
	          data[name][result[1]] = v;
	        }
	      });
	    } else if (member.location === 'header') {
	      if (headers[header] !== undefined) {
	        data[name] = headers[header];
	      }
	    } else if (member.location === 'statusCode') {
	      data[name] = parseInt(r.statusCode, 10);
	    }
	  });

	  resp.data = data;
	}

	module.exports = {
	  buildRequest: buildRequest,
	  extractError: extractError,
	  extractData: extractData,
	  generateURI: generateURI
	};


/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	var util = __webpack_require__(4);
	var Rest = __webpack_require__(13);
	var Json = __webpack_require__(6);
	var JsonBuilder = __webpack_require__(7);
	var JsonParser = __webpack_require__(8);

	function populateBody(req) {
	  var builder = new JsonBuilder();
	  var input = req.service.api.operations[req.operation].input;

	  if (input.payload) {
	    var params = {};
	    var payloadShape = input.members[input.payload];
	    params = req.params[input.payload];
	    if (params === undefined) return;

	    if (payloadShape.type === 'structure') {
	      req.httpRequest.body = builder.build(params, payloadShape);
	    } else { // non-JSON payload
	      req.httpRequest.body = params;
	    }
	  } else {
	    req.httpRequest.body = builder.build(req.params, input);
	  }
	}

	function buildRequest(req) {
	  Rest.buildRequest(req);

	  // never send body payload on GET/HEAD/DELETE
	  if (['GET', 'HEAD', 'DELETE'].indexOf(req.httpRequest.method) < 0) {
	    populateBody(req);
	  }
	}

	function extractError(resp) {
	  Json.extractError(resp);
	}

	function extractData(resp) {
	  Rest.extractData(resp);

	  var req = resp.request;
	  var rules = req.service.api.operations[req.operation].output || {};
	  if (rules.payload) {
	    var payloadMember = rules.members[rules.payload];
	    var body = resp.httpResponse.body;
	    if (payloadMember.isStreaming) {
	      resp.data[rules.payload] = body;
	    } else if (payloadMember.type === 'structure' || payloadMember.type === 'list') {
	      var parser = new JsonParser();
	      resp.data[rules.payload] = parser.parse(body, payloadMember);
	    } else {
	      resp.data[rules.payload] = body.toString();
	    }
	  } else {
	    var data = resp.data;
	    Json.extractData(resp);
	    resp.data = util.merge(data, resp.data);
	  }
	}

	module.exports = {
	  buildRequest: buildRequest,
	  extractError: extractError,
	  extractData: extractData
	};


/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	var AWS = __webpack_require__(5);
	var util = __webpack_require__(4);
	var Rest = __webpack_require__(13);

	function populateBody(req) {
	  var input = req.service.api.operations[req.operation].input;
	  var builder = new AWS.XML.Builder();
	  var params = req.params;

	  var payload = input.payload;
	  if (payload) {
	    var payloadMember = input.members[payload];
	    params = params[payload];
	    if (params === undefined) return;

	    if (payloadMember.type === 'structure') {
	      var rootElement = payloadMember.name;
	      req.httpRequest.body = builder.toXML(params, payloadMember, rootElement, true);
	    } else { // non-xml payload
	      req.httpRequest.body = params;
	    }
	  } else {
	    req.httpRequest.body = builder.toXML(params, input, input.name ||
	      input.shape || util.string.upperFirst(req.operation) + 'Request');
	  }
	}

	function buildRequest(req) {
	  Rest.buildRequest(req);

	  // never send body payload on GET/HEAD
	  if (['GET', 'HEAD'].indexOf(req.httpRequest.method) < 0) {
	    populateBody(req);
	  }
	}

	function extractError(resp) {
	  Rest.extractError(resp);

	  var data = new AWS.XML.Parser().parse(resp.httpResponse.body.toString());
	  if (data.Errors) data = data.Errors;
	  if (data.Error) data = data.Error;
	  if (data.Code) {
	    resp.error = util.error(new Error(), {
	      code: data.Code,
	      message: data.Message
	    });
	  } else {
	    resp.error = util.error(new Error(), {
	      code: resp.httpResponse.statusCode,
	      message: null
	    });
	  }
	}

	function extractData(resp) {
	  Rest.extractData(resp);

	  var parser;
	  var req = resp.request;
	  var body = resp.httpResponse.body;
	  var operation = req.service.api.operations[req.operation];
	  var output = operation.output;

	  var payload = output.payload;
	  if (payload) {
	    var payloadMember = output.members[payload];
	    if (payloadMember.isStreaming) {
	      resp.data[payload] = body;
	    } else if (payloadMember.type === 'structure') {
	      parser = new AWS.XML.Parser();
	      resp.data[payload] = parser.parse(body.toString(), payloadMember);
	    } else {
	      resp.data[payload] = body.toString();
	    }
	  } else if (body.length > 0) {
	    parser = new AWS.XML.Parser();
	    var data = parser.parse(body.toString(), output);
	    util.update(resp.data, data);
	  }
	}

	module.exports = {
	  buildRequest: buildRequest,
	  extractError: extractError,
	  extractData: extractData
	};


/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	var util = __webpack_require__(4);
	var builder = __webpack_require__(17);

	function XmlBuilder() { }

	XmlBuilder.prototype.toXML = function(params, shape, rootElement, noEmpty) {
	  var xml = builder.create(rootElement);
	  applyNamespaces(xml, shape);
	  serialize(xml, params, shape);
	  return xml.children.length > 0 || noEmpty ? xml.root().toString() : '';
	};

	function serialize(xml, value, shape) {
	  switch (shape.type) {
	    case 'structure': return serializeStructure(xml, value, shape);
	    case 'map': return serializeMap(xml, value, shape);
	    case 'list': return serializeList(xml, value, shape);
	    default: return serializeScalar(xml, value, shape);
	  }
	}

	function serializeStructure(xml, params, shape) {
	  util.arrayEach(shape.memberNames, function(memberName) {
	    var memberShape = shape.members[memberName];
	    if (memberShape.location !== 'body') return;

	    var value = params[memberName];
	    var name = memberShape.name;
	    if (value !== undefined && value !== null) {
	      if (memberShape.isXmlAttribute) {
	        xml.att(name, value);
	      } else if (memberShape.flattened) {
	        serialize(xml, value, memberShape);
	      } else {
	        var element = xml.ele(name);
	        applyNamespaces(element, memberShape);
	        serialize(element, value, memberShape);
	      }
	    }
	  });
	}

	function serializeMap(xml, map, shape) {
	  var xmlKey = shape.key.name || 'key';
	  var xmlValue = shape.value.name || 'value';

	  util.each(map, function(key, value) {
	    var entry = xml.ele(shape.flattened ? shape.name : 'entry');
	    serialize(entry.ele(xmlKey), key, shape.key);
	    serialize(entry.ele(xmlValue), value, shape.value);
	  });
	}

	function serializeList(xml, list, shape) {
	  if (shape.flattened) {
	    util.arrayEach(list, function(value) {
	      var name = shape.member.name || shape.name;
	      var element = xml.ele(name);
	      serialize(element, value, shape.member);
	    });
	  } else {
	    util.arrayEach(list, function(value) {
	      var name = shape.member.name || 'member';
	      var element = xml.ele(name);
	      serialize(element, value, shape.member);
	    });
	  }
	}

	function serializeScalar(xml, value, shape) {
	  xml.txt(shape.toWireFormat(value));
	}

	function applyNamespaces(xml, shape) {
	  var uri, prefix = 'xmlns';
	  if (shape.xmlNamespaceUri) {
	    uri = shape.xmlNamespaceUri;
	    if (shape.xmlNamespacePrefix) prefix += ':' + shape.xmlNamespacePrefix;
	  } else if (xml.isRoot && shape.api.xmlNamespaceUri) {
	    uri = shape.api.xmlNamespaceUri;
	  }

	  if (uri) xml.att(prefix, uri);
	}

	module.exports = XmlBuilder;


/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	// Generated by CoffeeScript 1.9.1
	(function() {
	  var XMLBuilder, assign;

	  assign = __webpack_require__(18);

	  XMLBuilder = __webpack_require__(38);

	  module.exports.create = function(name, xmldec, doctype, options) {
	    options = assign({}, xmldec, doctype, options);
	    return new XMLBuilder(name, options).root();
	  };

	}).call(this);


/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	var baseAssign = __webpack_require__(19),
	    createAssigner = __webpack_require__(34);

	/**
	 * Assigns own enumerable properties of source object(s) to the destination
	 * object. Subsequent sources overwrite property assignments of previous sources.
	 * If `customizer` is provided it is invoked to produce the assigned values.
	 * The `customizer` is bound to `thisArg` and invoked with five arguments;
	 * (objectValue, sourceValue, key, object, source).
	 *
	 * @static
	 * @memberOf _
	 * @alias extend
	 * @category Object
	 * @param {Object} object The destination object.
	 * @param {...Object} [sources] The source objects.
	 * @param {Function} [customizer] The function to customize assigning values.
	 * @param {*} [thisArg] The `this` binding of `customizer`.
	 * @returns {Object} Returns `object`.
	 * @example
	 *
	 * _.assign({ 'user': 'barney' }, { 'age': 40 }, { 'user': 'fred' });
	 * // => { 'user': 'fred', 'age': 40 }
	 *
	 * // using a customizer callback
	 * var defaults = _.partialRight(_.assign, function(value, other) {
	 *   return typeof value == 'undefined' ? other : value;
	 * });
	 *
	 * defaults({ 'user': 'barney' }, { 'age': 36 }, { 'user': 'fred' });
	 * // => { 'user': 'barney', 'age': 36 }
	 */
	var assign = createAssigner(baseAssign);

	module.exports = assign;


/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	var baseCopy = __webpack_require__(20),
	    keys = __webpack_require__(21);

	/**
	 * The base implementation of `_.assign` without support for argument juggling,
	 * multiple sources, and `this` binding `customizer` functions.
	 *
	 * @private
	 * @param {Object} object The destination object.
	 * @param {Object} source The source object.
	 * @param {Function} [customizer] The function to customize assigning values.
	 * @returns {Object} Returns the destination object.
	 */
	function baseAssign(object, source, customizer) {
	  var props = keys(source);
	  if (!customizer) {
	    return baseCopy(source, object, props);
	  }
	  var index = -1,
	      length = props.length;

	  while (++index < length) {
	    var key = props[index],
	        value = object[key],
	        result = customizer(value, source[key], key, object, source);

	    if ((result === result ? (result !== value) : (value === value)) ||
	        (typeof value == 'undefined' && !(key in object))) {
	      object[key] = result;
	    }
	  }
	  return object;
	}

	module.exports = baseAssign;


/***/ },
/* 20 */
/***/ function(module, exports) {

	/**
	 * Copies the properties of `source` to `object`.
	 *
	 * @private
	 * @param {Object} source The object to copy properties from.
	 * @param {Object} [object={}] The object to copy properties to.
	 * @param {Array} props The property names to copy.
	 * @returns {Object} Returns `object`.
	 */
	function baseCopy(source, object, props) {
	  if (!props) {
	    props = object;
	    object = {};
	  }
	  var index = -1,
	      length = props.length;

	  while (++index < length) {
	    var key = props[index];
	    object[key] = source[key];
	  }
	  return object;
	}

	module.exports = baseCopy;


/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	var isLength = __webpack_require__(22),
	    isNative = __webpack_require__(23),
	    isObject = __webpack_require__(27),
	    shimKeys = __webpack_require__(28);

	/* Native method references for those with the same name as other `lodash` methods. */
	var nativeKeys = isNative(nativeKeys = Object.keys) && nativeKeys;

	/**
	 * Creates an array of the own enumerable property names of `object`.
	 *
	 * **Note:** Non-object values are coerced to objects. See the
	 * [ES spec](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.keys)
	 * for more details.
	 *
	 * @static
	 * @memberOf _
	 * @category Object
	 * @param {Object} object The object to inspect.
	 * @returns {Array} Returns the array of property names.
	 * @example
	 *
	 * function Foo() {
	 *   this.a = 1;
	 *   this.b = 2;
	 * }
	 *
	 * Foo.prototype.c = 3;
	 *
	 * _.keys(new Foo);
	 * // => ['a', 'b'] (iteration order is not guaranteed)
	 *
	 * _.keys('hi');
	 * // => ['0', '1']
	 */
	var keys = !nativeKeys ? shimKeys : function(object) {
	  if (object) {
	    var Ctor = object.constructor,
	        length = object.length;
	  }
	  if ((typeof Ctor == 'function' && Ctor.prototype === object) ||
	      (typeof object != 'function' && (length && isLength(length)))) {
	    return shimKeys(object);
	  }
	  return isObject(object) ? nativeKeys(object) : [];
	};

	module.exports = keys;


/***/ },
/* 22 */
/***/ function(module, exports) {

	/**
	 * Used as the maximum length of an array-like value.
	 * See the [ES spec](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-number.max_safe_integer)
	 * for more details.
	 */
	var MAX_SAFE_INTEGER = Math.pow(2, 53) - 1;

	/**
	 * Checks if `value` is a valid array-like length.
	 *
	 * **Note:** This function is based on ES `ToLength`. See the
	 * [ES spec](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength)
	 * for more details.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
	 */
	function isLength(value) {
	  return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
	}

	module.exports = isLength;


/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	var escapeRegExp = __webpack_require__(24),
	    isObjectLike = __webpack_require__(26);

	/** `Object#toString` result references. */
	var funcTag = '[object Function]';

	/** Used to detect host constructors (Safari > 5). */
	var reHostCtor = /^\[object .+?Constructor\]$/;

	/** Used for native method references. */
	var objectProto = Object.prototype;

	/** Used to resolve the decompiled source of functions. */
	var fnToString = Function.prototype.toString;

	/**
	 * Used to resolve the `toStringTag` of values.
	 * See the [ES spec](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.prototype.tostring)
	 * for more details.
	 */
	var objToString = objectProto.toString;

	/** Used to detect if a method is native. */
	var reNative = RegExp('^' +
	  escapeRegExp(objToString)
	  .replace(/toString|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
	);

	/**
	 * Checks if `value` is a native function.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a native function, else `false`.
	 * @example
	 *
	 * _.isNative(Array.prototype.push);
	 * // => true
	 *
	 * _.isNative(_);
	 * // => false
	 */
	function isNative(value) {
	  if (value == null) {
	    return false;
	  }
	  if (objToString.call(value) == funcTag) {
	    return reNative.test(fnToString.call(value));
	  }
	  return (isObjectLike(value) && reHostCtor.test(value)) || false;
	}

	module.exports = isNative;


/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	var baseToString = __webpack_require__(25);

	/**
	 * Used to match `RegExp` special characters.
	 * See this [article on `RegExp` characters](http://www.regular-expressions.info/characters.html#special)
	 * for more details.
	 */
	var reRegExpChars = /[.*+?^${}()|[\]\/\\]/g,
	    reHasRegExpChars = RegExp(reRegExpChars.source);

	/**
	 * Escapes the `RegExp` special characters "\", "^", "$", ".", "|", "?", "*",
	 * "+", "(", ")", "[", "]", "{" and "}" in `string`.
	 *
	 * @static
	 * @memberOf _
	 * @category String
	 * @param {string} [string=''] The string to escape.
	 * @returns {string} Returns the escaped string.
	 * @example
	 *
	 * _.escapeRegExp('[lodash](https://lodash.com/)');
	 * // => '\[lodash\]\(https://lodash\.com/\)'
	 */
	function escapeRegExp(string) {
	  string = baseToString(string);
	  return (string && reHasRegExpChars.test(string))
	    ? string.replace(reRegExpChars, '\\$&')
	    : string;
	}

	module.exports = escapeRegExp;


/***/ },
/* 25 */
/***/ function(module, exports) {

	/**
	 * Converts `value` to a string if it is not one. An empty string is returned
	 * for `null` or `undefined` values.
	 *
	 * @private
	 * @param {*} value The value to process.
	 * @returns {string} Returns the string.
	 */
	function baseToString(value) {
	  if (typeof value == 'string') {
	    return value;
	  }
	  return value == null ? '' : (value + '');
	}

	module.exports = baseToString;


/***/ },
/* 26 */
/***/ function(module, exports) {

	/**
	 * Checks if `value` is object-like.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
	 */
	function isObjectLike(value) {
	  return (value && typeof value == 'object') || false;
	}

	module.exports = isObjectLike;


/***/ },
/* 27 */
/***/ function(module, exports) {

	/**
	 * Checks if `value` is the language type of `Object`.
	 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
	 *
	 * **Note:** See the [ES5 spec](https://es5.github.io/#x8) for more details.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
	 * @example
	 *
	 * _.isObject({});
	 * // => true
	 *
	 * _.isObject([1, 2, 3]);
	 * // => true
	 *
	 * _.isObject(1);
	 * // => false
	 */
	function isObject(value) {
	  // Avoid a V8 JIT bug in Chrome 19-20.
	  // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
	  var type = typeof value;
	  return type == 'function' || (value && type == 'object') || false;
	}

	module.exports = isObject;


/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	var isArguments = __webpack_require__(29),
	    isArray = __webpack_require__(30),
	    isIndex = __webpack_require__(31),
	    isLength = __webpack_require__(22),
	    keysIn = __webpack_require__(32),
	    support = __webpack_require__(33);

	/** Used for native method references. */
	var objectProto = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

	/**
	 * A fallback implementation of `Object.keys` which creates an array of the
	 * own enumerable property names of `object`.
	 *
	 * @private
	 * @param {Object} object The object to inspect.
	 * @returns {Array} Returns the array of property names.
	 */
	function shimKeys(object) {
	  var props = keysIn(object),
	      propsLength = props.length,
	      length = propsLength && object.length;

	  var allowIndexes = length && isLength(length) &&
	    (isArray(object) || (support.nonEnumArgs && isArguments(object)));

	  var index = -1,
	      result = [];

	  while (++index < propsLength) {
	    var key = props[index];
	    if ((allowIndexes && isIndex(key, length)) || hasOwnProperty.call(object, key)) {
	      result.push(key);
	    }
	  }
	  return result;
	}

	module.exports = shimKeys;


/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	var isLength = __webpack_require__(22),
	    isObjectLike = __webpack_require__(26);

	/** `Object#toString` result references. */
	var argsTag = '[object Arguments]';

	/** Used for native method references. */
	var objectProto = Object.prototype;

	/**
	 * Used to resolve the `toStringTag` of values.
	 * See the [ES spec](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.prototype.tostring)
	 * for more details.
	 */
	var objToString = objectProto.toString;

	/**
	 * Checks if `value` is classified as an `arguments` object.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
	 * @example
	 *
	 * _.isArguments(function() { return arguments; }());
	 * // => true
	 *
	 * _.isArguments([1, 2, 3]);
	 * // => false
	 */
	function isArguments(value) {
	  var length = isObjectLike(value) ? value.length : undefined;
	  return (isLength(length) && objToString.call(value) == argsTag) || false;
	}

	module.exports = isArguments;


/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	var isLength = __webpack_require__(22),
	    isNative = __webpack_require__(23),
	    isObjectLike = __webpack_require__(26);

	/** `Object#toString` result references. */
	var arrayTag = '[object Array]';

	/** Used for native method references. */
	var objectProto = Object.prototype;

	/**
	 * Used to resolve the `toStringTag` of values.
	 * See the [ES spec](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.prototype.tostring)
	 * for more details.
	 */
	var objToString = objectProto.toString;

	/* Native method references for those with the same name as other `lodash` methods. */
	var nativeIsArray = isNative(nativeIsArray = Array.isArray) && nativeIsArray;

	/**
	 * Checks if `value` is classified as an `Array` object.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
	 * @example
	 *
	 * _.isArray([1, 2, 3]);
	 * // => true
	 *
	 * _.isArray(function() { return arguments; }());
	 * // => false
	 */
	var isArray = nativeIsArray || function(value) {
	  return (isObjectLike(value) && isLength(value.length) && objToString.call(value) == arrayTag) || false;
	};

	module.exports = isArray;


/***/ },
/* 31 */
/***/ function(module, exports) {

	/**
	 * Used as the maximum length of an array-like value.
	 * See the [ES spec](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-number.max_safe_integer)
	 * for more details.
	 */
	var MAX_SAFE_INTEGER = Math.pow(2, 53) - 1;

	/**
	 * Checks if `value` is a valid array-like index.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
	 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
	 */
	function isIndex(value, length) {
	  value = +value;
	  length = length == null ? MAX_SAFE_INTEGER : length;
	  return value > -1 && value % 1 == 0 && value < length;
	}

	module.exports = isIndex;


/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	var isArguments = __webpack_require__(29),
	    isArray = __webpack_require__(30),
	    isIndex = __webpack_require__(31),
	    isLength = __webpack_require__(22),
	    isObject = __webpack_require__(27),
	    support = __webpack_require__(33);

	/** Used for native method references. */
	var objectProto = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

	/**
	 * Creates an array of the own and inherited enumerable property names of `object`.
	 *
	 * **Note:** Non-object values are coerced to objects.
	 *
	 * @static
	 * @memberOf _
	 * @category Object
	 * @param {Object} object The object to inspect.
	 * @returns {Array} Returns the array of property names.
	 * @example
	 *
	 * function Foo() {
	 *   this.a = 1;
	 *   this.b = 2;
	 * }
	 *
	 * Foo.prototype.c = 3;
	 *
	 * _.keysIn(new Foo);
	 * // => ['a', 'b', 'c'] (iteration order is not guaranteed)
	 */
	function keysIn(object) {
	  if (object == null) {
	    return [];
	  }
	  if (!isObject(object)) {
	    object = Object(object);
	  }
	  var length = object.length;
	  length = (length && isLength(length) &&
	    (isArray(object) || (support.nonEnumArgs && isArguments(object))) && length) || 0;

	  var Ctor = object.constructor,
	      index = -1,
	      isProto = typeof Ctor == 'function' && Ctor.prototype === object,
	      result = Array(length),
	      skipIndexes = length > 0;

	  while (++index < length) {
	    result[index] = (index + '');
	  }
	  for (var key in object) {
	    if (!(skipIndexes && isIndex(key, length)) &&
	        !(key == 'constructor' && (isProto || !hasOwnProperty.call(object, key)))) {
	      result.push(key);
	    }
	  }
	  return result;
	}

	module.exports = keysIn;


/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	var isNative = __webpack_require__(23);

	/** Used to detect functions containing a `this` reference. */
	var reThis = /\bthis\b/;

	/** Used for native method references. */
	var objectProto = Object.prototype;

	/** Used to detect DOM support. */
	var document = (document = global.window) && document.document;

	/** Native method references. */
	var propertyIsEnumerable = objectProto.propertyIsEnumerable;

	/**
	 * An object environment feature flags.
	 *
	 * @static
	 * @memberOf _
	 * @type Object
	 */
	var support = {};

	(function(x) {

	  /**
	   * Detect if functions can be decompiled by `Function#toString`
	   * (all but Firefox OS certified apps, older Opera mobile browsers, and
	   * the PlayStation 3; forced `false` for Windows 8 apps).
	   *
	   * @memberOf _.support
	   * @type boolean
	   */
	  support.funcDecomp = !isNative(global.WinRTError) && reThis.test(function() { return this; });

	  /**
	   * Detect if `Function#name` is supported (all but IE).
	   *
	   * @memberOf _.support
	   * @type boolean
	   */
	  support.funcNames = typeof Function.name == 'string';

	  /**
	   * Detect if the DOM is supported.
	   *
	   * @memberOf _.support
	   * @type boolean
	   */
	  try {
	    support.dom = document.createDocumentFragment().nodeType === 11;
	  } catch(e) {
	    support.dom = false;
	  }

	  /**
	   * Detect if `arguments` object indexes are non-enumerable.
	   *
	   * In Firefox < 4, IE < 9, PhantomJS, and Safari < 5.1 `arguments` object
	   * indexes are non-enumerable. Chrome < 25 and Node.js < 0.11.0 treat
	   * `arguments` object indexes as non-enumerable and fail `hasOwnProperty`
	   * checks for indexes that exceed their function's formal parameters with
	   * associated values of `0`.
	   *
	   * @memberOf _.support
	   * @type boolean
	   */
	  try {
	    support.nonEnumArgs = !propertyIsEnumerable.call(arguments, 1);
	  } catch(e) {
	    support.nonEnumArgs = true;
	  }
	}(0, 0));

	module.exports = support;


/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	var bindCallback = __webpack_require__(35),
	    isIterateeCall = __webpack_require__(37);

	/**
	 * Creates a function that assigns properties of source object(s) to a given
	 * destination object.
	 *
	 * @private
	 * @param {Function} assigner The function to assign values.
	 * @returns {Function} Returns the new assigner function.
	 */
	function createAssigner(assigner) {
	  return function() {
	    var args = arguments,
	        length = args.length,
	        object = args[0];

	    if (length < 2 || object == null) {
	      return object;
	    }
	    var customizer = args[length - 2],
	        thisArg = args[length - 1],
	        guard = args[3];

	    if (length > 3 && typeof customizer == 'function') {
	      customizer = bindCallback(customizer, thisArg, 5);
	      length -= 2;
	    } else {
	      customizer = (length > 2 && typeof thisArg == 'function') ? thisArg : null;
	      length -= (customizer ? 1 : 0);
	    }
	    if (guard && isIterateeCall(args[1], args[2], guard)) {
	      customizer = length == 3 ? null : customizer;
	      length = 2;
	    }
	    var index = 0;
	    while (++index < length) {
	      var source = args[index];
	      if (source) {
	        assigner(object, source, customizer);
	      }
	    }
	    return object;
	  };
	}

	module.exports = createAssigner;


/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	var identity = __webpack_require__(36);

	/**
	 * A specialized version of `baseCallback` which only supports `this` binding
	 * and specifying the number of arguments to provide to `func`.
	 *
	 * @private
	 * @param {Function} func The function to bind.
	 * @param {*} thisArg The `this` binding of `func`.
	 * @param {number} [argCount] The number of arguments to provide to `func`.
	 * @returns {Function} Returns the callback.
	 */
	function bindCallback(func, thisArg, argCount) {
	  if (typeof func != 'function') {
	    return identity;
	  }
	  if (typeof thisArg == 'undefined') {
	    return func;
	  }
	  switch (argCount) {
	    case 1: return function(value) {
	      return func.call(thisArg, value);
	    };
	    case 3: return function(value, index, collection) {
	      return func.call(thisArg, value, index, collection);
	    };
	    case 4: return function(accumulator, value, index, collection) {
	      return func.call(thisArg, accumulator, value, index, collection);
	    };
	    case 5: return function(value, other, key, object, source) {
	      return func.call(thisArg, value, other, key, object, source);
	    };
	  }
	  return function() {
	    return func.apply(thisArg, arguments);
	  };
	}

	module.exports = bindCallback;


/***/ },
/* 36 */
/***/ function(module, exports) {

	/**
	 * This method returns the first argument provided to it.
	 *
	 * @static
	 * @memberOf _
	 * @category Utility
	 * @param {*} value Any value.
	 * @returns {*} Returns `value`.
	 * @example
	 *
	 * var object = { 'user': 'fred' };
	 *
	 * _.identity(object) === object;
	 * // => true
	 */
	function identity(value) {
	  return value;
	}

	module.exports = identity;


/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	var isIndex = __webpack_require__(31),
	    isLength = __webpack_require__(22),
	    isObject = __webpack_require__(27);

	/**
	 * Checks if the provided arguments are from an iteratee call.
	 *
	 * @private
	 * @param {*} value The potential iteratee value argument.
	 * @param {*} index The potential iteratee index or key argument.
	 * @param {*} object The potential iteratee object argument.
	 * @returns {boolean} Returns `true` if the arguments are from an iteratee call, else `false`.
	 */
	function isIterateeCall(value, index, object) {
	  if (!isObject(object)) {
	    return false;
	  }
	  var type = typeof index;
	  if (type == 'number') {
	    var length = object.length,
	        prereq = isLength(length) && isIndex(index, length);
	  } else {
	    prereq = type == 'string' && index in object;
	  }
	  if (prereq) {
	    var other = object[index];
	    return value === value ? (value === other) : (other !== other);
	  }
	  return false;
	}

	module.exports = isIterateeCall;


/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	// Generated by CoffeeScript 1.9.1
	(function() {
	  var XMLBuilder, XMLDeclaration, XMLDocType, XMLElement, XMLStringifier;

	  XMLStringifier = __webpack_require__(39);

	  XMLDeclaration = __webpack_require__(40);

	  XMLDocType = __webpack_require__(75);

	  XMLElement = __webpack_require__(48);

	  module.exports = XMLBuilder = (function() {
	    function XMLBuilder(name, options) {
	      var root, temp;
	      if (name == null) {
	        throw new Error("Root element needs a name");
	      }
	      if (options == null) {
	        options = {};
	      }
	      this.options = options;
	      this.stringify = new XMLStringifier(options);
	      temp = new XMLElement(this, 'doc');
	      root = temp.element(name);
	      root.isRoot = true;
	      root.documentObject = this;
	      this.rootObject = root;
	      if (!options.headless) {
	        root.declaration(options);
	        if ((options.pubID != null) || (options.sysID != null)) {
	          root.doctype(options);
	        }
	      }
	    }

	    XMLBuilder.prototype.root = function() {
	      return this.rootObject;
	    };

	    XMLBuilder.prototype.end = function(options) {
	      return this.toString(options);
	    };

	    XMLBuilder.prototype.toString = function(options) {
	      var indent, newline, offset, pretty, r, ref, ref1, ref2;
	      pretty = (options != null ? options.pretty : void 0) || false;
	      indent = (ref = options != null ? options.indent : void 0) != null ? ref : '  ';
	      offset = (ref1 = options != null ? options.offset : void 0) != null ? ref1 : 0;
	      newline = (ref2 = options != null ? options.newline : void 0) != null ? ref2 : '\n';
	      r = '';
	      if (this.xmldec != null) {
	        r += this.xmldec.toString(options);
	      }
	      if (this.doctype != null) {
	        r += this.doctype.toString(options);
	      }
	      r += this.rootObject.toString(options);
	      if (pretty && r.slice(-newline.length) === newline) {
	        r = r.slice(0, -newline.length);
	      }
	      return r;
	    };

	    return XMLBuilder;

	  })();

	}).call(this);


/***/ },
/* 39 */
/***/ function(module, exports) {

	// Generated by CoffeeScript 1.9.1
	(function() {
	  var XMLStringifier,
	    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
	    hasProp = {}.hasOwnProperty;

	  module.exports = XMLStringifier = (function() {
	    function XMLStringifier(options) {
	      this.assertLegalChar = bind(this.assertLegalChar, this);
	      var key, ref, value;
	      this.allowSurrogateChars = options != null ? options.allowSurrogateChars : void 0;
	      ref = (options != null ? options.stringify : void 0) || {};
	      for (key in ref) {
	        if (!hasProp.call(ref, key)) continue;
	        value = ref[key];
	        this[key] = value;
	      }
	    }

	    XMLStringifier.prototype.eleName = function(val) {
	      val = '' + val || '';
	      return this.assertLegalChar(val);
	    };

	    XMLStringifier.prototype.eleText = function(val) {
	      val = '' + val || '';
	      return this.assertLegalChar(this.elEscape(val));
	    };

	    XMLStringifier.prototype.cdata = function(val) {
	      val = '' + val || '';
	      if (val.match(/]]>/)) {
	        throw new Error("Invalid CDATA text: " + val);
	      }
	      return this.assertLegalChar(val);
	    };

	    XMLStringifier.prototype.comment = function(val) {
	      val = '' + val || '';
	      if (val.match(/--/)) {
	        throw new Error("Comment text cannot contain double-hypen: " + val);
	      }
	      return this.assertLegalChar(val);
	    };

	    XMLStringifier.prototype.raw = function(val) {
	      return '' + val || '';
	    };

	    XMLStringifier.prototype.attName = function(val) {
	      return '' + val || '';
	    };

	    XMLStringifier.prototype.attValue = function(val) {
	      val = '' + val || '';
	      return this.attEscape(val);
	    };

	    XMLStringifier.prototype.insTarget = function(val) {
	      return '' + val || '';
	    };

	    XMLStringifier.prototype.insValue = function(val) {
	      val = '' + val || '';
	      if (val.match(/\?>/)) {
	        throw new Error("Invalid processing instruction value: " + val);
	      }
	      return val;
	    };

	    XMLStringifier.prototype.xmlVersion = function(val) {
	      val = '' + val || '';
	      if (!val.match(/1\.[0-9]+/)) {
	        throw new Error("Invalid version number: " + val);
	      }
	      return val;
	    };

	    XMLStringifier.prototype.xmlEncoding = function(val) {
	      val = '' + val || '';
	      if (!val.match(/[A-Za-z](?:[A-Za-z0-9._-]|-)*/)) {
	        throw new Error("Invalid encoding: " + val);
	      }
	      return val;
	    };

	    XMLStringifier.prototype.xmlStandalone = function(val) {
	      if (val) {
	        return "yes";
	      } else {
	        return "no";
	      }
	    };

	    XMLStringifier.prototype.dtdPubID = function(val) {
	      return '' + val || '';
	    };

	    XMLStringifier.prototype.dtdSysID = function(val) {
	      return '' + val || '';
	    };

	    XMLStringifier.prototype.dtdElementValue = function(val) {
	      return '' + val || '';
	    };

	    XMLStringifier.prototype.dtdAttType = function(val) {
	      return '' + val || '';
	    };

	    XMLStringifier.prototype.dtdAttDefault = function(val) {
	      if (val != null) {
	        return '' + val || '';
	      } else {
	        return val;
	      }
	    };

	    XMLStringifier.prototype.dtdEntityValue = function(val) {
	      return '' + val || '';
	    };

	    XMLStringifier.prototype.dtdNData = function(val) {
	      return '' + val || '';
	    };

	    XMLStringifier.prototype.convertAttKey = '@';

	    XMLStringifier.prototype.convertPIKey = '?';

	    XMLStringifier.prototype.convertTextKey = '#text';

	    XMLStringifier.prototype.convertCDataKey = '#cdata';

	    XMLStringifier.prototype.convertCommentKey = '#comment';

	    XMLStringifier.prototype.convertRawKey = '#raw';

	    XMLStringifier.prototype.convertListKey = '#list';

	    XMLStringifier.prototype.assertLegalChar = function(str) {
	      var chars, chr;
	      if (this.allowSurrogateChars) {
	        chars = /[\u0000-\u0008\u000B-\u000C\u000E-\u001F\uFFFE-\uFFFF]/;
	      } else {
	        chars = /[\u0000-\u0008\u000B-\u000C\u000E-\u001F\uD800-\uDFFF\uFFFE-\uFFFF]/;
	      }
	      chr = str.match(chars);
	      if (chr) {
	        throw new Error("Invalid character (" + chr + ") in string: " + str + " at index " + chr.index);
	      }
	      return str;
	    };

	    XMLStringifier.prototype.elEscape = function(str) {
	      return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\r/g, '&#xD;');
	    };

	    XMLStringifier.prototype.attEscape = function(str) {
	      return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;').replace(/\t/g, '&#x9;').replace(/\n/g, '&#xA;').replace(/\r/g, '&#xD;');
	    };

	    return XMLStringifier;

	  })();

	}).call(this);


/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

	// Generated by CoffeeScript 1.9.1
	(function() {
	  var XMLDeclaration, XMLNode, create, isObject,
	    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
	    hasProp = {}.hasOwnProperty;

	  create = __webpack_require__(41);

	  isObject = __webpack_require__(27);

	  XMLNode = __webpack_require__(43);

	  module.exports = XMLDeclaration = (function(superClass) {
	    extend(XMLDeclaration, superClass);

	    function XMLDeclaration(parent, version, encoding, standalone) {
	      var ref;
	      XMLDeclaration.__super__.constructor.call(this, parent);
	      if (isObject(version)) {
	        ref = version, version = ref.version, encoding = ref.encoding, standalone = ref.standalone;
	      }
	      if (!version) {
	        version = '1.0';
	      }
	      if (version != null) {
	        this.version = this.stringify.xmlVersion(version);
	      }
	      if (encoding != null) {
	        this.encoding = this.stringify.xmlEncoding(encoding);
	      }
	      if (standalone != null) {
	        this.standalone = this.stringify.xmlStandalone(standalone);
	      }
	    }

	    XMLDeclaration.prototype.clone = function() {
	      return create(XMLDeclaration.prototype, this);
	    };

	    XMLDeclaration.prototype.toString = function(options, level) {
	      var indent, newline, offset, pretty, r, ref, ref1, ref2, space;
	      pretty = (options != null ? options.pretty : void 0) || false;
	      indent = (ref = options != null ? options.indent : void 0) != null ? ref : '  ';
	      offset = (ref1 = options != null ? options.offset : void 0) != null ? ref1 : 0;
	      newline = (ref2 = options != null ? options.newline : void 0) != null ? ref2 : '\n';
	      level || (level = 0);
	      space = new Array(level + offset + 1).join(indent);
	      r = '';
	      if (pretty) {
	        r += space;
	      }
	      r += '<?xml';
	      if (this.version != null) {
	        r += ' version="' + this.version + '"';
	      }
	      if (this.encoding != null) {
	        r += ' encoding="' + this.encoding + '"';
	      }
	      if (this.standalone != null) {
	        r += ' standalone="' + this.standalone + '"';
	      }
	      r += '?>';
	      if (pretty) {
	        r += newline;
	      }
	      return r;
	    };

	    return XMLDeclaration;

	  })(XMLNode);

	}).call(this);


/***/ },
/* 41 */
/***/ function(module, exports, __webpack_require__) {

	var baseCopy = __webpack_require__(20),
	    baseCreate = __webpack_require__(42),
	    isIterateeCall = __webpack_require__(37),
	    keys = __webpack_require__(21);

	/**
	 * Creates an object that inherits from the given `prototype` object. If a
	 * `properties` object is provided its own enumerable properties are assigned
	 * to the created object.
	 *
	 * @static
	 * @memberOf _
	 * @category Object
	 * @param {Object} prototype The object to inherit from.
	 * @param {Object} [properties] The properties to assign to the object.
	 * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
	 * @returns {Object} Returns the new object.
	 * @example
	 *
	 * function Shape() {
	 *   this.x = 0;
	 *   this.y = 0;
	 * }
	 *
	 * function Circle() {
	 *   Shape.call(this);
	 * }
	 *
	 * Circle.prototype = _.create(Shape.prototype, {
	 *   'constructor': Circle
	 * });
	 *
	 * var circle = new Circle;
	 * circle instanceof Circle;
	 * // => true
	 *
	 * circle instanceof Shape;
	 * // => true
	 */
	function create(prototype, properties, guard) {
	  var result = baseCreate(prototype);
	  if (guard && isIterateeCall(prototype, properties, guard)) {
	    properties = null;
	  }
	  return properties ? baseCopy(properties, result, keys(properties)) : result;
	}

	module.exports = create;


/***/ },
/* 42 */
/***/ function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(27);

	/**
	 * The base implementation of `_.create` without support for assigning
	 * properties to the created object.
	 *
	 * @private
	 * @param {Object} prototype The object to inherit from.
	 * @returns {Object} Returns the new object.
	 */
	var baseCreate = (function() {
	  function Object() {}
	  return function(prototype) {
	    if (isObject(prototype)) {
	      Object.prototype = prototype;
	      var result = new Object;
	      Object.prototype = null;
	    }
	    return result || global.Object();
	  };
	}());

	module.exports = baseCreate;


/***/ },
/* 43 */
/***/ function(module, exports, __webpack_require__) {

	// Generated by CoffeeScript 1.9.1
	(function() {
	  var XMLCData, XMLComment, XMLDeclaration, XMLDocType, XMLElement, XMLNode, XMLRaw, XMLText, isArray, isEmpty, isFunction, isObject,
	    hasProp = {}.hasOwnProperty;

	  isObject = __webpack_require__(27);

	  isArray = __webpack_require__(30);

	  isFunction = __webpack_require__(44);

	  isEmpty = __webpack_require__(46);

	  XMLElement = null;

	  XMLCData = null;

	  XMLComment = null;

	  XMLDeclaration = null;

	  XMLDocType = null;

	  XMLRaw = null;

	  XMLText = null;

	  module.exports = XMLNode = (function() {
	    function XMLNode(parent) {
	      this.parent = parent;
	      this.options = this.parent.options;
	      this.stringify = this.parent.stringify;
	      if (XMLElement === null) {
	        XMLElement = __webpack_require__(48);
	        XMLCData = __webpack_require__(73);
	        XMLComment = __webpack_require__(74);
	        XMLDeclaration = __webpack_require__(40);
	        XMLDocType = __webpack_require__(75);
	        XMLRaw = __webpack_require__(80);
	        XMLText = __webpack_require__(81);
	      }
	    }

	    XMLNode.prototype.clone = function() {
	      throw new Error("Cannot clone generic XMLNode");
	    };

	    XMLNode.prototype.element = function(name, attributes, text) {
	      var item, j, key, lastChild, len, ref, val;
	      lastChild = null;
	      if (attributes == null) {
	        attributes = {};
	      }
	      attributes = attributes.valueOf();
	      if (!isObject(attributes)) {
	        ref = [attributes, text], text = ref[0], attributes = ref[1];
	      }
	      if (name != null) {
	        name = name.valueOf();
	      }
	      if (isArray(name)) {
	        for (j = 0, len = name.length; j < len; j++) {
	          item = name[j];
	          lastChild = this.element(item);
	        }
	      } else if (isFunction(name)) {
	        lastChild = this.element(name.apply());
	      } else if (isObject(name)) {
	        for (key in name) {
	          if (!hasProp.call(name, key)) continue;
	          val = name[key];
	          if (isFunction(val)) {
	            val = val.apply();
	          }
	          if ((isObject(val)) && (isEmpty(val))) {
	            val = null;
	          }
	          if (!this.options.ignoreDecorators && this.stringify.convertAttKey && key.indexOf(this.stringify.convertAttKey) === 0) {
	            lastChild = this.attribute(key.substr(this.stringify.convertAttKey.length), val);
	          } else if (!this.options.ignoreDecorators && this.stringify.convertPIKey && key.indexOf(this.stringify.convertPIKey) === 0) {
	            lastChild = this.instruction(key.substr(this.stringify.convertPIKey.length), val);
	          } else if (isObject(val)) {
	            if (!this.options.ignoreDecorators && this.stringify.convertListKey && key.indexOf(this.stringify.convertListKey) === 0 && isArray(val)) {
	              lastChild = this.element(val);
	            } else {
	              lastChild = this.element(key);
	              lastChild.element(val);
	            }
	          } else {
	            lastChild = this.element(key, val);
	          }
	        }
	      } else {
	        if (!this.options.ignoreDecorators && this.stringify.convertTextKey && name.indexOf(this.stringify.convertTextKey) === 0) {
	          lastChild = this.text(text);
	        } else if (!this.options.ignoreDecorators && this.stringify.convertCDataKey && name.indexOf(this.stringify.convertCDataKey) === 0) {
	          lastChild = this.cdata(text);
	        } else if (!this.options.ignoreDecorators && this.stringify.convertCommentKey && name.indexOf(this.stringify.convertCommentKey) === 0) {
	          lastChild = this.comment(text);
	        } else if (!this.options.ignoreDecorators && this.stringify.convertRawKey && name.indexOf(this.stringify.convertRawKey) === 0) {
	          lastChild = this.raw(text);
	        } else {
	          lastChild = this.node(name, attributes, text);
	        }
	      }
	      if (lastChild == null) {
	        throw new Error("Could not create any elements with: " + name);
	      }
	      return lastChild;
	    };

	    XMLNode.prototype.insertBefore = function(name, attributes, text) {
	      var child, i, removed;
	      if (this.isRoot) {
	        throw new Error("Cannot insert elements at root level");
	      }
	      i = this.parent.children.indexOf(this);
	      removed = this.parent.children.splice(i);
	      child = this.parent.element(name, attributes, text);
	      Array.prototype.push.apply(this.parent.children, removed);
	      return child;
	    };

	    XMLNode.prototype.insertAfter = function(name, attributes, text) {
	      var child, i, removed;
	      if (this.isRoot) {
	        throw new Error("Cannot insert elements at root level");
	      }
	      i = this.parent.children.indexOf(this);
	      removed = this.parent.children.splice(i + 1);
	      child = this.parent.element(name, attributes, text);
	      Array.prototype.push.apply(this.parent.children, removed);
	      return child;
	    };

	    XMLNode.prototype.remove = function() {
	      var i, ref;
	      if (this.isRoot) {
	        throw new Error("Cannot remove the root element");
	      }
	      i = this.parent.children.indexOf(this);
	      [].splice.apply(this.parent.children, [i, i - i + 1].concat(ref = [])), ref;
	      return this.parent;
	    };

	    XMLNode.prototype.node = function(name, attributes, text) {
	      var child, ref;
	      if (name != null) {
	        name = name.valueOf();
	      }
	      if (attributes == null) {
	        attributes = {};
	      }
	      attributes = attributes.valueOf();
	      if (!isObject(attributes)) {
	        ref = [attributes, text], text = ref[0], attributes = ref[1];
	      }
	      child = new XMLElement(this, name, attributes);
	      if (text != null) {
	        child.text(text);
	      }
	      this.children.push(child);
	      return child;
	    };

	    XMLNode.prototype.text = function(value) {
	      var child;
	      child = new XMLText(this, value);
	      this.children.push(child);
	      return this;
	    };

	    XMLNode.prototype.cdata = function(value) {
	      var child;
	      child = new XMLCData(this, value);
	      this.children.push(child);
	      return this;
	    };

	    XMLNode.prototype.comment = function(value) {
	      var child;
	      child = new XMLComment(this, value);
	      this.children.push(child);
	      return this;
	    };

	    XMLNode.prototype.raw = function(value) {
	      var child;
	      child = new XMLRaw(this, value);
	      this.children.push(child);
	      return this;
	    };

	    XMLNode.prototype.declaration = function(version, encoding, standalone) {
	      var doc, xmldec;
	      doc = this.document();
	      xmldec = new XMLDeclaration(doc, version, encoding, standalone);
	      doc.xmldec = xmldec;
	      return doc.root();
	    };

	    XMLNode.prototype.doctype = function(pubID, sysID) {
	      var doc, doctype;
	      doc = this.document();
	      doctype = new XMLDocType(doc, pubID, sysID);
	      doc.doctype = doctype;
	      return doctype;
	    };

	    XMLNode.prototype.up = function() {
	      if (this.isRoot) {
	        throw new Error("The root node has no parent. Use doc() if you need to get the document object.");
	      }
	      return this.parent;
	    };

	    XMLNode.prototype.root = function() {
	      var child;
	      if (this.isRoot) {
	        return this;
	      }
	      child = this.parent;
	      while (!child.isRoot) {
	        child = child.parent;
	      }
	      return child;
	    };

	    XMLNode.prototype.document = function() {
	      return this.root().documentObject;
	    };

	    XMLNode.prototype.end = function(options) {
	      return this.document().toString(options);
	    };

	    XMLNode.prototype.prev = function() {
	      var i;
	      if (this.isRoot) {
	        throw new Error("Root node has no siblings");
	      }
	      i = this.parent.children.indexOf(this);
	      if (i < 1) {
	        throw new Error("Already at the first node");
	      }
	      return this.parent.children[i - 1];
	    };

	    XMLNode.prototype.next = function() {
	      var i;
	      if (this.isRoot) {
	        throw new Error("Root node has no siblings");
	      }
	      i = this.parent.children.indexOf(this);
	      if (i === -1 || i === this.parent.children.length - 1) {
	        throw new Error("Already at the last node");
	      }
	      return this.parent.children[i + 1];
	    };

	    XMLNode.prototype.importXMLBuilder = function(xmlbuilder) {
	      var clonedRoot;
	      clonedRoot = xmlbuilder.root().clone();
	      clonedRoot.parent = this;
	      clonedRoot.isRoot = false;
	      this.children.push(clonedRoot);
	      return this;
	    };

	    XMLNode.prototype.ele = function(name, attributes, text) {
	      return this.element(name, attributes, text);
	    };

	    XMLNode.prototype.nod = function(name, attributes, text) {
	      return this.node(name, attributes, text);
	    };

	    XMLNode.prototype.txt = function(value) {
	      return this.text(value);
	    };

	    XMLNode.prototype.dat = function(value) {
	      return this.cdata(value);
	    };

	    XMLNode.prototype.com = function(value) {
	      return this.comment(value);
	    };

	    XMLNode.prototype.doc = function() {
	      return this.document();
	    };

	    XMLNode.prototype.dec = function(version, encoding, standalone) {
	      return this.declaration(version, encoding, standalone);
	    };

	    XMLNode.prototype.dtd = function(pubID, sysID) {
	      return this.doctype(pubID, sysID);
	    };

	    XMLNode.prototype.e = function(name, attributes, text) {
	      return this.element(name, attributes, text);
	    };

	    XMLNode.prototype.n = function(name, attributes, text) {
	      return this.node(name, attributes, text);
	    };

	    XMLNode.prototype.t = function(value) {
	      return this.text(value);
	    };

	    XMLNode.prototype.d = function(value) {
	      return this.cdata(value);
	    };

	    XMLNode.prototype.c = function(value) {
	      return this.comment(value);
	    };

	    XMLNode.prototype.r = function(value) {
	      return this.raw(value);
	    };

	    XMLNode.prototype.u = function() {
	      return this.up();
	    };

	    return XMLNode;

	  })();

	}).call(this);


/***/ },
/* 44 */
/***/ function(module, exports, __webpack_require__) {

	var baseIsFunction = __webpack_require__(45),
	    isNative = __webpack_require__(23);

	/** `Object#toString` result references. */
	var funcTag = '[object Function]';

	/** Used for native method references. */
	var objectProto = Object.prototype;

	/**
	 * Used to resolve the `toStringTag` of values.
	 * See the [ES spec](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.prototype.tostring)
	 * for more details.
	 */
	var objToString = objectProto.toString;

	/** Native method references. */
	var Uint8Array = isNative(Uint8Array = global.Uint8Array) && Uint8Array;

	/**
	 * Checks if `value` is classified as a `Function` object.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
	 * @example
	 *
	 * _.isFunction(_);
	 * // => true
	 *
	 * _.isFunction(/abc/);
	 * // => false
	 */
	var isFunction = !(baseIsFunction(/x/) || (Uint8Array && !baseIsFunction(Uint8Array))) ? baseIsFunction : function(value) {
	  // The use of `Object#toString` avoids issues with the `typeof` operator
	  // in older versions of Chrome and Safari which return 'function' for regexes
	  // and Safari 8 equivalents which return 'object' for typed array constructors.
	  return objToString.call(value) == funcTag;
	};

	module.exports = isFunction;


/***/ },
/* 45 */
/***/ function(module, exports) {

	/**
	 * The base implementation of `_.isFunction` without support for environments
	 * with incorrect `typeof` results.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
	 */
	function baseIsFunction(value) {
	  // Avoid a Chakra JIT bug in compatibility modes of IE 11.
	  // See https://github.com/jashkenas/underscore/issues/1621 for more details.
	  return typeof value == 'function' || false;
	}

	module.exports = baseIsFunction;


/***/ },
/* 46 */
/***/ function(module, exports, __webpack_require__) {

	var isArguments = __webpack_require__(29),
	    isArray = __webpack_require__(30),
	    isFunction = __webpack_require__(44),
	    isLength = __webpack_require__(22),
	    isObjectLike = __webpack_require__(26),
	    isString = __webpack_require__(47),
	    keys = __webpack_require__(21);

	/**
	 * Checks if `value` is empty. A value is considered empty unless it is an
	 * `arguments` object, array, string, or jQuery-like collection with a length
	 * greater than `0` or an object with own enumerable properties.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {Array|Object|string} value The value to inspect.
	 * @returns {boolean} Returns `true` if `value` is empty, else `false`.
	 * @example
	 *
	 * _.isEmpty(null);
	 * // => true
	 *
	 * _.isEmpty(true);
	 * // => true
	 *
	 * _.isEmpty(1);
	 * // => true
	 *
	 * _.isEmpty([1, 2, 3]);
	 * // => false
	 *
	 * _.isEmpty({ 'a': 1 });
	 * // => false
	 */
	function isEmpty(value) {
	  if (value == null) {
	    return true;
	  }
	  var length = value.length;
	  if (isLength(length) && (isArray(value) || isString(value) || isArguments(value) ||
	      (isObjectLike(value) && isFunction(value.splice)))) {
	    return !length;
	  }
	  return !keys(value).length;
	}

	module.exports = isEmpty;


/***/ },
/* 47 */
/***/ function(module, exports, __webpack_require__) {

	var isObjectLike = __webpack_require__(26);

	/** `Object#toString` result references. */
	var stringTag = '[object String]';

	/** Used for native method references. */
	var objectProto = Object.prototype;

	/**
	 * Used to resolve the `toStringTag` of values.
	 * See the [ES spec](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.prototype.tostring)
	 * for more details.
	 */
	var objToString = objectProto.toString;

	/**
	 * Checks if `value` is classified as a `String` primitive or object.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
	 * @example
	 *
	 * _.isString('abc');
	 * // => true
	 *
	 * _.isString(1);
	 * // => false
	 */
	function isString(value) {
	  return typeof value == 'string' || (isObjectLike(value) && objToString.call(value) == stringTag) || false;
	}

	module.exports = isString;


/***/ },
/* 48 */
/***/ function(module, exports, __webpack_require__) {

	// Generated by CoffeeScript 1.9.1
	(function() {
	  var XMLAttribute, XMLElement, XMLNode, XMLProcessingInstruction, create, every, isArray, isFunction, isObject,
	    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
	    hasProp = {}.hasOwnProperty;

	  create = __webpack_require__(41);

	  isObject = __webpack_require__(27);

	  isArray = __webpack_require__(30);

	  isFunction = __webpack_require__(44);

	  every = __webpack_require__(49);

	  XMLNode = __webpack_require__(43);

	  XMLAttribute = __webpack_require__(71);

	  XMLProcessingInstruction = __webpack_require__(72);

	  module.exports = XMLElement = (function(superClass) {
	    extend(XMLElement, superClass);

	    function XMLElement(parent, name, attributes) {
	      XMLElement.__super__.constructor.call(this, parent);
	      if (name == null) {
	        throw new Error("Missing element name");
	      }
	      this.name = this.stringify.eleName(name);
	      this.children = [];
	      this.instructions = [];
	      this.attributes = {};
	      if (attributes != null) {
	        this.attribute(attributes);
	      }
	    }

	    XMLElement.prototype.clone = function() {
	      var att, attName, clonedSelf, i, len, pi, ref, ref1;
	      clonedSelf = create(XMLElement.prototype, this);
	      if (clonedSelf.isRoot) {
	        clonedSelf.documentObject = null;
	      }
	      clonedSelf.attributes = {};
	      ref = this.attributes;
	      for (attName in ref) {
	        if (!hasProp.call(ref, attName)) continue;
	        att = ref[attName];
	        clonedSelf.attributes[attName] = att.clone();
	      }
	      clonedSelf.instructions = [];
	      ref1 = this.instructions;
	      for (i = 0, len = ref1.length; i < len; i++) {
	        pi = ref1[i];
	        clonedSelf.instructions.push(pi.clone());
	      }
	      clonedSelf.children = [];
	      this.children.forEach(function(child) {
	        var clonedChild;
	        clonedChild = child.clone();
	        clonedChild.parent = clonedSelf;
	        return clonedSelf.children.push(clonedChild);
	      });
	      return clonedSelf;
	    };

	    XMLElement.prototype.attribute = function(name, value) {
	      var attName, attValue;
	      if (name != null) {
	        name = name.valueOf();
	      }
	      if (isObject(name)) {
	        for (attName in name) {
	          if (!hasProp.call(name, attName)) continue;
	          attValue = name[attName];
	          this.attribute(attName, attValue);
	        }
	      } else {
	        if (isFunction(value)) {
	          value = value.apply();
	        }
	        if (!this.options.skipNullAttributes || (value != null)) {
	          this.attributes[name] = new XMLAttribute(this, name, value);
	        }
	      }
	      return this;
	    };

	    XMLElement.prototype.removeAttribute = function(name) {
	      var attName, i, len;
	      if (name == null) {
	        throw new Error("Missing attribute name");
	      }
	      name = name.valueOf();
	      if (isArray(name)) {
	        for (i = 0, len = name.length; i < len; i++) {
	          attName = name[i];
	          delete this.attributes[attName];
	        }
	      } else {
	        delete this.attributes[name];
	      }
	      return this;
	    };

	    XMLElement.prototype.instruction = function(target, value) {
	      var i, insTarget, insValue, instruction, len;
	      if (target != null) {
	        target = target.valueOf();
	      }
	      if (value != null) {
	        value = value.valueOf();
	      }
	      if (isArray(target)) {
	        for (i = 0, len = target.length; i < len; i++) {
	          insTarget = target[i];
	          this.instruction(insTarget);
	        }
	      } else if (isObject(target)) {
	        for (insTarget in target) {
	          if (!hasProp.call(target, insTarget)) continue;
	          insValue = target[insTarget];
	          this.instruction(insTarget, insValue);
	        }
	      } else {
	        if (isFunction(value)) {
	          value = value.apply();
	        }
	        instruction = new XMLProcessingInstruction(this, target, value);
	        this.instructions.push(instruction);
	      }
	      return this;
	    };

	    XMLElement.prototype.toString = function(options, level) {
	      var att, child, i, indent, instruction, j, len, len1, name, newline, offset, pretty, r, ref, ref1, ref2, ref3, ref4, ref5, space;
	      pretty = (options != null ? options.pretty : void 0) || false;
	      indent = (ref = options != null ? options.indent : void 0) != null ? ref : '  ';
	      offset = (ref1 = options != null ? options.offset : void 0) != null ? ref1 : 0;
	      newline = (ref2 = options != null ? options.newline : void 0) != null ? ref2 : '\n';
	      level || (level = 0);
	      space = new Array(level + offset + 1).join(indent);
	      r = '';
	      ref3 = this.instructions;
	      for (i = 0, len = ref3.length; i < len; i++) {
	        instruction = ref3[i];
	        r += instruction.toString(options, level + 1);
	      }
	      if (pretty) {
	        r += space;
	      }
	      r += '<' + this.name;
	      ref4 = this.attributes;
	      for (name in ref4) {
	        if (!hasProp.call(ref4, name)) continue;
	        att = ref4[name];
	        r += att.toString(options);
	      }
	      if (this.children.length === 0 || every(this.children, function(e) {
	        return e.value === '';
	      })) {
	        r += '/>';
	        if (pretty) {
	          r += newline;
	        }
	      } else if (pretty && this.children.length === 1 && (this.children[0].value != null)) {
	        r += '>';
	        r += this.children[0].value;
	        r += '</' + this.name + '>';
	        r += newline;
	      } else {
	        r += '>';
	        if (pretty) {
	          r += newline;
	        }
	        ref5 = this.children;
	        for (j = 0, len1 = ref5.length; j < len1; j++) {
	          child = ref5[j];
	          r += child.toString(options, level + 1);
	        }
	        if (pretty) {
	          r += space;
	        }
	        r += '</' + this.name + '>';
	        if (pretty) {
	          r += newline;
	        }
	      }
	      return r;
	    };

	    XMLElement.prototype.att = function(name, value) {
	      return this.attribute(name, value);
	    };

	    XMLElement.prototype.ins = function(target, value) {
	      return this.instruction(target, value);
	    };

	    XMLElement.prototype.a = function(name, value) {
	      return this.attribute(name, value);
	    };

	    XMLElement.prototype.i = function(target, value) {
	      return this.instruction(target, value);
	    };

	    return XMLElement;

	  })(XMLNode);

	}).call(this);


/***/ },
/* 49 */
/***/ function(module, exports, __webpack_require__) {

	var arrayEvery = __webpack_require__(50),
	    baseCallback = __webpack_require__(51),
	    baseEvery = __webpack_require__(66),
	    isArray = __webpack_require__(30);

	/**
	 * Checks if `predicate` returns truthy for **all** elements of `collection`.
	 * The predicate is bound to `thisArg` and invoked with three arguments;
	 * (value, index|key, collection).
	 *
	 * If a property name is provided for `predicate` the created `_.property`
	 * style callback returns the property value of the given element.
	 *
	 * If a value is also provided for `thisArg` the created `_.matchesProperty`
	 * style callback returns `true` for elements that have a matching property
	 * value, else `false`.
	 *
	 * If an object is provided for `predicate` the created `_.matches` style
	 * callback returns `true` for elements that have the properties of the given
	 * object, else `false`.
	 *
	 * @static
	 * @memberOf _
	 * @alias all
	 * @category Collection
	 * @param {Array|Object|string} collection The collection to iterate over.
	 * @param {Function|Object|string} [predicate=_.identity] The function invoked
	 *  per iteration.
	 * @param {*} [thisArg] The `this` binding of `predicate`.
	 * @returns {boolean} Returns `true` if all elements pass the predicate check,
	 *  else `false`.
	 * @example
	 *
	 * _.every([true, 1, null, 'yes'], Boolean);
	 * // => false
	 *
	 * var users = [
	 *   { 'user': 'barney', 'active': false },
	 *   { 'user': 'fred',   'active': false }
	 * ];
	 *
	 * // using the `_.matches` callback shorthand
	 * _.every(users, { 'user': 'barney', 'active': false });
	 * // => false
	 *
	 * // using the `_.matchesProperty` callback shorthand
	 * _.every(users, 'active', false);
	 * // => true
	 *
	 * // using the `_.property` callback shorthand
	 * _.every(users, 'active');
	 * // => false
	 */
	function every(collection, predicate, thisArg) {
	  var func = isArray(collection) ? arrayEvery : baseEvery;
	  if (typeof predicate != 'function' || typeof thisArg != 'undefined') {
	    predicate = baseCallback(predicate, thisArg, 3);
	  }
	  return func(collection, predicate);
	}

	module.exports = every;


/***/ },
/* 50 */
/***/ function(module, exports) {

	/**
	 * A specialized version of `_.every` for arrays without support for callback
	 * shorthands or `this` binding.
	 *
	 * @private
	 * @param {Array} array The array to iterate over.
	 * @param {Function} predicate The function invoked per iteration.
	 * @returns {boolean} Returns `true` if all elements pass the predicate check,
	 *  else `false`.
	 */
	function arrayEvery(array, predicate) {
	  var index = -1,
	      length = array.length;

	  while (++index < length) {
	    if (!predicate(array[index], index, array)) {
	      return false;
	    }
	  }
	  return true;
	}

	module.exports = arrayEvery;


/***/ },
/* 51 */
/***/ function(module, exports, __webpack_require__) {

	var baseMatches = __webpack_require__(52),
	    baseMatchesProperty = __webpack_require__(61),
	    baseProperty = __webpack_require__(62),
	    bindCallback = __webpack_require__(35),
	    identity = __webpack_require__(36),
	    isBindable = __webpack_require__(63);

	/**
	 * The base implementation of `_.callback` which supports specifying the
	 * number of arguments to provide to `func`.
	 *
	 * @private
	 * @param {*} [func=_.identity] The value to convert to a callback.
	 * @param {*} [thisArg] The `this` binding of `func`.
	 * @param {number} [argCount] The number of arguments to provide to `func`.
	 * @returns {Function} Returns the callback.
	 */
	function baseCallback(func, thisArg, argCount) {
	  var type = typeof func;
	  if (type == 'function') {
	    return (typeof thisArg != 'undefined' && isBindable(func))
	      ? bindCallback(func, thisArg, argCount)
	      : func;
	  }
	  if (func == null) {
	    return identity;
	  }
	  if (type == 'object') {
	    return baseMatches(func);
	  }
	  return typeof thisArg == 'undefined'
	    ? baseProperty(func + '')
	    : baseMatchesProperty(func + '', thisArg);
	}

	module.exports = baseCallback;


/***/ },
/* 52 */
/***/ function(module, exports, __webpack_require__) {

	var baseIsMatch = __webpack_require__(53),
	    isStrictComparable = __webpack_require__(60),
	    keys = __webpack_require__(21);

	/** Used for native method references. */
	var objectProto = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

	/**
	 * The base implementation of `_.matches` which does not clone `source`.
	 *
	 * @private
	 * @param {Object} source The object of property values to match.
	 * @returns {Function} Returns the new function.
	 */
	function baseMatches(source) {
	  var props = keys(source),
	      length = props.length;

	  if (length == 1) {
	    var key = props[0],
	        value = source[key];

	    if (isStrictComparable(value)) {
	      return function(object) {
	        return object != null && object[key] === value && hasOwnProperty.call(object, key);
	      };
	    }
	  }
	  var values = Array(length),
	      strictCompareFlags = Array(length);

	  while (length--) {
	    value = source[props[length]];
	    values[length] = value;
	    strictCompareFlags[length] = isStrictComparable(value);
	  }
	  return function(object) {
	    return baseIsMatch(object, props, values, strictCompareFlags);
	  };
	}

	module.exports = baseMatches;


/***/ },
/* 53 */
/***/ function(module, exports, __webpack_require__) {

	var baseIsEqual = __webpack_require__(54);

	/** Used for native method references. */
	var objectProto = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

	/**
	 * The base implementation of `_.isMatch` without support for callback
	 * shorthands or `this` binding.
	 *
	 * @private
	 * @param {Object} object The object to inspect.
	 * @param {Array} props The source property names to match.
	 * @param {Array} values The source values to match.
	 * @param {Array} strictCompareFlags Strict comparison flags for source values.
	 * @param {Function} [customizer] The function to customize comparing objects.
	 * @returns {boolean} Returns `true` if `object` is a match, else `false`.
	 */
	function baseIsMatch(object, props, values, strictCompareFlags, customizer) {
	  var length = props.length;
	  if (object == null) {
	    return !length;
	  }
	  var index = -1,
	      noCustomizer = !customizer;

	  while (++index < length) {
	    if ((noCustomizer && strictCompareFlags[index])
	          ? values[index] !== object[props[index]]
	          : !hasOwnProperty.call(object, props[index])
	        ) {
	      return false;
	    }
	  }
	  index = -1;
	  while (++index < length) {
	    var key = props[index];
	    if (noCustomizer && strictCompareFlags[index]) {
	      var result = hasOwnProperty.call(object, key);
	    } else {
	      var objValue = object[key],
	          srcValue = values[index];

	      result = customizer ? customizer(objValue, srcValue, key) : undefined;
	      if (typeof result == 'undefined') {
	        result = baseIsEqual(srcValue, objValue, customizer, true);
	      }
	    }
	    if (!result) {
	      return false;
	    }
	  }
	  return true;
	}

	module.exports = baseIsMatch;


/***/ },
/* 54 */
/***/ function(module, exports, __webpack_require__) {

	var baseIsEqualDeep = __webpack_require__(55);

	/**
	 * The base implementation of `_.isEqual` without support for `this` binding
	 * `customizer` functions.
	 *
	 * @private
	 * @param {*} value The value to compare.
	 * @param {*} other The other value to compare.
	 * @param {Function} [customizer] The function to customize comparing values.
	 * @param {boolean} [isWhere] Specify performing partial comparisons.
	 * @param {Array} [stackA] Tracks traversed `value` objects.
	 * @param {Array} [stackB] Tracks traversed `other` objects.
	 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
	 */
	function baseIsEqual(value, other, customizer, isWhere, stackA, stackB) {
	  // Exit early for identical values.
	  if (value === other) {
	    // Treat `+0` vs. `-0` as not equal.
	    return value !== 0 || (1 / value == 1 / other);
	  }
	  var valType = typeof value,
	      othType = typeof other;

	  // Exit early for unlike primitive values.
	  if ((valType != 'function' && valType != 'object' && othType != 'function' && othType != 'object') ||
	      value == null || other == null) {
	    // Return `false` unless both values are `NaN`.
	    return value !== value && other !== other;
	  }
	  return baseIsEqualDeep(value, other, baseIsEqual, customizer, isWhere, stackA, stackB);
	}

	module.exports = baseIsEqual;


/***/ },
/* 55 */
/***/ function(module, exports, __webpack_require__) {

	var equalArrays = __webpack_require__(56),
	    equalByTag = __webpack_require__(57),
	    equalObjects = __webpack_require__(58),
	    isArray = __webpack_require__(30),
	    isTypedArray = __webpack_require__(59);

	/** `Object#toString` result references. */
	var argsTag = '[object Arguments]',
	    arrayTag = '[object Array]',
	    objectTag = '[object Object]';

	/** Used for native method references. */
	var objectProto = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

	/**
	 * Used to resolve the `toStringTag` of values.
	 * See the [ES spec](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.prototype.tostring)
	 * for more details.
	 */
	var objToString = objectProto.toString;

	/**
	 * A specialized version of `baseIsEqual` for arrays and objects which performs
	 * deep comparisons and tracks traversed objects enabling objects with circular
	 * references to be compared.
	 *
	 * @private
	 * @param {Object} object The object to compare.
	 * @param {Object} other The other object to compare.
	 * @param {Function} equalFunc The function to determine equivalents of values.
	 * @param {Function} [customizer] The function to customize comparing objects.
	 * @param {boolean} [isWhere] Specify performing partial comparisons.
	 * @param {Array} [stackA=[]] Tracks traversed `value` objects.
	 * @param {Array} [stackB=[]] Tracks traversed `other` objects.
	 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
	 */
	function baseIsEqualDeep(object, other, equalFunc, customizer, isWhere, stackA, stackB) {
	  var objIsArr = isArray(object),
	      othIsArr = isArray(other),
	      objTag = arrayTag,
	      othTag = arrayTag;

	  if (!objIsArr) {
	    objTag = objToString.call(object);
	    if (objTag == argsTag) {
	      objTag = objectTag;
	    } else if (objTag != objectTag) {
	      objIsArr = isTypedArray(object);
	    }
	  }
	  if (!othIsArr) {
	    othTag = objToString.call(other);
	    if (othTag == argsTag) {
	      othTag = objectTag;
	    } else if (othTag != objectTag) {
	      othIsArr = isTypedArray(other);
	    }
	  }
	  var objIsObj = objTag == objectTag,
	      othIsObj = othTag == objectTag,
	      isSameTag = objTag == othTag;

	  if (isSameTag && !(objIsArr || objIsObj)) {
	    return equalByTag(object, other, objTag);
	  }
	  var valWrapped = objIsObj && hasOwnProperty.call(object, '__wrapped__'),
	      othWrapped = othIsObj && hasOwnProperty.call(other, '__wrapped__');

	  if (valWrapped || othWrapped) {
	    return equalFunc(valWrapped ? object.value() : object, othWrapped ? other.value() : other, customizer, isWhere, stackA, stackB);
	  }
	  if (!isSameTag) {
	    return false;
	  }
	  // Assume cyclic values are equal.
	  // For more information on detecting circular references see https://es5.github.io/#JO.
	  stackA || (stackA = []);
	  stackB || (stackB = []);

	  var length = stackA.length;
	  while (length--) {
	    if (stackA[length] == object) {
	      return stackB[length] == other;
	    }
	  }
	  // Add `object` and `other` to the stack of traversed objects.
	  stackA.push(object);
	  stackB.push(other);

	  var result = (objIsArr ? equalArrays : equalObjects)(object, other, equalFunc, customizer, isWhere, stackA, stackB);

	  stackA.pop();
	  stackB.pop();

	  return result;
	}

	module.exports = baseIsEqualDeep;


/***/ },
/* 56 */
/***/ function(module, exports) {

	/**
	 * A specialized version of `baseIsEqualDeep` for arrays with support for
	 * partial deep comparisons.
	 *
	 * @private
	 * @param {Array} array The array to compare.
	 * @param {Array} other The other array to compare.
	 * @param {Function} equalFunc The function to determine equivalents of values.
	 * @param {Function} [customizer] The function to customize comparing arrays.
	 * @param {boolean} [isWhere] Specify performing partial comparisons.
	 * @param {Array} [stackA] Tracks traversed `value` objects.
	 * @param {Array} [stackB] Tracks traversed `other` objects.
	 * @returns {boolean} Returns `true` if the arrays are equivalent, else `false`.
	 */
	function equalArrays(array, other, equalFunc, customizer, isWhere, stackA, stackB) {
	  var index = -1,
	      arrLength = array.length,
	      othLength = other.length,
	      result = true;

	  if (arrLength != othLength && !(isWhere && othLength > arrLength)) {
	    return false;
	  }
	  // Deep compare the contents, ignoring non-numeric properties.
	  while (result && ++index < arrLength) {
	    var arrValue = array[index],
	        othValue = other[index];

	    result = undefined;
	    if (customizer) {
	      result = isWhere
	        ? customizer(othValue, arrValue, index)
	        : customizer(arrValue, othValue, index);
	    }
	    if (typeof result == 'undefined') {
	      // Recursively compare arrays (susceptible to call stack limits).
	      if (isWhere) {
	        var othIndex = othLength;
	        while (othIndex--) {
	          othValue = other[othIndex];
	          result = (arrValue && arrValue === othValue) || equalFunc(arrValue, othValue, customizer, isWhere, stackA, stackB);
	          if (result) {
	            break;
	          }
	        }
	      } else {
	        result = (arrValue && arrValue === othValue) || equalFunc(arrValue, othValue, customizer, isWhere, stackA, stackB);
	      }
	    }
	  }
	  return !!result;
	}

	module.exports = equalArrays;


/***/ },
/* 57 */
/***/ function(module, exports) {

	/** `Object#toString` result references. */
	var boolTag = '[object Boolean]',
	    dateTag = '[object Date]',
	    errorTag = '[object Error]',
	    numberTag = '[object Number]',
	    regexpTag = '[object RegExp]',
	    stringTag = '[object String]';

	/**
	 * A specialized version of `baseIsEqualDeep` for comparing objects of
	 * the same `toStringTag`.
	 *
	 * **Note:** This function only supports comparing values with tags of
	 * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
	 *
	 * @private
	 * @param {Object} value The object to compare.
	 * @param {Object} other The other object to compare.
	 * @param {string} tag The `toStringTag` of the objects to compare.
	 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
	 */
	function equalByTag(object, other, tag) {
	  switch (tag) {
	    case boolTag:
	    case dateTag:
	      // Coerce dates and booleans to numbers, dates to milliseconds and booleans
	      // to `1` or `0` treating invalid dates coerced to `NaN` as not equal.
	      return +object == +other;

	    case errorTag:
	      return object.name == other.name && object.message == other.message;

	    case numberTag:
	      // Treat `NaN` vs. `NaN` as equal.
	      return (object != +object)
	        ? other != +other
	        // But, treat `-0` vs. `+0` as not equal.
	        : (object == 0 ? ((1 / object) == (1 / other)) : object == +other);

	    case regexpTag:
	    case stringTag:
	      // Coerce regexes to strings and treat strings primitives and string
	      // objects as equal. See https://es5.github.io/#x15.10.6.4 for more details.
	      return object == (other + '');
	  }
	  return false;
	}

	module.exports = equalByTag;


/***/ },
/* 58 */
/***/ function(module, exports, __webpack_require__) {

	var keys = __webpack_require__(21);

	/** Used for native method references. */
	var objectProto = Object.prototype;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

	/**
	 * A specialized version of `baseIsEqualDeep` for objects with support for
	 * partial deep comparisons.
	 *
	 * @private
	 * @param {Object} object The object to compare.
	 * @param {Object} other The other object to compare.
	 * @param {Function} equalFunc The function to determine equivalents of values.
	 * @param {Function} [customizer] The function to customize comparing values.
	 * @param {boolean} [isWhere] Specify performing partial comparisons.
	 * @param {Array} [stackA] Tracks traversed `value` objects.
	 * @param {Array} [stackB] Tracks traversed `other` objects.
	 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
	 */
	function equalObjects(object, other, equalFunc, customizer, isWhere, stackA, stackB) {
	  var objProps = keys(object),
	      objLength = objProps.length,
	      othProps = keys(other),
	      othLength = othProps.length;

	  if (objLength != othLength && !isWhere) {
	    return false;
	  }
	  var hasCtor,
	      index = -1;

	  while (++index < objLength) {
	    var key = objProps[index],
	        result = hasOwnProperty.call(other, key);

	    if (result) {
	      var objValue = object[key],
	          othValue = other[key];

	      result = undefined;
	      if (customizer) {
	        result = isWhere
	          ? customizer(othValue, objValue, key)
	          : customizer(objValue, othValue, key);
	      }
	      if (typeof result == 'undefined') {
	        // Recursively compare objects (susceptible to call stack limits).
	        result = (objValue && objValue === othValue) || equalFunc(objValue, othValue, customizer, isWhere, stackA, stackB);
	      }
	    }
	    if (!result) {
	      return false;
	    }
	    hasCtor || (hasCtor = key == 'constructor');
	  }
	  if (!hasCtor) {
	    var objCtor = object.constructor,
	        othCtor = other.constructor;

	    // Non `Object` object instances with different constructors are not equal.
	    if (objCtor != othCtor &&
	        ('constructor' in object && 'constructor' in other) &&
	        !(typeof objCtor == 'function' && objCtor instanceof objCtor &&
	          typeof othCtor == 'function' && othCtor instanceof othCtor)) {
	      return false;
	    }
	  }
	  return true;
	}

	module.exports = equalObjects;


/***/ },
/* 59 */
/***/ function(module, exports, __webpack_require__) {

	var isLength = __webpack_require__(22),
	    isObjectLike = __webpack_require__(26);

	/** `Object#toString` result references. */
	var argsTag = '[object Arguments]',
	    arrayTag = '[object Array]',
	    boolTag = '[object Boolean]',
	    dateTag = '[object Date]',
	    errorTag = '[object Error]',
	    funcTag = '[object Function]',
	    mapTag = '[object Map]',
	    numberTag = '[object Number]',
	    objectTag = '[object Object]',
	    regexpTag = '[object RegExp]',
	    setTag = '[object Set]',
	    stringTag = '[object String]',
	    weakMapTag = '[object WeakMap]';

	var arrayBufferTag = '[object ArrayBuffer]',
	    float32Tag = '[object Float32Array]',
	    float64Tag = '[object Float64Array]',
	    int8Tag = '[object Int8Array]',
	    int16Tag = '[object Int16Array]',
	    int32Tag = '[object Int32Array]',
	    uint8Tag = '[object Uint8Array]',
	    uint8ClampedTag = '[object Uint8ClampedArray]',
	    uint16Tag = '[object Uint16Array]',
	    uint32Tag = '[object Uint32Array]';

	/** Used to identify `toStringTag` values of typed arrays. */
	var typedArrayTags = {};
	typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
	typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
	typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
	typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
	typedArrayTags[uint32Tag] = true;
	typedArrayTags[argsTag] = typedArrayTags[arrayTag] =
	typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
	typedArrayTags[dateTag] = typedArrayTags[errorTag] =
	typedArrayTags[funcTag] = typedArrayTags[mapTag] =
	typedArrayTags[numberTag] = typedArrayTags[objectTag] =
	typedArrayTags[regexpTag] = typedArrayTags[setTag] =
	typedArrayTags[stringTag] = typedArrayTags[weakMapTag] = false;

	/** Used for native method references. */
	var objectProto = Object.prototype;

	/**
	 * Used to resolve the `toStringTag` of values.
	 * See the [ES spec](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.prototype.tostring)
	 * for more details.
	 */
	var objToString = objectProto.toString;

	/**
	 * Checks if `value` is classified as a typed array.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
	 * @example
	 *
	 * _.isTypedArray(new Uint8Array);
	 * // => true
	 *
	 * _.isTypedArray([]);
	 * // => false
	 */
	function isTypedArray(value) {
	  return (isObjectLike(value) && isLength(value.length) && typedArrayTags[objToString.call(value)]) || false;
	}

	module.exports = isTypedArray;


/***/ },
/* 60 */
/***/ function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(27);

	/**
	 * Checks if `value` is suitable for strict equality comparisons, i.e. `===`.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` if suitable for strict
	 *  equality comparisons, else `false`.
	 */
	function isStrictComparable(value) {
	  return value === value && (value === 0 ? ((1 / value) > 0) : !isObject(value));
	}

	module.exports = isStrictComparable;


/***/ },
/* 61 */
/***/ function(module, exports, __webpack_require__) {

	var baseIsEqual = __webpack_require__(54),
	    isStrictComparable = __webpack_require__(60);

	/**
	 * The base implementation of `_.matchesProperty` which does not coerce `key`
	 * to a string.
	 *
	 * @private
	 * @param {string} key The key of the property to get.
	 * @param {*} value The value to compare.
	 * @returns {Function} Returns the new function.
	 */
	function baseMatchesProperty(key, value) {
	  if (isStrictComparable(value)) {
	    return function(object) {
	      return object != null && object[key] === value;
	    };
	  }
	  return function(object) {
	    return object != null && baseIsEqual(value, object[key], null, true);
	  };
	}

	module.exports = baseMatchesProperty;


/***/ },
/* 62 */
/***/ function(module, exports) {

	/**
	 * The base implementation of `_.property` which does not coerce `key` to a string.
	 *
	 * @private
	 * @param {string} key The key of the property to get.
	 * @returns {Function} Returns the new function.
	 */
	function baseProperty(key) {
	  return function(object) {
	    return object == null ? undefined : object[key];
	  };
	}

	module.exports = baseProperty;


/***/ },
/* 63 */
/***/ function(module, exports, __webpack_require__) {

	var baseSetData = __webpack_require__(64),
	    isNative = __webpack_require__(23),
	    support = __webpack_require__(33);

	/** Used to detect named functions. */
	var reFuncName = /^\s*function[ \n\r\t]+\w/;

	/** Used to detect functions containing a `this` reference. */
	var reThis = /\bthis\b/;

	/** Used to resolve the decompiled source of functions. */
	var fnToString = Function.prototype.toString;

	/**
	 * Checks if `func` is eligible for `this` binding.
	 *
	 * @private
	 * @param {Function} func The function to check.
	 * @returns {boolean} Returns `true` if `func` is eligible, else `false`.
	 */
	function isBindable(func) {
	  var result = !(support.funcNames ? func.name : support.funcDecomp);

	  if (!result) {
	    var source = fnToString.call(func);
	    if (!support.funcNames) {
	      result = !reFuncName.test(source);
	    }
	    if (!result) {
	      // Check if `func` references the `this` keyword and store the result.
	      result = reThis.test(source) || isNative(func);
	      baseSetData(func, result);
	    }
	  }
	  return result;
	}

	module.exports = isBindable;


/***/ },
/* 64 */
/***/ function(module, exports, __webpack_require__) {

	var identity = __webpack_require__(36),
	    metaMap = __webpack_require__(65);

	/**
	 * The base implementation of `setData` without support for hot loop detection.
	 *
	 * @private
	 * @param {Function} func The function to associate metadata with.
	 * @param {*} data The metadata.
	 * @returns {Function} Returns `func`.
	 */
	var baseSetData = !metaMap ? identity : function(func, data) {
	  metaMap.set(func, data);
	  return func;
	};

	module.exports = baseSetData;


/***/ },
/* 65 */
/***/ function(module, exports, __webpack_require__) {

	var isNative = __webpack_require__(23);

	/** Native method references. */
	var WeakMap = isNative(WeakMap = global.WeakMap) && WeakMap;

	/** Used to store function metadata. */
	var metaMap = WeakMap && new WeakMap;

	module.exports = metaMap;


/***/ },
/* 66 */
/***/ function(module, exports, __webpack_require__) {

	var baseEach = __webpack_require__(67);

	/**
	 * The base implementation of `_.every` without support for callback
	 * shorthands or `this` binding.
	 *
	 * @private
	 * @param {Array|Object|string} collection The collection to iterate over.
	 * @param {Function} predicate The function invoked per iteration.
	 * @returns {boolean} Returns `true` if all elements pass the predicate check,
	 *  else `false`
	 */
	function baseEvery(collection, predicate) {
	  var result = true;
	  baseEach(collection, function(value, index, collection) {
	    result = !!predicate(value, index, collection);
	    return result;
	  });
	  return result;
	}

	module.exports = baseEvery;


/***/ },
/* 67 */
/***/ function(module, exports, __webpack_require__) {

	var baseForOwn = __webpack_require__(68),
	    isLength = __webpack_require__(22),
	    toObject = __webpack_require__(70);

	/**
	 * The base implementation of `_.forEach` without support for callback
	 * shorthands and `this` binding.
	 *
	 * @private
	 * @param {Array|Object|string} collection The collection to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Array|Object|string} Returns `collection`.
	 */
	function baseEach(collection, iteratee) {
	  var length = collection ? collection.length : 0;
	  if (!isLength(length)) {
	    return baseForOwn(collection, iteratee);
	  }
	  var index = -1,
	      iterable = toObject(collection);

	  while (++index < length) {
	    if (iteratee(iterable[index], index, iterable) === false) {
	      break;
	    }
	  }
	  return collection;
	}

	module.exports = baseEach;


/***/ },
/* 68 */
/***/ function(module, exports, __webpack_require__) {

	var baseFor = __webpack_require__(69),
	    keys = __webpack_require__(21);

	/**
	 * The base implementation of `_.forOwn` without support for callback
	 * shorthands and `this` binding.
	 *
	 * @private
	 * @param {Object} object The object to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Object} Returns `object`.
	 */
	function baseForOwn(object, iteratee) {
	  return baseFor(object, iteratee, keys);
	}

	module.exports = baseForOwn;


/***/ },
/* 69 */
/***/ function(module, exports, __webpack_require__) {

	var toObject = __webpack_require__(70);

	/**
	 * The base implementation of `baseForIn` and `baseForOwn` which iterates
	 * over `object` properties returned by `keysFunc` invoking `iteratee` for
	 * each property. Iterator functions may exit iteration early by explicitly
	 * returning `false`.
	 *
	 * @private
	 * @param {Object} object The object to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @param {Function} keysFunc The function to get the keys of `object`.
	 * @returns {Object} Returns `object`.
	 */
	function baseFor(object, iteratee, keysFunc) {
	  var index = -1,
	      iterable = toObject(object),
	      props = keysFunc(object),
	      length = props.length;

	  while (++index < length) {
	    var key = props[index];
	    if (iteratee(iterable[key], key, iterable) === false) {
	      break;
	    }
	  }
	  return object;
	}

	module.exports = baseFor;


/***/ },
/* 70 */
/***/ function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(27);

	/**
	 * Converts `value` to an object if it is not one.
	 *
	 * @private
	 * @param {*} value The value to process.
	 * @returns {Object} Returns the object.
	 */
	function toObject(value) {
	  return isObject(value) ? value : Object(value);
	}

	module.exports = toObject;


/***/ },
/* 71 */
/***/ function(module, exports, __webpack_require__) {

	// Generated by CoffeeScript 1.9.1
	(function() {
	  var XMLAttribute, create;

	  create = __webpack_require__(41);

	  module.exports = XMLAttribute = (function() {
	    function XMLAttribute(parent, name, value) {
	      this.stringify = parent.stringify;
	      if (name == null) {
	        throw new Error("Missing attribute name of element " + parent.name);
	      }
	      if (value == null) {
	        throw new Error("Missing attribute value for attribute " + name + " of element " + parent.name);
	      }
	      this.name = this.stringify.attName(name);
	      this.value = this.stringify.attValue(value);
	    }

	    XMLAttribute.prototype.clone = function() {
	      return create(XMLAttribute.prototype, this);
	    };

	    XMLAttribute.prototype.toString = function(options, level) {
	      return ' ' + this.name + '="' + this.value + '"';
	    };

	    return XMLAttribute;

	  })();

	}).call(this);


/***/ },
/* 72 */
/***/ function(module, exports, __webpack_require__) {

	// Generated by CoffeeScript 1.9.1
	(function() {
	  var XMLProcessingInstruction, create;

	  create = __webpack_require__(41);

	  module.exports = XMLProcessingInstruction = (function() {
	    function XMLProcessingInstruction(parent, target, value) {
	      this.stringify = parent.stringify;
	      if (target == null) {
	        throw new Error("Missing instruction target");
	      }
	      this.target = this.stringify.insTarget(target);
	      if (value) {
	        this.value = this.stringify.insValue(value);
	      }
	    }

	    XMLProcessingInstruction.prototype.clone = function() {
	      return create(XMLProcessingInstruction.prototype, this);
	    };

	    XMLProcessingInstruction.prototype.toString = function(options, level) {
	      var indent, newline, offset, pretty, r, ref, ref1, ref2, space;
	      pretty = (options != null ? options.pretty : void 0) || false;
	      indent = (ref = options != null ? options.indent : void 0) != null ? ref : '  ';
	      offset = (ref1 = options != null ? options.offset : void 0) != null ? ref1 : 0;
	      newline = (ref2 = options != null ? options.newline : void 0) != null ? ref2 : '\n';
	      level || (level = 0);
	      space = new Array(level + offset + 1).join(indent);
	      r = '';
	      if (pretty) {
	        r += space;
	      }
	      r += '<?';
	      r += this.target;
	      if (this.value) {
	        r += ' ' + this.value;
	      }
	      r += '?>';
	      if (pretty) {
	        r += newline;
	      }
	      return r;
	    };

	    return XMLProcessingInstruction;

	  })();

	}).call(this);


/***/ },
/* 73 */
/***/ function(module, exports, __webpack_require__) {

	// Generated by CoffeeScript 1.9.1
	(function() {
	  var XMLCData, XMLNode, create,
	    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
	    hasProp = {}.hasOwnProperty;

	  create = __webpack_require__(41);

	  XMLNode = __webpack_require__(43);

	  module.exports = XMLCData = (function(superClass) {
	    extend(XMLCData, superClass);

	    function XMLCData(parent, text) {
	      XMLCData.__super__.constructor.call(this, parent);
	      if (text == null) {
	        throw new Error("Missing CDATA text");
	      }
	      this.text = this.stringify.cdata(text);
	    }

	    XMLCData.prototype.clone = function() {
	      return create(XMLCData.prototype, this);
	    };

	    XMLCData.prototype.toString = function(options, level) {
	      var indent, newline, offset, pretty, r, ref, ref1, ref2, space;
	      pretty = (options != null ? options.pretty : void 0) || false;
	      indent = (ref = options != null ? options.indent : void 0) != null ? ref : '  ';
	      offset = (ref1 = options != null ? options.offset : void 0) != null ? ref1 : 0;
	      newline = (ref2 = options != null ? options.newline : void 0) != null ? ref2 : '\n';
	      level || (level = 0);
	      space = new Array(level + offset + 1).join(indent);
	      r = '';
	      if (pretty) {
	        r += space;
	      }
	      r += '<![CDATA[' + this.text + ']]>';
	      if (pretty) {
	        r += newline;
	      }
	      return r;
	    };

	    return XMLCData;

	  })(XMLNode);

	}).call(this);


/***/ },
/* 74 */
/***/ function(module, exports, __webpack_require__) {

	// Generated by CoffeeScript 1.9.1
	(function() {
	  var XMLComment, XMLNode, create,
	    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
	    hasProp = {}.hasOwnProperty;

	  create = __webpack_require__(41);

	  XMLNode = __webpack_require__(43);

	  module.exports = XMLComment = (function(superClass) {
	    extend(XMLComment, superClass);

	    function XMLComment(parent, text) {
	      XMLComment.__super__.constructor.call(this, parent);
	      if (text == null) {
	        throw new Error("Missing comment text");
	      }
	      this.text = this.stringify.comment(text);
	    }

	    XMLComment.prototype.clone = function() {
	      return create(XMLComment.prototype, this);
	    };

	    XMLComment.prototype.toString = function(options, level) {
	      var indent, newline, offset, pretty, r, ref, ref1, ref2, space;
	      pretty = (options != null ? options.pretty : void 0) || false;
	      indent = (ref = options != null ? options.indent : void 0) != null ? ref : '  ';
	      offset = (ref1 = options != null ? options.offset : void 0) != null ? ref1 : 0;
	      newline = (ref2 = options != null ? options.newline : void 0) != null ? ref2 : '\n';
	      level || (level = 0);
	      space = new Array(level + offset + 1).join(indent);
	      r = '';
	      if (pretty) {
	        r += space;
	      }
	      r += '<!-- ' + this.text + ' -->';
	      if (pretty) {
	        r += newline;
	      }
	      return r;
	    };

	    return XMLComment;

	  })(XMLNode);

	}).call(this);


/***/ },
/* 75 */
/***/ function(module, exports, __webpack_require__) {

	// Generated by CoffeeScript 1.9.1
	(function() {
	  var XMLCData, XMLComment, XMLDTDAttList, XMLDTDElement, XMLDTDEntity, XMLDTDNotation, XMLDocType, XMLProcessingInstruction, create, isObject;

	  create = __webpack_require__(41);

	  isObject = __webpack_require__(27);

	  XMLCData = __webpack_require__(73);

	  XMLComment = __webpack_require__(74);

	  XMLDTDAttList = __webpack_require__(76);

	  XMLDTDEntity = __webpack_require__(77);

	  XMLDTDElement = __webpack_require__(78);

	  XMLDTDNotation = __webpack_require__(79);

	  XMLProcessingInstruction = __webpack_require__(72);

	  module.exports = XMLDocType = (function() {
	    function XMLDocType(parent, pubID, sysID) {
	      var ref, ref1;
	      this.documentObject = parent;
	      this.stringify = this.documentObject.stringify;
	      this.children = [];
	      if (isObject(pubID)) {
	        ref = pubID, pubID = ref.pubID, sysID = ref.sysID;
	      }
	      if (sysID == null) {
	        ref1 = [pubID, sysID], sysID = ref1[0], pubID = ref1[1];
	      }
	      if (pubID != null) {
	        this.pubID = this.stringify.dtdPubID(pubID);
	      }
	      if (sysID != null) {
	        this.sysID = this.stringify.dtdSysID(sysID);
	      }
	    }

	    XMLDocType.prototype.clone = function() {
	      return create(XMLDocType.prototype, this);
	    };

	    XMLDocType.prototype.element = function(name, value) {
	      var child;
	      child = new XMLDTDElement(this, name, value);
	      this.children.push(child);
	      return this;
	    };

	    XMLDocType.prototype.attList = function(elementName, attributeName, attributeType, defaultValueType, defaultValue) {
	      var child;
	      child = new XMLDTDAttList(this, elementName, attributeName, attributeType, defaultValueType, defaultValue);
	      this.children.push(child);
	      return this;
	    };

	    XMLDocType.prototype.entity = function(name, value) {
	      var child;
	      child = new XMLDTDEntity(this, false, name, value);
	      this.children.push(child);
	      return this;
	    };

	    XMLDocType.prototype.pEntity = function(name, value) {
	      var child;
	      child = new XMLDTDEntity(this, true, name, value);
	      this.children.push(child);
	      return this;
	    };

	    XMLDocType.prototype.notation = function(name, value) {
	      var child;
	      child = new XMLDTDNotation(this, name, value);
	      this.children.push(child);
	      return this;
	    };

	    XMLDocType.prototype.cdata = function(value) {
	      var child;
	      child = new XMLCData(this, value);
	      this.children.push(child);
	      return this;
	    };

	    XMLDocType.prototype.comment = function(value) {
	      var child;
	      child = new XMLComment(this, value);
	      this.children.push(child);
	      return this;
	    };

	    XMLDocType.prototype.instruction = function(target, value) {
	      var child;
	      child = new XMLProcessingInstruction(this, target, value);
	      this.children.push(child);
	      return this;
	    };

	    XMLDocType.prototype.root = function() {
	      return this.documentObject.root();
	    };

	    XMLDocType.prototype.document = function() {
	      return this.documentObject;
	    };

	    XMLDocType.prototype.toString = function(options, level) {
	      var child, i, indent, len, newline, offset, pretty, r, ref, ref1, ref2, ref3, space;
	      pretty = (options != null ? options.pretty : void 0) || false;
	      indent = (ref = options != null ? options.indent : void 0) != null ? ref : '  ';
	      offset = (ref1 = options != null ? options.offset : void 0) != null ? ref1 : 0;
	      newline = (ref2 = options != null ? options.newline : void 0) != null ? ref2 : '\n';
	      level || (level = 0);
	      space = new Array(level + offset + 1).join(indent);
	      r = '';
	      if (pretty) {
	        r += space;
	      }
	      r += '<!DOCTYPE ' + this.root().name;
	      if (this.pubID && this.sysID) {
	        r += ' PUBLIC "' + this.pubID + '" "' + this.sysID + '"';
	      } else if (this.sysID) {
	        r += ' SYSTEM "' + this.sysID + '"';
	      }
	      if (this.children.length > 0) {
	        r += ' [';
	        if (pretty) {
	          r += newline;
	        }
	        ref3 = this.children;
	        for (i = 0, len = ref3.length; i < len; i++) {
	          child = ref3[i];
	          r += child.toString(options, level + 1);
	        }
	        r += ']';
	      }
	      r += '>';
	      if (pretty) {
	        r += newline;
	      }
	      return r;
	    };

	    XMLDocType.prototype.ele = function(name, value) {
	      return this.element(name, value);
	    };

	    XMLDocType.prototype.att = function(elementName, attributeName, attributeType, defaultValueType, defaultValue) {
	      return this.attList(elementName, attributeName, attributeType, defaultValueType, defaultValue);
	    };

	    XMLDocType.prototype.ent = function(name, value) {
	      return this.entity(name, value);
	    };

	    XMLDocType.prototype.pent = function(name, value) {
	      return this.pEntity(name, value);
	    };

	    XMLDocType.prototype.not = function(name, value) {
	      return this.notation(name, value);
	    };

	    XMLDocType.prototype.dat = function(value) {
	      return this.cdata(value);
	    };

	    XMLDocType.prototype.com = function(value) {
	      return this.comment(value);
	    };

	    XMLDocType.prototype.ins = function(target, value) {
	      return this.instruction(target, value);
	    };

	    XMLDocType.prototype.up = function() {
	      return this.root();
	    };

	    XMLDocType.prototype.doc = function() {
	      return this.document();
	    };

	    return XMLDocType;

	  })();

	}).call(this);


/***/ },
/* 76 */
/***/ function(module, exports, __webpack_require__) {

	// Generated by CoffeeScript 1.9.1
	(function() {
	  var XMLDTDAttList, create;

	  create = __webpack_require__(41);

	  module.exports = XMLDTDAttList = (function() {
	    function XMLDTDAttList(parent, elementName, attributeName, attributeType, defaultValueType, defaultValue) {
	      this.stringify = parent.stringify;
	      if (elementName == null) {
	        throw new Error("Missing DTD element name");
	      }
	      if (attributeName == null) {
	        throw new Error("Missing DTD attribute name");
	      }
	      if (!attributeType) {
	        throw new Error("Missing DTD attribute type");
	      }
	      if (!defaultValueType) {
	        throw new Error("Missing DTD attribute default");
	      }
	      if (defaultValueType.indexOf('#') !== 0) {
	        defaultValueType = '#' + defaultValueType;
	      }
	      if (!defaultValueType.match(/^(#REQUIRED|#IMPLIED|#FIXED|#DEFAULT)$/)) {
	        throw new Error("Invalid default value type; expected: #REQUIRED, #IMPLIED, #FIXED or #DEFAULT");
	      }
	      if (defaultValue && !defaultValueType.match(/^(#FIXED|#DEFAULT)$/)) {
	        throw new Error("Default value only applies to #FIXED or #DEFAULT");
	      }
	      this.elementName = this.stringify.eleName(elementName);
	      this.attributeName = this.stringify.attName(attributeName);
	      this.attributeType = this.stringify.dtdAttType(attributeType);
	      this.defaultValue = this.stringify.dtdAttDefault(defaultValue);
	      this.defaultValueType = defaultValueType;
	    }

	    XMLDTDAttList.prototype.clone = function() {
	      return create(XMLDTDAttList.prototype, this);
	    };

	    XMLDTDAttList.prototype.toString = function(options, level) {
	      var indent, newline, offset, pretty, r, ref, ref1, ref2, space;
	      pretty = (options != null ? options.pretty : void 0) || false;
	      indent = (ref = options != null ? options.indent : void 0) != null ? ref : '  ';
	      offset = (ref1 = options != null ? options.offset : void 0) != null ? ref1 : 0;
	      newline = (ref2 = options != null ? options.newline : void 0) != null ? ref2 : '\n';
	      level || (level = 0);
	      space = new Array(level + offset + 1).join(indent);
	      r = '';
	      if (pretty) {
	        r += space;
	      }
	      r += '<!ATTLIST ' + this.elementName + ' ' + this.attributeName + ' ' + this.attributeType;
	      if (this.defaultValueType !== '#DEFAULT') {
	        r += ' ' + this.defaultValueType;
	      }
	      if (this.defaultValue) {
	        r += ' "' + this.defaultValue + '"';
	      }
	      r += '>';
	      if (pretty) {
	        r += newline;
	      }
	      return r;
	    };

	    return XMLDTDAttList;

	  })();

	}).call(this);


/***/ },
/* 77 */
/***/ function(module, exports, __webpack_require__) {

	// Generated by CoffeeScript 1.9.1
	(function() {
	  var XMLDTDEntity, create, isObject;

	  create = __webpack_require__(41);

	  isObject = __webpack_require__(27);

	  module.exports = XMLDTDEntity = (function() {
	    function XMLDTDEntity(parent, pe, name, value) {
	      this.stringify = parent.stringify;
	      if (name == null) {
	        throw new Error("Missing entity name");
	      }
	      if (value == null) {
	        throw new Error("Missing entity value");
	      }
	      this.pe = !!pe;
	      this.name = this.stringify.eleName(name);
	      if (!isObject(value)) {
	        this.value = this.stringify.dtdEntityValue(value);
	      } else {
	        if (!value.pubID && !value.sysID) {
	          throw new Error("Public and/or system identifiers are required for an external entity");
	        }
	        if (value.pubID && !value.sysID) {
	          throw new Error("System identifier is required for a public external entity");
	        }
	        if (value.pubID != null) {
	          this.pubID = this.stringify.dtdPubID(value.pubID);
	        }
	        if (value.sysID != null) {
	          this.sysID = this.stringify.dtdSysID(value.sysID);
	        }
	        if (value.nData != null) {
	          this.nData = this.stringify.dtdNData(value.nData);
	        }
	        if (this.pe && this.nData) {
	          throw new Error("Notation declaration is not allowed in a parameter entity");
	        }
	      }
	    }

	    XMLDTDEntity.prototype.clone = function() {
	      return create(XMLDTDEntity.prototype, this);
	    };

	    XMLDTDEntity.prototype.toString = function(options, level) {
	      var indent, newline, offset, pretty, r, ref, ref1, ref2, space;
	      pretty = (options != null ? options.pretty : void 0) || false;
	      indent = (ref = options != null ? options.indent : void 0) != null ? ref : '  ';
	      offset = (ref1 = options != null ? options.offset : void 0) != null ? ref1 : 0;
	      newline = (ref2 = options != null ? options.newline : void 0) != null ? ref2 : '\n';
	      level || (level = 0);
	      space = new Array(level + offset + 1).join(indent);
	      r = '';
	      if (pretty) {
	        r += space;
	      }
	      r += '<!ENTITY';
	      if (this.pe) {
	        r += ' %';
	      }
	      r += ' ' + this.name;
	      if (this.value) {
	        r += ' "' + this.value + '"';
	      } else {
	        if (this.pubID && this.sysID) {
	          r += ' PUBLIC "' + this.pubID + '" "' + this.sysID + '"';
	        } else if (this.sysID) {
	          r += ' SYSTEM "' + this.sysID + '"';
	        }
	        if (this.nData) {
	          r += ' NDATA ' + this.nData;
	        }
	      }
	      r += '>';
	      if (pretty) {
	        r += newline;
	      }
	      return r;
	    };

	    return XMLDTDEntity;

	  })();

	}).call(this);


/***/ },
/* 78 */
/***/ function(module, exports, __webpack_require__) {

	// Generated by CoffeeScript 1.9.1
	(function() {
	  var XMLDTDElement, create, isArray;

	  create = __webpack_require__(41);

	  isArray = __webpack_require__(30);

	  module.exports = XMLDTDElement = (function() {
	    function XMLDTDElement(parent, name, value) {
	      this.stringify = parent.stringify;
	      if (name == null) {
	        throw new Error("Missing DTD element name");
	      }
	      if (!value) {
	        value = '(#PCDATA)';
	      }
	      if (isArray(value)) {
	        value = '(' + value.join(',') + ')';
	      }
	      this.name = this.stringify.eleName(name);
	      this.value = this.stringify.dtdElementValue(value);
	    }

	    XMLDTDElement.prototype.clone = function() {
	      return create(XMLDTDElement.prototype, this);
	    };

	    XMLDTDElement.prototype.toString = function(options, level) {
	      var indent, newline, offset, pretty, r, ref, ref1, ref2, space;
	      pretty = (options != null ? options.pretty : void 0) || false;
	      indent = (ref = options != null ? options.indent : void 0) != null ? ref : '  ';
	      offset = (ref1 = options != null ? options.offset : void 0) != null ? ref1 : 0;
	      newline = (ref2 = options != null ? options.newline : void 0) != null ? ref2 : '\n';
	      level || (level = 0);
	      space = new Array(level + offset + 1).join(indent);
	      r = '';
	      if (pretty) {
	        r += space;
	      }
	      r += '<!ELEMENT ' + this.name + ' ' + this.value + '>';
	      if (pretty) {
	        r += newline;
	      }
	      return r;
	    };

	    return XMLDTDElement;

	  })();

	}).call(this);


/***/ },
/* 79 */
/***/ function(module, exports, __webpack_require__) {

	// Generated by CoffeeScript 1.9.1
	(function() {
	  var XMLDTDNotation, create;

	  create = __webpack_require__(41);

	  module.exports = XMLDTDNotation = (function() {
	    function XMLDTDNotation(parent, name, value) {
	      this.stringify = parent.stringify;
	      if (name == null) {
	        throw new Error("Missing notation name");
	      }
	      if (!value.pubID && !value.sysID) {
	        throw new Error("Public or system identifiers are required for an external entity");
	      }
	      this.name = this.stringify.eleName(name);
	      if (value.pubID != null) {
	        this.pubID = this.stringify.dtdPubID(value.pubID);
	      }
	      if (value.sysID != null) {
	        this.sysID = this.stringify.dtdSysID(value.sysID);
	      }
	    }

	    XMLDTDNotation.prototype.clone = function() {
	      return create(XMLDTDNotation.prototype, this);
	    };

	    XMLDTDNotation.prototype.toString = function(options, level) {
	      var indent, newline, offset, pretty, r, ref, ref1, ref2, space;
	      pretty = (options != null ? options.pretty : void 0) || false;
	      indent = (ref = options != null ? options.indent : void 0) != null ? ref : '  ';
	      offset = (ref1 = options != null ? options.offset : void 0) != null ? ref1 : 0;
	      newline = (ref2 = options != null ? options.newline : void 0) != null ? ref2 : '\n';
	      level || (level = 0);
	      space = new Array(level + offset + 1).join(indent);
	      r = '';
	      if (pretty) {
	        r += space;
	      }
	      r += '<!NOTATION ' + this.name;
	      if (this.pubID && this.sysID) {
	        r += ' PUBLIC "' + this.pubID + '" "' + this.sysID + '"';
	      } else if (this.pubID) {
	        r += ' PUBLIC "' + this.pubID + '"';
	      } else if (this.sysID) {
	        r += ' SYSTEM "' + this.sysID + '"';
	      }
	      r += '>';
	      if (pretty) {
	        r += newline;
	      }
	      return r;
	    };

	    return XMLDTDNotation;

	  })();

	}).call(this);


/***/ },
/* 80 */
/***/ function(module, exports, __webpack_require__) {

	// Generated by CoffeeScript 1.9.1
	(function() {
	  var XMLNode, XMLRaw, create,
	    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
	    hasProp = {}.hasOwnProperty;

	  create = __webpack_require__(41);

	  XMLNode = __webpack_require__(43);

	  module.exports = XMLRaw = (function(superClass) {
	    extend(XMLRaw, superClass);

	    function XMLRaw(parent, text) {
	      XMLRaw.__super__.constructor.call(this, parent);
	      if (text == null) {
	        throw new Error("Missing raw text");
	      }
	      this.value = this.stringify.raw(text);
	    }

	    XMLRaw.prototype.clone = function() {
	      return create(XMLRaw.prototype, this);
	    };

	    XMLRaw.prototype.toString = function(options, level) {
	      var indent, newline, offset, pretty, r, ref, ref1, ref2, space;
	      pretty = (options != null ? options.pretty : void 0) || false;
	      indent = (ref = options != null ? options.indent : void 0) != null ? ref : '  ';
	      offset = (ref1 = options != null ? options.offset : void 0) != null ? ref1 : 0;
	      newline = (ref2 = options != null ? options.newline : void 0) != null ? ref2 : '\n';
	      level || (level = 0);
	      space = new Array(level + offset + 1).join(indent);
	      r = '';
	      if (pretty) {
	        r += space;
	      }
	      r += this.value;
	      if (pretty) {
	        r += newline;
	      }
	      return r;
	    };

	    return XMLRaw;

	  })(XMLNode);

	}).call(this);


/***/ },
/* 81 */
/***/ function(module, exports, __webpack_require__) {

	// Generated by CoffeeScript 1.9.1
	(function() {
	  var XMLNode, XMLText, create,
	    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
	    hasProp = {}.hasOwnProperty;

	  create = __webpack_require__(41);

	  XMLNode = __webpack_require__(43);

	  module.exports = XMLText = (function(superClass) {
	    extend(XMLText, superClass);

	    function XMLText(parent, text) {
	      XMLText.__super__.constructor.call(this, parent);
	      if (text == null) {
	        throw new Error("Missing element text");
	      }
	      this.value = this.stringify.eleText(text);
	    }

	    XMLText.prototype.clone = function() {
	      return create(XMLText.prototype, this);
	    };

	    XMLText.prototype.toString = function(options, level) {
	      var indent, newline, offset, pretty, r, ref, ref1, ref2, space;
	      pretty = (options != null ? options.pretty : void 0) || false;
	      indent = (ref = options != null ? options.indent : void 0) != null ? ref : '  ';
	      offset = (ref1 = options != null ? options.offset : void 0) != null ? ref1 : 0;
	      newline = (ref2 = options != null ? options.newline : void 0) != null ? ref2 : '\n';
	      level || (level = 0);
	      space = new Array(level + offset + 1).join(indent);
	      r = '';
	      if (pretty) {
	        r += space;
	      }
	      r += this.value;
	      if (pretty) {
	        r += newline;
	      }
	      return r;
	    };

	    return XMLText;

	  })(XMLNode);

	}).call(this);


/***/ },
/* 82 */
/***/ function(module, exports, __webpack_require__) {

	var Collection = __webpack_require__(12);
	var Operation = __webpack_require__(83);
	var Shape = __webpack_require__(11);
	var Paginator = __webpack_require__(84);
	var ResourceWaiter = __webpack_require__(85);

	var util = __webpack_require__(4);
	var property = util.property;
	var memoizedProperty = util.memoizedProperty;

	function Api(api, options) {
	  api = api || {};
	  options = options || {};
	  options.api = this;

	  api.metadata = api.metadata || {};

	  property(this, 'isApi', true, false);
	  property(this, 'apiVersion', api.metadata.apiVersion);
	  property(this, 'endpointPrefix', api.metadata.endpointPrefix);
	  property(this, 'signingName', api.metadata.signingName);
	  property(this, 'globalEndpoint', api.metadata.globalEndpoint);
	  property(this, 'signatureVersion', api.metadata.signatureVersion);
	  property(this, 'jsonVersion', api.metadata.jsonVersion);
	  property(this, 'targetPrefix', api.metadata.targetPrefix);
	  property(this, 'protocol', api.metadata.protocol);
	  property(this, 'timestampFormat', api.metadata.timestampFormat);
	  property(this, 'xmlNamespaceUri', api.metadata.xmlNamespace);
	  property(this, 'abbreviation', api.metadata.serviceAbbreviation);
	  property(this, 'fullName', api.metadata.serviceFullName);

	  memoizedProperty(this, 'className', function() {
	    var name = api.metadata.serviceAbbreviation || api.metadata.serviceFullName;
	    if (!name) return null;

	    name = name.replace(/^Amazon|AWS\s*|\(.*|\s+|\W+/g, '');
	    if (name === 'ElasticLoadBalancing') name = 'ELB';
	    return name;
	  });

	  property(this, 'operations', new Collection(api.operations, options, function(name, operation) {
	    return new Operation(name, operation, options);
	  }, util.string.lowerFirst));

	  property(this, 'shapes', new Collection(api.shapes, options, function(name, shape) {
	    return Shape.create(shape, options);
	  }));

	  property(this, 'paginators', new Collection(api.paginators, options, function(name, paginator) {
	    return new Paginator(name, paginator, options);
	  }));

	  property(this, 'waiters', new Collection(api.waiters, options, function(name, waiter) {
	    return new ResourceWaiter(name, waiter, options);
	  }, util.string.lowerFirst));

	  if (options.documentation) {
	    property(this, 'documentation', api.documentation);
	    property(this, 'documentationUrl', api.documentationUrl);
	  }
	}

	module.exports = Api;


/***/ },
/* 83 */
/***/ function(module, exports, __webpack_require__) {

	var Shape = __webpack_require__(11);

	var util = __webpack_require__(4);
	var property = util.property;
	var memoizedProperty = util.memoizedProperty;

	function Operation(name, operation, options) {
	  var self = this;
	  options = options || {};

	  property(this, 'name', operation.name || name);
	  property(this, 'api', options.api, false);

	  operation.http = operation.http || {};
	  property(this, 'httpMethod', operation.http.method || 'POST');
	  property(this, 'httpPath', operation.http.requestUri || '/');
	  property(this, 'authtype', operation.authtype || '');

	  memoizedProperty(this, 'input', function() {
	    if (!operation.input) {
	      return new Shape.create({type: 'structure'}, options);
	    }
	    return Shape.create(operation.input, options);
	  });

	  memoizedProperty(this, 'output', function() {
	    if (!operation.output) {
	      return new Shape.create({type: 'structure'}, options);
	    }
	    return Shape.create(operation.output, options);
	  });

	  memoizedProperty(this, 'errors', function() {
	    var list = [];
	    if (!operation.errors) return null;

	    for (var i = 0; i < operation.errors.length; i++) {
	      list.push(Shape.create(operation.errors[i], options));
	    }

	    return list;
	  });

	  memoizedProperty(this, 'paginator', function() {
	    return options.api.paginators[name];
	  });

	  if (options.documentation) {
	    property(this, 'documentation', operation.documentation);
	    property(this, 'documentationUrl', operation.documentationUrl);
	  }

	  // idempotentMembers only tracks top-level input shapes
	  memoizedProperty(this, 'idempotentMembers', function() {
	    var idempotentMembers = [];
	    var input = self.input;
	    var members = input.members;
	    if (!input.members) {
	      return idempotentMembers;
	    }
	    for (var name in members) {
	      if (!members.hasOwnProperty(name)) {
	        continue;
	      }
	      if (members[name].isIdempotent === true) {
	        idempotentMembers.push(name);
	      }
	    }
	    return idempotentMembers;
	  });

	}

	module.exports = Operation;


/***/ },
/* 84 */
/***/ function(module, exports, __webpack_require__) {

	var property = __webpack_require__(4).property;

	function Paginator(name, paginator) {
	  property(this, 'inputToken', paginator.input_token);
	  property(this, 'limitKey', paginator.limit_key);
	  property(this, 'moreResults', paginator.more_results);
	  property(this, 'outputToken', paginator.output_token);
	  property(this, 'resultKey', paginator.result_key);
	}

	module.exports = Paginator;


/***/ },
/* 85 */
/***/ function(module, exports, __webpack_require__) {

	var util = __webpack_require__(4);
	var property = util.property;

	function ResourceWaiter(name, waiter, options) {
	  options = options || {};
	  property(this, 'name', name);
	  property(this, 'api', options.api, false);

	  if (waiter.operation) {
	    property(this, 'operation', util.string.lowerFirst(waiter.operation));
	  }

	  var self = this;
	  var keys = [
	    'type',
	    'description',
	    'delay',
	    'maxAttempts',
	    'acceptors'
	  ];

	  keys.forEach(function(key) {
	    var value = waiter[key];
	    if (value) {
	      property(self, key, value);
	    }
	  });
	}

	module.exports = ResourceWaiter;


/***/ },
/* 86 */
/***/ function(module, exports, __webpack_require__) {

	var AWS = __webpack_require__(5);
	var Api = __webpack_require__(82);
	var regionConfig = __webpack_require__(87);
	var inherit = AWS.util.inherit;
	var clientCount = 0;

	/**
	 * The service class representing an AWS service.
	 *
	 * @abstract
	 *
	 * @!attribute apiVersions
	 *   @return [Array<String>] the list of API versions supported by this service.
	 *   @readonly
	 */
	AWS.Service = inherit({
	  /**
	   * Create a new service object with a configuration object
	   *
	   * @param config [map] a map of configuration options
	   */
	  constructor: function Service(config) {
	    if (!this.loadServiceClass) {
	      throw AWS.util.error(new Error(),
	        'Service must be constructed with `new\' operator');
	    }
	    var ServiceClass = this.loadServiceClass(config || {});
	    if (ServiceClass) {
	      var originalConfig = AWS.util.copy(config);
	      var svc = new ServiceClass(config);
	      Object.defineProperty(svc, '_originalConfig', {
	        get: function() { return originalConfig; },
	        enumerable: false,
	        configurable: true
	      });
	      svc._clientId = ++clientCount;
	      return svc;
	    }
	    this.initialize(config);
	  },

	  /**
	   * @api private
	   */
	  initialize: function initialize(config) {
	    var svcConfig = AWS.config[this.serviceIdentifier];

	    this.config = new AWS.Config(AWS.config);
	    if (svcConfig) this.config.update(svcConfig, true);
	    if (config) this.config.update(config, true);

	    this.validateService();
	    if (!this.config.endpoint) regionConfig(this);

	    this.config.endpoint = this.endpointFromTemplate(this.config.endpoint);
	    this.setEndpoint(this.config.endpoint);
	  },

	  /**
	   * @api private
	   */
	  validateService: function validateService() {
	  },

	  /**
	   * @api private
	   */
	  loadServiceClass: function loadServiceClass(serviceConfig) {
	    var config = serviceConfig;
	    if (!AWS.util.isEmpty(this.api)) {
	      return null;
	    } else if (config.apiConfig) {
	      return AWS.Service.defineServiceApi(this.constructor, config.apiConfig);
	    } else if (!this.constructor.services) {
	      return null;
	    } else {
	      config = new AWS.Config(AWS.config);
	      config.update(serviceConfig, true);
	      var version = config.apiVersions[this.constructor.serviceIdentifier];
	      version = version || config.apiVersion;
	      return this.getLatestServiceClass(version);
	    }
	  },

	  /**
	   * @api private
	   */
	  getLatestServiceClass: function getLatestServiceClass(version) {
	    version = this.getLatestServiceVersion(version);
	    if (this.constructor.services[version] === null) {
	      AWS.Service.defineServiceApi(this.constructor, version);
	    }

	    return this.constructor.services[version];
	  },

	  /**
	   * @api private
	   */
	  getLatestServiceVersion: function getLatestServiceVersion(version) {
	    if (!this.constructor.services || this.constructor.services.length === 0) {
	      throw new Error('No services defined on ' +
	                      this.constructor.serviceIdentifier);
	    }

	    if (!version) {
	      version = 'latest';
	    } else if (AWS.util.isType(version, Date)) {
	      version = AWS.util.date.iso8601(version).split('T')[0];
	    }

	    if (Object.hasOwnProperty(this.constructor.services, version)) {
	      return version;
	    }

	    var keys = Object.keys(this.constructor.services).sort();
	    var selectedVersion = null;
	    for (var i = keys.length - 1; i >= 0; i--) {
	      // versions that end in "*" are not available on disk and can be
	      // skipped, so do not choose these as selectedVersions
	      if (keys[i][keys[i].length - 1] !== '*') {
	        selectedVersion = keys[i];
	      }
	      if (keys[i].substr(0, 10) <= version) {
	        return selectedVersion;
	      }
	    }

	    throw new Error('Could not find ' + this.constructor.serviceIdentifier +
	                    ' API to satisfy version constraint `' + version + '\'');
	  },

	  /**
	   * @api private
	   */
	  api: {},

	  /**
	   * @api private
	   */
	  defaultRetryCount: 3,

	  /**
	   * @api private
	   */
	  customizeRequests: function customizeRequests(callback) {
	    if (!callback) {
	      this.customRequestHandler = null;
	    } else if (typeof callback === 'function') {
	      this.customRequestHandler = callback;
	    } else {
	      throw new Error('Invalid callback type \'' + typeof callback + '\' provided in customizeRequests');
	    }
	  },

	  /**
	   * Calls an operation on a service with the given input parameters.
	   *
	   * @param operation [String] the name of the operation to call on the service.
	   * @param params [map] a map of input options for the operation
	   * @callback callback function(err, data)
	   *   If a callback is supplied, it is called when a response is returned
	   *   from the service.
	   *   @param err [Error] the error object returned from the request.
	   *     Set to `null` if the request is successful.
	   *   @param data [Object] the de-serialized data returned from
	   *     the request. Set to `null` if a request error occurs.
	   */
	  makeRequest: function makeRequest(operation, params, callback) {
	    if (typeof params === 'function') {
	      callback = params;
	      params = null;
	    }

	    params = params || {};
	    if (this.config.params) { // copy only toplevel bound params
	      var rules = this.api.operations[operation];
	      if (rules) {
	        params = AWS.util.copy(params);
	        AWS.util.each(this.config.params, function(key, value) {
	          if (rules.input.members[key]) {
	            if (params[key] === undefined || params[key] === null) {
	              params[key] = value;
	            }
	          }
	        });
	      }
	    }

	    var request = new AWS.Request(this, operation, params);
	    this.addAllRequestListeners(request);

	    if (callback) request.send(callback);
	    return request;
	  },

	  /**
	   * Calls an operation on a service with the given input parameters, without
	   * any authentication data. This method is useful for "public" API operations.
	   *
	   * @param operation [String] the name of the operation to call on the service.
	   * @param params [map] a map of input options for the operation
	   * @callback callback function(err, data)
	   *   If a callback is supplied, it is called when a response is returned
	   *   from the service.
	   *   @param err [Error] the error object returned from the request.
	   *     Set to `null` if the request is successful.
	   *   @param data [Object] the de-serialized data returned from
	   *     the request. Set to `null` if a request error occurs.
	   */
	  makeUnauthenticatedRequest: function makeUnauthenticatedRequest(operation, params, callback) {
	    if (typeof params === 'function') {
	      callback = params;
	      params = {};
	    }

	    var request = this.makeRequest(operation, params).toUnauthenticated();
	    return callback ? request.send(callback) : request;
	  },

	  /**
	   * Waits for a given state
	   *
	   * @param state [String] the state on the service to wait for
	   * @param params [map] a map of parameters to pass with each request
	   * @callback callback function(err, data)
	   *   If a callback is supplied, it is called when a response is returned
	   *   from the service.
	   *   @param err [Error] the error object returned from the request.
	   *     Set to `null` if the request is successful.
	   *   @param data [Object] the de-serialized data returned from
	   *     the request. Set to `null` if a request error occurs.
	   */
	  waitFor: function waitFor(state, params, callback) {
	    var waiter = new AWS.ResourceWaiter(this, state);
	    return waiter.wait(params, callback);
	  },

	  /**
	   * @api private
	   */
	  addAllRequestListeners: function addAllRequestListeners(request) {
	    var list = [AWS.events, AWS.EventListeners.Core, this.serviceInterface(),
	                AWS.EventListeners.CorePost];
	    for (var i = 0; i < list.length; i++) {
	      if (list[i]) request.addListeners(list[i]);
	    }

	    // disable parameter validation
	    if (!this.config.paramValidation) {
	      request.removeListener('validate',
	        AWS.EventListeners.Core.VALIDATE_PARAMETERS);
	    }

	    if (this.config.logger) { // add logging events
	      request.addListeners(AWS.EventListeners.Logger);
	    }

	    this.setupRequestListeners(request);
	    // call prototype's customRequestHandler
	    if (typeof this.constructor.prototype.customRequestHandler === 'function') {
	      this.constructor.prototype.customRequestHandler(request);
	    }
	    // call instance's customRequestHandler
	    if (Object.prototype.hasOwnProperty.call(this, 'customRequestHandler') && typeof this.customRequestHandler === 'function') {
	      this.customRequestHandler(request);
	    }
	  },

	  /**
	   * Override this method to setup any custom request listeners for each
	   * new request to the service.
	   *
	   * @abstract
	   */
	  setupRequestListeners: function setupRequestListeners() {
	  },

	  /**
	   * Gets the signer class for a given request
	   * @api private
	   */
	  getSignerClass: function getSignerClass() {
	    var version;
	    if (this.config.signatureVersion) {
	      version = this.config.signatureVersion;
	    } else {
	      version = this.api.signatureVersion;
	    }
	    return AWS.Signers.RequestSigner.getVersion(version);
	  },

	  /**
	   * @api private
	   */
	  serviceInterface: function serviceInterface() {
	    switch (this.api.protocol) {
	      case 'ec2': return AWS.EventListeners.Query;
	      case 'query': return AWS.EventListeners.Query;
	      case 'json': return AWS.EventListeners.Json;
	      case 'rest-json': return AWS.EventListeners.RestJson;
	      case 'rest-xml': return AWS.EventListeners.RestXml;
	    }
	    if (this.api.protocol) {
	      throw new Error('Invalid service `protocol\' ' +
	        this.api.protocol + ' in API config');
	    }
	  },

	  /**
	   * @api private
	   */
	  successfulResponse: function successfulResponse(resp) {
	    return resp.httpResponse.statusCode < 300;
	  },

	  /**
	   * How many times a failed request should be retried before giving up.
	   * the defaultRetryCount can be overriden by service classes.
	   *
	   * @api private
	   */
	  numRetries: function numRetries() {
	    if (this.config.maxRetries !== undefined) {
	      return this.config.maxRetries;
	    } else {
	      return this.defaultRetryCount;
	    }
	  },

	  /**
	   * @api private
	   */
	  retryDelays: function retryDelays(retryCount) {
	    return AWS.util.calculateRetryDelay(retryCount, this.config.retryDelayOptions);
	  },

	  /**
	   * @api private
	   */
	  retryableError: function retryableError(error) {
	    if (this.networkingError(error)) return true;
	    if (this.expiredCredentialsError(error)) return true;
	    if (this.throttledError(error)) return true;
	    if (error.statusCode >= 500) return true;
	    return false;
	  },

	  /**
	   * @api private
	   */
	  networkingError: function networkingError(error) {
	    return error.code === 'NetworkingError';
	  },

	  /**
	   * @api private
	   */
	  expiredCredentialsError: function expiredCredentialsError(error) {
	    // TODO : this only handles *one* of the expired credential codes
	    return (error.code === 'ExpiredTokenException');
	  },

	  /**
	   * @api private
	   */
	  clockSkewError: function clockSkewError(error) {
	    switch (error.code) {
	      case 'RequestTimeTooSkewed':
	      case 'RequestExpired':
	      case 'InvalidSignatureException':
	      case 'SignatureDoesNotMatch':
	      case 'AuthFailure':
	      case 'RequestInTheFuture':
	        return true;
	      default: return false;
	    }
	  },

	  /**
	   * @api private
	   */
	  throttledError: function throttledError(error) {
	    // this logic varies between services
	    switch (error.code) {
	      case 'ProvisionedThroughputExceededException':
	      case 'Throttling':
	      case 'ThrottlingException':
	      case 'RequestLimitExceeded':
	      case 'RequestThrottled':
	        return true;
	      default:
	        return false;
	    }
	  },

	  /**
	   * @api private
	   */
	  endpointFromTemplate: function endpointFromTemplate(endpoint) {
	    if (typeof endpoint !== 'string') return endpoint;

	    var e = endpoint;
	    e = e.replace(/\{service\}/g, this.api.endpointPrefix);
	    e = e.replace(/\{region\}/g, this.config.region);
	    e = e.replace(/\{scheme\}/g, this.config.sslEnabled ? 'https' : 'http');
	    return e;
	  },

	  /**
	   * @api private
	   */
	  setEndpoint: function setEndpoint(endpoint) {
	    this.endpoint = new AWS.Endpoint(endpoint, this.config);
	  },

	  /**
	   * @api private
	   */
	  paginationConfig: function paginationConfig(operation, throwException) {
	    var paginator = this.api.operations[operation].paginator;
	    if (!paginator) {
	      if (throwException) {
	        var e = new Error();
	        throw AWS.util.error(e, 'No pagination configuration for ' + operation);
	      }
	      return null;
	    }

	    return paginator;
	  }
	});

	AWS.util.update(AWS.Service, {

	  /**
	   * Adds one method for each operation described in the api configuration
	   *
	   * @api private
	   */
	  defineMethods: function defineMethods(svc) {
	    AWS.util.each(svc.prototype.api.operations, function iterator(method) {
	      if (svc.prototype[method]) return;
	      var operation = svc.prototype.api.operations[method];
	      if (operation.authtype === 'none') {
	        svc.prototype[method] = function (params, callback) {
	          return this.makeUnauthenticatedRequest(method, params, callback);
	        };
	      } else {
	        svc.prototype[method] = function (params, callback) {
	          return this.makeRequest(method, params, callback);
	        };
	      }
	    });
	  },

	  /**
	   * Defines a new Service class using a service identifier and list of versions
	   * including an optional set of features (functions) to apply to the class
	   * prototype.
	   *
	   * @param serviceIdentifier [String] the identifier for the service
	   * @param versions [Array<String>] a list of versions that work with this
	   *   service
	   * @param features [Object] an object to attach to the prototype
	   * @return [Class<Service>] the service class defined by this function.
	   */
	  defineService: function defineService(serviceIdentifier, versions, features) {
	    AWS.Service._serviceMap[serviceIdentifier] = true;
	    if (!Array.isArray(versions)) {
	      features = versions;
	      versions = [];
	    }

	    var svc = inherit(AWS.Service, features || {});

	    if (typeof serviceIdentifier === 'string') {
	      AWS.Service.addVersions(svc, versions);

	      var identifier = svc.serviceIdentifier || serviceIdentifier;
	      svc.serviceIdentifier = identifier;
	    } else { // defineService called with an API
	      svc.prototype.api = serviceIdentifier;
	      AWS.Service.defineMethods(svc);
	    }

	    return svc;
	  },

	  /**
	   * @api private
	   */
	  addVersions: function addVersions(svc, versions) {
	    if (!Array.isArray(versions)) versions = [versions];

	    svc.services = svc.services || {};
	    for (var i = 0; i < versions.length; i++) {
	      if (svc.services[versions[i]] === undefined) {
	        svc.services[versions[i]] = null;
	      }
	    }

	    svc.apiVersions = Object.keys(svc.services).sort();
	  },

	  /**
	   * @api private
	   */
	  defineServiceApi: function defineServiceApi(superclass, version, apiConfig) {
	    var svc = inherit(superclass, {
	      serviceIdentifier: superclass.serviceIdentifier
	    });

	    function setApi(api) {
	      if (api.isApi) {
	        svc.prototype.api = api;
	      } else {
	        svc.prototype.api = new Api(api);
	      }
	    }

	    if (typeof version === 'string') {
	      if (apiConfig) {
	        setApi(apiConfig);
	      } else {
	        try {
	          setApi(AWS.apiLoader(superclass.serviceIdentifier, version));
	        } catch (err) {
	          throw AWS.util.error(err, {
	            message: 'Could not find API configuration ' +
	              superclass.serviceIdentifier + '-' + version
	          });
	        }
	      }
	      if (!Object.prototype.hasOwnProperty.call(superclass.services, version)) {
	        superclass.apiVersions = superclass.apiVersions.concat(version).sort();
	      }
	      superclass.services[version] = svc;
	    } else {
	      setApi(version);
	    }

	    AWS.Service.defineMethods(svc);
	    return svc;
	  },

	  /**
	   * @api private
	   */
	  hasService: function(identifier) {
	    return Object.prototype.hasOwnProperty.call(AWS.Service._serviceMap, identifier);
	  },

	  /**
	   * @api private
	   */
	  _serviceMap: {}
	});

	module.exports = AWS.Service;

/***/ },
/* 87 */
/***/ function(module, exports, __webpack_require__) {

	var util = __webpack_require__(4);
	var regionConfig = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./region_config.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

	function generateRegionPrefix(region) {
	  if (!region) return null;

	  var parts = region.split('-');
	  if (parts.length < 3) return null;
	  return parts.slice(0, parts.length - 2).join('-') + '-*';
	}

	function derivedKeys(service) {
	  var region = service.config.region;
	  var regionPrefix = generateRegionPrefix(region);
	  var endpointPrefix = service.api.endpointPrefix;

	  return [
	    [region, endpointPrefix],
	    [regionPrefix, endpointPrefix],
	    [region, '*'],
	    [regionPrefix, '*'],
	    ['*', endpointPrefix],
	    ['*', '*']
	  ].map(function(item) {
	    return item[0] && item[1] ? item.join('/') : null;
	  });
	}

	function applyConfig(service, config) {
	  util.each(config, function(key, value) {
	    if (key === 'globalEndpoint') return;
	    if (service.config[key] === undefined || service.config[key] === null) {
	      service.config[key] = value;
	    }
	  });
	}

	function configureEndpoint(service) {
	  var keys = derivedKeys(service);
	  for (var i = 0; i < keys.length; i++) {
	    var key = keys[i];
	    if (!key) continue;

	    if (Object.prototype.hasOwnProperty.call(regionConfig.rules, key)) {
	      var config = regionConfig.rules[key];
	      if (typeof config === 'string') {
	        config = regionConfig.patterns[config];
	      }

	      // set dualstack endpoint
	      if (service.config.useDualstack && util.isDualstackAvailable(service)) {
	        config = util.copy(config);
	        config.endpoint = '{service}.dualstack.{region}.amazonaws.com';
	      }

	      // set global endpoint
	      service.isGlobalEndpoint = !!config.globalEndpoint;

	      // signature version
	      if (!config.signatureVersion) config.signatureVersion = 'v4';

	      // merge config
	      applyConfig(service, config);
	      return;
	    }
	  }
	}

	module.exports = configureEndpoint;


/***/ },
/* 88 */,
/* 89 */
/***/ function(module, exports, __webpack_require__) {

	var AWS = __webpack_require__(5);
	__webpack_require__(90);
	__webpack_require__(91);
	var PromisesDependency;

	/**
	 * The main configuration class used by all service objects to set
	 * the region, credentials, and other options for requests.
	 *
	 * By default, credentials and region settings are left unconfigured.
	 * This should be configured by the application before using any
	 * AWS service APIs.
	 *
	 * In order to set global configuration options, properties should
	 * be assigned to the global {AWS.config} object.
	 *
	 * @see AWS.config
	 *
	 * @!group General Configuration Options
	 *
	 * @!attribute credentials
	 *   @return [AWS.Credentials] the AWS credentials to sign requests with.
	 *
	 * @!attribute region
	 *   @example Set the global region setting to us-west-2
	 *     AWS.config.update({region: 'us-west-2'});
	 *   @return [AWS.Credentials] The region to send service requests to.
	 *   @see http://docs.amazonwebservices.com/general/latest/gr/rande.html
	 *     A list of available endpoints for each AWS service
	 *
	 * @!attribute maxRetries
	 *   @return [Integer] the maximum amount of retries to perform for a
	 *     service request. By default this value is calculated by the specific
	 *     service object that the request is being made to.
	 *
	 * @!attribute maxRedirects
	 *   @return [Integer] the maximum amount of redirects to follow for a
	 *     service request. Defaults to 10.
	 *
	 * @!attribute paramValidation
	 *   @return [Boolean|map] whether input parameters should be validated against
	 *     the operation description before sending the request. Defaults to true.
	 *     Pass a map to enable any of the following specific validation features:
	 *
	 *     * **min** [Boolean] &mdash; Validates that a value meets the min
	 *       constraint. This is enabled by default when paramValidation is set
	 *       to `true`.
	 *     * **max** [Boolean] &mdash; Validates that a value meets the max
	 *       constraint.
	 *     * **pattern** [Boolean] &mdash; Validates that a string value matches a
	 *       regular expression.
	 *     * **enum** [Boolean] &mdash; Validates that a string value matches one
	 *       of the allowable enum values.
	 *
	 * @!attribute computeChecksums
	 *   @return [Boolean] whether to compute checksums for payload bodies when
	 *     the service accepts it (currently supported in S3 only).
	 *
	 * @!attribute convertResponseTypes
	 *   @return [Boolean] whether types are converted when parsing response data.
	 *     Currently only supported for JSON based services. Turning this off may
	 *     improve performance on large response payloads. Defaults to `true`.
	 *
	 * @!attribute correctClockSkew
	 *   @return [Boolean] whether to apply a clock skew correction and retry
	 *     requests that fail because of an skewed client clock. Defaults to
	 *     `false`.
	 *
	 * @!attribute sslEnabled
	 *   @return [Boolean] whether SSL is enabled for requests
	 *
	 * @!attribute s3ForcePathStyle
	 *   @return [Boolean] whether to force path style URLs for S3 objects
	 *
	 * @!attribute s3BucketEndpoint
	 *   @note Setting this configuration option requires an `endpoint` to be
	 *     provided explicitly to the service constructor.
	 *   @return [Boolean] whether the provided endpoint addresses an individual
	 *     bucket (false if it addresses the root API endpoint).
	 *
	 * @!attribute s3DisableBodySigning
	 *   @return [Boolean] whether to disable S3 body signing when using signature version `v4`.
	 *     Body signing can only be disabled when using https. Defaults to `true`.
	 *
	 * @!attribute useAccelerateEndpoint
	 *   @note This configuration option is only compatible with S3 while accessing
	 *     dns-compatible buckets.
	 *   @return [Boolean] Whether to use the Accelerate endpoint with the S3 service.
	 *     Defaults to `false`.
	 *
	 * @!attribute retryDelayOptions
	 *   @example Set the base retry delay for all services to 300 ms
	 *     AWS.config.update({retryDelayOptions: {base: 300}});
	 *     // Delays with maxRetries = 3: 300, 600, 1200
	 *   @example Set a custom backoff function to provide delay values on retries
	 *     AWS.config.update({retryDelayOptions: {customBackoff: function(retryCount) {
	 *       // returns delay in ms
	 *     }}});
	 *   @note This works with all services except DynamoDB.
	 *   @return [map] A set of options to configure the retry delay on retryable errors.
	 *     Currently supported options are:
	 *
	 *     * **base** [Integer] &mdash; The base number of milliseconds to use in the
	 *       exponential backoff for operation retries. Defaults to 100 ms.
	 *     * **customBackoff ** [function] &mdash; A custom function that accepts a retry count
	 *       and returns the amount of time to delay in milliseconds. The `base` option will be
	 *       ignored if this option is supplied.
	 *
	 * @!attribute httpOptions
	 *   @return [map] A set of options to pass to the low-level HTTP request.
	 *     Currently supported options are:
	 *
	 *     * **proxy** [String] &mdash; the URL to proxy requests through
	 *     * **agent** [http.Agent, https.Agent] &mdash; the Agent object to perform
	 *       HTTP requests with. Used for connection pooling. Defaults to the global
	 *       agent (`http.globalAgent`) for non-SSL connections. Note that for
	 *       SSL connections, a special Agent object is used in order to enable
	 *       peer certificate verification. This feature is only supported in the
	 *       Node.js environment.
	 *     * **timeout** [Integer] &mdash; The number of milliseconds to wait before
	 *       giving up on a connection attempt. Defaults to two minutes (120000).
	 *     * **xhrAsync** [Boolean] &mdash; Whether the SDK will send asynchronous
	 *       HTTP requests. Used in the browser environment only. Set to false to
	 *       send requests synchronously. Defaults to true (async on).
	 *     * **xhrWithCredentials** [Boolean] &mdash; Sets the "withCredentials"
	 *       property of an XMLHttpRequest object. Used in the browser environment
	 *       only. Defaults to false.
	 * @!attribute logger
	 *   @return [#write,#log] an object that responds to .write() (like a stream)
	 *     or .log() (like the console object) in order to log information about
	 *     requests
	 *
	 * @!attribute systemClockOffset
	 *   @return [Number] an offset value in milliseconds to apply to all signing
	 *     times. Use this to compensate for clock skew when your system may be
	 *     out of sync with the service time. Note that this configuration option
	 *     can only be applied to the global `AWS.config` object and cannot be
	 *     overridden in service-specific configuration. Defaults to 0 milliseconds.
	 *
	 * @!attribute signatureVersion
	 *   @return [String] the signature version to sign requests with (overriding
	 *     the API configuration). Possible values are: 'v2', 'v3', 'v4'.
	 *
	 * @!attribute signatureCache
	 *   @return [Boolean] whether the signature to sign requests with (overriding
	 *     the API configuration) is cached. Only applies to the signature version 'v4'.
	 *     Defaults to `true`.
	 */
	AWS.Config = AWS.util.inherit({
	  /**
	   * @!endgroup
	   */

	  /**
	   * Creates a new configuration object. This is the object that passes
	   * option data along to service requests, including credentials, security,
	   * region information, and some service specific settings.
	   *
	   * @example Creating a new configuration object with credentials and region
	   *   var config = new AWS.Config({
	   *     accessKeyId: 'AKID', secretAccessKey: 'SECRET', region: 'us-west-2'
	   *   });
	   * @option options accessKeyId [String] your AWS access key ID.
	   * @option options secretAccessKey [String] your AWS secret access key.
	   * @option options sessionToken [AWS.Credentials] the optional AWS
	   *   session token to sign requests with.
	   * @option options credentials [AWS.Credentials] the AWS credentials
	   *   to sign requests with. You can either specify this object, or
	   *   specify the accessKeyId and secretAccessKey options directly.
	   * @option options credentialProvider [AWS.CredentialProviderChain] the
	   *   provider chain used to resolve credentials if no static `credentials`
	   *   property is set.
	   * @option options region [String] the region to send service requests to.
	   *   See {region} for more information.
	   * @option options maxRetries [Integer] the maximum amount of retries to
	   *   attempt with a request. See {maxRetries} for more information.
	   * @option options maxRedirects [Integer] the maximum amount of redirects to
	   *   follow with a request. See {maxRedirects} for more information.
	   * @option options sslEnabled [Boolean] whether to enable SSL for
	   *   requests.
	   * @option options paramValidation [Boolean|map] whether input parameters
	   *   should be validated against the operation description before sending
	   *   the request. Defaults to true. Pass a map to enable any of the
	   *   following specific validation features:
	   *
	   *   * **min** [Boolean] &mdash; Validates that a value meets the min
	   *     constraint. This is enabled by default when paramValidation is set
	   *     to `true`.
	   *   * **max** [Boolean] &mdash; Validates that a value meets the max
	   *     constraint.
	   *   * **pattern** [Boolean] &mdash; Validates that a string value matches a
	   *     regular expression.
	   *   * **enum** [Boolean] &mdash; Validates that a string value matches one
	   *     of the allowable enum values.
	   * @option options computeChecksums [Boolean] whether to compute checksums
	   *   for payload bodies when the service accepts it (currently supported
	   *   in S3 only)
	   * @option options convertResponseTypes [Boolean] whether types are converted
	   *     when parsing response data. Currently only supported for JSON based
	   *     services. Turning this off may improve performance on large response
	   *     payloads. Defaults to `true`.
	   * @option options correctClockSkew [Boolean] whether to apply a clock skew
	   *     correction and retry requests that fail because of an skewed client
	   *     clock. Defaults to `false`.
	   * @option options s3ForcePathStyle [Boolean] whether to force path
	   *   style URLs for S3 objects.
	   * @option options s3BucketEndpoint [Boolean] whether the provided endpoint
	   *   addresses an individual bucket (false if it addresses the root API
	   *   endpoint). Note that setting this configuration option requires an
	   *   `endpoint` to be provided explicitly to the service constructor.
	   * @option options s3DisableBodySigning [Boolean] whether S3 body signing
	   *   should be disabled when using signature version `v4`. Body signing
	   *   can only be disabled when using https. Defaults to `true`.
	   *
	   * @option options retryDelayOptions [map] A set of options to configure
	   *   the retry delay on retryable errors. Currently supported options are:
	   *
	   *   * **base** [Integer] &mdash; The base number of milliseconds to use in the
	   *     exponential backoff for operation retries. Defaults to 100 ms.
	   *   * **customBackoff ** [function] &mdash; A custom function that accepts a retry count
	   *     and returns the amount of time to delay in milliseconds. The `base` option will be
	   *     ignored if this option is supplied.
	   * @option options httpOptions [map] A set of options to pass to the low-level
	   *   HTTP request. Currently supported options are:
	   *
	   *   * **proxy** [String] &mdash; the URL to proxy requests through
	   *   * **agent** [http.Agent, https.Agent] &mdash; the Agent object to perform
	   *     HTTP requests with. Used for connection pooling. Defaults to the global
	   *     agent (`http.globalAgent`) for non-SSL connections. Note that for
	   *     SSL connections, a special Agent object is used in order to enable
	   *     peer certificate verification. This feature is only available in the
	   *     Node.js environment.
	   *   * **timeout** [Integer] &mdash; Sets the socket to timeout after timeout
	   *     milliseconds of inactivity on the socket. Defaults to two minutes
	   *     (120000).
	   *   * **xhrAsync** [Boolean] &mdash; Whether the SDK will send asynchronous
	   *     HTTP requests. Used in the browser environment only. Set to false to
	   *     send requests synchronously. Defaults to true (async on).
	   *   * **xhrWithCredentials** [Boolean] &mdash; Sets the "withCredentials"
	   *     property of an XMLHttpRequest object. Used in the browser environment
	   *     only. Defaults to false.
	   * @option options apiVersion [String, Date] a String in YYYY-MM-DD format
	   *   (or a date) that represents the latest possible API version that can be
	   *   used in all services (unless overridden by `apiVersions`). Specify
	   *   'latest' to use the latest possible version.
	   * @option options apiVersions [map<String, String|Date>] a map of service
	   *   identifiers (the lowercase service class name) with the API version to
	   *   use when instantiating a service. Specify 'latest' for each individual
	   *   that can use the latest available version.
	   * @option options logger [#write,#log] an object that responds to .write()
	   *   (like a stream) or .log() (like the console object) in order to log
	   *   information about requests
	   * @option options systemClockOffset [Number] an offset value in milliseconds
	   *   to apply to all signing times. Use this to compensate for clock skew
	   *   when your system may be out of sync with the service time. Note that
	   *   this configuration option can only be applied to the global `AWS.config`
	   *   object and cannot be overridden in service-specific configuration.
	   *   Defaults to 0 milliseconds.
	   * @option options signatureVersion [String] the signature version to sign
	   *   requests with (overriding the API configuration). Possible values are:
	   *   'v2', 'v3', 'v4'.
	   * @option options signatureCache [Boolean] whether the signature to sign
	   *   requests with (overriding the API configuration) is cached. Only applies
	   *   to the signature version 'v4'. Defaults to `true`.
	   */
	  constructor: function Config(options) {
	    if (options === undefined) options = {};
	    options = this.extractCredentials(options);

	    AWS.util.each.call(this, this.keys, function (key, value) {
	      this.set(key, options[key], value);
	    });
	  },

	  /**
	   * @!group Managing Credentials
	   */

	  /**
	   * Loads credentials from the configuration object. This is used internally
	   * by the SDK to ensure that refreshable {Credentials} objects are properly
	   * refreshed and loaded when sending a request. If you want to ensure that
	   * your credentials are loaded prior to a request, you can use this method
	   * directly to provide accurate credential data stored in the object.
	   *
	   * @note If you configure the SDK with static or environment credentials,
	   *   the credential data should already be present in {credentials} attribute.
	   *   This method is primarily necessary to load credentials from asynchronous
	   *   sources, or sources that can refresh credentials periodically.
	   * @example Getting your access key
	   *   AWS.config.getCredentials(function(err) {
	   *     if (err) console.log(err.stack); // credentials not loaded
	   *     else console.log("Access Key:", AWS.config.credentials.accessKeyId);
	   *   })
	   * @callback callback function(err)
	   *   Called when the {credentials} have been properly set on the configuration
	   *   object.
	   *
	   *   @param err [Error] if this is set, credentials were not successfuly
	   *     loaded and this error provides information why.
	   * @see credentials
	   * @see Credentials
	   */
	  getCredentials: function getCredentials(callback) {
	    var self = this;

	    function finish(err) {
	      callback(err, err ? null : self.credentials);
	    }

	    function credError(msg, err) {
	      return new AWS.util.error(err || new Error(), {
	        code: 'CredentialsError', message: msg
	      });
	    }

	    function getAsyncCredentials() {
	      self.credentials.get(function(err) {
	        if (err) {
	          var msg = 'Could not load credentials from ' +
	            self.credentials.constructor.name;
	          err = credError(msg, err);
	        }
	        finish(err);
	      });
	    }

	    function getStaticCredentials() {
	      var err = null;
	      if (!self.credentials.accessKeyId || !self.credentials.secretAccessKey) {
	        err = credError('Missing credentials');
	      }
	      finish(err);
	    }

	    if (self.credentials) {
	      if (typeof self.credentials.get === 'function') {
	        getAsyncCredentials();
	      } else { // static credentials
	        getStaticCredentials();
	      }
	    } else if (self.credentialProvider) {
	      self.credentialProvider.resolve(function(err, creds) {
	        if (err) {
	          err = credError('Could not load credentials from any providers', err);
	        }
	        self.credentials = creds;
	        finish(err);
	      });
	    } else {
	      finish(credError('No credentials to load'));
	    }
	  },

	  /**
	   * @!group Loading and Setting Configuration Options
	   */

	  /**
	   * @overload update(options, allowUnknownKeys = false)
	   *   Updates the current configuration object with new options.
	   *
	   *   @example Update maxRetries property of a configuration object
	   *     config.update({maxRetries: 10});
	   *   @param [Object] options a map of option keys and values.
	   *   @param [Boolean] allowUnknownKeys whether unknown keys can be set on
	   *     the configuration object. Defaults to `false`.
	   *   @see constructor
	   */
	  update: function update(options, allowUnknownKeys) {
	    allowUnknownKeys = allowUnknownKeys || false;
	    options = this.extractCredentials(options);
	    AWS.util.each.call(this, options, function (key, value) {
	      if (allowUnknownKeys || Object.prototype.hasOwnProperty.call(this.keys, key) ||
	          AWS.Service.hasService(key)) {
	        this.set(key, value);
	      }
	    });
	  },

	  /**
	   * Loads configuration data from a JSON file into this config object.
	   * @note Loading configuration will reset all existing configuration
	   *   on the object.
	   * @!macro nobrowser
	   * @param path [String] the path relative to your process's current
	   *    working directory to load configuration from.
	   * @return [AWS.Config] the same configuration object
	   */
	  loadFromPath: function loadFromPath(path) {
	    this.clear();

	    var options = JSON.parse(AWS.util.readFileSync(path));
	    var fileSystemCreds = new AWS.FileSystemCredentials(path);
	    var chain = new AWS.CredentialProviderChain();
	    chain.providers.unshift(fileSystemCreds);
	    chain.resolve(function (err, creds) {
	      if (err) throw err;
	      else options.credentials = creds;
	    });

	    this.constructor(options);

	    return this;
	  },

	  /**
	   * Clears configuration data on this object
	   *
	   * @api private
	   */
	  clear: function clear() {
	    /*jshint forin:false */
	    AWS.util.each.call(this, this.keys, function (key) {
	      delete this[key];
	    });

	    // reset credential provider
	    this.set('credentials', undefined);
	    this.set('credentialProvider', undefined);
	  },

	  /**
	   * Sets a property on the configuration object, allowing for a
	   * default value
	   * @api private
	   */
	  set: function set(property, value, defaultValue) {
	    if (value === undefined) {
	      if (defaultValue === undefined) {
	        defaultValue = this.keys[property];
	      }
	      if (typeof defaultValue === 'function') {
	        this[property] = defaultValue.call(this);
	      } else {
	        this[property] = defaultValue;
	      }
	    } else if (property === 'httpOptions' && this[property]) {
	      // deep merge httpOptions
	      this[property] = AWS.util.merge(this[property], value);
	    } else {
	      this[property] = value;
	    }
	  },

	  /**
	   * All of the keys with their default values.
	   *
	   * @constant
	   * @api private
	   */
	  keys: {
	    credentials: null,
	    credentialProvider: null,
	    region: null,
	    logger: null,
	    apiVersions: {},
	    apiVersion: null,
	    endpoint: undefined,
	    httpOptions: {
	      timeout: 120000
	    },
	    maxRetries: undefined,
	    maxRedirects: 10,
	    paramValidation: true,
	    sslEnabled: true,
	    s3ForcePathStyle: false,
	    s3BucketEndpoint: false,
	    s3DisableBodySigning: true,
	    computeChecksums: true,
	    convertResponseTypes: true,
	    correctClockSkew: false,
	    customUserAgent: null,
	    dynamoDbCrc32: true,
	    systemClockOffset: 0,
	    signatureVersion: null,
	    signatureCache: true,
	    retryDelayOptions: {
	      base: 100
	    },
	    useAccelerateEndpoint: false
	  },

	  /**
	   * Extracts accessKeyId, secretAccessKey and sessionToken
	   * from a configuration hash.
	   *
	   * @api private
	   */
	  extractCredentials: function extractCredentials(options) {
	    if (options.accessKeyId && options.secretAccessKey) {
	      options = AWS.util.copy(options);
	      options.credentials = new AWS.Credentials(options);
	    }
	    return options;
	  },

	  /**
	   * Sets the promise dependency the SDK will use wherever Promises are returned.
	   * Passing `null` will force the SDK to use native Promises if they are available.
	   * If native Promises are not available, passing `null` will have no effect.
	   * @param [Constructor] dep A reference to a Promise constructor
	   */
	  setPromisesDependency: function setPromisesDependency(dep) {
	    PromisesDependency = dep;
	    // if null was passed in, we should try to use native promises
	    if (dep === null && typeof Promise === 'function') {
	      PromisesDependency = Promise;
	    }
	    var constructors = [AWS.Request, AWS.Credentials, AWS.CredentialProviderChain];
	    if (AWS.S3 && AWS.S3.ManagedUpload) constructors.push(AWS.S3.ManagedUpload);
	    AWS.util.addPromises(constructors, PromisesDependency);
	  },

	  /**
	   * Gets the promise dependency set by `AWS.config.setPromisesDependency`.
	   */
	  getPromisesDependency: function getPromisesDependency() {
	    return PromisesDependency;
	  }
	});

	/**
	 * @return [AWS.Config] The global configuration object singleton instance
	 * @readonly
	 * @see AWS.Config
	 */
	AWS.config = new AWS.Config();


/***/ },
/* 90 */
/***/ function(module, exports, __webpack_require__) {

	var AWS = __webpack_require__(5);

	/**
	 * Represents your AWS security credentials, specifically the
	 * {accessKeyId}, {secretAccessKey}, and optional {sessionToken}.
	 * Creating a `Credentials` object allows you to pass around your
	 * security information to configuration and service objects.
	 *
	 * Note that this class typically does not need to be constructed manually,
	 * as the {AWS.Config} and {AWS.Service} classes both accept simple
	 * options hashes with the three keys. These structures will be converted
	 * into Credentials objects automatically.
	 *
	 * ## Expiring and Refreshing Credentials
	 *
	 * Occasionally credentials can expire in the middle of a long-running
	 * application. In this case, the SDK will automatically attempt to
	 * refresh the credentials from the storage location if the Credentials
	 * class implements the {refresh} method.
	 *
	 * If you are implementing a credential storage location, you
	 * will want to create a subclass of the `Credentials` class and
	 * override the {refresh} method. This method allows credentials to be
	 * retrieved from the backing store, be it a file system, database, or
	 * some network storage. The method should reset the credential attributes
	 * on the object.
	 *
	 * @!attribute expired
	 *   @return [Boolean] whether the credentials have been expired and
	 *     require a refresh. Used in conjunction with {expireTime}.
	 * @!attribute expireTime
	 *   @return [Date] a time when credentials should be considered expired. Used
	 *     in conjunction with {expired}.
	 * @!attribute accessKeyId
	 *   @return [String] the AWS access key ID
	 * @!attribute secretAccessKey
	 *   @return [String] the AWS secret access key
	 * @!attribute sessionToken
	 *   @return [String] an optional AWS session token
	 */
	AWS.Credentials = AWS.util.inherit({
	  /**
	   * A credentials object can be created using positional arguments or an options
	   * hash.
	   *
	   * @overload AWS.Credentials(accessKeyId, secretAccessKey, sessionToken=null)
	   *   Creates a Credentials object with a given set of credential information
	   *   as positional arguments.
	   *   @param accessKeyId [String] the AWS access key ID
	   *   @param secretAccessKey [String] the AWS secret access key
	   *   @param sessionToken [String] the optional AWS session token
	   *   @example Create a credentials object with AWS credentials
	   *     var creds = new AWS.Credentials('akid', 'secret', 'session');
	   * @overload AWS.Credentials(options)
	   *   Creates a Credentials object with a given set of credential information
	   *   as an options hash.
	   *   @option options accessKeyId [String] the AWS access key ID
	   *   @option options secretAccessKey [String] the AWS secret access key
	   *   @option options sessionToken [String] the optional AWS session token
	   *   @example Create a credentials object with AWS credentials
	   *     var creds = new AWS.Credentials({
	   *       accessKeyId: 'akid', secretAccessKey: 'secret', sessionToken: 'session'
	   *     });
	   */
	  constructor: function Credentials() {
	    // hide secretAccessKey from being displayed with util.inspect
	    AWS.util.hideProperties(this, ['secretAccessKey']);

	    this.expired = false;
	    this.expireTime = null;
	    if (arguments.length === 1 && typeof arguments[0] === 'object') {
	      var creds = arguments[0].credentials || arguments[0];
	      this.accessKeyId = creds.accessKeyId;
	      this.secretAccessKey = creds.secretAccessKey;
	      this.sessionToken = creds.sessionToken;
	    } else {
	      this.accessKeyId = arguments[0];
	      this.secretAccessKey = arguments[1];
	      this.sessionToken = arguments[2];
	    }
	  },

	  /**
	   * @return [Integer] the window size in seconds to attempt refreshing of
	   *   credentials before the expireTime occurs.
	   */
	  expiryWindow: 15,

	  /**
	   * @return [Boolean] whether the credentials object should call {refresh}
	   * @note Subclasses should override this method to provide custom refresh
	   *   logic.
	   */
	  needsRefresh: function needsRefresh() {
	    var currentTime = AWS.util.date.getDate().getTime();
	    var adjustedTime = new Date(currentTime + this.expiryWindow * 1000);

	    if (this.expireTime && adjustedTime > this.expireTime) {
	      return true;
	    } else {
	      return this.expired || !this.accessKeyId || !this.secretAccessKey;
	    }
	  },

	  /**
	   * Gets the existing credentials, refreshing them if they are not yet loaded
	   * or have expired. Users should call this method before using {refresh},
	   * as this will not attempt to reload credentials when they are already
	   * loaded into the object.
	   *
	   * @callback callback function(err)
	   *   When this callback is called with no error, it means either credentials
	   *   do not need to be refreshed or refreshed credentials information has
	   *   been loaded into the object (as the `accessKeyId`, `secretAccessKey`,
	   *   and `sessionToken` properties).
	   *   @param err [Error] if an error occurred, this value will be filled
	   */
	  get: function get(callback) {
	    var self = this;
	    if (this.needsRefresh()) {
	      this.refresh(function(err) {
	        if (!err) self.expired = false; // reset expired flag
	        if (callback) callback(err);
	      });
	    } else if (callback) {
	      callback();
	    }
	  },

	  /**
	   * @!method  getPromise()
	   *   Returns a 'thenable' promise.
	   *   Gets the existing credentials, refreshing them if they are not yet loaded
	   *   or have expired. Users should call this method before using {refresh},
	   *   as this will not attempt to reload credentials when they are already
	   *   loaded into the object.
	   *
	   *   Two callbacks can be provided to the `then` method on the returned promise.
	   *   The first callback will be called if the promise is fulfilled, and the second
	   *   callback will be called if the promise is rejected.
	   *   @callback fulfilledCallback function()
	   *     Called if the promise is fulfilled. When this callback is called, it
	   *     means either credentials do not need to be refreshed or refreshed
	   *     credentials information has been loaded into the object (as the
	   *     `accessKeyId`, `secretAccessKey`, and `sessionToken` properties).
	   *   @callback rejectedCallback function(err)
	   *     Called if the promise is rejected.
	   *     @param err [Error] if an error occurred, this value will be filled
	   *   @return [Promise] A promise that represents the state of the `get` call.
	   *   @example Calling the `getPromise` method.
	   *     var promise = credProvider.getPromise();
	   *     promise.then(function() { ... }, function(err) { ... });
	   */

	  /**
	   * @!method  refreshPromise()
	   *   Returns a 'thenable' promise.
	   *   Refreshes the credentials. Users should call {get} before attempting
	   *   to forcibly refresh credentials.
	   *
	   *   Two callbacks can be provided to the `then` method on the returned promise.
	   *   The first callback will be called if the promise is fulfilled, and the second
	   *   callback will be called if the promise is rejected.
	   *   @callback fulfilledCallback function()
	   *     Called if the promise is fulfilled. When this callback is called, it
	   *     means refreshed credentials information has been loaded into the object
	   *     (as the `accessKeyId`, `secretAccessKey`, and `sessionToken` properties).
	   *   @callback rejectedCallback function(err)
	   *     Called if the promise is rejected.
	   *     @param err [Error] if an error occurred, this value will be filled
	   *   @return [Promise] A promise that represents the state of the `refresh` call.
	   *   @example Calling the `refreshPromise` method.
	   *     var promise = credProvider.refreshPromise();
	   *     promise.then(function() { ... }, function(err) { ... });
	   */

	  /**
	   * Refreshes the credentials. Users should call {get} before attempting
	   * to forcibly refresh credentials.
	   *
	   * @callback callback function(err)
	   *   When this callback is called with no error, it means refreshed
	   *   credentials information has been loaded into the object (as the
	   *   `accessKeyId`, `secretAccessKey`, and `sessionToken` properties).
	   *   @param err [Error] if an error occurred, this value will be filled
	   * @note Subclasses should override this class to reset the
	   *   {accessKeyId}, {secretAccessKey} and optional {sessionToken}
	   *   on the credentials object and then call the callback with
	   *   any error information.
	   * @see get
	   */
	  refresh: function refresh(callback) {
	    this.expired = false;
	    callback();
	  }
	});

	/**
	 * @api private
	 */
	AWS.Credentials.addPromisesToClass = function addPromisesToClass(PromiseDependency) {
	  this.prototype.getPromise = AWS.util.promisifyMethod('get', PromiseDependency);
	  this.prototype.refreshPromise = AWS.util.promisifyMethod('refresh', PromiseDependency);
	};

	/**
	 * @api private
	 */
	AWS.Credentials.deletePromisesFromClass = function deletePromisesFromClass() {
	  delete this.prototype.getPromise;
	  delete this.prototype.refreshPromise;
	};

	AWS.util.addPromises(AWS.Credentials);


/***/ },
/* 91 */
/***/ function(module, exports, __webpack_require__) {

	var AWS = __webpack_require__(5);

	/**
	 * Creates a credential provider chain that searches for AWS credentials
	 * in a list of credential providers specified by the {providers} property.
	 *
	 * By default, the chain will use the {defaultProviders} to resolve credentials.
	 * These providers will look in the environment using the
	 * {AWS.EnvironmentCredentials} class with the 'AWS' and 'AMAZON' prefixes.
	 *
	 * ## Setting Providers
	 *
	 * Each provider in the {providers} list should be a function that returns
	 * a {AWS.Credentials} object, or a hardcoded credentials object. The function
	 * form allows for delayed execution of the credential construction.
	 *
	 * ## Resolving Credentials from a Chain
	 *
	 * Call {resolve} to return the first valid credential object that can be
	 * loaded by the provider chain.
	 *
	 * For example, to resolve a chain with a custom provider that checks a file
	 * on disk after the set of {defaultProviders}:
	 *
	 * ```javascript
	 * var diskProvider = new AWS.FileSystemCredentials('./creds.json');
	 * var chain = new AWS.CredentialProviderChain();
	 * chain.providers.push(diskProvider);
	 * chain.resolve();
	 * ```
	 *
	 * The above code will return the `diskProvider` object if the
	 * file contains credentials and the `defaultProviders` do not contain
	 * any credential settings.
	 *
	 * @!attribute providers
	 *   @return [Array<AWS.Credentials, Function>]
	 *     a list of credentials objects or functions that return credentials
	 *     objects. If the provider is a function, the function will be
	 *     executed lazily when the provider needs to be checked for valid
	 *     credentials. By default, this object will be set to the
	 *     {defaultProviders}.
	 *   @see defaultProviders
	 */
	AWS.CredentialProviderChain = AWS.util.inherit(AWS.Credentials, {

	  /**
	   * Creates a new CredentialProviderChain with a default set of providers
	   * specified by {defaultProviders}.
	   */
	  constructor: function CredentialProviderChain(providers) {
	    if (providers) {
	      this.providers = providers;
	    } else {
	      this.providers = AWS.CredentialProviderChain.defaultProviders.slice(0);
	    }
	  },

	  /**
	   * @!method  resolvePromise()
	   *   Returns a 'thenable' promise.
	   *   Resolves the provider chain by searching for the first set of
	   *   credentials in {providers}.
	   *
	   *   Two callbacks can be provided to the `then` method on the returned promise.
	   *   The first callback will be called if the promise is fulfilled, and the second
	   *   callback will be called if the promise is rejected.
	   *   @callback fulfilledCallback function(credentials)
	   *     Called if the promise is fulfilled and the provider resolves the chain
	   *     to a credentials object
	   *     @param credentials [AWS.Credentials] the credentials object resolved
	   *       by the provider chain.
	   *   @callback rejectedCallback function(error)
	   *     Called if the promise is rejected.
	   *     @param err [Error] the error object returned if no credentials are found.
	   *   @return [Promise] A promise that represents the state of the `resolve` method call.
	   *   @example Calling the `resolvePromise` method.
	   *     var promise = chain.resolvePromise();
	   *     promise.then(function(credentials) { ... }, function(err) { ... });
	   */

	  /**
	   * Resolves the provider chain by searching for the first set of
	   * credentials in {providers}.
	   *
	   * @callback callback function(err, credentials)
	   *   Called when the provider resolves the chain to a credentials object
	   *   or null if no credentials can be found.
	   *
	   *   @param err [Error] the error object returned if no credentials are
	   *     found.
	   *   @param credentials [AWS.Credentials] the credentials object resolved
	   *     by the provider chain.
	   * @return [AWS.CredentialProviderChain] the provider, for chaining.
	   */
	  resolve: function resolve(callback) {
	    if (this.providers.length === 0) {
	      callback(new Error('No providers'));
	      return this;
	    }

	    var index = 0;
	    var providers = this.providers.slice(0);

	    function resolveNext(err, creds) {
	      if ((!err && creds) || index === providers.length) {
	        callback(err, creds);
	        return;
	      }

	      var provider = providers[index++];
	      if (typeof provider === 'function') {
	        creds = provider.call();
	      } else {
	        creds = provider;
	      }

	      if (creds.get) {
	        creds.get(function(getErr) {
	          resolveNext(getErr, getErr ? null : creds);
	        });
	      } else {
	        resolveNext(null, creds);
	      }
	    }

	    resolveNext();
	    return this;
	  }
	});

	/**
	 * The default set of providers used by a vanilla CredentialProviderChain.
	 *
	 * In the browser:
	 *
	 * ```javascript
	 * AWS.CredentialProviderChain.defaultProviders = []
	 * ```
	 *
	 * In Node.js:
	 *
	 * ```javascript
	 * AWS.CredentialProviderChain.defaultProviders = [
	 *   function () { return new AWS.EnvironmentCredentials('AWS'); },
	 *   function () { return new AWS.EnvironmentCredentials('AMAZON'); },
	 *   function () { return new AWS.SharedIniFileCredentials(); },
	 *   function () {
	 *     // if AWS_CONTAINER_CREDENTIALS_RELATIVE_URI is set
	 *       return new AWS.ECSCredentials();
	 *     // else
	 *       return new AWS.EC2MetadataCredentials();
	 *   }
	 * ]
	 * ```
	 */
	AWS.CredentialProviderChain.defaultProviders = [];

	/**
	 * @api private
	 */
	AWS.CredentialProviderChain.addPromisesToClass = function addPromisesToClass(PromiseDependency) {
	  this.prototype.resolvePromise = AWS.util.promisifyMethod('resolve', PromiseDependency);
	};

	/**
	 * @api private
	 */
	AWS.CredentialProviderChain.deletePromisesFromClass = function deletePromisesFromClass() {
	  delete this.prototype.resolvePromise;
	};

	AWS.util.addPromises(AWS.CredentialProviderChain);


/***/ },
/* 92 */
/***/ function(module, exports, __webpack_require__) {

	var AWS = __webpack_require__(5);
	var STS = __webpack_require__(93);

	/**
	 * Represents temporary credentials retrieved from {AWS.STS}. Without any
	 * extra parameters, credentials will be fetched from the
	 * {AWS.STS.getSessionToken} operation. If an IAM role is provided, the
	 * {AWS.STS.assumeRole} operation will be used to fetch credentials for the
	 * role instead.
	 *
	 * To setup temporary credentials, configure a set of master credentials
	 * using the standard credentials providers (environment, EC2 instance metadata,
	 * or from the filesystem), then set the global credentials to a new
	 * temporary credentials object:
	 *
	 * ```javascript
	 * // Note that environment credentials are loaded by default,
	 * // the following line is shown for clarity:
	 * AWS.config.credentials = new AWS.EnvironmentCredentials('AWS');
	 *
	 * // Now set temporary credentials seeded from the master credentials
	 * AWS.config.credentials = new AWS.TemporaryCredentials();
	 *
	 * // subsequent requests will now use temporary credentials from AWS STS.
	 * new AWS.S3().listBucket(function(err, data) { ... });
	 * ```
	 *
	 * @!attribute masterCredentials
	 *   @return [AWS.Credentials] the master (non-temporary) credentials used to
	 *     get and refresh temporary credentials from AWS STS.
	 * @note (see constructor)
	 */
	AWS.TemporaryCredentials = AWS.util.inherit(AWS.Credentials, {
	  /**
	   * Creates a new temporary credentials object.
	   *
	   * @note In order to create temporary credentials, you first need to have
	   *   "master" credentials configured in {AWS.Config.credentials}. These
	   *   master credentials are necessary to retrieve the temporary credentials,
	   *   as well as refresh the credentials when they expire.
	   * @param params [map] a map of options that are passed to the
	   *   {AWS.STS.assumeRole} or {AWS.STS.getSessionToken} operations.
	   *   If a `RoleArn` parameter is passed in, credentials will be based on the
	   *   IAM role.
	   * @example Creating a new credentials object for generic temporary credentials
	   *   AWS.config.credentials = new AWS.TemporaryCredentials();
	   * @example Creating a new credentials object for an IAM role
	   *   AWS.config.credentials = new AWS.TemporaryCredentials({
	   *     RoleArn: 'arn:aws:iam::1234567890:role/TemporaryCredentials',
	   *   });
	   * @see AWS.STS.assumeRole
	   * @see AWS.STS.getSessionToken
	   */
	  constructor: function TemporaryCredentials(params) {
	    AWS.Credentials.call(this);
	    this.loadMasterCredentials();
	    this.expired = true;

	    this.params = params || {};
	    if (this.params.RoleArn) {
	      this.params.RoleSessionName =
	        this.params.RoleSessionName || 'temporary-credentials';
	    }
	  },

	  /**
	   * Refreshes credentials using {AWS.STS.assumeRole} or
	   * {AWS.STS.getSessionToken}, depending on whether an IAM role ARN was passed
	   * to the credentials {constructor}.
	   *
	   * @callback callback function(err)
	   *   Called when the STS service responds (or fails). When
	   *   this callback is called with no error, it means that the credentials
	   *   information has been loaded into the object (as the `accessKeyId`,
	   *   `secretAccessKey`, and `sessionToken` properties).
	   *   @param err [Error] if an error occurred, this value will be filled
	   * @see get
	   */
	  refresh: function refresh(callback) {
	    var self = this;
	    self.createClients();
	    if (!callback) callback = function(err) { if (err) throw err; };

	    self.service.config.credentials = self.masterCredentials;
	    var operation = self.params.RoleArn ?
	      self.service.assumeRole : self.service.getSessionToken;
	    operation.call(self.service, function (err, data) {
	      if (!err) {
	        self.service.credentialsFrom(data, self);
	      }
	      callback(err);
	    });
	  },

	  /**
	   * @api private
	   */
	  loadMasterCredentials: function loadMasterCredentials() {
	    this.masterCredentials = AWS.config.credentials;
	    while (this.masterCredentials.masterCredentials) {
	      this.masterCredentials = this.masterCredentials.masterCredentials;
	    }
	  },

	  /**
	   * @api private
	   */
	  createClients: function() {
	    this.service = this.service || new STS({params: this.params});
	  }

	});


/***/ },
/* 93 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(3);
	var AWS = __webpack_require__(5);
	var Service = __webpack_require__(86);
	var apiLoader = __webpack_require__(94);

	apiLoader.services['sts'] = {};
	AWS.STS = Service.defineService('sts', ['2011-06-15']);
	__webpack_require__(95);
	Object.defineProperty(apiLoader.services['sts'], '2011-06-15', {
	  get: function get() {
	    var model = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/sts-2011-06-15.min.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	    return model;
	  },
	  enumerable: true,
	  configurable: true
	});

	module.exports = AWS.STS;


/***/ },
/* 94 */
/***/ function(module, exports, __webpack_require__) {

	var AWS = __webpack_require__(5);

	AWS.apiLoader = function(svc, version) {
	  if (!AWS.apiLoader.services.hasOwnProperty(svc)) {
	    throw new Error('InvalidService: Failed to load api for ' + svc);
	  }
	  return AWS.apiLoader.services[svc][version];
	};

	AWS.apiLoader.services = {};

	module.exports = AWS.apiLoader;

/***/ },
/* 95 */
/***/ function(module, exports, __webpack_require__) {

	var AWS = __webpack_require__(5);

	AWS.util.update(AWS.STS.prototype, {
	  /**
	   * @overload credentialsFrom(data, credentials = null)
	   *   Creates a credentials object from STS response data containing
	   *   credentials information. Useful for quickly setting AWS credentials.
	   *
	   *   @note This is a low-level utility function. If you want to load temporary
	   *     credentials into your process for subsequent requests to AWS resources,
	   *     you should use {AWS.TemporaryCredentials} instead.
	   *   @param data [map] data retrieved from a call to {getFederatedToken},
	   *     {getSessionToken}, {assumeRole}, or {assumeRoleWithWebIdentity}.
	   *   @param credentials [AWS.Credentials] an optional credentials object to
	   *     fill instead of creating a new object. Useful when modifying an
	   *     existing credentials object from a refresh call.
	   *   @return [AWS.TemporaryCredentials] the set of temporary credentials
	   *     loaded from a raw STS operation response.
	   *   @example Using credentialsFrom to load global AWS credentials
	   *     var sts = new AWS.STS();
	   *     sts.getSessionToken(function (err, data) {
	   *       if (err) console.log("Error getting credentials");
	   *       else {
	   *         AWS.config.credentials = sts.credentialsFrom(data);
	   *       }
	   *     });
	   *   @see AWS.TemporaryCredentials
	   */
	  credentialsFrom: function credentialsFrom(data, credentials) {
	    if (!data) return null;
	    if (!credentials) credentials = new AWS.TemporaryCredentials();
	    credentials.expired = false;
	    credentials.accessKeyId = data.Credentials.AccessKeyId;
	    credentials.secretAccessKey = data.Credentials.SecretAccessKey;
	    credentials.sessionToken = data.Credentials.SessionToken;
	    credentials.expireTime = data.Credentials.Expiration;
	    return credentials;
	  },

	  assumeRoleWithWebIdentity: function assumeRoleWithWebIdentity(params, callback) {
	    return this.makeUnauthenticatedRequest('assumeRoleWithWebIdentity', params, callback);
	  },

	  assumeRoleWithSAML: function assumeRoleWithSAML(params, callback) {
	    return this.makeUnauthenticatedRequest('assumeRoleWithSAML', params, callback);
	  }
	});


/***/ },
/* 96 */,
/* 97 */
/***/ function(module, exports, __webpack_require__) {

	var AWS = __webpack_require__(5);
	var STS = __webpack_require__(93);

	/**
	 * Represents credentials retrieved from STS Web Identity Federation support.
	 *
	 * By default this provider gets credentials using the
	 * {AWS.STS.assumeRoleWithWebIdentity} service operation. This operation
	 * requires a `RoleArn` containing the ARN of the IAM trust policy for the
	 * application for which credentials will be given. In addition, the
	 * `WebIdentityToken` must be set to the token provided by the identity
	 * provider. See {constructor} for an example on creating a credentials
	 * object with proper `RoleArn` and `WebIdentityToken` values.
	 *
	 * ## Refreshing Credentials from Identity Service
	 *
	 * In addition to AWS credentials expiring after a given amount of time, the
	 * login token from the identity provider will also expire. Once this token
	 * expires, it will not be usable to refresh AWS credentials, and another
	 * token will be needed. The SDK does not manage refreshing of the token value,
	 * but this can be done through a "refresh token" supported by most identity
	 * providers. Consult the documentation for the identity provider for refreshing
	 * tokens. Once the refreshed token is acquired, you should make sure to update
	 * this new token in the credentials object's {params} property. The following
	 * code will update the WebIdentityToken, assuming you have retrieved an updated
	 * token from the identity provider:
	 *
	 * ```javascript
	 * AWS.config.credentials.params.WebIdentityToken = updatedToken;
	 * ```
	 *
	 * Future calls to `credentials.refresh()` will now use the new token.
	 *
	 * @!attribute params
	 *   @return [map] the map of params passed to
	 *     {AWS.STS.assumeRoleWithWebIdentity}. To update the token, set the
	 *     `params.WebIdentityToken` property.
	 * @!attribute data
	 *   @return [map] the raw data response from the call to
	 *     {AWS.STS.assumeRoleWithWebIdentity}. Use this if you want to get
	 *     access to other properties from the response.
	 */
	AWS.WebIdentityCredentials = AWS.util.inherit(AWS.Credentials, {
	  /**
	   * Creates a new credentials object.
	   * @param (see AWS.STS.assumeRoleWithWebIdentity)
	   * @example Creating a new credentials object
	   *   AWS.config.credentials = new AWS.WebIdentityCredentials({
	   *     RoleArn: 'arn:aws:iam::1234567890:role/WebIdentity',
	   *     WebIdentityToken: 'ABCDEFGHIJKLMNOP', // token from identity service
	   *     RoleSessionName: 'web' // optional name, defaults to web-identity
	   *   });
	   * @see AWS.STS.assumeRoleWithWebIdentity
	   */
	  constructor: function WebIdentityCredentials(params) {
	    AWS.Credentials.call(this);
	    this.expired = true;
	    this.params = params;
	    this.params.RoleSessionName = this.params.RoleSessionName || 'web-identity';
	    this.data = null;
	  },

	  /**
	   * Refreshes credentials using {AWS.STS.assumeRoleWithWebIdentity}
	   *
	   * @callback callback function(err)
	   *   Called when the STS service responds (or fails). When
	   *   this callback is called with no error, it means that the credentials
	   *   information has been loaded into the object (as the `accessKeyId`,
	   *   `secretAccessKey`, and `sessionToken` properties).
	   *   @param err [Error] if an error occurred, this value will be filled
	   * @see get
	   */
	  refresh: function refresh(callback) {
	    var self = this;
	    self.createClients();
	    if (!callback) callback = function(err) { if (err) throw err; };

	    self.service.assumeRoleWithWebIdentity(function (err, data) {
	      self.data = null;
	      if (!err) {
	        self.data = data;
	        self.service.credentialsFrom(data, self);
	      }
	      callback(err);
	    });
	  },

	  /**
	   * @api private
	   */
	  createClients: function() {
	    this.service = this.service || new STS({params: this.params});
	  }

	});


/***/ },
/* 98 */
/***/ function(module, exports, __webpack_require__) {

	var AWS = __webpack_require__(5);
	var CognitoIdentity = __webpack_require__(99);
	var STS = __webpack_require__(93);

	/**
	 * Represents credentials retrieved from STS Web Identity Federation using
	 * the Amazon Cognito Identity service.
	 *
	 * By default this provider gets credentials using the
	 * {AWS.CognitoIdentity.getCredentialsForIdentity} service operation, which
	 * requires either an `IdentityId` or an `IdentityPoolId` (Amazon Cognito
	 * Identity Pool ID), which is used to call {AWS.CognitoIdentity.getId} to
	 * obtain an `IdentityId`. If the identity or identity pool is not configured in
	 * the Amazon Cognito Console to use IAM roles with the appropriate permissions,
	 * then additionally a `RoleArn` is required containing the ARN of the IAM trust
	 * policy for the Amazon Cognito role that the user will log into. If a `RoleArn`
	 * is provided, then this provider gets credentials using the
	 * {AWS.STS.assumeRoleWithWebIdentity} service operation, after first getting an
	 * Open ID token from {AWS.CognitoIdentity.getOpenIdToken}.
	 *
	 * In addition, if this credential provider is used to provide authenticated
	 * login, the `Logins` map may be set to the tokens provided by the respective
	 * identity providers. See {constructor} for an example on creating a credentials
	 * object with proper property values.
	 *
	 * ## Refreshing Credentials from Identity Service
	 *
	 * In addition to AWS credentials expiring after a given amount of time, the
	 * login token from the identity provider will also expire. Once this token
	 * expires, it will not be usable to refresh AWS credentials, and another
	 * token will be needed. The SDK does not manage refreshing of the token value,
	 * but this can be done through a "refresh token" supported by most identity
	 * providers. Consult the documentation for the identity provider for refreshing
	 * tokens. Once the refreshed token is acquired, you should make sure to update
	 * this new token in the credentials object's {params} property. The following
	 * code will update the WebIdentityToken, assuming you have retrieved an updated
	 * token from the identity provider:
	 *
	 * ```javascript
	 * AWS.config.credentials.params.Logins['graph.facebook.com'] = updatedToken;
	 * ```
	 *
	 * Future calls to `credentials.refresh()` will now use the new token.
	 *
	 * @!attribute params
	 *   @return [map] the map of params passed to
	 *     {AWS.CognitoIdentity.getId},
	 *     {AWS.CognitoIdentity.getOpenIdToken}, and
	 *     {AWS.STS.assumeRoleWithWebIdentity}. To update the token, set the
	 *     `params.WebIdentityToken` property.
	 * @!attribute data
	 *   @return [map] the raw data response from the call to
	 *     {AWS.CognitoIdentity.getCredentialsForIdentity}, or
	 *     {AWS.STS.assumeRoleWithWebIdentity}. Use this if you want to get
	 *     access to other properties from the response.
	 * @!attribute identityId
	 *   @return [String] the Cognito ID returned by the last call to
	 *     {AWS.CognitoIdentity.getOpenIdToken}. This ID represents the actual
	 *     final resolved identity ID from Amazon Cognito.
	 */
	AWS.CognitoIdentityCredentials = AWS.util.inherit(AWS.Credentials, {
	  /**
	   * @api private
	   */
	  localStorageKey: {
	    id: 'aws.cognito.identity-id.',
	    providers: 'aws.cognito.identity-providers.'
	  },

	  /**
	   * Creates a new credentials object.
	   * @example Creating a new credentials object
	   *   AWS.config.credentials = new AWS.CognitoIdentityCredentials({
	   *
	   *     // either IdentityPoolId or IdentityId is required
	   *     // See the IdentityPoolId param for AWS.CognitoIdentity.getID (linked below)
	   *     // See the IdentityId param for AWS.CognitoIdentity.getCredentialsForIdentity
	   *     // or AWS.CognitoIdentity.getOpenIdToken (linked below)
	   *     IdentityPoolId: 'us-east-1:1699ebc0-7900-4099-b910-2df94f52a030',
	   *     IdentityId: 'us-east-1:128d0a74-c82f-4553-916d-90053e4a8b0f'
	   *
	   *     // optional, only necessary when the identity pool is not configured
	   *     // to use IAM roles in the Amazon Cognito Console
	   *     // See the RoleArn param for AWS.STS.assumeRoleWithWebIdentity (linked below)
	   *     RoleArn: 'arn:aws:iam::1234567890:role/MYAPP-CognitoIdentity',
	   *
	   *     // optional tokens, used for authenticated login
	   *     // See the Logins param for AWS.CognitoIdentity.getID (linked below)
	   *     Logins: {
	   *       'graph.facebook.com': 'FBTOKEN',
	   *       'www.amazon.com': 'AMAZONTOKEN',
	   *       'accounts.google.com': 'GOOGLETOKEN',
	   *       'api.twitter.com': 'TWITTERTOKEN',
	   *       'www.digits.com': 'DIGITSTOKEN'
	   *     },
	   *
	   *     // optional name, defaults to web-identity
	   *     // See the RoleSessionName param for AWS.STS.assumeRoleWithWebIdentity (linked below)
	   *     RoleSessionName: 'web',
	   *
	   *     // optional, only necessary when application runs in a browser
	   *     // and multiple users are signed in at once, used for caching
	   *     LoginId: 'example@gmail.com'
	   *
	   *   });
	   * @see AWS.CognitoIdentity.getId
	   * @see AWS.CognitoIdentity.getCredentialsForIdentity
	   * @see AWS.STS.assumeRoleWithWebIdentity
	   * @see AWS.CognitoIdentity.getOpenIdToken
	   */
	  constructor: function CognitoIdentityCredentials(params) {
	    AWS.Credentials.call(this);
	    this.expired = true;
	    this.params = params;
	    this.data = null;
	    this._identityId = null;
	    this.loadCachedId();
	    var self = this;
	    Object.defineProperty(this, 'identityId', {
	      get: function() {
	        self.loadCachedId();
	        return self._identityId || self.params.IdentityId;
	      },
	      set: function(identityId) {
	        self._identityId = identityId;
	      }
	    });
	  },

	  /**
	   * Refreshes credentials using {AWS.CognitoIdentity.getCredentialsForIdentity},
	   * or {AWS.STS.assumeRoleWithWebIdentity}.
	   *
	   * @callback callback function(err)
	   *   Called when the STS service responds (or fails). When
	   *   this callback is called with no error, it means that the credentials
	   *   information has been loaded into the object (as the `accessKeyId`,
	   *   `secretAccessKey`, and `sessionToken` properties).
	   *   @param err [Error] if an error occurred, this value will be filled
	   * @see get
	   */
	  refresh: function refresh(callback) {
	    var self = this;
	    self.createClients();
	    self.data = null;
	    self._identityId = null;
	    self.getId(function(err) {
	      if (!err) {
	        if (!self.params.RoleArn) {
	          self.getCredentialsForIdentity(callback);
	        } else {
	          self.getCredentialsFromSTS(callback);
	        }
	      } else {
	        self.clearIdOnNotAuthorized(err);
	        callback(err);
	      }
	    });
	  },

	  /**
	   * Clears the cached Cognito ID associated with the currently configured
	   * identity pool ID. Use this to manually invalidate your cache if
	   * the identity pool ID was deleted.
	   */
	  clearCachedId: function clearCache() {
	    this._identityId = null;
	    delete this.params.IdentityId;

	    var poolId = this.params.IdentityPoolId;
	    var loginId = this.params.LoginId || '';
	    delete this.storage[this.localStorageKey.id + poolId + loginId];
	    delete this.storage[this.localStorageKey.providers + poolId + loginId];
	  },

	  /**
	   * @api private
	   */
	  clearIdOnNotAuthorized: function clearIdOnNotAuthorized(err) {
	    var self = this;
	    if (err.code == 'NotAuthorizedException') {
	      self.clearCachedId();
	    }
	  },

	  /**
	   * Retrieves a Cognito ID, loading from cache if it was already retrieved
	   * on this device.
	   *
	   * @callback callback function(err, identityId)
	   *   @param err [Error, null] an error object if the call failed or null if
	   *     it succeeded.
	   *   @param identityId [String, null] if successful, the callback will return
	   *     the Cognito ID.
	   * @note If not loaded explicitly, the Cognito ID is loaded and stored in
	   *   localStorage in the browser environment of a device.
	   * @api private
	   */
	  getId: function getId(callback) {
	    var self = this;
	    if (typeof self.params.IdentityId === 'string') {
	      return callback(null, self.params.IdentityId);
	    }

	    self.cognito.getId(function(err, data) {
	      if (!err && data.IdentityId) {
	        self.params.IdentityId = data.IdentityId;
	        callback(null, data.IdentityId);
	      } else {
	        callback(err);
	      }
	    });
	  },


	  /**
	   * @api private
	   */
	  loadCredentials: function loadCredentials(data, credentials) {
	    if (!data || !credentials) return;
	    credentials.expired = false;
	    credentials.accessKeyId = data.Credentials.AccessKeyId;
	    credentials.secretAccessKey = data.Credentials.SecretKey;
	    credentials.sessionToken = data.Credentials.SessionToken;
	    credentials.expireTime = data.Credentials.Expiration;
	  },

	  /**
	   * @api private
	   */
	  getCredentialsForIdentity: function getCredentialsForIdentity(callback) {
	    var self = this;
	    self.cognito.getCredentialsForIdentity(function(err, data) {
	      if (!err) {
	        self.cacheId(data);
	        self.data = data;
	        self.loadCredentials(self.data, self);
	      } else {
	        self.clearIdOnNotAuthorized(err);
	      }
	      callback(err);
	    });
	  },

	  /**
	   * @api private
	   */
	  getCredentialsFromSTS: function getCredentialsFromSTS(callback) {
	    var self = this;
	    self.cognito.getOpenIdToken(function(err, data) {
	      if (!err) {
	        self.cacheId(data);
	        self.params.WebIdentityToken = data.Token;
	        self.webIdentityCredentials.refresh(function(webErr) {
	          if (!webErr) {
	            self.data = self.webIdentityCredentials.data;
	            self.sts.credentialsFrom(self.data, self);
	          }
	          callback(webErr);
	        });
	      } else {
	        self.clearIdOnNotAuthorized(err);
	        callback(err);
	      }
	    });
	  },

	  /**
	   * @api private
	   */
	  loadCachedId: function loadCachedId() {
	    var self = this;

	    // in the browser we source default IdentityId from localStorage
	    if (AWS.util.isBrowser() && !self.params.IdentityId) {
	      var id = self.getStorage('id');
	      if (id && self.params.Logins) {
	        var actualProviders = Object.keys(self.params.Logins);
	        var cachedProviders =
	          (self.getStorage('providers') || '').split(',');

	        // only load ID if at least one provider used this ID before
	        var intersect = cachedProviders.filter(function(n) {
	          return actualProviders.indexOf(n) !== -1;
	        });
	        if (intersect.length !== 0) {
	          self.params.IdentityId = id;
	        }
	      } else if (id) {
	        self.params.IdentityId = id;
	      }
	    }
	  },

	  /**
	   * @api private
	   */
	  createClients: function() {
	    this.webIdentityCredentials = this.webIdentityCredentials ||
	      new AWS.WebIdentityCredentials(this.params);
	    this.cognito = this.cognito ||
	      new CognitoIdentity({params: this.params});
	    this.sts = this.sts || new STS();
	  },

	  /**
	   * @api private
	   */
	  cacheId: function cacheId(data) {
	    this._identityId = data.IdentityId;
	    this.params.IdentityId = this._identityId;

	    // cache this IdentityId in browser localStorage if possible
	    if (AWS.util.isBrowser()) {
	      this.setStorage('id', data.IdentityId);

	      if (this.params.Logins) {
	        this.setStorage('providers', Object.keys(this.params.Logins).join(','));
	      }
	    }
	  },

	  /**
	   * @api private
	   */
	  getStorage: function getStorage(key) {
	    return this.storage[this.localStorageKey[key] + this.params.IdentityPoolId + (this.params.LoginId || '')];
	  },

	  /**
	   * @api private
	   */
	  setStorage: function setStorage(key, val) {
	    try {
	      this.storage[this.localStorageKey[key] + this.params.IdentityPoolId + (this.params.LoginId || '')] = val;
	    } catch (_) {}
	  },

	  /**
	   * @api private
	   */
	  storage: (function() {
	    try {
	      var storage = AWS.util.isBrowser() && window.localStorage !== null && typeof window.localStorage === 'object' ?
	          window.localStorage : {};

	      // Test set/remove which would throw an error in Safari's private browsing
	      storage['aws.test-storage'] = 'foobar';
	      delete storage['aws.test-storage'];

	      return storage;
	    } catch (_) {
	      return {};
	    }
	  })()
	});


/***/ },
/* 99 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(3);
	var AWS = __webpack_require__(5);
	var Service = __webpack_require__(86);
	var apiLoader = __webpack_require__(94);

	apiLoader.services['cognitoidentity'] = {};
	AWS.CognitoIdentity = Service.defineService('cognitoidentity', ['2014-06-30']);
	__webpack_require__(100);
	Object.defineProperty(apiLoader.services['cognitoidentity'], '2014-06-30', {
	  get: function get() {
	    var model = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/cognito-identity-2014-06-30.min.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	    return model;
	  },
	  enumerable: true,
	  configurable: true
	});

	module.exports = AWS.CognitoIdentity;


/***/ },
/* 100 */
/***/ function(module, exports, __webpack_require__) {

	var AWS = __webpack_require__(5);

	AWS.util.update(AWS.CognitoIdentity.prototype, {
	  getOpenIdToken: function getOpenIdToken(params, callback) {
	    return this.makeUnauthenticatedRequest('getOpenIdToken', params, callback);
	  },

	  getId: function getId(params, callback) {
	    return this.makeUnauthenticatedRequest('getId', params, callback);
	  },

	  getCredentialsForIdentity: function getCredentialsForIdentity(params, callback) {
	    return this.makeUnauthenticatedRequest('getCredentialsForIdentity', params, callback);
	  }
	});


/***/ },
/* 101 */,
/* 102 */
/***/ function(module, exports, __webpack_require__) {

	var AWS = __webpack_require__(5);
	var STS = __webpack_require__(93);

	/**
	 * Represents credentials retrieved from STS SAML support.
	 *
	 * By default this provider gets credentials using the
	 * {AWS.STS.assumeRoleWithSAML} service operation. This operation
	 * requires a `RoleArn` containing the ARN of the IAM trust policy for the
	 * application for which credentials will be given, as well as a `PrincipalArn`
	 * representing the ARN for the SAML identity provider. In addition, the
	 * `SAMLAssertion` must be set to the token provided by the identity
	 * provider. See {constructor} for an example on creating a credentials
	 * object with proper `RoleArn`, `PrincipalArn`, and `SAMLAssertion` values.
	 *
	 * ## Refreshing Credentials from Identity Service
	 *
	 * In addition to AWS credentials expiring after a given amount of time, the
	 * login token from the identity provider will also expire. Once this token
	 * expires, it will not be usable to refresh AWS credentials, and another
	 * token will be needed. The SDK does not manage refreshing of the token value,
	 * but this can be done through a "refresh token" supported by most identity
	 * providers. Consult the documentation for the identity provider for refreshing
	 * tokens. Once the refreshed token is acquired, you should make sure to update
	 * this new token in the credentials object's {params} property. The following
	 * code will update the SAMLAssertion, assuming you have retrieved an updated
	 * token from the identity provider:
	 *
	 * ```javascript
	 * AWS.config.credentials.params.SAMLAssertion = updatedToken;
	 * ```
	 *
	 * Future calls to `credentials.refresh()` will now use the new token.
	 *
	 * @!attribute params
	 *   @return [map] the map of params passed to
	 *     {AWS.STS.assumeRoleWithSAML}. To update the token, set the
	 *     `params.SAMLAssertion` property.
	 */
	AWS.SAMLCredentials = AWS.util.inherit(AWS.Credentials, {
	  /**
	   * Creates a new credentials object.
	   * @param (see AWS.STS.assumeRoleWithSAML)
	   * @example Creating a new credentials object
	   *   AWS.config.credentials = new AWS.SAMLCredentials({
	   *     RoleArn: 'arn:aws:iam::1234567890:role/SAMLRole',
	   *     PrincipalArn: 'arn:aws:iam::1234567890:role/SAMLPrincipal',
	   *     SAMLAssertion: 'base64-token', // base64-encoded token from IdP
	   *   });
	   * @see AWS.STS.assumeRoleWithSAML
	   */
	  constructor: function SAMLCredentials(params) {
	    AWS.Credentials.call(this);
	    this.expired = true;
	    this.params = params;
	  },

	  /**
	   * Refreshes credentials using {AWS.STS.assumeRoleWithSAML}
	   *
	   * @callback callback function(err)
	   *   Called when the STS service responds (or fails). When
	   *   this callback is called with no error, it means that the credentials
	   *   information has been loaded into the object (as the `accessKeyId`,
	   *   `secretAccessKey`, and `sessionToken` properties).
	   *   @param err [Error] if an error occurred, this value will be filled
	   * @see get
	   */
	  refresh: function refresh(callback) {
	    var self = this;
	    self.createClients();
	    if (!callback) callback = function(err) { if (err) throw err; };

	    self.service.assumeRoleWithSAML(function (err, data) {
	      if (!err) {
	        self.service.credentialsFrom(data, self);
	      }
	      callback(err);
	    });
	  },

	  /**
	   * @api private
	   */
	  createClients: function() {
	    this.service = this.service || new STS({params: this.params});
	  }

	});


/***/ },
/* 103 */
/***/ function(module, exports, __webpack_require__) {

	var AWS = __webpack_require__(5);
	var inherit = AWS.util.inherit;

	/**
	 * The endpoint that a service will talk to, for example,
	 * `'https://ec2.ap-southeast-1.amazonaws.com'`. If
	 * you need to override an endpoint for a service, you can
	 * set the endpoint on a service by passing the endpoint
	 * object with the `endpoint` option key:
	 *
	 * ```javascript
	 * var ep = new AWS.Endpoint('awsproxy.example.com');
	 * var s3 = new AWS.S3({endpoint: ep});
	 * s3.service.endpoint.hostname == 'awsproxy.example.com'
	 * ```
	 *
	 * Note that if you do not specify a protocol, the protocol will
	 * be selected based on your current {AWS.config} configuration.
	 *
	 * @!attribute protocol
	 *   @return [String] the protocol (http or https) of the endpoint
	 *     URL
	 * @!attribute hostname
	 *   @return [String] the host portion of the endpoint, e.g.,
	 *     example.com
	 * @!attribute host
	 *   @return [String] the host portion of the endpoint including
	 *     the port, e.g., example.com:80
	 * @!attribute port
	 *   @return [Integer] the port of the endpoint
	 * @!attribute href
	 *   @return [String] the full URL of the endpoint
	 */
	AWS.Endpoint = inherit({

	  /**
	   * @overload Endpoint(endpoint)
	   *   Constructs a new endpoint given an endpoint URL. If the
	   *   URL omits a protocol (http or https), the default protocol
	   *   set in the global {AWS.config} will be used.
	   *   @param endpoint [String] the URL to construct an endpoint from
	   */
	  constructor: function Endpoint(endpoint, config) {
	    AWS.util.hideProperties(this, ['slashes', 'auth', 'hash', 'search', 'query']);

	    if (typeof endpoint === 'undefined' || endpoint === null) {
	      throw new Error('Invalid endpoint: ' + endpoint);
	    } else if (typeof endpoint !== 'string') {
	      return AWS.util.copy(endpoint);
	    }

	    if (!endpoint.match(/^http/)) {
	      var useSSL = config && config.sslEnabled !== undefined ?
	        config.sslEnabled : AWS.config.sslEnabled;
	      endpoint = (useSSL ? 'https' : 'http') + '://' + endpoint;
	    }

	    AWS.util.update(this, AWS.util.urlParse(endpoint));

	    // Ensure the port property is set as an integer
	    if (this.port) {
	      this.port = parseInt(this.port, 10);
	    } else {
	      this.port = this.protocol === 'https:' ? 443 : 80;
	    }
	  }

	});

	/**
	 * The low level HTTP request object, encapsulating all HTTP header
	 * and body data sent by a service request.
	 *
	 * @!attribute method
	 *   @return [String] the HTTP method of the request
	 * @!attribute path
	 *   @return [String] the path portion of the URI, e.g.,
	 *     "/list/?start=5&num=10"
	 * @!attribute headers
	 *   @return [map<String,String>]
	 *     a map of header keys and their respective values
	 * @!attribute body
	 *   @return [String] the request body payload
	 * @!attribute endpoint
	 *   @return [AWS.Endpoint] the endpoint for the request
	 * @!attribute region
	 *   @api private
	 *   @return [String] the region, for signing purposes only.
	 */
	AWS.HttpRequest = inherit({

	  /**
	   * @api private
	   */
	  constructor: function HttpRequest(endpoint, region, customUserAgent) {
	    endpoint = new AWS.Endpoint(endpoint);
	    this.method = 'POST';
	    this.path = endpoint.path || '/';
	    this.headers = {};
	    this.body = '';
	    this.endpoint = endpoint;
	    this.region = region;
	    this.setUserAgent(customUserAgent);
	  },

	  /**
	   * @api private
	   */
	  setUserAgent: function setUserAgent(customUserAgent) {
	    var prefix = AWS.util.isBrowser() ? 'X-Amz-' : '';
	    var customSuffix = '';
	    if (typeof customUserAgent === 'string' && customUserAgent) {
	      customSuffix += ' ' + customUserAgent;
	    }
	    this.headers[prefix + 'User-Agent'] = AWS.util.userAgent() + customSuffix;
	  },

	  /**
	   * @return [String] the part of the {path} excluding the
	   *   query string
	   */
	  pathname: function pathname() {
	    return this.path.split('?', 1)[0];
	  },

	  /**
	   * @return [String] the query string portion of the {path}
	   */
	  search: function search() {
	    var query = this.path.split('?', 2)[1];
	    if (query) {
	      query = AWS.util.queryStringParse(query);
	      return AWS.util.queryParamsToString(query);
	    }
	    return '';
	  }

	});

	/**
	 * The low level HTTP response object, encapsulating all HTTP header
	 * and body data returned from the request.
	 *
	 * @!attribute statusCode
	 *   @return [Integer] the HTTP status code of the response (e.g., 200, 404)
	 * @!attribute headers
	 *   @return [map<String,String>]
	 *      a map of response header keys and their respective values
	 * @!attribute body
	 *   @return [String] the response body payload
	 * @!attribute [r] streaming
	 *   @return [Boolean] whether this response is being streamed at a low-level.
	 *     Defaults to `false` (buffered reads). Do not modify this manually, use
	 *     {createUnbufferedStream} to convert the stream to unbuffered mode
	 *     instead.
	 */
	AWS.HttpResponse = inherit({

	  /**
	   * @api private
	   */
	  constructor: function HttpResponse() {
	    this.statusCode = undefined;
	    this.headers = {};
	    this.body = undefined;
	    this.streaming = false;
	    this.stream = null;
	  },

	  /**
	   * Disables buffering on the HTTP response and returns the stream for reading.
	   * @return [Stream, XMLHttpRequest, null] the underlying stream object.
	   *   Use this object to directly read data off of the stream.
	   * @note This object is only available after the {AWS.Request~httpHeaders}
	   *   event has fired. This method must be called prior to
	   *   {AWS.Request~httpData}.
	   * @example Taking control of a stream
	   *   request.on('httpHeaders', function(statusCode, headers) {
	   *     if (statusCode < 300) {
	   *       if (headers.etag === 'xyz') {
	   *         // pipe the stream, disabling buffering
	   *         var stream = this.response.httpResponse.createUnbufferedStream();
	   *         stream.pipe(process.stdout);
	   *       } else { // abort this request and set a better error message
	   *         this.abort();
	   *         this.response.error = new Error('Invalid ETag');
	   *       }
	   *     }
	   *   }).send(console.log);
	   */
	  createUnbufferedStream: function createUnbufferedStream() {
	    this.streaming = true;
	    return this.stream;
	  }
	});


	AWS.HttpClient = inherit({});

	/**
	 * @api private
	 */
	AWS.HttpClient.getInstance = function getInstance() {
	  if (this.singleton === undefined) {
	    this.singleton = new this();
	  }
	  return this.singleton;
	};


/***/ },
/* 104 */
/***/ function(module, exports, __webpack_require__) {

	var AWS = __webpack_require__(5);

	/**
	 * @api private
	 * @!method on(eventName, callback)
	 *   Registers an event listener callback for the event given by `eventName`.
	 *   Parameters passed to the callback function depend on the individual event
	 *   being triggered. See the event documentation for those parameters.
	 *
	 *   @param eventName [String] the event name to register the listener for
	 *   @param callback [Function] the listener callback function
	 *   @return [AWS.SequentialExecutor] the same object for chaining
	 */
	AWS.SequentialExecutor = AWS.util.inherit({

	  constructor: function SequentialExecutor() {
	    this._events = {};
	  },

	  /**
	   * @api private
	   */
	  listeners: function listeners(eventName) {
	    return this._events[eventName] ? this._events[eventName].slice(0) : [];
	  },

	  on: function on(eventName, listener) {
	    if (this._events[eventName]) {
	      this._events[eventName].push(listener);
	    } else {
	      this._events[eventName] = [listener];
	    }
	    return this;
	  },

	  /**
	   * @api private
	   */
	  onAsync: function onAsync(eventName, listener) {
	    listener._isAsync = true;
	    return this.on(eventName, listener);
	  },

	  removeListener: function removeListener(eventName, listener) {
	    var listeners = this._events[eventName];
	    if (listeners) {
	      var length = listeners.length;
	      var position = -1;
	      for (var i = 0; i < length; ++i) {
	        if (listeners[i] === listener) {
	          position = i;
	        }
	      }
	      if (position > -1) {
	        listeners.splice(position, 1);
	      }
	    }
	    return this;
	  },

	  removeAllListeners: function removeAllListeners(eventName) {
	    if (eventName) {
	      delete this._events[eventName];
	    } else {
	      this._events = {};
	    }
	    return this;
	  },

	  /**
	   * @api private
	   */
	  emit: function emit(eventName, eventArgs, doneCallback) {
	    if (!doneCallback) doneCallback = function() { };
	    var listeners = this.listeners(eventName);
	    var count = listeners.length;
	    this.callListeners(listeners, eventArgs, doneCallback);
	    return count > 0;
	  },

	  /**
	   * @api private
	   */
	  callListeners: function callListeners(listeners, args, doneCallback, prevError) {
	    var self = this;
	    var error = prevError || null;

	    function callNextListener(err) {
	      if (err) {
	        error = AWS.util.error(error || new Error(), err);
	        if (self._haltHandlersOnError) {
	          return doneCallback.call(self, error);
	        }
	      }
	      self.callListeners(listeners, args, doneCallback, error);
	    }

	    while (listeners.length > 0) {
	      var listener = listeners.shift();
	      if (listener._isAsync) { // asynchronous listener
	        listener.apply(self, args.concat([callNextListener]));
	        return; // stop here, callNextListener will continue
	      } else { // synchronous listener
	        try {
	          listener.apply(self, args);
	        } catch (err) {
	          error = AWS.util.error(error || new Error(), err);
	        }
	        if (error && self._haltHandlersOnError) {
	          doneCallback.call(self, error);
	          return;
	        }
	      }
	    }
	    doneCallback.call(self, error);
	  },

	  /**
	   * Adds or copies a set of listeners from another list of
	   * listeners or SequentialExecutor object.
	   *
	   * @param listeners [map<String,Array<Function>>, AWS.SequentialExecutor]
	   *   a list of events and callbacks, or an event emitter object
	   *   containing listeners to add to this emitter object.
	   * @return [AWS.SequentialExecutor] the emitter object, for chaining.
	   * @example Adding listeners from a map of listeners
	   *   emitter.addListeners({
	   *     event1: [function() { ... }, function() { ... }],
	   *     event2: [function() { ... }]
	   *   });
	   *   emitter.emit('event1'); // emitter has event1
	   *   emitter.emit('event2'); // emitter has event2
	   * @example Adding listeners from another emitter object
	   *   var emitter1 = new AWS.SequentialExecutor();
	   *   emitter1.on('event1', function() { ... });
	   *   emitter1.on('event2', function() { ... });
	   *   var emitter2 = new AWS.SequentialExecutor();
	   *   emitter2.addListeners(emitter1);
	   *   emitter2.emit('event1'); // emitter2 has event1
	   *   emitter2.emit('event2'); // emitter2 has event2
	   */
	  addListeners: function addListeners(listeners) {
	    var self = this;

	    // extract listeners if parameter is an SequentialExecutor object
	    if (listeners._events) listeners = listeners._events;

	    AWS.util.each(listeners, function(event, callbacks) {
	      if (typeof callbacks === 'function') callbacks = [callbacks];
	      AWS.util.arrayEach(callbacks, function(callback) {
	        self.on(event, callback);
	      });
	    });

	    return self;
	  },

	  /**
	   * Registers an event with {on} and saves the callback handle function
	   * as a property on the emitter object using a given `name`.
	   *
	   * @param name [String] the property name to set on this object containing
	   *   the callback function handle so that the listener can be removed in
	   *   the future.
	   * @param (see on)
	   * @return (see on)
	   * @example Adding a named listener DATA_CALLBACK
	   *   var listener = function() { doSomething(); };
	   *   emitter.addNamedListener('DATA_CALLBACK', 'data', listener);
	   *
	   *   // the following prints: true
	   *   console.log(emitter.DATA_CALLBACK == listener);
	   */
	  addNamedListener: function addNamedListener(name, eventName, callback) {
	    this[name] = callback;
	    this.addListener(eventName, callback);
	    return this;
	  },

	  /**
	   * @api private
	   */
	  addNamedAsyncListener: function addNamedAsyncListener(name, eventName, callback) {
	    callback._isAsync = true;
	    return this.addNamedListener(name, eventName, callback);
	  },

	  /**
	   * Helper method to add a set of named listeners using
	   * {addNamedListener}. The callback contains a parameter
	   * with a handle to the `addNamedListener` method.
	   *
	   * @callback callback function(add)
	   *   The callback function is called immediately in order to provide
	   *   the `add` function to the block. This simplifies the addition of
	   *   a large group of named listeners.
	   *   @param add [Function] the {addNamedListener} function to call
	   *     when registering listeners.
	   * @example Adding a set of named listeners
	   *   emitter.addNamedListeners(function(add) {
	   *     add('DATA_CALLBACK', 'data', function() { ... });
	   *     add('OTHER', 'otherEvent', function() { ... });
	   *     add('LAST', 'lastEvent', function() { ... });
	   *   });
	   *
	   *   // these properties are now set:
	   *   emitter.DATA_CALLBACK;
	   *   emitter.OTHER;
	   *   emitter.LAST;
	   */
	  addNamedListeners: function addNamedListeners(callback) {
	    var self = this;
	    callback(
	      function() {
	        self.addNamedListener.apply(self, arguments);
	      },
	      function() {
	        self.addNamedAsyncListener.apply(self, arguments);
	      }
	    );
	    return this;
	  }
	});

	/**
	 * {on} is the prefered method.
	 * @api private
	 */
	AWS.SequentialExecutor.prototype.addListener = AWS.SequentialExecutor.prototype.on;

	module.exports = AWS.SequentialExecutor;


/***/ },
/* 105 */
/***/ function(module, exports, __webpack_require__) {

	var AWS = __webpack_require__(5);
	var SequentialExecutor = __webpack_require__(104);
	var uuid = __webpack_require__(106);
	/**
	 * The namespace used to register global event listeners for request building
	 * and sending.
	 */
	AWS.EventListeners = {
	  /**
	   * @!attribute VALIDATE_CREDENTIALS
	   *   A request listener that validates whether the request is being
	   *   sent with credentials.
	   *   Handles the {AWS.Request~validate 'validate' Request event}
	   *   @example Sending a request without validating credentials
	   *     var listener = AWS.EventListeners.Core.VALIDATE_CREDENTIALS;
	   *     request.removeListener('validate', listener);
	   *   @readonly
	   *   @return [Function]
	   * @!attribute VALIDATE_REGION
	   *   A request listener that validates whether the region is set
	   *   for a request.
	   *   Handles the {AWS.Request~validate 'validate' Request event}
	   *   @example Sending a request without validating region configuration
	   *     var listener = AWS.EventListeners.Core.VALIDATE_REGION;
	   *     request.removeListener('validate', listener);
	   *   @readonly
	   *   @return [Function]
	   * @!attribute VALIDATE_PARAMETERS
	   *   A request listener that validates input parameters in a request.
	   *   Handles the {AWS.Request~validate 'validate' Request event}
	   *   @example Sending a request without validating parameters
	   *     var listener = AWS.EventListeners.Core.VALIDATE_PARAMETERS;
	   *     request.removeListener('validate', listener);
	   *   @example Disable parameter validation globally
	   *     AWS.EventListeners.Core.removeListener('validate',
	   *       AWS.EventListeners.Core.VALIDATE_REGION);
	   *   @readonly
	   *   @return [Function]
	   * @!attribute SEND
	   *   A request listener that initiates the HTTP connection for a
	   *   request being sent. Handles the {AWS.Request~send 'send' Request event}
	   *   @example Replacing the HTTP handler
	   *     var listener = AWS.EventListeners.Core.SEND;
	   *     request.removeListener('send', listener);
	   *     request.on('send', function(response) {
	   *       customHandler.send(response);
	   *     });
	   *   @return [Function]
	   *   @readonly
	   * @!attribute HTTP_DATA
	   *   A request listener that reads data from the HTTP connection in order
	   *   to build the response data.
	   *   Handles the {AWS.Request~httpData 'httpData' Request event}.
	   *   Remove this handler if you are overriding the 'httpData' event and
	   *   do not want extra data processing and buffering overhead.
	   *   @example Disabling default data processing
	   *     var listener = AWS.EventListeners.Core.HTTP_DATA;
	   *     request.removeListener('httpData', listener);
	   *   @return [Function]
	   *   @readonly
	   */
	  Core: {} /* doc hack */
	};

	AWS.EventListeners = {
	  Core: new SequentialExecutor().addNamedListeners(function(add, addAsync) {
	    addAsync('VALIDATE_CREDENTIALS', 'validate',
	        function VALIDATE_CREDENTIALS(req, done) {
	      if (!req.service.api.signatureVersion) return done(); // none
	      req.service.config.getCredentials(function(err) {
	        if (err) {
	          req.response.error = AWS.util.error(err,
	            {code: 'CredentialsError', message: 'Missing credentials in config'});
	        }
	        done();
	      });
	    });

	    add('VALIDATE_REGION', 'validate', function VALIDATE_REGION(req) {
	      if (!req.service.config.region && !req.service.isGlobalEndpoint) {
	        req.response.error = AWS.util.error(new Error(),
	          {code: 'ConfigError', message: 'Missing region in config'});
	      }
	    });

	    add('BUILD_IDEMPOTENCY_TOKENS', 'validate', function BUILD_IDEMPOTENCY_TOKENS(req) {
	      var operation = req.service.api.operations[req.operation];
	      if (!operation) {
	        return;
	      }
	      var idempotentMembers = operation.idempotentMembers;
	      if (!idempotentMembers.length) {
	        return;
	      }
	      // creates a copy of params so user's param object isn't mutated
	      var params = AWS.util.copy(req.params);
	      for (var i = 0, iLen = idempotentMembers.length; i < iLen; i++) {
	        if (!params[idempotentMembers[i]]) {
	          // add the member
	          params[idempotentMembers[i]] = uuid.v4();
	        }
	      }
	      req.params = params;
	    });

	    add('VALIDATE_PARAMETERS', 'validate', function VALIDATE_PARAMETERS(req) {
	      var rules = req.service.api.operations[req.operation].input;
	      var validation = req.service.config.paramValidation;
	      new AWS.ParamValidator(validation).validate(rules, req.params);
	    });

	    addAsync('COMPUTE_SHA256', 'afterBuild', function COMPUTE_SHA256(req, done) {
	      req.haltHandlersOnError();
	      if (!req.service.api.signatureVersion) return done(); // none
	      if (req.service.getSignerClass(req) === AWS.Signers.V4) {
	        var body = req.httpRequest.body || '';
	        AWS.util.computeSha256(body, function(err, sha) {
	          if (err) {
	            done(err);
	          }
	          else {
	            req.httpRequest.headers['X-Amz-Content-Sha256'] = sha;
	            done();
	          }
	        });
	      } else {
	        done();
	      }
	    });

	    add('SET_CONTENT_LENGTH', 'afterBuild', function SET_CONTENT_LENGTH(req) {
	      if (req.httpRequest.headers['Content-Length'] === undefined) {
	        var length = AWS.util.string.byteLength(req.httpRequest.body);
	        req.httpRequest.headers['Content-Length'] = length;
	      }
	    });

	    add('SET_HTTP_HOST', 'afterBuild', function SET_HTTP_HOST(req) {
	      req.httpRequest.headers['Host'] = req.httpRequest.endpoint.host;
	    });

	    add('RESTART', 'restart', function RESTART() {
	      var err = this.response.error;
	      if (!err || !err.retryable) return;

	      this.httpRequest = new AWS.HttpRequest(
	        this.service.endpoint,
	        this.service.region
	      );

	      if (this.response.retryCount < this.service.config.maxRetries) {
	        this.response.retryCount++;
	      } else {
	        this.response.error = null;
	      }
	    });

	    addAsync('SIGN', 'sign', function SIGN(req, done) {
	      var service = req.service;
	      if (!service.api.signatureVersion) return done(); // none

	      service.config.getCredentials(function (err, credentials) {
	        if (err) {
	          req.response.error = err;
	          return done();
	        }

	        try {
	          var date = AWS.util.date.getDate();
	          var SignerClass = service.getSignerClass(req);
	          var signer = new SignerClass(req.httpRequest,
	            service.api.signingName || service.api.endpointPrefix,
	           service.config.signatureCache);
	          signer.setServiceClientId(service._clientId);

	          // clear old authorization headers
	          delete req.httpRequest.headers['Authorization'];
	          delete req.httpRequest.headers['Date'];
	          delete req.httpRequest.headers['X-Amz-Date'];

	          // add new authorization
	          signer.addAuthorization(credentials, date);
	          req.signedAt = date;
	        } catch (e) {
	          req.response.error = e;
	        }
	        done();
	      });
	    });

	    add('VALIDATE_RESPONSE', 'validateResponse', function VALIDATE_RESPONSE(resp) {
	      if (this.service.successfulResponse(resp, this)) {
	        resp.data = {};
	        resp.error = null;
	      } else {
	        resp.data = null;
	        resp.error = AWS.util.error(new Error(),
	          {code: 'UnknownError', message: 'An unknown error occurred.'});
	      }
	    });

	    addAsync('SEND', 'send', function SEND(resp, done) {
	      resp.httpResponse._abortCallback = done;
	      resp.error = null;
	      resp.data = null;

	      function callback(httpResp) {
	        resp.httpResponse.stream = httpResp;

	        httpResp.on('headers', function onHeaders(statusCode, headers) {
	          resp.request.emit('httpHeaders', [statusCode, headers, resp]);

	          if (!resp.httpResponse.streaming) {
	            if (AWS.HttpClient.streamsApiVersion === 2) { // streams2 API check
	              httpResp.on('readable', function onReadable() {
	                var data = httpResp.read();
	                if (data !== null) {
	                  resp.request.emit('httpData', [data, resp]);
	                }
	              });
	            } else { // legacy streams API
	              httpResp.on('data', function onData(data) {
	                resp.request.emit('httpData', [data, resp]);
	              });
	            }
	          }
	        });

	        httpResp.on('end', function onEnd() {
	          resp.request.emit('httpDone');
	          done();
	        });
	      }

	      function progress(httpResp) {
	        httpResp.on('sendProgress', function onSendProgress(value) {
	          resp.request.emit('httpUploadProgress', [value, resp]);
	        });

	        httpResp.on('receiveProgress', function onReceiveProgress(value) {
	          resp.request.emit('httpDownloadProgress', [value, resp]);
	        });
	      }

	      function error(err) {
	        resp.error = AWS.util.error(err, {
	          code: 'NetworkingError',
	          region: resp.request.httpRequest.region,
	          hostname: resp.request.httpRequest.endpoint.hostname,
	          retryable: true
	        });
	        resp.request.emit('httpError', [resp.error, resp], function() {
	          done();
	        });
	      }

	      function executeSend() {
	        var http = AWS.HttpClient.getInstance();
	        var httpOptions = resp.request.service.config.httpOptions || {};
	        try {
	          var stream = http.handleRequest(resp.request.httpRequest, httpOptions,
	                                          callback, error);
	          progress(stream);
	        } catch (err) {
	          error(err);
	        }
	      }

	      var timeDiff = (AWS.util.date.getDate() - this.signedAt) / 1000;
	      if (timeDiff >= 60 * 10) { // if we signed 10min ago, re-sign
	        this.emit('sign', [this], function(err) {
	          if (err) done(err);
	          else executeSend();
	        });
	      } else {
	        executeSend();
	      }
	    });

	    add('HTTP_HEADERS', 'httpHeaders',
	        function HTTP_HEADERS(statusCode, headers, resp) {
	      resp.httpResponse.statusCode = statusCode;
	      resp.httpResponse.headers = headers;
	      resp.httpResponse.body = new AWS.util.Buffer('');
	      resp.httpResponse.buffers = [];
	      resp.httpResponse.numBytes = 0;
	      var dateHeader = headers.date || headers.Date;
	      if (dateHeader) {
	        var serverTime = Date.parse(dateHeader);
	        if (resp.request.service.config.correctClockSkew
	            && AWS.util.isClockSkewed(serverTime)) {
	          AWS.util.applyClockOffset(serverTime);
	        }
	      }
	    });

	    add('HTTP_DATA', 'httpData', function HTTP_DATA(chunk, resp) {
	      if (chunk) {
	        if (AWS.util.isNode()) {
	          resp.httpResponse.numBytes += chunk.length;

	          var total = resp.httpResponse.headers['content-length'];
	          var progress = { loaded: resp.httpResponse.numBytes, total: total };
	          resp.request.emit('httpDownloadProgress', [progress, resp]);
	        }

	        resp.httpResponse.buffers.push(new AWS.util.Buffer(chunk));
	      }
	    });

	    add('HTTP_DONE', 'httpDone', function HTTP_DONE(resp) {
	      // convert buffers array into single buffer
	      if (resp.httpResponse.buffers && resp.httpResponse.buffers.length > 0) {
	        var body = AWS.util.buffer.concat(resp.httpResponse.buffers);
	        resp.httpResponse.body = body;
	      }
	      delete resp.httpResponse.numBytes;
	      delete resp.httpResponse.buffers;
	    });

	    add('FINALIZE_ERROR', 'retry', function FINALIZE_ERROR(resp) {
	      if (resp.httpResponse.statusCode) {
	        resp.error.statusCode = resp.httpResponse.statusCode;
	        if (resp.error.retryable === undefined) {
	          resp.error.retryable = this.service.retryableError(resp.error, this);
	        }
	      }
	    });

	    add('INVALIDATE_CREDENTIALS', 'retry', function INVALIDATE_CREDENTIALS(resp) {
	      if (!resp.error) return;
	      switch (resp.error.code) {
	        case 'RequestExpired': // EC2 only
	        case 'ExpiredTokenException':
	        case 'ExpiredToken':
	          resp.error.retryable = true;
	          resp.request.service.config.credentials.expired = true;
	      }
	    });

	    add('EXPIRED_SIGNATURE', 'retry', function EXPIRED_SIGNATURE(resp) {
	      var err = resp.error;
	      if (!err) return;
	      if (typeof err.code === 'string' && typeof err.message === 'string') {
	        if (err.code.match(/Signature/) && err.message.match(/expired/)) {
	          resp.error.retryable = true;
	        }
	      }
	    });

	    add('CLOCK_SKEWED', 'retry', function CLOCK_SKEWED(resp) {
	      if (!resp.error) return;
	      if (this.service.clockSkewError(resp.error)
	          && this.service.config.correctClockSkew
	          && AWS.config.isClockSkewed) {
	        resp.error.retryable = true;
	      }
	    });

	    add('REDIRECT', 'retry', function REDIRECT(resp) {
	      if (resp.error && resp.error.statusCode >= 300 &&
	          resp.error.statusCode < 400 && resp.httpResponse.headers['location']) {
	        this.httpRequest.endpoint =
	          new AWS.Endpoint(resp.httpResponse.headers['location']);
	        this.httpRequest.headers['Host'] = this.httpRequest.endpoint.host;
	        resp.error.redirect = true;
	        resp.error.retryable = true;
	      }
	    });

	    add('RETRY_CHECK', 'retry', function RETRY_CHECK(resp) {
	      if (resp.error) {
	        if (resp.error.redirect && resp.redirectCount < resp.maxRedirects) {
	          resp.error.retryDelay = 0;
	        } else if (resp.retryCount < resp.maxRetries) {
	          resp.error.retryDelay = this.service.retryDelays(resp.retryCount) || 0;
	        }
	      }
	    });

	    addAsync('RESET_RETRY_STATE', 'afterRetry', function RESET_RETRY_STATE(resp, done) {
	      var delay, willRetry = false;

	      if (resp.error) {
	        delay = resp.error.retryDelay || 0;
	        if (resp.error.retryable && resp.retryCount < resp.maxRetries) {
	          resp.retryCount++;
	          willRetry = true;
	        } else if (resp.error.redirect && resp.redirectCount < resp.maxRedirects) {
	          resp.redirectCount++;
	          willRetry = true;
	        }
	      }

	      if (willRetry) {
	        resp.error = null;
	        setTimeout(done, delay);
	      } else {
	        done();
	      }
	    });
	  }),

	  CorePost: new SequentialExecutor().addNamedListeners(function(add) {
	    add('EXTRACT_REQUEST_ID', 'extractData', AWS.util.extractRequestId);
	    add('EXTRACT_REQUEST_ID', 'extractError', AWS.util.extractRequestId);

	    add('ENOTFOUND_ERROR', 'httpError', function ENOTFOUND_ERROR(err) {
	      if (err.code === 'NetworkingError' && err.errno === 'ENOTFOUND') {
	        var message = 'Inaccessible host: `' + err.hostname +
	          '\'. This service may not be available in the `' + err.region +
	          '\' region.';
	        this.response.error = AWS.util.error(new Error(message), {
	          code: 'UnknownEndpoint',
	          region: err.region,
	          hostname: err.hostname,
	          retryable: true,
	          originalError: err
	        });
	      }
	    });
	  }),

	  Logger: new SequentialExecutor().addNamedListeners(function(add) {
	    add('LOG_REQUEST', 'complete', function LOG_REQUEST(resp) {
	      var req = resp.request;
	      var logger = req.service.config.logger;
	      if (!logger) return;

	      function buildMessage() {
	        var time = AWS.util.date.getDate().getTime();
	        var delta = (time - req.startTime.getTime()) / 1000;
	        var ansi = logger.isTTY ? true : false;
	        var status = resp.httpResponse.statusCode;
	        var params = __webpack_require__(109).inspect(req.params, true, null);

	        var message = '';
	        if (ansi) message += '\x1B[33m';
	        message += '[AWS ' + req.service.serviceIdentifier + ' ' + status;
	        message += ' ' + delta.toString() + 's ' + resp.retryCount + ' retries]';
	        if (ansi) message += '\x1B[0;1m';
	        message += ' ' + AWS.util.string.lowerFirst(req.operation);
	        message += '(' + params + ')';
	        if (ansi) message += '\x1B[0m';
	        return message;
	      }

	      var line = buildMessage();
	      if (typeof logger.log === 'function') {
	        logger.log(line);
	      } else if (typeof logger.write === 'function') {
	        logger.write(line + '\n');
	      }
	    });
	  }),

	  Json: new SequentialExecutor().addNamedListeners(function(add) {
	    var svc = __webpack_require__(6);
	    add('BUILD', 'build', svc.buildRequest);
	    add('EXTRACT_DATA', 'extractData', svc.extractData);
	    add('EXTRACT_ERROR', 'extractError', svc.extractError);
	  }),

	  Rest: new SequentialExecutor().addNamedListeners(function(add) {
	    var svc = __webpack_require__(13);
	    add('BUILD', 'build', svc.buildRequest);
	    add('EXTRACT_DATA', 'extractData', svc.extractData);
	    add('EXTRACT_ERROR', 'extractError', svc.extractError);
	  }),

	  RestJson: new SequentialExecutor().addNamedListeners(function(add) {
	    var svc = __webpack_require__(14);
	    add('BUILD', 'build', svc.buildRequest);
	    add('EXTRACT_DATA', 'extractData', svc.extractData);
	    add('EXTRACT_ERROR', 'extractError', svc.extractError);
	  }),

	  RestXml: new SequentialExecutor().addNamedListeners(function(add) {
	    var svc = __webpack_require__(15);
	    add('BUILD', 'build', svc.buildRequest);
	    add('EXTRACT_DATA', 'extractData', svc.extractData);
	    add('EXTRACT_ERROR', 'extractError', svc.extractError);
	  }),

	  Query: new SequentialExecutor().addNamedListeners(function(add) {
	    var svc = __webpack_require__(9);
	    add('BUILD', 'build', svc.buildRequest);
	    add('EXTRACT_DATA', 'extractData', svc.extractData);
	    add('EXTRACT_ERROR', 'extractError', svc.extractError);
	  })
	};


/***/ },
/* 106 */
/***/ function(module, exports, __webpack_require__) {

	// Unique ID creation requires a high quality random # generator.  We feature
	// detect to determine the best RNG source, normalizing to a function that
	// returns 128-bits of randomness, since that's what's usually required
	var _rng = __webpack_require__(107);

	// Maps for number <-> hex string conversion
	var _byteToHex = [];
	var _hexToByte = {};
	for (var i = 0; i < 256; ++i) {
	  _byteToHex[i] = (i + 0x100).toString(16).substr(1);
	  _hexToByte[_byteToHex[i]] = i;
	}

	function buff_to_string(buf, offset) {
	  var i = offset || 0;
	  var bth = _byteToHex;
	  return  bth[buf[i++]] + bth[buf[i++]] +
	          bth[buf[i++]] + bth[buf[i++]] + '-' +
	          bth[buf[i++]] + bth[buf[i++]] + '-' +
	          bth[buf[i++]] + bth[buf[i++]] + '-' +
	          bth[buf[i++]] + bth[buf[i++]] + '-' +
	          bth[buf[i++]] + bth[buf[i++]] +
	          bth[buf[i++]] + bth[buf[i++]] +
	          bth[buf[i++]] + bth[buf[i++]];
	}

	// **`v1()` - Generate time-based UUID**
	//
	// Inspired by https://github.com/LiosK/UUID.js
	// and http://docs.python.org/library/uuid.html

	// random #'s we need to init node and clockseq
	var _seedBytes = _rng();

	// Per 4.5, create and 48-bit node id, (47 random bits + multicast bit = 1)
	var _nodeId = [
	  _seedBytes[0] | 0x01,
	  _seedBytes[1], _seedBytes[2], _seedBytes[3], _seedBytes[4], _seedBytes[5]
	];

	// Per 4.2.2, randomize (14 bit) clockseq
	var _clockseq = (_seedBytes[6] << 8 | _seedBytes[7]) & 0x3fff;

	// Previous uuid creation time
	var _lastMSecs = 0, _lastNSecs = 0;

	// See https://github.com/broofa/node-uuid for API details
	function v1(options, buf, offset) {
	  var i = buf && offset || 0;
	  var b = buf || [];

	  options = options || {};

	  var clockseq = options.clockseq !== undefined ? options.clockseq : _clockseq;

	  // UUID timestamps are 100 nano-second units since the Gregorian epoch,
	  // (1582-10-15 00:00).  JSNumbers aren't precise enough for this, so
	  // time is handled internally as 'msecs' (integer milliseconds) and 'nsecs'
	  // (100-nanoseconds offset from msecs) since unix epoch, 1970-01-01 00:00.
	  var msecs = options.msecs !== undefined ? options.msecs : new Date().getTime();

	  // Per 4.2.1.2, use count of uuid's generated during the current clock
	  // cycle to simulate higher resolution clock
	  var nsecs = options.nsecs !== undefined ? options.nsecs : _lastNSecs + 1;

	  // Time since last uuid creation (in msecs)
	  var dt = (msecs - _lastMSecs) + (nsecs - _lastNSecs)/10000;

	  // Per 4.2.1.2, Bump clockseq on clock regression
	  if (dt < 0 && options.clockseq === undefined) {
	    clockseq = clockseq + 1 & 0x3fff;
	  }

	  // Reset nsecs if clock regresses (new clockseq) or we've moved onto a new
	  // time interval
	  if ((dt < 0 || msecs > _lastMSecs) && options.nsecs === undefined) {
	    nsecs = 0;
	  }

	  // Per 4.2.1.2 Throw error if too many uuids are requested
	  if (nsecs >= 10000) {
	    throw new Error('uuid.v1(): Can\'t create more than 10M uuids/sec');
	  }

	  _lastMSecs = msecs;
	  _lastNSecs = nsecs;
	  _clockseq = clockseq;

	  // Per 4.1.4 - Convert from unix epoch to Gregorian epoch
	  msecs += 12219292800000;

	  // `time_low`
	  var tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
	  b[i++] = tl >>> 24 & 0xff;
	  b[i++] = tl >>> 16 & 0xff;
	  b[i++] = tl >>> 8 & 0xff;
	  b[i++] = tl & 0xff;

	  // `time_mid`
	  var tmh = (msecs / 0x100000000 * 10000) & 0xfffffff;
	  b[i++] = tmh >>> 8 & 0xff;
	  b[i++] = tmh & 0xff;

	  // `time_high_and_version`
	  b[i++] = tmh >>> 24 & 0xf | 0x10; // include version
	  b[i++] = tmh >>> 16 & 0xff;

	  // `clock_seq_hi_and_reserved` (Per 4.2.2 - include variant)
	  b[i++] = clockseq >>> 8 | 0x80;

	  // `clock_seq_low`
	  b[i++] = clockseq & 0xff;

	  // `node`
	  var node = options.node || _nodeId;
	  for (var n = 0; n < 6; ++n) {
	    b[i + n] = node[n];
	  }

	  return buf ? buf : buff_to_string(b);
	}

	// **`v4()` - Generate random UUID**

	// See https://github.com/broofa/node-uuid for API details
	function v4(options, buf, offset) {
	  // Deprecated - 'format' argument, as supported in v1.2
	  var i = buf && offset || 0;

	  if (typeof(options) == 'string') {
	    buf = options == 'binary' ? new Array(16) : null;
	    options = null;
	  }
	  options = options || {};

	  var rnds = options.random || (options.rng || _rng)();

	  // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
	  rnds[6] = (rnds[6] & 0x0f) | 0x40;
	  rnds[8] = (rnds[8] & 0x3f) | 0x80;

	  // Copy bytes to buffer, if provided
	  if (buf) {
	    for (var ii = 0; ii < 16; ++ii) {
	      buf[i + ii] = rnds[ii];
	    }
	  }

	  return buf || buff_to_string(rnds);
	}

	// Export public API
	var uuid = v4;
	uuid.v1 = v1;
	uuid.v4 = v4;

	module.exports = uuid;


/***/ },
/* 107 */
/***/ function(module, exports, __webpack_require__) {

	var rb = __webpack_require__(108).randomBytes;
	module.exports = function() {
	  return rb(16);
	};


/***/ },
/* 108 */
/***/ function(module, exports) {

	module.exports = require("crypto");

/***/ },
/* 109 */
/***/ function(module, exports) {

	module.exports = require("util");

/***/ },
/* 110 */
/***/ function(module, exports, __webpack_require__) {

	var AWS = __webpack_require__(5);
	var AcceptorStateMachine = __webpack_require__(111);
	var inherit = AWS.util.inherit;
	var domain = AWS.util.domain;
	var jmespath = __webpack_require__(112);

	/**
	 * @api private
	 */
	var hardErrorStates = {success: 1, error: 1, complete: 1};

	function isTerminalState(machine) {
	  return Object.prototype.hasOwnProperty.call(hardErrorStates, machine._asm.currentState);
	}

	var fsm = new AcceptorStateMachine();
	fsm.setupStates = function() {
	  var transition = function(_, done) {
	    var self = this;
	    self._haltHandlersOnError = false;

	    self.emit(self._asm.currentState, function(err) {
	      if (err) {
	        if (isTerminalState(self)) {
	          if (domain && self.domain instanceof domain.Domain) {
	            err.domainEmitter = self;
	            err.domain = self.domain;
	            err.domainThrown = false;
	            self.domain.emit('error', err);
	          } else {
	            throw err;
	          }
	        } else {
	          self.response.error = err;
	          done(err);
	        }
	      } else {
	        done(self.response.error);
	      }
	    });

	  };

	  this.addState('validate', 'build', 'error', transition);
	  this.addState('build', 'afterBuild', 'restart', transition);
	  this.addState('afterBuild', 'sign', 'restart', transition);
	  this.addState('sign', 'send', 'retry', transition);
	  this.addState('retry', 'afterRetry', 'afterRetry', transition);
	  this.addState('afterRetry', 'sign', 'error', transition);
	  this.addState('send', 'validateResponse', 'retry', transition);
	  this.addState('validateResponse', 'extractData', 'extractError', transition);
	  this.addState('extractError', 'extractData', 'retry', transition);
	  this.addState('extractData', 'success', 'retry', transition);
	  this.addState('restart', 'build', 'error', transition);
	  this.addState('success', 'complete', 'complete', transition);
	  this.addState('error', 'complete', 'complete', transition);
	  this.addState('complete', null, null, transition);
	};
	fsm.setupStates();

	/**
	 * ## Asynchronous Requests
	 *
	 * All requests made through the SDK are asynchronous and use a
	 * callback interface. Each service method that kicks off a request
	 * returns an `AWS.Request` object that you can use to register
	 * callbacks.
	 *
	 * For example, the following service method returns the request
	 * object as "request", which can be used to register callbacks:
	 *
	 * ```javascript
	 * // request is an AWS.Request object
	 * var request = ec2.describeInstances();
	 *
	 * // register callbacks on request to retrieve response data
	 * request.on('success', function(response) {
	 *   console.log(response.data);
	 * });
	 * ```
	 *
	 * When a request is ready to be sent, the {send} method should
	 * be called:
	 *
	 * ```javascript
	 * request.send();
	 * ```
	 *
	 * ## Removing Default Listeners for Events
	 *
	 * Request objects are built with default listeners for the various events,
	 * depending on the service type. In some cases, you may want to remove
	 * some built-in listeners to customize behaviour. Doing this requires
	 * access to the built-in listener functions, which are exposed through
	 * the {AWS.EventListeners.Core} namespace. For instance, you may
	 * want to customize the HTTP handler used when sending a request. In this
	 * case, you can remove the built-in listener associated with the 'send'
	 * event, the {AWS.EventListeners.Core.SEND} listener and add your own.
	 *
	 * ## Multiple Callbacks and Chaining
	 *
	 * You can register multiple callbacks on any request object. The
	 * callbacks can be registered for different events, or all for the
	 * same event. In addition, you can chain callback registration, for
	 * example:
	 *
	 * ```javascript
	 * request.
	 *   on('success', function(response) {
	 *     console.log("Success!");
	 *   }).
	 *   on('error', function(response) {
	 *     console.log("Error!");
	 *   }).
	 *   on('complete', function(response) {
	 *     console.log("Always!");
	 *   }).
	 *   send();
	 * ```
	 *
	 * The above example will print either "Success! Always!", or "Error! Always!",
	 * depending on whether the request succeeded or not.
	 *
	 * @!attribute httpRequest
	 *   @readonly
	 *   @!group HTTP Properties
	 *   @return [AWS.HttpRequest] the raw HTTP request object
	 *     containing request headers and body information
	 *     sent by the service.
	 *
	 * @!attribute startTime
	 *   @readonly
	 *   @!group Operation Properties
	 *   @return [Date] the time that the request started
	 *
	 * @!group Request Building Events
	 *
	 * @!event validate(request)
	 *   Triggered when a request is being validated. Listeners
	 *   should throw an error if the request should not be sent.
	 *   @param request [Request] the request object being sent
	 *   @see AWS.EventListeners.Core.VALIDATE_CREDENTIALS
	 *   @see AWS.EventListeners.Core.VALIDATE_REGION
	 *   @example Ensuring that a certain parameter is set before sending a request
	 *     var req = s3.putObject(params);
	 *     req.on('validate', function() {
	 *       if (!req.params.Body.match(/^Hello\s/)) {
	 *         throw new Error('Body must start with "Hello "');
	 *       }
	 *     });
	 *     req.send(function(err, data) { ... });
	 *
	 * @!event build(request)
	 *   Triggered when the request payload is being built. Listeners
	 *   should fill the necessary information to send the request
	 *   over HTTP.
	 *   @param (see AWS.Request~validate)
	 *   @example Add a custom HTTP header to a request
	 *     var req = s3.putObject(params);
	 *     req.on('build', function() {
	 *       req.httpRequest.headers['Custom-Header'] = 'value';
	 *     });
	 *     req.send(function(err, data) { ... });
	 *
	 * @!event sign(request)
	 *   Triggered when the request is being signed. Listeners should
	 *   add the correct authentication headers and/or adjust the body,
	 *   depending on the authentication mechanism being used.
	 *   @param (see AWS.Request~validate)
	 *
	 * @!group Request Sending Events
	 *
	 * @!event send(response)
	 *   Triggered when the request is ready to be sent. Listeners
	 *   should call the underlying transport layer to initiate
	 *   the sending of the request.
	 *   @param response [Response] the response object
	 *   @context [Request] the request object that was sent
	 *   @see AWS.EventListeners.Core.SEND
	 *
	 * @!event retry(response)
	 *   Triggered when a request failed and might need to be retried or redirected.
	 *   If the response is retryable, the listener should set the
	 *   `response.error.retryable` property to `true`, and optionally set
	 *   `response.error.retryCount` to the millisecond delay for the next attempt.
	 *   In the case of a redirect, `response.error.redirect` should be set to
	 *   `true` with `retryCount` set to an optional delay on the next request.
	 *
	 *   If a listener decides that a request should not be retried,
	 *   it should set both `retryable` and `redirect` to false.
	 *
	 *   Note that a retryable error will be retried at most
	 *   {AWS.Config.maxRetries} times (based on the service object's config).
	 *   Similarly, a request that is redirected will only redirect at most
	 *   {AWS.Config.maxRedirects} times.
	 *
	 *   @param (see AWS.Request~send)
	 *   @context (see AWS.Request~send)
	 *   @example Adding a custom retry for a 404 response
	 *     request.on('retry', function(response) {
	 *       // this resource is not yet available, wait 10 seconds to get it again
	 *       if (response.httpResponse.statusCode === 404 && response.error) {
	 *         response.error.retryable = true;   // retry this error
	 *         response.error.retryCount = 10000; // wait 10 seconds
	 *       }
	 *     });
	 *
	 * @!group Data Parsing Events
	 *
	 * @!event extractError(response)
	 *   Triggered on all non-2xx requests so that listeners can extract
	 *   error details from the response body. Listeners to this event
	 *   should set the `response.error` property.
	 *   @param (see AWS.Request~send)
	 *   @context (see AWS.Request~send)
	 *
	 * @!event extractData(response)
	 *   Triggered in successful requests to allow listeners to
	 *   de-serialize the response body into `response.data`.
	 *   @param (see AWS.Request~send)
	 *   @context (see AWS.Request~send)
	 *
	 * @!group Completion Events
	 *
	 * @!event success(response)
	 *   Triggered when the request completed successfully.
	 *   `response.data` will contain the response data and
	 *   `response.error` will be null.
	 *   @param (see AWS.Request~send)
	 *   @context (see AWS.Request~send)
	 *
	 * @!event error(error, response)
	 *   Triggered when an error occurs at any point during the
	 *   request. `response.error` will contain details about the error
	 *   that occurred. `response.data` will be null.
	 *   @param error [Error] the error object containing details about
	 *     the error that occurred.
	 *   @param (see AWS.Request~send)
	 *   @context (see AWS.Request~send)
	 *
	 * @!event complete(response)
	 *   Triggered whenever a request cycle completes. `response.error`
	 *   should be checked, since the request may have failed.
	 *   @param (see AWS.Request~send)
	 *   @context (see AWS.Request~send)
	 *
	 * @!group HTTP Events
	 *
	 * @!event httpHeaders(statusCode, headers, response)
	 *   Triggered when headers are sent by the remote server
	 *   @param statusCode [Integer] the HTTP response code
	 *   @param headers [map<String,String>] the response headers
	 *   @param (see AWS.Request~send)
	 *   @context (see AWS.Request~send)
	 *
	 * @!event httpData(chunk, response)
	 *   Triggered when data is sent by the remote server
	 *   @param chunk [Buffer] the buffer data containing the next data chunk
	 *     from the server
	 *   @param (see AWS.Request~send)
	 *   @context (see AWS.Request~send)
	 *   @see AWS.EventListeners.Core.HTTP_DATA
	 *
	 * @!event httpUploadProgress(progress, response)
	 *   Triggered when the HTTP request has uploaded more data
	 *   @param progress [map] An object containing the `loaded` and `total` bytes
	 *     of the request.
	 *   @param (see AWS.Request~send)
	 *   @context (see AWS.Request~send)
	 *   @note This event will not be emitted in Node.js 0.8.x.
	 *
	 * @!event httpDownloadProgress(progress, response)
	 *   Triggered when the HTTP request has downloaded more data
	 *   @param progress [map] An object containing the `loaded` and `total` bytes
	 *     of the request.
	 *   @param (see AWS.Request~send)
	 *   @context (see AWS.Request~send)
	 *   @note This event will not be emitted in Node.js 0.8.x.
	 *
	 * @!event httpError(error, response)
	 *   Triggered when the HTTP request failed
	 *   @param error [Error] the error object that was thrown
	 *   @param (see AWS.Request~send)
	 *   @context (see AWS.Request~send)
	 *
	 * @!event httpDone(response)
	 *   Triggered when the server is finished sending data
	 *   @param (see AWS.Request~send)
	 *   @context (see AWS.Request~send)
	 *
	 * @see AWS.Response
	 */
	AWS.Request = inherit({

	  /**
	   * Creates a request for an operation on a given service with
	   * a set of input parameters.
	   *
	   * @param service [AWS.Service] the service to perform the operation on
	   * @param operation [String] the operation to perform on the service
	   * @param params [Object] parameters to send to the operation.
	   *   See the operation's documentation for the format of the
	   *   parameters.
	   */
	  constructor: function Request(service, operation, params) {
	    var endpoint = service.endpoint;
	    var region = service.config.region;
	    var customUserAgent = service.config.customUserAgent;

	    // global endpoints sign as us-east-1
	    if (service.isGlobalEndpoint) region = 'us-east-1';

	    this.domain = domain && domain.active;
	    this.service = service;
	    this.operation = operation;
	    this.params = params || {};
	    this.httpRequest = new AWS.HttpRequest(endpoint, region, customUserAgent);
	    this.startTime = AWS.util.date.getDate();

	    this.response = new AWS.Response(this);
	    this._asm = new AcceptorStateMachine(fsm.states, 'validate');
	    this._haltHandlersOnError = false;

	    AWS.SequentialExecutor.call(this);
	    this.emit = this.emitEvent;
	  },

	  /**
	   * @!group Sending a Request
	   */

	  /**
	   * @overload send(callback = null)
	   *   Sends the request object.
	   *
	   *   @callback callback function(err, data)
	   *     If a callback is supplied, it is called when a response is returned
	   *     from the service.
	   *     @context [AWS.Request] the request object being sent.
	   *     @param err [Error] the error object returned from the request.
	   *       Set to `null` if the request is successful.
	   *     @param data [Object] the de-serialized data returned from
	   *       the request. Set to `null` if a request error occurs.
	   *   @example Sending a request with a callback
	   *     request = s3.putObject({Bucket: 'bucket', Key: 'key'});
	   *     request.send(function(err, data) { console.log(err, data); });
	   *   @example Sending a request with no callback (using event handlers)
	   *     request = s3.putObject({Bucket: 'bucket', Key: 'key'});
	   *     request.on('complete', function(response) { ... }); // register a callback
	   *     request.send();
	   */
	  send: function send(callback) {
	    if (callback) {
	      this.on('complete', function (resp) {
	        callback.call(resp, resp.error, resp.data);
	      });
	    }
	    this.runTo();

	    return this.response;
	  },

	  /**
	   * @!method  promise()
	   *   Returns a 'thenable' promise.
	   *
	   *   Two callbacks can be provided to the `then` method on the returned promise.
	   *   The first callback will be called if the promise is fulfilled, and the second
	   *   callback will be called if the promise is rejected.
	   *   @callback fulfilledCallback function(data)
	   *     Called if the promise is fulfilled.
	   *     @param data [Object] the de-serialized data returned from the request.
	   *   @callback rejectedCallback function(error)
	   *     Called if the promise is rejected.
	   *     @param error [Error] the error object returned from the request.
	   *   @return [Promise] A promise that represents the state of the request.
	   *   @example Sending a request using promises.
	   *     var request = s3.putObject({Bucket: 'bucket', Key: 'key'});
	   *     var result = request.promise();
	   *     result.then(function(data) { ... }, function(error) { ... });
	   */

	  /**
	   * @api private
	   */
	  build: function build(callback) {
	    return this.runTo('send', callback);
	  },

	  /**
	   * @api private
	   */
	  runTo: function runTo(state, done) {
	    this._asm.runTo(state, done, this);
	    return this;
	  },

	  /**
	   * Aborts a request, emitting the error and complete events.
	   *
	   * @!macro nobrowser
	   * @example Aborting a request after sending
	   *   var params = {
	   *     Bucket: 'bucket', Key: 'key',
	   *     Body: new Buffer(1024 * 1024 * 5) // 5MB payload
	   *   };
	   *   var request = s3.putObject(params);
	   *   request.send(function (err, data) {
	   *     if (err) console.log("Error:", err.code, err.message);
	   *     else console.log(data);
	   *   });
	   *
	   *   // abort request in 1 second
	   *   setTimeout(request.abort.bind(request), 1000);
	   *
	   *   // prints "Error: RequestAbortedError Request aborted by user"
	   * @return [AWS.Request] the same request object, for chaining.
	   * @since v1.4.0
	   */
	  abort: function abort() {
	    this.removeAllListeners('validateResponse');
	    this.removeAllListeners('extractError');
	    this.on('validateResponse', function addAbortedError(resp) {
	      resp.error = AWS.util.error(new Error('Request aborted by user'), {
	         code: 'RequestAbortedError', retryable: false
	      });
	    });

	    if (this.httpRequest.stream) { // abort HTTP stream
	      this.httpRequest.stream.abort();
	      if (this.httpRequest._abortCallback) {
	         this.httpRequest._abortCallback();
	      } else {
	        this.removeAllListeners('send'); // haven't sent yet, so let's not
	      }
	    }

	    return this;
	  },

	  /**
	   * Iterates over each page of results given a pageable request, calling
	   * the provided callback with each page of data. After all pages have been
	   * retrieved, the callback is called with `null` data.
	   *
	   * @note This operation can generate multiple requests to a service.
	   * @example Iterating over multiple pages of objects in an S3 bucket
	   *   var pages = 1;
	   *   s3.listObjects().eachPage(function(err, data) {
	   *     if (err) return;
	   *     console.log("Page", pages++);
	   *     console.log(data);
	   *   });
	   * @example Iterating over multiple pages with an asynchronous callback
	   *   s3.listObjects(params).eachPage(function(err, data, done) {
	   *     doSomethingAsyncAndOrExpensive(function() {
	   *       // The next page of results isn't fetched until done is called
	   *       done();
	   *     });
	   *   });
	   * @callback callback function(err, data, [doneCallback])
	   *   Called with each page of resulting data from the request. If the
	   *   optional `doneCallback` is provided in the function, it must be called
	   *   when the callback is complete.
	   *
	   *   @param err [Error] an error object, if an error occurred.
	   *   @param data [Object] a single page of response data. If there is no
	   *     more data, this object will be `null`.
	   *   @param doneCallback [Function] an optional done callback. If this
	   *     argument is defined in the function declaration, it should be called
	   *     when the next page is ready to be retrieved. This is useful for
	   *     controlling serial pagination across asynchronous operations.
	   *   @return [Boolean] if the callback returns `false`, pagination will
	   *     stop.
	   *
	   * @see AWS.Request.eachItem
	   * @see AWS.Response.nextPage
	   * @since v1.4.0
	   */
	  eachPage: function eachPage(callback) {
	    // Make all callbacks async-ish
	    callback = AWS.util.fn.makeAsync(callback, 3);

	    function wrappedCallback(response) {
	      callback.call(response, response.error, response.data, function (result) {
	        if (result === false) return;

	        if (response.hasNextPage()) {
	          response.nextPage().on('complete', wrappedCallback).send();
	        } else {
	          callback.call(response, null, null, AWS.util.fn.noop);
	        }
	      });
	    }

	    this.on('complete', wrappedCallback).send();
	  },

	  /**
	   * Enumerates over individual items of a request, paging the responses if
	   * necessary.
	   *
	   * @api experimental
	   * @since v1.4.0
	   */
	  eachItem: function eachItem(callback) {
	    var self = this;
	    function wrappedCallback(err, data) {
	      if (err) return callback(err, null);
	      if (data === null) return callback(null, null);

	      var config = self.service.paginationConfig(self.operation);
	      var resultKey = config.resultKey;
	      if (Array.isArray(resultKey)) resultKey = resultKey[0];
	      var items = jmespath.search(data, resultKey);
	      var continueIteration = true;
	      AWS.util.arrayEach(items, function(item) {
	        continueIteration = callback(null, item);
	        if (continueIteration === false) {
	          return AWS.util.abort;
	        }
	      });
	      return continueIteration;
	    }

	    this.eachPage(wrappedCallback);
	  },

	  /**
	   * @return [Boolean] whether the operation can return multiple pages of
	   *   response data.
	   * @see AWS.Response.eachPage
	   * @since v1.4.0
	   */
	  isPageable: function isPageable() {
	    return this.service.paginationConfig(this.operation) ? true : false;
	  },

	  /**
	   * Converts the request object into a readable stream that
	   * can be read from or piped into a writable stream.
	   *
	   * @note The data read from a readable stream contains only
	   *   the raw HTTP body contents.
	   * @example Manually reading from a stream
	   *   request.createReadStream().on('data', function(data) {
	   *     console.log("Got data:", data.toString());
	   *   });
	   * @example Piping a request body into a file
	   *   var out = fs.createWriteStream('/path/to/outfile.jpg');
	   *   s3.service.getObject(params).createReadStream().pipe(out);
	   * @return [Stream] the readable stream object that can be piped
	   *   or read from (by registering 'data' event listeners).
	   * @!macro nobrowser
	   */
	  createReadStream: function createReadStream() {
	    var streams = AWS.util.stream;
	    var req = this;
	    var stream = null;

	    if (AWS.HttpClient.streamsApiVersion === 2) {
	      stream = new streams.PassThrough();
	      req.send();
	    } else {
	      stream = new streams.Stream();
	      stream.readable = true;

	      stream.sent = false;
	      stream.on('newListener', function(event) {
	        if (!stream.sent && event === 'data') {
	          stream.sent = true;
	          process.nextTick(function() { req.send(); });
	        }
	      });
	    }

	    this.on('httpHeaders', function streamHeaders(statusCode, headers, resp) {
	      if (statusCode < 300) {
	        req.removeListener('httpData', AWS.EventListeners.Core.HTTP_DATA);
	        req.removeListener('httpError', AWS.EventListeners.Core.HTTP_ERROR);
	        req.on('httpError', function streamHttpError(error) {
	          resp.error = error;
	          resp.error.retryable = false;
	        });

	        var shouldCheckContentLength = false;
	        var expectedLen;
	        if (req.httpRequest.method !== 'HEAD') {
	          expectedLen = parseInt(headers['content-length'], 10);
	        }
	        if (expectedLen !== undefined && !isNaN(expectedLen) && expectedLen >= 0) {
	          shouldCheckContentLength = true;
	          var receivedLen = 0;
	        }

	        var checkContentLengthAndEmit = function checkContentLengthAndEmit() {
	          if (shouldCheckContentLength && receivedLen !== expectedLen) {
	            stream.emit('error', AWS.util.error(
	              new Error('Stream content length mismatch. Received ' +
	                receivedLen + ' of ' + expectedLen + ' bytes.'),
	              { code: 'StreamContentLengthMismatch' }
	            ));
	          } else if (AWS.HttpClient.streamsApiVersion === 2) {
	            stream.end();
	          } else {
	            stream.emit('end')
	          }
	        }

	        var httpStream = resp.httpResponse.createUnbufferedStream();

	        if (AWS.HttpClient.streamsApiVersion === 2) {
	          if (shouldCheckContentLength) {
	            var lengthAccumulator = new streams.PassThrough();
	            lengthAccumulator._write = function(chunk) {
	              if (chunk && chunk.length) {
	                receivedLen += chunk.length;
	              }
	              return streams.PassThrough.prototype._write.apply(this, arguments);
	            };

	            lengthAccumulator.on('end', checkContentLengthAndEmit);
	            httpStream.pipe(lengthAccumulator).pipe(stream, { end: false });
	          } else {
	            httpStream.pipe(stream);
	          }
	        } else {

	          if (shouldCheckContentLength) {
	            httpStream.on('data', function(arg) {
	              if (arg && arg.length) {
	                receivedLen += arg.length;
	              }
	            });
	          }

	          httpStream.on('data', function(arg) {
	            stream.emit('data', arg);
	          });
	          httpStream.on('end', checkContentLengthAndEmit);
	        }

	        httpStream.on('error', function(err) {
	          shouldCheckContentLength = false;
	          stream.emit('error', err);
	        });
	      }
	    });

	    this.on('error', function(err) {
	      stream.emit('error', err);
	    });

	    return stream;
	  },

	  /**
	   * @param [Array,Response] args This should be the response object,
	   *   or an array of args to send to the event.
	   * @api private
	   */
	  emitEvent: function emit(eventName, args, done) {
	    if (typeof args === 'function') { done = args; args = null; }
	    if (!done) done = function() { };
	    if (!args) args = this.eventParameters(eventName, this.response);

	    var origEmit = AWS.SequentialExecutor.prototype.emit;
	    origEmit.call(this, eventName, args, function (err) {
	      if (err) this.response.error = err;
	      done.call(this, err);
	    });
	  },

	  /**
	   * @api private
	   */
	  eventParameters: function eventParameters(eventName) {
	    switch (eventName) {
	      case 'restart':
	      case 'validate':
	      case 'sign':
	      case 'build':
	      case 'afterValidate':
	      case 'afterBuild':
	        return [this];
	      case 'error':
	        return [this.response.error, this.response];
	      default:
	        return [this.response];
	    }
	  },

	  /**
	   * @api private
	   */
	  presign: function presign(expires, callback) {
	    if (!callback && typeof expires === 'function') {
	      callback = expires;
	      expires = null;
	    }
	    return new AWS.Signers.Presign().sign(this.toGet(), expires, callback);
	  },

	  /**
	   * @api private
	   */
	  isPresigned: function isPresigned() {
	    return Object.prototype.hasOwnProperty.call(this.httpRequest.headers, 'presigned-expires');
	  },

	  /**
	   * @api private
	   */
	  toUnauthenticated: function toUnauthenticated() {
	    this.removeListener('validate', AWS.EventListeners.Core.VALIDATE_CREDENTIALS);
	    this.removeListener('sign', AWS.EventListeners.Core.SIGN);
	    return this;
	  },

	  /**
	   * @api private
	   */
	  toGet: function toGet() {
	    if (this.service.api.protocol === 'query' ||
	        this.service.api.protocol === 'ec2') {
	      this.removeListener('build', this.buildAsGet);
	      this.addListener('build', this.buildAsGet);
	    }
	    return this;
	  },

	  /**
	   * @api private
	   */
	  buildAsGet: function buildAsGet(request) {
	    request.httpRequest.method = 'GET';
	    request.httpRequest.path = request.service.endpoint.path +
	                               '?' + request.httpRequest.body;
	    request.httpRequest.body = '';

	    // don't need these headers on a GET request
	    delete request.httpRequest.headers['Content-Length'];
	    delete request.httpRequest.headers['Content-Type'];
	  },

	  /**
	   * @api private
	   */
	  haltHandlersOnError: function haltHandlersOnError() {
	    this._haltHandlersOnError = true;
	  }
	});

	/**
	 * @api private
	 */
	AWS.Request.addPromisesToClass = function addPromisesToClass(PromiseDependency) {
	  this.prototype.promise = function promise() {
	    var self = this;
	    return new PromiseDependency(function(resolve, reject) {
	      self.on('complete', function(resp) {
	        if (resp.error) {
	          reject(resp.error);
	        } else {
	          resolve(resp.data);
	        }
	      });
	      self.runTo();
	    });
	  };
	};

	/**
	 * @api private
	 */
	AWS.Request.deletePromisesFromClass = function deletePromisesFromClass() {
	  delete this.prototype.promise;
	};

	AWS.util.addPromises(AWS.Request);

	AWS.util.mixin(AWS.Request, AWS.SequentialExecutor);


/***/ },
/* 111 */
/***/ function(module, exports) {

	function AcceptorStateMachine(states, state) {
	  this.currentState = state || null;
	  this.states = states || {};
	}

	AcceptorStateMachine.prototype.runTo = function runTo(finalState, done, bindObject, inputError) {
	  if (typeof finalState === 'function') {
	    inputError = bindObject; bindObject = done;
	    done = finalState; finalState = null;
	  }

	  var self = this;
	  var state = self.states[self.currentState];
	  state.fn.call(bindObject || self, inputError, function(err) {
	    if (err) {
	      if (state.fail) self.currentState = state.fail;
	      else return done ? done.call(bindObject, err) : null;
	    } else {
	      if (state.accept) self.currentState = state.accept;
	      else return done ? done.call(bindObject) : null;
	    }
	    if (self.currentState === finalState) {
	      return done ? done.call(bindObject, err) : null;
	    }

	    self.runTo(finalState, done, bindObject, err);
	  });
	};

	AcceptorStateMachine.prototype.addState = function addState(name, acceptState, failState, fn) {
	  if (typeof acceptState === 'function') {
	    fn = acceptState; acceptState = null; failState = null;
	  } else if (typeof failState === 'function') {
	    fn = failState; failState = null;
	  }

	  if (!this.currentState) this.currentState = name;
	  this.states[name] = { accept: acceptState, fail: failState, fn: fn };
	  return this;
	};

	module.exports = AcceptorStateMachine;


/***/ },
/* 112 */
/***/ function(module, exports, __webpack_require__) {

	(function(exports) {
	  "use strict";

	  function isArray(obj) {
	    if (obj !== null) {
	      return Object.prototype.toString.call(obj) === "[object Array]";
	    } else {
	      return false;
	    }
	  }

	  function isObject(obj) {
	    if (obj !== null) {
	      return Object.prototype.toString.call(obj) === "[object Object]";
	    } else {
	      return false;
	    }
	  }

	  function strictDeepEqual(first, second) {
	    // Check the scalar case first.
	    if (first === second) {
	      return true;
	    }

	    // Check if they are the same type.
	    var firstType = Object.prototype.toString.call(first);
	    if (firstType !== Object.prototype.toString.call(second)) {
	      return false;
	    }
	    // We know that first and second have the same type so we can just check the
	    // first type from now on.
	    if (isArray(first) === true) {
	      // Short circuit if they're not the same length;
	      if (first.length !== second.length) {
	        return false;
	      }
	      for (var i = 0; i < first.length; i++) {
	        if (strictDeepEqual(first[i], second[i]) === false) {
	          return false;
	        }
	      }
	      return true;
	    }
	    if (isObject(first) === true) {
	      // An object is equal if it has the same key/value pairs.
	      var keysSeen = {};
	      for (var key in first) {
	        if (hasOwnProperty.call(first, key)) {
	          if (strictDeepEqual(first[key], second[key]) === false) {
	            return false;
	          }
	          keysSeen[key] = true;
	        }
	      }
	      // Now check that there aren't any keys in second that weren't
	      // in first.
	      for (var key2 in second) {
	        if (hasOwnProperty.call(second, key2)) {
	          if (keysSeen[key2] !== true) {
	            return false;
	          }
	        }
	      }
	      return true;
	    }
	    return false;
	  }

	  function isFalse(obj) {
	    // From the spec:
	    // A false value corresponds to the following values:
	    // Empty list
	    // Empty object
	    // Empty string
	    // False boolean
	    // null value

	    // First check the scalar values.
	    if (obj === "" || obj === false || obj === null) {
	        return true;
	    } else if (isArray(obj) && obj.length === 0) {
	        // Check for an empty array.
	        return true;
	    } else if (isObject(obj)) {
	        // Check for an empty object.
	        for (var key in obj) {
	            // If there are any keys, then
	            // the object is not empty so the object
	            // is not false.
	            if (obj.hasOwnProperty(key)) {
	              return false;
	            }
	        }
	        return true;
	    } else {
	        return false;
	    }
	  }

	  function objValues(obj) {
	    var keys = Object.keys(obj);
	    var values = [];
	    for (var i = 0; i < keys.length; i++) {
	      values.push(obj[keys[i]]);
	    }
	    return values;
	  }

	  function merge(a, b) {
	      var merged = {};
	      for (var key in a) {
	          merged[key] = a[key];
	      }
	      for (var key2 in b) {
	          merged[key2] = b[key2];
	      }
	      return merged;
	  }

	  var trimLeft;
	  if (typeof String.prototype.trimLeft === "function") {
	    trimLeft = function(str) {
	      return str.trimLeft();
	    };
	  } else {
	    trimLeft = function(str) {
	      return str.match(/^\s*(.*)/)[1];
	    };
	  }

	  // Type constants used to define functions.
	  var TYPE_NUMBER = 0;
	  var TYPE_ANY = 1;
	  var TYPE_STRING = 2;
	  var TYPE_ARRAY = 3;
	  var TYPE_OBJECT = 4;
	  var TYPE_BOOLEAN = 5;
	  var TYPE_EXPREF = 6;
	  var TYPE_NULL = 7;
	  var TYPE_ARRAY_NUMBER = 8;
	  var TYPE_ARRAY_STRING = 9;

	  var TOK_EOF = "EOF";
	  var TOK_UNQUOTEDIDENTIFIER = "UnquotedIdentifier";
	  var TOK_QUOTEDIDENTIFIER = "QuotedIdentifier";
	  var TOK_RBRACKET = "Rbracket";
	  var TOK_RPAREN = "Rparen";
	  var TOK_COMMA = "Comma";
	  var TOK_COLON = "Colon";
	  var TOK_RBRACE = "Rbrace";
	  var TOK_NUMBER = "Number";
	  var TOK_CURRENT = "Current";
	  var TOK_EXPREF = "Expref";
	  var TOK_PIPE = "Pipe";
	  var TOK_OR = "Or";
	  var TOK_AND = "And";
	  var TOK_EQ = "EQ";
	  var TOK_GT = "GT";
	  var TOK_LT = "LT";
	  var TOK_GTE = "GTE";
	  var TOK_LTE = "LTE";
	  var TOK_NE = "NE";
	  var TOK_FLATTEN = "Flatten";
	  var TOK_STAR = "Star";
	  var TOK_FILTER = "Filter";
	  var TOK_DOT = "Dot";
	  var TOK_NOT = "Not";
	  var TOK_LBRACE = "Lbrace";
	  var TOK_LBRACKET = "Lbracket";
	  var TOK_LPAREN= "Lparen";
	  var TOK_LITERAL= "Literal";

	  // The "&", "[", "<", ">" tokens
	  // are not in basicToken because
	  // there are two token variants
	  // ("&&", "[?", "<=", ">=").  This is specially handled
	  // below.

	  var basicTokens = {
	    ".": TOK_DOT,
	    "*": TOK_STAR,
	    ",": TOK_COMMA,
	    ":": TOK_COLON,
	    "{": TOK_LBRACE,
	    "}": TOK_RBRACE,
	    "]": TOK_RBRACKET,
	    "(": TOK_LPAREN,
	    ")": TOK_RPAREN,
	    "@": TOK_CURRENT
	  };

	  var operatorStartToken = {
	      "<": true,
	      ">": true,
	      "=": true,
	      "!": true
	  };

	  var skipChars = {
	      " ": true,
	      "\t": true,
	      "\n": true
	  };


	  function isAlpha(ch) {
	      return (ch >= "a" && ch <= "z") ||
	             (ch >= "A" && ch <= "Z") ||
	             ch === "_";
	  }

	  function isNum(ch) {
	      return (ch >= "0" && ch <= "9") ||
	             ch === "-";
	  }
	  function isAlphaNum(ch) {
	      return (ch >= "a" && ch <= "z") ||
	             (ch >= "A" && ch <= "Z") ||
	             (ch >= "0" && ch <= "9") ||
	             ch === "_";
	  }

	  function Lexer() {
	  }
	  Lexer.prototype = {
	      tokenize: function(stream) {
	          var tokens = [];
	          this._current = 0;
	          var start;
	          var identifier;
	          var token;
	          while (this._current < stream.length) {
	              if (isAlpha(stream[this._current])) {
	                  start = this._current;
	                  identifier = this._consumeUnquotedIdentifier(stream);
	                  tokens.push({type: TOK_UNQUOTEDIDENTIFIER,
	                               value: identifier,
	                               start: start});
	              } else if (basicTokens[stream[this._current]] !== undefined) {
	                  tokens.push({type: basicTokens[stream[this._current]],
	                              value: stream[this._current],
	                              start: this._current});
	                  this._current++;
	              } else if (isNum(stream[this._current])) {
	                  token = this._consumeNumber(stream);
	                  tokens.push(token);
	              } else if (stream[this._current] === "[") {
	                  // No need to increment this._current.  This happens
	                  // in _consumeLBracket
	                  token = this._consumeLBracket(stream);
	                  tokens.push(token);
	              } else if (stream[this._current] === "\"") {
	                  start = this._current;
	                  identifier = this._consumeQuotedIdentifier(stream);
	                  tokens.push({type: TOK_QUOTEDIDENTIFIER,
	                               value: identifier,
	                               start: start});
	              } else if (stream[this._current] === "'") {
	                  start = this._current;
	                  identifier = this._consumeRawStringLiteral(stream);
	                  tokens.push({type: TOK_LITERAL,
	                               value: identifier,
	                               start: start});
	              } else if (stream[this._current] === "`") {
	                  start = this._current;
	                  var literal = this._consumeLiteral(stream);
	                  tokens.push({type: TOK_LITERAL,
	                               value: literal,
	                               start: start});
	              } else if (operatorStartToken[stream[this._current]] !== undefined) {
	                  tokens.push(this._consumeOperator(stream));
	              } else if (skipChars[stream[this._current]] !== undefined) {
	                  // Ignore whitespace.
	                  this._current++;
	              } else if (stream[this._current] === "&") {
	                  start = this._current;
	                  this._current++;
	                  if (stream[this._current] === "&") {
	                      this._current++;
	                      tokens.push({type: TOK_AND, value: "&&", start: start});
	                  } else {
	                      tokens.push({type: TOK_EXPREF, value: "&", start: start});
	                  }
	              } else if (stream[this._current] === "|") {
	                  start = this._current;
	                  this._current++;
	                  if (stream[this._current] === "|") {
	                      this._current++;
	                      tokens.push({type: TOK_OR, value: "||", start: start});
	                  } else {
	                      tokens.push({type: TOK_PIPE, value: "|", start: start});
	                  }
	              } else {
	                  var error = new Error("Unknown character:" + stream[this._current]);
	                  error.name = "LexerError";
	                  throw error;
	              }
	          }
	          return tokens;
	      },

	      _consumeUnquotedIdentifier: function(stream) {
	          var start = this._current;
	          this._current++;
	          while (this._current < stream.length && isAlphaNum(stream[this._current])) {
	              this._current++;
	          }
	          return stream.slice(start, this._current);
	      },

	      _consumeQuotedIdentifier: function(stream) {
	          var start = this._current;
	          this._current++;
	          var maxLength = stream.length;
	          while (stream[this._current] !== "\"" && this._current < maxLength) {
	              // You can escape a double quote and you can escape an escape.
	              var current = this._current;
	              if (stream[current] === "\\" && (stream[current + 1] === "\\" ||
	                                               stream[current + 1] === "\"")) {
	                  current += 2;
	              } else {
	                  current++;
	              }
	              this._current = current;
	          }
	          this._current++;
	          return JSON.parse(stream.slice(start, this._current));
	      },

	      _consumeRawStringLiteral: function(stream) {
	          var start = this._current;
	          this._current++;
	          var maxLength = stream.length;
	          while (stream[this._current] !== "'" && this._current < maxLength) {
	              // You can escape a single quote and you can escape an escape.
	              var current = this._current;
	              if (stream[current] === "\\" && (stream[current + 1] === "\\" ||
	                                               stream[current + 1] === "'")) {
	                  current += 2;
	              } else {
	                  current++;
	              }
	              this._current = current;
	          }
	          this._current++;
	          var literal = stream.slice(start + 1, this._current - 1);
	          return literal.replace("\\'", "'");
	      },

	      _consumeNumber: function(stream) {
	          var start = this._current;
	          this._current++;
	          var maxLength = stream.length;
	          while (isNum(stream[this._current]) && this._current < maxLength) {
	              this._current++;
	          }
	          var value = parseInt(stream.slice(start, this._current));
	          return {type: TOK_NUMBER, value: value, start: start};
	      },

	      _consumeLBracket: function(stream) {
	          var start = this._current;
	          this._current++;
	          if (stream[this._current] === "?") {
	              this._current++;
	              return {type: TOK_FILTER, value: "[?", start: start};
	          } else if (stream[this._current] === "]") {
	              this._current++;
	              return {type: TOK_FLATTEN, value: "[]", start: start};
	          } else {
	              return {type: TOK_LBRACKET, value: "[", start: start};
	          }
	      },

	      _consumeOperator: function(stream) {
	          var start = this._current;
	          var startingChar = stream[start];
	          this._current++;
	          if (startingChar === "!") {
	              if (stream[this._current] === "=") {
	                  this._current++;
	                  return {type: TOK_NE, value: "!=", start: start};
	              } else {
	                return {type: TOK_NOT, value: "!", start: start};
	              }
	          } else if (startingChar === "<") {
	              if (stream[this._current] === "=") {
	                  this._current++;
	                  return {type: TOK_LTE, value: "<=", start: start};
	              } else {
	                  return {type: TOK_LT, value: "<", start: start};
	              }
	          } else if (startingChar === ">") {
	              if (stream[this._current] === "=") {
	                  this._current++;
	                  return {type: TOK_GTE, value: ">=", start: start};
	              } else {
	                  return {type: TOK_GT, value: ">", start: start};
	              }
	          } else if (startingChar === "=") {
	              if (stream[this._current] === "=") {
	                  this._current++;
	                  return {type: TOK_EQ, value: "==", start: start};
	              }
	          }
	      },

	      _consumeLiteral: function(stream) {
	          this._current++;
	          var start = this._current;
	          var maxLength = stream.length;
	          var literal;
	          while(stream[this._current] !== "`" && this._current < maxLength) {
	              // You can escape a literal char or you can escape the escape.
	              var current = this._current;
	              if (stream[current] === "\\" && (stream[current + 1] === "\\" ||
	                                               stream[current + 1] === "`")) {
	                  current += 2;
	              } else {
	                  current++;
	              }
	              this._current = current;
	          }
	          var literalString = trimLeft(stream.slice(start, this._current));
	          literalString = literalString.replace("\\`", "`");
	          if (this._looksLikeJSON(literalString)) {
	              literal = JSON.parse(literalString);
	          } else {
	              // Try to JSON parse it as "<literal>"
	              literal = JSON.parse("\"" + literalString + "\"");
	          }
	          // +1 gets us to the ending "`", +1 to move on to the next char.
	          this._current++;
	          return literal;
	      },

	      _looksLikeJSON: function(literalString) {
	          var startingChars = "[{\"";
	          var jsonLiterals = ["true", "false", "null"];
	          var numberLooking = "-0123456789";

	          if (literalString === "") {
	              return false;
	          } else if (startingChars.indexOf(literalString[0]) >= 0) {
	              return true;
	          } else if (jsonLiterals.indexOf(literalString) >= 0) {
	              return true;
	          } else if (numberLooking.indexOf(literalString[0]) >= 0) {
	              try {
	                  JSON.parse(literalString);
	                  return true;
	              } catch (ex) {
	                  return false;
	              }
	          } else {
	              return false;
	          }
	      }
	  };

	      var bindingPower = {};
	      bindingPower[TOK_EOF] = 0;
	      bindingPower[TOK_UNQUOTEDIDENTIFIER] = 0;
	      bindingPower[TOK_QUOTEDIDENTIFIER] = 0;
	      bindingPower[TOK_RBRACKET] = 0;
	      bindingPower[TOK_RPAREN] = 0;
	      bindingPower[TOK_COMMA] = 0;
	      bindingPower[TOK_RBRACE] = 0;
	      bindingPower[TOK_NUMBER] = 0;
	      bindingPower[TOK_CURRENT] = 0;
	      bindingPower[TOK_EXPREF] = 0;
	      bindingPower[TOK_PIPE] = 1;
	      bindingPower[TOK_OR] = 2;
	      bindingPower[TOK_AND] = 3;
	      bindingPower[TOK_EQ] = 5;
	      bindingPower[TOK_GT] = 5;
	      bindingPower[TOK_LT] = 5;
	      bindingPower[TOK_GTE] = 5;
	      bindingPower[TOK_LTE] = 5;
	      bindingPower[TOK_NE] = 5;
	      bindingPower[TOK_FLATTEN] = 9;
	      bindingPower[TOK_STAR] = 20;
	      bindingPower[TOK_FILTER] = 21;
	      bindingPower[TOK_DOT] = 40;
	      bindingPower[TOK_NOT] = 45;
	      bindingPower[TOK_LBRACE] = 50;
	      bindingPower[TOK_LBRACKET] = 55;
	      bindingPower[TOK_LPAREN] = 60;

	  function Parser() {
	  }

	  Parser.prototype = {
	      parse: function(expression) {
	          this._loadTokens(expression);
	          this.index = 0;
	          var ast = this.expression(0);
	          if (this._lookahead(0) !== TOK_EOF) {
	              var t = this._lookaheadToken(0);
	              var error = new Error(
	                  "Unexpected token type: " + t.type + ", value: " + t.value);
	              error.name = "ParserError";
	              throw error;
	          }
	          return ast;
	      },

	      _loadTokens: function(expression) {
	          var lexer = new Lexer();
	          var tokens = lexer.tokenize(expression);
	          tokens.push({type: TOK_EOF, value: "", start: expression.length});
	          this.tokens = tokens;
	      },

	      expression: function(rbp) {
	          var leftToken = this._lookaheadToken(0);
	          this._advance();
	          var left = this.nud(leftToken);
	          var currentToken = this._lookahead(0);
	          while (rbp < bindingPower[currentToken]) {
	              this._advance();
	              left = this.led(currentToken, left);
	              currentToken = this._lookahead(0);
	          }
	          return left;
	      },

	      _lookahead: function(number) {
	          return this.tokens[this.index + number].type;
	      },

	      _lookaheadToken: function(number) {
	          return this.tokens[this.index + number];
	      },

	      _advance: function() {
	          this.index++;
	      },

	      nud: function(token) {
	        var left;
	        var right;
	        var expression;
	        switch (token.type) {
	          case TOK_LITERAL:
	            return {type: "Literal", value: token.value};
	          case TOK_UNQUOTEDIDENTIFIER:
	            return {type: "Field", name: token.value};
	          case TOK_QUOTEDIDENTIFIER:
	            var node = {type: "Field", name: token.value};
	            if (this._lookahead(0) === TOK_LPAREN) {
	                throw new Error("Quoted identifier not allowed for function names.");
	            } else {
	                return node;
	            }
	            break;
	          case TOK_NOT:
	            right = this.expression(bindingPower.Not);
	            return {type: "NotExpression", children: [right]};
	          case TOK_STAR:
	            left = {type: "Identity"};
	            right = null;
	            if (this._lookahead(0) === TOK_RBRACKET) {
	                // This can happen in a multiselect,
	                // [a, b, *]
	                right = {type: "Identity"};
	            } else {
	                right = this._parseProjectionRHS(bindingPower.Star);
	            }
	            return {type: "ValueProjection", children: [left, right]};
	          case TOK_FILTER:
	            return this.led(token.type, {type: "Identity"});
	          case TOK_LBRACE:
	            return this._parseMultiselectHash();
	          case TOK_FLATTEN:
	            left = {type: TOK_FLATTEN, children: [{type: "Identity"}]};
	            right = this._parseProjectionRHS(bindingPower.Flatten);
	            return {type: "Projection", children: [left, right]};
	          case TOK_LBRACKET:
	            if (this._lookahead(0) === TOK_NUMBER || this._lookahead(0) === TOK_COLON) {
	                right = this._parseIndexExpression();
	                return this._projectIfSlice({type: "Identity"}, right);
	            } else if (this._lookahead(0) === TOK_STAR &&
	                       this._lookahead(1) === TOK_RBRACKET) {
	                this._advance();
	                this._advance();
	                right = this._parseProjectionRHS(bindingPower.Star);
	                return {type: "Projection",
	                        children: [{type: "Identity"}, right]};
	            } else {
	                return this._parseMultiselectList();
	            }
	            break;
	          case TOK_CURRENT:
	            return {type: TOK_CURRENT};
	          case TOK_EXPREF:
	            expression = this.expression(bindingPower.Expref);
	            return {type: "ExpressionReference", children: [expression]};
	          case TOK_LPAREN:
	            var args = [];
	            while (this._lookahead(0) !== TOK_RPAREN) {
	              if (this._lookahead(0) === TOK_CURRENT) {
	                expression = {type: TOK_CURRENT};
	                this._advance();
	              } else {
	                expression = this.expression(0);
	              }
	              args.push(expression);
	            }
	            this._match(TOK_RPAREN);
	            return args[0];
	          default:
	            this._errorToken(token);
	        }
	      },

	      led: function(tokenName, left) {
	        var right;
	        switch(tokenName) {
	          case TOK_DOT:
	            var rbp = bindingPower.Dot;
	            if (this._lookahead(0) !== TOK_STAR) {
	                right = this._parseDotRHS(rbp);
	                return {type: "Subexpression", children: [left, right]};
	            } else {
	                // Creating a projection.
	                this._advance();
	                right = this._parseProjectionRHS(rbp);
	                return {type: "ValueProjection", children: [left, right]};
	            }
	            break;
	          case TOK_PIPE:
	            right = this.expression(bindingPower.Pipe);
	            return {type: TOK_PIPE, children: [left, right]};
	          case TOK_OR:
	            right = this.expression(bindingPower.Or);
	            return {type: "OrExpression", children: [left, right]};
	          case TOK_AND:
	            right = this.expression(bindingPower.And);
	            return {type: "AndExpression", children: [left, right]};
	          case TOK_LPAREN:
	            var name = left.name;
	            var args = [];
	            var expression, node;
	            while (this._lookahead(0) !== TOK_RPAREN) {
	              if (this._lookahead(0) === TOK_CURRENT) {
	                expression = {type: TOK_CURRENT};
	                this._advance();
	              } else {
	                expression = this.expression(0);
	              }
	              if (this._lookahead(0) === TOK_COMMA) {
	                this._match(TOK_COMMA);
	              }
	              args.push(expression);
	            }
	            this._match(TOK_RPAREN);
	            node = {type: "Function", name: name, children: args};
	            return node;
	          case TOK_FILTER:
	            var condition = this.expression(0);
	            this._match(TOK_RBRACKET);
	            if (this._lookahead(0) === TOK_FLATTEN) {
	              right = {type: "Identity"};
	            } else {
	              right = this._parseProjectionRHS(bindingPower.Filter);
	            }
	            return {type: "FilterProjection", children: [left, right, condition]};
	          case TOK_FLATTEN:
	            var leftNode = {type: TOK_FLATTEN, children: [left]};
	            var rightNode = this._parseProjectionRHS(bindingPower.Flatten);
	            return {type: "Projection", children: [leftNode, rightNode]};
	          case TOK_EQ:
	          case TOK_NE:
	          case TOK_GT:
	          case TOK_GTE:
	          case TOK_LT:
	          case TOK_LTE:
	            return this._parseComparator(left, tokenName);
	          case TOK_LBRACKET:
	            var token = this._lookaheadToken(0);
	            if (token.type === TOK_NUMBER || token.type === TOK_COLON) {
	                right = this._parseIndexExpression();
	                return this._projectIfSlice(left, right);
	            } else {
	                this._match(TOK_STAR);
	                this._match(TOK_RBRACKET);
	                right = this._parseProjectionRHS(bindingPower.Star);
	                return {type: "Projection", children: [left, right]};
	            }
	            break;
	          default:
	            this._errorToken(this._lookaheadToken(0));
	        }
	      },

	      _match: function(tokenType) {
	          if (this._lookahead(0) === tokenType) {
	              this._advance();
	          } else {
	              var t = this._lookaheadToken(0);
	              var error = new Error("Expected " + tokenType + ", got: " + t.type);
	              error.name = "ParserError";
	              throw error;
	          }
	      },

	      _errorToken: function(token) {
	          var error = new Error("Invalid token (" +
	                                token.type + "): \"" +
	                                token.value + "\"");
	          error.name = "ParserError";
	          throw error;
	      },


	      _parseIndexExpression: function() {
	          if (this._lookahead(0) === TOK_COLON || this._lookahead(1) === TOK_COLON) {
	              return this._parseSliceExpression();
	          } else {
	              var node = {
	                  type: "Index",
	                  value: this._lookaheadToken(0).value};
	              this._advance();
	              this._match(TOK_RBRACKET);
	              return node;
	          }
	      },

	      _projectIfSlice: function(left, right) {
	          var indexExpr = {type: "IndexExpression", children: [left, right]};
	          if (right.type === "Slice") {
	              return {
	                  type: "Projection",
	                  children: [indexExpr, this._parseProjectionRHS(bindingPower.Star)]
	              };
	          } else {
	              return indexExpr;
	          }
	      },

	      _parseSliceExpression: function() {
	          // [start:end:step] where each part is optional, as well as the last
	          // colon.
	          var parts = [null, null, null];
	          var index = 0;
	          var currentToken = this._lookahead(0);
	          while (currentToken !== TOK_RBRACKET && index < 3) {
	              if (currentToken === TOK_COLON) {
	                  index++;
	                  this._advance();
	              } else if (currentToken === TOK_NUMBER) {
	                  parts[index] = this._lookaheadToken(0).value;
	                  this._advance();
	              } else {
	                  var t = this._lookahead(0);
	                  var error = new Error("Syntax error, unexpected token: " +
	                                        t.value + "(" + t.type + ")");
	                  error.name = "Parsererror";
	                  throw error;
	              }
	              currentToken = this._lookahead(0);
	          }
	          this._match(TOK_RBRACKET);
	          return {
	              type: "Slice",
	              children: parts
	          };
	      },

	      _parseComparator: function(left, comparator) {
	        var right = this.expression(bindingPower[comparator]);
	        return {type: "Comparator", name: comparator, children: [left, right]};
	      },

	      _parseDotRHS: function(rbp) {
	          var lookahead = this._lookahead(0);
	          var exprTokens = [TOK_UNQUOTEDIDENTIFIER, TOK_QUOTEDIDENTIFIER, TOK_STAR];
	          if (exprTokens.indexOf(lookahead) >= 0) {
	              return this.expression(rbp);
	          } else if (lookahead === TOK_LBRACKET) {
	              this._match(TOK_LBRACKET);
	              return this._parseMultiselectList();
	          } else if (lookahead === TOK_LBRACE) {
	              this._match(TOK_LBRACE);
	              return this._parseMultiselectHash();
	          }
	      },

	      _parseProjectionRHS: function(rbp) {
	          var right;
	          if (bindingPower[this._lookahead(0)] < 10) {
	              right = {type: "Identity"};
	          } else if (this._lookahead(0) === TOK_LBRACKET) {
	              right = this.expression(rbp);
	          } else if (this._lookahead(0) === TOK_FILTER) {
	              right = this.expression(rbp);
	          } else if (this._lookahead(0) === TOK_DOT) {
	              this._match(TOK_DOT);
	              right = this._parseDotRHS(rbp);
	          } else {
	              var t = this._lookaheadToken(0);
	              var error = new Error("Sytanx error, unexpected token: " +
	                                    t.value + "(" + t.type + ")");
	              error.name = "ParserError";
	              throw error;
	          }
	          return right;
	      },

	      _parseMultiselectList: function() {
	          var expressions = [];
	          while (this._lookahead(0) !== TOK_RBRACKET) {
	              var expression = this.expression(0);
	              expressions.push(expression);
	              if (this._lookahead(0) === TOK_COMMA) {
	                  this._match(TOK_COMMA);
	                  if (this._lookahead(0) === TOK_RBRACKET) {
	                    throw new Error("Unexpected token Rbracket");
	                  }
	              }
	          }
	          this._match(TOK_RBRACKET);
	          return {type: "MultiSelectList", children: expressions};
	      },

	      _parseMultiselectHash: function() {
	        var pairs = [];
	        var identifierTypes = [TOK_UNQUOTEDIDENTIFIER, TOK_QUOTEDIDENTIFIER];
	        var keyToken, keyName, value, node;
	        for (;;) {
	          keyToken = this._lookaheadToken(0);
	          if (identifierTypes.indexOf(keyToken.type) < 0) {
	            throw new Error("Expecting an identifier token, got: " +
	                            keyToken.type);
	          }
	          keyName = keyToken.value;
	          this._advance();
	          this._match(TOK_COLON);
	          value = this.expression(0);
	          node = {type: "KeyValuePair", name: keyName, value: value};
	          pairs.push(node);
	          if (this._lookahead(0) === TOK_COMMA) {
	            this._match(TOK_COMMA);
	          } else if (this._lookahead(0) === TOK_RBRACE) {
	            this._match(TOK_RBRACE);
	            break;
	          }
	        }
	        return {type: "MultiSelectHash", children: pairs};
	      }
	  };


	  function TreeInterpreter(runtime) {
	    this.runtime = runtime;
	  }

	  TreeInterpreter.prototype = {
	      search: function(node, value) {
	          return this.visit(node, value);
	      },

	      visit: function(node, value) {
	          var matched, current, result, first, second, field, left, right, collected, i;
	          switch (node.type) {
	            case "Field":
	              if (value === null ) {
	                  return null;
	              } else if (isObject(value)) {
	                  field = value[node.name];
	                  if (field === undefined) {
	                      return null;
	                  } else {
	                      return field;
	                  }
	              } else {
	                return null;
	              }
	              break;
	            case "Subexpression":
	              result = this.visit(node.children[0], value);
	              for (i = 1; i < node.children.length; i++) {
	                  result = this.visit(node.children[1], result);
	                  if (result === null) {
	                      return null;
	                  }
	              }
	              return result;
	            case "IndexExpression":
	              left = this.visit(node.children[0], value);
	              right = this.visit(node.children[1], left);
	              return right;
	            case "Index":
	              if (!isArray(value)) {
	                return null;
	              }
	              var index = node.value;
	              if (index < 0) {
	                index = value.length + index;
	              }
	              result = value[index];
	              if (result === undefined) {
	                result = null;
	              }
	              return result;
	            case "Slice":
	              if (!isArray(value)) {
	                return null;
	              }
	              var sliceParams = node.children.slice(0);
	              var computed = this.computeSliceParams(value.length, sliceParams);
	              var start = computed[0];
	              var stop = computed[1];
	              var step = computed[2];
	              result = [];
	              if (step > 0) {
	                  for (i = start; i < stop; i += step) {
	                      result.push(value[i]);
	                  }
	              } else {
	                  for (i = start; i > stop; i += step) {
	                      result.push(value[i]);
	                  }
	              }
	              return result;
	            case "Projection":
	              // Evaluate left child.
	              var base = this.visit(node.children[0], value);
	              if (!isArray(base)) {
	                return null;
	              }
	              collected = [];
	              for (i = 0; i < base.length; i++) {
	                current = this.visit(node.children[1], base[i]);
	                if (current !== null) {
	                  collected.push(current);
	                }
	              }
	              return collected;
	            case "ValueProjection":
	              // Evaluate left child.
	              base = this.visit(node.children[0], value);
	              if (!isObject(base)) {
	                return null;
	              }
	              collected = [];
	              var values = objValues(base);
	              for (i = 0; i < values.length; i++) {
	                current = this.visit(node.children[1], values[i]);
	                if (current !== null) {
	                  collected.push(current);
	                }
	              }
	              return collected;
	            case "FilterProjection":
	              base = this.visit(node.children[0], value);
	              if (!isArray(base)) {
	                return null;
	              }
	              var filtered = [];
	              var finalResults = [];
	              for (i = 0; i < base.length; i++) {
	                matched = this.visit(node.children[2], base[i]);
	                if (!isFalse(matched)) {
	                  filtered.push(base[i]);
	                }
	              }
	              for (var j = 0; j < filtered.length; j++) {
	                current = this.visit(node.children[1], filtered[j]);
	                if (current !== null) {
	                  finalResults.push(current);
	                }
	              }
	              return finalResults;
	            case "Comparator":
	              first = this.visit(node.children[0], value);
	              second = this.visit(node.children[1], value);
	              switch(node.name) {
	                case TOK_EQ:
	                  result = strictDeepEqual(first, second);
	                  break;
	                case TOK_NE:
	                  result = !strictDeepEqual(first, second);
	                  break;
	                case TOK_GT:
	                  result = first > second;
	                  break;
	                case TOK_GTE:
	                  result = first >= second;
	                  break;
	                case TOK_LT:
	                  result = first < second;
	                  break;
	                case TOK_LTE:
	                  result = first <= second;
	                  break;
	                default:
	                  throw new Error("Unknown comparator: " + node.name);
	              }
	              return result;
	            case TOK_FLATTEN:
	              var original = this.visit(node.children[0], value);
	              if (!isArray(original)) {
	                return null;
	              }
	              var merged = [];
	              for (i = 0; i < original.length; i++) {
	                current = original[i];
	                if (isArray(current)) {
	                  merged.push.apply(merged, current);
	                } else {
	                  merged.push(current);
	                }
	              }
	              return merged;
	            case "Identity":
	              return value;
	            case "MultiSelectList":
	              if (value === null) {
	                return null;
	              }
	              collected = [];
	              for (i = 0; i < node.children.length; i++) {
	                  collected.push(this.visit(node.children[i], value));
	              }
	              return collected;
	            case "MultiSelectHash":
	              if (value === null) {
	                return null;
	              }
	              collected = {};
	              var child;
	              for (i = 0; i < node.children.length; i++) {
	                child = node.children[i];
	                collected[child.name] = this.visit(child.value, value);
	              }
	              return collected;
	            case "OrExpression":
	              matched = this.visit(node.children[0], value);
	              if (isFalse(matched)) {
	                  matched = this.visit(node.children[1], value);
	              }
	              return matched;
	            case "AndExpression":
	              first = this.visit(node.children[0], value);

	              if (isFalse(first) === true) {
	                return first;
	              }
	              return this.visit(node.children[1], value);
	            case "NotExpression":
	              first = this.visit(node.children[0], value);
	              return isFalse(first);
	            case "Literal":
	              return node.value;
	            case TOK_PIPE:
	              left = this.visit(node.children[0], value);
	              return this.visit(node.children[1], left);
	            case TOK_CURRENT:
	              return value;
	            case "Function":
	              var resolvedArgs = [];
	              for (i = 0; i < node.children.length; i++) {
	                  resolvedArgs.push(this.visit(node.children[i], value));
	              }
	              return this.runtime.callFunction(node.name, resolvedArgs);
	            case "ExpressionReference":
	              var refNode = node.children[0];
	              // Tag the node with a specific attribute so the type
	              // checker verify the type.
	              refNode.jmespathType = TOK_EXPREF;
	              return refNode;
	            default:
	              throw new Error("Unknown node type: " + node.type);
	          }
	      },

	      computeSliceParams: function(arrayLength, sliceParams) {
	        var start = sliceParams[0];
	        var stop = sliceParams[1];
	        var step = sliceParams[2];
	        var computed = [null, null, null];
	        if (step === null) {
	          step = 1;
	        } else if (step === 0) {
	          var error = new Error("Invalid slice, step cannot be 0");
	          error.name = "RuntimeError";
	          throw error;
	        }
	        var stepValueNegative = step < 0 ? true : false;

	        if (start === null) {
	            start = stepValueNegative ? arrayLength - 1 : 0;
	        } else {
	            start = this.capSliceRange(arrayLength, start, step);
	        }

	        if (stop === null) {
	            stop = stepValueNegative ? -1 : arrayLength;
	        } else {
	            stop = this.capSliceRange(arrayLength, stop, step);
	        }
	        computed[0] = start;
	        computed[1] = stop;
	        computed[2] = step;
	        return computed;
	      },

	      capSliceRange: function(arrayLength, actualValue, step) {
	          if (actualValue < 0) {
	              actualValue += arrayLength;
	              if (actualValue < 0) {
	                  actualValue = step < 0 ? -1 : 0;
	              }
	          } else if (actualValue >= arrayLength) {
	              actualValue = step < 0 ? arrayLength - 1 : arrayLength;
	          }
	          return actualValue;
	      }

	  };

	  function Runtime(interpreter) {
	    this._interpreter = interpreter;
	    this.functionTable = {
	        // name: [function, <signature>]
	        // The <signature> can be:
	        //
	        // {
	        //   args: [[type1, type2], [type1, type2]],
	        //   variadic: true|false
	        // }
	        //
	        // Each arg in the arg list is a list of valid types
	        // (if the function is overloaded and supports multiple
	        // types.  If the type is "any" then no type checking
	        // occurs on the argument.  Variadic is optional
	        // and if not provided is assumed to be false.
	        abs: {_func: this._functionAbs, _signature: [{types: [TYPE_NUMBER]}]},
	        avg: {_func: this._functionAvg, _signature: [{types: [TYPE_ARRAY_NUMBER]}]},
	        ceil: {_func: this._functionCeil, _signature: [{types: [TYPE_NUMBER]}]},
	        contains: {
	            _func: this._functionContains,
	            _signature: [{types: [TYPE_STRING, TYPE_ARRAY]},
	                        {types: [TYPE_ANY]}]},
	        "ends_with": {
	            _func: this._functionEndsWith,
	            _signature: [{types: [TYPE_STRING]}, {types: [TYPE_STRING]}]},
	        floor: {_func: this._functionFloor, _signature: [{types: [TYPE_NUMBER]}]},
	        length: {
	            _func: this._functionLength,
	            _signature: [{types: [TYPE_STRING, TYPE_ARRAY, TYPE_OBJECT]}]},
	        map: {
	            _func: this._functionMap,
	            _signature: [{types: [TYPE_EXPREF]}, {types: [TYPE_ARRAY]}]},
	        max: {
	            _func: this._functionMax,
	            _signature: [{types: [TYPE_ARRAY_NUMBER, TYPE_ARRAY_STRING]}]},
	        "merge": {
	            _func: this._functionMerge,
	            _signature: [{types: [TYPE_OBJECT], variadic: true}]
	        },
	        "max_by": {
	          _func: this._functionMaxBy,
	          _signature: [{types: [TYPE_ARRAY]}, {types: [TYPE_EXPREF]}]
	        },
	        sum: {_func: this._functionSum, _signature: [{types: [TYPE_ARRAY_NUMBER]}]},
	        "starts_with": {
	            _func: this._functionStartsWith,
	            _signature: [{types: [TYPE_STRING]}, {types: [TYPE_STRING]}]},
	        min: {
	            _func: this._functionMin,
	            _signature: [{types: [TYPE_ARRAY_NUMBER, TYPE_ARRAY_STRING]}]},
	        "min_by": {
	          _func: this._functionMinBy,
	          _signature: [{types: [TYPE_ARRAY]}, {types: [TYPE_EXPREF]}]
	        },
	        type: {_func: this._functionType, _signature: [{types: [TYPE_ANY]}]},
	        keys: {_func: this._functionKeys, _signature: [{types: [TYPE_OBJECT]}]},
	        values: {_func: this._functionValues, _signature: [{types: [TYPE_OBJECT]}]},
	        sort: {_func: this._functionSort, _signature: [{types: [TYPE_ARRAY_STRING, TYPE_ARRAY_NUMBER]}]},
	        "sort_by": {
	          _func: this._functionSortBy,
	          _signature: [{types: [TYPE_ARRAY]}, {types: [TYPE_EXPREF]}]
	        },
	        join: {
	            _func: this._functionJoin,
	            _signature: [
	                {types: [TYPE_STRING]},
	                {types: [TYPE_ARRAY_STRING]}
	            ]
	        },
	        reverse: {
	            _func: this._functionReverse,
	            _signature: [{types: [TYPE_STRING, TYPE_ARRAY]}]},
	        "to_array": {_func: this._functionToArray, _signature: [{types: [TYPE_ANY]}]},
	        "to_string": {_func: this._functionToString, _signature: [{types: [TYPE_ANY]}]},
	        "to_number": {_func: this._functionToNumber, _signature: [{types: [TYPE_ANY]}]},
	        "not_null": {
	            _func: this._functionNotNull,
	            _signature: [{types: [TYPE_ANY], variadic: true}]
	        }
	    };
	  }

	  Runtime.prototype = {
	    callFunction: function(name, resolvedArgs) {
	      var functionEntry = this.functionTable[name];
	      if (functionEntry === undefined) {
	          throw new Error("Unknown function: " + name + "()");
	      }
	      this._validateArgs(name, resolvedArgs, functionEntry._signature);
	      return functionEntry._func.call(this, resolvedArgs);
	    },

	    _validateArgs: function(name, args, signature) {
	        // Validating the args requires validating
	        // the correct arity and the correct type of each arg.
	        // If the last argument is declared as variadic, then we need
	        // a minimum number of args to be required.  Otherwise it has to
	        // be an exact amount.
	        var pluralized;
	        if (signature[signature.length - 1].variadic) {
	            if (args.length < signature.length) {
	                pluralized = signature.length === 1 ? " argument" : " arguments";
	                throw new Error("ArgumentError: " + name + "() " +
	                                "takes at least" + signature.length + pluralized +
	                                " but received " + args.length);
	            }
	        } else if (args.length !== signature.length) {
	            pluralized = signature.length === 1 ? " argument" : " arguments";
	            throw new Error("ArgumentError: " + name + "() " +
	                            "takes " + signature.length + pluralized +
	                            " but received " + args.length);
	        }
	        var currentSpec;
	        var actualType;
	        var typeMatched;
	        for (var i = 0; i < signature.length; i++) {
	            typeMatched = false;
	            currentSpec = signature[i].types;
	            actualType = this._getTypeName(args[i]);
	            for (var j = 0; j < currentSpec.length; j++) {
	                if (this._typeMatches(actualType, currentSpec[j], args[i])) {
	                    typeMatched = true;
	                    break;
	                }
	            }
	            if (!typeMatched) {
	                throw new Error("TypeError: " + name + "() " +
	                                "expected argument " + (i + 1) +
	                                " to be type " + currentSpec +
	                                " but received type " + actualType +
	                                " instead.");
	            }
	        }
	    },

	    _typeMatches: function(actual, expected, argValue) {
	        if (expected === TYPE_ANY) {
	            return true;
	        }
	        if (expected === TYPE_ARRAY_STRING ||
	            expected === TYPE_ARRAY_NUMBER ||
	            expected === TYPE_ARRAY) {
	            // The expected type can either just be array,
	            // or it can require a specific subtype (array of numbers).
	            //
	            // The simplest case is if "array" with no subtype is specified.
	            if (expected === TYPE_ARRAY) {
	                return actual === TYPE_ARRAY;
	            } else if (actual === TYPE_ARRAY) {
	                // Otherwise we need to check subtypes.
	                // I think this has potential to be improved.
	                var subtype;
	                if (expected === TYPE_ARRAY_NUMBER) {
	                  subtype = TYPE_NUMBER;
	                } else if (expected === TYPE_ARRAY_STRING) {
	                  subtype = TYPE_STRING;
	                }
	                for (var i = 0; i < argValue.length; i++) {
	                    if (!this._typeMatches(
	                            this._getTypeName(argValue[i]), subtype,
	                                             argValue[i])) {
	                        return false;
	                    }
	                }
	                return true;
	            }
	        } else {
	            return actual === expected;
	        }
	    },
	    _getTypeName: function(obj) {
	        switch (Object.prototype.toString.call(obj)) {
	            case "[object String]":
	              return TYPE_STRING;
	            case "[object Number]":
	              return TYPE_NUMBER;
	            case "[object Array]":
	              return TYPE_ARRAY;
	            case "[object Boolean]":
	              return TYPE_BOOLEAN;
	            case "[object Null]":
	              return TYPE_NULL;
	            case "[object Object]":
	              // Check if it's an expref.  If it has, it's been
	              // tagged with a jmespathType attr of 'Expref';
	              if (obj.jmespathType === TOK_EXPREF) {
	                return TYPE_EXPREF;
	              } else {
	                return TYPE_OBJECT;
	              }
	        }
	    },

	    _functionStartsWith: function(resolvedArgs) {
	        return resolvedArgs[0].lastIndexOf(resolvedArgs[1]) === 0;
	    },

	    _functionEndsWith: function(resolvedArgs) {
	        var searchStr = resolvedArgs[0];
	        var suffix = resolvedArgs[1];
	        return searchStr.indexOf(suffix, searchStr.length - suffix.length) !== -1;
	    },

	    _functionReverse: function(resolvedArgs) {
	        var typeName = this._getTypeName(resolvedArgs[0]);
	        if (typeName === TYPE_STRING) {
	          var originalStr = resolvedArgs[0];
	          var reversedStr = "";
	          for (var i = originalStr.length - 1; i >= 0; i--) {
	              reversedStr += originalStr[i];
	          }
	          return reversedStr;
	        } else {
	          var reversedArray = resolvedArgs[0].slice(0);
	          reversedArray.reverse();
	          return reversedArray;
	        }
	    },

	    _functionAbs: function(resolvedArgs) {
	      return Math.abs(resolvedArgs[0]);
	    },

	    _functionCeil: function(resolvedArgs) {
	        return Math.ceil(resolvedArgs[0]);
	    },

	    _functionAvg: function(resolvedArgs) {
	        var sum = 0;
	        var inputArray = resolvedArgs[0];
	        for (var i = 0; i < inputArray.length; i++) {
	            sum += inputArray[i];
	        }
	        return sum / inputArray.length;
	    },

	    _functionContains: function(resolvedArgs) {
	        return resolvedArgs[0].indexOf(resolvedArgs[1]) >= 0;
	    },

	    _functionFloor: function(resolvedArgs) {
	        return Math.floor(resolvedArgs[0]);
	    },

	    _functionLength: function(resolvedArgs) {
	       if (!isObject(resolvedArgs[0])) {
	         return resolvedArgs[0].length;
	       } else {
	         // As far as I can tell, there's no way to get the length
	         // of an object without O(n) iteration through the object.
	         return Object.keys(resolvedArgs[0]).length;
	       }
	    },

	    _functionMap: function(resolvedArgs) {
	      var mapped = [];
	      var interpreter = this._interpreter;
	      var exprefNode = resolvedArgs[0];
	      var elements = resolvedArgs[1];
	      for (var i = 0; i < elements.length; i++) {
	          mapped.push(interpreter.visit(exprefNode, elements[i]));
	      }
	      return mapped;
	    },

	    _functionMerge: function(resolvedArgs) {
	      var merged = {};
	      for (var i = 0; i < resolvedArgs.length; i++) {
	        var current = resolvedArgs[i];
	        for (var key in current) {
	          merged[key] = current[key];
	        }
	      }
	      return merged;
	    },

	    _functionMax: function(resolvedArgs) {
	      if (resolvedArgs[0].length > 0) {
	        var typeName = this._getTypeName(resolvedArgs[0][0]);
	        if (typeName === TYPE_NUMBER) {
	          return Math.max.apply(Math, resolvedArgs[0]);
	        } else {
	          var elements = resolvedArgs[0];
	          var maxElement = elements[0];
	          for (var i = 1; i < elements.length; i++) {
	              if (maxElement.localeCompare(elements[i]) < 0) {
	                  maxElement = elements[i];
	              }
	          }
	          return maxElement;
	        }
	      } else {
	          return null;
	      }
	    },

	    _functionMin: function(resolvedArgs) {
	      if (resolvedArgs[0].length > 0) {
	        var typeName = this._getTypeName(resolvedArgs[0][0]);
	        if (typeName === TYPE_NUMBER) {
	          return Math.min.apply(Math, resolvedArgs[0]);
	        } else {
	          var elements = resolvedArgs[0];
	          var minElement = elements[0];
	          for (var i = 1; i < elements.length; i++) {
	              if (elements[i].localeCompare(minElement) < 0) {
	                  minElement = elements[i];
	              }
	          }
	          return minElement;
	        }
	      } else {
	        return null;
	      }
	    },

	    _functionSum: function(resolvedArgs) {
	      var sum = 0;
	      var listToSum = resolvedArgs[0];
	      for (var i = 0; i < listToSum.length; i++) {
	        sum += listToSum[i];
	      }
	      return sum;
	    },

	    _functionType: function(resolvedArgs) {
	        switch (this._getTypeName(resolvedArgs[0])) {
	          case TYPE_NUMBER:
	            return "number";
	          case TYPE_STRING:
	            return "string";
	          case TYPE_ARRAY:
	            return "array";
	          case TYPE_OBJECT:
	            return "object";
	          case TYPE_BOOLEAN:
	            return "boolean";
	          case TYPE_EXPREF:
	            return "expref";
	          case TYPE_NULL:
	            return "null";
	        }
	    },

	    _functionKeys: function(resolvedArgs) {
	        return Object.keys(resolvedArgs[0]);
	    },

	    _functionValues: function(resolvedArgs) {
	        var obj = resolvedArgs[0];
	        var keys = Object.keys(obj);
	        var values = [];
	        for (var i = 0; i < keys.length; i++) {
	            values.push(obj[keys[i]]);
	        }
	        return values;
	    },

	    _functionJoin: function(resolvedArgs) {
	        var joinChar = resolvedArgs[0];
	        var listJoin = resolvedArgs[1];
	        return listJoin.join(joinChar);
	    },

	    _functionToArray: function(resolvedArgs) {
	        if (this._getTypeName(resolvedArgs[0]) === TYPE_ARRAY) {
	            return resolvedArgs[0];
	        } else {
	            return [resolvedArgs[0]];
	        }
	    },

	    _functionToString: function(resolvedArgs) {
	        if (this._getTypeName(resolvedArgs[0]) === TYPE_STRING) {
	            return resolvedArgs[0];
	        } else {
	            return JSON.stringify(resolvedArgs[0]);
	        }
	    },

	    _functionToNumber: function(resolvedArgs) {
	        var typeName = this._getTypeName(resolvedArgs[0]);
	        var convertedValue;
	        if (typeName === TYPE_NUMBER) {
	            return resolvedArgs[0];
	        } else if (typeName === TYPE_STRING) {
	            convertedValue = +resolvedArgs[0];
	            if (!isNaN(convertedValue)) {
	                return convertedValue;
	            }
	        }
	        return null;
	    },

	    _functionNotNull: function(resolvedArgs) {
	        for (var i = 0; i < resolvedArgs.length; i++) {
	            if (this._getTypeName(resolvedArgs[i]) !== TYPE_NULL) {
	                return resolvedArgs[i];
	            }
	        }
	        return null;
	    },

	    _functionSort: function(resolvedArgs) {
	        var sortedArray = resolvedArgs[0].slice(0);
	        sortedArray.sort();
	        return sortedArray;
	    },

	    _functionSortBy: function(resolvedArgs) {
	        var sortedArray = resolvedArgs[0].slice(0);
	        if (sortedArray.length === 0) {
	            return sortedArray;
	        }
	        var interpreter = this._interpreter;
	        var exprefNode = resolvedArgs[1];
	        var requiredType = this._getTypeName(
	            interpreter.visit(exprefNode, sortedArray[0]));
	        if ([TYPE_NUMBER, TYPE_STRING].indexOf(requiredType) < 0) {
	            throw new Error("TypeError");
	        }
	        var that = this;
	        // In order to get a stable sort out of an unstable
	        // sort algorithm, we decorate/sort/undecorate (DSU)
	        // by creating a new list of [index, element] pairs.
	        // In the cmp function, if the evaluated elements are
	        // equal, then the index will be used as the tiebreaker.
	        // After the decorated list has been sorted, it will be
	        // undecorated to extract the original elements.
	        var decorated = [];
	        for (var i = 0; i < sortedArray.length; i++) {
	          decorated.push([i, sortedArray[i]]);
	        }
	        decorated.sort(function(a, b) {
	          var exprA = interpreter.visit(exprefNode, a[1]);
	          var exprB = interpreter.visit(exprefNode, b[1]);
	          if (that._getTypeName(exprA) !== requiredType) {
	              throw new Error(
	                  "TypeError: expected " + requiredType + ", received " +
	                  that._getTypeName(exprA));
	          } else if (that._getTypeName(exprB) !== requiredType) {
	              throw new Error(
	                  "TypeError: expected " + requiredType + ", received " +
	                  that._getTypeName(exprB));
	          }
	          if (exprA > exprB) {
	            return 1;
	          } else if (exprA < exprB) {
	            return -1;
	          } else {
	            // If they're equal compare the items by their
	            // order to maintain relative order of equal keys
	            // (i.e. to get a stable sort).
	            return a[0] - b[0];
	          }
	        });
	        // Undecorate: extract out the original list elements.
	        for (var j = 0; j < decorated.length; j++) {
	          sortedArray[j] = decorated[j][1];
	        }
	        return sortedArray;
	    },

	    _functionMaxBy: function(resolvedArgs) {
	      var exprefNode = resolvedArgs[1];
	      var resolvedArray = resolvedArgs[0];
	      var keyFunction = this.createKeyFunction(exprefNode, [TYPE_NUMBER, TYPE_STRING]);
	      var maxNumber = -Infinity;
	      var maxRecord;
	      var current;
	      for (var i = 0; i < resolvedArray.length; i++) {
	        current = keyFunction(resolvedArray[i]);
	        if (current > maxNumber) {
	          maxNumber = current;
	          maxRecord = resolvedArray[i];
	        }
	      }
	      return maxRecord;
	    },

	    _functionMinBy: function(resolvedArgs) {
	      var exprefNode = resolvedArgs[1];
	      var resolvedArray = resolvedArgs[0];
	      var keyFunction = this.createKeyFunction(exprefNode, [TYPE_NUMBER, TYPE_STRING]);
	      var minNumber = Infinity;
	      var minRecord;
	      var current;
	      for (var i = 0; i < resolvedArray.length; i++) {
	        current = keyFunction(resolvedArray[i]);
	        if (current < minNumber) {
	          minNumber = current;
	          minRecord = resolvedArray[i];
	        }
	      }
	      return minRecord;
	    },

	    createKeyFunction: function(exprefNode, allowedTypes) {
	      var that = this;
	      var interpreter = this._interpreter;
	      var keyFunc = function(x) {
	        var current = interpreter.visit(exprefNode, x);
	        if (allowedTypes.indexOf(that._getTypeName(current)) < 0) {
	          var msg = "TypeError: expected one of " + allowedTypes +
	                    ", received " + that._getTypeName(current);
	          throw new Error(msg);
	        }
	        return current;
	      };
	      return keyFunc;
	    }

	  };

	  function compile(stream) {
	    var parser = new Parser();
	    var ast = parser.parse(stream);
	    return ast;
	  }

	  function tokenize(stream) {
	      var lexer = new Lexer();
	      return lexer.tokenize(stream);
	  }

	  function search(data, expression) {
	      var parser = new Parser();
	      // This needs to be improved.  Both the interpreter and runtime depend on
	      // each other.  The runtime needs the interpreter to support exprefs.
	      // There's likely a clean way to avoid the cyclic dependency.
	      var runtime = new Runtime();
	      var interpreter = new TreeInterpreter(runtime);
	      runtime._interpreter = interpreter;
	      var node = parser.parse(expression);
	      return interpreter.search(node, data);
	  }

	  exports.tokenize = tokenize;
	  exports.compile = compile;
	  exports.search = search;
	  exports.strictDeepEqual = strictDeepEqual;
	})( false ? this.jmespath = {} : exports);


/***/ },
/* 113 */
/***/ function(module, exports, __webpack_require__) {

	var AWS = __webpack_require__(5);
	var inherit = AWS.util.inherit;
	var jmespath = __webpack_require__(112);

	/**
	 * This class encapsulates the response information
	 * from a service request operation sent through {AWS.Request}.
	 * The response object has two main properties for getting information
	 * back from a request:
	 *
	 * ## The `data` property
	 *
	 * The `response.data` property contains the serialized object data
	 * retrieved from the service request. For instance, for an
	 * Amazon DynamoDB `listTables` method call, the response data might
	 * look like:
	 *
	 * ```
	 * > resp.data
	 * { TableNames:
	 *    [ 'table1', 'table2', ... ] }
	 * ```
	 *
	 * The `data` property can be null if an error occurs (see below).
	 *
	 * ## The `error` property
	 *
	 * In the event of a service error (or transfer error), the
	 * `response.error` property will be filled with the given
	 * error data in the form:
	 *
	 * ```
	 * { code: 'SHORT_UNIQUE_ERROR_CODE',
	 *   message: 'Some human readable error message' }
	 * ```
	 *
	 * In the case of an error, the `data` property will be `null`.
	 * Note that if you handle events that can be in a failure state,
	 * you should always check whether `response.error` is set
	 * before attempting to access the `response.data` property.
	 *
	 * @!attribute data
	 *   @readonly
	 *   @!group Data Properties
	 *   @note Inside of a {AWS.Request~httpData} event, this
	 *     property contains a single raw packet instead of the
	 *     full de-serialized service response.
	 *   @return [Object] the de-serialized response data
	 *     from the service.
	 *
	 * @!attribute error
	 *   An structure containing information about a service
	 *   or networking error.
	 *   @readonly
	 *   @!group Data Properties
	 *   @note This attribute is only filled if a service or
	 *     networking error occurs.
	 *   @return [Error]
	 *     * code [String] a unique short code representing the
	 *       error that was emitted.
	 *     * message [String] a longer human readable error message
	 *     * retryable [Boolean] whether the error message is
	 *       retryable.
	 *     * statusCode [Numeric] in the case of a request that reached the service,
	 *       this value contains the response status code.
	 *     * time [Date] the date time object when the error occurred.
	 *     * hostname [String] set when a networking error occurs to easily
	 *       identify the endpoint of the request.
	 *     * region [String] set when a networking error occurs to easily
	 *       identify the region of the request.
	 *
	 * @!attribute requestId
	 *   @readonly
	 *   @!group Data Properties
	 *   @return [String] the unique request ID associated with the response.
	 *     Log this value when debugging requests for AWS support.
	 *
	 * @!attribute retryCount
	 *   @readonly
	 *   @!group Operation Properties
	 *   @return [Integer] the number of retries that were
	 *     attempted before the request was completed.
	 *
	 * @!attribute redirectCount
	 *   @readonly
	 *   @!group Operation Properties
	 *   @return [Integer] the number of redirects that were
	 *     followed before the request was completed.
	 *
	 * @!attribute httpResponse
	 *   @readonly
	 *   @!group HTTP Properties
	 *   @return [AWS.HttpResponse] the raw HTTP response object
	 *     containing the response headers and body information
	 *     from the server.
	 *
	 * @see AWS.Request
	 */
	AWS.Response = inherit({

	  /**
	   * @api private
	   */
	  constructor: function Response(request) {
	    this.request = request;
	    this.data = null;
	    this.error = null;
	    this.retryCount = 0;
	    this.redirectCount = 0;
	    this.httpResponse = new AWS.HttpResponse();
	    if (request) {
	      this.maxRetries = request.service.numRetries();
	      this.maxRedirects = request.service.config.maxRedirects;
	    }
	  },

	  /**
	   * Creates a new request for the next page of response data, calling the
	   * callback with the page data if a callback is provided.
	   *
	   * @callback callback function(err, data)
	   *   Called when a page of data is returned from the next request.
	   *
	   *   @param err [Error] an error object, if an error occurred in the request
	   *   @param data [Object] the next page of data, or null, if there are no
	   *     more pages left.
	   * @return [AWS.Request] the request object for the next page of data
	   * @return [null] if no callback is provided and there are no pages left
	   *   to retrieve.
	   * @since v1.4.0
	   */
	  nextPage: function nextPage(callback) {
	    var config;
	    var service = this.request.service;
	    var operation = this.request.operation;
	    try {
	      config = service.paginationConfig(operation, true);
	    } catch (e) { this.error = e; }

	    if (!this.hasNextPage()) {
	      if (callback) callback(this.error, null);
	      else if (this.error) throw this.error;
	      return null;
	    }

	    var params = AWS.util.copy(this.request.params);
	    if (!this.nextPageTokens) {
	      return callback ? callback(null, null) : null;
	    } else {
	      var inputTokens = config.inputToken;
	      if (typeof inputTokens === 'string') inputTokens = [inputTokens];
	      for (var i = 0; i < inputTokens.length; i++) {
	        params[inputTokens[i]] = this.nextPageTokens[i];
	      }
	      return service.makeRequest(this.request.operation, params, callback);
	    }
	  },

	  /**
	   * @return [Boolean] whether more pages of data can be returned by further
	   *   requests
	   * @since v1.4.0
	   */
	  hasNextPage: function hasNextPage() {
	    this.cacheNextPageTokens();
	    if (this.nextPageTokens) return true;
	    if (this.nextPageTokens === undefined) return undefined;
	    else return false;
	  },

	  /**
	   * @api private
	   */
	  cacheNextPageTokens: function cacheNextPageTokens() {
	    if (Object.prototype.hasOwnProperty.call(this, 'nextPageTokens')) return this.nextPageTokens;
	    this.nextPageTokens = undefined;

	    var config = this.request.service.paginationConfig(this.request.operation);
	    if (!config) return this.nextPageTokens;

	    this.nextPageTokens = null;
	    if (config.moreResults) {
	      if (!jmespath.search(this.data, config.moreResults)) {
	        return this.nextPageTokens;
	      }
	    }

	    var exprs = config.outputToken;
	    if (typeof exprs === 'string') exprs = [exprs];
	    AWS.util.arrayEach.call(this, exprs, function (expr) {
	      var output = jmespath.search(this.data, expr);
	      if (output) {
	        this.nextPageTokens = this.nextPageTokens || [];
	        this.nextPageTokens.push(output);
	      }
	    });

	    return this.nextPageTokens;
	  }

	});


/***/ },
/* 114 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright 2012-2013 Amazon.com, Inc. or its affiliates. All Rights Reserved.
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License"). You
	 * may not use this file except in compliance with the License. A copy of
	 * the License is located at
	 *
	 *     http://aws.amazon.com/apache2.0/
	 *
	 * or in the "license" file accompanying this file. This file is
	 * distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF
	 * ANY KIND, either express or implied. See the License for the specific
	 * language governing permissions and limitations under the License.
	 */

	var AWS = __webpack_require__(5);
	var inherit = AWS.util.inherit;
	var jmespath = __webpack_require__(112);

	/**
	 * @api private
	 */
	function CHECK_ACCEPTORS(resp) {
	  var waiter = resp.request._waiter;
	  var acceptors = waiter.config.acceptors;
	  var acceptorMatched = false;
	  var state = 'retry';

	  acceptors.forEach(function(acceptor) {
	    if (!acceptorMatched) {
	      var matcher = waiter.matchers[acceptor.matcher];
	      if (matcher && matcher(resp, acceptor.expected, acceptor.argument)) {
	        acceptorMatched = true;
	        state = acceptor.state;
	      }
	    }
	  });

	  if (!acceptorMatched && resp.error) state = 'failure';

	  if (state === 'success') {
	    waiter.setSuccess(resp);
	  } else {
	    waiter.setError(resp, state === 'retry');
	  }
	}

	/**
	 * @api private
	 */
	AWS.ResourceWaiter = inherit({
	  /**
	   * Waits for a given state on a service object
	   * @param service [Service] the service object to wait on
	   * @param state [String] the state (defined in waiter configuration) to wait
	   *   for.
	   * @example Create a waiter for running EC2 instances
	   *   var ec2 = new AWS.EC2;
	   *   var waiter = new AWS.ResourceWaiter(ec2, 'instanceRunning');
	   */
	  constructor: function constructor(service, state) {
	    this.service = service;
	    this.state = state;
	    this.loadWaiterConfig(this.state);
	  },

	  service: null,

	  state: null,

	  config: null,

	  matchers: {
	    path: function(resp, expected, argument) {
	      var result = jmespath.search(resp.data, argument);
	      return jmespath.strictDeepEqual(result,expected);
	    },

	    pathAll: function(resp, expected, argument) {
	      var results = jmespath.search(resp.data, argument);
	      if (!Array.isArray(results)) results = [results];
	      var numResults = results.length;
	      if (!numResults) return false;
	      for (var ind = 0 ; ind < numResults; ind++) {
	        if (!jmespath.strictDeepEqual(results[ind], expected)) {
	          return false;
	        }
	      }
	      return true;
	    },

	    pathAny: function(resp, expected, argument) {
	      var results = jmespath.search(resp.data, argument);
	      if (!Array.isArray(results)) results = [results];
	      var numResults = results.length;
	      for (var ind = 0 ; ind < numResults; ind++) {
	        if (jmespath.strictDeepEqual(results[ind], expected)) {
	          return true;
	        }
	      }
	      return false;
	    },

	    status: function(resp, expected) {
	      var statusCode = resp.httpResponse.statusCode;
	      return (typeof statusCode === 'number') && (statusCode === expected);
	    },

	    error: function(resp, expected) {
	      if (typeof expected === 'string' && resp.error) {
	        return expected === resp.error.code;
	      }
	      // if expected is not string, can be boolean indicating presence of error
	      return expected === !!resp.error;
	    }
	  },

	  listeners: new AWS.SequentialExecutor().addNamedListeners(function(add) {
	    add('RETRY_CHECK', 'retry', function(resp) {
	      var waiter = resp.request._waiter;
	      if (resp.error && resp.error.code === 'ResourceNotReady') {
	        resp.error.retryDelay = (waiter.config.delay || 0) * 1000;
	      }
	    });

	    add('CHECK_OUTPUT', 'extractData', CHECK_ACCEPTORS);

	    add('CHECK_ERROR', 'extractError', CHECK_ACCEPTORS);
	  }),

	  /**
	   * @return [AWS.Request]
	   */
	  wait: function wait(params, callback) {
	    if (typeof params === 'function') {
	      callback = params; params = undefined;
	    }

	    var request = this.service.makeRequest(this.config.operation, params);
	    request._waiter = this;
	    request.response.maxRetries = this.config.maxAttempts;
	    request.addListeners(this.listeners);

	    if (callback) request.send(callback);
	    return request;
	  },

	  setSuccess: function setSuccess(resp) {
	    resp.error = null;
	    resp.data = resp.data || {};
	    resp.request.removeAllListeners('extractData');
	  },

	  setError: function setError(resp, retryable) {
	    resp.data = null;
	    resp.error = AWS.util.error(resp.error || new Error(), {
	      code: 'ResourceNotReady',
	      message: 'Resource is not in the state ' + this.state,
	      retryable: retryable
	    });
	  },

	  /**
	   * Loads waiter configuration from API configuration
	   *
	   * @api private
	   */
	  loadWaiterConfig: function loadWaiterConfig(state) {
	    if (!this.service.api.waiters[state]) {
	      throw new AWS.util.error(new Error(), {
	        code: 'StateNotFoundError',
	        message: 'State ' + state + ' not found.'
	      });
	    }

	    this.config = this.service.api.waiters[state];
	  }
	});


/***/ },
/* 115 */
/***/ function(module, exports, __webpack_require__) {

	var AWS = __webpack_require__(5);
	var inherit = AWS.util.inherit;

	/**
	 * @api private
	 */
	AWS.Signers.RequestSigner = inherit({
	  constructor: function RequestSigner(request) {
	    this.request = request;
	  },

	  setServiceClientId: function setServiceClientId(id) {
	    this.serviceClientId = id;
	  },

	  getServiceClientId: function getServiceClientId() {
	    return this.serviceClientId;
	  }
	});

	AWS.Signers.RequestSigner.getVersion = function getVersion(version) {
	  switch (version) {
	    case 'v2': return AWS.Signers.V2;
	    case 'v3': return AWS.Signers.V3;
	    case 'v4': return AWS.Signers.V4;
	    case 's3': return AWS.Signers.S3;
	    case 'v3https': return AWS.Signers.V3Https;
	  }
	  throw new Error('Unknown signing version ' + version);
	};

	__webpack_require__(116);
	__webpack_require__(117);
	__webpack_require__(118);
	__webpack_require__(119);
	__webpack_require__(120);
	__webpack_require__(121);


/***/ },
/* 116 */
/***/ function(module, exports, __webpack_require__) {

	var AWS = __webpack_require__(5);
	var inherit = AWS.util.inherit;

	/**
	 * @api private
	 */
	AWS.Signers.V2 = inherit(AWS.Signers.RequestSigner, {
	  addAuthorization: function addAuthorization(credentials, date) {

	    if (!date) date = AWS.util.date.getDate();

	    var r = this.request;

	    r.params.Timestamp = AWS.util.date.iso8601(date);
	    r.params.SignatureVersion = '2';
	    r.params.SignatureMethod = 'HmacSHA256';
	    r.params.AWSAccessKeyId = credentials.accessKeyId;

	    if (credentials.sessionToken) {
	      r.params.SecurityToken = credentials.sessionToken;
	    }

	    delete r.params.Signature; // delete old Signature for re-signing
	    r.params.Signature = this.signature(credentials);

	    r.body = AWS.util.queryParamsToString(r.params);
	    r.headers['Content-Length'] = r.body.length;
	  },

	  signature: function signature(credentials) {
	    return AWS.util.crypto.hmac(credentials.secretAccessKey, this.stringToSign(), 'base64');
	  },

	  stringToSign: function stringToSign() {
	    var parts = [];
	    parts.push(this.request.method);
	    parts.push(this.request.endpoint.host.toLowerCase());
	    parts.push(this.request.pathname());
	    parts.push(AWS.util.queryParamsToString(this.request.params));
	    return parts.join('\n');
	  }

	});

	module.exports = AWS.Signers.V2;


/***/ },
/* 117 */
/***/ function(module, exports, __webpack_require__) {

	var AWS = __webpack_require__(5);
	var inherit = AWS.util.inherit;

	/**
	 * @api private
	 */
	AWS.Signers.V3 = inherit(AWS.Signers.RequestSigner, {
	  addAuthorization: function addAuthorization(credentials, date) {

	    var datetime = AWS.util.date.rfc822(date);

	    this.request.headers['X-Amz-Date'] = datetime;

	    if (credentials.sessionToken) {
	      this.request.headers['x-amz-security-token'] = credentials.sessionToken;
	    }

	    this.request.headers['X-Amzn-Authorization'] =
	      this.authorization(credentials, datetime);

	  },

	  authorization: function authorization(credentials) {
	    return 'AWS3 ' +
	      'AWSAccessKeyId=' + credentials.accessKeyId + ',' +
	      'Algorithm=HmacSHA256,' +
	      'SignedHeaders=' + this.signedHeaders() + ',' +
	      'Signature=' + this.signature(credentials);
	  },

	  signedHeaders: function signedHeaders() {
	    var headers = [];
	    AWS.util.arrayEach(this.headersToSign(), function iterator(h) {
	      headers.push(h.toLowerCase());
	    });
	    return headers.sort().join(';');
	  },

	  canonicalHeaders: function canonicalHeaders() {
	    var headers = this.request.headers;
	    var parts = [];
	    AWS.util.arrayEach(this.headersToSign(), function iterator(h) {
	      parts.push(h.toLowerCase().trim() + ':' + String(headers[h]).trim());
	    });
	    return parts.sort().join('\n') + '\n';
	  },

	  headersToSign: function headersToSign() {
	    var headers = [];
	    AWS.util.each(this.request.headers, function iterator(k) {
	      if (k === 'Host' || k === 'Content-Encoding' || k.match(/^X-Amz/i)) {
	        headers.push(k);
	      }
	    });
	    return headers;
	  },

	  signature: function signature(credentials) {
	    return AWS.util.crypto.hmac(credentials.secretAccessKey, this.stringToSign(), 'base64');
	  },

	  stringToSign: function stringToSign() {
	    var parts = [];
	    parts.push(this.request.method);
	    parts.push('/');
	    parts.push('');
	    parts.push(this.canonicalHeaders());
	    parts.push(this.request.body);
	    return AWS.util.crypto.sha256(parts.join('\n'));
	  }

	});

	module.exports = AWS.Signers.V3;


/***/ },
/* 118 */
/***/ function(module, exports, __webpack_require__) {

	var AWS = __webpack_require__(5);
	var inherit = AWS.util.inherit;

	__webpack_require__(117);

	/**
	 * @api private
	 */
	AWS.Signers.V3Https = inherit(AWS.Signers.V3, {
	  authorization: function authorization(credentials) {
	    return 'AWS3-HTTPS ' +
	      'AWSAccessKeyId=' + credentials.accessKeyId + ',' +
	      'Algorithm=HmacSHA256,' +
	      'Signature=' + this.signature(credentials);
	  },

	  stringToSign: function stringToSign() {
	    return this.request.headers['X-Amz-Date'];
	  }
	});

	module.exports = AWS.Signers.V3Https;


/***/ },
/* 119 */
/***/ function(module, exports, __webpack_require__) {

	var AWS = __webpack_require__(5);
	var inherit = AWS.util.inherit;

	/**
	 * @api private
	 */
	var cachedSecret = {};

	/**
	 * @api private
	 */
	var cacheQueue = [];

	/**
	 * @api private
	 */
	var maxCacheEntries = 50;

	/**
	 * @api private
	 */
	var expiresHeader = 'presigned-expires';

	/**
	 * @api private
	 */
	AWS.Signers.V4 = inherit(AWS.Signers.RequestSigner, {
	  constructor: function V4(request, serviceName, signatureCache) {
	    AWS.Signers.RequestSigner.call(this, request);
	    this.serviceName = serviceName;
	    this.signatureCache = signatureCache;
	  },

	  algorithm: 'AWS4-HMAC-SHA256',

	  addAuthorization: function addAuthorization(credentials, date) {
	    var datetime = AWS.util.date.iso8601(date).replace(/[:\-]|\.\d{3}/g, '');

	    if (this.isPresigned()) {
	      this.updateForPresigned(credentials, datetime);
	    } else {
	      this.addHeaders(credentials, datetime);
	    }

	    this.request.headers['Authorization'] =
	      this.authorization(credentials, datetime);
	  },

	  addHeaders: function addHeaders(credentials, datetime) {
	    this.request.headers['X-Amz-Date'] = datetime;
	    if (credentials.sessionToken) {
	      this.request.headers['x-amz-security-token'] = credentials.sessionToken;
	    }
	  },

	  updateForPresigned: function updateForPresigned(credentials, datetime) {
	    var credString = this.credentialString(datetime);
	    var qs = {
	      'X-Amz-Date': datetime,
	      'X-Amz-Algorithm': this.algorithm,
	      'X-Amz-Credential': credentials.accessKeyId + '/' + credString,
	      'X-Amz-Expires': this.request.headers[expiresHeader],
	      'X-Amz-SignedHeaders': this.signedHeaders()
	    };

	    if (credentials.sessionToken) {
	      qs['X-Amz-Security-Token'] = credentials.sessionToken;
	    }

	    if (this.request.headers['Content-Type']) {
	      qs['Content-Type'] = this.request.headers['Content-Type'];
	    }
	    if (this.request.headers['Content-MD5']) {
	      qs['Content-MD5'] = this.request.headers['Content-MD5'];
	    }
	    if (this.request.headers['Cache-Control']) {
	      qs['Cache-Control'] = this.request.headers['Cache-Control'];
	    }

	    // need to pull in any other X-Amz-* headers
	    AWS.util.each.call(this, this.request.headers, function(key, value) {
	      if (key === expiresHeader) return;
	      if (this.isSignableHeader(key)) {
	        var lowerKey = key.toLowerCase();
	        // Metadata should be normalized
	        if (lowerKey.indexOf('x-amz-meta-') === 0) {
	          qs[lowerKey] = value;
	        } else if (lowerKey.indexOf('x-amz-') === 0) {
	          qs[key] = value;
	        }
	      }
	    });

	    var sep = this.request.path.indexOf('?') >= 0 ? '&' : '?';
	    this.request.path += sep + AWS.util.queryParamsToString(qs);
	  },

	  authorization: function authorization(credentials, datetime) {
	    var parts = [];
	    var credString = this.credentialString(datetime);
	    parts.push(this.algorithm + ' Credential=' +
	      credentials.accessKeyId + '/' + credString);
	    parts.push('SignedHeaders=' + this.signedHeaders());
	    parts.push('Signature=' + this.signature(credentials, datetime));
	    return parts.join(', ');
	  },

	  signature: function signature(credentials, datetime) {
	    var cache = null;
	    var cacheIdentifier = this.serviceName + (this.getServiceClientId() ? '_' + this.getServiceClientId() : '');
	    if (this.signatureCache) {
	      var cache = cachedSecret[cacheIdentifier];
	      // If there isn't already a cache entry, we'll be adding one
	      if (!cache) {
	        cacheQueue.push(cacheIdentifier);
	        if (cacheQueue.length > maxCacheEntries) {
	          // remove the oldest entry (may not be last one used)
	          delete cachedSecret[cacheQueue.shift()];
	        }
	      }

	    }
	    var date = datetime.substr(0, 8);

	    if (!cache ||
	        cache.akid !== credentials.accessKeyId ||
	        cache.region !== this.request.region ||
	        cache.date !== date) {

	      var kSecret = credentials.secretAccessKey;
	      var kDate = AWS.util.crypto.hmac('AWS4' + kSecret, date, 'buffer');
	      var kRegion = AWS.util.crypto.hmac(kDate, this.request.region, 'buffer');
	      var kService = AWS.util.crypto.hmac(kRegion, this.serviceName, 'buffer');
	      var kCredentials = AWS.util.crypto.hmac(kService, 'aws4_request', 'buffer');

	      if (!this.signatureCache) {
	        return AWS.util.crypto.hmac(kCredentials, this.stringToSign(datetime), 'hex');
	      }

	      cachedSecret[cacheIdentifier] = {
	        region: this.request.region, date: date,
	        key: kCredentials, akid: credentials.accessKeyId
	      };
	    }

	    var key = cachedSecret[cacheIdentifier].key;
	    return AWS.util.crypto.hmac(key, this.stringToSign(datetime), 'hex');
	  },

	  stringToSign: function stringToSign(datetime) {
	    var parts = [];
	    parts.push('AWS4-HMAC-SHA256');
	    parts.push(datetime);
	    parts.push(this.credentialString(datetime));
	    parts.push(this.hexEncodedHash(this.canonicalString()));
	    return parts.join('\n');
	  },

	  canonicalString: function canonicalString() {
	    var parts = [], pathname = this.request.pathname();
	    if (this.serviceName !== 's3') pathname = AWS.util.uriEscapePath(pathname);

	    parts.push(this.request.method);
	    parts.push(pathname);
	    parts.push(this.request.search());
	    parts.push(this.canonicalHeaders() + '\n');
	    parts.push(this.signedHeaders());
	    parts.push(this.hexEncodedBodyHash());
	    return parts.join('\n');
	  },

	  canonicalHeaders: function canonicalHeaders() {
	    var headers = [];
	    AWS.util.each.call(this, this.request.headers, function (key, item) {
	      headers.push([key, item]);
	    });
	    headers.sort(function (a, b) {
	      return a[0].toLowerCase() < b[0].toLowerCase() ? -1 : 1;
	    });
	    var parts = [];
	    AWS.util.arrayEach.call(this, headers, function (item) {
	      var key = item[0].toLowerCase();
	      if (this.isSignableHeader(key)) {
	        parts.push(key + ':' +
	          this.canonicalHeaderValues(item[1].toString()));
	      }
	    });
	    return parts.join('\n');
	  },

	  canonicalHeaderValues: function canonicalHeaderValues(values) {
	    return values.replace(/\s+/g, ' ').replace(/^\s+|\s+$/g, '');
	  },

	  signedHeaders: function signedHeaders() {
	    var keys = [];
	    AWS.util.each.call(this, this.request.headers, function (key) {
	      key = key.toLowerCase();
	      if (this.isSignableHeader(key)) keys.push(key);
	    });
	    return keys.sort().join(';');
	  },

	  credentialString: function credentialString(datetime) {
	    var parts = [];
	    parts.push(datetime.substr(0, 8));
	    parts.push(this.request.region);
	    parts.push(this.serviceName);
	    parts.push('aws4_request');
	    return parts.join('/');
	  },

	  hexEncodedHash: function hash(string) {
	    return AWS.util.crypto.sha256(string, 'hex');
	  },

	  hexEncodedBodyHash: function hexEncodedBodyHash() {
	    if (this.isPresigned() && this.serviceName === 's3' && !this.request.body) {
	      return 'UNSIGNED-PAYLOAD';
	    } else if (this.request.headers['X-Amz-Content-Sha256']) {
	      return this.request.headers['X-Amz-Content-Sha256'];
	    } else {
	      return this.hexEncodedHash(this.request.body || '');
	    }
	  },

	  unsignableHeaders: [
	    'authorization',
	    'content-type',
	    'content-length',
	    'user-agent',
	    expiresHeader,
	    'expect',
	    'x-amzn-trace-id'
	  ],

	  isSignableHeader: function isSignableHeader(key) {
	    if (key.toLowerCase().indexOf('x-amz-') === 0) return true;
	    return this.unsignableHeaders.indexOf(key) < 0;
	  },

	  isPresigned: function isPresigned() {
	    return this.request.headers[expiresHeader] ? true : false;
	  }

	});

	module.exports = AWS.Signers.V4;


/***/ },
/* 120 */
/***/ function(module, exports, __webpack_require__) {

	var AWS = __webpack_require__(5);
	var inherit = AWS.util.inherit;

	/**
	 * @api private
	 */
	AWS.Signers.S3 = inherit(AWS.Signers.RequestSigner, {
	  /**
	   * When building the stringToSign, these sub resource params should be
	   * part of the canonical resource string with their NON-decoded values
	   */
	  subResources: {
	    'acl': 1,
	    'accelerate': 1,
	    'analytics': 1,
	    'cors': 1,
	    'lifecycle': 1,
	    'delete': 1,
	    'inventory': 1,
	    'location': 1,
	    'logging': 1,
	    'metrics': 1,
	    'notification': 1,
	    'partNumber': 1,
	    'policy': 1,
	    'requestPayment': 1,
	    'replication': 1,
	    'restore': 1,
	    'tagging': 1,
	    'torrent': 1,
	    'uploadId': 1,
	    'uploads': 1,
	    'versionId': 1,
	    'versioning': 1,
	    'versions': 1,
	    'website': 1
	  },

	  // when building the stringToSign, these querystring params should be
	  // part of the canonical resource string with their NON-encoded values
	  responseHeaders: {
	    'response-content-type': 1,
	    'response-content-language': 1,
	    'response-expires': 1,
	    'response-cache-control': 1,
	    'response-content-disposition': 1,
	    'response-content-encoding': 1
	  },

	  addAuthorization: function addAuthorization(credentials, date) {
	    if (!this.request.headers['presigned-expires']) {
	      this.request.headers['X-Amz-Date'] = AWS.util.date.rfc822(date);
	    }

	    if (credentials.sessionToken) {
	      // presigned URLs require this header to be lowercased
	      this.request.headers['x-amz-security-token'] = credentials.sessionToken;
	    }

	    var signature = this.sign(credentials.secretAccessKey, this.stringToSign());
	    var auth = 'AWS ' + credentials.accessKeyId + ':' + signature;

	    this.request.headers['Authorization'] = auth;
	  },

	  stringToSign: function stringToSign() {
	    var r = this.request;

	    var parts = [];
	    parts.push(r.method);
	    parts.push(r.headers['Content-MD5'] || '');
	    parts.push(r.headers['Content-Type'] || '');

	    // This is the "Date" header, but we use X-Amz-Date.
	    // The S3 signing mechanism requires us to pass an empty
	    // string for this Date header regardless.
	    parts.push(r.headers['presigned-expires'] || '');

	    var headers = this.canonicalizedAmzHeaders();
	    if (headers) parts.push(headers);
	    parts.push(this.canonicalizedResource());

	    return parts.join('\n');

	  },

	  canonicalizedAmzHeaders: function canonicalizedAmzHeaders() {

	    var amzHeaders = [];

	    AWS.util.each(this.request.headers, function (name) {
	      if (name.match(/^x-amz-/i))
	        amzHeaders.push(name);
	    });

	    amzHeaders.sort(function (a, b) {
	      return a.toLowerCase() < b.toLowerCase() ? -1 : 1;
	    });

	    var parts = [];
	    AWS.util.arrayEach.call(this, amzHeaders, function (name) {
	      parts.push(name.toLowerCase() + ':' + String(this.request.headers[name]));
	    });

	    return parts.join('\n');

	  },

	  canonicalizedResource: function canonicalizedResource() {

	    var r = this.request;

	    var parts = r.path.split('?');
	    var path = parts[0];
	    var querystring = parts[1];

	    var resource = '';

	    if (r.virtualHostedBucket)
	      resource += '/' + r.virtualHostedBucket;

	    resource += path;

	    if (querystring) {

	      // collect a list of sub resources and query params that need to be signed
	      var resources = [];

	      AWS.util.arrayEach.call(this, querystring.split('&'), function (param) {
	        var name = param.split('=')[0];
	        var value = param.split('=')[1];
	        if (this.subResources[name] || this.responseHeaders[name]) {
	          var subresource = { name: name };
	          if (value !== undefined) {
	            if (this.subResources[name]) {
	              subresource.value = value;
	            } else {
	              subresource.value = decodeURIComponent(value);
	            }
	          }
	          resources.push(subresource);
	        }
	      });

	      resources.sort(function (a, b) { return a.name < b.name ? -1 : 1; });

	      if (resources.length) {

	        querystring = [];
	        AWS.util.arrayEach(resources, function (res) {
	          if (res.value === undefined) {
	            querystring.push(res.name);
	          } else {
	            querystring.push(res.name + '=' + res.value);
	          }
	        });

	        resource += '?' + querystring.join('&');
	      }

	    }

	    return resource;

	  },

	  sign: function sign(secret, string) {
	    return AWS.util.crypto.hmac(secret, string, 'base64', 'sha1');
	  }
	});

	module.exports = AWS.Signers.S3;


/***/ },
/* 121 */
/***/ function(module, exports, __webpack_require__) {

	var AWS = __webpack_require__(5);
	var inherit = AWS.util.inherit;

	/**
	 * @api private
	 */
	var expiresHeader = 'presigned-expires';

	/**
	 * @api private
	 */
	function signedUrlBuilder(request) {
	  var expires = request.httpRequest.headers[expiresHeader];
	  var signerClass = request.service.getSignerClass(request);

	  delete request.httpRequest.headers['User-Agent'];
	  delete request.httpRequest.headers['X-Amz-User-Agent'];

	  if (signerClass === AWS.Signers.V4) {
	    if (expires > 604800) { // one week expiry is invalid
	      var message = 'Presigning does not support expiry time greater ' +
	                    'than a week with SigV4 signing.';
	      throw AWS.util.error(new Error(), {
	        code: 'InvalidExpiryTime', message: message, retryable: false
	      });
	    }
	    request.httpRequest.headers[expiresHeader] = expires;
	  } else if (signerClass === AWS.Signers.S3) {
	    request.httpRequest.headers[expiresHeader] = parseInt(
	      AWS.util.date.unixTimestamp() + expires, 10).toString();
	  } else {
	    throw AWS.util.error(new Error(), {
	      message: 'Presigning only supports S3 or SigV4 signing.',
	      code: 'UnsupportedSigner', retryable: false
	    });
	  }
	}

	/**
	 * @api private
	 */
	function signedUrlSigner(request) {
	  var endpoint = request.httpRequest.endpoint;
	  var parsedUrl = AWS.util.urlParse(request.httpRequest.path);
	  var queryParams = {};

	  if (parsedUrl.search) {
	    queryParams = AWS.util.queryStringParse(parsedUrl.search.substr(1));
	  }

	  AWS.util.each(request.httpRequest.headers, function (key, value) {
	    if (key === expiresHeader) key = 'Expires';
	    if (key.indexOf('x-amz-meta-') === 0) {
	      // Delete existing, potentially not normalized key
	      delete queryParams[key];
	      key = key.toLowerCase();
	    }
	    queryParams[key] = value;
	  });
	  delete request.httpRequest.headers[expiresHeader];

	  var auth = queryParams['Authorization'].split(' ');
	  if (auth[0] === 'AWS') {
	    auth = auth[1].split(':');
	    queryParams['AWSAccessKeyId'] = auth[0];
	    queryParams['Signature'] = auth[1];
	  } else if (auth[0] === 'AWS4-HMAC-SHA256') { // SigV4 signing
	    auth.shift();
	    var rest = auth.join(' ');
	    var signature = rest.match(/Signature=(.*?)(?:,|\s|\r?\n|$)/)[1];
	    queryParams['X-Amz-Signature'] = signature;
	    delete queryParams['Expires'];
	  }
	  delete queryParams['Authorization'];
	  delete queryParams['Host'];

	  // build URL
	  endpoint.pathname = parsedUrl.pathname;
	  endpoint.search = AWS.util.queryParamsToString(queryParams);
	}

	/**
	 * @api private
	 */
	AWS.Signers.Presign = inherit({
	  /**
	   * @api private
	   */
	  sign: function sign(request, expireTime, callback) {
	    request.httpRequest.headers[expiresHeader] = expireTime || 3600;
	    request.on('build', signedUrlBuilder);
	    request.on('sign', signedUrlSigner);
	    request.removeListener('afterBuild',
	      AWS.EventListeners.Core.SET_CONTENT_LENGTH);
	    request.removeListener('afterBuild',
	      AWS.EventListeners.Core.COMPUTE_SHA256);

	    request.emit('beforePresign', [request]);

	    if (callback) {
	      request.build(function() {
	        if (this.response.error) callback(this.response.error);
	        else {
	          callback(null, AWS.util.urlFormat(request.httpRequest.endpoint));
	        }
	      });
	    } else {
	      request.build();
	      if (request.response.error) throw request.response.error;
	      return AWS.util.urlFormat(request.httpRequest.endpoint);
	    }
	  }
	});

	module.exports = AWS.Signers.Presign;


/***/ },
/* 122 */
/***/ function(module, exports, __webpack_require__) {

	var AWS = __webpack_require__(5);

	/**
	 * @api private
	 */
	AWS.ParamValidator = AWS.util.inherit({
	  /**
	   * Create a new validator object.
	   *
	   * @param validation [Boolean|map] whether input parameters should be
	   *     validated against the operation description before sending the
	   *     request. Pass a map to enable any of the following specific
	   *     validation features:
	   *
	   *     * **min** [Boolean] &mdash; Validates that a value meets the min
	   *       constraint. This is enabled by default when paramValidation is set
	   *       to `true`.
	   *     * **max** [Boolean] &mdash; Validates that a value meets the max
	   *       constraint.
	   *     * **pattern** [Boolean] &mdash; Validates that a string value matches a
	   *       regular expression.
	   *     * **enum** [Boolean] &mdash; Validates that a string value matches one
	   *       of the allowable enum values.
	   */
	  constructor: function ParamValidator(validation) {
	    if (validation === true || validation === undefined) {
	      validation = {'min': true};
	    }
	    this.validation = validation;
	  },

	  validate: function validate(shape, params, context) {
	    this.errors = [];
	    this.validateMember(shape, params || {}, context || 'params');

	    if (this.errors.length > 1) {
	      var msg = this.errors.join('\n* ');
	      msg = 'There were ' + this.errors.length +
	        ' validation errors:\n* ' + msg;
	      throw AWS.util.error(new Error(msg),
	        {code: 'MultipleValidationErrors', errors: this.errors});
	    } else if (this.errors.length === 1) {
	      throw this.errors[0];
	    } else {
	      return true;
	    }
	  },

	  fail: function fail(code, message) {
	    this.errors.push(AWS.util.error(new Error(message), {code: code}));
	  },

	  validateStructure: function validateStructure(shape, params, context) {
	    this.validateType(params, context, ['object'], 'structure');

	    var paramName;
	    for (var i = 0; shape.required && i < shape.required.length; i++) {
	      paramName = shape.required[i];
	      var value = params[paramName];
	      if (value === undefined || value === null) {
	        this.fail('MissingRequiredParameter',
	          'Missing required key \'' + paramName + '\' in ' + context);
	      }
	    }

	    // validate hash members
	    for (paramName in params) {
	      if (!Object.prototype.hasOwnProperty.call(params, paramName)) continue;

	      var paramValue = params[paramName],
	          memberShape = shape.members[paramName];

	      if (memberShape !== undefined) {
	        var memberContext = [context, paramName].join('.');
	        this.validateMember(memberShape, paramValue, memberContext);
	      } else {
	        this.fail('UnexpectedParameter',
	          'Unexpected key \'' + paramName + '\' found in ' + context);
	      }
	    }

	    return true;
	  },

	  validateMember: function validateMember(shape, param, context) {
	    switch (shape.type) {
	      case 'structure':
	        return this.validateStructure(shape, param, context);
	      case 'list':
	        return this.validateList(shape, param, context);
	      case 'map':
	        return this.validateMap(shape, param, context);
	      default:
	        return this.validateScalar(shape, param, context);
	    }
	  },

	  validateList: function validateList(shape, params, context) {
	    if (this.validateType(params, context, [Array])) {
	      this.validateRange(shape, params.length, context, 'list member count');
	      // validate array members
	      for (var i = 0; i < params.length; i++) {
	        this.validateMember(shape.member, params[i], context + '[' + i + ']');
	      }
	    }
	  },

	  validateMap: function validateMap(shape, params, context) {
	    if (this.validateType(params, context, ['object'], 'map')) {
	      // Build up a count of map members to validate range traits.
	      var mapCount = 0;
	      for (var param in params) {
	        if (!Object.prototype.hasOwnProperty.call(params, param)) continue;
	        // Validate any map key trait constraints
	        this.validateMember(shape.key, param,
	                            context + '[key=\'' + param + '\']')
	        this.validateMember(shape.value, params[param],
	                            context + '[\'' + param + '\']');
	        mapCount++;
	      }
	      this.validateRange(shape, mapCount, context, 'map member count');
	    }
	  },

	  validateScalar: function validateScalar(shape, value, context) {
	    switch (shape.type) {
	      case null:
	      case undefined:
	      case 'string':
	        return this.validateString(shape, value, context);
	      case 'base64':
	      case 'binary':
	        return this.validatePayload(value, context);
	      case 'integer':
	      case 'float':
	        return this.validateNumber(shape, value, context);
	      case 'boolean':
	        return this.validateType(value, context, ['boolean']);
	      case 'timestamp':
	        return this.validateType(value, context, [Date,
	          /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/, 'number'],
	          'Date object, ISO-8601 string, or a UNIX timestamp');
	      default:
	        return this.fail('UnkownType', 'Unhandled type ' +
	                         shape.type + ' for ' + context);
	    }
	  },

	  validateString: function validateString(shape, value, context) {
	    if (this.validateType(value, context, ['string'])) {
	      this.validateEnum(shape, value, context);
	      this.validateRange(shape, value.length, context, 'string length');
	      this.validatePattern(shape, value, context);
	    }
	  },

	  validatePattern: function validatePattern(shape, value, context) {
	    if (this.validation['pattern'] && shape['pattern'] !== undefined) {
	      if (!(new RegExp(shape['pattern'])).test(value)) {
	        this.fail('PatternMatchError', 'Provided value "' + value + '" '
	          + 'does not match regex pattern /' + shape['pattern'] + '/ for '
	          + context);
	      }
	    }
	  },

	  validateRange: function validateRange(shape, value, context, descriptor) {
	    if (this.validation['min']) {
	      if (shape['min'] !== undefined && value < shape['min']) {
	        this.fail('MinRangeError', 'Expected ' + descriptor + ' >= '
	          + shape['min'] + ', but found ' + value + ' for ' + context);
	      }
	    }
	    if (this.validation['max']) {
	      if (shape['max'] !== undefined && value > shape['max']) {
	        this.fail('MaxRangeError', 'Expected ' + descriptor + ' <= '
	          + shape['max'] + ', but found ' + value + ' for ' + context);
	      }
	    }
	  },

	  validateEnum: function validateRange(shape, value, context) {
	    if (this.validation['enum'] && shape['enum'] !== undefined) {
	      // Fail if the string value is not present in the enum list
	      if (shape['enum'].indexOf(value) === -1) {
	        this.fail('EnumError', 'Found string value of ' + value + ', but '
	          + 'expected ' + shape['enum'].join('|') + ' for ' + context);
	      }
	    }
	  },

	  validateType: function validateType(value, context, acceptedTypes, type) {
	    // We will not log an error for null or undefined, but we will return
	    // false so that callers know that the expected type was not strictly met.
	    if (value === null || value === undefined) return false;

	    var foundInvalidType = false;
	    for (var i = 0; i < acceptedTypes.length; i++) {
	      if (typeof acceptedTypes[i] === 'string') {
	        if (typeof value === acceptedTypes[i]) return true;
	      } else if (acceptedTypes[i] instanceof RegExp) {
	        if ((value || '').toString().match(acceptedTypes[i])) return true;
	      } else {
	        if (value instanceof acceptedTypes[i]) return true;
	        if (AWS.util.isType(value, acceptedTypes[i])) return true;
	        if (!type && !foundInvalidType) acceptedTypes = acceptedTypes.slice();
	        acceptedTypes[i] = AWS.util.typeName(acceptedTypes[i]);
	      }
	      foundInvalidType = true;
	    }

	    var acceptedType = type;
	    if (!acceptedType) {
	      acceptedType = acceptedTypes.join(', ').replace(/,([^,]+)$/, ', or$1');
	    }

	    var vowel = acceptedType.match(/^[aeiou]/i) ? 'n' : '';
	    this.fail('InvalidParameterType', 'Expected ' + context + ' to be a' +
	              vowel + ' ' + acceptedType);
	    return false;
	  },

	  validateNumber: function validateNumber(shape, value, context) {
	    if (value === null || value === undefined) return;
	    if (typeof value === 'string') {
	      var castedValue = parseFloat(value);
	      if (castedValue.toString() === value) value = castedValue;
	    }
	    if (this.validateType(value, context, ['number'])) {
	      this.validateRange(shape, value, context, 'numeric value');
	    }
	  },

	  validatePayload: function validatePayload(value, context) {
	    if (value === null || value === undefined) return;
	    if (typeof value === 'string') return;
	    if (value && typeof value.byteLength === 'number') return; // typed arrays
	    if (AWS.util.isNode()) { // special check for buffer/stream in Node.js
	      var Stream = AWS.util.stream.Stream;
	      if (AWS.util.Buffer.isBuffer(value) || value instanceof Stream) return;
	    }

	    var types = ['Buffer', 'Stream', 'File', 'Blob', 'ArrayBuffer', 'DataView'];
	    if (value) {
	      for (var i = 0; i < types.length; i++) {
	        if (AWS.util.isType(value, types[i])) return;
	        if (AWS.util.typeName(value.constructor) === types[i]) return;
	      }
	    }

	    this.fail('InvalidParameterType', 'Expected ' + context + ' to be a ' +
	      'string, Buffer, Stream, Blob, or typed array object');
	  }
	});


/***/ },
/* 123 */
/***/ function(module, exports) {

	module.exports = require("fs");

/***/ },
/* 124 */,
/* 125 */
/***/ function(module, exports) {

	module.exports = require("buffer");

/***/ },
/* 126 */
/***/ function(module, exports) {

	module.exports = require("domain");

/***/ },
/* 127 */
/***/ function(module, exports) {

	module.exports = require("stream");

/***/ },
/* 128 */
/***/ function(module, exports) {

	module.exports = require("url");

/***/ },
/* 129 */
/***/ function(module, exports) {

	module.exports = require("querystring");

/***/ },
/* 130 */
/***/ function(module, exports, __webpack_require__) {

	var util = __webpack_require__(4);
	var Shape = __webpack_require__(11);

	var xml2js = __webpack_require__(131);

	/**
	 * @api private
	 */
	var options = {  // options passed to xml2js parser
	  explicitCharkey: false, // undocumented
	  trim: false,            // trim the leading/trailing whitespace from text nodes
	  normalize: false,       // trim interior whitespace inside text nodes
	  explicitRoot: false,    // return the root node in the resulting object?
	  emptyTag: null,         // the default value for empty nodes
	  explicitArray: true,    // always put child nodes in an array
	  ignoreAttrs: false,     // ignore attributes, only create text nodes
	  mergeAttrs: false,      // merge attributes and child elements
	  validator: null         // a callable validator
	};

	function NodeXmlParser() { }

	NodeXmlParser.prototype.parse = function(xml, shape) {
	  shape = shape || {};

	  var result = null;
	  var error = null;

	  var parser = new xml2js.Parser(options);
	  parser.parseString(xml, function (e, r) {
	    error = e;
	    result = r;
	  });

	  if (result) {
	    var data = parseXml(result, shape);
	    if (result.ResponseMetadata) {
	      data.ResponseMetadata = parseXml(result.ResponseMetadata[0], {});
	    }
	    return data;
	  } else if (error) {
	    throw util.error(error, {code: 'XMLParserError', retryable: true});
	  } else { // empty xml document
	    return parseXml({}, shape);
	  }
	};

	function parseXml(xml, shape) {
	  switch (shape.type) {
	    case 'structure': return parseStructure(xml, shape);
	    case 'map': return parseMap(xml, shape);
	    case 'list': return parseList(xml, shape);
	    case undefined: case null: return parseUnknown(xml);
	    default: return parseScalar(xml, shape);
	  }
	}

	function parseStructure(xml, shape) {
	  var data = {};
	  if (xml === null) return data;

	  util.each(shape.members, function(memberName, memberShape) {
	    var xmlName = memberShape.name;
	    if (Object.prototype.hasOwnProperty.call(xml, xmlName) && Array.isArray(xml[xmlName])) {
	      var xmlChild = xml[xmlName];
	      if (!memberShape.flattened) xmlChild = xmlChild[0];

	      data[memberName] = parseXml(xmlChild, memberShape);
	    } else if (memberShape.isXmlAttribute &&
	               xml.$ && Object.prototype.hasOwnProperty.call(xml.$, xmlName)) {
	      data[memberName] = parseScalar(xml.$[xmlName], memberShape);
	    } else if (memberShape.type === 'list') {
	      data[memberName] = memberShape.defaultValue;
	    }
	  });

	  return data;
	}

	function parseMap(xml, shape) {
	  var data = {};
	  if (xml === null) return data;

	  var xmlKey = shape.key.name || 'key';
	  var xmlValue = shape.value.name || 'value';
	  var iterable = shape.flattened ? xml : xml.entry;

	  if (Array.isArray(iterable)) {
	    util.arrayEach(iterable, function(child) {
	      data[child[xmlKey][0]] = parseXml(child[xmlValue][0], shape.value);
	    });
	  }

	  return data;
	}

	function parseList(xml, shape) {
	  var data = [];
	  var name = shape.member.name || 'member';
	  if (shape.flattened) {
	    util.arrayEach(xml, function(xmlChild) {
	      data.push(parseXml(xmlChild, shape.member));
	    });
	  } else if (xml && Array.isArray(xml[name])) {
	    util.arrayEach(xml[name], function(child) {
	      data.push(parseXml(child, shape.member));
	    });
	  }

	  return data;
	}

	function parseScalar(text, shape) {
	  if (text && text.$ && text.$.encoding === 'base64') {
	    shape = new Shape.create({type: text.$.encoding});
	  }
	  if (text && text._) text = text._;

	  if (typeof shape.toType === 'function') {
	    return shape.toType(text);
	  } else {
	    return text;
	  }
	}

	function parseUnknown(xml) {
	  if (xml === undefined || xml === null) return '';
	  if (typeof xml === 'string') return xml;

	  // parse a list
	  if (Array.isArray(xml)) {
	    var arr = [];
	    for (i = 0; i < xml.length; i++) {
	      arr.push(parseXml(xml[i], {}));
	    }
	    return arr;
	  }

	  // empty object
	  var keys = Object.keys(xml), i;
	  if (keys.length === 0 || keys === ['$']) {
	    return {};
	  }

	  // object, parse as structure
	  var data = {};
	  for (i = 0; i < keys.length; i++) {
	    var key = keys[i], value = xml[key];
	    if (key === '$') continue;
	    if (value.length > 1) { // this member is a list
	      data[key] = parseList(value, {member: {}});
	    } else { // this member is a single item
	      data[key] = parseXml(value[0], {});
	    }
	  }
	  return data;
	}

	module.exports = NodeXmlParser;


/***/ },
/* 131 */
/***/ function(module, exports, __webpack_require__) {

	// Generated by CoffeeScript 1.10.0
	(function() {
	  "use strict";
	  var bom, builder, escapeCDATA, events, isEmpty, processName, processors, requiresCDATA, sax, setImmediate, wrapCDATA,
	    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
	    hasProp = {}.hasOwnProperty,
	    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

	  sax = __webpack_require__(132);

	  events = __webpack_require__(134);

	  builder = __webpack_require__(17);

	  bom = __webpack_require__(135);

	  processors = __webpack_require__(136);

	  setImmediate = __webpack_require__(137).setImmediate;

	  isEmpty = function(thing) {
	    return typeof thing === "object" && (thing != null) && Object.keys(thing).length === 0;
	  };

	  processName = function(processors, processedName) {
	    var i, len, process;
	    for (i = 0, len = processors.length; i < len; i++) {
	      process = processors[i];
	      processedName = process(processedName);
	    }
	    return processedName;
	  };

	  requiresCDATA = function(entry) {
	    return entry.indexOf('&') >= 0 || entry.indexOf('>') >= 0 || entry.indexOf('<') >= 0;
	  };

	  wrapCDATA = function(entry) {
	    return "<![CDATA[" + (escapeCDATA(entry)) + "]]>";
	  };

	  escapeCDATA = function(entry) {
	    return entry.replace(']]>', ']]]]><![CDATA[>');
	  };

	  exports.processors = processors;

	  exports.defaults = {
	    "0.1": {
	      explicitCharkey: false,
	      trim: true,
	      normalize: true,
	      normalizeTags: false,
	      attrkey: "@",
	      charkey: "#",
	      explicitArray: false,
	      ignoreAttrs: false,
	      mergeAttrs: false,
	      explicitRoot: false,
	      validator: null,
	      xmlns: false,
	      explicitChildren: false,
	      childkey: '@@',
	      charsAsChildren: false,
	      async: false,
	      strict: true,
	      attrNameProcessors: null,
	      attrValueProcessors: null,
	      tagNameProcessors: null,
	      valueProcessors: null,
	      emptyTag: ''
	    },
	    "0.2": {
	      explicitCharkey: false,
	      trim: false,
	      normalize: false,
	      normalizeTags: false,
	      attrkey: "$",
	      charkey: "_",
	      explicitArray: true,
	      ignoreAttrs: false,
	      mergeAttrs: false,
	      explicitRoot: true,
	      validator: null,
	      xmlns: false,
	      explicitChildren: false,
	      preserveChildrenOrder: false,
	      childkey: '$$',
	      charsAsChildren: false,
	      async: false,
	      strict: true,
	      attrNameProcessors: null,
	      attrValueProcessors: null,
	      tagNameProcessors: null,
	      valueProcessors: null,
	      rootName: 'root',
	      xmldec: {
	        'version': '1.0',
	        'encoding': 'UTF-8',
	        'standalone': true
	      },
	      doctype: null,
	      renderOpts: {
	        'pretty': true,
	        'indent': '  ',
	        'newline': '\n'
	      },
	      headless: false,
	      chunkSize: 10000,
	      emptyTag: '',
	      cdata: false
	    }
	  };

	  exports.ValidationError = (function(superClass) {
	    extend(ValidationError, superClass);

	    function ValidationError(message) {
	      this.message = message;
	    }

	    return ValidationError;

	  })(Error);

	  exports.Builder = (function() {
	    function Builder(opts) {
	      var key, ref, value;
	      this.options = {};
	      ref = exports.defaults["0.2"];
	      for (key in ref) {
	        if (!hasProp.call(ref, key)) continue;
	        value = ref[key];
	        this.options[key] = value;
	      }
	      for (key in opts) {
	        if (!hasProp.call(opts, key)) continue;
	        value = opts[key];
	        this.options[key] = value;
	      }
	    }

	    Builder.prototype.buildObject = function(rootObj) {
	      var attrkey, charkey, render, rootElement, rootName;
	      attrkey = this.options.attrkey;
	      charkey = this.options.charkey;
	      if ((Object.keys(rootObj).length === 1) && (this.options.rootName === exports.defaults['0.2'].rootName)) {
	        rootName = Object.keys(rootObj)[0];
	        rootObj = rootObj[rootName];
	      } else {
	        rootName = this.options.rootName;
	      }
	      render = (function(_this) {
	        return function(element, obj) {
	          var attr, child, entry, index, key, value;
	          if (typeof obj !== 'object') {
	            if (_this.options.cdata && requiresCDATA(obj)) {
	              element.raw(wrapCDATA(obj));
	            } else {
	              element.txt(obj);
	            }
	          } else {
	            for (key in obj) {
	              if (!hasProp.call(obj, key)) continue;
	              child = obj[key];
	              if (key === attrkey) {
	                if (typeof child === "object") {
	                  for (attr in child) {
	                    value = child[attr];
	                    element = element.att(attr, value);
	                  }
	                }
	              } else if (key === charkey) {
	                if (_this.options.cdata && requiresCDATA(child)) {
	                  element = element.raw(wrapCDATA(child));
	                } else {
	                  element = element.txt(child);
	                }
	              } else if (Array.isArray(child)) {
	                for (index in child) {
	                  if (!hasProp.call(child, index)) continue;
	                  entry = child[index];
	                  if (typeof entry === 'string') {
	                    if (_this.options.cdata && requiresCDATA(entry)) {
	                      element = element.ele(key).raw(wrapCDATA(entry)).up();
	                    } else {
	                      element = element.ele(key, entry).up();
	                    }
	                  } else {
	                    element = render(element.ele(key), entry).up();
	                  }
	                }
	              } else if (typeof child === "object") {
	                element = render(element.ele(key), child).up();
	              } else {
	                if (typeof child === 'string' && _this.options.cdata && requiresCDATA(child)) {
	                  element = element.ele(key).raw(wrapCDATA(child)).up();
	                } else {
	                  if (child == null) {
	                    child = '';
	                  }
	                  element = element.ele(key, child.toString()).up();
	                }
	              }
	            }
	          }
	          return element;
	        };
	      })(this);
	      rootElement = builder.create(rootName, this.options.xmldec, this.options.doctype, {
	        headless: this.options.headless
	      });
	      return render(rootElement, rootObj).end(this.options.renderOpts);
	    };

	    return Builder;

	  })();

	  exports.Parser = (function(superClass) {
	    extend(Parser, superClass);

	    function Parser(opts) {
	      this.parseString = bind(this.parseString, this);
	      this.reset = bind(this.reset, this);
	      this.assignOrPush = bind(this.assignOrPush, this);
	      this.processAsync = bind(this.processAsync, this);
	      var key, ref, value;
	      if (!(this instanceof exports.Parser)) {
	        return new exports.Parser(opts);
	      }
	      this.options = {};
	      ref = exports.defaults["0.2"];
	      for (key in ref) {
	        if (!hasProp.call(ref, key)) continue;
	        value = ref[key];
	        this.options[key] = value;
	      }
	      for (key in opts) {
	        if (!hasProp.call(opts, key)) continue;
	        value = opts[key];
	        this.options[key] = value;
	      }
	      if (this.options.xmlns) {
	        this.options.xmlnskey = this.options.attrkey + "ns";
	      }
	      if (this.options.normalizeTags) {
	        if (!this.options.tagNameProcessors) {
	          this.options.tagNameProcessors = [];
	        }
	        this.options.tagNameProcessors.unshift(processors.normalize);
	      }
	      this.reset();
	    }

	    Parser.prototype.processAsync = function() {
	      var chunk, err, error1;
	      try {
	        if (this.remaining.length <= this.options.chunkSize) {
	          chunk = this.remaining;
	          this.remaining = '';
	          this.saxParser = this.saxParser.write(chunk);
	          return this.saxParser.close();
	        } else {
	          chunk = this.remaining.substr(0, this.options.chunkSize);
	          this.remaining = this.remaining.substr(this.options.chunkSize, this.remaining.length);
	          this.saxParser = this.saxParser.write(chunk);
	          return setImmediate(this.processAsync);
	        }
	      } catch (error1) {
	        err = error1;
	        if (!this.saxParser.errThrown) {
	          this.saxParser.errThrown = true;
	          return this.emit(err);
	        }
	      }
	    };

	    Parser.prototype.assignOrPush = function(obj, key, newValue) {
	      if (!(key in obj)) {
	        if (!this.options.explicitArray) {
	          return obj[key] = newValue;
	        } else {
	          return obj[key] = [newValue];
	        }
	      } else {
	        if (!(obj[key] instanceof Array)) {
	          obj[key] = [obj[key]];
	        }
	        return obj[key].push(newValue);
	      }
	    };

	    Parser.prototype.reset = function() {
	      var attrkey, charkey, ontext, stack;
	      this.removeAllListeners();
	      this.saxParser = sax.parser(this.options.strict, {
	        trim: false,
	        normalize: false,
	        xmlns: this.options.xmlns
	      });
	      this.saxParser.errThrown = false;
	      this.saxParser.onerror = (function(_this) {
	        return function(error) {
	          _this.saxParser.resume();
	          if (!_this.saxParser.errThrown) {
	            _this.saxParser.errThrown = true;
	            return _this.emit("error", error);
	          }
	        };
	      })(this);
	      this.saxParser.onend = (function(_this) {
	        return function() {
	          if (!_this.saxParser.ended) {
	            _this.saxParser.ended = true;
	            return _this.emit("end", _this.resultObject);
	          }
	        };
	      })(this);
	      this.saxParser.ended = false;
	      this.EXPLICIT_CHARKEY = this.options.explicitCharkey;
	      this.resultObject = null;
	      stack = [];
	      attrkey = this.options.attrkey;
	      charkey = this.options.charkey;
	      this.saxParser.onopentag = (function(_this) {
	        return function(node) {
	          var key, newValue, obj, processedKey, ref;
	          obj = {};
	          obj[charkey] = "";
	          if (!_this.options.ignoreAttrs) {
	            ref = node.attributes;
	            for (key in ref) {
	              if (!hasProp.call(ref, key)) continue;
	              if (!(attrkey in obj) && !_this.options.mergeAttrs) {
	                obj[attrkey] = {};
	              }
	              newValue = _this.options.attrValueProcessors ? processName(_this.options.attrValueProcessors, node.attributes[key]) : node.attributes[key];
	              processedKey = _this.options.attrNameProcessors ? processName(_this.options.attrNameProcessors, key) : key;
	              if (_this.options.mergeAttrs) {
	                _this.assignOrPush(obj, processedKey, newValue);
	              } else {
	                obj[attrkey][processedKey] = newValue;
	              }
	            }
	          }
	          obj["#name"] = _this.options.tagNameProcessors ? processName(_this.options.tagNameProcessors, node.name) : node.name;
	          if (_this.options.xmlns) {
	            obj[_this.options.xmlnskey] = {
	              uri: node.uri,
	              local: node.local
	            };
	          }
	          return stack.push(obj);
	        };
	      })(this);
	      this.saxParser.onclosetag = (function(_this) {
	        return function() {
	          var cdata, emptyStr, err, error1, key, node, nodeName, obj, objClone, old, s, xpath;
	          obj = stack.pop();
	          nodeName = obj["#name"];
	          if (!_this.options.explicitChildren || !_this.options.preserveChildrenOrder) {
	            delete obj["#name"];
	          }
	          if (obj.cdata === true) {
	            cdata = obj.cdata;
	            delete obj.cdata;
	          }
	          s = stack[stack.length - 1];
	          if (obj[charkey].match(/^\s*$/) && !cdata) {
	            emptyStr = obj[charkey];
	            delete obj[charkey];
	          } else {
	            if (_this.options.trim) {
	              obj[charkey] = obj[charkey].trim();
	            }
	            if (_this.options.normalize) {
	              obj[charkey] = obj[charkey].replace(/\s{2,}/g, " ").trim();
	            }
	            obj[charkey] = _this.options.valueProcessors ? processName(_this.options.valueProcessors, obj[charkey]) : obj[charkey];
	            if (Object.keys(obj).length === 1 && charkey in obj && !_this.EXPLICIT_CHARKEY) {
	              obj = obj[charkey];
	            }
	          }
	          if (isEmpty(obj)) {
	            obj = _this.options.emptyTag !== '' ? _this.options.emptyTag : emptyStr;
	          }
	          if (_this.options.validator != null) {
	            xpath = "/" + ((function() {
	              var i, len, results;
	              results = [];
	              for (i = 0, len = stack.length; i < len; i++) {
	                node = stack[i];
	                results.push(node["#name"]);
	              }
	              return results;
	            })()).concat(nodeName).join("/");
	            try {
	              obj = _this.options.validator(xpath, s && s[nodeName], obj);
	            } catch (error1) {
	              err = error1;
	              _this.emit("error", err);
	            }
	          }
	          if (_this.options.explicitChildren && !_this.options.mergeAttrs && typeof obj === 'object') {
	            if (!_this.options.preserveChildrenOrder) {
	              node = {};
	              if (_this.options.attrkey in obj) {
	                node[_this.options.attrkey] = obj[_this.options.attrkey];
	                delete obj[_this.options.attrkey];
	              }
	              if (!_this.options.charsAsChildren && _this.options.charkey in obj) {
	                node[_this.options.charkey] = obj[_this.options.charkey];
	                delete obj[_this.options.charkey];
	              }
	              if (Object.getOwnPropertyNames(obj).length > 0) {
	                node[_this.options.childkey] = obj;
	              }
	              obj = node;
	            } else if (s) {
	              s[_this.options.childkey] = s[_this.options.childkey] || [];
	              objClone = {};
	              for (key in obj) {
	                if (!hasProp.call(obj, key)) continue;
	                objClone[key] = obj[key];
	              }
	              s[_this.options.childkey].push(objClone);
	              delete obj["#name"];
	              if (Object.keys(obj).length === 1 && charkey in obj && !_this.EXPLICIT_CHARKEY) {
	                obj = obj[charkey];
	              }
	            }
	          }
	          if (stack.length > 0) {
	            return _this.assignOrPush(s, nodeName, obj);
	          } else {
	            if (_this.options.explicitRoot) {
	              old = obj;
	              obj = {};
	              obj[nodeName] = old;
	            }
	            _this.resultObject = obj;
	            _this.saxParser.ended = true;
	            return _this.emit("end", _this.resultObject);
	          }
	        };
	      })(this);
	      ontext = (function(_this) {
	        return function(text) {
	          var charChild, s;
	          s = stack[stack.length - 1];
	          if (s) {
	            s[charkey] += text;
	            if (_this.options.explicitChildren && _this.options.preserveChildrenOrder && _this.options.charsAsChildren && text.replace(/\\n/g, '').trim() !== '') {
	              s[_this.options.childkey] = s[_this.options.childkey] || [];
	              charChild = {
	                '#name': '__text__'
	              };
	              charChild[charkey] = text;
	              s[_this.options.childkey].push(charChild);
	            }
	            return s;
	          }
	        };
	      })(this);
	      this.saxParser.ontext = ontext;
	      return this.saxParser.oncdata = (function(_this) {
	        return function(text) {
	          var s;
	          s = ontext(text);
	          if (s) {
	            return s.cdata = true;
	          }
	        };
	      })(this);
	    };

	    Parser.prototype.parseString = function(str, cb) {
	      var err, error1;
	      if ((cb != null) && typeof cb === "function") {
	        this.on("end", function(result) {
	          this.reset();
	          return cb(null, result);
	        });
	        this.on("error", function(err) {
	          this.reset();
	          return cb(err);
	        });
	      }
	      try {
	        str = str.toString();
	        if (str.trim() === '') {
	          this.emit("end", null);
	          return true;
	        }
	        str = bom.stripBOM(str);
	        if (this.options.async) {
	          this.remaining = str;
	          setImmediate(this.processAsync);
	          return this.saxParser;
	        }
	        return this.saxParser.write(str).close();
	      } catch (error1) {
	        err = error1;
	        if (!(this.saxParser.errThrown || this.saxParser.ended)) {
	          this.emit('error', err);
	          return this.saxParser.errThrown = true;
	        } else if (this.saxParser.ended) {
	          throw err;
	        }
	      }
	    };

	    return Parser;

	  })(events.EventEmitter);

	  exports.parseString = function(str, a, b) {
	    var cb, options, parser;
	    if (b != null) {
	      if (typeof b === 'function') {
	        cb = b;
	      }
	      if (typeof a === 'object') {
	        options = a;
	      }
	    } else {
	      if (typeof a === 'function') {
	        cb = a;
	      }
	      options = {};
	    }
	    parser = new exports.Parser(options);
	    return parser.parseString(str, cb);
	  };

	}).call(this);


/***/ },
/* 132 */
/***/ function(module, exports, __webpack_require__) {

	;(function (sax) { // wrapper for non-node envs
	  sax.parser = function (strict, opt) { return new SAXParser(strict, opt) }
	  sax.SAXParser = SAXParser
	  sax.SAXStream = SAXStream
	  sax.createStream = createStream

	  // When we pass the MAX_BUFFER_LENGTH position, start checking for buffer overruns.
	  // When we check, schedule the next check for MAX_BUFFER_LENGTH - (max(buffer lengths)),
	  // since that's the earliest that a buffer overrun could occur.  This way, checks are
	  // as rare as required, but as often as necessary to ensure never crossing this bound.
	  // Furthermore, buffers are only tested at most once per write(), so passing a very
	  // large string into write() might have undesirable effects, but this is manageable by
	  // the caller, so it is assumed to be safe.  Thus, a call to write() may, in the extreme
	  // edge case, result in creating at most one complete copy of the string passed in.
	  // Set to Infinity to have unlimited buffers.
	  sax.MAX_BUFFER_LENGTH = 64 * 1024

	  var buffers = [
	    'comment', 'sgmlDecl', 'textNode', 'tagName', 'doctype',
	    'procInstName', 'procInstBody', 'entity', 'attribName',
	    'attribValue', 'cdata', 'script'
	  ]

	  sax.EVENTS = [
	    'text',
	    'processinginstruction',
	    'sgmldeclaration',
	    'doctype',
	    'comment',
	    'attribute',
	    'opentag',
	    'closetag',
	    'opencdata',
	    'cdata',
	    'closecdata',
	    'error',
	    'end',
	    'ready',
	    'script',
	    'opennamespace',
	    'closenamespace'
	  ]

	  function SAXParser (strict, opt) {
	    if (!(this instanceof SAXParser)) {
	      return new SAXParser(strict, opt)
	    }

	    var parser = this
	    clearBuffers(parser)
	    parser.q = parser.c = ''
	    parser.bufferCheckPosition = sax.MAX_BUFFER_LENGTH
	    parser.opt = opt || {}
	    parser.opt.lowercase = parser.opt.lowercase || parser.opt.lowercasetags
	    parser.looseCase = parser.opt.lowercase ? 'toLowerCase' : 'toUpperCase'
	    parser.tags = []
	    parser.closed = parser.closedRoot = parser.sawRoot = false
	    parser.tag = parser.error = null
	    parser.strict = !!strict
	    parser.noscript = !!(strict || parser.opt.noscript)
	    parser.state = S.BEGIN
	    parser.strictEntities = parser.opt.strictEntities
	    parser.ENTITIES = parser.strictEntities ? Object.create(sax.XML_ENTITIES) : Object.create(sax.ENTITIES)
	    parser.attribList = []

	    // namespaces form a prototype chain.
	    // it always points at the current tag,
	    // which protos to its parent tag.
	    if (parser.opt.xmlns) {
	      parser.ns = Object.create(rootNS)
	    }

	    // mostly just for error reporting
	    parser.trackPosition = parser.opt.position !== false
	    if (parser.trackPosition) {
	      parser.position = parser.line = parser.column = 0
	    }
	    emit(parser, 'onready')
	  }

	  if (!Object.create) {
	    Object.create = function (o) {
	      function F () {}
	      F.prototype = o
	      var newf = new F()
	      return newf
	    }
	  }

	  if (!Object.keys) {
	    Object.keys = function (o) {
	      var a = []
	      for (var i in o) if (o.hasOwnProperty(i)) a.push(i)
	      return a
	    }
	  }

	  function checkBufferLength (parser) {
	    var maxAllowed = Math.max(sax.MAX_BUFFER_LENGTH, 10)
	    var maxActual = 0
	    for (var i = 0, l = buffers.length; i < l; i++) {
	      var len = parser[buffers[i]].length
	      if (len > maxAllowed) {
	        // Text/cdata nodes can get big, and since they're buffered,
	        // we can get here under normal conditions.
	        // Avoid issues by emitting the text node now,
	        // so at least it won't get any bigger.
	        switch (buffers[i]) {
	          case 'textNode':
	            closeText(parser)
	            break

	          case 'cdata':
	            emitNode(parser, 'oncdata', parser.cdata)
	            parser.cdata = ''
	            break

	          case 'script':
	            emitNode(parser, 'onscript', parser.script)
	            parser.script = ''
	            break

	          default:
	            error(parser, 'Max buffer length exceeded: ' + buffers[i])
	        }
	      }
	      maxActual = Math.max(maxActual, len)
	    }
	    // schedule the next check for the earliest possible buffer overrun.
	    var m = sax.MAX_BUFFER_LENGTH - maxActual
	    parser.bufferCheckPosition = m + parser.position
	  }

	  function clearBuffers (parser) {
	    for (var i = 0, l = buffers.length; i < l; i++) {
	      parser[buffers[i]] = ''
	    }
	  }

	  function flushBuffers (parser) {
	    closeText(parser)
	    if (parser.cdata !== '') {
	      emitNode(parser, 'oncdata', parser.cdata)
	      parser.cdata = ''
	    }
	    if (parser.script !== '') {
	      emitNode(parser, 'onscript', parser.script)
	      parser.script = ''
	    }
	  }

	  SAXParser.prototype = {
	    end: function () { end(this) },
	    write: write,
	    resume: function () { this.error = null; return this },
	    close: function () { return this.write(null) },
	    flush: function () { flushBuffers(this) }
	  }

	  var Stream
	  try {
	    Stream = __webpack_require__(127).Stream
	  } catch (ex) {
	    Stream = function () {}
	  }

	  var streamWraps = sax.EVENTS.filter(function (ev) {
	    return ev !== 'error' && ev !== 'end'
	  })

	  function createStream (strict, opt) {
	    return new SAXStream(strict, opt)
	  }

	  function SAXStream (strict, opt) {
	    if (!(this instanceof SAXStream)) {
	      return new SAXStream(strict, opt)
	    }

	    Stream.apply(this)

	    this._parser = new SAXParser(strict, opt)
	    this.writable = true
	    this.readable = true

	    var me = this

	    this._parser.onend = function () {
	      me.emit('end')
	    }

	    this._parser.onerror = function (er) {
	      me.emit('error', er)

	      // if didn't throw, then means error was handled.
	      // go ahead and clear error, so we can write again.
	      me._parser.error = null
	    }

	    this._decoder = null

	    streamWraps.forEach(function (ev) {
	      Object.defineProperty(me, 'on' + ev, {
	        get: function () {
	          return me._parser['on' + ev]
	        },
	        set: function (h) {
	          if (!h) {
	            me.removeAllListeners(ev)
	            me._parser['on' + ev] = h
	            return h
	          }
	          me.on(ev, h)
	        },
	        enumerable: true,
	        configurable: false
	      })
	    })
	  }

	  SAXStream.prototype = Object.create(Stream.prototype, {
	    constructor: {
	      value: SAXStream
	    }
	  })

	  SAXStream.prototype.write = function (data) {
	    if (typeof Buffer === 'function' &&
	      typeof Buffer.isBuffer === 'function' &&
	      Buffer.isBuffer(data)) {
	      if (!this._decoder) {
	        var SD = __webpack_require__(133).StringDecoder
	        this._decoder = new SD('utf8')
	      }
	      data = this._decoder.write(data)
	    }

	    this._parser.write(data.toString())
	    this.emit('data', data)
	    return true
	  }

	  SAXStream.prototype.end = function (chunk) {
	    if (chunk && chunk.length) {
	      this.write(chunk)
	    }
	    this._parser.end()
	    return true
	  }

	  SAXStream.prototype.on = function (ev, handler) {
	    var me = this
	    if (!me._parser['on' + ev] && streamWraps.indexOf(ev) !== -1) {
	      me._parser['on' + ev] = function () {
	        var args = arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments)
	        args.splice(0, 0, ev)
	        me.emit.apply(me, args)
	      }
	    }

	    return Stream.prototype.on.call(me, ev, handler)
	  }

	  // character classes and tokens
	  var whitespace = '\r\n\t '

	  // this really needs to be replaced with character classes.
	  // XML allows all manner of ridiculous numbers and digits.
	  var number = '0124356789'
	  var letter = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'

	  // (Letter | "_" | ":")
	  var quote = '\'"'
	  var attribEnd = whitespace + '>'
	  var CDATA = '[CDATA['
	  var DOCTYPE = 'DOCTYPE'
	  var XML_NAMESPACE = 'http://www.w3.org/XML/1998/namespace'
	  var XMLNS_NAMESPACE = 'http://www.w3.org/2000/xmlns/'
	  var rootNS = { xml: XML_NAMESPACE, xmlns: XMLNS_NAMESPACE }

	  // turn all the string character sets into character class objects.
	  whitespace = charClass(whitespace)
	  number = charClass(number)
	  letter = charClass(letter)

	  // http://www.w3.org/TR/REC-xml/#NT-NameStartChar
	  // This implementation works on strings, a single character at a time
	  // as such, it cannot ever support astral-plane characters (10000-EFFFF)
	  // without a significant breaking change to either this  parser, or the
	  // JavaScript language.  Implementation of an emoji-capable xml parser
	  // is left as an exercise for the reader.
	  var nameStart = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/

	  var nameBody = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040\.\d-]/

	  var entityStart = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/
	  var entityBody = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040\.\d-]/

	  quote = charClass(quote)
	  attribEnd = charClass(attribEnd)

	  function charClass (str) {
	    return str.split('').reduce(function (s, c) {
	      s[c] = true
	      return s
	    }, {})
	  }

	  function isRegExp (c) {
	    return Object.prototype.toString.call(c) === '[object RegExp]'
	  }

	  function is (charclass, c) {
	    return isRegExp(charclass) ? !!c.match(charclass) : charclass[c]
	  }

	  function not (charclass, c) {
	    return !is(charclass, c)
	  }

	  var S = 0
	  sax.STATE = {
	    BEGIN: S++, // leading byte order mark or whitespace
	    BEGIN_WHITESPACE: S++, // leading whitespace
	    TEXT: S++, // general stuff
	    TEXT_ENTITY: S++, // &amp and such.
	    OPEN_WAKA: S++, // <
	    SGML_DECL: S++, // <!BLARG
	    SGML_DECL_QUOTED: S++, // <!BLARG foo "bar
	    DOCTYPE: S++, // <!DOCTYPE
	    DOCTYPE_QUOTED: S++, // <!DOCTYPE "//blah
	    DOCTYPE_DTD: S++, // <!DOCTYPE "//blah" [ ...
	    DOCTYPE_DTD_QUOTED: S++, // <!DOCTYPE "//blah" [ "foo
	    COMMENT_STARTING: S++, // <!-
	    COMMENT: S++, // <!--
	    COMMENT_ENDING: S++, // <!-- blah -
	    COMMENT_ENDED: S++, // <!-- blah --
	    CDATA: S++, // <![CDATA[ something
	    CDATA_ENDING: S++, // ]
	    CDATA_ENDING_2: S++, // ]]
	    PROC_INST: S++, // <?hi
	    PROC_INST_BODY: S++, // <?hi there
	    PROC_INST_ENDING: S++, // <?hi "there" ?
	    OPEN_TAG: S++, // <strong
	    OPEN_TAG_SLASH: S++, // <strong /
	    ATTRIB: S++, // <a
	    ATTRIB_NAME: S++, // <a foo
	    ATTRIB_NAME_SAW_WHITE: S++, // <a foo _
	    ATTRIB_VALUE: S++, // <a foo=
	    ATTRIB_VALUE_QUOTED: S++, // <a foo="bar
	    ATTRIB_VALUE_CLOSED: S++, // <a foo="bar"
	    ATTRIB_VALUE_UNQUOTED: S++, // <a foo=bar
	    ATTRIB_VALUE_ENTITY_Q: S++, // <foo bar="&quot;"
	    ATTRIB_VALUE_ENTITY_U: S++, // <foo bar=&quot
	    CLOSE_TAG: S++, // </a
	    CLOSE_TAG_SAW_WHITE: S++, // </a   >
	    SCRIPT: S++, // <script> ...
	    SCRIPT_ENDING: S++ // <script> ... <
	  }

	  sax.XML_ENTITIES = {
	    'amp': '&',
	    'gt': '>',
	    'lt': '<',
	    'quot': '"',
	    'apos': "'"
	  }

	  sax.ENTITIES = {
	    'amp': '&',
	    'gt': '>',
	    'lt': '<',
	    'quot': '"',
	    'apos': "'",
	    'AElig': 198,
	    'Aacute': 193,
	    'Acirc': 194,
	    'Agrave': 192,
	    'Aring': 197,
	    'Atilde': 195,
	    'Auml': 196,
	    'Ccedil': 199,
	    'ETH': 208,
	    'Eacute': 201,
	    'Ecirc': 202,
	    'Egrave': 200,
	    'Euml': 203,
	    'Iacute': 205,
	    'Icirc': 206,
	    'Igrave': 204,
	    'Iuml': 207,
	    'Ntilde': 209,
	    'Oacute': 211,
	    'Ocirc': 212,
	    'Ograve': 210,
	    'Oslash': 216,
	    'Otilde': 213,
	    'Ouml': 214,
	    'THORN': 222,
	    'Uacute': 218,
	    'Ucirc': 219,
	    'Ugrave': 217,
	    'Uuml': 220,
	    'Yacute': 221,
	    'aacute': 225,
	    'acirc': 226,
	    'aelig': 230,
	    'agrave': 224,
	    'aring': 229,
	    'atilde': 227,
	    'auml': 228,
	    'ccedil': 231,
	    'eacute': 233,
	    'ecirc': 234,
	    'egrave': 232,
	    'eth': 240,
	    'euml': 235,
	    'iacute': 237,
	    'icirc': 238,
	    'igrave': 236,
	    'iuml': 239,
	    'ntilde': 241,
	    'oacute': 243,
	    'ocirc': 244,
	    'ograve': 242,
	    'oslash': 248,
	    'otilde': 245,
	    'ouml': 246,
	    'szlig': 223,
	    'thorn': 254,
	    'uacute': 250,
	    'ucirc': 251,
	    'ugrave': 249,
	    'uuml': 252,
	    'yacute': 253,
	    'yuml': 255,
	    'copy': 169,
	    'reg': 174,
	    'nbsp': 160,
	    'iexcl': 161,
	    'cent': 162,
	    'pound': 163,
	    'curren': 164,
	    'yen': 165,
	    'brvbar': 166,
	    'sect': 167,
	    'uml': 168,
	    'ordf': 170,
	    'laquo': 171,
	    'not': 172,
	    'shy': 173,
	    'macr': 175,
	    'deg': 176,
	    'plusmn': 177,
	    'sup1': 185,
	    'sup2': 178,
	    'sup3': 179,
	    'acute': 180,
	    'micro': 181,
	    'para': 182,
	    'middot': 183,
	    'cedil': 184,
	    'ordm': 186,
	    'raquo': 187,
	    'frac14': 188,
	    'frac12': 189,
	    'frac34': 190,
	    'iquest': 191,
	    'times': 215,
	    'divide': 247,
	    'OElig': 338,
	    'oelig': 339,
	    'Scaron': 352,
	    'scaron': 353,
	    'Yuml': 376,
	    'fnof': 402,
	    'circ': 710,
	    'tilde': 732,
	    'Alpha': 913,
	    'Beta': 914,
	    'Gamma': 915,
	    'Delta': 916,
	    'Epsilon': 917,
	    'Zeta': 918,
	    'Eta': 919,
	    'Theta': 920,
	    'Iota': 921,
	    'Kappa': 922,
	    'Lambda': 923,
	    'Mu': 924,
	    'Nu': 925,
	    'Xi': 926,
	    'Omicron': 927,
	    'Pi': 928,
	    'Rho': 929,
	    'Sigma': 931,
	    'Tau': 932,
	    'Upsilon': 933,
	    'Phi': 934,
	    'Chi': 935,
	    'Psi': 936,
	    'Omega': 937,
	    'alpha': 945,
	    'beta': 946,
	    'gamma': 947,
	    'delta': 948,
	    'epsilon': 949,
	    'zeta': 950,
	    'eta': 951,
	    'theta': 952,
	    'iota': 953,
	    'kappa': 954,
	    'lambda': 955,
	    'mu': 956,
	    'nu': 957,
	    'xi': 958,
	    'omicron': 959,
	    'pi': 960,
	    'rho': 961,
	    'sigmaf': 962,
	    'sigma': 963,
	    'tau': 964,
	    'upsilon': 965,
	    'phi': 966,
	    'chi': 967,
	    'psi': 968,
	    'omega': 969,
	    'thetasym': 977,
	    'upsih': 978,
	    'piv': 982,
	    'ensp': 8194,
	    'emsp': 8195,
	    'thinsp': 8201,
	    'zwnj': 8204,
	    'zwj': 8205,
	    'lrm': 8206,
	    'rlm': 8207,
	    'ndash': 8211,
	    'mdash': 8212,
	    'lsquo': 8216,
	    'rsquo': 8217,
	    'sbquo': 8218,
	    'ldquo': 8220,
	    'rdquo': 8221,
	    'bdquo': 8222,
	    'dagger': 8224,
	    'Dagger': 8225,
	    'bull': 8226,
	    'hellip': 8230,
	    'permil': 8240,
	    'prime': 8242,
	    'Prime': 8243,
	    'lsaquo': 8249,
	    'rsaquo': 8250,
	    'oline': 8254,
	    'frasl': 8260,
	    'euro': 8364,
	    'image': 8465,
	    'weierp': 8472,
	    'real': 8476,
	    'trade': 8482,
	    'alefsym': 8501,
	    'larr': 8592,
	    'uarr': 8593,
	    'rarr': 8594,
	    'darr': 8595,
	    'harr': 8596,
	    'crarr': 8629,
	    'lArr': 8656,
	    'uArr': 8657,
	    'rArr': 8658,
	    'dArr': 8659,
	    'hArr': 8660,
	    'forall': 8704,
	    'part': 8706,
	    'exist': 8707,
	    'empty': 8709,
	    'nabla': 8711,
	    'isin': 8712,
	    'notin': 8713,
	    'ni': 8715,
	    'prod': 8719,
	    'sum': 8721,
	    'minus': 8722,
	    'lowast': 8727,
	    'radic': 8730,
	    'prop': 8733,
	    'infin': 8734,
	    'ang': 8736,
	    'and': 8743,
	    'or': 8744,
	    'cap': 8745,
	    'cup': 8746,
	    'int': 8747,
	    'there4': 8756,
	    'sim': 8764,
	    'cong': 8773,
	    'asymp': 8776,
	    'ne': 8800,
	    'equiv': 8801,
	    'le': 8804,
	    'ge': 8805,
	    'sub': 8834,
	    'sup': 8835,
	    'nsub': 8836,
	    'sube': 8838,
	    'supe': 8839,
	    'oplus': 8853,
	    'otimes': 8855,
	    'perp': 8869,
	    'sdot': 8901,
	    'lceil': 8968,
	    'rceil': 8969,
	    'lfloor': 8970,
	    'rfloor': 8971,
	    'lang': 9001,
	    'rang': 9002,
	    'loz': 9674,
	    'spades': 9824,
	    'clubs': 9827,
	    'hearts': 9829,
	    'diams': 9830
	  }

	  Object.keys(sax.ENTITIES).forEach(function (key) {
	    var e = sax.ENTITIES[key]
	    var s = typeof e === 'number' ? String.fromCharCode(e) : e
	    sax.ENTITIES[key] = s
	  })

	  for (var s in sax.STATE) {
	    sax.STATE[sax.STATE[s]] = s
	  }

	  // shorthand
	  S = sax.STATE

	  function emit (parser, event, data) {
	    parser[event] && parser[event](data)
	  }

	  function emitNode (parser, nodeType, data) {
	    if (parser.textNode) closeText(parser)
	    emit(parser, nodeType, data)
	  }

	  function closeText (parser) {
	    parser.textNode = textopts(parser.opt, parser.textNode)
	    if (parser.textNode) emit(parser, 'ontext', parser.textNode)
	    parser.textNode = ''
	  }

	  function textopts (opt, text) {
	    if (opt.trim) text = text.trim()
	    if (opt.normalize) text = text.replace(/\s+/g, ' ')
	    return text
	  }

	  function error (parser, er) {
	    closeText(parser)
	    if (parser.trackPosition) {
	      er += '\nLine: ' + parser.line +
	        '\nColumn: ' + parser.column +
	        '\nChar: ' + parser.c
	    }
	    er = new Error(er)
	    parser.error = er
	    emit(parser, 'onerror', er)
	    return parser
	  }

	  function end (parser) {
	    if (parser.sawRoot && !parser.closedRoot) strictFail(parser, 'Unclosed root tag')
	    if ((parser.state !== S.BEGIN) &&
	      (parser.state !== S.BEGIN_WHITESPACE) &&
	      (parser.state !== S.TEXT)) {
	      error(parser, 'Unexpected end')
	    }
	    closeText(parser)
	    parser.c = ''
	    parser.closed = true
	    emit(parser, 'onend')
	    SAXParser.call(parser, parser.strict, parser.opt)
	    return parser
	  }

	  function strictFail (parser, message) {
	    if (typeof parser !== 'object' || !(parser instanceof SAXParser)) {
	      throw new Error('bad call to strictFail')
	    }
	    if (parser.strict) {
	      error(parser, message)
	    }
	  }

	  function newTag (parser) {
	    if (!parser.strict) parser.tagName = parser.tagName[parser.looseCase]()
	    var parent = parser.tags[parser.tags.length - 1] || parser
	    var tag = parser.tag = { name: parser.tagName, attributes: {} }

	    // will be overridden if tag contails an xmlns="foo" or xmlns:foo="bar"
	    if (parser.opt.xmlns) {
	      tag.ns = parent.ns
	    }
	    parser.attribList.length = 0
	  }

	  function qname (name, attribute) {
	    var i = name.indexOf(':')
	    var qualName = i < 0 ? [ '', name ] : name.split(':')
	    var prefix = qualName[0]
	    var local = qualName[1]

	    // <x "xmlns"="http://foo">
	    if (attribute && name === 'xmlns') {
	      prefix = 'xmlns'
	      local = ''
	    }

	    return { prefix: prefix, local: local }
	  }

	  function attrib (parser) {
	    if (!parser.strict) {
	      parser.attribName = parser.attribName[parser.looseCase]()
	    }

	    if (parser.attribList.indexOf(parser.attribName) !== -1 ||
	      parser.tag.attributes.hasOwnProperty(parser.attribName)) {
	      parser.attribName = parser.attribValue = ''
	      return
	    }

	    if (parser.opt.xmlns) {
	      var qn = qname(parser.attribName, true)
	      var prefix = qn.prefix
	      var local = qn.local

	      if (prefix === 'xmlns') {
	        // namespace binding attribute. push the binding into scope
	        if (local === 'xml' && parser.attribValue !== XML_NAMESPACE) {
	          strictFail(parser,
	            'xml: prefix must be bound to ' + XML_NAMESPACE + '\n' +
	            'Actual: ' + parser.attribValue)
	        } else if (local === 'xmlns' && parser.attribValue !== XMLNS_NAMESPACE) {
	          strictFail(parser,
	            'xmlns: prefix must be bound to ' + XMLNS_NAMESPACE + '\n' +
	            'Actual: ' + parser.attribValue)
	        } else {
	          var tag = parser.tag
	          var parent = parser.tags[parser.tags.length - 1] || parser
	          if (tag.ns === parent.ns) {
	            tag.ns = Object.create(parent.ns)
	          }
	          tag.ns[local] = parser.attribValue
	        }
	      }

	      // defer onattribute events until all attributes have been seen
	      // so any new bindings can take effect. preserve attribute order
	      // so deferred events can be emitted in document order
	      parser.attribList.push([parser.attribName, parser.attribValue])
	    } else {
	      // in non-xmlns mode, we can emit the event right away
	      parser.tag.attributes[parser.attribName] = parser.attribValue
	      emitNode(parser, 'onattribute', {
	        name: parser.attribName,
	        value: parser.attribValue
	      })
	    }

	    parser.attribName = parser.attribValue = ''
	  }

	  function openTag (parser, selfClosing) {
	    if (parser.opt.xmlns) {
	      // emit namespace binding events
	      var tag = parser.tag

	      // add namespace info to tag
	      var qn = qname(parser.tagName)
	      tag.prefix = qn.prefix
	      tag.local = qn.local
	      tag.uri = tag.ns[qn.prefix] || ''

	      if (tag.prefix && !tag.uri) {
	        strictFail(parser, 'Unbound namespace prefix: ' +
	          JSON.stringify(parser.tagName))
	        tag.uri = qn.prefix
	      }

	      var parent = parser.tags[parser.tags.length - 1] || parser
	      if (tag.ns && parent.ns !== tag.ns) {
	        Object.keys(tag.ns).forEach(function (p) {
	          emitNode(parser, 'onopennamespace', {
	            prefix: p,
	            uri: tag.ns[p]
	          })
	        })
	      }

	      // handle deferred onattribute events
	      // Note: do not apply default ns to attributes:
	      //   http://www.w3.org/TR/REC-xml-names/#defaulting
	      for (var i = 0, l = parser.attribList.length; i < l; i++) {
	        var nv = parser.attribList[i]
	        var name = nv[0]
	        var value = nv[1]
	        var qualName = qname(name, true)
	        var prefix = qualName.prefix
	        var local = qualName.local
	        var uri = prefix === '' ? '' : (tag.ns[prefix] || '')
	        var a = {
	          name: name,
	          value: value,
	          prefix: prefix,
	          local: local,
	          uri: uri
	        }

	        // if there's any attributes with an undefined namespace,
	        // then fail on them now.
	        if (prefix && prefix !== 'xmlns' && !uri) {
	          strictFail(parser, 'Unbound namespace prefix: ' +
	            JSON.stringify(prefix))
	          a.uri = prefix
	        }
	        parser.tag.attributes[name] = a
	        emitNode(parser, 'onattribute', a)
	      }
	      parser.attribList.length = 0
	    }

	    parser.tag.isSelfClosing = !!selfClosing

	    // process the tag
	    parser.sawRoot = true
	    parser.tags.push(parser.tag)
	    emitNode(parser, 'onopentag', parser.tag)
	    if (!selfClosing) {
	      // special case for <script> in non-strict mode.
	      if (!parser.noscript && parser.tagName.toLowerCase() === 'script') {
	        parser.state = S.SCRIPT
	      } else {
	        parser.state = S.TEXT
	      }
	      parser.tag = null
	      parser.tagName = ''
	    }
	    parser.attribName = parser.attribValue = ''
	    parser.attribList.length = 0
	  }

	  function closeTag (parser) {
	    if (!parser.tagName) {
	      strictFail(parser, 'Weird empty close tag.')
	      parser.textNode += '</>'
	      parser.state = S.TEXT
	      return
	    }

	    if (parser.script) {
	      if (parser.tagName !== 'script') {
	        parser.script += '</' + parser.tagName + '>'
	        parser.tagName = ''
	        parser.state = S.SCRIPT
	        return
	      }
	      emitNode(parser, 'onscript', parser.script)
	      parser.script = ''
	    }

	    // first make sure that the closing tag actually exists.
	    // <a><b></c></b></a> will close everything, otherwise.
	    var t = parser.tags.length
	    var tagName = parser.tagName
	    if (!parser.strict) {
	      tagName = tagName[parser.looseCase]()
	    }
	    var closeTo = tagName
	    while (t--) {
	      var close = parser.tags[t]
	      if (close.name !== closeTo) {
	        // fail the first time in strict mode
	        strictFail(parser, 'Unexpected close tag')
	      } else {
	        break
	      }
	    }

	    // didn't find it.  we already failed for strict, so just abort.
	    if (t < 0) {
	      strictFail(parser, 'Unmatched closing tag: ' + parser.tagName)
	      parser.textNode += '</' + parser.tagName + '>'
	      parser.state = S.TEXT
	      return
	    }
	    parser.tagName = tagName
	    var s = parser.tags.length
	    while (s-- > t) {
	      var tag = parser.tag = parser.tags.pop()
	      parser.tagName = parser.tag.name
	      emitNode(parser, 'onclosetag', parser.tagName)

	      var x = {}
	      for (var i in tag.ns) {
	        x[i] = tag.ns[i]
	      }

	      var parent = parser.tags[parser.tags.length - 1] || parser
	      if (parser.opt.xmlns && tag.ns !== parent.ns) {
	        // remove namespace bindings introduced by tag
	        Object.keys(tag.ns).forEach(function (p) {
	          var n = tag.ns[p]
	          emitNode(parser, 'onclosenamespace', { prefix: p, uri: n })
	        })
	      }
	    }
	    if (t === 0) parser.closedRoot = true
	    parser.tagName = parser.attribValue = parser.attribName = ''
	    parser.attribList.length = 0
	    parser.state = S.TEXT
	  }

	  function parseEntity (parser) {
	    var entity = parser.entity
	    var entityLC = entity.toLowerCase()
	    var num
	    var numStr = ''

	    if (parser.ENTITIES[entity]) {
	      return parser.ENTITIES[entity]
	    }
	    if (parser.ENTITIES[entityLC]) {
	      return parser.ENTITIES[entityLC]
	    }
	    entity = entityLC
	    if (entity.charAt(0) === '#') {
	      if (entity.charAt(1) === 'x') {
	        entity = entity.slice(2)
	        num = parseInt(entity, 16)
	        numStr = num.toString(16)
	      } else {
	        entity = entity.slice(1)
	        num = parseInt(entity, 10)
	        numStr = num.toString(10)
	      }
	    }
	    entity = entity.replace(/^0+/, '')
	    if (numStr.toLowerCase() !== entity) {
	      strictFail(parser, 'Invalid character entity')
	      return '&' + parser.entity + ';'
	    }

	    return String.fromCodePoint(num)
	  }

	  function beginWhiteSpace (parser, c) {
	    if (c === '<') {
	      parser.state = S.OPEN_WAKA
	      parser.startTagPosition = parser.position
	    } else if (not(whitespace, c)) {
	      // have to process this as a text node.
	      // weird, but happens.
	      strictFail(parser, 'Non-whitespace before first tag.')
	      parser.textNode = c
	      parser.state = S.TEXT
	    }
	  }

	  function charAt (chunk, i) {
	    var result = ''
	    if (i < chunk.length) {
	      result = chunk.charAt(i)
	    }
	    return result
	  }

	  function write (chunk) {
	    var parser = this
	    if (this.error) {
	      throw this.error
	    }
	    if (parser.closed) {
	      return error(parser,
	        'Cannot write after close. Assign an onready handler.')
	    }
	    if (chunk === null) {
	      return end(parser)
	    }
	    var i = 0
	    var c = ''
	    while (true) {
	      c = charAt(chunk, i++)
	      parser.c = c
	      if (!c) {
	        break
	      }
	      if (parser.trackPosition) {
	        parser.position++
	        if (c === '\n') {
	          parser.line++
	          parser.column = 0
	        } else {
	          parser.column++
	        }
	      }
	      switch (parser.state) {
	        case S.BEGIN:
	          parser.state = S.BEGIN_WHITESPACE
	          if (c === '\uFEFF') {
	            continue
	          }
	          beginWhiteSpace(parser, c)
	          continue

	        case S.BEGIN_WHITESPACE:
	          beginWhiteSpace(parser, c)
	          continue

	        case S.TEXT:
	          if (parser.sawRoot && !parser.closedRoot) {
	            var starti = i - 1
	            while (c && c !== '<' && c !== '&') {
	              c = charAt(chunk, i++)
	              if (c && parser.trackPosition) {
	                parser.position++
	                if (c === '\n') {
	                  parser.line++
	                  parser.column = 0
	                } else {
	                  parser.column++
	                }
	              }
	            }
	            parser.textNode += chunk.substring(starti, i - 1)
	          }
	          if (c === '<' && !(parser.sawRoot && parser.closedRoot && !parser.strict)) {
	            parser.state = S.OPEN_WAKA
	            parser.startTagPosition = parser.position
	          } else {
	            if (not(whitespace, c) && (!parser.sawRoot || parser.closedRoot)) {
	              strictFail(parser, 'Text data outside of root node.')
	            }
	            if (c === '&') {
	              parser.state = S.TEXT_ENTITY
	            } else {
	              parser.textNode += c
	            }
	          }
	          continue

	        case S.SCRIPT:
	          // only non-strict
	          if (c === '<') {
	            parser.state = S.SCRIPT_ENDING
	          } else {
	            parser.script += c
	          }
	          continue

	        case S.SCRIPT_ENDING:
	          if (c === '/') {
	            parser.state = S.CLOSE_TAG
	          } else {
	            parser.script += '<' + c
	            parser.state = S.SCRIPT
	          }
	          continue

	        case S.OPEN_WAKA:
	          // either a /, ?, !, or text is coming next.
	          if (c === '!') {
	            parser.state = S.SGML_DECL
	            parser.sgmlDecl = ''
	          } else if (is(whitespace, c)) {
	            // wait for it...
	          } else if (is(nameStart, c)) {
	            parser.state = S.OPEN_TAG
	            parser.tagName = c
	          } else if (c === '/') {
	            parser.state = S.CLOSE_TAG
	            parser.tagName = ''
	          } else if (c === '?') {
	            parser.state = S.PROC_INST
	            parser.procInstName = parser.procInstBody = ''
	          } else {
	            strictFail(parser, 'Unencoded <')
	            // if there was some whitespace, then add that in.
	            if (parser.startTagPosition + 1 < parser.position) {
	              var pad = parser.position - parser.startTagPosition
	              c = new Array(pad).join(' ') + c
	            }
	            parser.textNode += '<' + c
	            parser.state = S.TEXT
	          }
	          continue

	        case S.SGML_DECL:
	          if ((parser.sgmlDecl + c).toUpperCase() === CDATA) {
	            emitNode(parser, 'onopencdata')
	            parser.state = S.CDATA
	            parser.sgmlDecl = ''
	            parser.cdata = ''
	          } else if (parser.sgmlDecl + c === '--') {
	            parser.state = S.COMMENT
	            parser.comment = ''
	            parser.sgmlDecl = ''
	          } else if ((parser.sgmlDecl + c).toUpperCase() === DOCTYPE) {
	            parser.state = S.DOCTYPE
	            if (parser.doctype || parser.sawRoot) {
	              strictFail(parser,
	                'Inappropriately located doctype declaration')
	            }
	            parser.doctype = ''
	            parser.sgmlDecl = ''
	          } else if (c === '>') {
	            emitNode(parser, 'onsgmldeclaration', parser.sgmlDecl)
	            parser.sgmlDecl = ''
	            parser.state = S.TEXT
	          } else if (is(quote, c)) {
	            parser.state = S.SGML_DECL_QUOTED
	            parser.sgmlDecl += c
	          } else {
	            parser.sgmlDecl += c
	          }
	          continue

	        case S.SGML_DECL_QUOTED:
	          if (c === parser.q) {
	            parser.state = S.SGML_DECL
	            parser.q = ''
	          }
	          parser.sgmlDecl += c
	          continue

	        case S.DOCTYPE:
	          if (c === '>') {
	            parser.state = S.TEXT
	            emitNode(parser, 'ondoctype', parser.doctype)
	            parser.doctype = true // just remember that we saw it.
	          } else {
	            parser.doctype += c
	            if (c === '[') {
	              parser.state = S.DOCTYPE_DTD
	            } else if (is(quote, c)) {
	              parser.state = S.DOCTYPE_QUOTED
	              parser.q = c
	            }
	          }
	          continue

	        case S.DOCTYPE_QUOTED:
	          parser.doctype += c
	          if (c === parser.q) {
	            parser.q = ''
	            parser.state = S.DOCTYPE
	          }
	          continue

	        case S.DOCTYPE_DTD:
	          parser.doctype += c
	          if (c === ']') {
	            parser.state = S.DOCTYPE
	          } else if (is(quote, c)) {
	            parser.state = S.DOCTYPE_DTD_QUOTED
	            parser.q = c
	          }
	          continue

	        case S.DOCTYPE_DTD_QUOTED:
	          parser.doctype += c
	          if (c === parser.q) {
	            parser.state = S.DOCTYPE_DTD
	            parser.q = ''
	          }
	          continue

	        case S.COMMENT:
	          if (c === '-') {
	            parser.state = S.COMMENT_ENDING
	          } else {
	            parser.comment += c
	          }
	          continue

	        case S.COMMENT_ENDING:
	          if (c === '-') {
	            parser.state = S.COMMENT_ENDED
	            parser.comment = textopts(parser.opt, parser.comment)
	            if (parser.comment) {
	              emitNode(parser, 'oncomment', parser.comment)
	            }
	            parser.comment = ''
	          } else {
	            parser.comment += '-' + c
	            parser.state = S.COMMENT
	          }
	          continue

	        case S.COMMENT_ENDED:
	          if (c !== '>') {
	            strictFail(parser, 'Malformed comment')
	            // allow <!-- blah -- bloo --> in non-strict mode,
	            // which is a comment of " blah -- bloo "
	            parser.comment += '--' + c
	            parser.state = S.COMMENT
	          } else {
	            parser.state = S.TEXT
	          }
	          continue

	        case S.CDATA:
	          if (c === ']') {
	            parser.state = S.CDATA_ENDING
	          } else {
	            parser.cdata += c
	          }
	          continue

	        case S.CDATA_ENDING:
	          if (c === ']') {
	            parser.state = S.CDATA_ENDING_2
	          } else {
	            parser.cdata += ']' + c
	            parser.state = S.CDATA
	          }
	          continue

	        case S.CDATA_ENDING_2:
	          if (c === '>') {
	            if (parser.cdata) {
	              emitNode(parser, 'oncdata', parser.cdata)
	            }
	            emitNode(parser, 'onclosecdata')
	            parser.cdata = ''
	            parser.state = S.TEXT
	          } else if (c === ']') {
	            parser.cdata += ']'
	          } else {
	            parser.cdata += ']]' + c
	            parser.state = S.CDATA
	          }
	          continue

	        case S.PROC_INST:
	          if (c === '?') {
	            parser.state = S.PROC_INST_ENDING
	          } else if (is(whitespace, c)) {
	            parser.state = S.PROC_INST_BODY
	          } else {
	            parser.procInstName += c
	          }
	          continue

	        case S.PROC_INST_BODY:
	          if (!parser.procInstBody && is(whitespace, c)) {
	            continue
	          } else if (c === '?') {
	            parser.state = S.PROC_INST_ENDING
	          } else {
	            parser.procInstBody += c
	          }
	          continue

	        case S.PROC_INST_ENDING:
	          if (c === '>') {
	            emitNode(parser, 'onprocessinginstruction', {
	              name: parser.procInstName,
	              body: parser.procInstBody
	            })
	            parser.procInstName = parser.procInstBody = ''
	            parser.state = S.TEXT
	          } else {
	            parser.procInstBody += '?' + c
	            parser.state = S.PROC_INST_BODY
	          }
	          continue

	        case S.OPEN_TAG:
	          if (is(nameBody, c)) {
	            parser.tagName += c
	          } else {
	            newTag(parser)
	            if (c === '>') {
	              openTag(parser)
	            } else if (c === '/') {
	              parser.state = S.OPEN_TAG_SLASH
	            } else {
	              if (not(whitespace, c)) {
	                strictFail(parser, 'Invalid character in tag name')
	              }
	              parser.state = S.ATTRIB
	            }
	          }
	          continue

	        case S.OPEN_TAG_SLASH:
	          if (c === '>') {
	            openTag(parser, true)
	            closeTag(parser)
	          } else {
	            strictFail(parser, 'Forward-slash in opening tag not followed by >')
	            parser.state = S.ATTRIB
	          }
	          continue

	        case S.ATTRIB:
	          // haven't read the attribute name yet.
	          if (is(whitespace, c)) {
	            continue
	          } else if (c === '>') {
	            openTag(parser)
	          } else if (c === '/') {
	            parser.state = S.OPEN_TAG_SLASH
	          } else if (is(nameStart, c)) {
	            parser.attribName = c
	            parser.attribValue = ''
	            parser.state = S.ATTRIB_NAME
	          } else {
	            strictFail(parser, 'Invalid attribute name')
	          }
	          continue

	        case S.ATTRIB_NAME:
	          if (c === '=') {
	            parser.state = S.ATTRIB_VALUE
	          } else if (c === '>') {
	            strictFail(parser, 'Attribute without value')
	            parser.attribValue = parser.attribName
	            attrib(parser)
	            openTag(parser)
	          } else if (is(whitespace, c)) {
	            parser.state = S.ATTRIB_NAME_SAW_WHITE
	          } else if (is(nameBody, c)) {
	            parser.attribName += c
	          } else {
	            strictFail(parser, 'Invalid attribute name')
	          }
	          continue

	        case S.ATTRIB_NAME_SAW_WHITE:
	          if (c === '=') {
	            parser.state = S.ATTRIB_VALUE
	          } else if (is(whitespace, c)) {
	            continue
	          } else {
	            strictFail(parser, 'Attribute without value')
	            parser.tag.attributes[parser.attribName] = ''
	            parser.attribValue = ''
	            emitNode(parser, 'onattribute', {
	              name: parser.attribName,
	              value: ''
	            })
	            parser.attribName = ''
	            if (c === '>') {
	              openTag(parser)
	            } else if (is(nameStart, c)) {
	              parser.attribName = c
	              parser.state = S.ATTRIB_NAME
	            } else {
	              strictFail(parser, 'Invalid attribute name')
	              parser.state = S.ATTRIB
	            }
	          }
	          continue

	        case S.ATTRIB_VALUE:
	          if (is(whitespace, c)) {
	            continue
	          } else if (is(quote, c)) {
	            parser.q = c
	            parser.state = S.ATTRIB_VALUE_QUOTED
	          } else {
	            strictFail(parser, 'Unquoted attribute value')
	            parser.state = S.ATTRIB_VALUE_UNQUOTED
	            parser.attribValue = c
	          }
	          continue

	        case S.ATTRIB_VALUE_QUOTED:
	          if (c !== parser.q) {
	            if (c === '&') {
	              parser.state = S.ATTRIB_VALUE_ENTITY_Q
	            } else {
	              parser.attribValue += c
	            }
	            continue
	          }
	          attrib(parser)
	          parser.q = ''
	          parser.state = S.ATTRIB_VALUE_CLOSED
	          continue

	        case S.ATTRIB_VALUE_CLOSED:
	          if (is(whitespace, c)) {
	            parser.state = S.ATTRIB
	          } else if (c === '>') {
	            openTag(parser)
	          } else if (c === '/') {
	            parser.state = S.OPEN_TAG_SLASH
	          } else if (is(nameStart, c)) {
	            strictFail(parser, 'No whitespace between attributes')
	            parser.attribName = c
	            parser.attribValue = ''
	            parser.state = S.ATTRIB_NAME
	          } else {
	            strictFail(parser, 'Invalid attribute name')
	          }
	          continue

	        case S.ATTRIB_VALUE_UNQUOTED:
	          if (not(attribEnd, c)) {
	            if (c === '&') {
	              parser.state = S.ATTRIB_VALUE_ENTITY_U
	            } else {
	              parser.attribValue += c
	            }
	            continue
	          }
	          attrib(parser)
	          if (c === '>') {
	            openTag(parser)
	          } else {
	            parser.state = S.ATTRIB
	          }
	          continue

	        case S.CLOSE_TAG:
	          if (!parser.tagName) {
	            if (is(whitespace, c)) {
	              continue
	            } else if (not(nameStart, c)) {
	              if (parser.script) {
	                parser.script += '</' + c
	                parser.state = S.SCRIPT
	              } else {
	                strictFail(parser, 'Invalid tagname in closing tag.')
	              }
	            } else {
	              parser.tagName = c
	            }
	          } else if (c === '>') {
	            closeTag(parser)
	          } else if (is(nameBody, c)) {
	            parser.tagName += c
	          } else if (parser.script) {
	            parser.script += '</' + parser.tagName
	            parser.tagName = ''
	            parser.state = S.SCRIPT
	          } else {
	            if (not(whitespace, c)) {
	              strictFail(parser, 'Invalid tagname in closing tag')
	            }
	            parser.state = S.CLOSE_TAG_SAW_WHITE
	          }
	          continue

	        case S.CLOSE_TAG_SAW_WHITE:
	          if (is(whitespace, c)) {
	            continue
	          }
	          if (c === '>') {
	            closeTag(parser)
	          } else {
	            strictFail(parser, 'Invalid characters in closing tag')
	          }
	          continue

	        case S.TEXT_ENTITY:
	        case S.ATTRIB_VALUE_ENTITY_Q:
	        case S.ATTRIB_VALUE_ENTITY_U:
	          var returnState
	          var buffer
	          switch (parser.state) {
	            case S.TEXT_ENTITY:
	              returnState = S.TEXT
	              buffer = 'textNode'
	              break

	            case S.ATTRIB_VALUE_ENTITY_Q:
	              returnState = S.ATTRIB_VALUE_QUOTED
	              buffer = 'attribValue'
	              break

	            case S.ATTRIB_VALUE_ENTITY_U:
	              returnState = S.ATTRIB_VALUE_UNQUOTED
	              buffer = 'attribValue'
	              break
	          }

	          if (c === ';') {
	            parser[buffer] += parseEntity(parser)
	            parser.entity = ''
	            parser.state = returnState
	          } else if (is(parser.entity.length ? entityBody : entityStart, c)) {
	            parser.entity += c
	          } else {
	            strictFail(parser, 'Invalid character in entity name')
	            parser[buffer] += '&' + parser.entity + c
	            parser.entity = ''
	            parser.state = returnState
	          }

	          continue

	        default:
	          throw new Error(parser, 'Unknown state: ' + parser.state)
	      }
	    } // while

	    if (parser.position >= parser.bufferCheckPosition) {
	      checkBufferLength(parser)
	    }
	    return parser
	  }

	  /*! http://mths.be/fromcodepoint v0.1.0 by @mathias */
	  if (!String.fromCodePoint) {
	    (function () {
	      var stringFromCharCode = String.fromCharCode
	      var floor = Math.floor
	      var fromCodePoint = function () {
	        var MAX_SIZE = 0x4000
	        var codeUnits = []
	        var highSurrogate
	        var lowSurrogate
	        var index = -1
	        var length = arguments.length
	        if (!length) {
	          return ''
	        }
	        var result = ''
	        while (++index < length) {
	          var codePoint = Number(arguments[index])
	          if (
	            !isFinite(codePoint) || // `NaN`, `+Infinity`, or `-Infinity`
	            codePoint < 0 || // not a valid Unicode code point
	            codePoint > 0x10FFFF || // not a valid Unicode code point
	            floor(codePoint) !== codePoint // not an integer
	          ) {
	            throw RangeError('Invalid code point: ' + codePoint)
	          }
	          if (codePoint <= 0xFFFF) { // BMP code point
	            codeUnits.push(codePoint)
	          } else { // Astral code point; split in surrogate halves
	            // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
	            codePoint -= 0x10000
	            highSurrogate = (codePoint >> 10) + 0xD800
	            lowSurrogate = (codePoint % 0x400) + 0xDC00
	            codeUnits.push(highSurrogate, lowSurrogate)
	          }
	          if (index + 1 === length || codeUnits.length > MAX_SIZE) {
	            result += stringFromCharCode.apply(null, codeUnits)
	            codeUnits.length = 0
	          }
	        }
	        return result
	      }
	      if (Object.defineProperty) {
	        Object.defineProperty(String, 'fromCodePoint', {
	          value: fromCodePoint,
	          configurable: true,
	          writable: true
	        })
	      } else {
	        String.fromCodePoint = fromCodePoint
	      }
	    }())
	  }
	})( false ? this.sax = {} : exports)


/***/ },
/* 133 */
/***/ function(module, exports) {

	module.exports = require("string_decoder");

/***/ },
/* 134 */
/***/ function(module, exports) {

	module.exports = require("events");

/***/ },
/* 135 */
/***/ function(module, exports, __webpack_require__) {

	// Generated by CoffeeScript 1.10.0
	(function() {
	  "use strict";
	  var xml2js;

	  xml2js = __webpack_require__(131);

	  exports.stripBOM = function(str) {
	    if (str[0] === '\uFEFF') {
	      return str.substring(1);
	    } else {
	      return str;
	    }
	  };

	}).call(this);


/***/ },
/* 136 */
/***/ function(module, exports) {

	// Generated by CoffeeScript 1.10.0
	(function() {
	  "use strict";
	  var prefixMatch;

	  prefixMatch = new RegExp(/(?!xmlns)^.*:/);

	  exports.normalize = function(str) {
	    return str.toLowerCase();
	  };

	  exports.firstCharLowerCase = function(str) {
	    return str.charAt(0).toLowerCase() + str.slice(1);
	  };

	  exports.stripPrefix = function(str) {
	    return str.replace(prefixMatch, '');
	  };

	  exports.parseNumbers = function(str) {
	    if (!isNaN(str)) {
	      str = str % 1 === 0 ? parseInt(str, 10) : parseFloat(str);
	    }
	    return str;
	  };

	  exports.parseBooleans = function(str) {
	    if (/^(?:true|false)$/i.test(str)) {
	      str = str.toLowerCase() === 'true';
	    }
	    return str;
	  };

	}).call(this);


/***/ },
/* 137 */
/***/ function(module, exports) {

	module.exports = require("timers");

/***/ },
/* 138 */
/***/ function(module, exports, __webpack_require__) {

	var AWS = __webpack_require__(5);
	var Stream = AWS.util.stream.Stream;
	var TransformStream = AWS.util.stream.Transform;
	var ReadableStream = AWS.util.stream.Readable;
	__webpack_require__(103);

	/**
	 * @api private
	 */
	AWS.NodeHttpClient = AWS.util.inherit({
	  handleRequest: function handleRequest(httpRequest, httpOptions, callback, errCallback) {
	    var self = this;
	    var cbAlreadyCalled = false;
	    var endpoint = httpRequest.endpoint;
	    var pathPrefix = '';
	    if (!httpOptions) httpOptions = {};
	    if (httpOptions.proxy) {
	      pathPrefix = endpoint.protocol + '//' + endpoint.hostname;
	      if (endpoint.port !== 80 && endpoint.port !== 443) {
	        pathPrefix += ':' + endpoint.port;
	      }
	      endpoint = new AWS.Endpoint(httpOptions.proxy);
	    }

	    var useSSL = endpoint.protocol === 'https:';
	    var http = useSSL ? __webpack_require__(139) : __webpack_require__(140);
	    var options = {
	      host: endpoint.hostname,
	      port: endpoint.port,
	      method: httpRequest.method,
	      headers: httpRequest.headers,
	      path: pathPrefix + httpRequest.path
	    };

	    if (useSSL && !httpOptions.agent) {
	      options.agent = this.sslAgent();
	    }

	    AWS.util.update(options, httpOptions);
	    delete options.proxy; // proxy isn't an HTTP option
	    delete options.timeout; // timeout isn't an HTTP option

	    var stream = http.request(options, function (httpResp) {
	      if (cbAlreadyCalled) return; cbAlreadyCalled = true;

	      callback(httpResp);
	      httpResp.emit('headers', httpResp.statusCode, httpResp.headers);
	    });
	    httpRequest.stream = stream; // attach stream to httpRequest

	    // timeout support
	    stream.setTimeout(httpOptions.timeout || 0, function() {
	      if (cbAlreadyCalled) return; cbAlreadyCalled = true;

	      var msg = 'Connection timed out after ' + httpOptions.timeout + 'ms';
	      errCallback(AWS.util.error(new Error(msg), {code: 'TimeoutError'}));
	      stream.abort();
	    });

	    stream.on('error', function() {
	      if (cbAlreadyCalled) return; cbAlreadyCalled = true;
	      errCallback.apply(this, arguments);
	    });

	    var expect = httpRequest.headers.Expect || httpRequest.headers.expect;
	    if (expect === '100-continue') {
	      stream.on('continue', function() {
	        self.writeBody(stream, httpRequest);
	      });
	    } else {
	      this.writeBody(stream, httpRequest);
	    }

	    return stream;
	  },

	  writeBody: function writeBody(stream, httpRequest) {
	    var body = httpRequest.body;
	    var totalBytes = parseInt(httpRequest.headers['Content-Length'], 10);

	    if (body instanceof Stream) {
	      // For progress support of streaming content -
	      // pipe the data through a transform stream to emit 'sendProgress' events
	      var progressStream = this.progressStream(stream, totalBytes);
	      if (progressStream) {
	        body.pipe(progressStream).pipe(stream);
	      } else {
	        body.pipe(stream);
	      }
	    } else if (body) {
	      // The provided body is a buffer/string and is already fully available in memory -
	      // For performance it's best to send it as a whole by calling stream.end(body),
	      // Callers expect a 'sendProgress' event which is best emitted once
	      // the http request stream has been fully written and all data flushed.
	      // The use of totalBytes is important over body.length for strings where
	      // length is char length and not byte length.
	      stream.once('finish', function() {
	        stream.emit('sendProgress', {
	          loaded: totalBytes,
	          total: totalBytes
	        });
	      });
	      stream.end(body);
	    } else {
	      // no request body
	      stream.end();
	    }
	  },

	  sslAgent: function sslAgent() {
	    var https = __webpack_require__(139);

	    if (!AWS.NodeHttpClient.sslAgent) {
	      AWS.NodeHttpClient.sslAgent = new https.Agent({rejectUnauthorized: true});
	      AWS.NodeHttpClient.sslAgent.setMaxListeners(0);

	      // delegate maxSockets to globalAgent, set a default limit of 50 if current value is Infinity.
	      // Users can bypass this default by supplying their own Agent as part of SDK configuration.
	      Object.defineProperty(AWS.NodeHttpClient.sslAgent, 'maxSockets', {
	        enumerable: true,
	        get: function() {
	          var defaultMaxSockets = 50;
	          var globalAgent = https.globalAgent;
	          if (globalAgent && globalAgent.maxSockets !== Infinity && typeof globalAgent.maxSockets === 'number') {
	            return globalAgent.maxSockets;
	          }
	          return defaultMaxSockets;
	        }
	      });
	    }
	    return AWS.NodeHttpClient.sslAgent;
	  },

	  progressStream: function progressStream(stream, totalBytes) {
	    if (typeof TransformStream === 'undefined') {
	      // for node 0.8 there is no streaming progress
	      return;
	    }
	    var loadedBytes = 0;
	    var reporter = new TransformStream();
	    reporter._transform = function(chunk, encoding, callback) {
	      if (chunk) {
	        loadedBytes += chunk.length;
	        stream.emit('sendProgress', {
	          loaded: loadedBytes,
	          total: totalBytes
	        });
	      }
	      callback(null, chunk);
	    };
	    return reporter;
	  },

	  emitter: null
	});

	/**
	 * @!ignore
	 */

	/**
	 * @api private
	 */
	AWS.HttpClient.prototype = AWS.NodeHttpClient.prototype;

	/**
	 * @api private
	 */
	AWS.HttpClient.streamsApiVersion = ReadableStream ? 2 : 1;


/***/ },
/* 139 */
/***/ function(module, exports) {

	module.exports = require("https");

/***/ },
/* 140 */
/***/ function(module, exports) {

	module.exports = require("http");

/***/ },
/* 141 */
/***/ function(module, exports, __webpack_require__) {

	var AWS = __webpack_require__(5);
	__webpack_require__(142);

	/**
	 * Represents credentials received from the metadata service on an EC2 instance.
	 *
	 * By default, this class will connect to the metadata service using
	 * {AWS.MetadataService} and attempt to load any available credentials. If it
	 * can connect, and credentials are available, these will be used with zero
	 * configuration.
	 *
	 * This credentials class will by default timeout after 1 second of inactivity
	 * and retry 3 times.
	 * If your requests to the EC2 metadata service are timing out, you can increase
	 * these values by configuring them directly:
	 *
	 * ```javascript
	 * AWS.config.credentials = new AWS.EC2MetadataCredentials({
	 *   httpOptions: { timeout: 5000 }, // 5 second timeout
	 *   maxRetries: 10, // retry 10 times
	 *   retryDelayOptions: { base: 200 } // see AWS.Config for information
	 * });
	 * ```
	 *
	 * @see AWS.Config.retryDelayOptions
	 *
	 * @!macro nobrowser
	 */
	AWS.EC2MetadataCredentials = AWS.util.inherit(AWS.Credentials, {
	  constructor: function EC2MetadataCredentials(options) {
	    AWS.Credentials.call(this);

	    options = options ? AWS.util.copy(options) : {};
	    options = AWS.util.merge(
	      {maxRetries: this.defaultMaxRetries}, options);
	    if (!options.httpOptions) options.httpOptions = {};
	    options.httpOptions = AWS.util.merge(
	      {timeout: this.defaultTimeout}, options.httpOptions);

	    this.metadataService = new AWS.MetadataService(options);
	    this.metadata = {};
	  },

	  /**
	   * @api private
	   */
	  defaultTimeout: 1000,

	  /**
	   * @api private
	   */
	  defaultMaxRetries: 3,

	  /**
	   * Loads the credentials from the instance metadata service
	   *
	   * @callback callback function(err)
	   *   Called when the instance metadata service responds (or fails). When
	   *   this callback is called with no error, it means that the credentials
	   *   information has been loaded into the object (as the `accessKeyId`,
	   *   `secretAccessKey`, and `sessionToken` properties).
	   *   @param err [Error] if an error occurred, this value will be filled
	   * @see get
	   */
	  refresh: function refresh(callback) {
	    var self = this;
	    if (!callback) callback = function(err) { if (err) throw err; };

	    self.metadataService.loadCredentials(function (err, creds) {
	      if (!err) {
	        self.expired = false;
	        self.metadata = creds;
	        self.accessKeyId = creds.AccessKeyId;
	        self.secretAccessKey = creds.SecretAccessKey;
	        self.sessionToken = creds.Token;
	        self.expireTime = new Date(creds.Expiration);
	      }
	      callback(err);
	    });
	  }
	});


/***/ },
/* 142 */
/***/ function(module, exports, __webpack_require__) {

	var AWS = __webpack_require__(5);
	__webpack_require__(103);
	var inherit = AWS.util.inherit;

	/**
	 * Represents a metadata service available on EC2 instances. Using the
	 * {request} method, you can receieve metadata about any available resource
	 * on the metadata service.
	 *
	 * @!attribute [r] httpOptions
	 *   @return [map] a map of options to pass to the underlying HTTP request:
	 *
	 *     * **timeout** (Number) &mdash; a timeout value in milliseconds to wait
	 *       before aborting the connection. Set to 0 for no timeout.
	 *
	 * @!macro nobrowser
	 */
	AWS.MetadataService = inherit({
	  /**
	   * @return [String] the hostname of the instance metadata service
	   */
	  host: '169.254.169.254',

	  /**
	   * @!ignore
	   */

	  /**
	   * Default HTTP options. By default, the metadata service is set to not
	   * timeout on long requests. This means that on non-EC2 machines, this
	   * request will never return. If you are calling this operation from an
	   * environment that may not always run on EC2, set a `timeout` value so
	   * the SDK will abort the request after a given number of milliseconds.
	   */
	  httpOptions: { timeout: 0 },

	  /**
	   * Creates a new MetadataService object with a given set of options.
	   *
	   * @option options host [String] the hostname of the instance metadata
	   *   service
	   * @option options httpOptions [map] a map of options to pass to the
	   *   underlying HTTP request:
	   *
	   *   * **timeout** (Number) &mdash; a timeout value in milliseconds to wait
	   *     before aborting the connection. Set to 0 for no timeout.
	   * @option options maxRetries [Integer] the maximum number of retries to
	   *   perform for timeout errors
	   * @option options retryDelayOptions [map] A set of options to configure the
	   *   retry delay on retryable errors. See AWS.Config for details.
	   */
	  constructor: function MetadataService(options) {
	    AWS.util.update(this, options);
	  },

	  /**
	   * Sends a request to the instance metadata service for a given resource.
	   *
	   * @param path [String] the path of the resource to get
	   * @callback callback function(err, data)
	   *   Called when a response is available from the service.
	   *   @param err [Error, null] if an error occurred, this value will be set
	   *   @param data [String, null] if the request was successful, the body of
	   *     the response
	   */
	  request: function request(path, callback) {
	    path = path || '/';
	    var httpRequest = new AWS.HttpRequest('http://' + this.host + path);
	    httpRequest.method = 'GET';
	    AWS.util.handleRequestWithRetries(httpRequest, this, callback);
	  },

	  /**
	  * @api private
	  */
	  loadCredentialsCallbacks: [],

	  /**
	   * Loads a set of credentials stored in the instance metadata service
	   *
	   * @api private
	   * @callback callback function(err, credentials)
	   *   Called when credentials are loaded from the resource
	   *   @param err [Error] if an error occurred, this value will be set
	   *   @param credentials [Object] the raw JSON object containing all
	   *     metadata from the credentials resource
	   */
	  loadCredentials: function loadCredentials(callback) {
	    var self = this;
	    var basePath = '/latest/meta-data/iam/security-credentials/';
	    self.loadCredentialsCallbacks.push(callback);
	    if (self.loadCredentialsCallbacks.length > 1) { return; }

	    function callbacks(err, creds) {
	      var cb;
	      while ((cb = self.loadCredentialsCallbacks.shift()) !== undefined) {
	        cb(err, creds);
	      }
	    }

	    self.request(basePath, function (err, roleName) {
	      if (err) callbacks(err);
	      else {
	        roleName = roleName.split('\n')[0]; // grab first (and only) role
	        self.request(basePath + roleName, function (credErr, credData) {
	          if (credErr) callbacks(credErr);
	          else {
	            try {
	              var credentials = JSON.parse(credData);
	              callbacks(null, credentials);
	            } catch (parseError) {
	              callbacks(parseError);
	            }
	          }
	        });
	      }
	    });
	  }
	});

	module.exports = AWS.MetadataService;


/***/ },
/* 143 */
/***/ function(module, exports, __webpack_require__) {

	var AWS = __webpack_require__(5);

	/**
	 * Represents credentials received from relative URI specified in the ECS container.
	 *
	 * This class will request refreshable credentials from the relative URI
	 * specified by the AWS_CONTAINER_CREDENTIALS_RELATIVE_URI environment variable
	 * in the container. If valid credentials are returned in the response, these
	 * will be used with zero configuration.
	 *
	 * This credentials class will by default timeout after 1 second of inactivity
	 * and retry 3 times.
	 * If your requests to the relative URI are timing out, you can increase
	 * the value by configuring them directly:
	 *
	 * ```javascript
	 * AWS.config.credentials = new AWS.ECSCredentials({
	 *   httpOptions: { timeout: 5000 }, // 5 second timeout
	 *   maxRetries: 10, // retry 10 times
	 *   retryDelayOptions: { base: 200 } // see AWS.Config for information
	 * });
	 * ```
	 *
	 * @see AWS.Config.retryDelayOptions
	 *
	 * @!macro nobrowser
	 */
	AWS.ECSCredentials = AWS.util.inherit(AWS.Credentials, {
	  constructor: function ECSCredentials(options) {
	    AWS.Credentials.call(this);
	    options = options ? AWS.util.copy(options) : {};
	    if (!options.httpOptions) options.httpOptions = {};
	    options.httpOptions = AWS.util.merge(
	      this.httpOptions, options.httpOptions);
	    AWS.util.update(this, options);
	  },

	  /**
	   * @api private
	   */
	  httpOptions: { timeout: 1000 },

	  /**
	   * @api private
	   */
	  host: '169.254.170.2',

	  /**
	   * @api private
	   */
	  maxRetries: 3,

	  /**
	   * Sets the name of the ECS environment variable to check for relative URI
	   * If changed, please change the name in the documentation for defaultProvider
	   * in credential_provider_chain.js and in all tests in test/credentials.spec.coffee
	   *
	   * @api private
	   */
	  environmentVar: 'AWS_CONTAINER_CREDENTIALS_RELATIVE_URI',

	  /**
	   * @api private
	   */
	  getECSRelativeUri: function getECSRelativeUri() {
	    if (process && process.env) return process.env[this.environmentVar];
	  },

	  /**
	   * @api private
	   */
	  credsFormatIsValid: function credsFormatIsValid(credData) {
	    return (!!credData.AccessKeyId && !!credData.SecretAccessKey &&
	      !!credData.Token && !!credData.Expiration);
	  },

	  /**
	   * @api private
	   */
	  request: function request(path, callback) {
	    path = path || '/';
	    var httpRequest = new AWS.HttpRequest('http://' + this.host + path);
	    httpRequest.method = 'GET';
	    httpRequest.headers.Accept = 'application/json';
	    AWS.util.handleRequestWithRetries(httpRequest, this, callback);
	  },

	  /**
	   * @api private
	   */
	  refreshQueue: [],

	  /**
	   * Loads the credentials from the relative URI specified by container
	   *
	   * @callback callback function(err)
	   *   Called when the request to the relative URI responds (or fails). When
	   *   this callback is called with no error, it means that the credentials
	   *   information has been loaded into the object (as the `accessKeyId`,
	   *   `secretAccessKey`, `sessionToken`, and `expireTime` properties).
	   *   @param err [Error] if an error occurred, this value will be filled
	   * @see get
	   */
	  refresh: function refresh(callback) {
	    var self = this;
	    var refreshQueue = self.refreshQueue;
	    if (!callback) callback = function(err) { if (err) throw err; };
	    refreshQueue.push({
	      provider: self,
	      errCallback: callback
	    });
	    if (refreshQueue.length > 1) { return; }

	    function callbacks(err, creds) {
	      var call, cb;
	      while ((call = refreshQueue.shift()) !== undefined) {
	        cb = call.errCallback;
	        if (!err) AWS.util.update(call.provider, creds);
	        cb(err);
	      }
	    }

	    if (process === undefined) {
	      callbacks(AWS.util.error(
	        new Error('No process info available'),
	        { code: 'ECSCredentialsProviderFailure' }
	      ));
	      return;
	    }
	    var relativeUri = this.getECSRelativeUri();
	    if (relativeUri === undefined) {
	      callbacks(AWS.util.error(
	        new Error('Variable ' + this.environmentVar + ' not set.'),
	        { code: 'ECSCredentialsProviderFailure' }
	      ));
	      return;
	    }

	    this.request(relativeUri, function(err, data) {
	      if (!err) {
	        try {
	          data = JSON.parse(data);
	          if (self.credsFormatIsValid(data)) {
	            var creds = {
	              expired: false,
	              accessKeyId: data.AccessKeyId,
	              secretAccessKey: data.SecretAccessKey,
	              sessionToken: data.Token,
	              expireTime: new Date(data.Expiration)
	            };
	          } else {
	            throw AWS.util.error(
	              new Error('Response data is not in valid format'),
	              { code: 'ECSCredentialsProviderFailure' }
	            );
	          }
	        } catch (dataError) {
	          err = dataError;
	        }
	      }
	      callbacks(err, creds);
	    });
	  }
	});


/***/ },
/* 144 */
/***/ function(module, exports, __webpack_require__) {

	var AWS = __webpack_require__(5);

	/**
	 * Represents credentials from the environment.
	 *
	 * By default, this class will look for the matching environment variables
	 * prefixed by a given {envPrefix}. The un-prefixed environment variable names
	 * for each credential value is listed below:
	 *
	 * ```javascript
	 * accessKeyId: ACCESS_KEY_ID
	 * secretAccessKey: SECRET_ACCESS_KEY
	 * sessionToken: SESSION_TOKEN
	 * ```
	 *
	 * With the default prefix of 'AWS', the environment variables would be:
	 *
	 *     AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_SESSION_TOKEN
	 *
	 * @!attribute envPrefix
	 *   @readonly
	 *   @return [String] the prefix for the environment variable names excluding
	 *     the separating underscore ('_').
	 */
	AWS.EnvironmentCredentials = AWS.util.inherit(AWS.Credentials, {

	  /**
	   * Creates a new EnvironmentCredentials class with a given variable
	   * prefix {envPrefix}. For example, to load credentials using the 'AWS'
	   * prefix:
	   *
	   * ```javascript
	   * var creds = new AWS.EnvironmentCredentials('AWS');
	   * creds.accessKeyId == 'AKID' // from AWS_ACCESS_KEY_ID env var
	   * ```
	   *
	   * @param envPrefix [String] the prefix to use (e.g., 'AWS') for environment
	   *   variables. Do not include the separating underscore.
	   */
	  constructor: function EnvironmentCredentials(envPrefix) {
	    AWS.Credentials.call(this);
	    this.envPrefix = envPrefix;
	    this.get(function() {});
	  },

	  /**
	   * Loads credentials from the environment using the prefixed
	   * environment variables.
	   *
	   * @callback callback function(err)
	   *   Called after the (prefixed) ACCESS_KEY_ID, SECRET_ACCESS_KEY, and
	   *   SESSION_TOKEN environment variables are read. When this callback is
	   *   called with no error, it means that the credentials information has
	   *   been loaded into the object (as the `accessKeyId`, `secretAccessKey`,
	   *   and `sessionToken` properties).
	   *   @param err [Error] if an error occurred, this value will be filled
	   * @see get
	   */
	  refresh: function refresh(callback) {
	    if (!callback) callback = function(err) { if (err) throw err; };

	    if (!process || !process.env) {
	      callback(AWS.util.error(
	        new Error('No process info or environment variables available'),
	        { code: 'EnvironmentCredentialsProviderFailure' }
	      ));
	      return;
	    }

	    var keys = ['ACCESS_KEY_ID', 'SECRET_ACCESS_KEY', 'SESSION_TOKEN'];
	    var values = [];

	    for (var i = 0; i < keys.length; i++) {
	      var prefix = '';
	      if (this.envPrefix) prefix = this.envPrefix + '_';
	      values[i] = process.env[prefix + keys[i]];
	      if (!values[i] && keys[i] !== 'SESSION_TOKEN') {
	        callback(AWS.util.error(
	          new Error('Variable ' + prefix + keys[i] + ' not set.'),
	        { code: 'EnvironmentCredentialsProviderFailure' }
	        ));
	        return;
	      }
	    }

	    this.expired = false;
	    AWS.Credentials.apply(this, values);
	    callback();
	  }

	});


/***/ },
/* 145 */
/***/ function(module, exports, __webpack_require__) {

	var AWS = __webpack_require__(5);

	/**
	 * Represents credentials from a JSON file on disk.
	 * If the credentials expire, the SDK can {refresh} the credentials
	 * from the file.
	 *
	 * The format of the file should be similar to the options passed to
	 * {AWS.Config}:
	 *
	 * ```javascript
	 * {accessKeyId: 'akid', secretAccessKey: 'secret', sessionToken: 'optional'}
	 * ```
	 *
	 * @example Loading credentials from disk
	 *   var creds = new AWS.FileSystemCredentials('./configuration.json');
	 *   creds.accessKeyId == 'AKID'
	 *
	 * @!attribute filename
	 *   @readonly
	 *   @return [String] the path to the JSON file on disk containing the
	 *     credentials.
	 * @!macro nobrowser
	 */
	AWS.FileSystemCredentials = AWS.util.inherit(AWS.Credentials, {

	  /**
	   * @overload AWS.FileSystemCredentials(filename)
	   *   Creates a new FileSystemCredentials object from a filename
	   *
	   *   @param filename [String] the path on disk to the JSON file to load.
	   */
	  constructor: function FileSystemCredentials(filename) {
	    AWS.Credentials.call(this);
	    this.filename = filename;
	    this.get(function() {});
	  },

	  /**
	   * Loads the credentials from the {filename} on disk.
	   *
	   * @callback callback function(err)
	   *   Called after the JSON file on disk is read and parsed. When this callback
	   *   is called with no error, it means that the credentials information
	   *   has been loaded into the object (as the `accessKeyId`, `secretAccessKey`,
	   *   and `sessionToken` properties).
	   *   @param err [Error] if an error occurred, this value will be filled
	   * @see get
	   */
	  refresh: function refresh(callback) {
	    if (!callback) callback = function(err) { if (err) throw err; };
	    try {
	      var creds = JSON.parse(AWS.util.readFileSync(this.filename));
	      AWS.Credentials.call(this, creds);
	      if (!this.accessKeyId || !this.secretAccessKey) {
	        throw AWS.util.error(
	          new Error('Credentials not set in ' + this.filename),
	        { code: 'FileSystemCredentialsProviderFailure' }
	        );
	      }
	      this.expired = false;
	      callback();
	    } catch (err) {
	      callback(err);
	    }
	  }

	});


/***/ },
/* 146 */
/***/ function(module, exports, __webpack_require__) {

	var AWS = __webpack_require__(5);
	var path = __webpack_require__(147);
	var STS = __webpack_require__(93);

	/**
	 * Represents credentials loaded from shared credentials file
	 * (defaulting to ~/.aws/credentials).
	 *
	 * ## Using the shared credentials file
	 *
	 * This provider is checked by default in the Node.js environment. To use the
	 * credentials file provider, simply add your access and secret keys to the
	 * ~/.aws/credentials file in the following format:
	 *
	 *     [default]
	 *     aws_access_key_id = AKID...
	 *     aws_secret_access_key = YOUR_SECRET_KEY
	 *
	 * ## Using custom profiles
	 *
	 * The SDK supports loading credentials for separate profiles. This can be done
	 * in two ways:
	 *
	 * 1. Set the `AWS_PROFILE` environment variable in your process prior to
	 *    loading the SDK.
	 * 2. Directly load the AWS.SharedIniFileCredentials provider:
	 *
	 * ```javascript
	 * var creds = new AWS.SharedIniFileCredentials({profile: 'myprofile'});
	 * AWS.config.credentials = creds;
	 * ```
	 *
	 * @!macro nobrowser
	 */
	AWS.SharedIniFileCredentials = AWS.util.inherit(AWS.Credentials, {
	  /**
	   * Creates a new SharedIniFileCredentials object.
	   *
	   * @param options [map] a set of options
	   * @option options profile [String] (AWS_PROFILE env var or 'default')
	   *   the name of the profile to load.
	   * @option options filename [String] ('~/.aws/credentials') the filename
	   *   to use when loading credentials.
	   * @option options disableAssumeRole [Boolean] (false) True to disable
	   *   support for profiles that assume an IAM role. If true, and an assume
	   *   role profile is selected, an error is raised.
	   */
	  constructor: function SharedIniFileCredentials(options) {
	    AWS.Credentials.call(this);

	    options = options || {};

	    this.filename = options.filename;
	    this.profile = options.profile || process.env.AWS_PROFILE || 'default';
	    this.disableAssumeRole = !!options.disableAssumeRole;
	    this.get(function() {});
	  },

	  /**
	   * Loads the credentials from the shared credentials file
	   *
	   * @callback callback function(err)
	   *   Called after the shared INI file on disk is read and parsed. When this
	   *   callback is called with no error, it means that the credentials
	   *   information has been loaded into the object (as the `accessKeyId`,
	   *   `secretAccessKey`, and `sessionToken` properties).
	   *   @param err [Error] if an error occurred, this value will be filled
	   * @see get
	   */
	  refresh: function refresh(callback) {
	    if (!callback) callback = function(err) { if (err) throw err; };
	    try {
	      if (!this.filename) this.loadDefaultFilename();
	      var creds = AWS.util.ini.parse(AWS.util.readFileSync(this.filename));
	      var profile = creds[this.profile];

	      if (typeof profile !== 'object') {
	        throw AWS.util.error(
	          new Error('Profile ' + this.profile + ' not found in ' + this.filename),
	          { code: 'SharedIniFileCredentialsProviderFailure' }
	        );
	      }

	      if (profile['role_arn']) {
	        this.loadRoleProfile(creds, profile, callback);
	        return;
	      }

	      this.accessKeyId = profile['aws_access_key_id'];
	      this.secretAccessKey = profile['aws_secret_access_key'];
	      this.sessionToken = profile['aws_session_token'];

	      if (!this.accessKeyId || !this.secretAccessKey) {
	        throw AWS.util.error(
	          new Error('Credentials not set in ' + this.filename +
	                    ' using profile ' + this.profile),
	          { code: 'SharedIniFileCredentialsProviderFailure' }
	        );
	      }
	      this.expired = false;
	      callback();
	    } catch (err) {
	      callback(err);
	    }
	  },

	  /**
	   * @api private
	   */
	  loadRoleProfile: function loadRoleProfile(creds, roleProfile, callback) {
	    if (this.disableAssumeRole) {
	      throw AWS.util.error(
	        new Error('Role assumption profiles are disabled. ' +
	                  'Failed to load profile ' + this.profile + ' from ' +
	                  this.filename),
	        { code: 'SharedIniFileCredentialsProviderFailure' }
	      );
	    }

	    var self = this;
	    var roleArn = roleProfile['role_arn'];
	    var roleSessionName = roleProfile['role_session_name'];
	    var externalId = roleProfile['external_id'];
	    var sourceProfileName = roleProfile['source_profile'];

	    if (!sourceProfileName) {
	      throw AWS.util.error(
	        new Error('source_profile is not set in ' + this.filename +
	                  ' using profile ' + this.profile),
	        { code: 'SharedIniFileCredentialsProviderFailure' }
	      );
	    }

	    var sourceProfile = creds[sourceProfileName];

	    if (typeof sourceProfile !== 'object') {
	      throw AWS.util.error(
	        new Error('source_profile ' + sourceProfileName + ' set in ' +
	                  this.filename + ' using profile ' + this.profile +
	                  ' does not exist'),
	        { code: 'SharedIniFileCredentialsProviderFailure' }
	      );
	    }

	    this.roleArn = roleArn;

	    var sourceCredentials = {
	      accessKeyId: sourceProfile['aws_access_key_id'],
	      secretAccessKey: sourceProfile['aws_secret_access_key'],
	      sessionToken: sourceProfile['aws_session_token']
	    };

	    if (!sourceCredentials.accessKeyId || !sourceCredentials.secretAccessKey) {
	      throw AWS.util.error(
	        new Error('Credentials not set in source_profile ' +
	                  sourceProfileName + ' set in ' + this.filename +
	                  ' using profile ' + this.profile),
	        { code: 'SharedIniFileCredentialsProviderFailure' }
	      );
	    }

	    var sts = new STS({
	      credentials: new AWS.Credentials(sourceCredentials)
	    });

	    var roleParams = {
	      RoleArn: roleArn,
	      RoleSessionName: roleSessionName || 'aws-sdk-js-' + Date.now()
	    };

	    if (externalId) {
	      roleParams.ExternalId = externalId;
	    }

	    sts.assumeRole(roleParams, function (err, data) {
	      if (err) {
	        callback(err);
	        return;
	      }

	      self.accessKeyId = data.Credentials.AccessKeyId;
	      self.secretAccessKey = data.Credentials.SecretAccessKey;
	      self.sessionToken = data.Credentials.SessionToken;
	      self.expireTime = data.Credentials.Expiration;
	      callback();
	    });
	  },

	  /**
	   * @api private
	   */
	  loadDefaultFilename: function loadDefaultFilename() {
	    var env = process.env;
	    var home = env.HOME ||
	               env.USERPROFILE ||
	               (env.HOMEPATH ? ((env.HOMEDRIVE || 'C:/') + env.HOMEPATH) : null);
	    if (!home) {
	      throw AWS.util.error(
	        new Error('Cannot load credentials, HOME path not set'),
	        { code: 'SharedIniFileCredentialsProviderFailure' }
	      );
	    }

	    this.filename = path.join(home, '.aws', 'credentials');
	  }
	});


/***/ },
/* 147 */
/***/ function(module, exports) {

	module.exports = require("path");

/***/ },
/* 148 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(3);
	var AWS = __webpack_require__(5);

	module.exports = {
	  ACM: __webpack_require__(149),
	  APIGateway: __webpack_require__(152),
	  ApplicationAutoScaling: __webpack_require__(156),
	  AppStream: __webpack_require__(159),
	  AutoScaling: __webpack_require__(162),
	  Batch: __webpack_require__(165),
	  Budgets: __webpack_require__(167),
	  CloudFormation: __webpack_require__(169),
	  CloudFront: __webpack_require__(173),
	  CloudHSM: __webpack_require__(179),
	  CloudSearch: __webpack_require__(181),
	  CloudSearchDomain: __webpack_require__(186),
	  CloudTrail: __webpack_require__(189),
	  CloudWatch: __webpack_require__(192),
	  CloudWatchEvents: __webpack_require__(196),
	  CloudWatchLogs: __webpack_require__(198),
	  CodeBuild: __webpack_require__(201),
	  CodeCommit: __webpack_require__(203),
	  CodeDeploy: __webpack_require__(206),
	  CodePipeline: __webpack_require__(210),
	  CognitoIdentity: __webpack_require__(99),
	  CognitoIdentityServiceProvider: __webpack_require__(212),
	  CognitoSync: __webpack_require__(214),
	  ConfigService: __webpack_require__(216),
	  CUR: __webpack_require__(219),
	  DataPipeline: __webpack_require__(222),
	  DeviceFarm: __webpack_require__(225),
	  DirectConnect: __webpack_require__(228),
	  DirectoryService: __webpack_require__(231),
	  Discovery: __webpack_require__(233),
	  DMS: __webpack_require__(235),
	  DynamoDB: __webpack_require__(237),
	  DynamoDBStreams: __webpack_require__(250),
	  EC2: __webpack_require__(252),
	  ECR: __webpack_require__(257),
	  ECS: __webpack_require__(260),
	  EFS: __webpack_require__(264),
	  ElastiCache: __webpack_require__(266),
	  ElasticBeanstalk: __webpack_require__(270),
	  ELB: __webpack_require__(273),
	  ELBv2: __webpack_require__(277),
	  EMR: __webpack_require__(280),
	  ES: __webpack_require__(284),
	  ElasticTranscoder: __webpack_require__(286),
	  Firehose: __webpack_require__(290),
	  GameLift: __webpack_require__(292),
	  Glacier: __webpack_require__(294),
	  Health: __webpack_require__(299),
	  IAM: __webpack_require__(302),
	  ImportExport: __webpack_require__(306),
	  Inspector: __webpack_require__(309),
	  Iot: __webpack_require__(311),
	  IotData: __webpack_require__(313),
	  Kinesis: __webpack_require__(316),
	  KinesisAnalytics: __webpack_require__(320),
	  KMS: __webpack_require__(322),
	  Lambda: __webpack_require__(325),
	  Lightsail: __webpack_require__(330),
	  MachineLearning: __webpack_require__(332),
	  MarketplaceCommerceAnalytics: __webpack_require__(337),
	  MarketplaceMetering: __webpack_require__(339),
	  MobileAnalytics: __webpack_require__(341),
	  OpsWorks: __webpack_require__(343),
	  OpsWorksCM: __webpack_require__(347),
	  Pinpoint: __webpack_require__(349),
	  Polly: __webpack_require__(351),
	  RDS: __webpack_require__(355),
	  Redshift: __webpack_require__(367),
	  Rekognition: __webpack_require__(371),
	  Route53: __webpack_require__(374),
	  Route53Domains: __webpack_require__(379),
	  S3: __webpack_require__(382),
	  ServiceCatalog: __webpack_require__(388),
	  SES: __webpack_require__(390),
	  Shield: __webpack_require__(394),
	  SimpleDB: __webpack_require__(396),
	  SMS: __webpack_require__(399),
	  Snowball: __webpack_require__(402),
	  SNS: __webpack_require__(405),
	  SQS: __webpack_require__(408),
	  SSM: __webpack_require__(412),
	  StorageGateway: __webpack_require__(415),
	  StepFunctions: __webpack_require__(418),
	  STS: __webpack_require__(93),
	  Support: __webpack_require__(421),
	  SWF: __webpack_require__(424),
	  XRay: __webpack_require__(428),
	  WAF: __webpack_require__(430),
	  WAFRegional: __webpack_require__(432),
	  WorkSpaces: __webpack_require__(434)
	};

/***/ },
/* 149 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(3);
	var AWS = __webpack_require__(5);
	var Service = __webpack_require__(86);
	var apiLoader = __webpack_require__(94);

	apiLoader.services['acm'] = {};
	AWS.ACM = Service.defineService('acm', ['2015-12-08']);
	Object.defineProperty(apiLoader.services['acm'], '2015-12-08', {
	  get: function get() {
	    var model = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/acm-2015-12-08.min.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	    model.paginators = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/acm-2015-12-08.paginators.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())).pagination;
	    return model;
	  },
	  enumerable: true,
	  configurable: true
	});

	module.exports = AWS.ACM;


/***/ },
/* 150 */,
/* 151 */,
/* 152 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(3);
	var AWS = __webpack_require__(5);
	var Service = __webpack_require__(86);
	var apiLoader = __webpack_require__(94);

	apiLoader.services['apigateway'] = {};
	AWS.APIGateway = Service.defineService('apigateway', ['2015-07-09']);
	__webpack_require__(153);
	Object.defineProperty(apiLoader.services['apigateway'], '2015-07-09', {
	  get: function get() {
	    var model = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/apigateway-2015-07-09.min.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	    model.paginators = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/apigateway-2015-07-09.paginators.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())).pagination;
	    return model;
	  },
	  enumerable: true,
	  configurable: true
	});

	module.exports = AWS.APIGateway;


/***/ },
/* 153 */
/***/ function(module, exports, __webpack_require__) {

	var AWS = __webpack_require__(5);

	AWS.util.update(AWS.APIGateway.prototype, {
	/**
	 * Sets the Accept header to application/json.
	 *
	 * @api private
	 */
	  setAcceptHeader: function setAcceptHeader(req) {
	    var httpRequest = req.httpRequest;
	    httpRequest.headers['Accept'] = 'application/json';
	  },

	  /**
	   * @api private
	   */
	  setupRequestListeners: function setupRequestListeners(request) {
	    request.addListener('build', this.setAcceptHeader);
	    if (request.operation === 'getSdk') {
	      request.addListener('extractData', this.useRawPayload);
	    }
	  },

	  useRawPayload: function useRawPayload(resp) {
	    var req = resp.request;
	    var operation = req.operation;
	    var rules = req.service.api.operations[operation].output || {};
	    if (rules.payload) {
	      var body = resp.httpResponse.body;
	      resp.data[rules.payload] = body;
	    }
	  }
	});



/***/ },
/* 154 */,
/* 155 */,
/* 156 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(3);
	var AWS = __webpack_require__(5);
	var Service = __webpack_require__(86);
	var apiLoader = __webpack_require__(94);

	apiLoader.services['applicationautoscaling'] = {};
	AWS.ApplicationAutoScaling = Service.defineService('applicationautoscaling', ['2016-02-06']);
	Object.defineProperty(apiLoader.services['applicationautoscaling'], '2016-02-06', {
	  get: function get() {
	    var model = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/application-autoscaling-2016-02-06.min.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	    model.paginators = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/application-autoscaling-2016-02-06.paginators.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())).pagination;
	    return model;
	  },
	  enumerable: true,
	  configurable: true
	});

	module.exports = AWS.ApplicationAutoScaling;


/***/ },
/* 157 */,
/* 158 */,
/* 159 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(3);
	var AWS = __webpack_require__(5);
	var Service = __webpack_require__(86);
	var apiLoader = __webpack_require__(94);

	apiLoader.services['appstream'] = {};
	AWS.AppStream = Service.defineService('appstream', ['2016-12-01']);
	Object.defineProperty(apiLoader.services['appstream'], '2016-12-01', {
	  get: function get() {
	    var model = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/appstream-2016-12-01.min.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	    model.waiters = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/appstream-2016-12-01.waiters2.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())).waiters;
	    return model;
	  },
	  enumerable: true,
	  configurable: true
	});

	module.exports = AWS.AppStream;


/***/ },
/* 160 */,
/* 161 */,
/* 162 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(3);
	var AWS = __webpack_require__(5);
	var Service = __webpack_require__(86);
	var apiLoader = __webpack_require__(94);

	apiLoader.services['autoscaling'] = {};
	AWS.AutoScaling = Service.defineService('autoscaling', ['2011-01-01']);
	Object.defineProperty(apiLoader.services['autoscaling'], '2011-01-01', {
	  get: function get() {
	    var model = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/autoscaling-2011-01-01.min.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	    model.paginators = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/autoscaling-2011-01-01.paginators.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())).pagination;
	    return model;
	  },
	  enumerable: true,
	  configurable: true
	});

	module.exports = AWS.AutoScaling;


/***/ },
/* 163 */,
/* 164 */,
/* 165 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(3);
	var AWS = __webpack_require__(5);
	var Service = __webpack_require__(86);
	var apiLoader = __webpack_require__(94);

	apiLoader.services['batch'] = {};
	AWS.Batch = Service.defineService('batch', ['2016-08-10']);
	Object.defineProperty(apiLoader.services['batch'], '2016-08-10', {
	  get: function get() {
	    var model = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/batch-2016-08-10.min.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	    return model;
	  },
	  enumerable: true,
	  configurable: true
	});

	module.exports = AWS.Batch;


/***/ },
/* 166 */,
/* 167 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(3);
	var AWS = __webpack_require__(5);
	var Service = __webpack_require__(86);
	var apiLoader = __webpack_require__(94);

	apiLoader.services['budgets'] = {};
	AWS.Budgets = Service.defineService('budgets', ['2016-10-20']);
	Object.defineProperty(apiLoader.services['budgets'], '2016-10-20', {
	  get: function get() {
	    var model = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/budgets-2016-10-20.min.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	    return model;
	  },
	  enumerable: true,
	  configurable: true
	});

	module.exports = AWS.Budgets;


/***/ },
/* 168 */,
/* 169 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(3);
	var AWS = __webpack_require__(5);
	var Service = __webpack_require__(86);
	var apiLoader = __webpack_require__(94);

	apiLoader.services['cloudformation'] = {};
	AWS.CloudFormation = Service.defineService('cloudformation', ['2010-05-15']);
	Object.defineProperty(apiLoader.services['cloudformation'], '2010-05-15', {
	  get: function get() {
	    var model = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/cloudformation-2010-05-15.min.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	    model.paginators = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/cloudformation-2010-05-15.paginators.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())).pagination;
	    model.waiters = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/cloudformation-2010-05-15.waiters2.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())).waiters;
	    return model;
	  },
	  enumerable: true,
	  configurable: true
	});

	module.exports = AWS.CloudFormation;


/***/ },
/* 170 */,
/* 171 */,
/* 172 */,
/* 173 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(3);
	var AWS = __webpack_require__(5);
	var Service = __webpack_require__(86);
	var apiLoader = __webpack_require__(94);

	apiLoader.services['cloudfront'] = {};
	AWS.CloudFront = Service.defineService('cloudfront', ['2013-05-12*', '2013-11-11*', '2014-05-31*', '2014-10-21*', '2014-11-06*', '2015-04-17*', '2015-07-27*', '2015-09-17*', '2016-01-13*', '2016-01-28*', '2016-08-01*', '2016-08-20*', '2016-09-07*', '2016-09-29*', '2016-11-25']);
	__webpack_require__(174);
	Object.defineProperty(apiLoader.services['cloudfront'], '2016-11-25', {
	  get: function get() {
	    var model = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/cloudfront-2016-11-25.min.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	    model.paginators = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/cloudfront-2016-11-25.paginators.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())).pagination;
	    model.waiters = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/cloudfront-2016-11-25.waiters2.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())).waiters;
	    return model;
	  },
	  enumerable: true,
	  configurable: true
	});

	module.exports = AWS.CloudFront;


/***/ },
/* 174 */
/***/ function(module, exports, __webpack_require__) {

	var AWS = __webpack_require__(5);

	// pull in CloudFront signer
	__webpack_require__(175);

	AWS.util.update(AWS.CloudFront.prototype, {

	  setupRequestListeners: function setupRequestListeners(request) {
	    request.addListener('extractData', AWS.util.hoistPayloadMember);
	  }

	});


/***/ },
/* 175 */
/***/ function(module, exports, __webpack_require__) {

	var AWS = __webpack_require__(5),
	    url = AWS.util.url,
	    crypto = AWS.util.crypto.lib,
	    base64Encode = AWS.util.base64.encode,
	    inherit = AWS.util.inherit;

	var queryEncode = function (string) {
	    var replacements = {
	        '+': '-',
	        '=': '_',
	        '/': '~'
	    };
	    return string.replace(/[\+=\/]/g, function (match) {
	        return replacements[match];
	    });
	};

	var signPolicy = function (policy, privateKey) {
	    var sign = crypto.createSign('RSA-SHA1');
	    sign.write(policy);
	    return queryEncode(sign.sign(privateKey, 'base64'))
	};

	var signWithCannedPolicy = function (url, expires, keyPairId, privateKey) {
	    var policy = JSON.stringify({
	        Statement: [
	            {
	                Resource: url,
	                Condition: { DateLessThan: { 'AWS:EpochTime': expires } }
	            }
	        ]
	    });

	    return {
	        Expires: expires,
	        'Key-Pair-Id': keyPairId,
	        Signature: signPolicy(policy.toString(), privateKey)
	    };
	};

	var signWithCustomPolicy = function (policy, keyPairId, privateKey) {
	    policy = policy.replace(/\s/mg, policy);

	    return {
	        Policy: queryEncode(base64Encode(policy)),
	        'Key-Pair-Id': keyPairId,
	        Signature: signPolicy(policy, privateKey)
	    }
	};

	var determineScheme = function (url) {
	    var parts = url.split('://');
	    if (parts.length < 2) {
	        throw new Error('Invalid URL.');
	    }

	    return parts[0].replace('*', '');
	};

	var getRtmpUrl = function (rtmpUrl) {
	    var parsed = url.parse(rtmpUrl);
	    return parsed.path.replace(/^\//, '') + (parsed.hash || '');
	};

	var getResource = function (url) {
	    switch (determineScheme(url)) {
	        case 'http':
	        case 'https':
	            return url;
	        case 'rtmp':
	            return getRtmpUrl(url);
	        default:
	            throw new Error('Invalid URI scheme. Scheme must be one of'
	                + ' http, https, or rtmp');
	    }
	};

	var handleError = function (err, callback) {
	    if (!callback || typeof callback !== 'function') {
	        throw err;
	    }

	    callback(err);
	};

	var handleSuccess = function (result, callback) {
	    if (!callback || typeof callback !== 'function') {
	        return result;
	    }

	    callback(null, result);
	};

	AWS.CloudFront.Signer = inherit({
	    /**
	     * A signer object can be used to generate signed URLs and cookies for granting
	     * access to content on restricted CloudFront distributions.
	     *
	     * @see http://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/PrivateContent.html
	     *
	     * @param keyPairId [String]    (Required) The ID of the CloudFront key pair
	     *                              being used.
	     * @param privateKey [String]   (Required) A private key in RSA format.
	     */
	    constructor: function Signer(keyPairId, privateKey) {
	        if (keyPairId === void 0 || privateKey === void 0) {
	            throw new Error('A key pair ID and private key are required');
	        }

	        this.keyPairId = keyPairId;
	        this.privateKey = privateKey;
	    },

	    /**
	     * Create a signed Amazon CloudFront Cookie.
	     *
	     * @param options [Object]            The options to create a signed cookie.
	     * @option options url [String]     The URL to which the signature will grant
	     *                                  access. Required unless you pass in a full
	     *                                  policy.
	     * @option options expires [Number] A Unix UTC timestamp indicating when the
	     *                                  signature should expire. Required unless you
	     *                                  pass in a full policy.
	     * @option options policy [String]  A CloudFront JSON policy. Required unless
	     *                                  you pass in a url and an expiry time.
	     *
	     * @param cb [Function] if a callback is provided, this function will
	     *   pass the hash as the second parameter (after the error parameter) to
	     *   the callback function.
	     *
	     * @return [Object] if called synchronously (with no callback), returns the
	     *   signed cookie parameters.
	     * @return [null] nothing is returned if a callback is provided.
	     */
	    getSignedCookie: function (options, cb) {
	        var signatureHash = 'policy' in options
	            ? signWithCustomPolicy(options.policy, this.keyPairId, this.privateKey)
	            : signWithCannedPolicy(options.url, options.expires, this.keyPairId, this.privateKey);

	        var cookieHash = {};
	        for (var key in signatureHash) {
	            if (Object.prototype.hasOwnProperty.call(signatureHash, key)) {
	                cookieHash['CloudFront-' + key] = signatureHash[key];
	            }
	        }

	        return handleSuccess(cookieHash, cb);
	    },

	    /**
	     * Create a signed Amazon CloudFront URL.
	     *
	     * Keep in mind that URLs meant for use in media/flash players may have
	     * different requirements for URL formats (e.g. some require that the
	     * extension be removed, some require the file name to be prefixed
	     * - mp4:<path>, some require you to add "/cfx/st" into your URL).
	     *
	     * @param options [Object]          The options to create a signed URL.
	     * @option options url [String]     The URL to which the signature will grant
	     *                                  access. Required.
	     * @option options expires [Number] A Unix UTC timestamp indicating when the
	     *                                  signature should expire. Required unless you
	     *                                  pass in a full policy.
	     * @option options policy [String]  A CloudFront JSON policy. Required unless
	     *                                  you pass in a url and an expiry time.
	     *
	     * @param cb [Function] if a callback is provided, this function will
	     *   pass the URL as the second parameter (after the error parameter) to
	     *   the callback function.
	     *
	     * @return [String] if called synchronously (with no callback), returns the
	     *   signed URL.
	     * @return [null] nothing is returned if a callback is provided.
	     */
	    getSignedUrl: function (options, cb) {
	        try {
	            var resource = getResource(options.url);
	        } catch (err) {
	            return handleError(err, cb);
	        }

	        var parsedUrl = url.parse(options.url, true),
	            signatureHash = Object.prototype.hasOwnProperty.call(options, 'policy')
	                ? signWithCustomPolicy(options.policy, this.keyPairId, this.privateKey)
	                : signWithCannedPolicy(resource, options.expires, this.keyPairId, this.privateKey);

	        parsedUrl.search = null;
	        for (var key in signatureHash) {
	            if (Object.prototype.hasOwnProperty.call(signatureHash, key)) {
	                parsedUrl.query[key] = signatureHash[key];
	            }
	        }

	        try {
	            var signedUrl = determineScheme(options.url) === 'rtmp'
	                    ? getRtmpUrl(url.format(parsedUrl))
	                    : url.format(parsedUrl);
	        } catch (err) {
	            return handleError(err, cb);
	        }

	        return handleSuccess(signedUrl, cb);
	    }
	});

	module.exports = AWS.CloudFront.Signer;


/***/ },
/* 176 */,
/* 177 */,
/* 178 */,
/* 179 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(3);
	var AWS = __webpack_require__(5);
	var Service = __webpack_require__(86);
	var apiLoader = __webpack_require__(94);

	apiLoader.services['cloudhsm'] = {};
	AWS.CloudHSM = Service.defineService('cloudhsm', ['2014-05-30']);
	Object.defineProperty(apiLoader.services['cloudhsm'], '2014-05-30', {
	  get: function get() {
	    var model = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/cloudhsm-2014-05-30.min.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	    return model;
	  },
	  enumerable: true,
	  configurable: true
	});

	module.exports = AWS.CloudHSM;


/***/ },
/* 180 */,
/* 181 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(3);
	var AWS = __webpack_require__(5);
	var Service = __webpack_require__(86);
	var apiLoader = __webpack_require__(94);

	apiLoader.services['cloudsearch'] = {};
	AWS.CloudSearch = Service.defineService('cloudsearch', ['2011-02-01', '2013-01-01']);
	Object.defineProperty(apiLoader.services['cloudsearch'], '2011-02-01', {
	  get: function get() {
	    var model = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/cloudsearch-2011-02-01.min.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	    model.paginators = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/cloudsearch-2011-02-01.paginators.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())).pagination;
	    return model;
	  },
	  enumerable: true,
	  configurable: true
	});
	Object.defineProperty(apiLoader.services['cloudsearch'], '2013-01-01', {
	  get: function get() {
	    var model = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/cloudsearch-2013-01-01.min.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	    model.paginators = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/cloudsearch-2013-01-01.paginators.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())).pagination;
	    return model;
	  },
	  enumerable: true,
	  configurable: true
	});

	module.exports = AWS.CloudSearch;


/***/ },
/* 182 */,
/* 183 */,
/* 184 */,
/* 185 */,
/* 186 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(3);
	var AWS = __webpack_require__(5);
	var Service = __webpack_require__(86);
	var apiLoader = __webpack_require__(94);

	apiLoader.services['cloudsearchdomain'] = {};
	AWS.CloudSearchDomain = Service.defineService('cloudsearchdomain', ['2013-01-01']);
	__webpack_require__(187);
	Object.defineProperty(apiLoader.services['cloudsearchdomain'], '2013-01-01', {
	  get: function get() {
	    var model = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/cloudsearchdomain-2013-01-01.min.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	    return model;
	  },
	  enumerable: true,
	  configurable: true
	});

	module.exports = AWS.CloudSearchDomain;


/***/ },
/* 187 */
/***/ function(module, exports, __webpack_require__) {

	var AWS = __webpack_require__(5);

	/**
	 * Constructs a service interface object. Each API operation is exposed as a
	 * function on service.
	 *
	 * ### Sending a Request Using CloudSearchDomain
	 *
	 * ```javascript
	 * var csd = new AWS.CloudSearchDomain({endpoint: 'my.host.tld'});
	 * csd.search(params, function (err, data) {
	 *   if (err) console.log(err, err.stack); // an error occurred
	 *   else     console.log(data);           // successful response
	 * });
	 * ```
	 *
	 * ### Locking the API Version
	 *
	 * In order to ensure that the CloudSearchDomain object uses this specific API,
	 * you can construct the object by passing the `apiVersion` option to the
	 * constructor:
	 *
	 * ```javascript
	 * var csd = new AWS.CloudSearchDomain({
	 *   endpoint: 'my.host.tld',
	 *   apiVersion: '2013-01-01'
	 * });
	 * ```
	 *
	 * You can also set the API version globally in `AWS.config.apiVersions` using
	 * the **cloudsearchdomain** service identifier:
	 *
	 * ```javascript
	 * AWS.config.apiVersions = {
	 *   cloudsearchdomain: '2013-01-01',
	 *   // other service API versions
	 * };
	 *
	 * var csd = new AWS.CloudSearchDomain({endpoint: 'my.host.tld'});
	 * ```
	 *
	 * @note You *must* provide an `endpoint` configuration parameter when
	 *   constructing this service. See {constructor} for more information.
	 *
	 * @!method constructor(options = {})
	 *   Constructs a service object. This object has one method for each
	 *   API operation.
	 *
	 *   @example Constructing a CloudSearchDomain object
	 *     var csd = new AWS.CloudSearchDomain({endpoint: 'my.host.tld'});
	 *   @note You *must* provide an `endpoint` when constructing this service.
	 *   @option (see AWS.Config.constructor)
	 *
	 * @service cloudsearchdomain
	 * @version 2013-01-01
	 */
	AWS.util.update(AWS.CloudSearchDomain.prototype, {
	  /**
	   * @api private
	   */
	  validateService: function validateService() {
	    if (!this.config.endpoint || this.config.endpoint.indexOf('{') >= 0) {
	      var msg = 'AWS.CloudSearchDomain requires an explicit ' +
	                '`endpoint\' configuration option.';
	      throw AWS.util.error(new Error(),
	        {name: 'InvalidEndpoint', message: msg});
	    }
	  },

	  /**
	   * @api private
	   */
	  setupRequestListeners: function setupRequestListeners(request) {
	    request.removeListener('validate',
	      AWS.EventListeners.Core.VALIDATE_CREDENTIALS
	    );
	    request.onAsync('validate', this.validateCredentials);
	    request.addListener('validate', this.updateRegion);
	    if (request.operation === 'search') {
	      request.addListener('build', this.convertGetToPost);
	    }
	  },

	  /**
	   * @api private
	   */
	  validateCredentials: function(req, done) {
	    if (!req.service.api.signatureVersion) return done(); // none
	    req.service.config.getCredentials(function(err) {
	      if (err) {
	        req.removeListener('sign', AWS.EventListeners.Core.SIGN);
	      }
	      done();
	    });
	  },

	  /**
	   * @api private
	   */
	  convertGetToPost: function(request) {
	    var httpRequest = request.httpRequest
	    // convert queries to POST to avoid length restrictions
	    var path = httpRequest.path.split('?')
	    httpRequest.method = 'POST'
	    httpRequest.path = path[0]
	    httpRequest.body = path[1]
	    httpRequest.headers['Content-Length'] = httpRequest.body.length
	    httpRequest.headers['Content-Type'] = 'application/x-www-form-urlencoded'
	  },

	  /**
	   * @api private
	   */
	  updateRegion: function updateRegion(request) {
	    var endpoint = request.httpRequest.endpoint.hostname;
	    var zones = endpoint.split('.');
	    request.httpRequest.region = zones[1] || request.httpRequest.region;
	  }

	});


/***/ },
/* 188 */,
/* 189 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(3);
	var AWS = __webpack_require__(5);
	var Service = __webpack_require__(86);
	var apiLoader = __webpack_require__(94);

	apiLoader.services['cloudtrail'] = {};
	AWS.CloudTrail = Service.defineService('cloudtrail', ['2013-11-01']);
	Object.defineProperty(apiLoader.services['cloudtrail'], '2013-11-01', {
	  get: function get() {
	    var model = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/cloudtrail-2013-11-01.min.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	    model.paginators = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/cloudtrail-2013-11-01.paginators.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())).pagination;
	    return model;
	  },
	  enumerable: true,
	  configurable: true
	});

	module.exports = AWS.CloudTrail;


/***/ },
/* 190 */,
/* 191 */,
/* 192 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(3);
	var AWS = __webpack_require__(5);
	var Service = __webpack_require__(86);
	var apiLoader = __webpack_require__(94);

	apiLoader.services['cloudwatch'] = {};
	AWS.CloudWatch = Service.defineService('cloudwatch', ['2010-08-01']);
	Object.defineProperty(apiLoader.services['cloudwatch'], '2010-08-01', {
	  get: function get() {
	    var model = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/monitoring-2010-08-01.min.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	    model.paginators = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/monitoring-2010-08-01.paginators.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())).pagination;
	    model.waiters = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/monitoring-2010-08-01.waiters2.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())).waiters;
	    return model;
	  },
	  enumerable: true,
	  configurable: true
	});

	module.exports = AWS.CloudWatch;


/***/ },
/* 193 */,
/* 194 */,
/* 195 */,
/* 196 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(3);
	var AWS = __webpack_require__(5);
	var Service = __webpack_require__(86);
	var apiLoader = __webpack_require__(94);

	apiLoader.services['cloudwatchevents'] = {};
	AWS.CloudWatchEvents = Service.defineService('cloudwatchevents', ['2014-02-03*', '2015-10-07']);
	Object.defineProperty(apiLoader.services['cloudwatchevents'], '2015-10-07', {
	  get: function get() {
	    var model = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/events-2015-10-07.min.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	    return model;
	  },
	  enumerable: true,
	  configurable: true
	});

	module.exports = AWS.CloudWatchEvents;


/***/ },
/* 197 */,
/* 198 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(3);
	var AWS = __webpack_require__(5);
	var Service = __webpack_require__(86);
	var apiLoader = __webpack_require__(94);

	apiLoader.services['cloudwatchlogs'] = {};
	AWS.CloudWatchLogs = Service.defineService('cloudwatchlogs', ['2014-03-28']);
	Object.defineProperty(apiLoader.services['cloudwatchlogs'], '2014-03-28', {
	  get: function get() {
	    var model = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/logs-2014-03-28.min.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	    model.paginators = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/logs-2014-03-28.paginators.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())).pagination;
	    return model;
	  },
	  enumerable: true,
	  configurable: true
	});

	module.exports = AWS.CloudWatchLogs;


/***/ },
/* 199 */,
/* 200 */,
/* 201 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(3);
	var AWS = __webpack_require__(5);
	var Service = __webpack_require__(86);
	var apiLoader = __webpack_require__(94);

	apiLoader.services['codebuild'] = {};
	AWS.CodeBuild = Service.defineService('codebuild', ['2016-10-06']);
	Object.defineProperty(apiLoader.services['codebuild'], '2016-10-06', {
	  get: function get() {
	    var model = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/codebuild-2016-10-06.min.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	    return model;
	  },
	  enumerable: true,
	  configurable: true
	});

	module.exports = AWS.CodeBuild;


/***/ },
/* 202 */,
/* 203 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(3);
	var AWS = __webpack_require__(5);
	var Service = __webpack_require__(86);
	var apiLoader = __webpack_require__(94);

	apiLoader.services['codecommit'] = {};
	AWS.CodeCommit = Service.defineService('codecommit', ['2015-04-13']);
	Object.defineProperty(apiLoader.services['codecommit'], '2015-04-13', {
	  get: function get() {
	    var model = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/codecommit-2015-04-13.min.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	    model.paginators = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/codecommit-2015-04-13.paginators.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())).pagination;
	    return model;
	  },
	  enumerable: true,
	  configurable: true
	});

	module.exports = AWS.CodeCommit;


/***/ },
/* 204 */,
/* 205 */,
/* 206 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(3);
	var AWS = __webpack_require__(5);
	var Service = __webpack_require__(86);
	var apiLoader = __webpack_require__(94);

	apiLoader.services['codedeploy'] = {};
	AWS.CodeDeploy = Service.defineService('codedeploy', ['2014-10-06']);
	Object.defineProperty(apiLoader.services['codedeploy'], '2014-10-06', {
	  get: function get() {
	    var model = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/codedeploy-2014-10-06.min.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	    model.paginators = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/codedeploy-2014-10-06.paginators.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())).pagination;
	    model.waiters = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/codedeploy-2014-10-06.waiters2.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())).waiters;
	    return model;
	  },
	  enumerable: true,
	  configurable: true
	});

	module.exports = AWS.CodeDeploy;


/***/ },
/* 207 */,
/* 208 */,
/* 209 */,
/* 210 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(3);
	var AWS = __webpack_require__(5);
	var Service = __webpack_require__(86);
	var apiLoader = __webpack_require__(94);

	apiLoader.services['codepipeline'] = {};
	AWS.CodePipeline = Service.defineService('codepipeline', ['2015-07-09']);
	Object.defineProperty(apiLoader.services['codepipeline'], '2015-07-09', {
	  get: function get() {
	    var model = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/codepipeline-2015-07-09.min.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	    return model;
	  },
	  enumerable: true,
	  configurable: true
	});

	module.exports = AWS.CodePipeline;


/***/ },
/* 211 */,
/* 212 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(3);
	var AWS = __webpack_require__(5);
	var Service = __webpack_require__(86);
	var apiLoader = __webpack_require__(94);

	apiLoader.services['cognitoidentityserviceprovider'] = {};
	AWS.CognitoIdentityServiceProvider = Service.defineService('cognitoidentityserviceprovider', ['2016-04-18']);
	Object.defineProperty(apiLoader.services['cognitoidentityserviceprovider'], '2016-04-18', {
	  get: function get() {
	    var model = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/cognito-idp-2016-04-18.min.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	    return model;
	  },
	  enumerable: true,
	  configurable: true
	});

	module.exports = AWS.CognitoIdentityServiceProvider;


/***/ },
/* 213 */,
/* 214 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(3);
	var AWS = __webpack_require__(5);
	var Service = __webpack_require__(86);
	var apiLoader = __webpack_require__(94);

	apiLoader.services['cognitosync'] = {};
	AWS.CognitoSync = Service.defineService('cognitosync', ['2014-06-30']);
	Object.defineProperty(apiLoader.services['cognitosync'], '2014-06-30', {
	  get: function get() {
	    var model = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/cognito-sync-2014-06-30.min.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	    return model;
	  },
	  enumerable: true,
	  configurable: true
	});

	module.exports = AWS.CognitoSync;


/***/ },
/* 215 */,
/* 216 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(3);
	var AWS = __webpack_require__(5);
	var Service = __webpack_require__(86);
	var apiLoader = __webpack_require__(94);

	apiLoader.services['configservice'] = {};
	AWS.ConfigService = Service.defineService('configservice', ['2014-11-12']);
	Object.defineProperty(apiLoader.services['configservice'], '2014-11-12', {
	  get: function get() {
	    var model = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/config-2014-11-12.min.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	    model.paginators = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/config-2014-11-12.paginators.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())).pagination;
	    return model;
	  },
	  enumerable: true,
	  configurable: true
	});

	module.exports = AWS.ConfigService;


/***/ },
/* 217 */,
/* 218 */,
/* 219 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(3);
	var AWS = __webpack_require__(5);
	var Service = __webpack_require__(86);
	var apiLoader = __webpack_require__(94);

	apiLoader.services['cur'] = {};
	AWS.CUR = Service.defineService('cur', ['2017-01-06']);
	Object.defineProperty(apiLoader.services['cur'], '2017-01-06', {
	  get: function get() {
	    var model = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/cur-2017-01-06.min.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	    model.paginators = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/cur-2017-01-06.paginators.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())).pagination;
	    return model;
	  },
	  enumerable: true,
	  configurable: true
	});

	module.exports = AWS.CUR;


/***/ },
/* 220 */,
/* 221 */,
/* 222 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(3);
	var AWS = __webpack_require__(5);
	var Service = __webpack_require__(86);
	var apiLoader = __webpack_require__(94);

	apiLoader.services['datapipeline'] = {};
	AWS.DataPipeline = Service.defineService('datapipeline', ['2012-10-29']);
	Object.defineProperty(apiLoader.services['datapipeline'], '2012-10-29', {
	  get: function get() {
	    var model = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/datapipeline-2012-10-29.min.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	    model.paginators = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/datapipeline-2012-10-29.paginators.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())).pagination;
	    return model;
	  },
	  enumerable: true,
	  configurable: true
	});

	module.exports = AWS.DataPipeline;


/***/ },
/* 223 */,
/* 224 */,
/* 225 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(3);
	var AWS = __webpack_require__(5);
	var Service = __webpack_require__(86);
	var apiLoader = __webpack_require__(94);

	apiLoader.services['devicefarm'] = {};
	AWS.DeviceFarm = Service.defineService('devicefarm', ['2015-06-23']);
	Object.defineProperty(apiLoader.services['devicefarm'], '2015-06-23', {
	  get: function get() {
	    var model = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/devicefarm-2015-06-23.min.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	    model.paginators = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/devicefarm-2015-06-23.paginators.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())).pagination;
	    return model;
	  },
	  enumerable: true,
	  configurable: true
	});

	module.exports = AWS.DeviceFarm;


/***/ },
/* 226 */,
/* 227 */,
/* 228 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(3);
	var AWS = __webpack_require__(5);
	var Service = __webpack_require__(86);
	var apiLoader = __webpack_require__(94);

	apiLoader.services['directconnect'] = {};
	AWS.DirectConnect = Service.defineService('directconnect', ['2012-10-25']);
	Object.defineProperty(apiLoader.services['directconnect'], '2012-10-25', {
	  get: function get() {
	    var model = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/directconnect-2012-10-25.min.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	    model.paginators = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/directconnect-2012-10-25.paginators.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())).pagination;
	    return model;
	  },
	  enumerable: true,
	  configurable: true
	});

	module.exports = AWS.DirectConnect;


/***/ },
/* 229 */,
/* 230 */,
/* 231 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(3);
	var AWS = __webpack_require__(5);
	var Service = __webpack_require__(86);
	var apiLoader = __webpack_require__(94);

	apiLoader.services['directoryservice'] = {};
	AWS.DirectoryService = Service.defineService('directoryservice', ['2015-04-16']);
	Object.defineProperty(apiLoader.services['directoryservice'], '2015-04-16', {
	  get: function get() {
	    var model = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/ds-2015-04-16.min.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	    return model;
	  },
	  enumerable: true,
	  configurable: true
	});

	module.exports = AWS.DirectoryService;


/***/ },
/* 232 */,
/* 233 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(3);
	var AWS = __webpack_require__(5);
	var Service = __webpack_require__(86);
	var apiLoader = __webpack_require__(94);

	apiLoader.services['discovery'] = {};
	AWS.Discovery = Service.defineService('discovery', ['2015-11-01']);
	Object.defineProperty(apiLoader.services['discovery'], '2015-11-01', {
	  get: function get() {
	    var model = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/discovery-2015-11-01.min.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	    return model;
	  },
	  enumerable: true,
	  configurable: true
	});

	module.exports = AWS.Discovery;


/***/ },
/* 234 */,
/* 235 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(3);
	var AWS = __webpack_require__(5);
	var Service = __webpack_require__(86);
	var apiLoader = __webpack_require__(94);

	apiLoader.services['dms'] = {};
	AWS.DMS = Service.defineService('dms', ['2016-01-01']);
	Object.defineProperty(apiLoader.services['dms'], '2016-01-01', {
	  get: function get() {
	    var model = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/dms-2016-01-01.min.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	    return model;
	  },
	  enumerable: true,
	  configurable: true
	});

	module.exports = AWS.DMS;


/***/ },
/* 236 */,
/* 237 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(3);
	var AWS = __webpack_require__(5);
	var Service = __webpack_require__(86);
	var apiLoader = __webpack_require__(94);

	apiLoader.services['dynamodb'] = {};
	AWS.DynamoDB = Service.defineService('dynamodb', ['2011-12-05', '2012-08-10']);
	__webpack_require__(238);
	Object.defineProperty(apiLoader.services['dynamodb'], '2011-12-05', {
	  get: function get() {
	    var model = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/dynamodb-2011-12-05.min.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	    model.paginators = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/dynamodb-2011-12-05.paginators.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())).pagination;
	    model.waiters = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/dynamodb-2011-12-05.waiters2.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())).waiters;
	    return model;
	  },
	  enumerable: true,
	  configurable: true
	});
	Object.defineProperty(apiLoader.services['dynamodb'], '2012-08-10', {
	  get: function get() {
	    var model = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/dynamodb-2012-08-10.min.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	    model.paginators = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/dynamodb-2012-08-10.paginators.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())).pagination;
	    model.waiters = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/dynamodb-2012-08-10.waiters2.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())).waiters;
	    return model;
	  },
	  enumerable: true,
	  configurable: true
	});

	module.exports = AWS.DynamoDB;


/***/ },
/* 238 */
/***/ function(module, exports, __webpack_require__) {

	var AWS = __webpack_require__(5);
	__webpack_require__(239);

	AWS.util.update(AWS.DynamoDB.prototype, {
	  /**
	   * @api private
	   */
	  setupRequestListeners: function setupRequestListeners(request) {
	    if (request.service.config.dynamoDbCrc32) {
	      request.removeListener('extractData', AWS.EventListeners.Json.EXTRACT_DATA);
	      request.addListener('extractData', this.checkCrc32);
	      request.addListener('extractData', AWS.EventListeners.Json.EXTRACT_DATA);
	    }
	  },

	  /**
	   * @api private
	   */
	  checkCrc32: function checkCrc32(resp) {
	    if (!resp.httpResponse.streaming && !resp.request.service.crc32IsValid(resp)) {
	      resp.data = null;
	      resp.error = AWS.util.error(new Error(), {
	        code: 'CRC32CheckFailed',
	        message: 'CRC32 integrity check failed',
	        retryable: true
	      });
	      resp.request.haltHandlersOnError();
	      throw (resp.error);
	    }
	  },

	  /**
	   * @api private
	   */
	  crc32IsValid: function crc32IsValid(resp) {
	    var crc = resp.httpResponse.headers['x-amz-crc32'];
	    if (!crc) return true; // no (valid) CRC32 header
	    return parseInt(crc, 10) === AWS.util.crypto.crc32(resp.httpResponse.body);
	  },

	  /**
	   * @api private
	   */
	  defaultRetryCount: 10,

	  /**
	   * @api private
	   */
	  retryDelays: function retryDelays(retryCount) {
	    var delay = retryCount > 0 ? (50 * Math.pow(2, retryCount - 1)) : 0;
	    return delay;
	  }
	});


/***/ },
/* 239 */
/***/ function(module, exports, __webpack_require__) {

	var AWS = __webpack_require__(5);
	var Translator = __webpack_require__(240);
	var DynamoDBSet = __webpack_require__(243);

	/**
	 * The document client simplifies working with items in Amazon DynamoDB
	 * by abstracting away the notion of attribute values. This abstraction
	 * annotates native JavaScript types supplied as input parameters, as well
	 * as converts annotated response data to native JavaScript types.
	 *
	 * ## Marshalling Input and Unmarshalling Response Data
	 *
	 * The document client affords developers the use of native JavaScript types
	 * instead of `AttributeValue`s to simplify the JavaScript development
	 * experience with Amazon DynamoDB. JavaScript objects passed in as parameters
	 * are marshalled into `AttributeValue` shapes required by Amazon DynamoDB.
	 * Responses from DynamoDB are unmarshalled into plain JavaScript objects
	 * by the `DocumentClient`. The `DocumentClient`, does not accept
	 * `AttributeValue`s in favor of native JavaScript types.
	 *
	 * |                             JavaScript Type                            | DynamoDB AttributeValue |
	 * |:----------------------------------------------------------------------:|-------------------------|
	 * | String                                                                 | S                       |
	 * | Number                                                                 | N                       |
	 * | Boolean                                                                | BOOL                    |
	 * | null                                                                   | NULL                    |
	 * | Array                                                                  | L                       |
	 * | Object                                                                 | M                       |
	 * | Buffer, File, Blob, ArrayBuffer, DataView, and JavaScript typed arrays | B                       |
	 *
	 * ## Support for Sets
	 *
	 * The `DocumentClient` offers a convenient way to create sets from
	 * JavaScript Arrays. The type of set is inferred from the first element
	 * in the array. DynamoDB supports string, number, and binary sets. To
	 * learn more about supported types see the
	 * [Amazon DynamoDB Data Model Documentation](http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DataModel.html)
	 * For more information see {AWS.DynamoDB.DocumentClient.createSet}
	 *
	 */
	AWS.DynamoDB.DocumentClient = AWS.util.inherit({

	  /**
	   * @api private
	   */
	  operations: {
	    batchGetItem: 'batchGet',
	    batchWriteItem: 'batchWrite',
	    putItem: 'put',
	    getItem: 'get',
	    deleteItem: 'delete',
	    updateItem: 'update',
	    scan: 'scan',
	    query: 'query'
	  },

	  /**
	   * Creates a DynamoDB document client with a set of configuration options.
	   *
	   * @option options params [map] An optional map of parameters to bind to every
	   *   request sent by this service object.
	   * @option options service [AWS.DynamoDB] An optional pre-configured instance
	   *  of the AWS.DynamoDB service object to use for requests. The object may
	   *  bound parameters used by the document client.
	   * @see AWS.DynamoDB.constructor
	   *
	   */
	  constructor: function DocumentClient(options) {
	    var self = this;
	    self.options = options || {};
	    self.configure(self.options);
	  },

	  /**
	   * @api private
	   */
	  configure: function configure(options) {
	    var self = this;
	    self.service = options.service;
	    self.bindServiceObject(options);
	    self.attrValue = options.attrValue =
	      self.service.api.operations.putItem.input.members.Item.value.shape;
	  },

	  /**
	   * @api private
	   */
	  bindServiceObject: function bindServiceObject(options) {
	    var self = this;
	    options = options || {};

	    if (!self.service) {
	      self.service = new AWS.DynamoDB(options);
	    } else {
	      var config = AWS.util.copy(self.service.config);
	      self.service = new self.service.constructor.__super__(config);
	      self.service.config.params =
	        AWS.util.merge(self.service.config.params || {}, options.params);
	    }
	  },

	  /**
	   * Returns the attributes of one or more items from one or more tables
	   * by delegating to `AWS.DynamoDB.batchGetItem()`.
	   *
	   * Supply the same parameters as {AWS.DynamoDB.batchGetItem} with
	   * `AttributeValue`s substituted by native JavaScript types.
	   *
	   * @see AWS.DynamoDB.batchGetItem
	   * @example Get items from multiple tables
	   *  var params = {
	   *    RequestItems: {
	   *      'Table-1': {
	   *        Keys: [
	   *          {
	   *             HashKey: 'haskey',
	   *             NumberRangeKey: 1
	   *          }
	   *        ]
	   *      },
	   *      'Table-2': {
	   *        Keys: [
	   *          { foo: 'bar' },
	   *        ]
	   *      }
	   *    }
	   *  };
	   *
	   *  var docClient = new AWS.DynamoDB.DocumentClient();
	   *
	   *  docClient.batchGet(params, function(err, data) {
	   *    if (err) console.log(err);
	   *    else console.log(data);
	   *  });
	   *
	   */
	  batchGet: function(params, callback) {
	    var self = this;
	    var request = self.service.batchGetItem(params);
	    self.setupRequest(request);
	    self.setupResponse(request);
	    if (typeof callback === 'function') {
	      request.send(callback);
	    }
	    return request;
	  },

	  /**
	   * Puts or deletes multiple items in one or more tables by delegating
	   * to `AWS.DynamoDB.batchWriteItem()`.
	   *
	   * Supply the same parameters as {AWS.DynamoDB.batchWriteItem} with
	   * `AttributeValue`s substituted by native JavaScript types.
	   *
	   * @see AWS.DynamoDB.batchWriteItem
	   * @example Write to and delete from a table
	   *  var params = {
	   *    RequestItems: {
	   *      'Table-1': [
	   *        {
	   *          DeleteRequest: {
	   *            Key: { HashKey: 'someKey' }
	   *          }
	   *        },
	   *        {
	   *          PutRequest: {
	   *            Item: {
	   *              HashKey: 'anotherKey',
	   *              NumAttribute: 1,
	   *              BoolAttribute: true,
	   *              ListAttribute: [1, 'two', false],
	   *              MapAttribute: { foo: 'bar' }
	   *            }
	   *          }
	   *        }
	   *      ]
	   *    }
	   *  };
	   *
	   *  var docClient = new AWS.DynamoDB.DocumentClient();
	   *
	   *  docClient.batchWrite(params, function(err, data) {
	   *    if (err) console.log(err);
	   *    else console.log(data);
	   *  });
	   *
	   */
	  batchWrite: function(params, callback) {
	    var self = this;
	    var request = self.service.batchWriteItem(params);
	    self.setupRequest(request);
	    self.setupResponse(request);
	    if (typeof callback === 'function') {
	      request.send(callback);
	    }
	    return request;
	  },

	  /**
	   * Deletes a single item in a table by primary key by delegating to
	   * `AWS.DynamoDB.deleteItem()`
	   *
	   * Supply the same parameters as {AWS.DynamoDB.deleteItem} with
	   * `AttributeValue`s substituted by native JavaScript types.
	   *
	   * @see AWS.DynamoDB.deleteItem
	   * @example Delete an item from a table
	   *  var params = {
	   *    TableName : 'Table',
	   *    Key: {
	   *      HashKey: 'hashkey',
	   *      NumberRangeKey: 1
	   *    }
	   *  };
	   *
	   *  var docClient = new AWS.DynamoDB.DocumentClient();
	   *
	   *  docClient.delete(params, function(err, data) {
	   *    if (err) console.log(err);
	   *    else console.log(data);
	   *  });
	   *
	   */
	  delete: function(params, callback) {
	    var self = this;
	    var request = self.service.deleteItem(params);
	    self.setupRequest(request);
	    self.setupResponse(request);
	    if (typeof callback === 'function') {
	      request.send(callback);
	    }
	    return request;
	  },

	  /**
	   * Returns a set of attributes for the item with the given primary key
	   * by delegating to `AWS.DynamoDB.getItem()`.
	   *
	   * Supply the same parameters as {AWS.DynamoDB.getItem} with
	   * `AttributeValue`s substituted by native JavaScript types.
	   *
	   * @see AWS.DynamoDB.getItem
	   * @example Get an item from a table
	   *  var params = {
	   *    TableName : 'Table',
	   *    Key: {
	   *      HashKey: 'hashkey'
	   *    }
	   *  };
	   *
	   *  var docClient = new AWS.DynamoDB.DocumentClient();
	   *
	   *  docClient.get(params, function(err, data) {
	   *    if (err) console.log(err);
	   *    else console.log(data);
	   *  });
	   *
	   */
	  get: function(params, callback) {
	    var self = this;
	    var request = self.service.getItem(params);
	    self.setupRequest(request);
	    self.setupResponse(request);
	    if (typeof callback === 'function') {
	      request.send(callback);
	    }
	    return request;
	  },

	  /**
	   * Creates a new item, or replaces an old item with a new item by
	   * delegating to `AWS.DynamoDB.putItem()`.
	   *
	   * Supply the same parameters as {AWS.DynamoDB.putItem} with
	   * `AttributeValue`s substituted by native JavaScript types.
	   *
	   * @see AWS.DynamoDB.putItem
	   * @example Create a new item in a table
	   *  var params = {
	   *    TableName : 'Table',
	   *    Item: {
	   *       HashKey: 'haskey',
	   *       NumAttribute: 1,
	   *       BoolAttribute: true,
	   *       ListAttribute: [1, 'two', false],
	   *       MapAttribute: { foo: 'bar'},
	   *       NullAttribute: null
	   *    }
	   *  };
	   *
	   *  var docClient = new AWS.DynamoDB.DocumentClient();
	   *
	   *  docClient.put(params, function(err, data) {
	   *    if (err) console.log(err);
	   *    else console.log(data);
	   *  });
	   *
	   */
	  put: function put(params, callback) {
	    var self = this;
	    var request = self.service.putItem(params);
	    self.setupRequest(request);
	    self.setupResponse(request);
	    if (typeof callback === 'function') {
	      request.send(callback);
	    }
	    return request;
	  },

	  /**
	   * Edits an existing item's attributes, or adds a new item to the table if
	   * it does not already exist by delegating to `AWS.DynamoDB.updateItem()`.
	   *
	   * Supply the same parameters as {AWS.DynamoDB.updateItem} with
	   * `AttributeValue`s substituted by native JavaScript types.
	   *
	   * @see AWS.DynamoDB.updateItem
	   * @example Update an item with expressions
	   *  var params = {
	   *    TableName: 'Table',
	   *    Key: { HashKey : 'hashkey' },
	   *    UpdateExpression: 'set #a = :x + :y',
	   *    ConditionExpression: '#a < :MAX',
	   *    ExpressionAttributeNames: {'#a' : 'Sum'},
	   *    ExpressionAttributeValues: {
	   *      ':x' : 20,
	   *      ':y' : 45,
	   *      ':MAX' : 100,
	   *    }
	   *  };
	   *
	   *  var docClient = new AWS.DynamoDB.DocumentClient();
	   *
	   *  docClient.update(params, function(err, data) {
	   *     if (err) console.log(err);
	   *     else console.log(data);
	   *  });
	   *
	   */
	  update: function(params, callback) {
	    var self = this;
	    var request = self.service.updateItem(params);
	    self.setupRequest(request);
	    self.setupResponse(request);
	    if (typeof callback === 'function') {
	      request.send(callback);
	    }
	    return request;
	  },

	  /**
	   * Returns one or more items and item attributes by accessing every item
	   * in a table or a secondary index.
	   *
	   * Supply the same parameters as {AWS.DynamoDB.scan} with
	   * `AttributeValue`s substituted by native JavaScript types.
	   *
	   * @see AWS.DynamoDB.scan
	   * @example Scan the table with a filter expression
	   *  var params = {
	   *    TableName : 'Table',
	   *    FilterExpression : 'Year = :this_year',
	   *    ExpressionAttributeValues : {':this_year' : 2015}
	   *  };
	   *
	   *  var docClient = new AWS.DynamoDB.DocumentClient();
	   *
	   *  docClient.scan(params, function(err, data) {
	   *     if (err) console.log(err);
	   *     else console.log(data);
	   *  });
	   *
	   */
	  scan: function(params, callback) {
	    var self = this;
	    var request = self.service.scan(params);
	    self.setupRequest(request);
	    self.setupResponse(request);
	    if (typeof callback === 'function') {
	      request.send(callback);
	    }
	    return request;
	  },

	   /**
	    * Directly access items from a table by primary key or a secondary index.
	    *
	    * Supply the same parameters as {AWS.DynamoDB.query} with
	    * `AttributeValue`s substituted by native JavaScript types.
	    *
	    * @see AWS.DynamoDB.query
	    * @example Query an index
	    *  var params = {
	    *    TableName: 'Table',
	    *    IndexName: 'Index',
	    *    KeyConditionExpression: 'HashKey = :hkey and RangeKey > :rkey',
	    *    ExpressionAttributeValues: {
	    *      ':hkey': 'key',
	    *      ':rkey': 2015
	    *    }
	    *  };
	    *
	    *  var docClient = new AWS.DynamoDB.DocumentClient();
	    *
	    *  docClient.query(params, function(err, data) {
	    *     if (err) console.log(err);
	    *     else console.log(data);
	    *  });
	    *
	    */
	  query: function(params, callback) {
	    var self = this;
	    var request = self.service.query(params);
	    self.setupRequest(request);
	    self.setupResponse(request);
	    if (typeof callback === 'function') {
	      request.send(callback);
	    }
	    return request;
	  },

	  /**
	   * Creates a set of elements inferring the type of set from
	   * the type of the first element. Amazon DynamoDB currently supports
	   * the number sets, string sets, and binary sets. For more information
	   * about DynamoDB data types see the documentation on the
	   * [Amazon DynamoDB Data Model](http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DataModel.html#DataModel.DataTypes).
	   *
	   * @param list [Array] Collection to represent your DynamoDB Set
	   * @param options [map]
	   *  * **validate** [Boolean] set to true if you want to validate the type
	   *    of each element in the set. Defaults to `false`.
	   *  * **convertEmptyValues** [Boolean] set to true if you would like the
	   *    document client to convert empty values (0-length strings, binary
	   *    buffers, and sets) to be converted to NULL types when persisting to
	   *    DynamoDB.
	   * @example Creating a number set
	   *  var docClient = new AWS.DynamoDB.DocumentClient();
	   *
	   *  var params = {
	   *    Item: {
	   *      hashkey: 'hashkey'
	   *      numbers: docClient.createSet([1, 2, 3]);
	   *    }
	   *  };
	   *
	   *  docClient.put(params, function(err, data) {
	   *    if (err) console.log(err);
	   *    else console.log(data);
	   *  });
	   *
	   */
	  createSet: function(list, options) {
	    options = options || {};
	    return new DynamoDBSet(list, options);
	  },

	  /**
	   * @api private
	   */
	  getTranslator: function() {
	    return new Translator(this.options);
	  },

	  /**
	   * @api private
	   */
	  setupRequest: function setupRequest(request) {
	    var self = this;
	    var translator = self.getTranslator();
	    var operation = request.operation;
	    var inputShape = request.service.api.operations[operation].input;
	    request._events.validate.unshift(function(req) {
	      req.rawParams = AWS.util.copy(req.params);
	      req.params = translator.translateInput(req.rawParams, inputShape);
	    });
	  },

	  /**
	   * @api private
	   */
	  setupResponse: function setupResponse(request) {
	    var self = this;
	    var translator = self.getTranslator();
	    var outputShape = self.service.api.operations[request.operation].output;
	    request.on('extractData', function(response) {
	      response.data = translator.translateOutput(response.data, outputShape);
	    });

	    var response = request.response;
	    response.nextPage = function(cb) {
	      var resp = this;
	      var req = resp.request;
	      var config;
	      var service = req.service;
	      var operation = req.operation;
	      try {
	        config = service.paginationConfig(operation, true);
	      } catch (e) { resp.error = e; }

	      if (!resp.hasNextPage()) {
	        if (cb) cb(resp.error, null);
	        else if (resp.error) throw resp.error;
	        return null;
	      }

	      var params = AWS.util.copy(req.rawParams);
	      if (!resp.nextPageTokens) {
	        return cb ? cb(null, null) : null;
	      } else {
	        var inputTokens = config.inputToken;
	        if (typeof inputTokens === 'string') inputTokens = [inputTokens];
	        for (var i = 0; i < inputTokens.length; i++) {
	          params[inputTokens[i]] = resp.nextPageTokens[i];
	        }
	        return self[operation](params, cb);
	      }
	    };
	  }

	});

	module.exports = AWS.DynamoDB.DocumentClient;


/***/ },
/* 240 */
/***/ function(module, exports, __webpack_require__) {

	var util = __webpack_require__(5).util;
	var convert = __webpack_require__(241);

	var Translator = function(options) {
	  options = options || {};
	  this.attrValue = options.attrValue;
	  this.convertEmptyValues = Boolean(options.convertEmptyValues);
	};

	Translator.prototype.translateInput = function(value, shape) {
	  this.mode = 'input';
	  return this.translate(value, shape);
	};

	Translator.prototype.translateOutput = function(value, shape) {
	  this.mode = 'output';
	  return this.translate(value, shape);
	};

	Translator.prototype.translate = function(value, shape) {
	  var self = this;
	  if (!shape || value === undefined) return undefined;

	  if (shape.shape === self.attrValue) {
	    return convert[self.mode](value, {convertEmptyValues: self.convertEmptyValues});
	  }
	  switch (shape.type) {
	    case 'structure': return self.translateStructure(value, shape);
	    case 'map': return self.translateMap(value, shape);
	    case 'list': return self.translateList(value, shape);
	    default: return self.translateScalar(value, shape);
	  }
	};

	Translator.prototype.translateStructure = function(structure, shape) {
	  var self = this;
	  if (structure == null) return undefined;

	  var struct = {};
	  util.each(structure, function(name, value) {
	    var memberShape = shape.members[name];
	    if (memberShape) {
	      var result = self.translate(value, memberShape);
	      if (result !== undefined) struct[name] = result;
	    }
	  });
	  return struct;
	};

	Translator.prototype.translateList = function(list, shape) {
	  var self = this;
	  if (list == null) return undefined;

	  var out = [];
	  util.arrayEach(list, function(value) {
	    var result = self.translate(value, shape.member);
	    if (result === undefined) out.push(null);
	    else out.push(result);
	  });
	  return out;
	};

	Translator.prototype.translateMap = function(map, shape) {
	  var self = this;
	  if (map == null) return undefined;

	  var out = {};
	  util.each(map, function(key, value) {
	    var result = self.translate(value, shape.value);
	    if (result === undefined) out[key] = null;
	    else out[key] = result;
	  });
	  return out;
	};

	Translator.prototype.translateScalar = function(value, shape) {
	  return shape.toType(value);
	};

	module.exports = Translator;


/***/ },
/* 241 */
/***/ function(module, exports, __webpack_require__) {

	var util = __webpack_require__(5).util;
	var typeOf = __webpack_require__(242).typeOf;
	var DynamoDBSet = __webpack_require__(243);

	function convertInput(data, options) {
	  options = options || {};
	  var type = typeOf(data);
	  if (type === 'Object') {
	    var map = {M: {}};
	    for (var key in data) {
	      map['M'][key] = convertInput(data[key], options);
	    }
	    return map;
	  } else if (type === 'Array') {
	    var list = {L: []};
	    for (var i = 0; i < data.length; i++) {
	      list['L'].push(convertInput(data[i], options));
	    }
	    return list;
	  } else if (type === 'Set') {
	    return formatSet(data, options);
	  } else if (type === 'String') {
	    if (data.length === 0 && options.convertEmptyValues) {
	      return convertInput(null);
	    }
	    return { 'S': data };
	  } else if (type === 'Number') {
	    return { 'N': data.toString() };
	  } else if (type === 'Binary') {
	    if (data.length === 0 && options.convertEmptyValues) {
	      return convertInput(null);
	    }
	    return { 'B': data };
	  } else if (type === 'Boolean') {
	    return {'BOOL': data};
	  } else if (type === 'null') {
	    return {'NULL': true};
	  }
	}

	function formatSet(data, options) {
	  options = options || {};
	  var values = data.values;
	  if (options.convertEmptyValues) {
	    values = filterEmptySetValues(data);
	    if (values.length === 0) {
	      return convertInput(null);
	    }
	  }

	  var map = {};
	  switch (data.type) {
	    case 'String': map['SS'] = values; break;
	    case 'Binary': map['BS'] = values; break;
	    case 'Number': map['NS'] = values.map(function (value) {
	      return value.toString();
	    });
	  }
	  return map;
	}

	function filterEmptySetValues(set) {
	    var nonEmptyValues = [];
	    var potentiallyEmptyTypes = {
	        String: true,
	        Binary: true,
	        Number: false
	    };
	    if (potentiallyEmptyTypes[set.type]) {
	        for (var i = 0; i < set.values.length; i++) {
	            if (set.values[i].length === 0) {
	                continue;
	            }
	            nonEmptyValues.push(set.values[i]);
	        }

	        return nonEmptyValues;
	    }

	    return set.values;
	}

	function convertOutput(data) {
	  var list, map, i;
	  for (var type in data) {
	    var values = data[type];
	    if (type === 'M') {
	      map = {};
	      for (var key in values) {
	        map[key] = convertOutput(values[key]);
	      }
	      return map;
	    } else if (type === 'L') {
	      list = [];
	      for (i = 0; i < values.length; i++) {
	        list.push(convertOutput(values[i]));
	      }
	      return list;
	    } else if (type === 'SS') {
	      list = [];
	      for (i = 0; i < values.length; i++) {
	        list.push(values[i] + '');
	      }
	      return new DynamoDBSet(list);
	    } else if (type === 'NS') {
	      list = [];
	      for (i = 0; i < values.length; i++) {
	        list.push(Number(values[i]));
	      }
	      return new DynamoDBSet(list);
	    } else if (type === 'BS') {
	      list = [];
	      for (i = 0; i < values.length; i++) {
	        list.push(new util.Buffer(values[i]));
	      }
	      return new DynamoDBSet(list);
	    } else if (type === 'S') {
	      return values + '';
	    } else if (type === 'N') {
	      return Number(values);
	    } else if (type === 'B') {
	      return new util.Buffer(values);
	    } else if (type === 'BOOL') {
	      return (values === 'true' || values === 'TRUE' || values === true);
	    } else if (type === 'NULL') {
	      return null;
	    }
	  }
	}

	module.exports = {
	  input: convertInput,
	  output: convertOutput
	};


/***/ },
/* 242 */
/***/ function(module, exports, __webpack_require__) {

	var util = __webpack_require__(5).util;

	function typeOf(data) {
	  if (data === null && typeof data === 'object') {
	    return 'null';
	  } else if (data !== undefined && isBinary(data)) {
	    return 'Binary';
	  } else if (data !== undefined && data.constructor) {
	    return util.typeName(data.constructor);
	  } else if (data !== undefined && typeof data === 'object') {
	    // this object is the result of Object.create(null), hence the absence of a
	    // defined constructor
	    return 'Object';
	  } else {
	    return 'undefined';
	  }
	}

	function isBinary(data) {
	  var types = [
	    'Buffer', 'File', 'Blob', 'ArrayBuffer', 'DataView',
	    'Int8Array', 'Uint8Array', 'Uint8ClampedArray',
	    'Int16Array', 'Uint16Array', 'Int32Array', 'Uint32Array',
	    'Float32Array', 'Float64Array'
	  ];
	  if (util.isNode()) {
	    var Stream = util.stream.Stream;
	    if (util.Buffer.isBuffer(data) || data instanceof Stream)
	      return true;
	  } else {
	    for (var i = 0; i < types.length; i++) {
	      if (data !== undefined && data.constructor) {
	        if (util.isType(data, types[i])) return true;
	        if (util.typeName(data.constructor) === types[i]) return true;
	      }
	    }
	  }
	  return false;
	}

	module.exports = {
	  typeOf: typeOf,
	  isBinary: isBinary
	};


/***/ },
/* 243 */
/***/ function(module, exports, __webpack_require__) {

	var util = __webpack_require__(5).util;
	var typeOf = __webpack_require__(242).typeOf;

	var DynamoDBSet = util.inherit({

	  constructor: function Set(list, options) {
	    options = options || {};
	    this.initialize(list, options.validate);
	  },

	  initialize: function(list, validate) {
	    var self = this;
	    self.values = [].concat(list);
	    self.detectType();
	    if (validate) {
	      self.validate();
	    }
	  },

	  detectType: function() {
	    var self = this;
	    var value = self.values[0];
	    if (typeOf(value) === 'String') {
	      self.type = 'String';
	    } else if (typeOf(value) === 'Number') {
	      self.type = 'Number';
	    } else if (typeOf(value) === 'Binary') {
	      self.type = 'Binary';
	    } else {
	      throw util.error(new Error(), {
	        code: 'InvalidSetType',
	        message: 'Sets can contain string, number, or binary values'
	      });
	    }
	  },

	  validate: function() {
	    var self = this;
	    var length = self.values.length;
	    var values = self.values;
	    for (var i = 0; i < length; i++) {
	      if (typeOf(values[i]) !== self.type) {
	        throw util.error(new Error(), {
	          code: 'InvalidType',
	          message: self.type + ' Set contains ' + typeOf(values[i]) + ' value'
	        });
	      }
	    }
	  }

	});

	module.exports = DynamoDBSet;


/***/ },
/* 244 */,
/* 245 */,
/* 246 */,
/* 247 */,
/* 248 */,
/* 249 */,
/* 250 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(3);
	var AWS = __webpack_require__(5);
	var Service = __webpack_require__(86);
	var apiLoader = __webpack_require__(94);

	apiLoader.services['dynamodbstreams'] = {};
	AWS.DynamoDBStreams = Service.defineService('dynamodbstreams', ['2012-08-10']);
	Object.defineProperty(apiLoader.services['dynamodbstreams'], '2012-08-10', {
	  get: function get() {
	    var model = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/streams.dynamodb-2012-08-10.min.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	    return model;
	  },
	  enumerable: true,
	  configurable: true
	});

	module.exports = AWS.DynamoDBStreams;


/***/ },
/* 251 */,
/* 252 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(3);
	var AWS = __webpack_require__(5);
	var Service = __webpack_require__(86);
	var apiLoader = __webpack_require__(94);

	apiLoader.services['ec2'] = {};
	AWS.EC2 = Service.defineService('ec2', ['2013-06-15*', '2013-10-15*', '2014-02-01*', '2014-05-01*', '2014-06-15*', '2014-09-01*', '2014-10-01*', '2015-03-01*', '2015-04-15*', '2015-10-01*', '2016-04-01*', '2016-09-15*', '2016-11-15']);
	__webpack_require__(253);
	Object.defineProperty(apiLoader.services['ec2'], '2016-11-15', {
	  get: function get() {
	    var model = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/ec2-2016-11-15.min.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	    model.paginators = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/ec2-2016-11-15.paginators.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())).pagination;
	    model.waiters = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/ec2-2016-11-15.waiters2.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())).waiters;
	    return model;
	  },
	  enumerable: true,
	  configurable: true
	});

	module.exports = AWS.EC2;


/***/ },
/* 253 */
/***/ function(module, exports, __webpack_require__) {

	var AWS = __webpack_require__(5);

	AWS.util.update(AWS.EC2.prototype, {
	  /**
	   * @api private
	   */
	  setupRequestListeners: function setupRequestListeners(request) {
	    request.removeListener('extractError', AWS.EventListeners.Query.EXTRACT_ERROR);
	    request.addListener('extractError', this.extractError);

	    if (request.operation === 'copySnapshot') {
	      request.onAsync('validate', this.buildCopySnapshotPresignedUrl);
	    }
	  },

	  /**
	   * @api private
	   */
	  buildCopySnapshotPresignedUrl: function buildCopySnapshotPresignedUrl(req, done) {
	    if (req.params.PresignedUrl || req._subRequest) {
	      return done();
	    }

	    req.params = AWS.util.copy(req.params);
	    req.params.DestinationRegion = req.service.config.region;

	    var config = AWS.util.copy(req.service.config);
	    delete config.endpoint;
	    config.region = req.params.SourceRegion;
	    var svc = new req.service.constructor(config);
	    var newReq = svc[req.operation](req.params);
	    newReq._subRequest = true;
	    newReq.presign(function(err, url) {
	      if (err) done(err);
	      else {
	        req.params.PresignedUrl = url;
	        done();
	      }
	    });
	  },

	  /**
	   * @api private
	   */
	  extractError: function extractError(resp) {
	    // EC2 nests the error code and message deeper than other AWS Query services.
	    var httpResponse = resp.httpResponse;
	    var data = new AWS.XML.Parser().parse(httpResponse.body.toString() || '');
	    if (data.Errors) {
	      resp.error = AWS.util.error(new Error(), {
	        code: data.Errors.Error.Code,
	        message: data.Errors.Error.Message
	      });
	    } else {
	      resp.error = AWS.util.error(new Error(), {
	        code: httpResponse.statusCode,
	        message: null
	      });
	    }
	    resp.error.requestId = data.RequestID || null;
	  }
	});


/***/ },
/* 254 */,
/* 255 */,
/* 256 */,
/* 257 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(3);
	var AWS = __webpack_require__(5);
	var Service = __webpack_require__(86);
	var apiLoader = __webpack_require__(94);

	apiLoader.services['ecr'] = {};
	AWS.ECR = Service.defineService('ecr', ['2015-09-21']);
	Object.defineProperty(apiLoader.services['ecr'], '2015-09-21', {
	  get: function get() {
	    var model = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/ecr-2015-09-21.min.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	    model.paginators = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/ecr-2015-09-21.paginators.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())).pagination;
	    return model;
	  },
	  enumerable: true,
	  configurable: true
	});

	module.exports = AWS.ECR;


/***/ },
/* 258 */,
/* 259 */,
/* 260 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(3);
	var AWS = __webpack_require__(5);
	var Service = __webpack_require__(86);
	var apiLoader = __webpack_require__(94);

	apiLoader.services['ecs'] = {};
	AWS.ECS = Service.defineService('ecs', ['2014-11-13']);
	Object.defineProperty(apiLoader.services['ecs'], '2014-11-13', {
	  get: function get() {
	    var model = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/ecs-2014-11-13.min.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	    model.paginators = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/ecs-2014-11-13.paginators.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())).pagination;
	    model.waiters = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/ecs-2014-11-13.waiters2.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())).waiters;
	    return model;
	  },
	  enumerable: true,
	  configurable: true
	});

	module.exports = AWS.ECS;


/***/ },
/* 261 */,
/* 262 */,
/* 263 */,
/* 264 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(3);
	var AWS = __webpack_require__(5);
	var Service = __webpack_require__(86);
	var apiLoader = __webpack_require__(94);

	apiLoader.services['efs'] = {};
	AWS.EFS = Service.defineService('efs', ['2015-02-01']);
	Object.defineProperty(apiLoader.services['efs'], '2015-02-01', {
	  get: function get() {
	    var model = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/elasticfilesystem-2015-02-01.min.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	    return model;
	  },
	  enumerable: true,
	  configurable: true
	});

	module.exports = AWS.EFS;


/***/ },
/* 265 */,
/* 266 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(3);
	var AWS = __webpack_require__(5);
	var Service = __webpack_require__(86);
	var apiLoader = __webpack_require__(94);

	apiLoader.services['elasticache'] = {};
	AWS.ElastiCache = Service.defineService('elasticache', ['2012-11-15*', '2014-03-24*', '2014-07-15*', '2014-09-30*', '2015-02-02']);
	Object.defineProperty(apiLoader.services['elasticache'], '2015-02-02', {
	  get: function get() {
	    var model = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/elasticache-2015-02-02.min.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	    model.paginators = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/elasticache-2015-02-02.paginators.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())).pagination;
	    model.waiters = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/elasticache-2015-02-02.waiters2.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())).waiters;
	    return model;
	  },
	  enumerable: true,
	  configurable: true
	});

	module.exports = AWS.ElastiCache;


/***/ },
/* 267 */,
/* 268 */,
/* 269 */,
/* 270 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(3);
	var AWS = __webpack_require__(5);
	var Service = __webpack_require__(86);
	var apiLoader = __webpack_require__(94);

	apiLoader.services['elasticbeanstalk'] = {};
	AWS.ElasticBeanstalk = Service.defineService('elasticbeanstalk', ['2010-12-01']);
	Object.defineProperty(apiLoader.services['elasticbeanstalk'], '2010-12-01', {
	  get: function get() {
	    var model = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/elasticbeanstalk-2010-12-01.min.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	    model.paginators = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/elasticbeanstalk-2010-12-01.paginators.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())).pagination;
	    return model;
	  },
	  enumerable: true,
	  configurable: true
	});

	module.exports = AWS.ElasticBeanstalk;


/***/ },
/* 271 */,
/* 272 */,
/* 273 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(3);
	var AWS = __webpack_require__(5);
	var Service = __webpack_require__(86);
	var apiLoader = __webpack_require__(94);

	apiLoader.services['elb'] = {};
	AWS.ELB = Service.defineService('elb', ['2012-06-01']);
	Object.defineProperty(apiLoader.services['elb'], '2012-06-01', {
	  get: function get() {
	    var model = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/elasticloadbalancing-2012-06-01.min.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	    model.paginators = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/elasticloadbalancing-2012-06-01.paginators.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())).pagination;
	    model.waiters = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/elasticloadbalancing-2012-06-01.waiters2.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())).waiters;
	    return model;
	  },
	  enumerable: true,
	  configurable: true
	});

	module.exports = AWS.ELB;


/***/ },
/* 274 */,
/* 275 */,
/* 276 */,
/* 277 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(3);
	var AWS = __webpack_require__(5);
	var Service = __webpack_require__(86);
	var apiLoader = __webpack_require__(94);

	apiLoader.services['elbv2'] = {};
	AWS.ELBv2 = Service.defineService('elbv2', ['2015-12-01']);
	Object.defineProperty(apiLoader.services['elbv2'], '2015-12-01', {
	  get: function get() {
	    var model = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/elasticloadbalancingv2-2015-12-01.min.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	    model.paginators = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/elasticloadbalancingv2-2015-12-01.paginators.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())).pagination;
	    return model;
	  },
	  enumerable: true,
	  configurable: true
	});

	module.exports = AWS.ELBv2;


/***/ },
/* 278 */,
/* 279 */,
/* 280 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(3);
	var AWS = __webpack_require__(5);
	var Service = __webpack_require__(86);
	var apiLoader = __webpack_require__(94);

	apiLoader.services['emr'] = {};
	AWS.EMR = Service.defineService('emr', ['2009-03-31']);
	Object.defineProperty(apiLoader.services['emr'], '2009-03-31', {
	  get: function get() {
	    var model = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/elasticmapreduce-2009-03-31.min.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	    model.paginators = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/elasticmapreduce-2009-03-31.paginators.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())).pagination;
	    model.waiters = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/elasticmapreduce-2009-03-31.waiters2.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())).waiters;
	    return model;
	  },
	  enumerable: true,
	  configurable: true
	});

	module.exports = AWS.EMR;


/***/ },
/* 281 */,
/* 282 */,
/* 283 */,
/* 284 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(3);
	var AWS = __webpack_require__(5);
	var Service = __webpack_require__(86);
	var apiLoader = __webpack_require__(94);

	apiLoader.services['es'] = {};
	AWS.ES = Service.defineService('es', ['2015-01-01']);
	Object.defineProperty(apiLoader.services['es'], '2015-01-01', {
	  get: function get() {
	    var model = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/es-2015-01-01.min.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	    return model;
	  },
	  enumerable: true,
	  configurable: true
	});

	module.exports = AWS.ES;


/***/ },
/* 285 */,
/* 286 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(3);
	var AWS = __webpack_require__(5);
	var Service = __webpack_require__(86);
	var apiLoader = __webpack_require__(94);

	apiLoader.services['elastictranscoder'] = {};
	AWS.ElasticTranscoder = Service.defineService('elastictranscoder', ['2012-09-25']);
	Object.defineProperty(apiLoader.services['elastictranscoder'], '2012-09-25', {
	  get: function get() {
	    var model = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/elastictranscoder-2012-09-25.min.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	    model.paginators = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/elastictranscoder-2012-09-25.paginators.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())).pagination;
	    model.waiters = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/elastictranscoder-2012-09-25.waiters2.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())).waiters;
	    return model;
	  },
	  enumerable: true,
	  configurable: true
	});

	module.exports = AWS.ElasticTranscoder;


/***/ },
/* 287 */,
/* 288 */,
/* 289 */,
/* 290 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(3);
	var AWS = __webpack_require__(5);
	var Service = __webpack_require__(86);
	var apiLoader = __webpack_require__(94);

	apiLoader.services['firehose'] = {};
	AWS.Firehose = Service.defineService('firehose', ['2015-08-04']);
	Object.defineProperty(apiLoader.services['firehose'], '2015-08-04', {
	  get: function get() {
	    var model = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/firehose-2015-08-04.min.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	    return model;
	  },
	  enumerable: true,
	  configurable: true
	});

	module.exports = AWS.Firehose;


/***/ },
/* 291 */,
/* 292 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(3);
	var AWS = __webpack_require__(5);
	var Service = __webpack_require__(86);
	var apiLoader = __webpack_require__(94);

	apiLoader.services['gamelift'] = {};
	AWS.GameLift = Service.defineService('gamelift', ['2015-10-01']);
	Object.defineProperty(apiLoader.services['gamelift'], '2015-10-01', {
	  get: function get() {
	    var model = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/gamelift-2015-10-01.min.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	    return model;
	  },
	  enumerable: true,
	  configurable: true
	});

	module.exports = AWS.GameLift;


/***/ },
/* 293 */,
/* 294 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(3);
	var AWS = __webpack_require__(5);
	var Service = __webpack_require__(86);
	var apiLoader = __webpack_require__(94);

	apiLoader.services['glacier'] = {};
	AWS.Glacier = Service.defineService('glacier', ['2012-06-01']);
	__webpack_require__(295);
	Object.defineProperty(apiLoader.services['glacier'], '2012-06-01', {
	  get: function get() {
	    var model = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/glacier-2012-06-01.min.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	    model.paginators = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/glacier-2012-06-01.paginators.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())).pagination;
	    model.waiters = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/glacier-2012-06-01.waiters2.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())).waiters;
	    return model;
	  },
	  enumerable: true,
	  configurable: true
	});

	module.exports = AWS.Glacier;


/***/ },
/* 295 */
/***/ function(module, exports, __webpack_require__) {

	var AWS = __webpack_require__(5);

	AWS.util.update(AWS.Glacier.prototype, {
	  /**
	   * @api private
	   */
	  setupRequestListeners: function setupRequestListeners(request) {
	    if (Array.isArray(request._events.validate)) {
	      request._events.validate.unshift(this.validateAccountId);
	    } else {
	      request.on('validate', this.validateAccountId);
	    }
	    request.removeListener('afterBuild',
	      AWS.EventListeners.Core.COMPUTE_SHA256);
	    request.on('build', this.addGlacierApiVersion);
	    request.on('build', this.addTreeHashHeaders);
	  },

	  /**
	   * @api private
	   */
	  validateAccountId: function validateAccountId(request) {
	    if (request.params.accountId !== undefined) return;
	    request.params = AWS.util.copy(request.params);
	    request.params.accountId = '-';
	  },

	  /**
	   * @api private
	   */
	  addGlacierApiVersion: function addGlacierApiVersion(request) {
	    var version = request.service.api.apiVersion;
	    request.httpRequest.headers['x-amz-glacier-version'] = version;
	  },

	  /**
	   * @api private
	   */
	  addTreeHashHeaders: function addTreeHashHeaders(request) {
	    if (request.params.body === undefined) return;

	    var hashes = request.service.computeChecksums(request.params.body);
	    request.httpRequest.headers['X-Amz-Content-Sha256'] = hashes.linearHash;

	    if (!request.httpRequest.headers['x-amz-sha256-tree-hash']) {
	      request.httpRequest.headers['x-amz-sha256-tree-hash'] = hashes.treeHash;
	    }
	  },

	  /**
	   * @!group Computing Checksums
	   */

	  /**
	   * Computes the SHA-256 linear and tree hash checksums for a given
	   * block of Buffer data. Pass the tree hash of the computed checksums
	   * as the checksum input to the {completeMultipartUpload} when performing
	   * a multi-part upload.
	   *
	   * @example Calculate checksum of 5.5MB data chunk
	   *   var glacier = new AWS.Glacier();
	   *   var data = new Buffer(5.5 * 1024 * 1024);
	   *   data.fill('0'); // fill with zeros
	   *   var results = glacier.computeChecksums(data);
	   *   // Result: { linearHash: '68aff0c5a9...', treeHash: '154e26c78f...' }
	   * @param data [Buffer, String] data to calculate the checksum for
	   * @return [map<linearHash:String,treeHash:String>] a map containing
	   *   the linearHash and treeHash properties representing hex based digests
	   *   of the respective checksums.
	   * @see completeMultipartUpload
	   */
	  computeChecksums: function computeChecksums(data) {
	    if (!AWS.util.Buffer.isBuffer(data)) data = new AWS.util.Buffer(data);

	    var mb = 1024 * 1024;
	    var hashes = [];
	    var hash = AWS.util.crypto.createHash('sha256');

	    // build leaf nodes in 1mb chunks
	    for (var i = 0; i < data.length; i += mb) {
	      var chunk = data.slice(i, Math.min(i + mb, data.length));
	      hash.update(chunk);
	      hashes.push(AWS.util.crypto.sha256(chunk));
	    }

	    return {
	      linearHash: hash.digest('hex'),
	      treeHash: this.buildHashTree(hashes)
	    };
	  },

	  /**
	   * @api private
	   */
	  buildHashTree: function buildHashTree(hashes) {
	    // merge leaf nodes
	    while (hashes.length > 1) {
	      var tmpHashes = [];
	      for (var i = 0; i < hashes.length; i += 2) {
	        if (hashes[i + 1]) {
	          var tmpHash = new AWS.util.Buffer(64);
	          tmpHash.write(hashes[i], 0, 32, 'binary');
	          tmpHash.write(hashes[i + 1], 32, 32, 'binary');
	          tmpHashes.push(AWS.util.crypto.sha256(tmpHash));
	        } else {
	          tmpHashes.push(hashes[i]);
	        }
	      }
	      hashes = tmpHashes;
	    }

	    return AWS.util.crypto.toHex(hashes[0]);
	  }
	});


/***/ },
/* 296 */,
/* 297 */,
/* 298 */,
/* 299 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(3);
	var AWS = __webpack_require__(5);
	var Service = __webpack_require__(86);
	var apiLoader = __webpack_require__(94);

	apiLoader.services['health'] = {};
	AWS.Health = Service.defineService('health', ['2016-08-04']);
	Object.defineProperty(apiLoader.services['health'], '2016-08-04', {
	  get: function get() {
	    var model = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/health-2016-08-04.min.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	    model.paginators = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/health-2016-08-04.paginators.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())).pagination;
	    return model;
	  },
	  enumerable: true,
	  configurable: true
	});

	module.exports = AWS.Health;


/***/ },
/* 300 */,
/* 301 */,
/* 302 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(3);
	var AWS = __webpack_require__(5);
	var Service = __webpack_require__(86);
	var apiLoader = __webpack_require__(94);

	apiLoader.services['iam'] = {};
	AWS.IAM = Service.defineService('iam', ['2010-05-08']);
	Object.defineProperty(apiLoader.services['iam'], '2010-05-08', {
	  get: function get() {
	    var model = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/iam-2010-05-08.min.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	    model.paginators = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/iam-2010-05-08.paginators.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())).pagination;
	    model.waiters = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/iam-2010-05-08.waiters2.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())).waiters;
	    return model;
	  },
	  enumerable: true,
	  configurable: true
	});

	module.exports = AWS.IAM;


/***/ },
/* 303 */,
/* 304 */,
/* 305 */,
/* 306 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(3);
	var AWS = __webpack_require__(5);
	var Service = __webpack_require__(86);
	var apiLoader = __webpack_require__(94);

	apiLoader.services['importexport'] = {};
	AWS.ImportExport = Service.defineService('importexport', ['2010-06-01']);
	Object.defineProperty(apiLoader.services['importexport'], '2010-06-01', {
	  get: function get() {
	    var model = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/importexport-2010-06-01.min.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	    model.paginators = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/importexport-2010-06-01.paginators.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())).pagination;
	    return model;
	  },
	  enumerable: true,
	  configurable: true
	});

	module.exports = AWS.ImportExport;


/***/ },
/* 307 */,
/* 308 */,
/* 309 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(3);
	var AWS = __webpack_require__(5);
	var Service = __webpack_require__(86);
	var apiLoader = __webpack_require__(94);

	apiLoader.services['inspector'] = {};
	AWS.Inspector = Service.defineService('inspector', ['2015-08-18*', '2016-02-16']);
	Object.defineProperty(apiLoader.services['inspector'], '2016-02-16', {
	  get: function get() {
	    var model = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/inspector-2016-02-16.min.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	    return model;
	  },
	  enumerable: true,
	  configurable: true
	});

	module.exports = AWS.Inspector;


/***/ },
/* 310 */,
/* 311 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(3);
	var AWS = __webpack_require__(5);
	var Service = __webpack_require__(86);
	var apiLoader = __webpack_require__(94);

	apiLoader.services['iot'] = {};
	AWS.Iot = Service.defineService('iot', ['2015-05-28']);
	Object.defineProperty(apiLoader.services['iot'], '2015-05-28', {
	  get: function get() {
	    var model = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/iot-2015-05-28.min.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	    return model;
	  },
	  enumerable: true,
	  configurable: true
	});

	module.exports = AWS.Iot;


/***/ },
/* 312 */,
/* 313 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(3);
	var AWS = __webpack_require__(5);
	var Service = __webpack_require__(86);
	var apiLoader = __webpack_require__(94);

	apiLoader.services['iotdata'] = {};
	AWS.IotData = Service.defineService('iotdata', ['2015-05-28']);
	__webpack_require__(314);
	Object.defineProperty(apiLoader.services['iotdata'], '2015-05-28', {
	  get: function get() {
	    var model = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/iot-data-2015-05-28.min.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	    return model;
	  },
	  enumerable: true,
	  configurable: true
	});

	module.exports = AWS.IotData;


/***/ },
/* 314 */
/***/ function(module, exports, __webpack_require__) {

	var AWS = __webpack_require__(5);

	/**
	 * Constructs a service interface object. Each API operation is exposed as a
	 * function on service.
	 *
	 * ### Sending a Request Using IotData
	 *
	 * ```javascript
	 * var iotdata = new AWS.IotData({endpoint: 'my.host.tld'});
	 * iotdata.getThingShadow(params, function (err, data) {
	 *   if (err) console.log(err, err.stack); // an error occurred
	 *   else     console.log(data);           // successful response
	 * });
	 * ```
	 *
	 * ### Locking the API Version
	 *
	 * In order to ensure that the IotData object uses this specific API,
	 * you can construct the object by passing the `apiVersion` option to the
	 * constructor:
	 *
	 * ```javascript
	 * var iotdata = new AWS.IotData({
	 *   endpoint: 'my.host.tld',
	 *   apiVersion: '2015-05-28'
	 * });
	 * ```
	 *
	 * You can also set the API version globally in `AWS.config.apiVersions` using
	 * the **iotdata** service identifier:
	 *
	 * ```javascript
	 * AWS.config.apiVersions = {
	 *   iotdata: '2015-05-28',
	 *   // other service API versions
	 * };
	 *
	 * var iotdata = new AWS.IotData({endpoint: 'my.host.tld'});
	 * ```
	 *
	 * @note You *must* provide an `endpoint` configuration parameter when
	 *   constructing this service. See {constructor} for more information.
	 *
	 * @!method constructor(options = {})
	 *   Constructs a service object. This object has one method for each
	 *   API operation.
	 *
	 *   @example Constructing a IotData object
	 *     var iotdata = new AWS.IotData({endpoint: 'my.host.tld'});
	 *   @note You *must* provide an `endpoint` when constructing this service.
	 *   @option (see AWS.Config.constructor)
	 *
	 * @service iotdata
	 * @version 2015-05-28
	 */
	AWS.util.update(AWS.IotData.prototype, {
	    /**
	     * @api private
	     */
	    validateService: function validateService() {
	        if (!this.config.endpoint || this.config.endpoint.indexOf('{') >= 0) {
	            var msg = 'AWS.IotData requires an explicit ' +
	                '`endpoint\' configuration option.';
	            throw AWS.util.error(new Error(),
	                {name: 'InvalidEndpoint', message: msg});
	        }
	    },

	    /**
	     * @api private
	     */
	    setupRequestListeners: function setupRequestListeners(request) {
	        request.addListener('validateResponse', this.validateResponseBody)
	    },

	    /**
	     * @api private
	     */
	    validateResponseBody: function validateResponseBody(resp) {
	        var body = resp.httpResponse.body.toString() || '{}';
	        var bodyCheck = body.trim();
	        if (!bodyCheck || bodyCheck.charAt(0) !== '{') {
	            resp.httpResponse.body = '';
	        }
	    }

	});


/***/ },
/* 315 */,
/* 316 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(3);
	var AWS = __webpack_require__(5);
	var Service = __webpack_require__(86);
	var apiLoader = __webpack_require__(94);

	apiLoader.services['kinesis'] = {};
	AWS.Kinesis = Service.defineService('kinesis', ['2013-12-02']);
	Object.defineProperty(apiLoader.services['kinesis'], '2013-12-02', {
	  get: function get() {
	    var model = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/kinesis-2013-12-02.min.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	    model.paginators = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/kinesis-2013-12-02.paginators.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())).pagination;
	    model.waiters = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/kinesis-2013-12-02.waiters2.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())).waiters;
	    return model;
	  },
	  enumerable: true,
	  configurable: true
	});

	module.exports = AWS.Kinesis;


/***/ },
/* 317 */,
/* 318 */,
/* 319 */,
/* 320 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(3);
	var AWS = __webpack_require__(5);
	var Service = __webpack_require__(86);
	var apiLoader = __webpack_require__(94);

	apiLoader.services['kinesisanalytics'] = {};
	AWS.KinesisAnalytics = Service.defineService('kinesisanalytics', ['2015-08-14']);
	Object.defineProperty(apiLoader.services['kinesisanalytics'], '2015-08-14', {
	  get: function get() {
	    var model = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/kinesisanalytics-2015-08-14.min.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	    return model;
	  },
	  enumerable: true,
	  configurable: true
	});

	module.exports = AWS.KinesisAnalytics;


/***/ },
/* 321 */,
/* 322 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(3);
	var AWS = __webpack_require__(5);
	var Service = __webpack_require__(86);
	var apiLoader = __webpack_require__(94);

	apiLoader.services['kms'] = {};
	AWS.KMS = Service.defineService('kms', ['2014-11-01']);
	Object.defineProperty(apiLoader.services['kms'], '2014-11-01', {
	  get: function get() {
	    var model = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/kms-2014-11-01.min.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	    model.paginators = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/kms-2014-11-01.paginators.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())).pagination;
	    return model;
	  },
	  enumerable: true,
	  configurable: true
	});

	module.exports = AWS.KMS;


/***/ },
/* 323 */,
/* 324 */,
/* 325 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(3);
	var AWS = __webpack_require__(5);
	var Service = __webpack_require__(86);
	var apiLoader = __webpack_require__(94);

	apiLoader.services['lambda'] = {};
	AWS.Lambda = Service.defineService('lambda', ['2014-11-11', '2015-03-31']);
	Object.defineProperty(apiLoader.services['lambda'], '2014-11-11', {
	  get: function get() {
	    var model = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/lambda-2014-11-11.min.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	    model.paginators = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/lambda-2014-11-11.paginators.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())).pagination;
	    return model;
	  },
	  enumerable: true,
	  configurable: true
	});
	Object.defineProperty(apiLoader.services['lambda'], '2015-03-31', {
	  get: function get() {
	    var model = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/lambda-2015-03-31.min.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	    model.paginators = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/lambda-2015-03-31.paginators.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())).pagination;
	    return model;
	  },
	  enumerable: true,
	  configurable: true
	});

	module.exports = AWS.Lambda;


/***/ },
/* 326 */,
/* 327 */,
/* 328 */,
/* 329 */,
/* 330 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(3);
	var AWS = __webpack_require__(5);
	var Service = __webpack_require__(86);
	var apiLoader = __webpack_require__(94);

	apiLoader.services['lightsail'] = {};
	AWS.Lightsail = Service.defineService('lightsail', ['2016-11-28']);
	Object.defineProperty(apiLoader.services['lightsail'], '2016-11-28', {
	  get: function get() {
	    var model = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/lightsail-2016-11-28.min.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	    return model;
	  },
	  enumerable: true,
	  configurable: true
	});

	module.exports = AWS.Lightsail;


/***/ },
/* 331 */,
/* 332 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(3);
	var AWS = __webpack_require__(5);
	var Service = __webpack_require__(86);
	var apiLoader = __webpack_require__(94);

	apiLoader.services['machinelearning'] = {};
	AWS.MachineLearning = Service.defineService('machinelearning', ['2014-12-12']);
	__webpack_require__(333);
	Object.defineProperty(apiLoader.services['machinelearning'], '2014-12-12', {
	  get: function get() {
	    var model = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/machinelearning-2014-12-12.min.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	    model.paginators = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/machinelearning-2014-12-12.paginators.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())).pagination;
	    model.waiters = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/machinelearning-2014-12-12.waiters2.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())).waiters;
	    return model;
	  },
	  enumerable: true,
	  configurable: true
	});

	module.exports = AWS.MachineLearning;


/***/ },
/* 333 */
/***/ function(module, exports, __webpack_require__) {

	var AWS = __webpack_require__(5);

	AWS.util.update(AWS.MachineLearning.prototype, {
	  /**
	   * @api private
	   */
	  setupRequestListeners: function setupRequestListeners(request) {
	    if (request.operation === 'predict') {
	      request.addListener('build', this.buildEndpoint);
	    }
	  },

	  /**
	   * Updates request endpoint from PredictEndpoint
	   * @api private
	   */
	  buildEndpoint: function buildEndpoint(request) {
	    var url = request.params.PredictEndpoint;
	    if (url) {
	      request.httpRequest.endpoint = new AWS.Endpoint(url);
	    }
	  }

	});


/***/ },
/* 334 */,
/* 335 */,
/* 336 */,
/* 337 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(3);
	var AWS = __webpack_require__(5);
	var Service = __webpack_require__(86);
	var apiLoader = __webpack_require__(94);

	apiLoader.services['marketplacecommerceanalytics'] = {};
	AWS.MarketplaceCommerceAnalytics = Service.defineService('marketplacecommerceanalytics', ['2015-07-01']);
	Object.defineProperty(apiLoader.services['marketplacecommerceanalytics'], '2015-07-01', {
	  get: function get() {
	    var model = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/marketplacecommerceanalytics-2015-07-01.min.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	    return model;
	  },
	  enumerable: true,
	  configurable: true
	});

	module.exports = AWS.MarketplaceCommerceAnalytics;


/***/ },
/* 338 */,
/* 339 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(3);
	var AWS = __webpack_require__(5);
	var Service = __webpack_require__(86);
	var apiLoader = __webpack_require__(94);

	apiLoader.services['marketplacemetering'] = {};
	AWS.MarketplaceMetering = Service.defineService('marketplacemetering', ['2016-01-14']);
	Object.defineProperty(apiLoader.services['marketplacemetering'], '2016-01-14', {
	  get: function get() {
	    var model = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/meteringmarketplace-2016-01-14.min.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	    return model;
	  },
	  enumerable: true,
	  configurable: true
	});

	module.exports = AWS.MarketplaceMetering;


/***/ },
/* 340 */,
/* 341 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(3);
	var AWS = __webpack_require__(5);
	var Service = __webpack_require__(86);
	var apiLoader = __webpack_require__(94);

	apiLoader.services['mobileanalytics'] = {};
	AWS.MobileAnalytics = Service.defineService('mobileanalytics', ['2014-06-05']);
	Object.defineProperty(apiLoader.services['mobileanalytics'], '2014-06-05', {
	  get: function get() {
	    var model = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/mobileanalytics-2014-06-05.min.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	    return model;
	  },
	  enumerable: true,
	  configurable: true
	});

	module.exports = AWS.MobileAnalytics;


/***/ },
/* 342 */,
/* 343 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(3);
	var AWS = __webpack_require__(5);
	var Service = __webpack_require__(86);
	var apiLoader = __webpack_require__(94);

	apiLoader.services['opsworks'] = {};
	AWS.OpsWorks = Service.defineService('opsworks', ['2013-02-18']);
	Object.defineProperty(apiLoader.services['opsworks'], '2013-02-18', {
	  get: function get() {
	    var model = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/opsworks-2013-02-18.min.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	    model.paginators = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/opsworks-2013-02-18.paginators.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())).pagination;
	    model.waiters = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/opsworks-2013-02-18.waiters2.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())).waiters;
	    return model;
	  },
	  enumerable: true,
	  configurable: true
	});

	module.exports = AWS.OpsWorks;


/***/ },
/* 344 */,
/* 345 */,
/* 346 */,
/* 347 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(3);
	var AWS = __webpack_require__(5);
	var Service = __webpack_require__(86);
	var apiLoader = __webpack_require__(94);

	apiLoader.services['opsworkscm'] = {};
	AWS.OpsWorksCM = Service.defineService('opsworkscm', ['2016-11-01']);
	Object.defineProperty(apiLoader.services['opsworkscm'], '2016-11-01', {
	  get: function get() {
	    var model = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/opsworkscm-2016-11-01.min.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	    return model;
	  },
	  enumerable: true,
	  configurable: true
	});

	module.exports = AWS.OpsWorksCM;


/***/ },
/* 348 */,
/* 349 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(3);
	var AWS = __webpack_require__(5);
	var Service = __webpack_require__(86);
	var apiLoader = __webpack_require__(94);

	apiLoader.services['pinpoint'] = {};
	AWS.Pinpoint = Service.defineService('pinpoint', ['2016-12-01']);
	Object.defineProperty(apiLoader.services['pinpoint'], '2016-12-01', {
	  get: function get() {
	    var model = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/pinpoint-2016-12-01.min.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	    return model;
	  },
	  enumerable: true,
	  configurable: true
	});

	module.exports = AWS.Pinpoint;


/***/ },
/* 350 */,
/* 351 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(3);
	var AWS = __webpack_require__(5);
	var Service = __webpack_require__(86);
	var apiLoader = __webpack_require__(94);

	apiLoader.services['polly'] = {};
	AWS.Polly = Service.defineService('polly', ['2016-06-10']);
	__webpack_require__(352);
	Object.defineProperty(apiLoader.services['polly'], '2016-06-10', {
	  get: function get() {
	    var model = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/polly-2016-06-10.min.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	    return model;
	  },
	  enumerable: true,
	  configurable: true
	});

	module.exports = AWS.Polly;


/***/ },
/* 352 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(353);

/***/ },
/* 353 */
/***/ function(module, exports, __webpack_require__) {

	var AWS = __webpack_require__(5);
	var rest = __webpack_require__(13);

	/**
	 * A presigner object can be used to generate presigned urls for the Polly service.
	 */
	AWS.Polly.Presigner = AWS.util.inherit({
	    /**
	     * Creates a presigner object with a set of configuration options.
	     *
	     * @option options params [map] An optional map of parameters to bind to every
	     *   request sent by this service object.
	     * @option options service [AWS.Polly] An optional pre-configured instance
	     *  of the AWS.Polly service object to use for requests. The object may
	     *  bound parameters used by the presigner.
	     * @see AWS.Polly.constructor
	     */
	    constructor: function Signer(options) {
	        options = options || {};
	        this.options = options;
	        this.service = options.service;
	        this.bindServiceObject(options);
	        this._operations = {};
	    },

	    /**
	     * @api private
	     */
	    bindServiceObject: function bindServiceObject(options) {
	        options = options || {};
	        if (!this.service) {
	            this.service = new AWS.Polly(options);
	        } else {
	            var config = AWS.util.copy(this.service.config);
	            this.service = new this.service.constructor.__super__(config);
	            this.service.config.params = AWS.util.merge(this.service.config.params || {}, options.params);
	        }
	    },

	    /**
	     * @api private
	     */
	    modifyInputMembers: function modifyInputMembers(input) {
	        // make copies of the input so we don't overwrite the api
	        // need to be careful to copy anything we access/modify
	        var modifiedInput = AWS.util.copy(input);
	        modifiedInput.members = AWS.util.copy(input.members);
	        AWS.util.each(input.members, function(name, member) {
	            modifiedInput.members[name] = AWS.util.copy(member);
	            // update location and locationName
	            if (!member.location || member.location === 'body') {
	                modifiedInput.members[name].location = 'querystring';
	                modifiedInput.members[name].locationName = name;
	            }
	        });
	        return modifiedInput;
	    },

	    /**
	     * @api private
	     */
	    convertPostToGet: function convertPostToGet(req) {
	        // convert method
	        req.httpRequest.method = 'GET';

	        var operation = req.service.api.operations[req.operation];
	        // get cached operation input first
	        var input = this._operations[req.operation];
	        if (!input) {
	            // modify the original input
	            this._operations[req.operation] = input = this.modifyInputMembers(operation.input);
	        }

	        var uri = rest.generateURI(req.httpRequest.endpoint.path, operation.httpPath, input, req.params);

	        req.httpRequest.path = uri;
	        req.httpRequest.body = '';

	        // don't need these headers on a GET request
	        delete req.httpRequest.headers['Content-Length'];
	        delete req.httpRequest.headers['Content-Type'];
	    },

	    /**
	     * @overload getSynthesizeSpeechUrl(params = {}, [expires = 3600], [callback])
	     *   Generate a presigned url for {AWS.Polly.synthesizeSpeech}.
	     *   @note You must ensure that you have static or previously resolved
	     *     credentials if you call this method synchronously (with no callback),
	     *     otherwise it may not properly sign the request. If you cannot guarantee
	     *     this (you are using an asynchronous credential provider, i.e., EC2
	     *     IAM roles), you should always call this method with an asynchronous
	     *     callback.
	     *   @param params [map] parameters to pass to the operation. See the {AWS.Polly.synthesizeSpeech}
	     *     operation for the expected operation parameters.
	     *   @param expires [Integer] (3600) the number of seconds to expire the pre-signed URL operation in.
	     *     Defaults to 1 hour.
	     *   @return [string] if called synchronously (with no callback), returns the signed URL.
	     *   @return [null] nothing is returned if a callback is provided.
	     *   @callback callback function (err, url)
	     *     If a callback is supplied, it is called when a signed URL has been generated.
	     *     @param err [Error] the error object returned from the presigner.
	     *     @param url [String] the signed URL.
	     *   @see AWS.Polly.synthesizeSpeech
	     */
	    getSynthesizeSpeechUrl: function getSynthesizeSpeechUrl(params, expires, callback) {
	        var self = this;
	        var request = this.service.makeRequest('synthesizeSpeech', params);
	        // remove existing build listeners
	        request.removeAllListeners('build');
	        request.on('build', function(req) {
	            self.convertPostToGet(req);
	        });
	        return request.presign(expires, callback);
	    }
	});


/***/ },
/* 354 */,
/* 355 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(3);
	var AWS = __webpack_require__(5);
	var Service = __webpack_require__(86);
	var apiLoader = __webpack_require__(94);

	apiLoader.services['rds'] = {};
	AWS.RDS = Service.defineService('rds', ['2013-01-10', '2013-02-12', '2013-09-09', '2014-09-01*', '2014-10-31']);
	__webpack_require__(356);
	Object.defineProperty(apiLoader.services['rds'], '2013-01-10', {
	  get: function get() {
	    var model = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/rds-2013-01-10.min.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	    model.paginators = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/rds-2013-01-10.paginators.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())).pagination;
	    return model;
	  },
	  enumerable: true,
	  configurable: true
	});
	Object.defineProperty(apiLoader.services['rds'], '2013-02-12', {
	  get: function get() {
	    var model = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/rds-2013-02-12.min.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	    model.paginators = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/rds-2013-02-12.paginators.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())).pagination;
	    return model;
	  },
	  enumerable: true,
	  configurable: true
	});
	Object.defineProperty(apiLoader.services['rds'], '2013-09-09', {
	  get: function get() {
	    var model = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/rds-2013-09-09.min.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	    model.paginators = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/rds-2013-09-09.paginators.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())).pagination;
	    model.waiters = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/rds-2013-09-09.waiters2.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())).waiters;
	    return model;
	  },
	  enumerable: true,
	  configurable: true
	});
	Object.defineProperty(apiLoader.services['rds'], '2014-10-31', {
	  get: function get() {
	    var model = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/rds-2014-10-31.min.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	    model.paginators = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/rds-2014-10-31.paginators.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())).pagination;
	    model.waiters = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/rds-2014-10-31.waiters2.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())).waiters;
	    return model;
	  },
	  enumerable: true,
	  configurable: true
	});

	module.exports = AWS.RDS;


/***/ },
/* 356 */
/***/ function(module, exports, __webpack_require__) {

	var AWS = __webpack_require__(5);

	 /**
	  * @api private
	  */
	 var crossRegionOperations = ['copyDBSnapshot'];

	 AWS.util.update(AWS.RDS.prototype, {
	   /**
	    * @api private
	    */
	   setupRequestListeners: function setupRequestListeners(request) {
	     if (crossRegionOperations.indexOf(request.operation) !== -1 &&
	         request.params.SourceRegion) {
	       request.params = AWS.util.copy(request.params);
	       if (request.params.PresignedUrl ||
	           request.params.SourceRegion === this.config.region) {
	         delete request.params.SourceRegion;
	       } else {
	         request.onAsync('validate', this.buildCrossRegionPresignedUrl);
	       }
	     }
	   },

	   /**
	    * @api private
	    */
	   buildCrossRegionPresignedUrl: function buildCrossRegionPresignedUrl(req, done) {
	     var config = AWS.util.copy(req.service.config);
	     config.region = req.params.SourceRegion;
	     delete req.params.SourceRegion;
	     delete config.endpoint;
	     // relevant params for the operation will already be in req.params
	     delete config.params;
	     config.signatureVersion = 'v4';
	     var destinationRegion = req.service.config.region;

	     var svc = new req.service.constructor(config);
	     var newReq = svc[req.operation](AWS.util.copy(req.params));
	     newReq.on('build', function addDestinationRegionParam(request) {
	       var httpRequest = request.httpRequest;
	       httpRequest.params.DestinationRegion = destinationRegion;
	       httpRequest.body = AWS.util.queryParamsToString(httpRequest.params);
	     });
	     newReq.presign(function(err, url) {
	       if (err) done(err);
	       else {
	         req.params.PresignedUrl = url;
	         done();
	       }
	     });
	   }
	 });

/***/ },
/* 357 */,
/* 358 */,
/* 359 */,
/* 360 */,
/* 361 */,
/* 362 */,
/* 363 */,
/* 364 */,
/* 365 */,
/* 366 */,
/* 367 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(3);
	var AWS = __webpack_require__(5);
	var Service = __webpack_require__(86);
	var apiLoader = __webpack_require__(94);

	apiLoader.services['redshift'] = {};
	AWS.Redshift = Service.defineService('redshift', ['2012-12-01']);
	Object.defineProperty(apiLoader.services['redshift'], '2012-12-01', {
	  get: function get() {
	    var model = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/redshift-2012-12-01.min.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	    model.paginators = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/redshift-2012-12-01.paginators.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())).pagination;
	    model.waiters = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/redshift-2012-12-01.waiters2.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())).waiters;
	    return model;
	  },
	  enumerable: true,
	  configurable: true
	});

	module.exports = AWS.Redshift;


/***/ },
/* 368 */,
/* 369 */,
/* 370 */,
/* 371 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(3);
	var AWS = __webpack_require__(5);
	var Service = __webpack_require__(86);
	var apiLoader = __webpack_require__(94);

	apiLoader.services['rekognition'] = {};
	AWS.Rekognition = Service.defineService('rekognition', ['2016-06-27']);
	Object.defineProperty(apiLoader.services['rekognition'], '2016-06-27', {
	  get: function get() {
	    var model = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/rekognition-2016-06-27.min.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	    model.paginators = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/rekognition-2016-06-27.paginators.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())).pagination;
	    return model;
	  },
	  enumerable: true,
	  configurable: true
	});

	module.exports = AWS.Rekognition;


/***/ },
/* 372 */,
/* 373 */,
/* 374 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(3);
	var AWS = __webpack_require__(5);
	var Service = __webpack_require__(86);
	var apiLoader = __webpack_require__(94);

	apiLoader.services['route53'] = {};
	AWS.Route53 = Service.defineService('route53', ['2013-04-01']);
	__webpack_require__(375);
	Object.defineProperty(apiLoader.services['route53'], '2013-04-01', {
	  get: function get() {
	    var model = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/route53-2013-04-01.min.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	    model.paginators = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/route53-2013-04-01.paginators.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())).pagination;
	    model.waiters = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/route53-2013-04-01.waiters2.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())).waiters;
	    return model;
	  },
	  enumerable: true,
	  configurable: true
	});

	module.exports = AWS.Route53;


/***/ },
/* 375 */
/***/ function(module, exports, __webpack_require__) {

	var AWS = __webpack_require__(5);

	AWS.util.update(AWS.Route53.prototype, {
	  /**
	   * @api private
	   */
	  setupRequestListeners: function setupRequestListeners(request) {
	    request.on('build', this.sanitizeUrl);
	  },

	  /**
	   * @api private
	   */
	  sanitizeUrl: function sanitizeUrl(request) {
	    var path = request.httpRequest.path;
	    request.httpRequest.path = path.replace(/\/%2F\w+%2F/, '/');
	  },

	  /**
	   * @return [Boolean] whether the error can be retried
	   * @api private
	   */
	  retryableError: function retryableError(error) {
	    if (error.code === 'PriorRequestNotComplete' &&
	        error.statusCode === 400) {
	      return true;
	    } else {
	      var _super = AWS.Service.prototype.retryableError;
	      return _super.call(this, error);
	    }
	  }
	});


/***/ },
/* 376 */,
/* 377 */,
/* 378 */,
/* 379 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(3);
	var AWS = __webpack_require__(5);
	var Service = __webpack_require__(86);
	var apiLoader = __webpack_require__(94);

	apiLoader.services['route53domains'] = {};
	AWS.Route53Domains = Service.defineService('route53domains', ['2014-05-15']);
	Object.defineProperty(apiLoader.services['route53domains'], '2014-05-15', {
	  get: function get() {
	    var model = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/route53domains-2014-05-15.min.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	    model.paginators = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/route53domains-2014-05-15.paginators.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())).pagination;
	    return model;
	  },
	  enumerable: true,
	  configurable: true
	});

	module.exports = AWS.Route53Domains;


/***/ },
/* 380 */,
/* 381 */,
/* 382 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(3);
	var AWS = __webpack_require__(5);
	var Service = __webpack_require__(86);
	var apiLoader = __webpack_require__(94);

	apiLoader.services['s3'] = {};
	AWS.S3 = Service.defineService('s3', ['2006-03-01']);
	__webpack_require__(383);
	Object.defineProperty(apiLoader.services['s3'], '2006-03-01', {
	  get: function get() {
	    var model = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/s3-2006-03-01.min.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	    model.paginators = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/s3-2006-03-01.paginators.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())).pagination;
	    model.waiters = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/s3-2006-03-01.waiters2.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())).waiters;
	    return model;
	  },
	  enumerable: true,
	  configurable: true
	});

	module.exports = AWS.S3;


/***/ },
/* 383 */
/***/ function(module, exports, __webpack_require__) {

	var AWS = __webpack_require__(5);

	// Pull in managed upload extension
	__webpack_require__(384);

	/**
	 * @api private
	 */
	var operationsWith200StatusCodeError = {
	  'completeMultipartUpload': true,
	  'copyObject': true,
	  'uploadPartCopy': true
	};

	/**
	 * @api private
	 */
	 var regionRedirectErrorCodes = [
	  'AuthorizationHeaderMalformed', // non-head operations on virtual-hosted global bucket endpoints
	  'BadRequest', // head operations on virtual-hosted global bucket endpoints
	  'PermanentRedirect', // non-head operations on path-style or regional endpoints
	  301 // head operations on path-style or regional endpoints
	 ];

	AWS.util.update(AWS.S3.prototype, {
	  /**
	   * @api private
	   */
	  getSignerClass: function getSignerClass(request) {
	    var defaultApiVersion = this.api.signatureVersion;
	    var userDefinedVersion = this._originalConfig ? this._originalConfig.signatureVersion : null;
	    var regionDefinedVersion = this.config.signatureVersion;
	    var isPresigned = request ? request.isPresigned() : false;
	    /*
	      1) User defined version specified:
	        a) always return user defined version
	      2) No user defined version specified:
	        a) default to lowest version the region supports
	    */
	    if (userDefinedVersion) {
	      userDefinedVersion = userDefinedVersion === 'v2' ? 's3' : userDefinedVersion;
	      return AWS.Signers.RequestSigner.getVersion(userDefinedVersion);
	    }
	    if (regionDefinedVersion) {
	      defaultApiVersion = regionDefinedVersion;
	    }

	    return AWS.Signers.RequestSigner.getVersion(defaultApiVersion);
	  },

	  /**
	   * @api private
	   */
	  validateService: function validateService() {
	    var msg;
	    var messages = [];

	    // default to us-east-1 when no region is provided
	    if (!this.config.region) this.config.region = 'us-east-1';

	    if (!this.config.endpoint && this.config.s3BucketEndpoint) {
	      messages.push('An endpoint must be provided when configuring ' +
	                    '`s3BucketEndpoint` to true.');
	    }
	    if (messages.length === 1) {
	      msg = messages[0];
	    } else if (messages.length > 1) {
	      msg = 'Multiple configuration errors:\n' + messages.join('\n');
	    }
	    if (msg) {
	      throw AWS.util.error(new Error(),
	        {name: 'InvalidEndpoint', message: msg});
	    }
	  },

	  /**
	   * @api private
	   */
	  shouldDisableBodySigning: function shouldDisableBodySigning(request) {
	    var signerClass = this.getSignerClass();
	    if (this.config.s3DisableBodySigning === true && signerClass === AWS.Signers.V4
	        && request.httpRequest.endpoint.protocol === 'https:') {
	      return true;
	    }
	    return false;
	  },

	  /**
	   * @api private
	   */
	  setupRequestListeners: function setupRequestListeners(request) {
	    request.addListener('validate', this.validateScheme);
	    request.addListener('validate', this.validateBucketEndpoint);
	    request.addListener('validate', this.correctBucketRegionFromCache);
	    request.addListener('build', this.addContentType);
	    request.addListener('build', this.populateURI);
	    request.addListener('build', this.computeContentMd5);
	    request.addListener('build', this.computeSseCustomerKeyMd5);
	    request.addListener('afterBuild', this.addExpect100Continue);
	    request.removeListener('validate',
	      AWS.EventListeners.Core.VALIDATE_REGION);
	    request.addListener('extractError', this.extractError);
	    request.onAsync('extractError', this.requestBucketRegion);
	    request.addListener('extractData', this.extractData);
	    request.addListener('extractData', AWS.util.hoistPayloadMember);
	    request.addListener('beforePresign', this.prepareSignedUrl);
	    if (AWS.util.isBrowser()) {
	      request.onAsync('retry', this.reqRegionForNetworkingError);
	    }
	    if (this.shouldDisableBodySigning(request))  {
	      request.removeListener('afterBuild', AWS.EventListeners.Core.COMPUTE_SHA256);
	      request.addListener('afterBuild', this.disableBodySigning);
	    }
	  },

	  /**
	   * @api private
	   */
	  validateScheme: function(req) {
	    var params = req.params,
	        scheme = req.httpRequest.endpoint.protocol,
	        sensitive = params.SSECustomerKey || params.CopySourceSSECustomerKey;
	    if (sensitive && scheme !== 'https:') {
	      var msg = 'Cannot send SSE keys over HTTP. Set \'sslEnabled\'' +
	        'to \'true\' in your configuration';
	      throw AWS.util.error(new Error(),
	        { code: 'ConfigError', message: msg });
	    }
	  },

	  /**
	   * @api private
	   */
	  validateBucketEndpoint: function(req) {
	    if (!req.params.Bucket && req.service.config.s3BucketEndpoint) {
	      var msg = 'Cannot send requests to root API with `s3BucketEndpoint` set.';
	      throw AWS.util.error(new Error(),
	        { code: 'ConfigError', message: msg });
	    }
	  },

	  /**
	   * @api private
	   */
	  isValidAccelerateOperation: function isValidAccelerateOperation(operation) {
	    var invalidOperations = [
	      'createBucket',
	      'deleteBucket',
	      'listBuckets'
	    ];
	    return invalidOperations.indexOf(operation) === -1;
	  },


	  /**
	   * S3 prefers dns-compatible bucket names to be moved from the uri path
	   * to the hostname as a sub-domain.  This is not possible, even for dns-compat
	   * buckets when using SSL and the bucket name contains a dot ('.').  The
	   * ssl wildcard certificate is only 1-level deep.
	   *
	   * @api private
	   */
	  populateURI: function populateURI(req) {
	    var httpRequest = req.httpRequest;
	    var b = req.params.Bucket;
	    var service = req.service;
	    var endpoint = httpRequest.endpoint;

	    if (b) {
	      if (!service.pathStyleBucketName(b)) {
	        if (service.config.useAccelerateEndpoint && service.isValidAccelerateOperation(req.operation)) {
	          if (service.config.useDualstack) {
	            endpoint.hostname = b + '.s3-accelerate.dualstack.amazonaws.com';
	          } else {
	            endpoint.hostname = b + '.s3-accelerate.amazonaws.com';
	          }
	        } else if (!service.config.s3BucketEndpoint) {
	          endpoint.hostname =
	            b + '.' + endpoint.hostname;
	        }

	        var port = endpoint.port;
	        if (port !== 80 && port !== 443) {
	          endpoint.host = endpoint.hostname + ':' +
	            endpoint.port;
	        } else {
	          endpoint.host = endpoint.hostname;
	        }

	        httpRequest.virtualHostedBucket = b; // needed for signing the request
	        service.removeVirtualHostedBucketFromPath(req);
	      }
	    }
	  },

	  /**
	   * Takes the bucket name out of the path if bucket is virtual-hosted
	   *
	   * @api private
	   */
	  removeVirtualHostedBucketFromPath: function removeVirtualHostedBucketFromPath(req) {
	    var httpRequest = req.httpRequest;
	    var bucket = httpRequest.virtualHostedBucket;
	    if (bucket && httpRequest.path) {
	      httpRequest.path = httpRequest.path.replace(new RegExp('/' + bucket), '');
	      if (httpRequest.path[0] !== '/') {
	        httpRequest.path = '/' + httpRequest.path;
	      }
	    }
	  },

	  /**
	   * Adds Expect: 100-continue header if payload is greater-or-equal 1MB
	   * @api private
	   */
	  addExpect100Continue: function addExpect100Continue(req) {
	    var len = req.httpRequest.headers['Content-Length'];
	    if (AWS.util.isNode() && len >= 1024 * 1024) {
	      req.httpRequest.headers['Expect'] = '100-continue';
	    }
	  },

	  /**
	   * Adds a default content type if none is supplied.
	   *
	   * @api private
	   */
	  addContentType: function addContentType(req) {
	    var httpRequest = req.httpRequest;
	    if (httpRequest.method === 'GET' || httpRequest.method === 'HEAD') {
	      // Content-Type is not set in GET/HEAD requests
	      delete httpRequest.headers['Content-Type'];
	      return;
	    }

	    if (!httpRequest.headers['Content-Type']) { // always have a Content-Type
	      httpRequest.headers['Content-Type'] = 'application/octet-stream';
	    }

	    var contentType = httpRequest.headers['Content-Type'];
	    if (AWS.util.isBrowser()) {
	      if (typeof httpRequest.body === 'string' && !contentType.match(/;\s*charset=/)) {
	        var charset = '; charset=UTF-8';
	        httpRequest.headers['Content-Type'] += charset;
	      } else {
	        var replaceFn = function(_, prefix, charsetName) {
	          return prefix + charsetName.toUpperCase();
	        };

	        httpRequest.headers['Content-Type'] =
	          contentType.replace(/(;\s*charset=)(.+)$/, replaceFn);
	      }
	    }
	  },

	  /**
	   * @api private
	   */
	  computableChecksumOperations: {
	    putBucketCors: true,
	    putBucketLifecycle: true,
	    putBucketLifecycleConfiguration: true,
	    putBucketTagging: true,
	    deleteObjects: true,
	    putBucketReplication: true
	  },

	  /**
	   * Checks whether checksums should be computed for the request.
	   * If the request requires checksums to be computed, this will always
	   * return true, otherwise it depends on whether {AWS.Config.computeChecksums}
	   * is set.
	   *
	   * @param req [AWS.Request] the request to check against
	   * @return [Boolean] whether to compute checksums for a request.
	   * @api private
	   */
	  willComputeChecksums: function willComputeChecksums(req) {
	    if (this.computableChecksumOperations[req.operation]) return true;
	    if (!this.config.computeChecksums) return false;

	    // TODO: compute checksums for Stream objects
	    if (!AWS.util.Buffer.isBuffer(req.httpRequest.body) &&
	        typeof req.httpRequest.body !== 'string') {
	      return false;
	    }

	    var rules = req.service.api.operations[req.operation].input.members;

	    // Sha256 signing disabled, and not a presigned url
	    if (req.service.shouldDisableBodySigning(req) && !Object.prototype.hasOwnProperty.call(req.httpRequest.headers, 'presigned-expires')) {
	      if (rules.ContentMD5 && !req.params.ContentMD5) {
	        return true;
	      }
	    }

	    // V4 signer uses SHA256 signatures so only compute MD5 if it is required
	    if (req.service.getSignerClass(req) === AWS.Signers.V4) {
	      if (rules.ContentMD5 && !rules.ContentMD5.required) return false;
	    }

	    if (rules.ContentMD5 && !req.params.ContentMD5) return true;
	  },

	  /**
	   * A listener that computes the Content-MD5 and sets it in the header.
	   * @see AWS.S3.willComputeChecksums
	   * @api private
	   */
	  computeContentMd5: function computeContentMd5(req) {
	    if (req.service.willComputeChecksums(req)) {
	      var md5 = AWS.util.crypto.md5(req.httpRequest.body, 'base64');
	      req.httpRequest.headers['Content-MD5'] = md5;
	    }
	  },

	  /**
	   * @api private
	   */
	  computeSseCustomerKeyMd5: function computeSseCustomerKeyMd5(req) {
	    var keys = {
	      SSECustomerKey: 'x-amz-server-side-encryption-customer-key-MD5',
	      CopySourceSSECustomerKey: 'x-amz-copy-source-server-side-encryption-customer-key-MD5'
	    };
	    AWS.util.each(keys, function(key, header) {
	      if (req.params[key]) {
	        var value = AWS.util.crypto.md5(req.params[key], 'base64');
	        req.httpRequest.headers[header] = value;
	      }
	    });
	  },

	  /**
	   * Returns true if the bucket name should be left in the URI path for
	   * a request to S3.  This function takes into account the current
	   * endpoint protocol (e.g. http or https).
	   *
	   * @api private
	   */
	  pathStyleBucketName: function pathStyleBucketName(bucketName) {
	    // user can force path style requests via the configuration
	    if (this.config.s3ForcePathStyle) return true;
	    if (this.config.s3BucketEndpoint) return false;

	    if (this.dnsCompatibleBucketName(bucketName)) {
	      return (this.config.sslEnabled && bucketName.match(/\./)) ? true : false;
	    } else {
	      return true; // not dns compatible names must always use path style
	    }
	  },

	  /**
	   * Returns true if the bucket name is DNS compatible.  Buckets created
	   * outside of the classic region MUST be DNS compatible.
	   *
	   * @api private
	   */
	  dnsCompatibleBucketName: function dnsCompatibleBucketName(bucketName) {
	    var b = bucketName;
	    var domain = new RegExp(/^[a-z0-9][a-z0-9\.\-]{1,61}[a-z0-9]$/);
	    var ipAddress = new RegExp(/(\d+\.){3}\d+/);
	    var dots = new RegExp(/\.\./);
	    return (b.match(domain) && !b.match(ipAddress) && !b.match(dots)) ? true : false;
	  },

	  /**
	   * @return [Boolean] whether response contains an error
	   * @api private
	   */
	  successfulResponse: function successfulResponse(resp) {
	    var req = resp.request;
	    var httpResponse = resp.httpResponse;
	    if (operationsWith200StatusCodeError[req.operation] &&
	        httpResponse.body.toString().match('<Error>')) {
	      return false;
	    } else {
	      return httpResponse.statusCode < 300;
	    }
	  },

	  /**
	   * @return [Boolean] whether the error can be retried
	   * @api private
	   */
	  retryableError: function retryableError(error, request) {
	    if (operationsWith200StatusCodeError[request.operation] &&
	        error.statusCode === 200) {
	      return true;
	    } else if (request._requestRegionForBucket &&
	        request.service.bucketRegionCache[request._requestRegionForBucket]) {
	      return false;
	    } else if (error && error.code === 'RequestTimeout') {
	      return true;
	    } else if (error &&
	        regionRedirectErrorCodes.indexOf(error.code) != -1 &&
	        error.region && error.region != request.httpRequest.region) {
	      request.httpRequest.region = error.region;
	      if (error.statusCode === 301) {
	        request.service.updateReqBucketRegion(request);
	      }
	      return true;
	    } else {
	      var _super = AWS.Service.prototype.retryableError;
	      return _super.call(this, error, request);
	    }
	  },

	  /**
	   * Updates httpRequest with region. If region is not provided, then
	   * the httpRequest will be updated based on httpRequest.region
	   *
	   * @api private
	   */
	  updateReqBucketRegion: function updateReqBucketRegion(request, region) {
	    var httpRequest = request.httpRequest;
	    if (typeof region === 'string' && region.length) {
	      httpRequest.region = region;
	    }
	    if (!httpRequest.endpoint.host.match(/s3(?!-accelerate).*\.amazonaws\.com$/)) {
	      return;
	    }
	    var service = request.service;
	    var s3Config = service.config;
	    var s3BucketEndpoint = s3Config.s3BucketEndpoint;
	    if (s3BucketEndpoint) {
	      delete s3Config.s3BucketEndpoint;
	    }
	    var newConfig = AWS.util.copy(s3Config);
	    delete newConfig.endpoint;
	    newConfig.region = httpRequest.region;

	    httpRequest.endpoint = (new AWS.S3(newConfig)).endpoint;
	    service.populateURI(request);
	    s3Config.s3BucketEndpoint = s3BucketEndpoint;
	    httpRequest.headers.Host = httpRequest.endpoint.host;

	    if (request._asm.currentState === 'validate') {
	      request.removeListener('build', service.populateURI);
	      request.addListener('build', service.removeVirtualHostedBucketFromPath);
	    }
	  },

	  /**
	   * Provides a specialized parser for getBucketLocation -- all other
	   * operations are parsed by the super class.
	   *
	   * @api private
	   */
	  extractData: function extractData(resp) {
	    var req = resp.request;
	    if (req.operation === 'getBucketLocation') {
	      var match = resp.httpResponse.body.toString().match(/>(.+)<\/Location/);
	      delete resp.data['_'];
	      if (match) {
	        resp.data.LocationConstraint = match[1];
	      } else {
	        resp.data.LocationConstraint = '';
	      }
	    }
	    var bucket = req.params.Bucket || null;
	    if (req.operation === 'deleteBucket' && typeof bucket === 'string' && !resp.error) {
	      req.service.clearBucketRegionCache(bucket);
	    } else {
	      var headers = resp.httpResponse.headers || {};
	      var region = headers['x-amz-bucket-region'] || null;
	      if (!region && req.operation === 'createBucket' && !resp.error) {
	        var createBucketConfiguration = req.params.CreateBucketConfiguration;
	        if (!createBucketConfiguration) {
	          region = 'us-east-1';
	        } else if (createBucketConfiguration.LocationConstraint === 'EU') {
	          region = 'eu-west-1';
	        } else {
	          region = createBucketConfiguration.LocationConstraint;
	        }
	      }
	      if (region) {
	          if (bucket && region !== req.service.bucketRegionCache[bucket]) {
	            req.service.bucketRegionCache[bucket] = region;
	          }
	      }
	    }
	    req.service.extractRequestIds(resp);
	  },

	  /**
	   * Extracts an error object from the http response.
	   *
	   * @api private
	   */
	  extractError: function extractError(resp) {
	    var codes = {
	      304: 'NotModified',
	      403: 'Forbidden',
	      400: 'BadRequest',
	      404: 'NotFound'
	    };

	    var req = resp.request;
	    var code = resp.httpResponse.statusCode;
	    var body = resp.httpResponse.body || '';

	    var headers = resp.httpResponse.headers || {};
	    var region = headers['x-amz-bucket-region'] || null;
	    var bucket = req.params.Bucket || null;
	    var bucketRegionCache = req.service.bucketRegionCache;
	    if (region && bucket && region !== bucketRegionCache[bucket]) {
	      bucketRegionCache[bucket] = region;
	    }

	    var cachedRegion;
	    if (codes[code] && body.length === 0) {
	      if (bucket && !region) {
	        cachedRegion = bucketRegionCache[bucket] || null;
	        if (cachedRegion !== req.httpRequest.region) {
	          region = cachedRegion;
	        }
	      }
	      resp.error = AWS.util.error(new Error(), {
	        code: codes[code],
	        message: null,
	        region: region
	      });
	    } else {
	      var data = new AWS.XML.Parser().parse(body.toString());

	      if (data.Region && !region) {
	        region = data.Region;
	        if (bucket && region !== bucketRegionCache[bucket]) {
	          bucketRegionCache[bucket] = region;
	        }
	      } else if (bucket && !region && !data.Region) {
	        cachedRegion = bucketRegionCache[bucket] || null;
	        if (cachedRegion !== req.httpRequest.region) {
	          region = cachedRegion;
	        }
	      }

	      resp.error = AWS.util.error(new Error(), {
	        code: data.Code || code,
	        message: data.Message || null,
	        region: region
	      });
	    }
	    req.service.extractRequestIds(resp);
	  },

	  /**
	   * If region was not obtained synchronously, then send async request
	   * to get bucket region for errors resulting from wrong region.
	   *
	   * @api private
	   */
	  requestBucketRegion: function requestBucketRegion(resp, done) {
	    var error = resp.error;
	    var req = resp.request;
	    var bucket = req.params.Bucket || null;

	    if (!error || !bucket || error.region || req.operation === 'listObjects' ||
	        (AWS.util.isNode() && req.operation === 'headBucket') ||
	        (error.statusCode === 400 && req.operation !== 'headObject') ||
	        regionRedirectErrorCodes.indexOf(error.code) === -1) {
	      return done();
	    }
	    var reqOperation = AWS.util.isNode() ? 'headBucket' : 'listObjects';
	    var reqParams = {Bucket: bucket};
	    if (reqOperation === 'listObjects') reqParams.MaxKeys = 0;
	    var regionReq = req.service[reqOperation](reqParams);
	    regionReq._requestRegionForBucket = bucket;
	    regionReq.send(function() {
	      var region = req.service.bucketRegionCache[bucket] || null;
	      error.region = region;
	      done();
	    });
	  },

	   /**
	   * For browser only. If NetworkingError received, will attempt to obtain
	   * the bucket region.
	   *
	   * @api private
	   */
	   reqRegionForNetworkingError: function reqRegionForNetworkingError(resp, done) {
	    if (!AWS.util.isBrowser()) {
	      return done();
	    }
	    var error = resp.error;
	    var request = resp.request;
	    var bucket = request.params.Bucket;
	    if (!error || error.code !== 'NetworkingError' || !bucket ||
	        request.httpRequest.region === 'us-east-1') {
	      return done();
	    }
	    var service = request.service;
	    var bucketRegionCache = service.bucketRegionCache;
	    var cachedRegion = bucketRegionCache[bucket] || null;

	    if (cachedRegion && cachedRegion !== request.httpRequest.region) {
	      service.updateReqBucketRegion(request, cachedRegion);
	      done();
	    } else if (!service.dnsCompatibleBucketName(bucket)) {
	      service.updateReqBucketRegion(request, 'us-east-1');
	      if (bucketRegionCache[bucket] !== 'us-east-1') {
	        bucketRegionCache[bucket] = 'us-east-1';
	      }
	      done();
	    } else if (request.httpRequest.virtualHostedBucket) {
	      var getRegionReq = service.listObjects({Bucket: bucket, MaxKeys: 0});
	      service.updateReqBucketRegion(getRegionReq, 'us-east-1');
	      getRegionReq._requestRegionForBucket = bucket;

	      getRegionReq.send(function() {
	        var region = service.bucketRegionCache[bucket] || null;
	        if (region && region !== request.httpRequest.region) {
	          service.updateReqBucketRegion(request, region);
	        }
	        done();
	      });
	    } else {
	      // DNS-compatible path-style
	      // (s3ForcePathStyle or bucket name with dot over https)
	      // Cannot obtain region information for this case
	      done();
	    }
	   },

	  /**
	   * Cache for bucket region.
	   *
	   * @api private
	   */
	   bucketRegionCache: {},

	  /**
	   * Clears bucket region cache.
	   *
	   * @api private
	   */
	   clearBucketRegionCache: function(buckets) {
	    var bucketRegionCache = this.bucketRegionCache;
	    if (!buckets) {
	      buckets = Object.keys(bucketRegionCache);
	    } else if (typeof buckets === 'string') {
	      buckets = [buckets];
	    }
	    for (var i = 0; i < buckets.length; i++) {
	      delete bucketRegionCache[buckets[i]];
	    }
	    return bucketRegionCache;
	   },

	   /**
	    * Corrects request region if bucket's cached region is different
	    *
	    * @api private
	    */
	  correctBucketRegionFromCache: function correctBucketRegionFromCache(req) {
	    var bucket = req.params.Bucket || null;
	    if (bucket) {
	      var service = req.service;
	      var requestRegion = req.httpRequest.region;
	      var cachedRegion = service.bucketRegionCache[bucket];
	      if (cachedRegion && cachedRegion !== requestRegion) {
	        service.updateReqBucketRegion(req, cachedRegion);
	      }
	    }
	  },

	  /**
	   * Extracts S3 specific request ids from the http response.
	   *
	   * @api private
	   */
	  extractRequestIds: function extractRequestIds(resp) {
	    var extendedRequestId = resp.httpResponse.headers ? resp.httpResponse.headers['x-amz-id-2'] : null;
	    var cfId = resp.httpResponse.headers ? resp.httpResponse.headers['x-amz-cf-id'] : null;
	    resp.extendedRequestId = extendedRequestId;
	    resp.cfId = cfId;

	    if (resp.error) {
	      resp.error.requestId = resp.requestId || null;
	      resp.error.extendedRequestId = extendedRequestId;
	      resp.error.cfId = cfId;
	    }
	  },

	  /**
	   * Get a pre-signed URL for a given operation name.
	   *
	   * @note You must ensure that you have static or previously resolved
	   *   credentials if you call this method synchronously (with no callback),
	   *   otherwise it may not properly sign the request. If you cannot guarantee
	   *   this (you are using an asynchronous credential provider, i.e., EC2
	   *   IAM roles), you should always call this method with an asynchronous
	   *   callback.
	   * @param operation [String] the name of the operation to call
	   * @param params [map] parameters to pass to the operation. See the given
	   *   operation for the expected operation parameters. In addition, you can
	   *   also pass the "Expires" parameter to inform S3 how long the URL should
	   *   work for.
	   * @option params Expires [Integer] (900) the number of seconds to expire
	   *   the pre-signed URL operation in. Defaults to 15 minutes.
	   * @param callback [Function] if a callback is provided, this function will
	   *   pass the URL as the second parameter (after the error parameter) to
	   *   the callback function.
	   * @return [String] if called synchronously (with no callback), returns the
	   *   signed URL.
	   * @return [null] nothing is returned if a callback is provided.
	   * @example Pre-signing a getObject operation (synchronously)
	   *   var params = {Bucket: 'bucket', Key: 'key'};
	   *   var url = s3.getSignedUrl('getObject', params);
	   *   console.log('The URL is', url);
	   * @example Pre-signing a putObject (asynchronously)
	   *   var params = {Bucket: 'bucket', Key: 'key'};
	   *   s3.getSignedUrl('putObject', params, function (err, url) {
	   *     console.log('The URL is', url);
	   *   });
	   * @example Pre-signing a putObject operation with a specific payload
	   *   var params = {Bucket: 'bucket', Key: 'key', Body: 'body'};
	   *   var url = s3.getSignedUrl('putObject', params);
	   *   console.log('The URL is', url);
	   * @example Passing in a 1-minute expiry time for a pre-signed URL
	   *   var params = {Bucket: 'bucket', Key: 'key', Expires: 60};
	   *   var url = s3.getSignedUrl('getObject', params);
	   *   console.log('The URL is', url); // expires in 60 seconds
	   */
	  getSignedUrl: function getSignedUrl(operation, params, callback) {
	    params = AWS.util.copy(params || {});
	    var expires = params.Expires || 900;
	    delete params.Expires; // we can't validate this
	    var request = this.makeRequest(operation, params);
	    return request.presign(expires, callback);
	  },

	  /**
	   * @api private
	   */
	  prepareSignedUrl: function prepareSignedUrl(request) {
	    request.addListener('validate', request.service.noPresignedContentLength);
	    request.removeListener('build', request.service.addContentType);
	    if (!request.params.Body) {
	      // no Content-MD5/SHA-256 if body is not provided
	      request.removeListener('build', request.service.computeContentMd5);
	    } else {
	      request.addListener('afterBuild', AWS.EventListeners.Core.COMPUTE_SHA256);
	    }
	  },

	  /**
	   * @api private
	   * @param request
	   */
	  disableBodySigning: function disableBodySigning(request) {
	    var headers = request.httpRequest.headers;
	    // Add the header to anything that isn't a presigned url, unless that presigned url had a body defined
	    if (!Object.prototype.hasOwnProperty.call(headers, 'presigned-expires')) {
	      headers['X-Amz-Content-Sha256'] = 'UNSIGNED-PAYLOAD';
	    }
	  },

	  /**
	   * @api private
	   */
	  noPresignedContentLength: function noPresignedContentLength(request) {
	    if (request.params.ContentLength !== undefined) {
	      throw AWS.util.error(new Error(), {code: 'UnexpectedParameter',
	        message: 'ContentLength is not supported in pre-signed URLs.'});
	    }
	  },

	  createBucket: function createBucket(params, callback) {
	    // When creating a bucket *outside* the classic region, the location
	    // constraint must be set for the bucket and it must match the endpoint.
	    // This chunk of code will set the location constraint param based
	    // on the region (when possible), but it will not override a passed-in
	    // location constraint.
	    if (typeof params === 'function' || !params) {
	      callback = callback || params;
	      params = {};
	    }
	    var hostname = this.endpoint.hostname;
	    if (hostname !== this.api.globalEndpoint && !params.CreateBucketConfiguration) {
	      params.CreateBucketConfiguration = { LocationConstraint: this.config.region };
	    }
	    return this.makeRequest('createBucket', params, callback);
	  },

	  /**
	   * @overload upload(params = {}, [options], [callback])
	   *   Uploads an arbitrarily sized buffer, blob, or stream, using intelligent
	   *   concurrent handling of parts if the payload is large enough. You can
	   *   configure the concurrent queue size by setting `options`. Note that this
	   *   is the only operation for which the SDK can retry requests with stream
	   *   bodies.
	   *
	   *   @param (see AWS.S3.putObject)
	   *   @option (see AWS.S3.ManagedUpload.constructor)
	   *   @return [AWS.S3.ManagedUpload] the managed upload object that can call
	   *     `send()` or track progress.
	   *   @example Uploading a stream object
	   *     var params = {Bucket: 'bucket', Key: 'key', Body: stream};
	   *     s3.upload(params, function(err, data) {
	   *       console.log(err, data);
	   *     });
	   *   @example Uploading a stream with concurrency of 1 and partSize of 10mb
	   *     var params = {Bucket: 'bucket', Key: 'key', Body: stream};
	   *     var options = {partSize: 10 * 1024 * 1024, queueSize: 1};
	   *     s3.upload(params, options, function(err, data) {
	   *       console.log(err, data);
	   *     });
	   * @callback callback function(err, data)
	   *   @param err [Error] an error or null if no error occurred.
	   *   @param data [map] The response data from the successful upload:
	   *     * `Location` (String) the URL of the uploaded object
	   *     * `ETag` (String) the ETag of the uploaded object
	   *     * `Bucket` (String) the bucket to which the object was uploaded
	   *     * `Key` (String) the key to which the object was uploaded
	   *   @see AWS.S3.ManagedUpload
	   */
	  upload: function upload(params, options, callback) {
	    if (typeof options === 'function' && callback === undefined) {
	      callback = options;
	      options = null;
	    }

	    options = options || {};
	    options = AWS.util.merge(options || {}, {service: this, params: params});

	    var uploader = new AWS.S3.ManagedUpload(options);
	    if (typeof callback === 'function') uploader.send(callback);
	    return uploader;
	  }
	});


/***/ },
/* 384 */
/***/ function(module, exports, __webpack_require__) {

	var AWS = __webpack_require__(5);
	var byteLength = AWS.util.string.byteLength;
	var Buffer = AWS.util.Buffer;

	/**
	 * The managed uploader allows for easy and efficient uploading of buffers,
	 * blobs, or streams, using a configurable amount of concurrency to perform
	 * multipart uploads where possible. This abstraction also enables uploading
	 * streams of unknown size due to the use of multipart uploads.
	 *
	 * To construct a managed upload object, see the {constructor} function.
	 *
	 * ## Tracking upload progress
	 *
	 * The managed upload object can also track progress by attaching an
	 * 'httpUploadProgress' listener to the upload manager. This event is similar
	 * to {AWS.Request~httpUploadProgress} but groups all concurrent upload progress
	 * into a single event. See {AWS.S3.ManagedUpload~httpUploadProgress} for more
	 * information.
	 *
	 * ## Handling Multipart Cleanup
	 *
	 * By default, this class will automatically clean up any multipart uploads
	 * when an individual part upload fails. This behavior can be disabled in order
	 * to manually handle failures by setting the `leavePartsOnError` configuration
	 * option to `true` when initializing the upload object.
	 *
	 * @!event httpUploadProgress(progress)
	 *   Triggered when the uploader has uploaded more data.
	 *   @note The `total` property may not be set if the stream being uploaded has
	 *     not yet finished chunking. In this case the `total` will be undefined
	 *     until the total stream size is known.
	 *   @note This event will not be emitted in Node.js 0.8.x.
	 *   @param progress [map] An object containing the `loaded` and `total` bytes
	 *     of the request and the `key` of the S3 object. Note that `total` may be undefined until the payload
	 *     size is known.
	 *   @context (see AWS.Request~send)
	 */
	AWS.S3.ManagedUpload = AWS.util.inherit({
	  /**
	   * Creates a managed upload object with a set of configuration options.
	   *
	   * @note A "Body" parameter is required to be set prior to calling {send}.
	   * @option options params [map] a map of parameters to pass to the upload
	   *   requests. The "Body" parameter is required to be specified either on
	   *   the service or in the params option.
	   * @note ContentMD5 should not be provided when using the managed upload object.
	   *   Instead, setting "computeChecksums" to true will enable automatic ContentMD5 generation
	   *   by the managed upload object.
	   * @option options queueSize [Number] (4) the size of the concurrent queue
	   *   manager to upload parts in parallel. Set to 1 for synchronous uploading
	   *   of parts. Note that the uploader will buffer at most queueSize * partSize
	   *   bytes into memory at any given time.
	   * @option options partSize [Number] (5mb) the size in bytes for each
	   *   individual part to be uploaded. Adjust the part size to ensure the number
	   *   of parts does not exceed {maxTotalParts}. See {minPartSize} for the
	   *   minimum allowed part size.
	   * @option options leavePartsOnError [Boolean] (false) whether to abort the
	   *   multipart upload if an error occurs. Set to true if you want to handle
	   *   failures manually.
	   * @option options service [AWS.S3] an optional S3 service object to use for
	   *   requests. This object might have bound parameters used by the uploader.
	   * @example Creating a default uploader for a stream object
	   *   var upload = new AWS.S3.ManagedUpload({
	   *     params: {Bucket: 'bucket', Key: 'key', Body: stream}
	   *   });
	   * @example Creating an uploader with concurrency of 1 and partSize of 10mb
	   *   var upload = new AWS.S3.ManagedUpload({
	   *     partSize: 10 * 1024 * 1024, queueSize: 1,
	   *     params: {Bucket: 'bucket', Key: 'key', Body: stream}
	   *   });
	   * @see send
	   */
	  constructor: function ManagedUpload(options) {
	    var self = this;
	    AWS.SequentialExecutor.call(self);
	    self.body = null;
	    self.sliceFn = null;
	    self.callback = null;
	    self.parts = {};
	    self.completeInfo = [];
	    self.fillQueue = function() {
	      self.callback(new Error('Unsupported body payload ' + typeof self.body));
	    };

	    self.configure(options);
	  },

	  /**
	   * @api private
	   */
	  configure: function configure(options) {
	    options = options || {};
	    this.partSize = this.minPartSize;

	    if (options.queueSize) this.queueSize = options.queueSize;
	    if (options.partSize) this.partSize = options.partSize;
	    if (options.leavePartsOnError) this.leavePartsOnError = true;

	    if (this.partSize < this.minPartSize) {
	      throw new Error('partSize must be greater than ' +
	                      this.minPartSize);
	    }

	    this.service = options.service;
	    this.bindServiceObject(options.params);
	    this.validateBody();
	    this.adjustTotalBytes();
	  },

	  /**
	   * @api private
	   */
	  leavePartsOnError: false,

	  /**
	   * @api private
	   */
	  queueSize: 4,

	  /**
	   * @api private
	   */
	  partSize: null,

	  /**
	   * @readonly
	   * @return [Number] the minimum number of bytes for an individual part
	   *   upload.
	   */
	  minPartSize: 1024 * 1024 * 5,

	  /**
	   * @readonly
	   * @return [Number] the maximum allowed number of parts in a multipart upload.
	   */
	  maxTotalParts: 10000,

	  /**
	   * Initiates the managed upload for the payload.
	   *
	   * @callback callback function(err, data)
	   *   @param err [Error] an error or null if no error occurred.
	   *   @param data [map] The response data from the successful upload:
	   *     * `Location` (String) the URL of the uploaded object
	   *     * `ETag` (String) the ETag of the uploaded object
	   *     * `Bucket` (String) the bucket to which the object was uploaded
	   *     * `Key` (String) the key to which the object was uploaded
	   * @example Sending a managed upload object
	   *   var params = {Bucket: 'bucket', Key: 'key', Body: stream};
	   *   var upload = new AWS.S3.ManagedUpload({params: params});
	   *   upload.send(function(err, data) {
	   *     console.log(err, data);
	   *   });
	   */
	  send: function(callback) {
	    var self = this;
	    self.failed = false;
	    self.callback = callback || function(err) { if (err) throw err; };

	    var runFill = true;
	    if (self.sliceFn) {
	      self.fillQueue = self.fillBuffer;
	    } else if (AWS.util.isNode()) {
	      var Stream = AWS.util.stream.Stream;
	      if (self.body instanceof Stream) {
	        runFill = false;
	        self.fillQueue = self.fillStream;
	        self.partBuffers = [];
	        self.body.
	          on('error', function(err) { self.cleanup(err); }).
	          on('readable', function() { self.fillQueue(); }).
	          on('end', function() {
	            self.isDoneChunking = true;
	            self.numParts = self.totalPartNumbers;
	            self.fillQueue.call(self);
	          });
	      }
	    }

	    if (runFill) self.fillQueue.call(self);
	  },

	  /**
	   * @!method  promise()
	   *   Returns a 'thenable' promise.
	   *
	   *   Two callbacks can be provided to the `then` method on the returned promise.
	   *   The first callback will be called if the promise is fulfilled, and the second
	   *   callback will be called if the promise is rejected.
	   *   @callback fulfilledCallback function(data)
	   *     Called if the promise is fulfilled.
	   *     @param data [map] The response data from the successful upload:
	   *       `Location` (String) the URL of the uploaded object
	   *       `ETag` (String) the ETag of the uploaded object
	   *       `Bucket` (String) the bucket to which the object was uploaded
	   *       `Key` (String) the key to which the object was uploaded
	   *   @callback rejectedCallback function(err)
	   *     Called if the promise is rejected.
	   *     @param err [Error] an error or null if no error occurred.
	   *   @return [Promise] A promise that represents the state of the upload request.
	   *   @example Sending an upload request using promises.
	   *     var upload = s3.upload({Bucket: 'bucket', Key: 'key', Body: stream});
	   *     var promise = upload.promise();
	   *     promise.then(function(data) { ... }, function(err) { ... });
	   */

	  /**
	   * Aborts a managed upload, including all concurrent upload requests.
	   * @note By default, calling this function will cleanup a multipart upload
	   *   if one was created. To leave the multipart upload around after aborting
	   *   a request, configure `leavePartsOnError` to `true` in the {constructor}.
	   * @note Calling {abort} in the browser environment will not abort any requests
	   *   that are already in flight. If a multipart upload was created, any parts
	   *   not yet uploaded will not be sent, and the multipart upload will be cleaned up.
	   * @example Aborting an upload
	   *   var params = {
	   *     Bucket: 'bucket', Key: 'key',
	   *     Body: new Buffer(1024 * 1024 * 25) // 25MB payload
	   *   };
	   *   var upload = s3.upload(params);
	   *   upload.send(function (err, data) {
	   *     if (err) console.log("Error:", err.code, err.message);
	   *     else console.log(data);
	   *   });
	   *
	   *   // abort request in 1 second
	   *   setTimeout(upload.abort.bind(upload), 1000);
	   */
	  abort: function() {
	    this.cleanup(AWS.util.error(new Error('Request aborted by user'), {
	      code: 'RequestAbortedError', retryable: false
	    }));
	  },

	  /**
	   * @api private
	   */
	  validateBody: function validateBody() {
	    var self = this;
	    self.body = self.service.config.params.Body;
	    if (!self.body) throw new Error('params.Body is required');
	    if (typeof self.body === 'string') {
	      self.body = new AWS.util.Buffer(self.body);
	    }
	    self.sliceFn = AWS.util.arraySliceFn(self.body);
	  },

	  /**
	   * @api private
	   */
	  bindServiceObject: function bindServiceObject(params) {
	    params = params || {};
	    var self = this;

	    // bind parameters to new service object
	    if (!self.service) {
	      self.service = new AWS.S3({params: params});
	    } else {
	      var config = AWS.util.copy(self.service.config);
	      self.service = new self.service.constructor.__super__(config);
	      self.service.config.params =
	        AWS.util.merge(self.service.config.params || {}, params);
	    }
	  },

	  /**
	   * @api private
	   */
	  adjustTotalBytes: function adjustTotalBytes() {
	    var self = this;
	    try { // try to get totalBytes
	      self.totalBytes = byteLength(self.body);
	    } catch (e) { }

	    // try to adjust partSize if we know payload length
	    if (self.totalBytes) {
	      var newPartSize = Math.ceil(self.totalBytes / self.maxTotalParts);
	      if (newPartSize > self.partSize) self.partSize = newPartSize;
	    } else {
	      self.totalBytes = undefined;
	    }
	  },

	  /**
	   * @api private
	   */
	  isDoneChunking: false,

	  /**
	   * @api private
	   */
	  partPos: 0,

	  /**
	   * @api private
	   */
	  totalChunkedBytes: 0,

	  /**
	   * @api private
	   */
	  totalUploadedBytes: 0,

	  /**
	   * @api private
	   */
	  totalBytes: undefined,

	  /**
	   * @api private
	   */
	  numParts: 0,

	  /**
	   * @api private
	   */
	  totalPartNumbers: 0,

	  /**
	   * @api private
	   */
	  activeParts: 0,

	  /**
	   * @api private
	   */
	  doneParts: 0,

	  /**
	   * @api private
	   */
	  parts: null,

	  /**
	   * @api private
	   */
	  completeInfo: null,

	  /**
	   * @api private
	   */
	  failed: false,

	  /**
	   * @api private
	   */
	  multipartReq: null,

	  /**
	   * @api private
	   */
	  partBuffers: null,

	  /**
	   * @api private
	   */
	  partBufferLength: 0,

	  /**
	   * @api private
	   */
	  fillBuffer: function fillBuffer() {
	    var self = this;
	    var bodyLen = byteLength(self.body);

	    if (bodyLen === 0) {
	      self.isDoneChunking = true;
	      self.numParts = 1;
	      self.nextChunk(self.body);
	      return;
	    }

	    while (self.activeParts < self.queueSize && self.partPos < bodyLen) {
	      var endPos = Math.min(self.partPos + self.partSize, bodyLen);
	      var buf = self.sliceFn.call(self.body, self.partPos, endPos);
	      self.partPos += self.partSize;

	      if (byteLength(buf) < self.partSize || self.partPos === bodyLen) {
	        self.isDoneChunking = true;
	        self.numParts = self.totalPartNumbers + 1;
	      }
	      self.nextChunk(buf);
	    }
	  },

	  /**
	   * @api private
	   */
	  fillStream: function fillStream() {
	    var self = this;
	    if (self.activeParts >= self.queueSize) return;

	    var buf = self.body.read(self.partSize - self.partBufferLength) ||
	              self.body.read();
	    if (buf) {
	      self.partBuffers.push(buf);
	      self.partBufferLength += buf.length;
	      self.totalChunkedBytes += buf.length;
	    }

	    if (self.partBufferLength >= self.partSize) {
	      // if we have single buffer we avoid copyfull concat
	      var pbuf = self.partBuffers.length === 1 ?
	        self.partBuffers[0] : Buffer.concat(self.partBuffers);
	      self.partBuffers = [];
	      self.partBufferLength = 0;

	      // if we have more than partSize, push the rest back on the queue
	      if (pbuf.length > self.partSize) {
	        var rest = pbuf.slice(self.partSize);
	        self.partBuffers.push(rest);
	        self.partBufferLength += rest.length;
	        pbuf = pbuf.slice(0, self.partSize);
	      }

	      self.nextChunk(pbuf);
	    }

	    if (self.isDoneChunking && !self.isDoneSending) {
	      // if we have single buffer we avoid copyfull concat
	      pbuf = self.partBuffers.length === 1 ?
	          self.partBuffers[0] : Buffer.concat(self.partBuffers);
	      self.partBuffers = [];
	      self.partBufferLength = 0;
	      self.totalBytes = self.totalChunkedBytes;
	      self.isDoneSending = true;

	      if (self.numParts === 0 || pbuf.length > 0) {
	        self.numParts++;
	        self.nextChunk(pbuf);
	      }
	    }

	    self.body.read(0);
	  },

	  /**
	   * @api private
	   */
	  nextChunk: function nextChunk(chunk) {
	    var self = this;
	    if (self.failed) return null;

	    var partNumber = ++self.totalPartNumbers;
	    if (self.isDoneChunking && partNumber === 1) {
	      var req = self.service.putObject({Body: chunk});
	      req._managedUpload = self;
	      req.on('httpUploadProgress', self.progress).send(self.finishSinglePart);
	      return null;
	    } else if (self.service.config.params.ContentMD5) {
	      var err = AWS.util.error(new Error('The Content-MD5 you specified is invalid for multi-part uploads.'), {
	        code: 'InvalidDigest', retryable: false
	      });

	      self.cleanup(err);
	      return null;
	    }

	    if (self.completeInfo[partNumber] && self.completeInfo[partNumber].ETag !== null) {
	      return null; // Already uploaded this part.
	    }

	    self.activeParts++;
	    if (!self.service.config.params.UploadId) {

	      if (!self.multipartReq) { // create multipart
	        self.multipartReq = self.service.createMultipartUpload();
	        self.multipartReq.on('success', function(resp) {
	          self.service.config.params.UploadId = resp.data.UploadId;
	          self.multipartReq = null;
	        });
	        self.queueChunks(chunk, partNumber);
	        self.multipartReq.on('error', function(err) {
	          self.cleanup(err);
	        });
	        self.multipartReq.send();
	      } else {
	        self.queueChunks(chunk, partNumber);
	      }
	    } else { // multipart is created, just send
	      self.uploadPart(chunk, partNumber);
	    }
	  },

	  /**
	   * @api private
	   */
	  uploadPart: function uploadPart(chunk, partNumber) {
	    var self = this;

	    var partParams = {
	      Body: chunk,
	      ContentLength: AWS.util.string.byteLength(chunk),
	      PartNumber: partNumber
	    };

	    var partInfo = {ETag: null, PartNumber: partNumber};
	    self.completeInfo[partNumber] = partInfo;

	    var req = self.service.uploadPart(partParams);
	    self.parts[partNumber] = req;
	    req._lastUploadedBytes = 0;
	    req._managedUpload = self;
	    req.on('httpUploadProgress', self.progress);
	    req.send(function(err, data) {
	      delete self.parts[partParams.PartNumber];
	      self.activeParts--;

	      if (!err && (!data || !data.ETag)) {
	        var message = 'No access to ETag property on response.';
	        if (AWS.util.isBrowser()) {
	          message += ' Check CORS configuration to expose ETag header.';
	        }

	        err = AWS.util.error(new Error(message), {
	          code: 'ETagMissing', retryable: false
	        });
	      }
	      if (err) return self.cleanup(err);

	      partInfo.ETag = data.ETag;
	      self.doneParts++;
	      if (self.isDoneChunking && self.doneParts === self.numParts) {
	        self.finishMultiPart();
	      } else {
	        self.fillQueue.call(self);
	      }
	    });
	  },

	  /**
	   * @api private
	   */
	  queueChunks: function queueChunks(chunk, partNumber) {
	    var self = this;
	    self.multipartReq.on('success', function() {
	      self.uploadPart(chunk, partNumber);
	    });
	  },

	  /**
	   * @api private
	   */
	  cleanup: function cleanup(err) {
	    var self = this;
	    if (self.failed) return;

	    // clean up stream
	    if (typeof self.body.removeAllListeners === 'function' &&
	        typeof self.body.resume === 'function') {
	      self.body.removeAllListeners('readable');
	      self.body.removeAllListeners('end');
	      self.body.resume();
	    }

	    if (self.service.config.params.UploadId && !self.leavePartsOnError) {
	      self.service.abortMultipartUpload().send();
	    }

	    AWS.util.each(self.parts, function(partNumber, part) {
	      part.removeAllListeners('complete');
	      part.abort();
	    });

	    self.activeParts = 0;
	    self.partPos = 0;
	    self.numParts = 0;
	    self.totalPartNumbers = 0;
	    self.parts = {};
	    self.failed = true;
	    self.callback(err);
	  },

	  /**
	   * @api private
	   */
	  finishMultiPart: function finishMultiPart() {
	    var self = this;
	    var completeParams = { MultipartUpload: { Parts: self.completeInfo.slice(1) } };
	    self.service.completeMultipartUpload(completeParams, function(err, data) {
	      if (err) return self.cleanup(err);
	      else self.callback(err, data);
	    });
	  },

	  /**
	   * @api private
	   */
	  finishSinglePart: function finishSinglePart(err, data) {
	    var upload = this.request._managedUpload;
	    var httpReq = this.request.httpRequest;
	    var endpoint = httpReq.endpoint;
	    if (err) return upload.callback(err);
	    data.Location =
	      [endpoint.protocol, '//', endpoint.host, httpReq.path].join('');
	    data.key = this.request.params.Key; // will stay undocumented
	    data.Key = this.request.params.Key;
	    data.Bucket = this.request.params.Bucket;
	    upload.callback(err, data);
	  },

	  /**
	   * @api private
	   */
	  progress: function progress(info) {
	    var upload = this._managedUpload;
	    if (this.operation === 'putObject') {
	      info.part = 1;
	      info.key = this.params.Key;
	    } else {
	      upload.totalUploadedBytes += info.loaded - this._lastUploadedBytes;
	      this._lastUploadedBytes = info.loaded;
	      info = {
	        loaded: upload.totalUploadedBytes,
	        total: upload.totalBytes,
	        part: this.params.PartNumber,
	        key: this.params.Key
	      };
	    }
	    upload.emit('httpUploadProgress', [info]);
	  }
	});

	AWS.util.mixin(AWS.S3.ManagedUpload, AWS.SequentialExecutor);

	/**
	 * @api private
	 */
	AWS.S3.ManagedUpload.addPromisesToClass = function addPromisesToClass(PromiseDependency) {
	  this.prototype.promise = AWS.util.promisifyMethod('send', PromiseDependency);
	};

	/**
	 * @api private
	 */
	AWS.S3.ManagedUpload.deletePromisesFromClass = function deletePromisesFromClass() {
	  delete this.prototype.promise;
	};

	AWS.util.addPromises(AWS.S3.ManagedUpload);

	module.exports = AWS.S3.ManagedUpload;


/***/ },
/* 385 */,
/* 386 */,
/* 387 */,
/* 388 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(3);
	var AWS = __webpack_require__(5);
	var Service = __webpack_require__(86);
	var apiLoader = __webpack_require__(94);

	apiLoader.services['servicecatalog'] = {};
	AWS.ServiceCatalog = Service.defineService('servicecatalog', ['2015-12-10']);
	Object.defineProperty(apiLoader.services['servicecatalog'], '2015-12-10', {
	  get: function get() {
	    var model = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/servicecatalog-2015-12-10.min.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	    return model;
	  },
	  enumerable: true,
	  configurable: true
	});

	module.exports = AWS.ServiceCatalog;


/***/ },
/* 389 */,
/* 390 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(3);
	var AWS = __webpack_require__(5);
	var Service = __webpack_require__(86);
	var apiLoader = __webpack_require__(94);

	apiLoader.services['ses'] = {};
	AWS.SES = Service.defineService('ses', ['2010-12-01']);
	Object.defineProperty(apiLoader.services['ses'], '2010-12-01', {
	  get: function get() {
	    var model = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/email-2010-12-01.min.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	    model.paginators = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/email-2010-12-01.paginators.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())).pagination;
	    model.waiters = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/email-2010-12-01.waiters2.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())).waiters;
	    return model;
	  },
	  enumerable: true,
	  configurable: true
	});

	module.exports = AWS.SES;


/***/ },
/* 391 */,
/* 392 */,
/* 393 */,
/* 394 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(3);
	var AWS = __webpack_require__(5);
	var Service = __webpack_require__(86);
	var apiLoader = __webpack_require__(94);

	apiLoader.services['shield'] = {};
	AWS.Shield = Service.defineService('shield', ['2016-06-02']);
	Object.defineProperty(apiLoader.services['shield'], '2016-06-02', {
	  get: function get() {
	    var model = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/shield-2016-06-02.min.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	    return model;
	  },
	  enumerable: true,
	  configurable: true
	});

	module.exports = AWS.Shield;


/***/ },
/* 395 */,
/* 396 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(3);
	var AWS = __webpack_require__(5);
	var Service = __webpack_require__(86);
	var apiLoader = __webpack_require__(94);

	apiLoader.services['simpledb'] = {};
	AWS.SimpleDB = Service.defineService('simpledb', ['2009-04-15']);
	Object.defineProperty(apiLoader.services['simpledb'], '2009-04-15', {
	  get: function get() {
	    var model = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/sdb-2009-04-15.min.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	    model.paginators = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/sdb-2009-04-15.paginators.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())).pagination;
	    return model;
	  },
	  enumerable: true,
	  configurable: true
	});

	module.exports = AWS.SimpleDB;


/***/ },
/* 397 */,
/* 398 */,
/* 399 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(3);
	var AWS = __webpack_require__(5);
	var Service = __webpack_require__(86);
	var apiLoader = __webpack_require__(94);

	apiLoader.services['sms'] = {};
	AWS.SMS = Service.defineService('sms', ['2016-10-24']);
	Object.defineProperty(apiLoader.services['sms'], '2016-10-24', {
	  get: function get() {
	    var model = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/sms-2016-10-24.min.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	    model.paginators = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/sms-2016-10-24.paginators.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())).pagination;
	    return model;
	  },
	  enumerable: true,
	  configurable: true
	});

	module.exports = AWS.SMS;


/***/ },
/* 400 */,
/* 401 */,
/* 402 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(3);
	var AWS = __webpack_require__(5);
	var Service = __webpack_require__(86);
	var apiLoader = __webpack_require__(94);

	apiLoader.services['snowball'] = {};
	AWS.Snowball = Service.defineService('snowball', ['2016-06-30']);
	Object.defineProperty(apiLoader.services['snowball'], '2016-06-30', {
	  get: function get() {
	    var model = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/snowball-2016-06-30.min.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	    model.paginators = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/snowball-2016-06-30.paginators.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())).pagination;
	    return model;
	  },
	  enumerable: true,
	  configurable: true
	});

	module.exports = AWS.Snowball;


/***/ },
/* 403 */,
/* 404 */,
/* 405 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(3);
	var AWS = __webpack_require__(5);
	var Service = __webpack_require__(86);
	var apiLoader = __webpack_require__(94);

	apiLoader.services['sns'] = {};
	AWS.SNS = Service.defineService('sns', ['2010-03-31']);
	Object.defineProperty(apiLoader.services['sns'], '2010-03-31', {
	  get: function get() {
	    var model = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/sns-2010-03-31.min.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	    model.paginators = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/sns-2010-03-31.paginators.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())).pagination;
	    return model;
	  },
	  enumerable: true,
	  configurable: true
	});

	module.exports = AWS.SNS;


/***/ },
/* 406 */,
/* 407 */,
/* 408 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(3);
	var AWS = __webpack_require__(5);
	var Service = __webpack_require__(86);
	var apiLoader = __webpack_require__(94);

	apiLoader.services['sqs'] = {};
	AWS.SQS = Service.defineService('sqs', ['2012-11-05']);
	__webpack_require__(409);
	Object.defineProperty(apiLoader.services['sqs'], '2012-11-05', {
	  get: function get() {
	    var model = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/sqs-2012-11-05.min.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	    model.paginators = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/sqs-2012-11-05.paginators.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())).pagination;
	    return model;
	  },
	  enumerable: true,
	  configurable: true
	});

	module.exports = AWS.SQS;


/***/ },
/* 409 */
/***/ function(module, exports, __webpack_require__) {

	var AWS = __webpack_require__(5);

	AWS.util.update(AWS.SQS.prototype, {
	  /**
	   * @api private
	   */
	  setupRequestListeners: function setupRequestListeners(request) {
	    request.addListener('build', this.buildEndpoint);

	    if (request.service.config.computeChecksums) {
	      if (request.operation === 'sendMessage') {
	        request.addListener('extractData', this.verifySendMessageChecksum);
	      } else if (request.operation === 'sendMessageBatch') {
	        request.addListener('extractData', this.verifySendMessageBatchChecksum);
	      } else if (request.operation === 'receiveMessage') {
	        request.addListener('extractData', this.verifyReceiveMessageChecksum);
	      }
	    }
	  },

	  /**
	   * @api private
	   */
	  verifySendMessageChecksum: function verifySendMessageChecksum(response) {
	    if (!response.data) return;

	    var md5 = response.data.MD5OfMessageBody;
	    var body = this.params.MessageBody;
	    var calculatedMd5 = this.service.calculateChecksum(body);
	    if (calculatedMd5 !== md5) {
	      var msg = 'Got "' + response.data.MD5OfMessageBody +
	        '", expecting "' + calculatedMd5 + '".';
	      this.service.throwInvalidChecksumError(response,
	        [response.data.MessageId], msg);
	    }
	  },

	  /**
	   * @api private
	   */
	  verifySendMessageBatchChecksum: function verifySendMessageBatchChecksum(response) {
	    if (!response.data) return;

	    var service = this.service;
	    var entries = {};
	    var errors = [];
	    var messageIds = [];
	    AWS.util.arrayEach(response.data.Successful, function (entry) {
	      entries[entry.Id] = entry;
	    });
	    AWS.util.arrayEach(this.params.Entries, function (entry) {
	      if (entries[entry.Id]) {
	        var md5 = entries[entry.Id].MD5OfMessageBody;
	        var body = entry.MessageBody;
	        if (!service.isChecksumValid(md5, body)) {
	          errors.push(entry.Id);
	          messageIds.push(entries[entry.Id].MessageId);
	        }
	      }
	    });

	    if (errors.length > 0) {
	      service.throwInvalidChecksumError(response, messageIds,
	        'Invalid messages: ' + errors.join(', '));
	    }
	  },

	  /**
	   * @api private
	   */
	  verifyReceiveMessageChecksum: function verifyReceiveMessageChecksum(response) {
	    if (!response.data) return;

	    var service = this.service;
	    var messageIds = [];
	    AWS.util.arrayEach(response.data.Messages, function(message) {
	      var md5 = message.MD5OfBody;
	      var body = message.Body;
	      if (!service.isChecksumValid(md5, body)) {
	        messageIds.push(message.MessageId);
	      }
	    });

	    if (messageIds.length > 0) {
	      service.throwInvalidChecksumError(response, messageIds,
	        'Invalid messages: ' + messageIds.join(', '));
	    }
	  },

	  /**
	   * @api private
	   */
	  throwInvalidChecksumError: function throwInvalidChecksumError(response, ids, message) {
	    response.error = AWS.util.error(new Error(), {
	      retryable: true,
	      code: 'InvalidChecksum',
	      messageIds: ids,
	      message: response.request.operation +
	               ' returned an invalid MD5 response. ' + message
	    });
	  },

	  /**
	   * @api private
	   */
	  isChecksumValid: function isChecksumValid(checksum, data) {
	    return this.calculateChecksum(data) === checksum;
	  },

	  /**
	   * @api private
	   */
	  calculateChecksum: function calculateChecksum(data) {
	    return AWS.util.crypto.md5(data, 'hex');
	  },

	  /**
	   * @api private
	   */
	  buildEndpoint: function buildEndpoint(request) {
	    var url = request.httpRequest.params.QueueUrl;
	    if (url) {
	      request.httpRequest.endpoint = new AWS.Endpoint(url);

	      // signature version 4 requires the region name to be set,
	      // sqs queue urls contain the region name
	      var matches = request.httpRequest.endpoint.host.match(/^sqs\.(.+?)\./);
	      if (matches) request.httpRequest.region = matches[1];
	    }
	  }
	});


/***/ },
/* 410 */,
/* 411 */,
/* 412 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(3);
	var AWS = __webpack_require__(5);
	var Service = __webpack_require__(86);
	var apiLoader = __webpack_require__(94);

	apiLoader.services['ssm'] = {};
	AWS.SSM = Service.defineService('ssm', ['2014-11-06']);
	Object.defineProperty(apiLoader.services['ssm'], '2014-11-06', {
	  get: function get() {
	    var model = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/ssm-2014-11-06.min.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	    model.paginators = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/ssm-2014-11-06.paginators.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())).pagination;
	    return model;
	  },
	  enumerable: true,
	  configurable: true
	});

	module.exports = AWS.SSM;


/***/ },
/* 413 */,
/* 414 */,
/* 415 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(3);
	var AWS = __webpack_require__(5);
	var Service = __webpack_require__(86);
	var apiLoader = __webpack_require__(94);

	apiLoader.services['storagegateway'] = {};
	AWS.StorageGateway = Service.defineService('storagegateway', ['2013-06-30']);
	Object.defineProperty(apiLoader.services['storagegateway'], '2013-06-30', {
	  get: function get() {
	    var model = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/storagegateway-2013-06-30.min.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	    model.paginators = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/storagegateway-2013-06-30.paginators.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())).pagination;
	    return model;
	  },
	  enumerable: true,
	  configurable: true
	});

	module.exports = AWS.StorageGateway;


/***/ },
/* 416 */,
/* 417 */,
/* 418 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(3);
	var AWS = __webpack_require__(5);
	var Service = __webpack_require__(86);
	var apiLoader = __webpack_require__(94);

	apiLoader.services['stepfunctions'] = {};
	AWS.StepFunctions = Service.defineService('stepfunctions', ['2016-11-23']);
	Object.defineProperty(apiLoader.services['stepfunctions'], '2016-11-23', {
	  get: function get() {
	    var model = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/states-2016-11-23.min.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	    model.paginators = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/states-2016-11-23.paginators.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())).pagination;
	    return model;
	  },
	  enumerable: true,
	  configurable: true
	});

	module.exports = AWS.StepFunctions;


/***/ },
/* 419 */,
/* 420 */,
/* 421 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(3);
	var AWS = __webpack_require__(5);
	var Service = __webpack_require__(86);
	var apiLoader = __webpack_require__(94);

	apiLoader.services['support'] = {};
	AWS.Support = Service.defineService('support', ['2013-04-15']);
	Object.defineProperty(apiLoader.services['support'], '2013-04-15', {
	  get: function get() {
	    var model = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/support-2013-04-15.min.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	    model.paginators = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/support-2013-04-15.paginators.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())).pagination;
	    return model;
	  },
	  enumerable: true,
	  configurable: true
	});

	module.exports = AWS.Support;


/***/ },
/* 422 */,
/* 423 */,
/* 424 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(3);
	var AWS = __webpack_require__(5);
	var Service = __webpack_require__(86);
	var apiLoader = __webpack_require__(94);

	apiLoader.services['swf'] = {};
	AWS.SWF = Service.defineService('swf', ['2012-01-25']);
	__webpack_require__(425);
	Object.defineProperty(apiLoader.services['swf'], '2012-01-25', {
	  get: function get() {
	    var model = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/swf-2012-01-25.min.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	    model.paginators = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/swf-2012-01-25.paginators.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())).pagination;
	    return model;
	  },
	  enumerable: true,
	  configurable: true
	});

	module.exports = AWS.SWF;


/***/ },
/* 425 */
/***/ function(module, exports, __webpack_require__) {

	var AWS = __webpack_require__(5);

	AWS.util.hideProperties(AWS, ['SimpleWorkflow']);

	/**
	 * @constant
	 * @readonly
	 * Backwards compatibility for access to the {AWS.SWF} service class.
	 */
	AWS.SimpleWorkflow = AWS.SWF;


/***/ },
/* 426 */,
/* 427 */,
/* 428 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(3);
	var AWS = __webpack_require__(5);
	var Service = __webpack_require__(86);
	var apiLoader = __webpack_require__(94);

	apiLoader.services['xray'] = {};
	AWS.XRay = Service.defineService('xray', ['2016-04-12']);
	Object.defineProperty(apiLoader.services['xray'], '2016-04-12', {
	  get: function get() {
	    var model = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/xray-2016-04-12.min.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	    return model;
	  },
	  enumerable: true,
	  configurable: true
	});

	module.exports = AWS.XRay;


/***/ },
/* 429 */,
/* 430 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(3);
	var AWS = __webpack_require__(5);
	var Service = __webpack_require__(86);
	var apiLoader = __webpack_require__(94);

	apiLoader.services['waf'] = {};
	AWS.WAF = Service.defineService('waf', ['2015-08-24']);
	Object.defineProperty(apiLoader.services['waf'], '2015-08-24', {
	  get: function get() {
	    var model = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/waf-2015-08-24.min.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	    return model;
	  },
	  enumerable: true,
	  configurable: true
	});

	module.exports = AWS.WAF;


/***/ },
/* 431 */,
/* 432 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(3);
	var AWS = __webpack_require__(5);
	var Service = __webpack_require__(86);
	var apiLoader = __webpack_require__(94);

	apiLoader.services['wafregional'] = {};
	AWS.WAFRegional = Service.defineService('wafregional', ['2016-11-28']);
	Object.defineProperty(apiLoader.services['wafregional'], '2016-11-28', {
	  get: function get() {
	    var model = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/waf-regional-2016-11-28.min.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	    return model;
	  },
	  enumerable: true,
	  configurable: true
	});

	module.exports = AWS.WAFRegional;


/***/ },
/* 433 */,
/* 434 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(3);
	var AWS = __webpack_require__(5);
	var Service = __webpack_require__(86);
	var apiLoader = __webpack_require__(94);

	apiLoader.services['workspaces'] = {};
	AWS.WorkSpaces = Service.defineService('workspaces', ['2015-04-08']);
	Object.defineProperty(apiLoader.services['workspaces'], '2015-04-08', {
	  get: function get() {
	    var model = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/workspaces-2015-04-08.min.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	    model.paginators = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"../apis/workspaces-2015-04-08.paginators.json\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())).pagination;
	    return model;
	  },
	  enumerable: true,
	  configurable: true
	});

	module.exports = AWS.WorkSpaces;


/***/ }
/******/ ]);
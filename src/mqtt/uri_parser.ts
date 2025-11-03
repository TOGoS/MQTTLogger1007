/**
 * Represents a parsed MQTT URI with host, port, and topic.
 */
export interface ParsedMqttUri {
	/** Server hostname (domain, IPv4, or IPv6 without brackets) */
	host: string;
	/** Server port number (defaults to 1883) */
	port: number;
	/** Topic path/pattern */
	topic: string;
}

/**
 * Parses an MQTT pseudo-URI of the format `mqtt://serverhost:serverport/path/pattern`.
 *
 * - If `serverport` is not specified, defaults to 1883
 * - `serverhost` may be a domain name, an IPv4 address, or a bracketed IPv6 address
 * - The topic path is everything after the host/port, with leading slash removed
 *
 * @param uri - MQTT URI string to parse
 * @returns Parsed URI with host, port, and topic
 * @throws Error if URI format is invalid
 */
export function parseMqttUri(uri: string): ParsedMqttUri {
	// Remove mqtt:// prefix
	if (!uri.startsWith("mqtt://")) {
		throw new Error(`Invalid MQTT URI: must start with 'mqtt://'`);
	}
	
	const withoutScheme = uri.slice(7); // length of "mqtt://"
	
	// Find the first '/' which separates host:port from topic
	const firstSlashIndex = withoutScheme.indexOf("/");
	if (firstSlashIndex === -1) {
		throw new Error(`Invalid MQTT URI: missing topic path (no '/' found)`);
	}
	
	const hostPort = withoutScheme.slice(0, firstSlashIndex);
	const topicPath = withoutScheme.slice(firstSlashIndex + 1);
	
	// Parse host and port
	let host: string;
	let port: number;
	
	// Check if host is IPv6 in brackets: [::1] or [::1]:1883
	if (hostPort.startsWith("[")) {
		const bracketEnd = hostPort.indexOf("]");
		if (bracketEnd === -1) {
			throw new Error(`Invalid MQTT URI: unclosed IPv6 bracket`);
		}
		
		// Extract IPv6 address (without brackets)
		host = hostPort.slice(1, bracketEnd);
		
		// Check for port after closing bracket
		const rest = hostPort.slice(bracketEnd + 1);
		if (rest === "") {
			port = 1883; // default
		} else if (rest.startsWith(":")) {
			const portStr = rest.slice(1);
			port = parseInt(portStr, 10);
			if (isNaN(port) || port < 1 || port > 65535) {
				throw new Error(`Invalid MQTT URI: invalid port number: ${portStr}`);
			}
		} else {
			throw new Error(`Invalid MQTT URI: unexpected characters after IPv6 address: ${rest}`);
		}
	} else {
		// IPv4 or domain name - may have :port
		const colonIndex = hostPort.indexOf(":");
		if (colonIndex === -1) {
			// No port specified
			host = hostPort;
			port = 1883; // default
		} else {
			host = hostPort.slice(0, colonIndex);
			const portStr = hostPort.slice(colonIndex + 1);
			port = parseInt(portStr, 10);
			if (isNaN(port) || port < 1 || port > 65535) {
				throw new Error(`Invalid MQTT URI: invalid port number: ${portStr}`);
			}
		}
	}
	
	// Validate host is not empty
	if (host === "") {
		throw new Error(`Invalid MQTT URI: empty host`);
	}
	
	return {
		host,
		port,
		topic: topicPath,
	};
}

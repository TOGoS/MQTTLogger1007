import type { MQTTMessage } from "../mqtt/message.ts";
import { LOG_FORMAT_IDENTIFIER, LOG_FORMAT_DESCRIPTION, FLAG_RETAINED, FLAG_NONE } from "./format.ts";
import { encodeContent } from "./encode.ts";

/**
 * Represents a formatted log line with text prefix and binary content.
 * The prefix (path + flags) is UTF-8 text, while content remains as bytes
 * to handle arbitrary binary data that may not be valid UTF-8.
 */
export interface FormattedLogLine {
	/** Text prefix: path + tab + flags + tab */
	prefix: string;
	/** Encoded message content as bytes */
	content: Uint8Array;
}

/**
 * Returns the format identifier line.
 * Format: `#format <identifier>`
 */
export function formatIdentifierLine(): string {
	return `#format ${LOG_FORMAT_IDENTIFIER}`;
}

/**
 * Returns the format description comment lines.
 * Includes the format identifier line followed by description lines.
 */
export function formatDescriptionLines(): string {
	return `${formatIdentifierLine()}\n${LOG_FORMAT_DESCRIPTION.join("\n")}`;
}

/**
 * Formats a timestamp line.
 * Format: `#ts <milliseconds>`
 *
 * @param timestamp - Timestamp in milliseconds since Unix epoch
 */
export function formatTimestampLine(timestamp: number): string {
	return `#ts ${timestamp}`;
}

/**
 * Formats message flags as a comma-separated string.
 *
 * @param retained - Whether the message is retained
 * @returns Flag string: "R" for retained, "-" for no flags
 */
export function formatFlags(retained: boolean): string {
	return retained ? FLAG_RETAINED : FLAG_NONE;
}

/**
 * Formats an MQTT message as a log line.
 * Format: `path + tab + flags + tab + encoded_content`
 *
 * The content is encoded (newlines replaced with newline+tab) and remains
 * as Uint8Array to handle arbitrary binary data.
 *
 * @param msg - MQTT message to format
 * @returns Formatted log line with text prefix and binary content
 */
export function formatMessageLine(msg: MQTTMessage): FormattedLogLine {
	const flags = formatFlags(msg.retained);
	const prefix = `${msg.path}\t${flags}\t`;
	const encodedContent = encodeContent(msg.value);
	
	return {
		prefix,
		content: encodedContent,
	};
}

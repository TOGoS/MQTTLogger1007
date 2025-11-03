/**
 * Encodes message content by replacing newlines with newline+tab.
 * This allows multi-line messages to be represented in the log format
 * while maintaining readability (multi-line content appears indented).
 *
 * @param content - Raw message content as bytes
 * @returns Encoded content with newlines replaced by newline+tab
 */
export function encodeContent(content: Uint8Array): Uint8Array {
	const newline = 0x0a; // '\n'
	const tab = 0x09; // '\t'
	
	// Count newlines to determine output size
	let newlineCount = 0;
	for (let i = 0; i < content.length; i++) {
		if (content[i] === newline) {
			newlineCount++;
		}
	}
	
	// If no newlines, return original content
	if (newlineCount === 0) {
		return content;
	}
	
	// Output will be: original length + newlineCount (one tab per newline)
	const output = new Uint8Array(content.length + newlineCount);
	let outputIndex = 0;
	
	for (let i = 0; i < content.length; i++) {
		if (content[i] === newline) {
			output[outputIndex++] = newline;
			output[outputIndex++] = tab;
		} else {
			output[outputIndex++] = content[i];
		}
	}
	
	return output;
}

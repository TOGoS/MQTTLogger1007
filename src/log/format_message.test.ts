import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import {
	formatIdentifierLine,
	formatDescriptionLines,
	formatTimestampLine,
	formatFlags,
	formatMessageLine,
} from "./format_message.ts";
import { LOG_FORMAT_IDENTIFIER } from "./format.ts";
import type { MQTTMessage } from "../mqtt/message.ts";
import { encodeContent } from "./encode.ts";

const te = new TextEncoder();
function encode(text: string): Uint8Array {
	return te.encode(text);
}

Deno.test("formatIdentifierLine - returns format identifier with #format prefix", () => {
	const result = formatIdentifierLine();
	assertEquals(result, `#format ${LOG_FORMAT_IDENTIFIER}`);
});

Deno.test("formatDescriptionLines - returns format description lines", () => {
	const result = formatDescriptionLines();
	// Should contain format identifier and description
	assertEquals(result.includes("#format"), true);
	assertEquals(result.includes(LOG_FORMAT_IDENTIFIER), true);
});

Deno.test("formatTimestampLine - formats timestamp correctly", () => {
	const timestamp = 1234567890000; // 2009-02-13T23:31:30Z
	const result = formatTimestampLine(timestamp);
	assertEquals(result, "#ts 1234567890000");
});

Deno.test("formatFlags - returns R for retained messages", () => {
	const result = formatFlags(true);
	assertEquals(result, "R");
});

Deno.test("formatFlags - returns - for non-retained messages", () => {
	const result = formatFlags(false);
	assertEquals(result, "-");
});

Deno.test("formatMessageLine - formats simple message correctly", () => {
	const msg: MQTTMessage = {
		timestamp: 1234567890000,
		path: "sensors/temperature",
		value: encode("25.5"),
		retained: false,
	};
	
	const result = formatMessageLine(msg);
	assertEquals(result, encode("sensors/temperature\t-\t25.5"));
});

Deno.test("formatMessageLine - formats retained message correctly", () => {
	const msg: MQTTMessage = {
		timestamp: 1234567890000,
		path: "sensors/humidity",
		value: encode("60"),
		retained: true,
	};
	
	const result = formatMessageLine(msg);
	assertEquals(result, encode("sensors/humidity\tR\t60"));
});

Deno.test("formatMessageLine - encodes content with newlines", () => {
	const msg: MQTTMessage = {
		timestamp: 1234567890000,
		path: "logs/system",
		value: encode("Line 1\nLine 2"),
		retained: false,
	};
	
	const result = formatMessageLine(msg);
	// Content should have newlines replaced with newline+tab
	assertEquals(result, encode("logs/system\t-\n\tLine 1\n\tLine 2"));
});

Deno.test("formatMessageLine - handles zero-length messages", () => {
	const msg: MQTTMessage = {
		timestamp: 1234567890000,
		path: "empty/topic",
		value: new Uint8Array(0),
		retained: false,
	};
	
	const result = formatMessageLine(msg);
	assertEquals(result, encode("empty/topic\t-"));
});

Deno.test("formatMessageLine - handles binary content", () => {
	const binaryData = new Uint8Array([0x00, 0x01, 0x02, 0xff, 0xfe]);
	const msg: MQTTMessage = {
		timestamp: 1234567890000,
		path: "binary/data",
		value: binaryData,
		retained: false,
	};
	
	const result = formatMessageLine(msg);
	assertEquals(result, concatUint8Arrays(encode("binary/data\t-\t"), binaryData));
});

Deno.test("formatMessageLine - handles binary content with newlines", () => {
	const binaryData = new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x0a, 0x57, 0x6f, 0x72, 0x6c, 0x64]);
	// "Hello\nWorld" in bytes
	const msg: MQTTMessage = {
		timestamp: 1234567890000,
		path: "test/binary",
		value: binaryData,
		retained: false,
	};
	
	const result = formatMessageLine(msg);
	// Should have newline replaced with newline+tab
	assertEquals(
		result,
		concatUint8Arrays(
			encode("test/binary\t-\n\t"),
			new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x0a, 0x09, 0x57, 0x6f, 0x72, 0x6c, 0x64]),
		),
	);
});

Deno.test("formatMessageLine - handles paths with special characters", () => {
	const msg: MQTTMessage = {
		timestamp: 1234567890000,
		path: "devices/device-123/sub/sensor",
		value: encode("value"),
		retained: false,
	};
	
	const result = formatMessageLine(msg);
	assertEquals(result, encode("devices/device-123/sub/sensor\t-\tvalue"));
});

function concatUint8Arrays(...arrays: Uint8Array[]): Uint8Array {
	const totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0);
	const result = new Uint8Array(totalLength);
	let offset = 0;
	for (const arr of arrays) {
		result.set(arr, offset);
		offset += arr.length;
	}
	return result;
}

// Parameterized test for various message types
const messageTestCases = [
	{
		path: "simple/path",
		value: encode("simple value"),
		retained: false,
		description: "simple text message",
		expectedEncodedContent: encode("simple/path\t-\tsimple value"),
	},
	{
		path: "multi/line",
		value: encode("Line 1\nLine 2\nLine 3"),
		retained: true,
		description: "multi-line retained message",
		expectedEncodedContent: encode("multi/line\tR\n\tLine 1\n\tLine 2\n\tLine 3"),
	},
	{
		path: "empty/value",
		value: encode(""),
		retained: false,
		description: "empty message",
		expectedEncodedContent: encode("empty/value\t-"), // No trailing tab needed when content is empty
	},
	{
		path: "binary/data",
		value: new Uint8Array([0x00, 0x01, 0x02, 0x03, 0x04]),
		retained: false,
		description: "binary message",
		expectedEncodedContent: concatUint8Arrays(encode("binary/data\t-\t"), new Uint8Array([0x00, 0x01, 0x02, 0x03, 0x04])),
	},
	{
		path: "binary/data/with/newlines",
		value: new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x0a, 0x57, 0x6f, 0x72, 0x6c, 0x64]),
		retained: false,
		description: "binary message with newlines",
		expectedEncodedContent: concatUint8Arrays(encode("binary/data/with/newlines\t-\n\t"), new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x0a, 0x09, 0x57, 0x6f, 0x72, 0x6c, 0x64])),
	},
];

for (const testCase of messageTestCases) {
	Deno.test(`formatMessageLine - ${testCase.description}`, () => {
		const msg: MQTTMessage = {
			timestamp: 1234567890000,
			path: testCase.path,
			value: testCase.value,
			retained: testCase.retained,
		};
		
		const result = formatMessageLine(msg);
		const expectedFlags = testCase.retained ? "R" : "-";
		
		
		// Check content encoding - use encodeContent to get expected result
		const expectedContent = encodeContent(testCase.value);
		assertEquals(result, testCase.expectedEncodedContent);
	});
}

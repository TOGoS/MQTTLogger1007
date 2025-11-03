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
		value: new TextEncoder().encode("25.5"),
		retained: false,
	};
	
	const result = formatMessageLine(msg);
	assertEquals(result.prefix, "sensors/temperature\t-\t");
	assertEquals(result.content, new TextEncoder().encode("25.5"));
});

Deno.test("formatMessageLine - formats retained message correctly", () => {
	const msg: MQTTMessage = {
		timestamp: 1234567890000,
		path: "sensors/humidity",
		value: new TextEncoder().encode("60"),
		retained: true,
	};
	
	const result = formatMessageLine(msg);
	assertEquals(result.prefix, "sensors/humidity\tR\t");
	assertEquals(result.content, new TextEncoder().encode("60"));
});

Deno.test("formatMessageLine - encodes content with newlines", () => {
	const msg: MQTTMessage = {
		timestamp: 1234567890000,
		path: "logs/system",
		value: new TextEncoder().encode("Line 1\nLine 2"),
		retained: false,
	};
	
	const result = formatMessageLine(msg);
	assertEquals(result.prefix, "logs/system\t-\t");
	// Content should have newlines replaced with newline+tab
	const expectedContent = new TextEncoder().encode("Line 1\n\tLine 2");
	assertEquals(result.content, expectedContent);
});

Deno.test("formatMessageLine - handles zero-length messages", () => {
	const msg: MQTTMessage = {
		timestamp: 1234567890000,
		path: "empty/topic",
		value: new Uint8Array(0),
		retained: false,
	};
	
	const result = formatMessageLine(msg);
	assertEquals(result.prefix, "empty/topic\t-\t");
	assertEquals(result.content.length, 0);
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
	assertEquals(result.prefix, "binary/data\t-\t");
	assertEquals(result.content, binaryData);
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
	assertEquals(result.prefix, "test/binary\t-\t");
	// Should have newline replaced with newline+tab
	const expectedContent = new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x0a, 0x09, 0x57, 0x6f, 0x72, 0x6c, 0x64]);
	assertEquals(result.content, expectedContent);
});

Deno.test("formatMessageLine - handles paths with special characters", () => {
	const msg: MQTTMessage = {
		timestamp: 1234567890000,
		path: "devices/device-123/sub/sensor",
		value: new TextEncoder().encode("value"),
		retained: false,
	};
	
	const result = formatMessageLine(msg);
	assertEquals(result.prefix, "devices/device-123/sub/sensor\t-\t");
});

// Parameterized test for various message types
const messageTestCases = [
	{
		path: "simple/path",
		value: "simple value",
		retained: false,
		description: "simple text message",
	},
	{
		path: "multi/line",
		value: "Line 1\nLine 2\nLine 3",
		retained: true,
		description: "multi-line retained message",
	},
	{
		path: "empty/value",
		value: "",
		retained: false,
		description: "empty message",
	},
];

for (const testCase of messageTestCases) {
	Deno.test(`formatMessageLine - ${testCase.description}`, () => {
		const msg: MQTTMessage = {
			timestamp: 1234567890000,
			path: testCase.path,
			value: new TextEncoder().encode(testCase.value),
			retained: testCase.retained,
		};
		
		const result = formatMessageLine(msg);
		const expectedFlags = testCase.retained ? "R" : "-";
		assertEquals(result.prefix, `${testCase.path}\t${expectedFlags}\t`);
		
		// Check content encoding
		const expectedValue = testCase.value.replace(/\n/g, "\n\t");
		const expectedContent = new TextEncoder().encode(expectedValue);
		assertEquals(result.content, expectedContent);
	});
}

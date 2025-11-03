import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { encodeContent } from "./encode.ts";

Deno.test("encodeContent - empty message returns empty Uint8Array", () => {
	const input = new Uint8Array(0);
	const result = encodeContent(input);
	assertEquals(result, new Uint8Array(0));
	assertEquals(result.length, 0);
});

Deno.test("encodeContent - message without newlines returns unchanged", () => {
	const input = new TextEncoder().encode("Hello, world!");
	const result = encodeContent(input);
	assertEquals(result, input);
});

Deno.test("encodeContent - single newline is replaced with newline+tab", () => {
	const input = new TextEncoder().encode("Line 1\nLine 2");
	const result = encodeContent(input);
	const expected = new TextEncoder().encode("Line 1\n\tLine 2");
	assertEquals(result, expected);
});

Deno.test("encodeContent - multiple newlines are all replaced", () => {
	const input = new TextEncoder().encode("Line 1\nLine 2\nLine 3");
	const result = encodeContent(input);
	const expected = new TextEncoder().encode("Line 1\n\tLine 2\n\tLine 3");
	assertEquals(result, expected);
});

Deno.test("encodeContent - consecutive newlines are all replaced", () => {
	const input = new TextEncoder().encode("Line 1\n\nLine 3");
	const result = encodeContent(input);
	const expected = new TextEncoder().encode("Line 1\n\t\n\tLine 3");
	assertEquals(result, expected);
});

Deno.test("encodeContent - newline at start is replaced", () => {
	const input = new TextEncoder().encode("\nLine 2");
	const result = encodeContent(input);
	const expected = new TextEncoder().encode("\n\tLine 2");
	assertEquals(result, expected);
});

Deno.test("encodeContent - newline at end is replaced", () => {
	const input = new TextEncoder().encode("Line 1\n");
	const result = encodeContent(input);
	const expected = new TextEncoder().encode("Line 1\n\t");
	assertEquals(result, expected);
});

Deno.test("encodeContent - handles binary data with newlines", () => {
	const input = new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x0a, 0x57, 0x6f, 0x72, 0x6c, 0x64]);
	// "Hello\nWorld" in bytes
	const result = encodeContent(input);
	const expected = new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x0a, 0x09, 0x57, 0x6f, 0x72, 0x6c, 0x64]);
	// "Hello\n\tWorld" in bytes (0x0a = newline, 0x09 = tab)
	assertEquals(result, expected);
});

Deno.test("encodeContent - handles binary data without newlines", () => {
	const input = new Uint8Array([0x00, 0x01, 0x02, 0xff, 0xfe]);
	const result = encodeContent(input);
	assertEquals(result, input);
});

// Parameterized test for various content types
const contentTestCases = [
	{
		input: "Simple text",
		description: "simple text without newlines",
	},
	{
		input: "Multi\nline\ntext",
		description: "text with multiple newlines",
	},
	{
		input: "Ends with newline\n",
		description: "text ending with newline",
	},
	{
		input: "\nStarts with newline",
		description: "text starting with newline",
	},
	{
		input: "\n\nMultiple consecutive\n\nnewlines\n",
		description: "text with consecutive newlines",
	},
];

for (const testCase of contentTestCases) {
	Deno.test(`encodeContent - ${testCase.description}`, () => {
		const input = new TextEncoder().encode(testCase.input);
		const result = encodeContent(input);
		
		// Replace all newlines with newline+tab
		const expectedText = testCase.input.replace(/\n/g, "\n\t");
		const expected = new TextEncoder().encode(expectedText);
		
		assertEquals(result, expected);
	});
}

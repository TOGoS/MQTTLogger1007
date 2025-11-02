import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { parseArgs } from "./parse_args.ts";

Deno.test("parseArgs - no arguments returns DoLogging mode with empty arrays", () => {
	const result = parseArgs([]);
	assertEquals(result, { mode: "DoLogging", outputs: [], mqttUris: [] });
});

Deno.test("parseArgs - single -o flag", () => {
	const result = parseArgs(["-o", "output.txt"]);
	assertEquals(result, { mode: "DoLogging", outputs: ["output.txt"], mqttUris: [] });
});

Deno.test("parseArgs - multiple -o flags", () => {
	const result = parseArgs(["-o", "file1.txt", "-o", "file2.txt", "-o", "file3.txt"]);
	assertEquals(result, {
		mode: "DoLogging",
		outputs: ["file1.txt", "file2.txt", "file3.txt"],
		mqttUris: [],
	});
});

Deno.test("parseArgs - -o with directory (trailing slash)", () => {
	const result = parseArgs(["-o", "logs/"]);
	assertEquals(result, { mode: "DoLogging", outputs: ["logs/"], mqttUris: [] });
});

Deno.test("parseArgs - -o with stdout (-)", () => {
	const result = parseArgs(["-o", "-"]);
	assertEquals(result, { mode: "DoLogging", outputs: ["-"], mqttUris: [] });
});

Deno.test("parseArgs - single MQTT URI positional argument", () => {
	const result = parseArgs(["mqtt://example.com/topic"]);
	assertEquals(result, {
		mode: "DoLogging",
		outputs: [],
		mqttUris: ["mqtt://example.com/topic"],
	});
});

Deno.test("parseArgs - multiple MQTT URI positional arguments", () => {
	const result = parseArgs([
		"mqtt://server1.com/topic1",
		"mqtt://server2.com/topic2",
	]);
	assertEquals(result, {
		mode: "DoLogging",
		outputs: [],
		mqttUris: ["mqtt://server1.com/topic1", "mqtt://server2.com/topic2"],
	});
});

Deno.test("parseArgs - combination of -o flags and MQTT URIs", () => {
	const result = parseArgs([
		"-o",
		"output.txt",
		"-o",
		"logs/",
		"mqtt://example.com/topic1",
		"mqtt://example.com/topic2",
	]);
	assertEquals(result, {
		mode: "DoLogging",
		outputs: ["output.txt", "logs/"],
		mqttUris: ["mqtt://example.com/topic1", "mqtt://example.com/topic2"],
	});
});

Deno.test("parseArgs - --help flag returns OutputHelpText mode", () => {
	const result = parseArgs(["--help"]);
	assertEquals(result, { mode: "OutputHelpText" });
});

Deno.test("parseArgs - --help with other arguments returns OutputHelpText mode", () => {
	const result = parseArgs(["--help", "-o", "file.txt", "mqtt://example.com/topic"]);
	assertEquals(result, { mode: "OutputHelpText" });
});

Deno.test("parseArgs - unknown flag is ignored", () => {
	const result = parseArgs(["-o", "output.txt", "--unknown-flag", "mqtt://example.com/topic"]);
	assertEquals(result, {
		mode: "DoLogging",
		outputs: ["output.txt"],
		mqttUris: ["mqtt://example.com/topic"],
	});
});

Deno.test("parseArgs - --help can appear anywhere", () => {
	const result = parseArgs(["-o", "file.txt", "--help", "mqtt://example.com/topic"]);
	assertEquals(result, { mode: "OutputHelpText" });
});

// Parameterized test for various output formats
const outputTestCases = [
	{ input: "file.txt", description: "regular file" },
	{ input: "logs/", description: "directory with trailing slash" },
	{ input: "-", description: "stdout" },
	{ input: "/absolute/path/file.txt", description: "absolute file path" },
	{ input: "./relative/path/", description: "relative directory path" },
];

for (const testCase of outputTestCases) {
	Deno.test(`parseArgs - -o with ${testCase.description}`, () => {
		const result = parseArgs(["-o", testCase.input]);
		assertEquals(result, {
			mode: "DoLogging",
			outputs: [testCase.input],
			mqttUris: [],
		});
	});
}

// Parameterized test for various MQTT URI formats (from README spec)
const mqttUriTestCases = [
	{
		input: "mqtt://example.com/topic",
		description: "domain name with default port",
	},
	{
		input: "mqtt://example.com:1883/topic",
		description: "domain name with explicit port",
	},
	{
		input: "mqtt://192.168.1.1/topic",
		description: "IPv4 address",
	},
	{
		input: "mqtt://192.168.1.1:1883/topic",
		description: "IPv4 address with port",
	},
	{
		input: "mqtt://[::1]/topic",
		description: "IPv6 address",
	},
	{
		input: "mqtt://[2001:db8::1]:1883/topic",
		description: "IPv6 address with port",
	},
	{
		input: "mqtt://server.com/path/pattern",
		description: "path with pattern",
	},
];

for (const testCase of mqttUriTestCases) {
	Deno.test(`parseArgs - MQTT URI with ${testCase.description}`, () => {
		const result = parseArgs([testCase.input]);
		assertEquals(result, {
			mode: "DoLogging",
			outputs: [],
			mqttUris: [testCase.input],
		});
	});
}

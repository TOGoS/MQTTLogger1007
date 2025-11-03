import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { parseMqttUri, type ParsedMqttUri } from "./uri_parser.ts";

Deno.test("parseMqttUri - parses simple domain name URI", () => {
	const result = parseMqttUri("mqtt://example.com/topic");
	assertEquals(result, {
		host: "example.com",
		port: 1883,
		topic: "topic",
	});
});

Deno.test("parseMqttUri - parses domain name with explicit port", () => {
	const result = parseMqttUri("mqtt://example.com:8883/topic");
	assertEquals(result, {
		host: "example.com",
		port: 8883,
		topic: "topic",
	});
});

Deno.test("parseMqttUri - parses IPv4 address", () => {
	const result = parseMqttUri("mqtt://192.168.1.1/topic");
	assertEquals(result, {
		host: "192.168.1.1",
		port: 1883,
		topic: "topic",
	});
});

Deno.test("parseMqttUri - parses IPv4 address with port", () => {
	const result = parseMqttUri("mqtt://192.168.1.1:1883/topic");
	assertEquals(result, {
		host: "192.168.1.1",
		port: 1883,
		topic: "topic",
	});
});

Deno.test("parseMqttUri - parses IPv6 address in brackets", () => {
	const result = parseMqttUri("mqtt://[::1]/topic");
	assertEquals(result, {
		host: "::1",
		port: 1883,
		topic: "topic",
	});
});

Deno.test("parseMqttUri - parses IPv6 address with port", () => {
	const result = parseMqttUri("mqtt://[2001:db8::1]:1883/topic");
	assertEquals(result, {
		host: "2001:db8::1",
		port: 1883,
		topic: "topic",
	});
});

Deno.test("parseMqttUri - parses topic with multiple path segments", () => {
	const result = parseMqttUri("mqtt://example.com/sensors/temperature/room1");
	assertEquals(result, {
		host: "example.com",
		port: 1883,
		topic: "sensors/temperature/room1",
	});
});

Deno.test("parseMqttUri - parses topic pattern with wildcards", () => {
	const result = parseMqttUri("mqtt://example.com/+/sensor/#");
	assertEquals(result, {
		host: "example.com",
		port: 1883,
		topic: "+/sensor/#",
	});
});

Deno.test("parseMqttUri - handles topic starting with slash", () => {
	const result = parseMqttUri("mqtt://example.com//topic");
	assertEquals(result, {
		host: "example.com",
		port: 1883,
		topic: "/topic",
	});
});

Deno.test("parseMqttUri - handles empty topic path", () => {
	const result = parseMqttUri("mqtt://example.com/");
	assertEquals(result, {
		host: "example.com",
		port: 1883,
		topic: "",
	});
});

Deno.test("parseMqttUri - parses IPv6 with various formats", () => {
	const cases = [
		{ uri: "mqtt://[::1]/topic", expectedHost: "::1" },
		{ uri: "mqtt://[2001:db8::1]/topic", expectedHost: "2001:db8::1" },
		{ uri: "mqtt://[fe80::1%eth0]/topic", expectedHost: "fe80::1%eth0" },
	];
	
	for (const testCase of cases) {
		const result = parseMqttUri(testCase.uri);
		assertEquals(result.host, testCase.expectedHost);
		assertEquals(result.port, 1883);
		assertEquals(result.topic, "topic");
	}
});

Deno.test("parseMqttUri - handles various port numbers", () => {
	const cases = [
		{ uri: "mqtt://example.com:1883/topic", expectedPort: 1883 },
		{ uri: "mqtt://example.com:8883/topic", expectedPort: 8883 },
		{ uri: "mqtt://example.com:9001/topic", expectedPort: 9001 },
	];
	
	for (const testCase of cases) {
		const result = parseMqttUri(testCase.uri);
		assertEquals(result.host, "example.com");
		assertEquals(result.port, testCase.expectedPort);
		assertEquals(result.topic, "topic");
	}
});

Deno.test("parseMqttUri - handles complex topic paths", () => {
	const result = parseMqttUri("mqtt://example.com/devices/device-123/sensors/temp/value");
	assertEquals(result, {
		host: "example.com",
		port: 1883,
		topic: "devices/device-123/sensors/temp/value",
	});
});

// Parameterized test for various URI formats
const uriTestCases = [
	{
		uri: "mqtt://localhost/sensor",
		expected: { host: "localhost", port: 1883, topic: "sensor" },
		description: "localhost with simple topic",
	},
	{
		uri: "mqtt://broker.example.org:1883/home/living-room/temperature",
		expected: { host: "broker.example.org", port: 1883, topic: "home/living-room/temperature" },
		description: "domain with port and nested topic",
	},
	{
		uri: "mqtt://10.0.0.1:1883/data",
		expected: { host: "10.0.0.1", port: 1883, topic: "data" },
		description: "IPv4 with port",
	},
	{
		uri: "mqtt://[2001:db8::1]:8883/test",
		expected: { host: "2001:db8::1", port: 8883, topic: "test" },
		description: "IPv6 with custom port",
	},
];

for (const testCase of uriTestCases) {
	Deno.test(`parseMqttUri - ${testCase.description}`, () => {
		const result = parseMqttUri(testCase.uri);
		assertEquals(result, testCase.expected);
	});
}

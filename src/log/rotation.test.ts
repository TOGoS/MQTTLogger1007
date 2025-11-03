import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { shouldRotateFile, getDayBasedFileName } from "./rotation.ts";

Deno.test("shouldRotateFile - returns false for first message (null timestamp)", () => {
	const currentTimestamp = new Date("2025-01-15T10:00:00Z").getTime();
	assertEquals(shouldRotateFile(null, currentTimestamp), false);
});

Deno.test("shouldRotateFile - returns false for same UTC day", () => {
	const lastTimestamp = new Date("2025-01-15T10:00:00Z").getTime();
	const currentTimestamp = new Date("2025-01-15T23:59:59Z").getTime();
	assertEquals(shouldRotateFile(lastTimestamp, currentTimestamp), false);
});

Deno.test("shouldRotateFile - returns true when crossing UTC day boundary", () => {
	const lastTimestamp = new Date("2025-01-15T23:59:59Z").getTime();
	const currentTimestamp = new Date("2025-01-16T00:00:00Z").getTime();
	assertEquals(shouldRotateFile(lastTimestamp, currentTimestamp), true);
});

Deno.test("shouldRotateFile - returns false for same timestamp", () => {
	const timestamp = new Date("2025-01-15T12:00:00Z").getTime();
	assertEquals(shouldRotateFile(timestamp, timestamp), false);
});

Deno.test("shouldRotateFile - handles multiple day boundary crossings", () => {
	const day1 = new Date("2025-01-15T12:00:00Z").getTime();
	const day2 = new Date("2025-01-16T12:00:00Z").getTime();
	const day3 = new Date("2025-01-17T12:00:00Z").getTime();
	
	assertEquals(shouldRotateFile(day1, day2), true);
	assertEquals(shouldRotateFile(day2, day3), true);
	assertEquals(shouldRotateFile(day1, day3), true);
});

Deno.test("getDayBasedFileName - formats filename with UTC date", () => {
	const timestamp = new Date("2025-01-15T10:30:45Z").getTime();
	const result = getDayBasedFileName("logs", timestamp);
	assertEquals(result, "logs/2025-01-15.log");
});

Deno.test("getDayBasedFileName - handles different months correctly", () => {
	const timestamp1 = new Date("2025-02-15T12:00:00Z").getTime();
	const timestamp2 = new Date("2025-12-15T12:00:00Z").getTime();
	
	assertEquals(getDayBasedFileName("logs", timestamp1), "logs/2025-02-15.log");
	assertEquals(getDayBasedFileName("logs", timestamp2), "logs/2025-12-15.log");
});

Deno.test("getDayBasedFileName - handles year boundaries", () => {
	const timestamp1 = new Date("2025-12-31T23:59:59Z").getTime();
	const timestamp2 = new Date("2026-01-01T00:00:00Z").getTime();
	
	assertEquals(getDayBasedFileName("logs", timestamp1), "logs/2025-12-31.log");
	assertEquals(getDayBasedFileName("logs", timestamp2), "logs/2026-01-01.log");
});

Deno.test("getDayBasedFileName - handles directory paths with trailing slash", () => {
	const timestamp = new Date("2025-01-15T12:00:00Z").getTime();
	const result = getDayBasedFileName("logs/", timestamp);
	assertEquals(result, "logs/2025-01-15.log");
});

Deno.test("getDayBasedFileName - handles nested directory paths", () => {
	const timestamp = new Date("2025-01-15T12:00:00Z").getTime();
	const result = getDayBasedFileName("data/mqtt/logs", timestamp);
	assertEquals(result, "data/mqtt/logs/2025-01-15.log");
});

Deno.test("getDayBasedFileName - uses same date for all timestamps in same UTC day", () => {
	const timestamps = [
		new Date("2025-06-15T00:00:00Z").getTime(),
		new Date("2025-06-15T12:00:00Z").getTime(),
		new Date("2025-06-15T23:59:59Z").getTime(),
	];
	
	const filenames = timestamps.map(ts => getDayBasedFileName("logs", ts));
	assertEquals(filenames[0], filenames[1]);
	assertEquals(filenames[0], filenames[2]);
	assertEquals(filenames[0], "logs/2025-06-15.log");
});

// Parameterized test for various dates
const dateTestCases = [
	{ date: "2025-01-01T12:00:00Z", expected: "2025-01-01.log", description: "first day of year" },
	{ date: "2025-06-30T12:00:00Z", expected: "2025-06-30.log", description: "last day of June" },
	{ date: "2025-12-31T12:00:00Z", expected: "2025-12-31.log", description: "last day of year" },
	{ date: "2024-02-29T12:00:00Z", expected: "2024-02-29.log", description: "leap year February 29" },
];

for (const testCase of dateTestCases) {
	Deno.test(`getDayBasedFileName - ${testCase.description}`, () => {
		const timestamp = new Date(testCase.date).getTime();
		const result = getDayBasedFileName("logs", timestamp);
		assertEquals(result, `logs/${testCase.expected}`);
	});
}

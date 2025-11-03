import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { utcDayForTimestamp, sameUtcDay } from "./day_boundary.ts";

Deno.test("utcDayForTimestamp - returns same day for timestamps on same UTC day", () => {
	const ts1 = new Date("2025-01-15T10:30:00Z").getTime();
	const ts2 = new Date("2025-01-15T23:59:59Z").getTime();
	const day1 = utcDayForTimestamp(ts1);
	const day2 = utcDayForTimestamp(ts2);
	assertEquals(day1, day2);
});

Deno.test("utcDayForTimestamp - returns different day for timestamps on different UTC days", () => {
	const ts1 = new Date("2025-01-15T23:59:59Z").getTime();
	const ts2 = new Date("2025-01-16T00:00:00Z").getTime();
	const day1 = utcDayForTimestamp(ts1);
	const day2 = utcDayForTimestamp(ts2);
	assertEquals(day1 !== day2, true);
});

Deno.test("utcDayForTimestamp - handles epoch start correctly", () => {
	const ts = 0; // 1970-01-01T00:00:00Z
	const day = utcDayForTimestamp(ts);
	// Should be 0 (epoch day)
	assertEquals(day, 0);
});

Deno.test("utcDayForTimestamp - handles dates before epoch", () => {
	const ts = new Date("1969-12-31T12:00:00Z").getTime();
	const day = utcDayForTimestamp(ts);
	// Should be negative
	assertEquals(day < 0, true);
});

Deno.test("utcDayForTimestamp - consistent across day boundaries", () => {
	// Test that timestamps within same day give same result
	const baseDate = new Date("2025-06-15T12:00:00Z");
	const times = [
		baseDate.getTime(),
		new Date("2025-06-15T00:00:00Z").getTime(),
		new Date("2025-06-15T23:59:59.999Z").getTime(),
	];
	
	const days = times.map(utcDayForTimestamp);
	assertEquals(days[0], days[1]);
	assertEquals(days[0], days[2]);
});

Deno.test("sameUtcDay - returns true for timestamps on same UTC day", () => {
	const ts1 = new Date("2025-01-15T10:30:00Z").getTime();
	const ts2 = new Date("2025-01-15T23:59:59Z").getTime();
	assertEquals(sameUtcDay(ts1, ts2), true);
});

Deno.test("sameUtcDay - returns false for timestamps on different UTC days", () => {
	const ts1 = new Date("2025-01-15T23:59:59Z").getTime();
	const ts2 = new Date("2025-01-16T00:00:00Z").getTime();
	assertEquals(sameUtcDay(ts1, ts2), false);
});

Deno.test("sameUtcDay - returns true for identical timestamps", () => {
	const ts = new Date("2025-01-15T12:00:00Z").getTime();
	assertEquals(sameUtcDay(ts, ts), true);
});

Deno.test("sameUtcDay - handles day boundary crossing correctly", () => {
	// Last millisecond of day
	const ts1 = new Date("2025-01-15T23:59:59.999Z").getTime();
	// First millisecond of next day
	const ts2 = new Date("2025-01-16T00:00:00.000Z").getTime();
	assertEquals(sameUtcDay(ts1, ts2), false);
});

// Parameterized test for various dates
const dateTestCases = [
	{
		date1: "2025-01-15T10:00:00Z",
		date2: "2025-01-15T20:00:00Z",
		expectedSame: true,
		description: "same day, different times",
	},
	{
		date1: "2025-01-15T23:59:59Z",
		date2: "2025-01-16T00:00:00Z",
		expectedSame: false,
		description: "crosses day boundary",
	},
	{
		date1: "2025-12-31T23:59:59Z",
		date2: "2026-01-01T00:00:00Z",
		expectedSame: false,
		description: "crosses year boundary",
	},
	{
		date1: "2025-02-28T23:59:59Z",
		date2: "2025-03-01T00:00:00Z",
		expectedSame: false,
		description: "crosses month boundary",
	},
];

for (const testCase of dateTestCases) {
	Deno.test(`sameUtcDay - ${testCase.description}`, () => {
		const ts1 = new Date(testCase.date1).getTime();
		const ts2 = new Date(testCase.date2).getTime();
		assertEquals(sameUtcDay(ts1, ts2), testCase.expectedSame);
	});
}

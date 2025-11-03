/**
 * Calculates the UTC day identifier for a given timestamp.
 * The day identifier represents the number of days since the Unix epoch (1970-01-01).
 * All timestamps within the same UTC day will have the same identifier.
 *
 * @param ts - Timestamp in milliseconds since Unix epoch
 * @returns UTC day identifier (number of days since epoch)
 */
export function utcDayForTimestamp(ts: number): number {
	// Get UTC date components
	const date = new Date(ts);
	const year = date.getUTCFullYear();
	const month = date.getUTCMonth();
	const day = date.getUTCDate();
	
	// Create date at midnight UTC for this day
	const midnight = Date.UTC(year, month, day);
	
	// Calculate days since epoch
	const msPerDay = 24 * 60 * 60 * 1000;
	return Math.floor(midnight / msPerDay);
}

/**
 * Checks if two timestamps fall on the same UTC day.
 *
 * @param ts1 - First timestamp in milliseconds
 * @param ts2 - Second timestamp in milliseconds
 * @returns true if both timestamps are on the same UTC day, false otherwise
 */
export function sameUtcDay(ts1: number, ts2: number): boolean {
	return utcDayForTimestamp(ts1) === utcDayForTimestamp(ts2);
}

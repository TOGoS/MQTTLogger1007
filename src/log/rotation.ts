import { sameUtcDay } from "./day_boundary.ts";

/**
 * Determines if a log file should be rotated based on UTC day boundaries.
 * File rotation occurs when the timestamp crosses a UTC day boundary.
 * The first message in a file (null timestamp) does not trigger rotation.
 *
 * @param lastTimestamp - Timestamp of the last message written, or null for first message
 * @param currentTimestamp - Timestamp of the current message
 * @returns true if the file should be rotated (crossed UTC day boundary), false otherwise
 */
export function shouldRotateFile(
	lastTimestamp: number | null,
	currentTimestamp: number,
): boolean {
	if (lastTimestamp === null) {
		// First message in file - no rotation needed
		return false;
	}
	
	// Rotate if timestamps are on different UTC days
	return !sameUtcDay(lastTimestamp, currentTimestamp);
}

/**
 * Generates a day-based filename for a log file.
 * Format: `{baseDir}/{YYYY-MM-DD}.log`
 * Uses UTC date to ensure consistency across timezones.
 *
 * @param baseDir - Base directory path (may or may not have trailing slash)
 * @param timestamp - Timestamp in milliseconds since Unix epoch
 * @returns File path for the log file
 */
export function getDayBasedFileName(baseDir: string, timestamp: number): string {
	const date = new Date(timestamp);
	const year = date.getUTCFullYear();
	const month = String(date.getUTCMonth() + 1).padStart(2, "0");
	const day = String(date.getUTCDate()).padStart(2, "0");
	
	// Normalize baseDir - remove trailing slash if present, we'll add our own
	const normalizedDir = baseDir.replace(/\/$/, "");
	
	return `${normalizedDir}/${year}-${month}-${day}.log`;
}

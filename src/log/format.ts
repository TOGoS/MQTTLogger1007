/**
 * Format identifier for log files.
 * This appears as the first line: `#format tag:nuke24.net,2025-11-02:MQTTLogger1007/LogV1`
 */
export const LOG_FORMAT_IDENTIFIER = "tag:nuke24.net,2025-11-02:MQTTLogger1007/LogV1";

/**
 * Description of the log format.
 * Should appear in comments following the format identifier line.
 */
export const LOG_FORMAT_DESCRIPTION = [
	"# MQTTLogger1007/LogV1 format",
	"# ",
	"# Timestamp lines: #ts <milliseconds>",
	"# Message lines: <path>\\t<flags>\\t<encoded-content>",
	"# Content encoding: newlines replaced with newline+tab",
	"# Flags: R (retained), - (no flags)",
];

/**
 * Flag symbol for retained messages.
 */
export const FLAG_RETAINED = "R";

/**
 * Placeholder flag when there are no other flags.
 */
export const FLAG_NONE = "-";

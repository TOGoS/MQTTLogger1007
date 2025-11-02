export type ParseResult =
	| { mode: "DoLogging"; outputs: string[]; mqttUris: string[] }
	| { mode: "OutputHelpText" };

/**
 * Parses command-line arguments for MQTT Logger.
 *
 * @param args - Array of command-line arguments (typically Deno.args)
 * @returns ParseResult with either DoLogging mode (containing outputs and MQTT URIs)
 *          or OutputHelpText mode (if --help was specified)
 */
export function parseArgs(args: string[]): ParseResult {
	const outputs: string[] = [];
	const mqttUris: string[] = [];
	let helpRequested = false;
	
	for (let i = 0; i < args.length; i++) {
		const arg = args[i];
		
		if (arg === "--help") {
			helpRequested = true;
			// Continue processing in case we want to validate, but help takes precedence
		} else if (arg === "-o") {
			if (i + 1 < args.length) {
				outputs.push(args[i + 1]);
				i++; // Skip the next argument as it's the value for -o
			}
			// If -o is last argument with no value, we'll just ignore it
			// (could be an error case, but keeping it simple for now)
		} else if (!arg.startsWith("-")) {
			// Positional argument - treat as MQTT URI
			// Actual validation will be done later by sinkspec parser
			mqttUris.push(arg);
		}
		// Ignore unknown flags for now
	}
	
	if (helpRequested) {
		return { mode: "OutputHelpText" };
	}
	
	return {
		mode: "DoLogging",
		outputs,
		mqttUris,
	};
}

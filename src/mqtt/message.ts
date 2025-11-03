/**
 * Represents an MQTT message received from a broker.
 */
export interface MQTTMessage {
	/** Timestamp in milliseconds since Unix epoch */
	timestamp: number;
	/** Topic path/pattern where the message was received */
	path: string;
	/** Message payload as raw bytes */
	value: Uint8Array;
	/** Whether the message was retained by the broker */
	retained: boolean;
}

/**
 * A simple consumer/callback type for accepting items.
 * Used for push-based APIs where sources push data to sinks.
 */
export type Consumer<T> = (item: T) => void;

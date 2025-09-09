/**
 * Sample JSON-RPC server implementation using stdin/stdout for communication.
 *
 * This module demonstrates a simple JSON-RPC server that:
 * - Listens for JSON-RPC requests on stdin
 * - Processes requests and sends responses via stdout
 * - Handles predefined request IDs with corresponding responses
 * - Exits gracefully when receiving request ID 999
 */

/**
 * Represents the basic structure of a JSON-RPC request payload.
 */
type Payload = {
  /** Unique identifier for the JSON-RPC request */
  id: string | number;
};

/**
 * Represents a JSON-RPC response structure following the 2.0 specification.
 */
type JsonRpcResponse = {
  /** JSON-RPC protocol version */
  jsonrpc: string;
  /** Request identifier that matches the original request */
  id: string | number;
  /** Response result data (optional) */
  result?: unknown;
};

/**
 * Type guard function to validate if an unknown object is a valid Payload.
 *
 * @param payload - The object to validate
 * @returns True if the payload has the required structure, false otherwise
 */
const isPayload = (payload: unknown): payload is Payload =>
  typeof payload === "object" &&
  payload !== null &&
  "id" in payload &&
  (typeof payload.id === "string" || typeof payload.id === "number");

/**
 * Predefined responses for specific request IDs.
 * This serves as a mock database of responses for testing purposes.
 */
const responses: Record<string | number, JsonRpcResponse> = {
  1: {
    jsonrpc: "2.0",
    id: 1,
    result: "response for id 1",
  },
  2: {
    jsonrpc: "2.0",
    id: 2,
    result: "response for id 2",
  },
  999: {
    jsonrpc: "2.0",
    id: 999,
    result: "response for id 999",
  },
};

/**
 * Handles incoming JSON-RPC requests by looking up predefined responses.
 *
 * @param payload - The validated JSON-RPC request payload
 *
 * Behavior:
 * - Looks up the response for the given ID in the responses map
 * - Writes the JSON response to stdout if found
 * - Exits the process when ID 999 is received (termination signal)
 */
const handler = (payload: Payload) => {
  const response = responses[payload.id] ?? null;
  if (response) {
    process.stdout.write(JSON.stringify(response) + "\n");
  }
  // Special termination condition: exit when receiving ID 999
  if (payload.id === 999) {
    process.exit(0);
  }
};

/**
 * Main event listener for processing incoming data from stdin.
 *
 * This listener:
 * 1. Receives raw data chunks from stdin
 * 2. Attempts to parse them as JSON
 * 3. Validates the payload structure using the type guard
 * 4. Delegates valid payloads to the handler function
 * 5. Silently ignores invalid JSON or malformed payloads
 */
process.stdin.addListener("data", (chunk) => {
  try {
    // Parse the incoming chunk as JSON
    const payload = JSON.parse(chunk.toString().trim());
    if (isPayload(payload)) {
      handler(payload);
    }
  } catch {
    // Silently ignore parsing errors or invalid payloads
  }
});

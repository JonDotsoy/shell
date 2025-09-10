/**
 * Configuration options for shell requests as an object.
 */
export type ShellRequestObjectOptions = {
  /** Command to execute */
  command: string;
  /** Input stream to pipe to the command */
  stdin?: ReadableStream;
  /** Environment variables for the command */
  env?: Record<string, string>;
  /** Shell to use for execution */
  shell?: string;
  /** Working directory for the command */
  cwd?: string | URL;
  /** AbortSignal to control command cancellation and timeout */
  signal?: AbortSignal;
};

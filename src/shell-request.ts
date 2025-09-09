import { parseArgumentsShellRequestOptions } from "./argument-parsers/parse-arguments-shell-request-options.js";
import type { ShellRequestOptions } from "./dtos/shell-request-options.js";

/**
 * Represents a shell command request with all necessary configuration.
 * Encapsulates command, input stream, environment variables, shell, working directory, and abort signal.
 */
export class ShellRequest {
  /** The command to execute */
  command: string;
  /** Input stream to pipe to the command */
  stdin?: ReadableStream;
  /** Environment variables for the command */
  env?: Record<string, string>;
  /** Shell to use for execution */
  shell?: string;
  /** Working directory for the command */
  cwd?: string;
  /** AbortSignal to control command cancellation and timeout */
  signal?: AbortSignal;

  /**
   * Creates a new ShellRequest instance.
   * @param options - Command string, options object, or other configuration formats
   */
  constructor(...options: ShellRequestOptions) {
    const { command, stdin, env, shell, cwd, signal } =
      parseArgumentsShellRequestOptions(options);
    this.command = command;
    this.stdin = stdin;
    this.env = env;
    this.shell = shell;
    this.cwd = cwd;
    this.signal = signal;
  }
}

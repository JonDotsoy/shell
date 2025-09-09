import { parseArgumentsShellResponseOptions } from "./argument-parsers/parse-arguments-shell-response-options.js";
import type { ShellResponseOptions } from "./dtos/shell-response-options.js";
import { ReadableTools } from "./readable-tools.js";

/**
 * Represents the response from a shell command execution.
 * Provides access to stdout, stderr streams and the exit code.
 */

export class ShellResponse {
  /** Promise that resolves to the process exit code */
  exitCode: Promise<number>;

  /** Standard output stream with utility methods */
  stdout: ReadableTools;
  /** Standard error stream with utility methods */
  stderr: ReadableTools;

  /**
   * Creates a new ShellResponse instance.
   * @param options - Stream configurations and exit code promise
   */
  constructor(...options: ShellResponseOptions) {
    const { stdio, exitCode } = parseArgumentsShellResponseOptions(options);
    this.stdout = new ReadableTools(stdio?.stdout ?? new ReadableStream({}));
    this.stderr = new ReadableTools(stdio?.stderr ?? new ReadableStream({}));
    this.exitCode = exitCode ?? Promise.resolve(0);
  }

  /**
   * Enables verbose output by logging stdout and stderr to console.
   * Creates new streams that mirror the original streams while logging their content.
   * @returns This ShellResponse instance for method chaining
   */
  verbose() {
    this.stdout.tap(
      new WritableStream({
        write(chunk) {
          process.stdout.write(chunk);
        },
      }),
    );

    this.stderr.tap(
      new WritableStream({
        write(chunk) {
          process.stderr.write(chunk);
        },
      }),
    );

    return this;
  }

  /**
   * Convenience method to get stdout content as text.
   * @returns Promise that resolves to stdout content as a string
   */
  text() {
    return this.stdout.text();
  }

  /**
   * Convenience method to parse stdout content as JSON.
   * @returns Promise that resolves to parsed JSON from stdout
   */
  json() {
    return this.stdout.json();
  }
}

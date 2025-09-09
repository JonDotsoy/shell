import type { ShellResponseObjectOptions } from "../dtos/shell-response-object-options.js";
import type { ShellResponseOptions } from "../dtos/shell-response-options.js";

/**
 * Filters out ReadableStream and string values from a given input.
 *
 * @template T - The type of the input value
 * @param value - The value to be filtered
 * @returns Returns `null` if the value is a ReadableStream or string, otherwise returns the value with ReadableStream and string types excluded from the type union
 *
 * @example
 * ```typescript
 * const result1 = filterReadableStreamOrString("hello"); // returns null
 * const result2 = filterReadableStreamOrString(new ReadableStream()); // returns null
 * const result3 = filterReadableStreamOrString(42); // returns 42
 * const result4 = filterReadableStreamOrString({ key: "value" }); // returns { key: "value" }
 * ```
 */
const filterReadableStreamOrString = <T>(value: T) =>
  value instanceof ReadableStream || typeof value === "string"
    ? null
    : (value as Exclude<T, ReadableStream | string>);

/**
 * Parses and normalizes shell response options from various input formats.
 * @param args - The shell response options to parse
 * @returns Normalized shell response object options
 */
export const parseArgumentsShellResponseOptions = (
  args: ShellResponseOptions,
): ShellResponseObjectOptions => {
  const [streamOrOptions, objectOptions] = args;

  const filteredStream = filterReadableStreamOrString(streamOrOptions);

  const stdout: ReadableStream | undefined =
    streamOrOptions instanceof ReadableStream
      ? streamOrOptions
      : typeof streamOrOptions === "string"
        ? new ReadableStream({
            start: (controller) => {
              controller.enqueue(new TextEncoder().encode(streamOrOptions));
              controller.close();
            },
          })
        : streamOrOptions?.stdio?.stdout;

  const stderr: ReadableStream | undefined =
    filteredStream?.stdio?.stderr ?? objectOptions?.stdio?.stderr;
  const exitCode = filteredStream?.exitCode ?? objectOptions?.exitCode;

  return {
    stdio: {
      stdout,
      stderr,
    },
    exitCode:
      typeof exitCode === "number" ? Promise.resolve(exitCode) : exitCode,
  };
};

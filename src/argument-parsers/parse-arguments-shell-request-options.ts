import { ShellRequest } from "../shell-request.js";
import type { ShellRequestObjectOptions } from "../dtos/shell-request-object-options.js";
import type { ShellRequestOptions } from "../dtos/shell-request-options.js";

const filterString = <T>(value: T) =>
  typeof value === "string" ? null : (value as Exclude<T, string>);

/**
 * Parses and normalizes shell request options from various input formats.
 * @param args - The shell request options to parse
 * @returns Normalized shell request object options
 */
export const parseArgumentsShellRequestOptions = (
  args: ShellRequestOptions,
): ShellRequestObjectOptions => {
  const [commandOrObjectOptions, objectOptions] = args;

  const filteredCommand = filterString(commandOrObjectOptions);

  const assertString = (value: unknown, raise: () => Error) => {
    if (typeof value !== "string") {
      throw raise();
    }
    return value;
  };

  // When first argument is a string, use second argument for options
  if (typeof commandOrObjectOptions === "string") {
    return {
      command: commandOrObjectOptions,
      stdin: objectOptions?.stdin,
      env: objectOptions?.env,
      shell: objectOptions?.shell,
      cwd: objectOptions?.cwd,
      signal: objectOptions?.signal,
    };
  }

  // When first argument is an object, extract options from it
  return {
    command: assertString(
      filteredCommand?.command,
      () => new Error("Command must be a string"),
    ),
    stdin: filteredCommand?.stdin,
    env: filteredCommand?.env,
    shell: filteredCommand?.shell,
    cwd: filteredCommand?.cwd,
    signal: filteredCommand?.signal,
  };
};

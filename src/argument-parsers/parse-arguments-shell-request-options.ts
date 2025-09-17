import type { ShellRequestObjectOptions } from "../dtos/shell-request-object-options.js";
import type { ShellRequestOptions } from "../dtos/shell-request-options.js";
import { ReadableTools } from "../readable-tools.js";
import { ShellResponse } from "../shell-response.js";

const toReadableTools = <T>(value: T): ReadableStream | undefined => {
  if (value instanceof ShellResponse) return value.stdout.readable;
  if (value instanceof ReadableStream) return value;
  if (value instanceof ReadableTools) return value.readable;
  return;
};

const prepareShellRequestObjectOptions = (
  args: ShellRequestOptions,
): ShellRequestObjectOptions => {
  const [commandOrObjectOptions, objectOptions] = args;

  const o =
    typeof commandOrObjectOptions === "string" ? null : commandOrObjectOptions;

  return {
    command:
      typeof commandOrObjectOptions === "string"
        ? commandOrObjectOptions
        : objectOptions && "command" in objectOptions
          ? (objectOptions.command ?? commandOrObjectOptions.command)
          : commandOrObjectOptions.command,
    stdin: toReadableTools(o?.stdin ?? objectOptions?.stdin),
    env: o?.env ?? objectOptions?.env ?? undefined,
    shell: o?.shell ?? objectOptions?.shell ?? undefined,
    cwd: o?.cwd ?? objectOptions?.cwd ?? undefined,
    signal: o?.signal ?? objectOptions?.signal ?? undefined,
  };
};

/**
 * Parses and normalizes shell request options from various input formats.
 * @param args - The shell request options to parse
 * @returns Normalized shell request object options
 */
export const parseArgumentsShellRequestOptions = (
  args: ShellRequestOptions,
): ShellRequestObjectOptions => {
  const shellRequestObjectOptions = prepareShellRequestObjectOptions(args);
  if (typeof shellRequestObjectOptions.command !== "string") {
    throw new Error("Command must be a string");
  }
  return shellRequestObjectOptions;
};

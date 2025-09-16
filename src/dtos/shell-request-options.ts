import type { ShellRequest } from "../shell-request.js";
import type { ShellResponse } from "../shell-response.js";

/**
 * Union type for different ways to specify shell request options.
 * Can be a ShellRequest instance, a command string, or an options object.
 */
export type ShellRequestOptions =
  | [ShellRequest]
  | [string]
  | [
      string,
      {
        /** Input stream to pipe to the command */
        stdin?: ReadableStream | ShellResponse;
        /** Environment variables for the command */
        env?: Record<string, string>;
        /** Shell to use for execution */
        shell?: string;
        /** Working directory for the command */
        cwd?: string | URL;
        /** AbortSignal to control command cancellation and timeout */
        signal?: AbortSignal;
      },
    ]
  | [
      {
        /** Command to execute */
        command: string;
        /** Input stream to pipe to the command */
        stdin?: ReadableStream | ShellResponse;
        /** Environment variables for the command */
        env?: Record<string, string>;
        /** Shell to use for execution */
        shell?: string;
        /** Working directory for the command */
        cwd?: string | URL;
        /** AbortSignal to control command cancellation and timeout */
        signal?: AbortSignal;
      },
    ];

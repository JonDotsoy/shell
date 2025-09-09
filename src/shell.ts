import { spawn } from "node:child_process";
import type { ShellRequestOptions } from "./dtos/shell-request-options.js";
import { ShellRequest } from "./shell-request.js";
import { ShellResponse } from "./shell-response.js";
export { ShellRequest } from "./shell-request.js";
export { ShellResponse } from "./shell-response.js";

/**
 * Executes a shell command and returns a ShellResponse.
 * This is the core function for running shell commands with full control over streams and environment.
 * @param requestOptions - Command string, options object, or other configuration formats
 * @returns ShellResponse instance containing stdout, stderr streams and exit code
 */
export const shell = (
  ...requestOptions: ShellRequestOptions
): ShellResponse => {
  const shellRequest = new ShellRequest(...requestOptions); // validate request options

  const exitCode = Promise.withResolvers<number>();
  let stdoutCtrl: ReadableStreamDefaultController<unknown>;
  let stderrCtrl: ReadableStreamDefaultController<unknown>;

  const stdoutReadable = new ReadableStream<unknown>({
    start(controller) {
      stdoutCtrl = controller;
    },
  });

  const stderrReadable = new ReadableStream<unknown>({
    start(controller) {
      stderrCtrl = controller;
    },
  });

  const p = spawn(
    shellRequest.shell ?? "/bin/sh",
    ["-c", shellRequest.command],
    {
      cwd: shellRequest.cwd,
      env: shellRequest.env ?? process.env,
      stdio: ["overlapped", "pipe", "pipe"],
      signal: shellRequest.signal,
    },
  );

  if (shellRequest.stdin) {
    shellRequest.stdin.pipeTo(
      new WritableStream({
        write(chunk) {
          p.stdin.write(chunk);
        },
        close() {
          p.stdin.end();
        },
        abort(err) {
          p.stdin.destroy(err);
        },
      }),
    );
  }

  p.stdout.addListener("data", (data) => {
    stdoutCtrl.enqueue(data);
  });

  p.stderr.addListener("data", (data) => {
    stderrCtrl.enqueue(data);
  });

  p.stdout.addListener("end", () => {
    stdoutCtrl.close();
  });

  p.stderr.addListener("end", () => {
    stderrCtrl.close();
  });

  p.addListener("exit", (code) => {
    exitCode.resolve(code ?? 0);
  });

  return new ShellResponse({
    stdio: {
      stdout: stdoutReadable,
      stderr: stderrReadable,
    },
    exitCode: exitCode.promise,
  });
};

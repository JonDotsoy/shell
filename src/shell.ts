import { spawn } from "node:child_process";
import type { ShellRequestOptions } from "./dtos/shell-request-options.js";
import { ShellRequest } from "./shell-request.js";
import { ShellResponse } from "./shell-response.js";
export { ReadableTools } from "./readable-tools.js";
export { ShellRequest } from "./shell-request.js";
export { ShellResponse } from "./shell-response.js";

type ReadableStreamController<T> = {
  enqueue(chunk: T): void;
  error(err: unknown): void;
  close(): void;
};

const readableStreamWithController = <T>() => {
  let controller!: null | ReadableStreamController<T>;

  const readable = new ReadableStream<T>({
    start(ctrl: ReadableStreamController<T>) {
      controller = ctrl;
    },
  });

  if (!controller) {
    throw new Error("Unable to create readable stream with controller.");
  }

  return { readable, controller };
};

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

  const { readable: stdoutReadable, controller: stdoutCtrl } =
    readableStreamWithController<unknown>();
  const { readable: stderrReadable, controller: stderrCtrl } =
    readableStreamWithController<unknown>();

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

  p.addListener("error", (err) => {
    exitCode.reject(err);
  });

  return new ShellResponse({
    stdio: {
      stdout: stdoutReadable,
      stderr: stderrReadable,
    },
    exitCode: exitCode.promise,
  });
};

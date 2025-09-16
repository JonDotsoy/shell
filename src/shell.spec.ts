import { describe, test, expect, expectTypeOf } from "bun:test";
import { AwaitedShellResponse, ShellResponse } from "./shell-response.js";
import { ShellRequest } from "./shell-request.js";
import { shell } from "./shell.js";

const t = async <T>(
  cb: () => Promise<T>,
): Promise<[null, T] | [unknown, null]> => {
  try {
    return [null, await cb()];
  } catch (error) {
    return [error, null];
  }
};

describe("Workspace", () => {
  test("should create ShellRequest with command using object constructor", async () => {
    const request = new ShellRequest({
      command: `echo ls`,
    });

    expect(request.command).toBe(`echo ls`);
    expect(request.stdin).toBeUndefined();
  });

  test("should create ShellRequest with command using string constructor", async () => {
    const request = new ShellRequest(`echo ls`);

    expect(request.command).toBe(`echo ls`);
    expect(request.stdin).toBeUndefined();
  });

  test("should create ShellRequest with command and stdin using object constructor", async () => {
    const request = new ShellRequest({
      command: `cat`,
      stdin: new ReadableStream({}),
    });

    expect(request.command).toBe(`cat`);
    expect(request.stdin).toBeInstanceOf(ReadableStream);
  });

  test("should create ShellRequest with command and stdin using string constructor", async () => {
    const request = new ShellRequest(`cat`, {
      stdin: new ReadableStream({}),
    });

    expect(request.command).toBe(`cat`);
    expect(request.stdin).toBeInstanceOf(ReadableStream);
  });

  test("should create ShellRequest with command and environment variables", async () => {
    const request = new ShellRequest({
      command: `cat`,
      env: { TEST: "value" },
    });

    expect(request.command).toBe(`cat`);
    expect(request.env).toEqual({ TEST: "value" });
  });

  test("should create ShellResponse from ReadableStream and return text content", async () => {
    const response = new ShellResponse(
      new ReadableStream({
        start(controller) {
          controller.enqueue("Hello, World!");
          controller.close();
        },
      }),
    );

    expect(await response.text()).toBe("Hello, World!");
    expect(await response.exitCode).toBe(0);
  });

  test("should create ShellResponse with custom exit code", async () => {
    const response = new ShellResponse(
      new ReadableStream({
        start(controller) {
          controller.close();
        },
      }),
      {
        exitCode: Promise.resolve(0),
      },
    );

    expect(await response.exitCode).toBe(0);
  });

  test("should parse JSON response from ShellResponse", async () => {
    const response = new ShellResponse(
      new ReadableStream({
        start(controller) {
          controller.enqueue(`{"ok": true}`);
          controller.close();
        },
      }),
    );

    expect(await response.json()).toEqual({ ok: true });
  });

  test("should handle multiple JSON parsing calls on the same ShellResponse", async () => {
    const response = new ShellResponse(
      new ReadableStream({
        start(controller) {
          controller.enqueue(`{"ok": true}`);
          controller.close();
        },
      }),
    );

    expect(await response.json()).toEqual({ ok: true });
  });

  test("should abort command execution when timeout signal is triggered", async () => {
    const signal = AbortSignal.timeout(1);

    const response = shell("sleep 5", { signal });

    const [error] = await t(() => response.exitCode);

    expect(error).not.toBeUndefined();
  });

  test("should abort text reading when timeout signal is triggered during command execution", async () => {
    const signal = AbortSignal.timeout(1);

    const timestart = Date.now();
    const response = shell("sleep 5", { signal });

    response.exitCode.catch(() => {}); // avoid console error logging

    await response.text();
    await response.stderr.text();
    const duration = Date.now() - timestart;

    expect(duration).toBeLessThan(5000);
  });

  test("should pipe output from one command to another", async () => {
    const a = shell(new ShellRequest("echo a"));
    const b = shell(new ShellRequest("cat", { stdin: a }));

    const res = await b.text();

    expect(res).toBe("a\n");
  });

  test("should ensure ShellResponse.exitCode returns a Promise<number> type", async () => {
    const response = new ShellResponse();

    expectTypeOf(response.exitCode).toEqualTypeOf<Promise<number>>();
  });

  test("should return AwaitedShellResponse type when awaiting ShellResponse", async () => {
    const response = await new ShellResponse();

    expectTypeOf(response).toEqualTypeOf<AwaitedShellResponse>();
  });

  test("should await command completion and not add delay on subsequent exitCode calls", async () => {
    const starting = Date.now();
    const response = await shell("sleep 1");
    const durationFirst = Date.now() - starting;
    await response.exitCode;
    const durationSecond = Date.now() - starting;

    expect(durationFirst).toBeGreaterThanOrEqual(1000);
    expect(durationSecond).toBeGreaterThanOrEqual(1000);
  });
});

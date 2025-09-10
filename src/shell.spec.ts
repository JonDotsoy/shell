import { describe, test, expect } from "bun:test";
import { ShellResponse } from "./shell-response.js";
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

    const response = shell("sleep 5", { signal });

    response.exitCode.catch(() => {}); // avoid console error logging

    const text = await response.text();
    const err = await response.stderr.text();

    expect(text).toBe("");
    expect(err).toBe("");
  });
});

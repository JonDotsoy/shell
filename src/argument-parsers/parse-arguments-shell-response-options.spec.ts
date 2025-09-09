import { describe, test, expect } from "bun:test";
import { ShellRequest } from "../shell-request.js";
import { parseArgumentsShellResponseOptions } from "./parse-arguments-shell-response-options.js";

describe("parseArgumentsShellResponseOptions", () => {
  describe("empty arguments", () => {
    test("should handle empty array with all undefined values", () => {
      const res = parseArgumentsShellResponseOptions([]);

      expect(res.exitCode).toBeUndefined();
      expect(res.stdio?.stdout).toBeUndefined();
      expect(res.stdio?.stderr).toBeUndefined();
    });
  });

  describe("ReadableStream as first argument", () => {
    test("should set stdout when ReadableStream is provided", () => {
      const stdout = new ReadableStream();

      const res = parseArgumentsShellResponseOptions([stdout]);

      expect(res.exitCode).toBeUndefined();
      expect(res.stdio?.stdout).toBe(stdout);
      expect(res.stdio?.stderr).toBeUndefined();
    });

    test("should set stdout and exitCode when ReadableStream and options are provided", () => {
      const stdout = new ReadableStream();
      const exitCode = Promise.resolve(1);

      const res = parseArgumentsShellResponseOptions([stdout, { exitCode }]);

      expect(res.exitCode).toBe(exitCode);
      expect(res.stdio?.stdout).toBe(stdout);
      expect(res.stdio?.stderr).toBeUndefined();
    });

    test("should set stdout and stderr when ReadableStream and stderr option are provided", () => {
      const stdout = new ReadableStream();
      const stderr = new ReadableStream();

      const res = parseArgumentsShellResponseOptions([
        stdout,
        { stdio: { stderr } },
      ]);

      expect(res.exitCode).toBeUndefined();
      expect(res.stdio?.stdout).toBe(stdout);
      expect(res.stdio?.stderr).toBe(stderr);
    });

    test("should set all properties when ReadableStream and complete options are provided", () => {
      const stdout = new ReadableStream();
      const stderr = new ReadableStream();
      const exitCode = Promise.resolve(0);

      const res = parseArgumentsShellResponseOptions([
        stdout,
        { stdio: { stderr }, exitCode },
      ]);

      expect(res.exitCode).toBe(exitCode);
      expect(res.stdio?.stdout).toBe(stdout);
      expect(res.stdio?.stderr).toBe(stderr);
    });
  });

  describe("string as first argument", () => {
    test("should convert string to ReadableStream for stdout", () => {
      const text = "Hello, World!";

      const res = parseArgumentsShellResponseOptions([text]);

      expect(res.exitCode).toBeUndefined();
      expect(res.stdio?.stdout).toBeInstanceOf(ReadableStream);
      expect(res.stdio?.stderr).toBeUndefined();
    });

    test("should convert string to ReadableStream and set exitCode", () => {
      const text = "Error message";
      const exitCode = Promise.resolve(1);

      const res = parseArgumentsShellResponseOptions([text, { exitCode }]);

      expect(res.exitCode).toBe(exitCode);
      expect(res.stdio?.stdout).toBeInstanceOf(ReadableStream);
      expect(res.stdio?.stderr).toBeUndefined();
    });

    test("should convert string to ReadableStream and set stderr", () => {
      const text = "Standard output";
      const stderr = new ReadableStream();

      const res = parseArgumentsShellResponseOptions([
        text,
        { stdio: { stderr } },
      ]);

      expect(res.exitCode).toBeUndefined();
      expect(res.stdio?.stdout).toBeInstanceOf(ReadableStream);
      expect(res.stdio?.stderr).toBe(stderr);
    });
  });

  describe("object as first argument", () => {
    test("should handle object with stdout only", () => {
      const stdout = new ReadableStream();

      const res = parseArgumentsShellResponseOptions([{ stdio: { stdout } }]);

      expect(res.exitCode).toBeUndefined();
      expect(res.stdio?.stdout).toBe(stdout);
      expect(res.stdio?.stderr).toBeUndefined();
    });

    test("should handle object with stderr only", () => {
      const stderr = new ReadableStream();

      const res = parseArgumentsShellResponseOptions([{ stdio: { stderr } }]);

      expect(res.exitCode).toBeUndefined();
      expect(res.stdio?.stdout).toBeUndefined();
      expect(res.stdio?.stderr).toBe(stderr);
    });

    test("should handle object with both stdout and stderr", () => {
      const stdout = new ReadableStream();
      const stderr = new ReadableStream();

      const res = parseArgumentsShellResponseOptions([
        { stdio: { stdout, stderr } },
      ]);

      expect(res.exitCode).toBeUndefined();
      expect(res.stdio?.stdout).toBe(stdout);
      expect(res.stdio?.stderr).toBe(stderr);
    });

    test("should handle object with exitCode only", () => {
      const exitCode = Promise.resolve(42);

      const res = parseArgumentsShellResponseOptions([{ exitCode }]);

      expect(res.exitCode).toBe(exitCode);
      expect(res.stdio?.stdout).toBeUndefined();
      expect(res.stdio?.stderr).toBeUndefined();
    });

    test("should handle object with all properties", () => {
      const stdout = new ReadableStream();
      const stderr = new ReadableStream();
      const exitCode = Promise.resolve(0);

      const res = parseArgumentsShellResponseOptions([
        { exitCode, stdio: { stdout, stderr } },
      ]);

      expect(res.exitCode).toBe(exitCode);
      expect(res.stdio?.stdout).toBe(stdout);
      expect(res.stdio?.stderr).toBe(stderr);
    });
  });

  describe("exitCode handling", () => {
    test("should convert number exitCode to Promise", () => {
      const res = parseArgumentsShellResponseOptions([{ exitCode: 5 }]);

      expect(res.exitCode).toBeInstanceOf(Promise);
      expect(res.exitCode).resolves.toBe(5);
    });

    test("should keep Promise exitCode as is", () => {
      const exitCode = Promise.resolve(10);

      const res = parseArgumentsShellResponseOptions([{ exitCode }]);

      expect(res.exitCode).toBe(exitCode);
    });

    test("should handle zero exitCode", () => {
      const res = parseArgumentsShellResponseOptions([{ exitCode: 0 }]);

      expect(res.exitCode).toBeInstanceOf(Promise);
      expect(res.exitCode).resolves.toBe(0);
    });

    test("should handle negative exitCode", () => {
      const res = parseArgumentsShellResponseOptions([{ exitCode: -1 }]);

      expect(res.exitCode).toBeInstanceOf(Promise);
      expect(res.exitCode).resolves.toBe(-1);
    });
  });

  describe("edge cases", () => {
    test("should handle object with empty stdio", () => {
      const res = parseArgumentsShellResponseOptions([{ stdio: {} }]);

      expect(res.exitCode).toBeUndefined();
      expect(res.stdio?.stdout).toBeUndefined();
      expect(res.stdio?.stderr).toBeUndefined();
    });

    test("should handle empty string as stdout", () => {
      const res = parseArgumentsShellResponseOptions([""]);

      expect(res.stdio?.stdout).toBeInstanceOf(ReadableStream);
      expect(res.exitCode).toBeUndefined();
      expect(res.stdio?.stderr).toBeUndefined();
    });

    test("should prioritize first argument over second argument stderr", () => {
      const firstArgument = new ReadableStream();
      const secondArgStderr = new ReadableStream();

      const res = parseArgumentsShellResponseOptions([
        firstArgument,
        { stdio: { stderr: secondArgStderr } },
      ]);

      expect(res.stdio?.stdout).toBe(firstArgument);
      expect(res.stdio?.stderr).toBe(secondArgStderr);
    });
  });
});

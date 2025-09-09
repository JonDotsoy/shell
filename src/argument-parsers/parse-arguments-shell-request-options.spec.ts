import { describe, test, expect } from "bun:test";
import { parseArgumentsShellRequestOptions } from "./parse-arguments-shell-request-options.js";
import { ShellRequest } from "../shell-request.js";

describe("parseArgumentsShellRequestOptions", () => {
  describe("String command format", () => {
    test("should parse simple string command", () => {
      const result = parseArgumentsShellRequestOptions(["echo hello"]);

      expect(result.command).toEqual("echo hello");
      expect(result.stdin).toBeUndefined();
      expect(result.env).toBeUndefined();
      expect(result.shell).toBeUndefined();
      expect(result.cwd).toBeUndefined();
      expect(result.signal).toBeUndefined();
    });

    test("should parse string command with options", () => {
      const mockStdin = new ReadableStream();
      const mockEnv = { NODE_ENV: "test", PATH: "/usr/bin" };
      const mockSignal = AbortSignal.timeout(1000);

      const result = parseArgumentsShellRequestOptions([
        "npm test",
        {
          stdin: mockStdin,
          env: mockEnv,
          shell: "/bin/bash",
          cwd: "/home/user",
          signal: mockSignal,
        },
      ]);

      expect(result.command).toEqual("npm test");
      expect(result.stdin).toBe(mockStdin);
      expect(result.env).toBe(mockEnv);
      expect(result.shell).toEqual("/bin/bash");
      expect(result.cwd).toEqual("/home/user");
      expect(result.signal).toBe(mockSignal);
    });

    test("should parse string command with partial options", () => {
      const result = parseArgumentsShellRequestOptions([
        "git status",
        {
          env: { GIT_DIR: ".git" },
          cwd: "/repo",
        },
      ]);

      expect(result.command).toEqual("git status");
      expect(result.stdin).toBeUndefined();
      expect(result.env).toEqual({ GIT_DIR: ".git" });
      expect(result.shell).toBeUndefined();
      expect(result.cwd).toEqual("/repo");
      expect(result.signal).toBeUndefined();
    });
  });

  describe("Object command format", () => {
    test("should parse object with command only", () => {
      const result = parseArgumentsShellRequestOptions([{ command: "ls -la" }]);

      expect(result.command).toEqual("ls -la");
      expect(result.stdin).toBeUndefined();
      expect(result.env).toBeUndefined();
      expect(result.shell).toBeUndefined();
      expect(result.cwd).toBeUndefined();
      expect(result.signal).toBeUndefined();
    });

    test("should parse object with all options", () => {
      const mockStdin = new ReadableStream();
      const mockEnv = { LANG: "en_US.UTF-8" };
      const mockSignal = AbortSignal.timeout(2000);

      const result = parseArgumentsShellRequestOptions([
        {
          command: "python script.py",
          stdin: mockStdin,
          env: mockEnv,
          shell: "/usr/bin/python",
          cwd: "/project",
          signal: mockSignal,
        },
      ]);

      expect(result.command).toEqual("python script.py");
      expect(result.stdin).toBe(mockStdin);
      expect(result.env).toBe(mockEnv);
      expect(result.shell).toEqual("/usr/bin/python");
      expect(result.cwd).toEqual("/project");
      expect(result.signal).toBe(mockSignal);
    });

    test("should parse object with some options", () => {
      const result = parseArgumentsShellRequestOptions([
        {
          command: "make build",
          env: { CC: "gcc" },
          shell: "/bin/sh",
        },
      ]);

      expect(result.command).toEqual("make build");
      expect(result.stdin).toBeUndefined();
      expect(result.env).toEqual({ CC: "gcc" });
      expect(result.shell).toEqual("/bin/sh");
      expect(result.cwd).toBeUndefined();
      expect(result.signal).toBeUndefined();
    });

    test("should parse object with command, signal and custom stdin stream", () => {
      const path = { pathname: "test-script.js" };
      let stdoin: ReadableStreamDefaultController<any>;

      const request = parseArgumentsShellRequestOptions([
        {
          command: `bun ${path.pathname}`,
          signal: AbortSignal.timeout(500),
          stdin: new ReadableStream({
            start(controller) {
              stdoin = controller;
            },
          }),
        },
      ]);

      expect(request.command).toEqual("bun test-script.js");
      expect(request.signal).toBeInstanceOf(AbortSignal);
      expect(request.stdin).toBeInstanceOf(ReadableStream);
      expect(stdoin!).toBeDefined();
      expect(request.env).toBeUndefined();
      expect(request.shell).toBeUndefined();
      expect(request.cwd).toBeUndefined();
    });
  });

  describe("Error cases", () => {
    test("should throw error when command is not a string in object format", () => {
      expect(() => {
        parseArgumentsShellRequestOptions([{ command: 123 as any }]);
      }).toThrow("Command must be a string");
    });

    test("should throw error when command is missing in object format", () => {
      expect(() => {
        parseArgumentsShellRequestOptions([{ env: { TEST: "value" } } as any]);
      }).toThrow("Command must be a string");
    });

    test("should throw error when command is null", () => {
      expect(() => {
        parseArgumentsShellRequestOptions([{ command: null as any }]);
      }).toThrow("Command must be a string");
    });

    test("should throw error when command is undefined", () => {
      expect(() => {
        parseArgumentsShellRequestOptions([{ command: undefined as any }]);
      }).toThrow("Command must be a string");
    });

    test("should throw error when first argument is not string or object", () => {
      expect(() => {
        parseArgumentsShellRequestOptions([123 as any]);
      }).toThrow("Command must be a string");
    });

    test("should throw error when first argument is array", () => {
      expect(() => {
        parseArgumentsShellRequestOptions([["echo", "hello"] as any]);
      }).toThrow("Command must be a string");
    });
  });

  describe("Edge cases", () => {
    test("should handle empty string command", () => {
      const result = parseArgumentsShellRequestOptions([""]);

      expect(result.command).toEqual("");
      expect(result.stdin).toBeUndefined();
    });

    test("should handle command with special characters", () => {
      const result = parseArgumentsShellRequestOptions([
        "echo 'hello world' && ls -la | grep test",
      ]);

      expect(result.command).toEqual(
        "echo 'hello world' && ls -la | grep test",
      );
    });

    test("should handle empty options object", () => {
      const result = parseArgumentsShellRequestOptions(["test command", {}]);

      expect(result.command).toEqual("test command");
      expect(result.stdin).toBeUndefined();
      expect(result.env).toBeUndefined();
      expect(result.shell).toBeUndefined();
      expect(result.cwd).toBeUndefined();
      expect(result.signal).toBeUndefined();
    });

    test("should handle empty env object", () => {
      const result = parseArgumentsShellRequestOptions([
        { command: "echo test", env: {} },
      ]);

      expect(result.command).toEqual("echo test");
      expect(result.env).toEqual({});
    });

    test("should handle null values in options", () => {
      const result = parseArgumentsShellRequestOptions([
        "test command",
        {
          stdin: null as any,
          env: null as any,
          shell: null as any,
          cwd: null as any,
          signal: null as any,
        },
      ]);

      expect(result.command).toEqual("test command");
      expect(result.stdin).toBeNull();
      expect(result.env).toBeNull();
      expect(result.shell).toBeNull();
      expect(result.cwd).toBeNull();
      expect(result.signal).toBeNull();
    });
  });
});

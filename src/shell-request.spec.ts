import { describe, expect, test } from "bun:test";
import { ShellRequest } from "./shell-request";

/**
 * Test suite for ShellRequest class functionality.
 *
 * This test suite validates the ShellRequest class constructor behavior,
 * option handling, and request merging capabilities.
 */
describe("ShellRequest constructor and configuration", () => {
  /**
   * Test case: Validates basic ShellRequest construction with simple command.
   *
   * This test verifies that:
   * 1. A ShellRequest can be created with just a command string
   * 2. The command property is correctly set and accessible
   */
  test("should create ShellRequest with basic command string", async () => {
    const request = new ShellRequest("echo hello");

    expect(request.command).toBe("echo hello");
  });

  /**
   * Test case: Validates ShellRequest merging and option inheritance.
   *
   * This test verifies that:
   * 1. A new ShellRequest can be created from an existing one
   * 2. Options (env, shell) are properly inherited from the base request
   * 3. Specific properties can be overridden while maintaining others
   * 4. Environment variables and shell configurations are preserved
   */
  test("should merge ShellRequest with inherited options and command override", async () => {
    const request = new ShellRequest("pg_dump", {
      env: { PGPASSWORD: `process.env.DB_PASSWORD` },
      shell: "/bin/bash",
    });

    const nextRequest = new ShellRequest(request, {
      command: "pg_dump production_db",
    });

    expect(nextRequest.command).toBe("pg_dump production_db");
    expect(nextRequest.env).toEqual({ PGPASSWORD: `process.env.DB_PASSWORD` });
    expect(nextRequest.shell).toBe("/bin/bash");
  });
});

# Shell Module

The Shell module provides a powerful and flexible API for executing shell commands in Node.js and Bun applications. It offers stream-based command execution with full control over input/output streams, environment variables, working directories, and process lifecycle management.

## Architecture Overview

The Shell module implements a clean wrapper pattern around Node.js child processes to provide a type-safe and stream-first interface:

- **`shell()`** - Core function that accepts flexible input formats and returns a ShellResponse
- **`ShellRequest`** - Input wrapper that encapsulates all command configuration including command text, stdin streams, environment variables, working directory, shell type, and abort signals
- **`ShellResponse`** - Output wrapper that provides structured access to stdout/stderr streams via ReadableTools and process exit codes
- **`ReadableTools`** - Advanced stream utility class with methods for text/JSON parsing, stream tapping, and async iteration
- This wrapper approach abstracts child process complexity while maintaining full control over streams, environment, and execution context

## Why This Module Exists

Traditional Node.js approaches to shell command execution often fall short when dealing with complex scenarios involving streaming data, environment management, process lifecycle control, and execution context isolation. While `child_process.exec()`, `child_process.spawn()`, and similar APIs work for simple cases, they become cumbersome when you need:

- Fine-grained control over input/output streams with real-time processing
- Stream tapping and mirroring capabilities for logging and monitoring
- Type-safe command configuration and response handling
- Flexible input formats (strings, objects, or class instances)
- Robust timeout and cancellation mechanisms using AbortSignal
- Environment variable isolation and management
- Command chaining and piping scenarios
- Modern Promise-based APIs with proper error handling

This module was created to bridge that gap by providing a modern, stream-first approach to shell command execution built on web standards. It enables developers to work with commands as composable units that can be chained, monitored, tapped, and controlled with precision. Whether you're building development tools, CI/CD pipelines, data processing workflows, or applications that need sophisticated interaction with system commands, this module provides the flexibility, reliability, and type safety you need without sacrificing performance.

## Table of Contents

- [Why This Module Exists](#why-this-module-exists)
- [Overview](#overview)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
- [Examples](#examples)
- [Advanced Usage](#advanced-usage)

## Overview

The shell module consists of several key components that implement a clean wrapper pattern around child process communication:

- **`shell()`** - Core function for executing shell commands with flexible input formats
- **`ShellRequest`** - Input wrapper class that encapsulates command configuration and validates all input parameters
- **`ShellResponse`** - Output wrapper class that encapsulates stdout/stderr streams via ReadableTools and exit codes
- **`ReadableTools`** - Advanced utilities for working with ReadableStream instances, including tapping, parsing, and iteration

### Flexible Input Patterns

The `shell()` function accepts multiple input formats for maximum flexibility:

```typescript
// String command (simplest)
shell("echo hello");

// String with options object
shell("echo hello", { cwd: "/path", env: { VAR: "value" } });

// Options object with command
shell({ command: "echo hello", cwd: "/path" });

// ShellRequest instance (most control)
shell(new ShellRequest("echo hello", { cwd: "/path" }));
```

### Await Shell Syntax

The `shell()` function returns a `ShellResponse` that implements the thenable pattern, making it directly awaitable. When you await a `ShellResponse`, it automatically waits for command completion and returns an `AwaitedShellResponse` instance with the resolved exit code:

```typescript
// Traditional approach - manual promise handling
const response = shell("echo hello");
const output = await response.text();
const exitCode = await response.exitCode;

// New await syntax - automatic command completion
const result = await shell("echo hello");
console.log(result.exitCode); // Already resolved number, not a Promise
console.log(await result.text()); // Same stream methods available
```

**Key differences with `await shell(...)`:**

- **Automatic waiting**: The command execution is automatically awaited
- **Resolved exit code**: `exitCode` is a number instead of a Promise
- **Same stream access**: stdout, stderr, and utility methods remain available
- **Error handling**: Command failures can be caught with try/catch blocks

```typescript
try {
  const result = await shell("npm test");
  if (result.exitCode === 0) {
    console.log("Tests passed!");
  } else {
    console.log("Tests failed with exit code:", result.exitCode);
  }
} catch (error) {
  console.error("Command execution failed:", error);
}
```

### Stream-First Architecture

The library is built around web-standard ReadableStream and WritableStream APIs:

1. **Input Layer (`ShellRequest`)**: Handles and validates all input configuration:
   - Command string and shell type specification
   - Input streams (stdin) for data piping
   - Environment variables and working directory
   - AbortSignal for timeout and cancellation control

2. **Output Layer (`ShellResponse`)**: Structures and enhances all process output:
   - ReadableTools-wrapped stdout and stderr streams
   - Process exit codes with proper error handling
   - Convenience methods for text/JSON parsing
   - Verbose logging with stream tapping capabilities

3. **Stream Processing (`ReadableTools`)**: Advanced stream manipulation:
   - Non-destructive stream tapping for logging/monitoring
   - Text and JSON parsing with proper encoding handling
   - Async iteration over stream chunks
   - Method chaining for fluent APIs

This pattern ensures type safety, provides a consistent API, and abstracts the complexity of managing child process lifecycle and stream handling while maintaining the full power of Node.js streams.

## Quick Start

### Basic Command Execution

```typescript
import { shell } from "@jondotsoy/shell";

// Simple command execution (traditional)
const response = shell('echo "Hello World"');
const output = await response.text();
console.log(output); // "Hello World"

// Simple command execution (await syntax)
const result = await shell('echo "Hello World"');
const output = await result.text();
console.log(output); // "Hello World"
console.log(result.exitCode); // 0 (already resolved)
```

### Using shell() with Custom Configuration

```typescript
import { shell } from "@jondotsoy/shell";

// Execute command with custom environment and working directory
const response = shell("pwd", {
  cwd: "/path/to/project",
  env: { NODE_ENV: "production" },
  shell: "/bin/bash",
});

console.log(await response.text()); // /path/to/project
```

### Using shell() with Timeout

```typescript
import { shell } from "@jondotsoy/shell";

// Create an AbortSignal with timeout
const signal = AbortSignal.timeout(5000); // 5 seconds

// Traditional approach
const response = shell("sleep 10", { signal }); // Will be aborted after 5 seconds

try {
  await response.exitCode;
} catch (error) {
  if (error.name === "AbortError") {
    console.log("Command timed out");
  }
}

// Await syntax
try {
  const result = await shell("sleep 10", { signal });
  console.log("Command completed with exit code:", result.exitCode);
} catch (error) {
  if (error.name === "AbortError") {
    console.log("Command timed out");
  }
}
```

### Using ShellRequest

```typescript
import { shell, ShellRequest } from "@jondotsoy/shell";

// Create a reusable shell request
const request = new ShellRequest("echo 'Hello from request'", {
  env: { MY_VAR: "test" },
  shell: "/bin/bash",
});

const response = shell(request);
console.log(await response.text()); // Hello from request
```

## API Reference

### `shell(...requestOptions)`

Executes a shell command with flexible input formats and returns a `ShellResponse`.

**Parameters:**

The function accepts multiple input patterns via rest parameters:

- **String format**: `shell("command")`
- **String with options**: `shell("command", options)`
- **Object format**: `shell({ command: "command", ...options })`
- **ShellRequest instance**: `shell(new ShellRequest(...))`

**Options object properties:**

- `stdin` (ReadableStream, optional) - Input stream to pipe to the command
- `env` (Record<string, string>, optional) - Environment variables for the command
- `shell` (string, optional) - Shell to use for execution (defaults to "/bin/sh")
- `cwd` (string | URL, optional) - Working directory for the command
- `signal` (AbortSignal, optional) - Signal to abort the command execution

**Returns:** `ShellResponse`

**Examples:**

```typescript
// All these formats are equivalent:
const response1 = shell("echo hello");
const response2 = shell("echo hello", { cwd: "/tmp" });
const response3 = shell({ command: "echo hello", cwd: "/tmp" });
const response4 = shell(new ShellRequest("echo hello", { cwd: "/tmp" }));
```

### `ShellRequest`

Represents a shell command request with all necessary configuration. Handles input validation and parameter parsing.

#### Constructor

```typescript
new ShellRequest(...options: ShellRequestOptions)
```

**Accepts the same flexible input formats as the `shell()` function:**

- `new ShellRequest("command")`
- `new ShellRequest("command", { options })`
- `new ShellRequest({ command: "command", ...options })`

#### Properties

- `command` (string) - The command to execute
- `stdin` (ReadableStream | undefined) - Input stream to pipe to the command
- `env` (Record<string, string> | undefined) - Environment variables for the command
- `shell` (string | undefined) - Shell to use for execution
- `cwd` (string | URL | undefined) - Working directory for the command
- `signal` (AbortSignal | undefined) - Signal to abort the command execution

### `ShellResponse`

Represents the result of command execution with enhanced stream handling capabilities.

#### Properties

- `exitCode` (Promise<number>) - Promise resolving to process exit code
- `stdout` (ReadableTools) - Enhanced standard output stream
- `stderr` (ReadableTools) - Enhanced standard error stream

#### Methods

##### `text()`

Returns stdout content as text (convenience method).

```typescript
const output = await response.text();
```

##### `json()`

Parses stdout content as JSON (convenience method).

```typescript
const data = await response.json();
```

##### `verbose()`

Enables console logging of stdout/stderr while preserving streams using tapping.

```typescript
const response = shell("npm install").verbose();
await response.exitCode; // Output will be logged to console
```

### `AwaitedShellResponse`

Represents the resolved result when awaiting a `ShellResponse`. This class is returned when you use `await shell(...)` syntax.

#### Properties

- `exitCode` (number) - The resolved process exit code (not a Promise)
- `stdout` (ReadableTools) - Enhanced standard output stream
- `stderr` (ReadableTools) - Enhanced standard error stream

#### Methods

##### `text()`

Returns stdout content as text (convenience method).

```typescript
const result = await shell("echo hello");
const output = await result.text();
```

##### `json()`

Parses stdout content as JSON (convenience method).

```typescript
const result = await shell("npm list --json");
const data = await result.json();
```

**Key difference from ShellResponse:**

- `exitCode` is already resolved as a number, not a Promise
- All stream methods work the same way
- Represents a completed command execution state

### `ReadableTools`

Enhanced utility class for working with ReadableStream instances, providing advanced stream processing capabilities.

#### Properties

- `readable` (ReadableStream) - The underlying ReadableStream

#### Methods

##### `text()`

Reads entire stream as text with proper encoding.

```typescript
const content = await readableTools.text();
```

##### `json()`

Reads and parses stream as JSON.

```typescript
const data = await readableTools.json();
```

##### `tap(writable)`

Taps into the readable stream, sending a copy of all data to a writable stream while maintaining the original stream flow. This creates a non-destructive "tee" operation where data flows to both the provided writable stream and continues in the original stream.

**Key features:**

- Non-destructive: Original stream remains fully functional
- Real-time: Data is copied as it flows through
- Error handling: Properly propagates errors to both streams
- Method chaining: Returns `this` for fluent APIs

```typescript
// Save stream data to file while continuing to process
const fileStream = new WritableStream({
  write(chunk) {
    // Write to file system
    fs.writeSync(fd, chunk);
  },
});

// Data flows to both file and JSON parser
const data = await readableTools.tap(fileStream).json();
```

##### `static iterable(stream)`

Creates an async iterable from a ReadableStream for chunk-by-chunk processing.

```typescript
for await (const chunk of ReadableTools.iterable(stream)) {
  // Process each chunk as it arrives
  console.log("Received chunk:", chunk);
}
```

## Examples

### Command with Timeout and Signal

```typescript
// Using AbortSignal for manual control
const controller = new AbortController();
const response = shell("long-running-command", {
  signal: controller.signal,
});

// Cancel the command after 3 seconds
setTimeout(() => controller.abort(), 3000);

try {
  const output = await response.text();
  console.log(output);
} catch (error) {
  if (error.name === "AbortError") {
    console.log("Command was cancelled");
  }
}
```

### Command with Custom Environment

```typescript
const response = shell("echo $MY_VAR", {
  env: { MY_VAR: "Hello from env!" },
});

const output = await response.text();
console.log(output); // "Hello from env!"
```

### Handling Command Errors

```typescript
// Traditional approach
const response = shell("nonexistent-command");

try {
  const exitCode = await response.exitCode;
  if (exitCode !== 0) {
    const errorOutput = await response.stderr.text();
    console.error("Command failed:", errorOutput);
  }
} catch (error) {
  console.error("Execution error:", error);
}

// Await syntax approach
try {
  const result = await shell("nonexistent-command");
  if (result.exitCode !== 0) {
    const errorOutput = await result.stderr.text();
    console.error("Command failed:", errorOutput);
  }
} catch (error) {
  console.error("Execution error:", error);
}
```

### Streaming Command Output

```typescript
const response = shell('find /large/directory -name "*.js"');

// Process output as it arrives
for await (const chunk of ReadableTools.iterable(response.stdout.stream)) {
  const text = new TextDecoder().decode(chunk);
  console.log("Found:", text.trim());
}
```

### Stream Tapping and Monitoring

```typescript
// Monitor command output while saving to multiple destinations
const logFile = new WritableStream({
  write(chunk) {
    const text = new TextDecoder().decode(chunk);
    console.log(`[LOG] ${text.trim()}`);
    // Write to file system
  },
});

const metricsCollector = new WritableStream({
  write(chunk) {
    // Collect metrics from output
    collectMetrics(chunk);
  },
});

// Data flows to both log file and metrics collector, then to JSON parser
const response = shell("npm list --json");
const packageInfo = await response.stdout
  .tap(logFile)
  .tap(metricsCollector)
  .json();

console.log("Dependencies:", Object.keys(packageInfo.dependencies || {}));
```

### Command Chaining and Piping

```typescript
// Chain commands using stdout as stdin for next command
const findFiles = shell("find . -name '*.txt'", { cwd: "/project" });
const calculateChecksums = shell("shasum -a 256", {
  stdin: findFiles.stdout.readable,
  cwd: "/project",
});
const displayResults = shell("cat", {
  stdin: calculateChecksums.stdout.readable,
});

// Monitor the final output
await displayResults.verbose().exitCode;
```

### Real-time Stream Processing

```typescript
const response = shell("tail -f /var/log/application.log");

// Process log entries as they arrive
for await (const chunk of ReadableTools.iterable(response.stdout.readable)) {
  const text = new TextDecoder().decode(chunk);
  const lines = text.split("\n").filter((line) => line.trim());

  for (const line of lines) {
    if (line.includes("ERROR")) {
      console.error("🚨 Error detected:", line);
      // Send alert
    } else if (line.includes("WARNING")) {
      console.warn("⚠️ Warning:", line);
    }
  }
}
```

### Piping Input to Command

```typescript
const input = new ReadableStream({
  start(controller) {
    controller.enqueue(new TextEncoder().encode("line 1\n"));
    controller.enqueue(new TextEncoder().encode("line 2\n"));
    controller.close();
  },
});

const response = shell("wc -l", { stdin: input });
const count = await response.text();
console.log("Line count:", count.trim()); // "2"
```

### Working with Different Shells

```typescript
// Using zsh
const response = shell("echo $SHELL", {
  shell: "/bin/zsh",
  cwd: "/Users/username",
});

console.log(await response.text()); // "/bin/zsh"
```

### Command Execution with Timeout

```typescript
// Create command with timeout using AbortSignal
const signal = AbortSignal.timeout(10000); // 10 seconds

const response = shell("npm install", {
  cwd: "/path/to/project",
  signal,
});

try {
  await response.exitCode;
  console.log("Installation completed");
} catch (error) {
  if (error.name === "AbortError") {
    console.log("Installation timed out after 10 seconds");
  }
}
```

### Batch Operations

```typescript
// Multiple related commands with shared configuration (traditional)
const baseOptions = {
  cwd: "/path/to/project",
  env: { NODE_ENV: "production" },
};

const commands = ["git status", "npm test", "npm run build"];

for (const command of commands) {
  console.log(`Running: ${command}`);
  const response = shell(command, baseOptions).verbose();
  const exitCode = await response.exitCode;

  if (exitCode !== 0) {
    console.error(`Command failed with exit code ${exitCode}`);
    break;
  }
}

// Using await syntax
for (const command of commands) {
  console.log(`Running: ${command}`);
  try {
    const result = await shell(command, baseOptions).verbose();
    if (result.exitCode !== 0) {
      console.error(`Command failed with exit code ${result.exitCode}`);
      break;
    }
  } catch (error) {
    console.error(`Command failed with error:`, error);
    break;
  }
}
```

### JSON Processing

```typescript
// Traditional approach
const response = shell("npm list --json --depth=0");
const packageInfo = await response.json();

console.log("Dependencies:", Object.keys(packageInfo.dependencies || {}));

// Await syntax
const result = await shell("npm list --json --depth=0");
const packageInfo = await result.json();

console.log("Dependencies:", Object.keys(packageInfo.dependencies || {}));
console.log("Command exit code:", result.exitCode);
```

## Advanced Usage

### Using Await Syntax for Simplified Error Handling

The `await shell(...)` syntax provides cleaner error handling patterns and automatic command completion:

```typescript
import { shell } from "@jondotsoy/shell";

// Complex workflow with await syntax
async function deployApplication() {
  try {
    // All commands automatically wait for completion
    const testResult = await shell("npm test");
    console.log(`Tests completed with exit code: ${testResult.exitCode}`);

    if (testResult.exitCode !== 0) {
      throw new Error("Tests failed");
    }

    const buildResult = await shell("npm run build");
    console.log(`Build completed with exit code: ${buildResult.exitCode}`);

    if (buildResult.exitCode !== 0) {
      throw new Error("Build failed");
    }

    const deployResult = await shell("npm run deploy");
    console.log(`Deploy completed with exit code: ${deployResult.exitCode}`);

    return deployResult.exitCode === 0;
  } catch (error) {
    if (error.name === "AbortError") {
      console.error("Operation timed out");
    } else {
      console.error("Deployment failed:", error.message);
    }
    return false;
  }
}

// Usage
const success = await deployApplication();
console.log("Deployment", success ? "succeeded" : "failed");
```

### Advanced Timeout and Signal Handling

```typescript
import { shell, ShellRequest } from "@jondotsoy/shell";

// Method 1: Using AbortSignal.timeout for automatic timeout (traditional)
const response1 = shell("long-running-command", {
  signal: AbortSignal.timeout(10000), // 10 seconds
});

// Method 1: Using await syntax
try {
  const result1 = await shell("long-running-command", {
    signal: AbortSignal.timeout(10000),
  });
  console.log("Command completed:", result1.exitCode);
} catch (error) {
  if (error.name === "AbortError") {
    console.log("Command timed out");
  }
}

// Method 2: Manual control with AbortController
const controller = new AbortController();
const response2 = shell("another-command", {
  signal: controller.signal,
});

// Cancel after 5 seconds or on some condition
setTimeout(() => controller.abort(), 5000);

// Method 3: Using ShellRequest for complex scenarios
const request = new ShellRequest("complex-command", {
  cwd: "/specific/directory",
  env: { NODE_ENV: "production", TIMEOUT: "30" },
  shell: "/bin/bash",
  signal: AbortSignal.timeout(30000),
});

const response3 = shell(request);

// Handle all timeout scenarios with traditional approach
try {
  const result = await Promise.race([
    response3.text(),
    response2.text(),
    response1.text(),
  ]);
  console.log("First command completed:", result);
} catch (error) {
  if (error.name === "AbortError") {
    console.log("Command timed out or was cancelled");
  } else {
    console.error("Command failed:", error);
  }
}

// Await syntax approach for multiple commands
const commands = [
  shell("command1", { signal: AbortSignal.timeout(10000) }),
  shell("command2", { signal: AbortSignal.timeout(15000) }),
  shell("command3", { signal: AbortSignal.timeout(20000) }),
];

try {
  const results = await Promise.all(commands);
  results.forEach((result, index) => {
    console.log(`Command ${index + 1} exit code:`, result.exitCode);
  });
} catch (error) {
  console.error("One or more commands failed:", error);
}
```

### Environment and Shell Configuration

```typescript
// Different shell configurations
const bashResponse = shell("echo $SHELL", {
  shell: "/bin/bash",
  env: { CUSTOM_VAR: "bash-value" },
});

const zshResponse = shell("echo $SHELL", {
  shell: "/bin/zsh",
  env: { CUSTOM_VAR: "zsh-value" },
});

// Working with different environments
const prodEnv = {
  NODE_ENV: "production",
  DATABASE_URL: "prod-db-url",
  LOG_LEVEL: "info",
};

const devEnv = {
  NODE_ENV: "development",
  DATABASE_URL: "dev-db-url",
  LOG_LEVEL: "debug",
};

const prodResponse = shell("npm start", { env: prodEnv });
const devResponse = shell("npm run dev", { env: devEnv });
```

### Error Handling and Exit Code Management

```typescript
async function robustExecute(command: string, options = {}) {
  try {
    const response = shell(command, {
      signal: AbortSignal.timeout(30000), // 30 second timeout
      ...options,
    });

    // Get both output and exit code
    const [output, stderr, exitCode] = await Promise.all([
      response.stdout.text(),
      response.stderr.text(),
      response.exitCode,
    ]);

    if (exitCode === 0) {
      return {
        success: true,
        output,
        stderr: stderr || null,
        exitCode,
      };
    } else {
      return {
        success: false,
        output,
        error: stderr || `Command failed with exit code ${exitCode}`,
        exitCode,
      };
    }
  } catch (error) {
    if (error.name === "AbortError") {
      return {
        success: false,
        output: null,
        error: "Command timed out",
        exitCode: null,
      };
    }

    return {
      success: false,
      output: null,
      error: error.message,
      exitCode: null,
    };
  }
}

// Usage
const result = await robustExecute("npm test", { cwd: "/project" });
if (result.success) {
  console.log("Tests passed:", result.output);
} else {
  console.error("Tests failed:", result.error);
}
```

## Type Safety and TypeScript Support

The module is fully typed with comprehensive TypeScript definitions, providing excellent IDE support and compile-time error checking:

```typescript
import {
  shell,
  ShellRequest,
  ShellResponse,
  AwaitedShellResponse,
  ReadableTools,
} from "@jondotsoy/shell";

// Types are automatically inferred
const response: ShellResponse = shell("echo test");
const output: Promise<string> = response.text();
const exitCode: Promise<number> = response.exitCode;
const stdout: ReadableTools = response.stdout;

// Await syntax types
const result: AwaitedShellResponse = await shell("echo test");
const resolvedExitCode: number = result.exitCode; // Already resolved
const awaitedOutput: Promise<string> = result.text();

// Generic type support for JSON parsing
interface PackageInfo {
  name: string;
  version: string;
  dependencies?: Record<string, string>;
}

const packageResponse = shell("npm list --json --depth=0");
const packageInfo: PackageInfo = await packageResponse.json();

// Using await syntax for JSON parsing
const awaitedResult = await shell("npm list --json --depth=0");
const packageData: PackageInfo = await awaitedResult.json();

// Type-safe request construction
const request: ShellRequest = new ShellRequest("echo hello", {
  cwd: "/tmp" as string | URL,
  env: { VAR: "value" } as Record<string, string>,
  signal: AbortSignal.timeout(5000) as AbortSignal,
});
```

## Performance Considerations

### Stream Processing

- Streams are processed in real-time without buffering entire output in memory
- Use `ReadableTools.iterable()` for chunk-by-chunk processing of large outputs
- The `tap()` method creates efficient stream branching without data duplication

### Memory Management

- Streams are automatically cleaned up when processes exit
- Use AbortSignal for proper cancellation and resource cleanup
- Large outputs are handled efficiently through streaming APIs

### Concurrency

- Multiple commands can run concurrently
- Use Promise.all() for parallel execution
- Each command runs in its own isolated process context
- The await syntax works seamlessly with Promise combinators

```typescript
// Efficient parallel execution (traditional)
const [status, tests, build] = await Promise.all([
  shell("git status").text(),
  shell("npm test").exitCode,
  shell("npm run build").exitCode,
]);

// Efficient parallel execution (await syntax)
const [statusResult, testResult, buildResult] = await Promise.all([
  shell("git status"),
  shell("npm test"),
  shell("npm run build"),
]);

console.log("Git status:", await statusResult.text());
console.log("Test exit code:", testResult.exitCode);
console.log("Build exit code:", buildResult.exitCode);
```

## Platform Support

- **Node.js**: Full support (v18+)
- **Bun**: Full support with enhanced performance
- **Deno**: Compatible with Node.js compatibility layer
- **Platforms**: macOS, Linux, Windows (with appropriate shell configuration)

## Notes and Best Practices

- **Shell Defaults**: Commands default to `/bin/sh` but can be customized per command
- **Environment Variables**: Inherited from `process.env` by default, can be overridden or extended
- **Working Directory**: Can be specified using the `cwd` option with string or URL paths
- **Stream Management**: All streams are properly managed and cleaned up automatically
- **Data Handling**: Supports both text and binary data streams with proper encoding
- **Timeout Handling**: Use `AbortSignal.timeout()` for automatic timeouts, `AbortController` for manual control
- **Error Propagation**: Errors are properly propagated through the Promise chain
- **Type Safety**: Full TypeScript support with proper type inference and generic support
- **Performance**: Stream-first architecture ensures minimal memory usage for large outputs
- **Cross-Platform**: Works across different operating systems with proper shell configuration

# Shell Module

The Shell module provides a powerful and flexible API for executing shell commands in Node.js applications. It offers stream-based command execution with full control over input/output streams, environment variables, and working directories.

## Architecture Overview

The Shell module implements a wrapper pattern around Node.js child processes to provide a clean and type-safe interface:

- **`ShellRequest`** wraps all input traffic and configuration for child processes, including command text, stdin streams, environment variables, working directory, and execution context
- **`ShellResponse`** wraps all output traffic from child processes, providing structured access to stdout, stderr streams, and exit codes
- This wrapper approach abstracts the complexity of child process management while maintaining full control over streams and execution context

## Why This Module Exists

Traditional Node.js approaches to shell command execution often fall short when dealing with complex scenarios involving streaming data, environment management, and execution context isolation. While `child_process.exec()` and similar APIs work for simple cases, they become cumbersome when you need fine-grained control over input/output streams, environment variables, or when working with multiple related commands in a specific context.

This module was created to bridge that gap by providing a modern, stream-first approach to shell command execution. It enables developers to work with commands as composable units that can be chained, monitored, and controlled with precision. Whether you're building development tools, CI/CD pipelines, or applications that need to interact with system commands, this module provides the flexibility and reliability you need without sacrificing performance or type safety.

## Table of Contents

- [Why This Module Exists](#why-this-module-exists)
- [Overview](#overview)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
- [Examples](#examples)
- [Advanced Usage](#advanced-usage)

## Overview

The shell module consists of several key components that implement a wrapper pattern around child process communication:

- **`shell()`** - Core function for executing shell commands
- **`ShellRequest`** - Input wrapper that encapsulates command configuration and stdin traffic for child processes
- **`ShellResponse`** - Output wrapper that encapsulates stdout/stderr streams and exit codes from child processes
- **`ReadableTools`** - Utilities for working with streams
- **`StdioStream`** - Container for stdout/stderr streams

### Wrapper Pattern Implementation

The library uses a two-layer wrapper approach:

1. **Input Layer (`ShellRequest`)**: Wraps and validates all input parameters before creating the child process:
   - Command string and shell configuration
   - Input streams (stdin) that will be piped to the process
   - Environment variables and working directory
   - Abort signals for timeout and cancellation control

2. **Output Layer (`ShellResponse`)**: Wraps and structures all output from the child process:
   - Standard output (stdout) and error (stderr) streams
   - Process exit codes and completion status
   - Convenience methods for text and JSON parsing
   - Verbose logging capabilities

This pattern ensures type safety, provides a consistent API, and abstracts the complexity of managing child process lifecycle and stream handling.

## Quick Start

### Basic Command Execution

```typescript
import { shell } from "@jondotsoy/shell";

// Simple command execution
const response = shell('echo "Hello World"');
const output = await response.text();
console.log(output); // "Hello World"
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

// Command will timeout after 5 seconds
const response = shell("sleep 10", { signal }); // Will be aborted after 5 seconds

try {
  await response.exitCode;
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

### `shell(command, options?)`

Executes a shell command and returns a `ShellResponse`.

**Parameters:**

- `command` (string) - Command to execute
- `options` (object, optional) - Additional configuration
  - `stdin` (ReadableStream, optional) - Input stream to pipe to the command
  - `env` (Record<string, string>, optional) - Environment variables for the command
  - `shell` (string, optional) - Shell to use for execution
  - `cwd` (string, optional) - Working directory for the command
  - `signal` (AbortSignal, optional) - Signal to abort the command execution

**Returns:** `ShellResponse`

**Syntax:**

```typescript
const response = shell("your-command", {
  stdin: yourInputStream, // Optional
  env: { MY_VAR: "Hello from env!" }, // Optional
  shell: "/bin/bash", // Optional
  cwd: "/path/to/working/dir", // Optional
  signal: controller.signal, // Optional
});

const response = shell({
  command: "your-command",
  stdin: yourInputStream, // Optional
  env: { MY_VAR: "Hello from env!" }, // Optional
  shell: "/bin/bash", // Optional
  cwd: "/path/to/working/dir", // Optional
  signal: controller.signal, // Optional
});

const response = shell(
  new ShellRequest("your-command", {
    stdin: yourInputStream, // Optional
    env: { MY_VAR: "Hello from env!" }, // Optional
    shell: "/bin/bash", // Optional
    cwd: "/path/to/working/dir", // Optional
    signal: controller.signal, // Optional
  }),
);
```

### `ShellRequest`

Represents a shell command request with all necessary configuration.

#### Constructor

```typescript
new ShellRequest(command: string, options?: ShellRequestOptions)
new ShellRequest(options: ShellRequestObjectOptions)
```

**Parameters:**

- `command` (string) - Command to execute
- `options` (object, optional) - Additional configuration
  - `stdin` (ReadableStream, optional) - Input stream to pipe to the command
  - `env` (Record<string, string>, optional) - Environment variables for the command
  - `shell` (string, optional) - Shell to use for execution
  - `cwd` (string, optional) - Working directory for the command
  - `signal` (AbortSignal, optional) - Signal to abort the command execution

### `ShellResponse`

Represents the result of command execution.

#### Properties

- `exitCode` (Promise<number>) - Promise resolving to exit code
- `stdout` (ReadableTools) - Standard output stream
- `stderr` (ReadableTools) - Standard error stream

#### Methods

##### `text()`

Returns stdout content as text.

```typescript
const output = await response.text();
```

##### `json()`

Parses stdout content as JSON.

```typescript
const data = await response.json();
```

##### `verbose()`

Enables console logging of stdout/stderr while preserving streams.

```typescript
const response = shell("npm install").verbose();
```

### `ReadableTools`

Utility class for working with ReadableStream instances.

#### Properties

- `readable` (ReadableStream) - The underlying ReadableStream

#### Methods

##### `text()`

Reads entire stream as text.

```typescript
const content = await readableTools.text();
```

##### `json()`

Reads and parses stream as JSON.

```typescript
const data = await readableTools.json();
```

##### `static iterable(stream)`

Creates an async iterable from a ReadableStream.

```typescript
for await (const chunk of ReadableTools.iterable(stream)) {
  // Process chunk
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
// Multiple related commands with shared configuration
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
```

### JSON Processing

```typescript
const response = shell("npm list --json --depth=0");
const packageInfo = await response.json();

console.log("Dependencies:", Object.keys(packageInfo.dependencies || {}));
```

## Advanced Usage

### Timeout and Signal Handling

```typescript
import { ShellRequest } from "@jondotsoy/shell";

// Create a request with custom timeout
const signal = AbortSignal.timeout(5000); // 5 seconds
const request = new ShellRequest("complex-command", {
  cwd: "/specific/directory",
  env: { NODE_ENV: "production" },
  shell: "/bin/bash",
  signal: signal,
});

const response = shell(request);

try {
  const result = await response.text();
  console.log("Command completed:", result);
} catch (error) {
  if (error.name === "AbortError") {
    console.log("Command timed out");
  }
}
```

### Custom Shell Request Configuration

```typescript
import { ShellRequest } from "@jondotsoy/shell";

const request = new ShellRequest("complex-command", {
  cwd: "/specific/directory",
  env: { NODE_ENV: "production" },
  shell: "/bin/bash",
});

const response = shell(request);
```

### Combining Streams

```typescript
const response1 = shell('echo "data1"');
const response2 = shell('echo "data2"');

const combined = new StdioStream({
  stdout: response1.stdout.stream,
  stderr: response2.stderr.stream,
});
```

### Timeout Handling

Commands can be configured with timeouts using `AbortSignal`:

1. **AbortSignal.timeout()**: Create a signal with specific timeout
2. **Manual AbortController**: Programmatic control over cancellation

```typescript
// Method 1: AbortSignal timeout
const response = shell("command", { signal: AbortSignal.timeout(10000) });

// Method 2: Manual control
const controller = new AbortController();
const response2 = shell("command", { signal: controller.signal });
setTimeout(() => controller.abort(), 5000);
```

### Error Handling Best Practices

```typescript
async function safeExecute(command: string, timeout?: number) {
  try {
    const options = timeout ? { signal: AbortSignal.timeout(timeout) } : {};
    const response = shell(command, options);
    const exitCode = await response.exitCode;

    if (exitCode === 0) {
      return {
        success: true,
        output: await response.text(),
        error: null,
      };
    } else {
      return {
        success: false,
        output: await response.stdout.text(),
        error: await response.stderr.text(),
      };
    }
  } catch (error) {
    return {
      success: false,
      output: null,
      error: error.name === "AbortError" ? "Command timed out" : error.message,
    };
  }
}
```

## Type Safety

The module is fully typed with TypeScript, providing excellent IDE support and compile-time error checking:

```typescript
// Types are automatically inferred
const response: ShellResponse = shell("echo test");
const output: Promise<string> = response.text();
const exitCode: Promise<number> = response.exitCode;
```

## Notes

- Commands can be configured with custom timeouts using `AbortSignal.timeout()`
- Environment variables are inherited from `process.env` by default and can be overridden
- Working directory can be specified using the `cwd` option
- All streams are properly managed and cleaned up automatically
- The module handles both text and binary data streams
- Timeout and cancellation are handled gracefully with proper error reporting
- Shell defaults to `/bin/sh` but can be customized per command

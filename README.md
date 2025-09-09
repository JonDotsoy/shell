# @jondotsoy/shell

A powerful and flexible Node.js library for executing shell commands with full control over streams, environment variables, and execution context. Built with TypeScript and designed for modern applications that need reliable shell command execution.

## Features

- 🚀 **Stream-First Approach** - Built around ReadableStream and WritableStream for efficient data handling
- 🛡️ **Type Safety** - Full TypeScript support with comprehensive type definitions
- ⏱️ **Timeout Control** - Built-in support for command timeouts using AbortSignal
- 🔧 **Flexible Configuration** - Customize environment variables, working directory, and shell
- 📦 **Multiple Input Formats** - Accept commands as strings, objects, or ShellRequest instances
- 🔄 **Stream Utilities** - Convenient methods for text, JSON, and stream processing
- 🖥️ **Verbose Mode** - Optional console logging while preserving stream functionality
- 🔁 **Composable Design** - Chain and combine commands with ease
- 🔌 **Wrapper Pattern** - ShellRequest and ShellResponse classes wrap child process input/output traffic

## How It Works

The library implements a wrapper pattern around Node.js child processes:

1. **Input Wrapping**: `ShellRequest` encapsulates all the configuration and input streams needed to spawn and communicate with a child process. This includes command text, stdin data, environment variables, working directory, and execution context.

2. **Output Wrapping**: `ShellResponse` wraps the output streams (stdout, stderr) and exit code from the child process, providing a clean API for consuming command results while maintaining full access to the underlying streams.

3. **Stream Management**: The library automatically handles the conversion between Node.js streams and Web Streams API, providing a modern interface while preserving compatibility and performance.

## Installation

```bash
npm install @jondotsoy/shell
```

```bash
yarn add @jondotsoy/shell
```

```bash
pnpm add @jondotsoy/shell
```

```bash
bun add @jondotsoy/shell
```

## Quick Start

### Basic Usage

```typescript
import { shell } from "@jondotsoy/shell";

// Simple command execution
const response = shell('echo "Hello World"');
const output = await response.text();
console.log(output); // "Hello World"
```

### Advanced Usage

```typescript
import { shell, ShellRequest } from "@jondotsoy/shell";

// Command with custom configuration
const response = shell("npm test", {
  cwd: "/path/to/project",
  env: { NODE_ENV: "test" },
  shell: "/bin/bash",
  signal: AbortSignal.timeout(30000), // 30 second timeout
});

// Enable verbose logging
response.verbose();

// Wait for completion
const exitCode = await response.exitCode;
if (exitCode === 0) {
  console.log("Tests passed!");
} else {
  console.error("Tests failed");
}
```

### Using ShellRequest and ShellResponse Wrappers

```typescript
import { shell, ShellRequest, ShellResponse } from "@jondotsoy/shell";

// Create a reusable command configuration with ShellRequest
const buildRequest = new ShellRequest("npm run build", {
  cwd: "/path/to/project",
  env: { NODE_ENV: "production" },
  shell: "/bin/bash",
});

// Execute the wrapped request
const buildResponse: ShellResponse = shell(buildRequest);

// The response wraps all child process output
console.log("Build output:", await buildResponse.text());
console.log("Build exit code:", await buildResponse.exitCode);

// Access individual streams if needed
const stdoutStream = buildResponse.stdout.readable;
const stderrStream = buildResponse.stderr.readable;
```

### Working with Streams

```typescript
import { shell, ReadableTools } from "@jondotsoy/shell";

// Stream processing
const response = shell('find . -name "*.js"');

// Process output as it arrives
for await (const chunk of ReadableTools.iterable(response.stdout.readable)) {
  const text = new TextDecoder().decode(chunk);
  console.log("Found:", text.trim());
}
```

### Error Handling

```typescript
import { shell } from "@jondotsoy/shell";

const response = shell("some-command");

try {
  const exitCode = await response.exitCode;
  if (exitCode !== 0) {
    const errorOutput = await response.stderr.text();
    console.error("Command failed:", errorOutput);
  }
} catch (error) {
  if (error.name === "AbortError") {
    console.log("Command was cancelled or timed out");
  }
}
```

## API Overview

### Core Functions

- **`shell(command, options?)`** - Execute shell commands
- **`ShellRequest`** - Command configuration container that wraps input traffic to child processes
- **`ShellResponse`** - Command execution result that wraps output traffic from child processes with streams
- **`ReadableTools`** - Stream utility methods
- **`StdioStream`** - Container for stdout/stderr streams

### Architecture

The shell library uses a wrapper-based architecture to handle child process communication:

- **`ShellRequest`** encapsulates all input parameters and configuration needed to execute a command, including the command string, stdin stream, environment variables, working directory, shell type, and abort signals. This wrapper provides a clean interface for configuring how the child process should be started and what input it should receive.

- **`ShellResponse`** wraps the output streams (stdout, stderr) and exit code from the spawned child process. It provides convenient methods for reading and processing the command output while maintaining access to the raw streams for advanced use cases. The response object acts as a bridge between the Node.js child process streams and the application layer.

### Key Features

- **Timeout Support**: Use `AbortSignal.timeout()` for automatic timeouts
- **Environment Control**: Custom environment variables per command
- **Working Directory**: Specify execution context with `cwd` option
- **Shell Selection**: Choose your preferred shell (`/bin/bash`, `/bin/zsh`, etc.)
- **Stream Piping**: Pipe input to commands using `stdin` option
- **JSON Processing**: Built-in JSON parsing from command output
- **Verbose Logging**: Real-time console output while preserving streams

## Use Cases

This library is perfect for:

- **Build Tools** - Creating custom build scripts and automation
- **CI/CD Pipelines** - Reliable command execution with proper error handling
- **Development Tools** - CLIs and development utilities
- **System Administration** - Scripts that need to interact with system commands
- **Testing** - Running external tools and validating their output
- **Process Management** - Starting and controlling external processes

## Why Choose @jondotsoy/shell?

Traditional Node.js approaches like `child_process.exec()` work for simple cases but become cumbersome when you need:

- Fine-grained control over input/output streams
- Proper timeout handling
- Environment variable management
- Type safety and IDE support
- Stream processing capabilities
- Robust error handling

This library provides a modern, stream-first approach that handles these complexities while maintaining simplicity for common use cases.

## Documentation

For comprehensive documentation, examples, and API reference, see the [detailed documentation](./src/README.md).

## Requirements

- Node.js 18 or higher
- TypeScript 5.0 or higher (for TypeScript users)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

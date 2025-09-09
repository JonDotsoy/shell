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
- **`ShellRequest`** - Command configuration container
- **`ShellResponse`** - Command execution result with streams
- **`ReadableTools`** - Stream utility methods
- **`StdioStream`** - Container for stdout/stderr streams

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

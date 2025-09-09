/**
 * Configuration options for shell responses as an object.
 */
export type ShellResponseObjectOptions = {
  /** Standard I/O streams */
  stdio?: {
    /** Standard output stream */
    stdout?: ReadableStream;
    /** Standard error stream */
    stderr?: ReadableStream;
  };
  /** Promise that resolves to the process exit code */
  exitCode?: Promise<number>;
};

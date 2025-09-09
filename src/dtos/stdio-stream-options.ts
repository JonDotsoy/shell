/**
 * Options for configuring stdio streams.
 */
export type StdioStreamOptions = {
  /** Standard output stream */
  stdout?: ReadableStream;
  /** Standard error stream */
  stderr?: ReadableStream;
};

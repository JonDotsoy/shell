/**
 * Utility class for working with ReadableStream instances.
 * Provides convenient methods for reading and parsing stream data.
 */
export class ReadableTools {
  constructor(readonly readable: ReadableStream) {}

  /**
   * Reads the entire stream and returns it as a text string.
   * @returns Promise that resolves to the stream content as text
   */
  text = async (): Promise<string> => {
    const lines = await Array.fromAsync(ReadableTools.iterable(this.readable));
    return lines.join("");
  };

  /**
   * Reads the entire stream and parses it as JSON.
   * @returns Promise that resolves to the parsed JSON object
   */
  json = async (): Promise<any> => {
    return JSON.parse(await this.text());
  };

  /**
   * Creates an async iterable from a ReadableStream.
   * @param stream - The ReadableStream to iterate over
   * @returns Async generator that yields stream chunks
   */
  static async *iterable<T>(stream: ReadableStream<T>): AsyncGenerator<T> {
    const reader = stream.getReader();
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        yield value;
      }
    } finally {
      reader.releaseLock();
    }
  }
}

type ReadableStreamController<T> = {
  enqueue(chunk: T): void;
  error(err: unknown): void;
  close(): void;
};

/**
 * Utility class for working with ReadableStream instances.
 * Provides convenient methods for reading and parsing stream data.
 */
export class ReadableTools {
  #readable: ReadableStream;

  constructor(readable: ReadableStream) {
    this.#readable = readable;
  }

  get readable() {
    return this.#readable;
  }

  /**
   * Taps into the readable stream, sending a copy of all data to a writable stream
   * while maintaining the original stream flow for further operations.
   *
   * This method creates a "tee" or "tap" operation where data flows to both:
   * - The provided writable stream (destination)
   * - A new readable stream that replaces the current one
   *
   * @param writable - The WritableStream to send a copy of the data to
   * @returns This ReadableTools instance for method chaining
   *
   * @example
   * // Tap the stream to save to file while continuing to process
   * tools.tap(fileWriteStream).json()
   */
  tap = (writable: WritableStream) => {
    let tappedStreamController: ReadableStreamController<unknown>;
    const tappedReadableStream = new ReadableStream({
      start(streamController) {
        tappedStreamController = streamController;
      },
    });

    const destinationWriter = writable.getWriter();

    this.#readable.pipeTo(
      new WritableStream({
        write(chunk) {
          destinationWriter.write(chunk);
          tappedStreamController.enqueue(chunk);
        },
        close() {
          destinationWriter.close();
          tappedStreamController.close();
        },
        abort(error) {
          destinationWriter.abort(error);
          tappedStreamController.error(error);
        },
      }),
    );

    this.#readable = tappedReadableStream;

    return this;
  };

  /**
   * Reads the entire stream and returns it as a text string.
   * @returns Promise that resolves to the stream content as text
   */
  text = async (): Promise<string> => {
    const lines = await Array.fromAsync(
      ReadableTools.iterable(this.readable),
      (chunk) => {
        if (chunk instanceof Uint8Array) {
          return new TextDecoder().decode(chunk);
        }
        return String(chunk);
      },
    );
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

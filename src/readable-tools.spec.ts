import { describe, test, expect, mock } from "bun:test";
import { ReadableTools } from "./readable-tools.js";

describe("ReadableTools", () => {
  test("should read stream content as text", async () => {
    const rs = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode("Hello, "));
        controller.enqueue(new TextEncoder().encode("world!"));
        controller.close();
      },
    });

    const readableTools = new ReadableTools(rs);

    const text = await readableTools.text();
    expect(text).toBe("Hello, world!");
  });

  test("should parse stream content as JSON", async () => {
    const rs = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('{"key": "value"}'));
        controller.close();
      },
    });

    const readableTools = new ReadableTools(rs);

    const json = await readableTools.json();
    expect(json).toEqual({ key: "value" });
  });

  test("should tap stream data to writable stream while preserving original flow", async () => {
    const push = mock();

    const rs = new ReadableStream({
      start(controller) {
        controller.enqueue("line1\n");
        controller.enqueue("line2\n");
        controller.enqueue("line3");
        controller.close();
      },
    });

    const readableTools = new ReadableTools(rs);

    readableTools.tap(
      new WritableStream({
        write(chunk) {
          push(chunk);
        },
      }),
    );

    const text = await readableTools.text();

    expect(push).toHaveBeenCalledTimes(3);
    expect(push).toHaveBeenNthCalledWith(1, "line1\n");
    expect(push).toHaveBeenNthCalledWith(2, "line2\n");
    expect(push).toHaveBeenNthCalledWith(3, "line3");
    expect(text).toBe("line1\nline2\nline3");
  });

  test("should immediately start tapping stream data without requiring text() call", async () => {
    const push = mock();

    const rs = new ReadableStream({
      start(controller) {
        controller.enqueue("line1\n");
        controller.enqueue("line2\n");
        controller.enqueue("line3");
        controller.close();
      },
    });

    const readableTools = new ReadableTools(rs);

    readableTools.tap(
      new WritableStream({
        write(chunk) {
          push(chunk);
        },
      }),
    );

    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(push).toHaveBeenCalledTimes(3);
    expect(push).toHaveBeenNthCalledWith(1, "line1\n");
    expect(push).toHaveBeenNthCalledWith(2, "line2\n");
    expect(push).toHaveBeenNthCalledWith(3, "line3");
  });

  test("should allow async iteration over stream chunks using iterable() method", async () => {
    const push = mock();

    const rs = new ReadableStream({
      start(controller) {
        controller.enqueue("line1\n");
        controller.enqueue("line2\n");
        controller.enqueue("line3\n");
        controller.close();
      },
    });

    const readableTools = new ReadableTools(rs);

    for await (const chunk of readableTools.iterable()) {
      push(chunk);
    }

    expect(push).toHaveBeenCalledTimes(3);
    expect(push).toHaveBeenNthCalledWith(1, "line1\n");
    expect(push).toHaveBeenNthCalledWith(2, "line2\n");
    expect(push).toHaveBeenNthCalledWith(3, "line3\n");
  });

  test("should allow async iteration directly over ReadableTools instance", async () => {
    const push = mock();

    const rs = new ReadableStream({
      start(controller) {
        controller.enqueue("line1\n");
        controller.enqueue("line2\n");
        controller.enqueue("line3\n");
        controller.close();
      },
    });

    const readableTools = new ReadableTools(rs);

    for await (const chunk of readableTools) {
      push(chunk);
    }

    expect(push).toHaveBeenCalledTimes(3);
    expect(push).toHaveBeenNthCalledWith(1, "line1\n");
    expect(push).toHaveBeenNthCalledWith(2, "line2\n");
    expect(push).toHaveBeenNthCalledWith(3, "line3\n");
  });
});

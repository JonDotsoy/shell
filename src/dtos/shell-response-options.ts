/**
 * Union type for different ways to specify shell response options.
 */
export type ShellResponseOptions =
  | []
  | [ReadableStream]
  | [string]
  | [
      ReadableStream,
      {
        stdio?: { stderr?: ReadableStream };
        exitCode?: number | Promise<number>;
        pid?: number;
      },
    ]
  | [
      string,
      {
        stdio?: { stderr?: ReadableStream };
        exitCode?: number | Promise<number>;
        pid?: number;
      },
    ]
  | [
      {
        stdio?: { stdout?: ReadableStream; stderr?: ReadableStream };
        exitCode?: number | Promise<number>;
        pid?: number;
      },
    ];

import { describe, test, expect, beforeAll } from "bun:test";
import { tmpdir } from "os";
import fs from "fs";
import { shell as originalShell } from "../src/shell";

const engines = {
  node: {
    Gallium: "16.20.2",
    Hydrogen: "18.20.8",
    Iron: "20.19.5",
    Jod: "22.19.0",
    LTS: "22.19.0",
    Latest: "24.7.0",
  },
  bun: {
    Latest: "1.2.21",
  },
  deno: {
    LTS: "2.4.5",
  },
} as const;

const shell = async (...args: Parameters<typeof originalShell>) => {
  const p = originalShell(...args).verbose();
  if ((await p.exitCode) !== 0) {
    throw new Error(`Command failed: ${await p.exitCode}`);
  }
  return p;
};

const file = (path: URL, content: string) => {
  fs.writeFileSync(path, content);
};

const tarball = new URL(`file:${tmpdir()}/shell-pack-tarball.tgz`);

beforeAll(async () => {
  await shell(
    `
      packageVersion=$(cat package.json | jq -r .version)
      tarballName="jondotsoy-shell-$packageVersion.tgz"
      if [ ! -f "$tarballName" ]
      then
        make rebuild
        npm pack
        cp "$tarballName" "${tarball.pathname}"
      fi
    `,
    {
      cwd: new URL("../", import.meta.url).pathname,
    },
  );
});

test("should work with Node.js Gallium (v16.20.2)", async () => {
  const tmp = new URL(`file:${tmpdir()}/shell-e2e-tests-workspace/`);
  await shell(`rm -rf ${tmp.pathname} && mkdir -p ${tmp.pathname}`);
  file(new URL(`.tool-versions`, tmp), `nodejs ${engines.node.Gallium}`);

  file(
    new URL(`package.json`, tmp),
    JSON.stringify(
      {
        name: "shell-e2e-tests",
        private: true,
        type: "module",
      },
      null,
      2,
    ),
  );
  await shell(`cp ${tarball.pathname} "pack.tgz"`, { cwd: tmp.pathname });
  await shell(`npm install pack.tgz`, { cwd: tmp.pathname });
  file(
    new URL(`index.js`, tmp),
    `
      import { shell, ShellRequest, ShellResponse } from "@jondotsoy/shell";
      if (typeof shell !== "function") {
        throw new Error("shell is not a function");
      }
      if (typeof ShellRequest !== "function") {
        throw new Error("ShellRequest is not a function");
      }
      if (typeof ShellResponse !== "function") {
        throw new Error("ShellResponse is not a function");
      }
    `,
  );
  await shell(`node index.js`, { cwd: tmp.pathname });
});

test("should work with Node.js Hydrogen (v18.20.8)", async () => {
  const tmp = new URL(`file:${tmpdir()}/shell-e2e-tests-workspace/`);
  await shell(`rm -rf ${tmp.pathname} && mkdir -p ${tmp.pathname}`);
  file(new URL(`.tool-versions`, tmp), `nodejs ${engines.node.Hydrogen}`);

  file(
    new URL(`package.json`, tmp),
    JSON.stringify(
      {
        name: "shell-e2e-tests",
        private: true,
        type: "module",
      },
      null,
      2,
    ),
  );
  await shell(`cp ${tarball.pathname} "pack.tgz"`, { cwd: tmp.pathname });
  await shell(`npm install pack.tgz`, { cwd: tmp.pathname });
  file(
    new URL(`index.js`, tmp),
    `
      import { shell, ShellRequest, ShellResponse } from "@jondotsoy/shell";
      if (typeof shell !== "function") {
        throw new Error("shell is not a function");
      }
      if (typeof ShellRequest !== "function") {
        throw new Error("ShellRequest is not a function");
      }
      if (typeof ShellResponse !== "function") {
        throw new Error("ShellResponse is not a function");
      }
    `,
  );
  await shell(`node index.js`, { cwd: tmp.pathname });
});

test("should work with Node.js Iron (v20.19.5)", async () => {
  const tmp = new URL(`file:${tmpdir()}/shell-e2e-tests-workspace/`);
  await shell(`rm -rf ${tmp.pathname} && mkdir -p ${tmp.pathname}`);
  file(new URL(`.tool-versions`, tmp), `nodejs ${engines.node.Iron}`);

  file(
    new URL(`package.json`, tmp),
    JSON.stringify(
      {
        name: "shell-e2e-tests",
        private: true,
        type: "module",
      },
      null,
      2,
    ),
  );
  await shell(`cp ${tarball.pathname} "pack.tgz"`, { cwd: tmp.pathname });
  await shell(`npm install pack.tgz`, { cwd: tmp.pathname });
  file(
    new URL(`index.js`, tmp),
    `
      import { shell, ShellRequest, ShellResponse } from "@jondotsoy/shell";
      if (typeof shell !== "function") {
        throw new Error("shell is not a function");
      }
      if (typeof ShellRequest !== "function") {
        throw new Error("ShellRequest is not a function");
      }
      if (typeof ShellResponse !== "function") {
        throw new Error("ShellResponse is not a function");
      }
    `,
  );
  await shell(`node index.js`, { cwd: tmp.pathname });
});

test("should work with Node.js Jod (v22.19.0)", async () => {
  const tmp = new URL(`file:${tmpdir()}/shell-e2e-tests-workspace/`);
  await shell(`rm -rf ${tmp.pathname} && mkdir -p ${tmp.pathname}`);
  file(new URL(`.tool-versions`, tmp), `nodejs ${engines.node.Jod}`);

  file(
    new URL(`package.json`, tmp),
    JSON.stringify(
      {
        name: "shell-e2e-tests",
        private: true,
        type: "module",
      },
      null,
      2,
    ),
  );
  await shell(`cp ${tarball.pathname} "pack.tgz"`, { cwd: tmp.pathname });
  await shell(`npm install pack.tgz`, { cwd: tmp.pathname });
  file(
    new URL(`index.js`, tmp),
    `
      import { shell, ShellRequest, ShellResponse } from "@jondotsoy/shell";
      if (typeof shell !== "function") {
        throw new Error("shell is not a function");
      }
      if (typeof ShellRequest !== "function") {
        throw new Error("ShellRequest is not a function");
      }
      if (typeof ShellResponse !== "function") {
        throw new Error("ShellResponse is not a function");
      }
    `,
  );
  await shell(`node index.js`, { cwd: tmp.pathname });
});

test("should work with Node.js LTS (v22.19.0)", async () => {
  const tmp = new URL(`file:${tmpdir()}/shell-e2e-tests-workspace/`);
  await shell(`rm -rf ${tmp.pathname} && mkdir -p ${tmp.pathname}`);
  file(new URL(`.tool-versions`, tmp), `nodejs ${engines.node.LTS}`);

  file(
    new URL(`package.json`, tmp),
    JSON.stringify(
      {
        name: "shell-e2e-tests",
        private: true,
        type: "module",
      },
      null,
      2,
    ),
  );
  await shell(`cp ${tarball.pathname} "pack.tgz"`, { cwd: tmp.pathname });
  await shell(`npm install pack.tgz`, { cwd: tmp.pathname });
  file(
    new URL(`index.js`, tmp),
    `
      import { shell, ShellRequest, ShellResponse } from "@jondotsoy/shell";
      if (typeof shell !== "function") {
        throw new Error("shell is not a function");
      }
      if (typeof ShellRequest !== "function") {
        throw new Error("ShellRequest is not a function");
      }
      if (typeof ShellResponse !== "function") {
        throw new Error("ShellResponse is not a function");
      }
    `,
  );
  await shell(`node index.js`, { cwd: tmp.pathname });
});

test("placeholder test - needs implementation", async () => {
  const tmp = new URL(`file:${tmpdir()}/shell-e2e-tests-workspace/`);
  await shell(`rm -rf ${tmp.pathname} && mkdir -p ${tmp.pathname}`);
  file(new URL(`.tool-versions`, tmp), `nodejs ${engines.node.Latest}`);

  file(
    new URL(`package.json`, tmp),
    JSON.stringify(
      {
        name: "shell-e2e-tests",
        private: true,
        type: "module",
      },
      null,
      2,
    ),
  );
  await shell(`cp ${tarball.pathname} "pack.tgz"`, { cwd: tmp.pathname });
  await shell(`npm install pack.tgz`, { cwd: tmp.pathname });
  file(
    new URL(`index.js`, tmp),
    `
      import { shell, ShellRequest, ShellResponse } from "@jondotsoy/shell";
      if (typeof shell !== "function") {
        throw new Error("shell is not a function");
      }
      if (typeof ShellRequest !== "function") {
        throw new Error("ShellRequest is not a function");
      }
      if (typeof ShellResponse !== "function") {
        throw new Error("ShellResponse is not a function");
      }
    `,
  );
  await shell(`node index.js`, { cwd: tmp.pathname });
});

test("should work with Node.js Latest (v24.7.0) - duplicate test", async () => {
  const tmp = new URL(`file:${tmpdir()}/shell-e2e-tests-workspace/`);
  await shell(`rm -rf ${tmp.pathname} && mkdir -p ${tmp.pathname}`);
  file(new URL(`.tool-versions`, tmp), `nodejs ${engines.node.Latest}`);

  file(
    new URL(`package.json`, tmp),
    JSON.stringify(
      {
        name: "shell-e2e-tests",
        private: true,
        type: "module",
      },
      null,
      2,
    ),
  );
  await shell(`cp ${tarball.pathname} "pack.tgz"`, { cwd: tmp.pathname });
  await shell(`npm install pack.tgz`, { cwd: tmp.pathname });
  file(
    new URL(`index.js`, tmp),
    `
      import { shell, ShellRequest, ShellResponse } from "@jondotsoy/shell";
      if (typeof shell !== "function") {
        throw new Error("shell is not a function");
      }
      if (typeof ShellRequest !== "function") {
        throw new Error("ShellRequest is not a function");
      }
      if (typeof ShellResponse !== "function") {
        throw new Error("ShellResponse is not a function");
      }
    `,
  );
  await shell(`node index.js`, { cwd: tmp.pathname });
});

test("should work with Bun Latest (v1.2.21)", async () => {
  const tmp = new URL(`file:${tmpdir()}/shell-e2e-tests-workspace/`);
  await shell(`rm -rf ${tmp.pathname} && mkdir -p ${tmp.pathname}`);
  file(new URL(`.tool-versions`, tmp), `bun ${engines.bun.Latest}`);

  file(
    new URL(`package.json`, tmp),
    JSON.stringify(
      {
        name: "shell-e2e-tests",
        private: true,
        type: "module",
      },
      null,
      2,
    ),
  );
  await shell(`cp ${tarball.pathname} "pack.tgz"`, { cwd: tmp.pathname });
  await shell(`bun install pack.tgz`, { cwd: tmp.pathname });
  file(
    new URL(`index.js`, tmp),
    `
      import { shell, ShellRequest, ShellResponse } from "@jondotsoy/shell";
      if (typeof shell !== "function") {
        throw new Error("shell is not a function");
      }
      if (typeof ShellRequest !== "function") {
        throw new Error("ShellRequest is not a function");
      }
      if (typeof ShellResponse !== "function") {
        throw new Error("ShellResponse is not a function");
      }
    `,
  );
  await shell(`bun index.js`, { cwd: tmp.pathname });
});

test("should work with Deno LTS (v2.4.5)", async () => {
  const tmp = new URL(`file:${tmpdir()}/shell-e2e-tests-workspace/`);
  await shell(`rm -rf ${tmp.pathname} && mkdir -p ${tmp.pathname}`);
  file(new URL(`.tool-versions`, tmp), `deno ${engines.deno.LTS}`);

  file(
    new URL(`package.json`, tmp),
    JSON.stringify(
      {
        name: "shell-e2e-tests",
        private: true,
        type: "module",
      },
      null,
      2,
    ),
  );
  await shell(`cp ${tarball.pathname} "pack.tgz"`, { cwd: tmp.pathname });
  await shell(`mkdir dep-shell && tar -xzf pack.tgz -C dep-shell`, {
    cwd: tmp.pathname,
  });
  file(
    new URL(`index.js`, tmp),
    `
      import { shell, ShellRequest, ShellResponse } from "./dep-shell/package/libs/esm/shell.js";
      if (typeof shell !== "function") {
        throw new Error("shell is not a function");
      }
      if (typeof ShellRequest !== "function") {
        throw new Error("ShellRequest is not a function");
      }
      if (typeof ShellResponse !== "function") {
        throw new Error("ShellResponse is not a function");
      }
    `,
  );
  await shell(`deno index.js`, { cwd: tmp.pathname });
});

import { describe, test as t, expect, beforeAll } from "bun:test";
import { tmpdir } from "os";
import fs from "fs";
import { shell as originalShell } from "../src/shell";

const enableTests = process.env.ENABLE_E2E_TESTS === "true";

const test = t.if(enableTests);

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

test(`should work with Node.js Gallium (v${engines.node.Gallium})`, async () => {
  const tmp = new URL(`file:${tmpdir()}/shell-e2e-tests-workspace/`);
  await shell(`rm -rf ${tmp.pathname} && mkdir -p ${tmp.pathname}`);
  await shell(`asdf set nodejs ${engines.node.Gallium}`, { cwd: tmp.pathname });

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

test(`should work with Node.js Hydrogen (v${engines.node.Hydrogen})`, async () => {
  const tmp = new URL(`file:${tmpdir()}/shell-e2e-tests-workspace/`);
  await shell(`rm -rf ${tmp.pathname} && mkdir -p ${tmp.pathname}`);
  await shell(`asdf set nodejs ${engines.node.Hydrogen}`, {
    cwd: tmp.pathname,
  });

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

test(`should work with Node.js Iron (v${engines.node.Iron})`, async () => {
  const tmp = new URL(`file:${tmpdir()}/shell-e2e-tests-workspace/`);
  await shell(`rm -rf ${tmp.pathname} && mkdir -p ${tmp.pathname}`);
  await shell(`asdf set nodejs ${engines.node.Iron}`, { cwd: tmp.pathname });

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

test(`should work with Node.js Jod (v${engines.node.Jod})`, async () => {
  const tmp = new URL(`file:${tmpdir()}/shell-e2e-tests-workspace/`);
  await shell(`rm -rf ${tmp.pathname} && mkdir -p ${tmp.pathname}`);
  await shell(`asdf set nodejs ${engines.node.Jod}`, { cwd: tmp.pathname });

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

test(`should work with Node.js LTS (v${engines.node.LTS})`, async () => {
  const tmp = new URL(`file:${tmpdir()}/shell-e2e-tests-workspace/`);
  await shell(`rm -rf ${tmp.pathname} && mkdir -p ${tmp.pathname}`);
  await shell(`asdf set nodejs ${engines.node.LTS}`, { cwd: tmp.pathname });

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

test(`placeholder test - needs implementation (v${engines.node.Latest})`, async () => {
  const tmp = new URL(`file:${tmpdir()}/shell-e2e-tests-workspace/`);
  await shell(`rm -rf ${tmp.pathname} && mkdir -p ${tmp.pathname}`);
  await shell(`asdf set nodejs ${engines.node.Latest}`, { cwd: tmp.pathname });

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

test(`should work with Node.js Latest (v${engines.node.Latest}) - duplicate test`, async () => {
  const tmp = new URL(`file:${tmpdir()}/shell-e2e-tests-workspace/`);
  await shell(`rm -rf ${tmp.pathname} && mkdir -p ${tmp.pathname}`);
  await shell(`asdf set nodejs ${engines.node.Latest}`, { cwd: tmp.pathname });

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

test(`should work with Bun Latest (v${engines.bun.Latest})`, async () => {
  const tmp = new URL(`file:${tmpdir()}/shell-e2e-tests-workspace/`);
  await shell(`rm -rf ${tmp.pathname} && mkdir -p ${tmp.pathname}`);
  await shell(`asdf set bun ${engines.bun.Latest}`, { cwd: tmp.pathname });

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

test(`should work with Deno LTS (v${engines.deno.LTS})`, async () => {
  const tmp = new URL(`file:${tmpdir()}/shell-e2e-tests-workspace/`);
  await shell(`rm -rf ${tmp.pathname} && mkdir -p ${tmp.pathname}`);
  await shell(`asdf set deno ${engines.deno.LTS}`, { cwd: tmp.pathname });

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

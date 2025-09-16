# Changelog

## [1.3.0](https://github.com/JonDotsoy/shell/compare/v1.2.2...v1.3.0) (2025-09-16)


### Features

* enhance ShellRequestOptions to support ShellResponse and improve stream handling ([e92d8ec](https://github.com/JonDotsoy/shell/commit/e92d8ec9dc9988cb622b39273e74aa6e6d3ea3e7))
* implement AwaitedShellResponse for improved shell command handling ([5763adf](https://github.com/JonDotsoy/shell/commit/5763adf54f3ec6342f971df795569bd9de6173fe))
* implement thenable interface and async iteration for enhanced shell command experience ([5808c46](https://github.com/JonDotsoy/shell/commit/5808c46270e9768e7a45165a3f641e930f6f078b))


### Bug Fixes

* export ReadableTools for improved module accessibility ([c8dc466](https://github.com/JonDotsoy/shell/commit/c8dc46603eb97e1705fdbe5daffb26d9e2448791))

## [1.2.2](https://github.com/JonDotsoy/shell/compare/v1.2.1...v1.2.2) (2025-09-10)


### Miscellaneous Chores

* release 1.2.2 ([91ce3f3](https://github.com/JonDotsoy/shell/commit/91ce3f3bcb93b62552e6dd6efdf9a62258c8c4f0))

## [1.2.1](https://github.com/JonDotsoy/shell/compare/v1.2.0...v1.2.1) (2025-09-10)


### Bug Fixes

* handle error events in shell command execution ([f9e7e2c](https://github.com/JonDotsoy/shell/commit/f9e7e2cd9ae1f46500f846a4a00a1a0ce0c470cb))
* update cwd type to allow URL in ShellRequest and ShellRequestOptions ([376ff17](https://github.com/JonDotsoy/shell/commit/376ff172039c7b901528e48d64990e19fcd1479c))

## [1.2.0](https://github.com/JonDotsoy/shell/compare/v1.1.0...v1.2.0) (2025-09-09)


### Features

* enhance ReadableTools with tap method for stream duplication ([a42e773](https://github.com/JonDotsoy/shell/commit/a42e773f4db4b9a9c62cee06b09c91a3b5b498ba))

## [1.1.0](https://github.com/JonDotsoy/shell/compare/v1.0.2...v1.1.0) (2025-09-09)


### Features

* add parseArgumentsShellRequestOptions function for shell request parsing ([12c7c0f](https://github.com/JonDotsoy/shell/commit/12c7c0fe8046d1bc0d339a8a699a208916fd9725))
* add ReadableTools utility class for stream handling ([0604231](https://github.com/JonDotsoy/shell/commit/0604231881798f2698d101e78985629bd6f358d5))
* add shell request and response options types ([58d4011](https://github.com/JonDotsoy/shell/commit/58d4011a7782f34551fe5caa8da823f0869a9722))
* implement parseArgumentsShellResponseOptions for shell response normalization ([80f67cc](https://github.com/JonDotsoy/shell/commit/80f67ccfcb38a09b8998b1afa26a2b031b92fb72))
* implement ShellRequest class for shell command configuration ([bcee29c](https://github.com/JonDotsoy/shell/commit/bcee29cd44d2c04980d888c4e707566ef5778ee9))
* implement ShellResponse class for handling shell command responses ([b9e5ae7](https://github.com/JonDotsoy/shell/commit/b9e5ae74eff4635bc628c9a821ea361eca8254d3))


### Bug Fixes

* correct export statements for ShellRequest and ShellResponse ([2091f61](https://github.com/JonDotsoy/shell/commit/2091f61656d7a0bf64bb11059af380a95aa72187))
* update filterString function to correctly identify string values ([a64c130](https://github.com/JonDotsoy/shell/commit/a64c1304439e6c7fd2af7f4cb90a3f1b9e99ed52))
* update import statement for ShellRequest to correct module path ([e253eff](https://github.com/JonDotsoy/shell/commit/e253eff1bc4d24c1a9628966884865f30103160b))

## [1.0.2](https://github.com/JonDotsoy/shell/compare/v1.0.1...v1.0.2) (2025-09-09)


### Miscellaneous Chores

* release 1.0.2 ([e762ae8](https://github.com/JonDotsoy/shell/commit/e762ae8bb50df665288d1305f30b527de311802f))

## [1.0.1](https://github.com/JonDotsoy/shell/compare/v1.0.0...v1.0.1) (2025-09-09)


### Miscellaneous Chores

* release 1.0.1 ([8e0188d](https://github.com/JonDotsoy/shell/commit/8e0188d35f5ecae6196c12b685986b864463a392))

## 1.0.0 (2025-09-09)


### Features

* implement ShellRequest and ShellResponse classes for executing shell commands ([91fc042](https://github.com/JonDotsoy/shell/commit/91fc04257634be79954752f5ae2bc06dc1e832f4))


### Bug Fixes

* update module path in package.json to point to the correct shell.js file ([4b14376](https://github.com/JonDotsoy/shell/commit/4b143766c45788ab939a1ce16ea614a2554e7822))

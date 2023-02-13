oclif-hello-world
=================

oclif example Hello World CLI

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/oclif-hello-world.svg)](https://npmjs.org/package/oclif-hello-world)
[![CircleCI](https://circleci.com/gh/oclif/hello-world/tree/main.svg?style=shield)](https://circleci.com/gh/oclif/hello-world/tree/main)
[![Downloads/week](https://img.shields.io/npm/dw/oclif-hello-world.svg)](https://npmjs.org/package/oclif-hello-world)
[![License](https://img.shields.io/npm/l/oclif-hello-world.svg)](https://github.com/oclif/hello-world/blob/main/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g sophon-cli
$ sophon COMMAND
running command...
$ sophon (--version)
sophon-cli/0.0.0 linux-x64 node-v16.14.1
$ sophon --help [COMMAND]
USAGE
  $ sophon COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`sophon hello PERSON`](#sophon-hello-person)
* [`sophon hello world`](#sophon-hello-world)
* [`sophon help [COMMANDS]`](#sophon-help-commands)
* [`sophon plugins`](#sophon-plugins)
* [`sophon plugins:install PLUGIN...`](#sophon-pluginsinstall-plugin)
* [`sophon plugins:inspect PLUGIN...`](#sophon-pluginsinspect-plugin)
* [`sophon plugins:install PLUGIN...`](#sophon-pluginsinstall-plugin-1)
* [`sophon plugins:link PLUGIN`](#sophon-pluginslink-plugin)
* [`sophon plugins:uninstall PLUGIN...`](#sophon-pluginsuninstall-plugin)
* [`sophon plugins:uninstall PLUGIN...`](#sophon-pluginsuninstall-plugin-1)
* [`sophon plugins:uninstall PLUGIN...`](#sophon-pluginsuninstall-plugin-2)
* [`sophon plugins update`](#sophon-plugins-update)

## `sophon hello PERSON`

Say hello

```
USAGE
  $ sophon hello [PERSON] -f <value>

ARGUMENTS
  PERSON  Person to say hello to

FLAGS
  -f, --from=<value>  (required) Who is saying hello

DESCRIPTION
  Say hello

EXAMPLES
  $ oex hello friend --from oclif
  hello friend from oclif! (./src/commands/hello/index.ts)
```

_See code: [dist/commands/hello/index.ts](https://github.com/TheCactusBlue/sophon/blob/v0.0.0/dist/commands/hello/index.ts)_

## `sophon hello world`

Say hello world

```
USAGE
  $ sophon hello world

DESCRIPTION
  Say hello world

EXAMPLES
  $ sophon hello world
  hello world! (./src/commands/hello/world.ts)
```

## `sophon help [COMMANDS]`

Display help for sophon.

```
USAGE
  $ sophon help [COMMANDS] [-n]

ARGUMENTS
  COMMANDS  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for sophon.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v5.2.4/src/commands/help.ts)_

## `sophon plugins`

List installed plugins.

```
USAGE
  $ sophon plugins [--core]

FLAGS
  --core  Show core plugins.

DESCRIPTION
  List installed plugins.

EXAMPLES
  $ sophon plugins
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v2.3.0/src/commands/plugins/index.ts)_

## `sophon plugins:install PLUGIN...`

Installs a plugin into the CLI.

```
USAGE
  $ sophon plugins:install PLUGIN...

ARGUMENTS
  PLUGIN  Plugin to install.

FLAGS
  -f, --force    Run yarn install with force flag.
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Installs a plugin into the CLI.
  Can be installed from npm or a git url.

  Installation of a user-installed plugin will override a core plugin.

  e.g. If you have a core plugin that has a 'hello' command, installing a user-installed plugin with a 'hello' command
  will override the core plugin implementation. This is useful if a user needs to update core plugin functionality in
  the CLI without the need to patch and update the whole CLI.


ALIASES
  $ sophon plugins add

EXAMPLES
  $ sophon plugins:install myplugin 

  $ sophon plugins:install https://github.com/someuser/someplugin

  $ sophon plugins:install someuser/someplugin
```

## `sophon plugins:inspect PLUGIN...`

Displays installation properties of a plugin.

```
USAGE
  $ sophon plugins:inspect PLUGIN...

ARGUMENTS
  PLUGIN  [default: .] Plugin to inspect.

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Displays installation properties of a plugin.

EXAMPLES
  $ sophon plugins:inspect myplugin
```

## `sophon plugins:install PLUGIN...`

Installs a plugin into the CLI.

```
USAGE
  $ sophon plugins:install PLUGIN...

ARGUMENTS
  PLUGIN  Plugin to install.

FLAGS
  -f, --force    Run yarn install with force flag.
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Installs a plugin into the CLI.
  Can be installed from npm or a git url.

  Installation of a user-installed plugin will override a core plugin.

  e.g. If you have a core plugin that has a 'hello' command, installing a user-installed plugin with a 'hello' command
  will override the core plugin implementation. This is useful if a user needs to update core plugin functionality in
  the CLI without the need to patch and update the whole CLI.


ALIASES
  $ sophon plugins add

EXAMPLES
  $ sophon plugins:install myplugin 

  $ sophon plugins:install https://github.com/someuser/someplugin

  $ sophon plugins:install someuser/someplugin
```

## `sophon plugins:link PLUGIN`

Links a plugin into the CLI for development.

```
USAGE
  $ sophon plugins:link PLUGIN

ARGUMENTS
  PATH  [default: .] path to plugin

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Links a plugin into the CLI for development.
  Installation of a linked plugin will override a user-installed or core plugin.

  e.g. If you have a user-installed or core plugin that has a 'hello' command, installing a linked plugin with a 'hello'
  command will override the user-installed or core plugin implementation. This is useful for development work.


EXAMPLES
  $ sophon plugins:link myplugin
```

## `sophon plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ sophon plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ sophon plugins unlink
  $ sophon plugins remove
```

## `sophon plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ sophon plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ sophon plugins unlink
  $ sophon plugins remove
```

## `sophon plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ sophon plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ sophon plugins unlink
  $ sophon plugins remove
```

## `sophon plugins update`

Update installed plugins.

```
USAGE
  $ sophon plugins update [-h] [-v]

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Update installed plugins.
```
<!-- commandsstop -->

# wgnet

[![npm](https://img.shields.io/badge/npm-wgnet-blue)](https://www.npmjs.com/package/wgnet)
[![license](https://img.shields.io/badge/license-MIT-brightgreen)](./LICENSE.md)

**Note that this is a work in progress. Some features may not work yet as expected.**

Command-line tool and web server to simplify the management of a [WireGuard](https://www.wireguard.com/) network.

## Install

First make sure you have [node.js](https://nodejs.org/en/download/package-manager) installed.

Then install the `wgnet` package globally with:

```
npm install -g wgnet
```

Then the `wgnet` command will be available in your terminal:

```
wgnet --help
```

Alternatively, you can also skip the `npm install` command and use the package directly with `npx`:

```
npx wgnet@latest --help
```

## Getting started

Start a web server to manage your WireGuard network:

```
wgnet server
```

This will create a `wgnet.db` sqlite database in the current directory, start the server on port 3000 and open your web browser so that you can start configuring your Wireguard network.

Note that you can list the available command line options with:

```
wgnet server --help
```

---
titulo: "Salamandra: configuring a Redragon mouse without the vendor software"
descricao: Why I wrote an open configurator for my M901-1, how the protocol
  works, what already runs on three other models and how to help test it.
slug: salamandra-open-mouse-configurator
publicado: 2026-10-25
projetos:
  - salamandra
---

Versão em português: [Salamandra: configurar mouse Redragon sem o software do fabricante](/artigos/salamandra-configurador-aberto-de-mouses).

I own a Redragon M901-1 Perdition 2. The mouse keeps its LED, DPI, buttons and macros in its own memory. To change anything, the only option is the vendor software, and it only runs on Windows.

On macOS and Linux the mouse is stuck with the factory settings. So I wrote Salamandra.

## What it is

An open configurator for Windows, Linux and macOS. It sets LED, DPI, polling rate, profiles, buttons and macros straight on the mouse. It does not need the vendor software and does not stay running in the background for the mouse to work.

The code is at [github.com/polotto/salamandra](https://github.com/polotto/salamandra), MIT licensed. It is written in Rust, with a Tauri and Svelte app.

![DPI levels in the app](/media/salamandra-open-mouse-configurator/app-dpi-dark-en.png)

![Lighting in the app](/media/salamandra-open-mouse-configurator/app-lighting-dark-en.png)

The app screenshots use example data on a simulated mouse.

## How I found the protocol

This mouse uses a Holtek chip. The configuration travels in HID feature reports: a command, a memory address, a length and the data. Writing is `F3`, reading is `F2`, and the rest only switches profile and confirms the write.

To map the addresses, I read how the official software builds each packet. I did this for interoperability, by decompiling the executable, and only facts went into the repository: address, length, byte and which function it came from. No vendor file is in the repo.

Whatever stayed on paper became a test. Each model has tests that build the packet and compare it byte by byte with what is expected.

## Command line and MCP

The same library becomes a CLI, with no Tauri and no window:

```
salamandra show
salamandra dpi 1 1 1600
salamandra backup
```

![Output of salamandra show](/media/salamandra-open-mouse-configurator/cli-show.png)

It also becomes an MCP server. Any MCP client can read the configuration and write LED, DPI and buttons. The tools that change the mouse warn when the model has never been tested.

![MCP server tools](/media/salamandra-open-mouse-configurator/mcp-tools.png)

The CLI messages are still in Portuguese for now.

## What runs today

| Mouse | Status |
| --- | --- |
| Redragon M901-1 Perdition 2 | tested on my mouse |
| Redragon M908 Impact | untested |
| Redragon M719 Invader | untested |
| Redragon M711 Cobra | untested |

The last three were mapped from the official software and public documentation, and were never checked on a physical mouse. The app shows a fixed warning and the CLI warns before every write. It writes anyway, so make a backup first.

There is a trap I found along the way: the same USB ID can cover models with different sensors, and only the device version tells them apart. `show` now prints that version.

## How to help

I need people with a physical mouse:

* test the Impact, Invader or Cobra and tell me what happened (there is an issue template for that)
* send me the USB ID of other Redragon models
* own a Griffin M607, which is still blocked for lack of a mouse

Installers for the three systems are on the [releases page](https://github.com/polotto/salamandra/releases). The version is a test one (pre-release).

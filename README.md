# MQTTLogger1007

## Intent

A Deno program that connects to an MQTT server and logs received events
to a file, directory, or standard output.

## Command-line options

- `-o` Destination file or directory.  `-` for standard output.  Zero or more may be specified.
  A warning will be emitted if none are specified (since that would just mean burning CPU cycles).
  - Directory outputs are distinguished from file outputs by a trailing slash.
- MQTT pseudo-URIs to subscribe to, of the format `mqtt://serverhost:serverport/path/pattern`.
  - If not specified, `serverport` defaults to 1883.
  - `serverhost` may be a domain name, an IP4 address, or a bracketed IPv6 address.
  - Note that I have already written TypeScript code to do this parsing
    into a data structure that represents the target in a somewhat abstract way:
    - https://github.com/TOGoS/SG-P28/blob/orchestration-with-mqtt/src/main/ts/sink/sinkspec.ts
    - https://github.com/TOGoS/SG-P28/blob/orchestration-with-mqtt/src/main/ts/sink/sinkspec.test.ts
    - For now, these can be imported verbatim into this project
- `--help` should output usage instructions.

Any number of inputs and outputs may be specified.
Inputs may include multiple MQTT servers, in which case
the URIs will, I suppose, need to be grouped, so that
only a single connection is made to each.

## Log format

If outputting to a directory, a new file will be created for each 'day'.
All dates/times will be represented either as epoch milliseconds or as UTC,
so for consistency, a new log file will be started, and the old one closed, when the UTC date changes.

If outputting to a file, standard output, or other file-like device,
the single stream continues indefinitely.

The format is essentially 'text-based', but allows for arbitrary binary data, but 'looks good as text' if MQTT messages happen to be text:

Lines starting with `#` are special directives.

Comment lines start with `#` followed by a space.

The first line is `#format tag:nuke24.net,2025-11-02:MQTTLogger1007/LogV1`.  This identifies the format of the file.

Following the format line should be a comment (possibly multiple lines) that briefly describes the format.

Timestamp lines indicate a timestamp at which the following messages
were received, and is of the form `#ts ` + decimal integer giving the milliseconds since the epoch.

Message lines are of one of two formats:
- key + tab + flags + tab + encoded content, or
- key + newline + tab + flags + tab + encoded content

Content is encoded by replacing newlines with newline + tab.

The second format should be used for multi-line messages.
since it will result in them appearing as originally received, but indented.
It can also be used for zero-length messages.


Flags are comma separated.
The following symbols are defined:
- `R` :: retained
- `-` :: Placeholder to be inserted when there are no other flags

## Identifiers

- `tag:nuke24.net,2025-11-02:MQTTLogger1007` :: The concept of this project as described
- `tag:nuke24.net,2025-11-02:MQTTLogger1007/Take1` :: This first attempt at implementing the project, using an LLM agent
- `tag:nuke24.net,2025-11-02:MQTTLogger1007/LogV1` :: The log format described above

## Suggestions for implementation

- A uniform push-based API for both sources and sinks would be nice.
  i.e. the object that represents an MQTT connection pushes data
  into the system using the same interface that is used to push
  data to the loggers.  Preferrably a simple `Consumer<T> { accept(item:T):void }`.
  Or simply a `Function<T,void>`.  The only decisions to be made, then
  are how to register such a sink/consumer/callback (whatever you want to call it)
  with the MQTT logger, and _what is T_?
- In SG-P28's [dashboard](https://github.com/TOGoS/SG-P28/blob/orchestration-with-mqtt/dashboard.ts),
  I have been using a `MQTTMessage` type, which includes the timestamp (as a number representing milliseconds)
  the message was received, the path (as a string), the value (as a `Uint8Array`),
  and whether the messages is `retained`.  This seems like a reasonable format
  and I would use it again, extending as necessary if/when I decide other metadata (QoS level, for example) is needed.
- Use TDD.  Write unit tests first.  Take a functional approach wherever possible,
  since this makes unit tests simpler.  Avoid deep function call graphs.
  Err on the side of simple functions and immutable objects,
  leaving side-effectful code, such as actually opening files or connecting to MQTT servers,
  for the top-level code to initiate.
- When testing the same function with multiple inputs,
  use parameterized tests or delegate to a function to do any
  non-trivial setup/teardown rather than duplicating boilerplate
  in each individual test case.

## Coding conventions

One tab per level of indent.  Unix line endings.
Blank lines inside a block are still inside the block,
and should be indented accordingly.

## Existing code for reference

- https://github.com/TOGoS/SG-P28/blob/orchestration-with-mqtt/src/main/ts/mqtt/MQTTLogger.ts wraps the ~jsr:@ymjacky/mqtt5@0.0.19~ library
  to provide a thin abstraction.  It may or may not be useful for this project.
- https://github.com/TOGoS/SG-P28/blob/orchestration-with-mqtt/src/main/ts/sink/sinkspec.ts - parsing MQTT pseudo-URIs
- https://github.com/TOGoS/SG-P28/blob/orchestration-with-mqtt/src/main/ts/sink/sinkspec.test.ts - Unit tests for same

## Using Devcontainer with Cursor on Windows

A trifecta of variables to interfere with one another!
tl;dr: I couldn't get it working.

### Installing WSL and a Linux distribution (if you're on Windows)

Install WSL itself:

```
wsl.exe --install
```

Reboot...

Install a Linux distro inside WSL.

`wsl --list --online` to list options.

I will go with good old Debian.

`wsl --install Debian`

You will likely be prompted to create a username/password.  Go ahead and do so.

### Installing Docker

```
sudo apt update
sudo apt install docker.io docker-cli

# Add yourself to the docker group (TODO: verify that this makes the integration work)
sudo usermod -aG docker $USER
```

### Open in Devcontainer

> VS Code/Cursor automatically detects Docker in WSL when you're working
> from a WSL path or have WSL integration enabled.

Said some LLM.  But I HAVE NOT BEEN ABLE TO GET THIS TO WORK IN CURSOR.

I can get it to work within WSL, but I have not gotten it to work
within a Docker container within WSL or using Docker Desktop,
which may be different.

Note that this is a little bit different than in vanilla VS Code,
where I did [at some point](https://github.com/TOGoS/Scratch38/tree/subtrees/s0021/master)
get a devcontainer working, apparently running inside Docker
inside WSL.  Cursor has its own, slightly different extensions for this.

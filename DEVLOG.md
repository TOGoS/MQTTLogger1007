# MQTTLogger1007 Devlog

## 2025-11-02T13

This seems like a relatively simple project that _perhaps_ would be a good
candidate for handing off to an LLM. I have described it in some detail in
README.md. We shall see if that is enough information soon.

### Cursor/Devcontainer Drama

> VS Code/Cursor automatically detects Docker in WSL when you're working from a
> WSL path or have WSL integration enabled.

Said some LLM. But I HAVE NOT BEEN ABLE TO GET THIS TO WORK IN CURSOR.

I can get it to work within WSL, but I have not gotten it to work within a
Docker container within WSL or using Docker Desktop, which may be different.

Note that this is a little bit different than in vanilla VS Code, where I did
[at some point](https://github.com/TOGoS/Scratch38/tree/subtrees/s0021/master)
get a devcontainer working, apparently running inside Docker inside WSL. Cursor
has its own, slightly different extensions for this.

### A Breakthrough?

I switched to VS Code and attempted to open the devcontainer using the uh,
whichever the recommended extension was. The log indicated an error when it
tried to install itself into `/home/deno`, which did not exist.

I updated [Dockerfile](./.devcontainer/Dockerfile) with an additional step to
`mkdir` and `chmod` that directory:

```Dockerfile
RUN mkdir /home/deno && chown deno:deno /home/deno
```

It then loaded fine in VS Code.

I then reloaded in Cursor. It works, now. Hooray!

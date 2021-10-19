# graph-proto-as-schema

This project allows to generate the Graph compatible graphQL schema files from proto files

## Build

To build this project just run `yarn install`  and `tsc`.
This will result in files being created inside `dist` directory.

## Run

To run created application you need to run:

```bash
    node ./dist/index.js -o ./outp  -d ./test/
```

To see all arguments possible to supply use help:

```bash
node ./dist/index.js -h
Options:
      --version  Show version number                                   [boolean]
  -d, --dir      the directory to scan for input files
                                   [string] [default: read from the same folder]
  -o, --output   Output folder for schema file to be output
                                    [string] [default: store in the same folder]
  -p, --pattern  pattern to apply when picking files
                                            [string] [default: just proto files]
  -h, --help     Show help                                             [boolean]
```

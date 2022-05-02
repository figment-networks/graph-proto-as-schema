# graph-proto-as-schema

This project allows to generate the Graph compatible graphQL schema files from proto files,

Additionally this script allows you to generate typescript/assemblyscript structures needed for graph-ts repository.

## Build

To build this project just run `yarn install`  and `tsc`.
This will result in files being created inside `dist` directory.

## Run

To run created application you need to run:

```bash
node ./dist/index.js -o ./output -d ../proto-cosmos/sf/type/v1 --typescript_namespace cosmos
```

To see all arguments possible to supply use help:

```bash
node ./dist/index.js -h
Options:
      --version               Show version number                      [boolean]
  -d, --dir                   the directory to scan for input files
                                   [string] [default: read from the same folder]
  -o, --output                Output folder for schema file to be output
                                    [string] [default: store in the same folder]
  -p, --pattern               pattern to apply when picking files
                                            [string] [default: just proto files]
      --force_non_null_lists  force graph compatible not null fields in lists
                                 [boolean] [default: by default apply the param]
      --typescipt             generate typescript     [boolean] [default: true]
      --typescript_namespace  namespace to apply when generating ts file.
                                                         [string] [default: "t"]
  -h, --help                  Show help                                [boolean]
```

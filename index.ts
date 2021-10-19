import * as t from "proto-parser";
import * as graphql from "graphql";
import * as yargs from "yargs";

import { toSchemaObjects } from "./convert";
import { readFileSync, existsSync, writeFileSync, mkdirSync } from "fs";
import { readdir } from "fs/promises";

function main() {
  process();
}

async function process() {
  try {
    const argv = await yargs
      .option("dir", {
        description: "the directory to scan for input files",
        alias: "d",
        type: "string",
      })
      .default("dir", ".", "read from the same folder")
      .option("output", {
        alias: "o",
        description: "Output folder for schema file to be output",
        type: "string",
      })
      .default("output", ".", "store in the same folder")
      .option("pattern", {
        alias: "p",
        description: "pattern to apply when picking files",
        type: "string",
      })
      .default("pattern", ".proto", "just proto files")
      .help()
      .alias("help", "h").argv;

    if (!existsSync(argv.dir)) {
      throw Error("given path does not exists ");
    }

    if (!existsSync(argv.output)) {
      mkdirSync(argv.output, { recursive: true });
    }

    await walkPath(
      argv.dir.toString(),
      argv.dir.toString(),
      argv.pattern?.toString(),
      argv.output.toString()
    );
  } catch (e) {
    throw e;
  }
}

async function walkPath(
  basepath: string,
  path: string,
  pattern: string,
  output: string
) {
  try {
    const files = await readdir(path, { withFileTypes: true });
    for (const file of files) {
      if (file.isSymbolicLink()) {
        continue;
      }

      if (file.isDirectory()) {
        await walkPath(basepath, path + "/" + file.name, pattern, output);
      } else {
        if (file.name.includes(pattern)) {
          console.info("processing " + path + "/" + file.name);
          const dir = output + path.replace(basepath, "");

          const fContents = readFileSync(path + "/" + file.name, "utf-8");
          const protoDocument = t.parse(fContents.toString()) as t.ProtoDocument;
          const gqlp = graphql.print(toSchemaObjects(protoDocument));

          mkdirSync(dir, { recursive: true });
          const filename = nextFilename(file.name, dir, 0);

          writeFileSync(filename, gqlp);
        }
      }
    }
  } catch (err) {
    console.error(err);
  }
}

function nextFilename(name: string, dir: string, iter: number): string {
  if (iter == 0 && !existsSync(dir + "/" + name + ".graphql")) {
    return dir + "/" + name + ".graphql";
  }

  if (!existsSync(dir + "/" + name + "." + iter + ".graphql")) {
    return dir + "/" + name + "." + iter + ".graphql";
  }

  return nextFilename(name, dir, iter + 1);
}

main();

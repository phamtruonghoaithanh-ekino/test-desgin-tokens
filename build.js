import StyleDictionary from "style-dictionary";
import { register, expandTypesMap } from "@tokens-studio/sd-transforms";
import { resolve, dirname } from "node:path";
import { readFile, writeFile, mkdir, rm } from "node:fs/promises";

register(StyleDictionary);

const source = process.argv[2];
if (!source) {
  console.error("Usage: node build.js <source-path>");
  console.error("Example: node build.js tokens.json");
  process.exit(1);
}

const subdir = dirname(source) === "." ? "" : dirname(source) + "/";
const buildBase = `build/${subdir}css/`;

const raw = JSON.parse(await readFile(source, "utf-8"));
const { $themes, $metadata, ...tokenSets } = raw;

async function buildSingle(sources, destination) {
  const sd = new StyleDictionary({
    source: sources.map((s) => resolve(s)),
    preprocessors: ["tokens-studio"],
    expand: { typesMap: expandTypesMap },
    platforms: {
      css: {
        transformGroup: "tokens-studio",
        transforms: ["name/kebab"],
        buildPath: buildBase,
        files: [
          {
            destination,
            format: "css/variables",
          },
        ],
      },
    },
  });
  await sd.buildAllPlatforms();
}

if ($themes) {
  const tmpDir = `.tokens/${source.replace(/\.[^/.]+$/, "")}`;
  await rm(tmpDir, { recursive: true, force: true });
  await mkdir(tmpDir, { recursive: true });

  for (const [setName, setTokens] of Object.entries(tokenSets)) {
    await writeFile(
      `${tmpDir}/${setName}.json`,
      JSON.stringify(setTokens, null, 2),
    );
  }

  for (const theme of $themes) {
    const enabledSets = Object.entries(theme.selectedTokenSets)
      .filter(([, v]) => v !== "disabled")
      .map(([name]) => name);

    if (!enabledSets.includes("global")) {
      enabledSets.unshift("global");
    }

    const sources = enabledSets.map((name) => `${tmpDir}/${name}.json`);
    const dest = `vars-${theme.name}.css`;

    await buildSingle(sources, dest);
  }
} else {
  await buildSingle([source], "variables.css");
}

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { TokenList } from "@uniswap/token-lists";

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageJson = JSON.parse(readFileSync(join(__dirname, "../../package.json"), "utf-8"));
const { version } = packageJson;

import abstractMainnet from "../../token-list/chain/2741.json" with { type: "json" };
import arbitrumMainnet from "../../token-list/chain/42161.json" with { type: "json" };
import avalancheMainnet from "../../token-list/chain/43114.json" with { type: "json" };
import baseMainnet from "../../token-list/chain/8453.json" with { type: "json" };
import baseSepolia from "../../token-list/chain/84532.json" with { type: "json" };
import berachainMainnet from "../../token-list/chain/80094.json" with { type: "json" };
import blastMainnet from "../../token-list/chain/81457.json" with { type: "json" };
import bscMainnet from "../../token-list/chain/56.json" with { type: "json" };
import chilizMainnet from "../../token-list/chain/88888.json" with { type: "json" };
import ethereumMainnet from "../../token-list/chain/1.json" with { type: "json" };
import ethereumSepolia from "../../token-list/chain/11155111.json" with { type: "json" };
import formMainnet from "../../token-list/chain/478.json" with { type: "json" };
import gnosisMainnet from "../../token-list/chain/100.json" with { type: "json" };
import hyperevmMainnet from "../../token-list/chain/999.json" with { type: "json" };
import iotexMainnet from "../../token-list/chain/4689.json" with { type: "json" };
import lightlinkMainnet from "../../token-list/chain/1890.json" with { type: "json" };
import lineaMainnet from "../../token-list/chain/59144.json" with { type: "json" };
import modeMainnet from "../../token-list/chain/34443.json" with { type: "json" };
import morphMainnet from "../../token-list/chain/2818.json" with { type: "json" };
import optimismMainnet from "../../token-list/chain/10.json" with { type: "json" };
import polygonMainnet from "../../token-list/chain/137.json" with { type: "json" };
import roninMainnet from "../../token-list/chain/2020.json" with { type: "json" };
import roninTestnet from "../../token-list/chain/2021.json" with { type: "json" };
import scrollMainnet from "../../token-list/chain/534352.json" with { type: "json" };
import seiMainnet from "../../token-list/chain/1329.json" with { type: "json" };
import sonicMainnet from "../../token-list/chain/146.json" with { type: "json" };
import sophonMainnet from "../../token-list/chain/50104.json" with { type: "json" };
import superseedMainnet from "../../token-list/chain/5330.json" with { type: "json" };
import tangleMainnet from "../../token-list/chain/5845.json" with { type: "json" };
import unichainMainnet from "../../token-list/chain/130.json" with { type: "json" };
import xdcMainnet from "../../token-list/chain/50.json" with { type: "json" };
import zksyncMainnet from "../../token-list/chain/324.json" with { type: "json" };

export default function buildList(): TokenList {
  const parsed = version.split(".");
  const l1List: TokenList = {
    keywords: ["sablier", "default"],
    logoURI: "https://files.sablier.com/icon-180x180.png",
    name: "Sablier EVM Token List",
    tags: {},
    timestamp: new Date().toISOString(),
    tokens: [
      ...ethereumMainnet,
      ...abstractMainnet,
      ...avalancheMainnet,
      ...arbitrumMainnet,
      ...baseMainnet,
      ...baseSepolia,
      ...berachainMainnet,
      ...blastMainnet,
      ...bscMainnet,
      ...chilizMainnet,
      ...ethereumSepolia,
      ...formMainnet,
      ...gnosisMainnet,
      ...hyperevmMainnet,
      ...iotexMainnet,
      ...lightlinkMainnet,
      ...lineaMainnet,
      ...modeMainnet,
      ...morphMainnet,
      ...optimismMainnet,
      ...polygonMainnet,
      ...roninMainnet,
      ...roninTestnet,
      ...seiMainnet,
      ...scrollMainnet,
      ...sonicMainnet,
      ...sophonMainnet,
      ...superseedMainnet,
      ...tangleMainnet,
      ...unichainMainnet,
      ...xdcMainnet,
      ...zksyncMainnet,
    ]
      // sort them by symbol for easy readability
      .sort((t1, t2) => {
        if (t1.chainId === t2.chainId) {
          return t1.symbol.toLowerCase() < t2.symbol.toLowerCase() ? -1 : 1;
        }
        return t1.chainId < t2.chainId ? -1 : 1;
      }),
    version: {
      major: +parsed[0],
      minor: +parsed[1],
      patch: +parsed[2],
    },
  };

  return l1List;
}

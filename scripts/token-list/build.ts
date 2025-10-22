import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { TokenList } from "@uniswap/token-lists";

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageJson = JSON.parse(readFileSync(join(__dirname, "../../package.json"), "utf-8"));
const { version } = packageJson;

import abstractMainnet from "../../token-list/abstract-mainnet.json" with { type: "json" };
import arbitrumMainnet from "../../token-list/arbitrum-mainnet.json" with { type: "json" };
import avalancheMainnet from "../../token-list/avalanche-mainnet.json" with { type: "json" };
import baseMainnet from "../../token-list/base-mainnet.json" with { type: "json" };
import baseSepolia from "../../token-list/base-sepolia.json" with { type: "json" };
import berachainMainnet from "../../token-list/berachain-mainnet.json" with { type: "json" };
import blastMainnet from "../../token-list/blast-mainnet.json" with { type: "json" };
import bscMainnet from "../../token-list/bsc-mainnet.json" with { type: "json" };
import chilizMainnet from "../../token-list/chiliz-mainnet.json" with { type: "json" };
import ethereumMainnet from "../../token-list/ethereum-mainnet.json" with { type: "json" };
import ethereumSepolia from "../../token-list/ethereum-sepolia.json" with { type: "json" };
import formMainnet from "../../token-list/form-mainnet.json" with { type: "json" };
import gnosisMainnet from "../../token-list/gnosis-mainnet.json" with { type: "json" };
import hyperevmMainnet from "../../token-list/hyperevm-mainnet.json" with { type: "json" };
import iotexMainnet from "../../token-list/iotex-mainnet.json" with { type: "json" };
import lightlinkMainnet from "../../token-list/lightlink-mainnet.json" with { type: "json" };
import lineaMainnet from "../../token-list/linea-mainnet.json" with { type: "json" };
import modeMainnet from "../../token-list/mode-mainnet.json" with { type: "json" };
import morphMainnet from "../../token-list/morph-mainnet.json" with { type: "json" };
import optimismMainnet from "../../token-list/optimism-mainnet.json" with { type: "json" };
import polygonMainnet from "../../token-list/polygon-mainnet.json" with { type: "json" };
import roninMainnet from "../../token-list/ronin-mainnet.json" with { type: "json" };
import roninTestnet from "../../token-list/ronin-testnet.json" with { type: "json" };
import scrollMainnet from "../../token-list/scroll-mainnet.json" with { type: "json" };
import seiMainnet from "../../token-list/sei-mainnet.json" with { type: "json" };
import sonicMainnet from "../../token-list/sonic-mainnet.json" with { type: "json" };
import sophonMainnet from "../../token-list/sophon-mainnet.json" with { type: "json" };
import superseedMainnet from "../../token-list/superseed-mainnet.json" with { type: "json" };
import tangleMainnet from "../../token-list/tangle-mainnet.json" with { type: "json" };
import unichainMainnet from "../../token-list/unichain-mainnet.json" with { type: "json" };
import xdcMainnet from "../../token-list/xdc-mainnet.json" with { type: "json" };
import zksyncMainnet from "../../token-list/zksync-mainnet.json" with { type: "json" };

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

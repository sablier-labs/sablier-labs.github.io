import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageJson = JSON.parse(readFileSync(join(__dirname, "../../package.json"), "utf-8"));
const { version } = packageJson;

import abstractMainnet from "../../lists/abstract-mainnet.json" with { type: "json" };
import arbitrumMainnet from "../../lists/arbitrum-mainnet.json" with { type: "json" };
import avalancheMainnet from "../../lists/avalanche-mainnet.json" with { type: "json" };
import baseMainnet from "../../lists/base-mainnet.json" with { type: "json" };
import baseSepolia from "../../lists/base-sepolia.json" with { type: "json" };
import berachainMainnet from "../../lists/berachain-mainnet.json" with { type: "json" };
import blastMainnet from "../../lists/blast-mainnet.json" with { type: "json" };
import bscMainnet from "../../lists/bsc-mainnet.json" with { type: "json" };
import chilizMainnet from "../../lists/chiliz-mainnet.json" with { type: "json" };
import ethereumMainnet from "../../lists/ethereum-mainnet.json" with { type: "json" };
import ethereumSepolia from "../../lists/ethereum-sepolia.json" with { type: "json" };
import gnosisMainnet from "../../lists/gnosis-mainnet.json" with { type: "json" };
import hyperevmMainnet from "../../lists/hyperevm-mainnet.json" with { type: "json" };
import formMainnet from "../../lists/form-mainnet.json" with { type: "json" };
import iotexMainnet from "../../lists/iotex-mainnet.json" with { type: "json" };
import optimismMainnet from "../../lists/optimism-mainnet.json" with { type: "json" };
import lightlinkMainnet from "../../lists/lightlink-mainnet.json" with { type: "json" };
import lineaMainnet from "../../lists/linea-mainnet.json" with { type: "json" };
import morphMainnet from "../../lists/morph-mainnet.json" with { type: "json" };
import modeMainnet from "../../lists/mode-mainnet.json" with { type: "json" };
import polygonMainnet from "../../lists/polygon-mainnet.json" with { type: "json" };
import roninMainnet from "../../lists/ronin-mainnet.json" with { type: "json" };
import roninTestnet from "../../lists/ronin-testnet.json" with { type: "json" };
import scrollMainnet from "../../lists/scroll-mainnet.json" with { type: "json" };
import seiMainnet from "../../lists/sei-mainnet.json" with { type: "json" };
import sophonMainnet from "../../lists/sophon-mainnet.json" with { type: "json" };
import sonicMainnet from "../../lists/sonic-mainnet.json" with { type: "json" };
import superseedMainnet from "../../lists/superseed-mainnet.json" with { type: "json" };
import tangleMainnet from "../../lists/tangle-mainnet.json" with { type: "json" };
import unichainMainnet from "../../lists/unichain-mainnet.json" with { type: "json" };
import xdcMainnet from "../../lists/xdc-mainnet.json" with { type: "json" };
import zksyncMainnet from "../../lists/zksync-mainnet.json" with { type: "json" };

export default function buildList() {
  const parsed = version.split(".");
  const l1List = {
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

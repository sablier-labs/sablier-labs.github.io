import type { IImage } from "@sablier/v2-types";
import IconArbitrum from "./arbitrum.webp";
import IconAvalanche from "./avalanche.webp";
import IconBase from "./base.webp";
import IconBaseSepolia from "./base-sepolia.webp";
import IconBerachain from "./bera.webp";
import IconBlast from "./blast.webp";
import IconBinanceSmartChain from "./bsc.webp";
import IconTestnet from "./ethereum-gray.webp";
import IconEthereum from "./ethereum-purple.webp";
import IconGnosis from "./gnosis.webp";
import IconIotex from "./iotex.webp";
import IconLightlink from "./lightlink.webp";
import IconLinea from "./linea.webp";
import IconPolygon from "./matic.webp";
import IconMode from "./mode.webp";
import IconMorph from "./morph.webp";
import IconOptimism from "./optimism.webp";
import IconScroll from "./scroll.webp";
import IconTangle from "./tangle.webp";
import IconZkSyncSepolia from "./zksync-sepolia.webp";
import IconZkSync from "./zksync.webp";

/**
 * Keep hardcoded values here because imports from @sablier/v2-constants
 * will expose this file to dependencies like lodash, which will
 * break the OG Meta Image generator (see client/pages/api).
 */

const CHAIN_ARBITRUM_ID = 42161;
const CHAIN_AVALANCHE_ID = 43114;
const CHAIN_BASE_ID = 8453;
const CHAIN_BASE_SEPOLIA_ID = 84532;
const CHAIN_BERACHAIN_ID = 80094;
const CHAIN_BLAST_ID = 81457;
const CHAIN_BSC_ID = 56;
const CHAIN_ETHEREUM_ID = 1;
const CHAIN_GNOSIS_ID = 100;
const CHAIN_IOTEX_ID = 4689;
const CHAIN_LIGHTLINK_ID = 1890;
const CHAIN_LINEA_ID = 59144;
const CHAIN_MODE_ID = 34443;
const CHAIN_MORPH_ID = 2818;
const CHAIN_OPTIMISM_ID = 10;
const CHAIN_POLYGON_ID = 137;
const CHAIN_SCROLL_ID = 534352;
const CHAIN_SEPOLIA_ID = 11155111;
const CHAIN_TANGLE_ID = 5845;
const CHAIN_ZKSYNC_ID = 324;
const CHAIN_ZKSYNC_SEPOLIA_ID = 300;

const chains: Record<number, IImage> = {
  [CHAIN_ARBITRUM_ID]: IconArbitrum,
  [CHAIN_AVALANCHE_ID]: IconAvalanche,
  [CHAIN_BASE_ID]: IconBase,
  [CHAIN_BASE_SEPOLIA_ID]: IconBaseSepolia,
  [CHAIN_BERACHAIN_ID]: IconBerachain,
  [CHAIN_BSC_ID]: IconBinanceSmartChain,
  [CHAIN_BLAST_ID]: IconBlast,
  [CHAIN_ETHEREUM_ID]: IconEthereum,
  [CHAIN_GNOSIS_ID]: IconGnosis,
  [CHAIN_IOTEX_ID]: IconIotex,
  [CHAIN_LINEA_ID]: IconLinea,
  [CHAIN_LIGHTLINK_ID]: IconLightlink,
  [CHAIN_MODE_ID]: IconMode,
  [CHAIN_MORPH_ID]: IconMorph,
  [CHAIN_OPTIMISM_ID]: IconOptimism,
  [CHAIN_POLYGON_ID]: IconPolygon,
  [CHAIN_SEPOLIA_ID]: IconTestnet,
  [CHAIN_SCROLL_ID]: IconScroll,
  [CHAIN_TANGLE_ID]: IconTangle,
  [CHAIN_ZKSYNC_ID]: IconZkSync,
  [CHAIN_ZKSYNC_SEPOLIA_ID]: IconZkSyncSepolia,
};

export default chains;

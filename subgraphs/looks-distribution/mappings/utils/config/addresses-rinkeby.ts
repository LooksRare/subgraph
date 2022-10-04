import { Address } from "@graphprotocol/graph-ts";
import { addressesByNetwork } from "@looksrare/sdk";

export const AGGREGATOR_ADDRESS = Address.fromString(addressesByNetwork[4].AGGREGATOR_UNISWAP_V3);
export const FEE_SHARING_ADDRESS = Address.fromString(addressesByNetwork[4].FEE_SHARING_SYSTEM);

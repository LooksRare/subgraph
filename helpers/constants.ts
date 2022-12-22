import { Address, BigDecimal, BigInt, ByteArray, crypto } from "@graphprotocol/graph-ts";

export const ZERO_BI = BigInt.zero();
export const ONE_BI = BigInt.fromI32(1);
export const TWO_BI = BigInt.fromI32(2);
export const THREE_BI = BigInt.fromI32(3);
export const FOUR_BI = BigInt.fromI32(4);
export const ZERO_BD = BigDecimal.zero();
export const ONE_BD = BigDecimal.fromString("1");
export const ZERO_ADDRESS = Address.fromString("0x0000000000000000000000000000000000000000");
export const ONE_ETHER_IN_WEI = BigInt.fromI32(10).pow(18);
export const ONE_DAY_BI = BigInt.fromI32(86400);

// TODO: Update it with the real address
export const LOOKSRARE_AGGREGATOR = Address.fromString("0x0000000000000000000000000000000000069420");
export const LOOKSRARE_AGGREGATOR_SWEEP_EVENT_TOPIC = crypto
  .keccak256(ByteArray.fromUTF8("Sweep(address)"))
  .toHexString();

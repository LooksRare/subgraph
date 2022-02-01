import { BigInt, BigDecimal } from "@graphprotocol/graph-ts";

export function toBigDecimal(quantity: BigInt, decimals: i32 = 18): BigDecimal {
  return quantity.divDecimal(
    BigInt.fromI32(10)
      .pow(decimals as u8)
      .toBigDecimal()
  );
}

// Helpers
export const ZERO_BI = BigInt.zero();
export const ONE_BI = BigInt.fromI32(1);
export const ZERO_BD = BigDecimal.zero();
export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

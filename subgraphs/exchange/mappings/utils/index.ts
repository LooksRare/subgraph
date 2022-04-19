/* eslint-disable prefer-const */
import { BigDecimal, BigInt } from "@graphprotocol/graph-ts";

// BigNumber helpers
export const ZERO_BI = BigInt.zero();
export const ONE_BI = BigInt.fromI32(1);
export const ZERO_BD = BigDecimal.zero();

export function toBigDecimal(quantity: BigInt, decimals: i32 = 18): BigDecimal {
  return quantity.divDecimal(
    BigInt.fromI32(10)
      .pow(decimals as u8)
      .toBigDecimal()
  );
}

export function parseEther(quantity: i32, decimals: u8 = 18): BigInt {
  return BigInt.fromI32(quantity).pow(decimals);
}

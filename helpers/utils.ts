import { BigDecimal, BigInt } from "@graphprotocol/graph-ts";
import { TEN_BI } from "./constants";

/**
 * @param amount amount in BigInt
 * @param decimals number of decimal (optional)
 * @notice Parse the amount into a BigDecimal instance expressed in decimals
 */
export function toBigDecimal(amount: BigInt, decimals: i32 = 18): BigDecimal {
  return amount.divDecimal(TEN_BI.pow(decimals as u8).toBigDecimal());
}

/**
 * @param amount amount in ETH (i32)
 * @param decimals number of decimal (optional)
 * @notice Parse the amount into a BigInt instance of the amount of wei.
 */
export function parseEther(amount: i32, decimals: u8 = 18): BigInt {
  const adjuster = TEN_BI.pow(decimals);
  return BigInt.fromI32(amount).times(adjuster);
}

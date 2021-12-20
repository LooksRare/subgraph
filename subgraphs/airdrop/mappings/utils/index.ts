/* eslint-disable prefer-const */
import { BigDecimal, BigInt } from "@graphprotocol/graph-ts";

// BigNumber helpers
export const ZERO_BI = BigInt.zero();
export const ONE_BI = BigInt.fromI32(1);
export const ZERO_BD = BigDecimal.zero();
export const ONE_BD = BigDecimal.fromString("1");

export let currencies: string[] = [
  "0x0000000000000000000000000000000000000000", // ETH
  "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", // WETH
  "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", // USDC
  "0x6b175474e89094c44da98b954eedeac495271d0f", // DAI,
  "0x3845badAde8e6dFF049820680d1F14bD3903a5d0", // SAND
];

export function toBigDecimal(quantity: BigInt, decimals: i32 = 18): BigDecimal {
  return quantity.divDecimal(
    BigInt.fromI32(10)
      .pow(decimals as u8)
      .toBigDecimal()
  );
}

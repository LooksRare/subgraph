import { Address, BigDecimal } from "@graphprotocol/graph-ts";
import { toBigDecimal } from "../../../../helpers/utils";
import { ZERO_BD } from "../../../../helpers/constants";
import { IUniswapV2Pair } from "../../generated/WyvernExchange/IUniswapV2Pair";

// Switch/case is not supported for strings
// https://www.assemblyscript.org/examples/snippets.html#switch-case
function getLpAddress(currency: string): string {
  if (currency == "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48") {
    // USDC
    return "0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc";
  } else if (currency == "0x6b175474e89094c44da98b954eedeac495271d0f") {
    // DAI
    return "0xa478c2975ab1ea89e8196811f51a7b7ade33eb11";
  } else if (currency == "0x3845badade8e6dff049820680d1f14bd3903a5d0") {
    // SAND
    return "0x3dd49f67e9d5bc4c5e6634b3f70bfd9dc1b6bd74";
  } else if (currency == "0x0f5d2fb29fb7d3cfee444a200298f468908cc942") {
    // MANA
    return "0x11b1f53204d03e5529f09eb3091939e4fd8c9cf3";
  } else if (currency == "0x15d4c048f83bd7e37d49ea4c83a07267ec4203da") {
    // GALA
    return "0xbe19c32b4cd202407e8eeb73e4e2949438461ae3";
  } else {
    return "0x0000000000000000000000000000000000000000";
  }
}

export function getPrice(currency: string, decimals: i32): BigDecimal {
  const lpAddress = getLpAddress(currency);

  if (lpAddress == "0x0000000000000000000000000000000000000000") {
    return ZERO_BD;
  }

  const uniswapPair = IUniswapV2Pair.bind(Address.fromString(lpAddress));

  const reserves = uniswapPair.try_getReserves();
  if (!reserves.reverted) {
    const reserve0 = toBigDecimal(reserves.value.value0, decimals);
    const reserve1 = toBigDecimal(reserves.value.value1);
    return reserve0.div(reserve1);
  } else {
    return ZERO_BD;
  }
}

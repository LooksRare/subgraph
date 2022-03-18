/* eslint-disable prefer-const */
import { Address, BigDecimal } from "@graphprotocol/graph-ts";
import { toBigDecimal, ZERO_BD } from ".";
import { AggregatorFeeSharingWithUniswapV3 } from "../../generated/AggregatorFeeSharingWithUniswapV3/AggregatorFeeSharingWithUniswapV3";
import { FeeSharingSystem } from "../../generated/FeeSharingSystem/FeeSharingSystem";
import { AGGREGATOR_ADDRESS, FEE_SHARING_ADDRESS } from "./addresses";

export function fetchTotalAmountStakedAggregator(): BigDecimal {
  let aggregator = AggregatorFeeSharingWithUniswapV3.bind(Address.fromString(AGGREGATOR_ADDRESS));

  let totalShares = aggregator.try_totalShares();
  let pricePerShareInLOOKS = aggregator.try_calculateSharePriceInLOOKS();
  if (!totalShares.reverted && !pricePerShareInLOOKS.reverted) {
    return toBigDecimal(totalShares.value, 18).times(toBigDecimal(pricePerShareInLOOKS.value, 18));
  }

  return ZERO_BD;
}

export function fetchTotalAmountStakedFeeSharing(): BigDecimal {
  let feeSharingSystem = FeeSharingSystem.bind(Address.fromString(FEE_SHARING_ADDRESS));

  let totalShares = feeSharingSystem.try_totalShares();
  let pricePerShareInLOOKS = feeSharingSystem.try_calculateSharePriceInLOOKS();
  if (!totalShares.reverted && !pricePerShareInLOOKS.reverted) {
    return toBigDecimal(totalShares.value, 18).times(toBigDecimal(pricePerShareInLOOKS.value, 18));
  }

  return ZERO_BD;
}

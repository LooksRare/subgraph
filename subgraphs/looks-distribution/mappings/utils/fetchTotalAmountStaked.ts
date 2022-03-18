/* eslint-disable prefer-const */
import { Address, BigDecimal } from "@graphprotocol/graph-ts";
import { toBigDecimal, ZERO_BD } from ".";
import { AggregatorFeeSharingWithUniswapV3 } from "../../generated/AggregatorFeeSharingWithUniswapV3/AggregatorFeeSharingWithUniswapV3";
import { FeeSharingSystem } from "../../generated/FeeSharingSystem/FeeSharingSystem";

export function fetchTotalAmountStakedAggregator(aggregatorAddress: Address): BigDecimal {
  let aggregator = AggregatorFeeSharingWithUniswapV3.bind(aggregatorAddress);

  let totalShares = aggregator.try_totalShares();
  let pricePerShareInLOOKS = aggregator.try_calculateSharePriceInLOOKS();
  if (!totalShares.reverted && !pricePerShareInLOOKS.reverted) {
    return toBigDecimal(totalShares.value.times(pricePerShareInLOOKS.value), 36);
  }

  return ZERO_BD;
}

export function fetchTotalAmountStakedFeeSharing(feeSharingSystemAddress: Address): BigDecimal {
  let feeSharingSystem = FeeSharingSystem.bind(feeSharingSystemAddress);

  let totalShares = feeSharingSystem.try_totalShares();
  let pricePerShareInLOOKS = feeSharingSystem.try_calculateSharePriceInLOOKS();
  if (!totalShares.reverted && !pricePerShareInLOOKS.reverted) {
    return toBigDecimal(totalShares.value.times(pricePerShareInLOOKS.value), 36);
  }

  return ZERO_BD;
}

/* eslint-disable prefer-const */
import { BigDecimal } from "@graphprotocol/graph-ts";
import { toBigDecimal } from "../../../../helpers/utils";
import { ZERO_BD } from "../../../../helpers/constants";
import { AggregatorFeeSharingWithUniswapV3 } from "../../generated/AggregatorFeeSharingWithUniswapV3/AggregatorFeeSharingWithUniswapV3";
import { FeeSharingSystem } from "../../generated/FeeSharingSystem/FeeSharingSystem";
import { AGGREGATOR_ADDRESS, FEE_SHARING_ADDRESS } from "./addresses";

export function fetchTotalAmountStakedAggregator(): BigDecimal {
  let aggregator = AggregatorFeeSharingWithUniswapV3.bind(AGGREGATOR_ADDRESS);

  let totalShares = aggregator.try_totalShares();
  let pricePerShareInLOOKS = aggregator.try_calculateSharePriceInLOOKS();
  if (!totalShares.reverted && !pricePerShareInLOOKS.reverted) {
    return toBigDecimal(totalShares.value).times(toBigDecimal(pricePerShareInLOOKS.value));
  }

  return ZERO_BD;
}

export function fetchTotalAmountStakedFeeSharing(): BigDecimal {
  let feeSharingSystem = FeeSharingSystem.bind(FEE_SHARING_ADDRESS);

  let totalShares = feeSharingSystem.try_totalShares();
  let pricePerShareInLOOKS = feeSharingSystem.try_calculateSharePriceInLOOKS();
  if (!totalShares.reverted && !pricePerShareInLOOKS.reverted) {
    return toBigDecimal(totalShares.value).times(toBigDecimal(pricePerShareInLOOKS.value));
  }

  return ZERO_BD;
}

import { BigDecimal } from "@graphprotocol/graph-ts";
import { AGGREGATOR_ADDRESS, FEE_SHARING_ADDRESS } from "../config/addresses";
import { AggregatorFeeSharingWithUniswapV3 } from "../../../generated/AggregatorFeeSharingWithUniswapV3/AggregatorFeeSharingWithUniswapV3";
import { FeeSharingSystem } from "../../../generated/FeeSharingSystem/FeeSharingSystem";
import { toBigDecimal } from "../../../../../helpers/utils";
import { ZERO_BD } from "../../../../../helpers/constants";

export function fetchTotalAmountStakedAggregator(): BigDecimal {
  const aggregator = AggregatorFeeSharingWithUniswapV3.bind(AGGREGATOR_ADDRESS);
  const totalShares = aggregator.try_totalShares();
  const pricePerShareInLOOKS = aggregator.try_calculateSharePriceInLOOKS();
  if (!totalShares.reverted && !pricePerShareInLOOKS.reverted) {
    return toBigDecimal(totalShares.value).times(toBigDecimal(pricePerShareInLOOKS.value));
  }
  return ZERO_BD;
}

export function fetchTotalAmountStakedFeeSharing(): BigDecimal {
  const feeSharingSystem = FeeSharingSystem.bind(FEE_SHARING_ADDRESS);
  const totalShares = feeSharingSystem.try_totalShares();
  const pricePerShareInLOOKS = feeSharingSystem.try_calculateSharePriceInLOOKS();
  if (!totalShares.reverted && !pricePerShareInLOOKS.reverted) {
    return toBigDecimal(totalShares.value).times(toBigDecimal(pricePerShareInLOOKS.value));
  }
  return ZERO_BD;
}

import { Address, BigInt } from "@graphprotocol/graph-ts";
import { AGGREGATOR_ADDRESS, FEE_SHARING_ADDRESS } from "../config/addresses";
import { AggregatorFeeSharingWithUniswapV3 } from "../../../generated/AggregatorFeeSharingWithUniswapV3/AggregatorFeeSharingWithUniswapV3";
import { FeeSharingSystem } from "../../../generated/FeeSharingSystem/FeeSharingSystem";

export function fetchSharesAggregator(user: Address): BigInt {
  const aggregator = AggregatorFeeSharingWithUniswapV3.bind(AGGREGATOR_ADDRESS);
  const userInfo = aggregator.try_userInfo(user);
  if (!userInfo.reverted) {
    return userInfo.value;
  }
  return BigInt.zero();
}

export function fetchSharesFeeSharingSystem(user: Address): BigInt {
  const feeSharingSystem = FeeSharingSystem.bind(FEE_SHARING_ADDRESS);
  const userInfo = feeSharingSystem.try_userInfo(user);
  if (!userInfo.reverted) {
    return userInfo.value.value0;
  }
  return BigInt.zero();
}

/* eslint-disable prefer-const */
import { Address, BigInt } from "@graphprotocol/graph-ts";
import { AggregatorFeeSharingWithUniswapV3 } from "../../generated/AggregatorFeeSharingWithUniswapV3/AggregatorFeeSharingWithUniswapV3";
import { FeeSharingSystem } from "../../generated/FeeSharingSystem/FeeSharingSystem";

export function fetchSharesAggregator(aggregatorAddress: Address, user: Address): BigInt {
  let aggregator = AggregatorFeeSharingWithUniswapV3.bind(aggregatorAddress);

  let userInfo = aggregator.try_userInfo(user);
  if (!userInfo.reverted) {
    return userInfo.value;
  }

  return BigInt.zero();
}
export function fetchSharesFeeSharingSystem(feeSharingSystemAddress: Address, user: Address): BigInt {
  let feeSharingSystem = FeeSharingSystem.bind(feeSharingSystemAddress);

  let userInfo = feeSharingSystem.try_userInfo(user);
  if (!userInfo.reverted) {
    return userInfo.value.value0;
  }

  return BigInt.zero();
}

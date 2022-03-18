/* eslint-disable prefer-const */
import { Address, BigInt } from "@graphprotocol/graph-ts";
import { AggregatorFeeSharingWithUniswapV3 } from "../../generated/AggregatorFeeSharingWithUniswapV3/AggregatorFeeSharingWithUniswapV3";
import { FeeSharingSystem } from "../../generated/FeeSharingSystem/FeeSharingSystem";
import { AGGREGATOR_ADDRESS, FEE_SHARING_ADDRESS } from "./addresses";

export function fetchSharesAggregator(user: Address): BigInt {
  let aggregator = AggregatorFeeSharingWithUniswapV3.bind(Address.fromString(AGGREGATOR_ADDRESS));

  let userInfo = aggregator.try_userInfo(user);
  if (!userInfo.reverted) {
    return userInfo.value;
  }

  return BigInt.zero();
}
export function fetchSharesFeeSharingSystem(user: Address): BigInt {
  let feeSharingSystem = FeeSharingSystem.bind(Address.fromString(FEE_SHARING_ADDRESS));

  let userInfo = feeSharingSystem.try_userInfo(user);
  if (!userInfo.reverted) {
    return userInfo.value.value0;
  }

  return BigInt.zero();
}

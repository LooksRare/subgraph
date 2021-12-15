/* eslint-disable prefer-const */
import { Address, BigInt } from "@graphprotocol/graph-ts";
import { IExecutionStrategy } from "../../generated/LooksRareExchange/IExecutionStrategy";

export function fetchProtocolFee(strategy: Address): BigInt {
  let executionStrategy = IExecutionStrategy.bind(strategy);

  let protocolFee = executionStrategy.try_viewProtocolFee();
  if (!protocolFee.reverted) {
    return protocolFee.value;
  }

  return BigInt.fromI32(0);
}

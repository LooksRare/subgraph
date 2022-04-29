import { Address, BigInt } from "@graphprotocol/graph-ts";
import { IExecutionStrategy } from "../../generated/LooksRareExchange/IExecutionStrategy";

export function fetchProtocolFee(strategy: Address): BigInt {
  const executionStrategy = IExecutionStrategy.bind(strategy);

  const protocolFee = executionStrategy.try_viewProtocolFee();
  if (!protocolFee.reverted) {
    return protocolFee.value;
  }

  return BigInt.zero();
}

/* eslint-disable prefer-const */
import { Address, BigInt } from "@graphprotocol/graph-ts";
import { ERC20 } from "../../generated/WyvernExchange/ERC20";

export function fetchName(address: Address): string {
  let contract = ERC20.bind(address);

  let nameResult = contract.try_name();
  if (!nameResult.reverted) {
    return nameResult.value;
  }

  return "Ethereum";
}

export function fetchSymbol(address: Address): string {
  let contract = ERC20.bind(address);

  let symbolResult = contract.try_symbol();
  if (!symbolResult.reverted) {
    return symbolResult.value;
  }

  return "ETH";
}

export function fetchDecimals(address: Address): BigInt {
  let contract = ERC20.bind(address);

  let decimalResult = contract.try_decimals();
  if (!decimalResult.reverted) {
    return BigInt.fromI32(decimalResult.value);
  }

  return BigInt.fromI32(18);
}

/* eslint-disable prefer-const */
import { Address } from "@graphprotocol/graph-ts";
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

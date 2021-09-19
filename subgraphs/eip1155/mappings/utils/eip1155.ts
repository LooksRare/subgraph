/* eslint-disable prefer-const */
import { Address, BigInt } from "@graphprotocol/graph-ts";
import { EIP1155 } from "../../generated/EIP1155/EIP1155";

export function fetchName(address: Address): string {
  let contract = EIP1155.bind(address);

  let nameResult = contract.try_name();
  if (!nameResult.reverted) {
    return nameResult.value;
  }

  return "unknown";
}

export function fetchSymbol(address: Address): string {
  let contract = EIP1155.bind(address);

  let symbolResult = contract.try_symbol();
  if (!symbolResult.reverted) {
    return symbolResult.value;
  }

  return "unknown";
}

export function fetchURI(address: Address, tokenID: BigInt): string | null {
  let contract = EIP1155.bind(address);

  let uriResult = contract.try_uri(tokenID);
  if (!uriResult.reverted) {
    return uriResult.value;
  }

  return null;
}

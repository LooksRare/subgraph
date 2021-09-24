/* eslint-disable prefer-const */
import { Address, BigInt } from "@graphprotocol/graph-ts";
import { EIP721 } from "../../generated/EIP721/EIP721";

export function fetchName(address: Address): string {
  let contract = EIP721.bind(address);

  let nameResult = contract.try_name();
  if (!nameResult.reverted) {
    return nameResult.value;
  }

  return "unknown";
}

export function fetchSymbol(address: Address): string {
  let contract = EIP721.bind(address);

  let symbolResult = contract.try_symbol();
  if (!symbolResult.reverted) {
    return symbolResult.value;
  }

  return "unknown";
}

export function fetchTokenURI(address: Address, tokenID: BigInt): string | null {
  let contract = EIP721.bind(address);

  let uriResult = contract.try_tokenURI(tokenID);
  if (!uriResult.reverted) {
    return uriResult.value;
  }

  return null;
}

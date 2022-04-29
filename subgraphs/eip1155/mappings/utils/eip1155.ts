import { Address, BigInt } from "@graphprotocol/graph-ts";
import { EIP1155 } from "../../generated/EIP1155/EIP1155";

export function fetchName(address: Address): string {
  const contract = EIP1155.bind(address);

  const nameResult = contract.try_name();
  if (!nameResult.reverted) {
    return nameResult.value;
  }

  return "unknown";
}

export function fetchSymbol(address: Address): string {
  const contract = EIP1155.bind(address);

  const symbolResult = contract.try_symbol();
  if (!symbolResult.reverted) {
    return symbolResult.value;
  }

  return "unknown";
}

export function fetchURI(address: Address, tokenID: BigInt): string | null {
  const contract = EIP1155.bind(address);

  const uriResult = contract.try_uri(tokenID);
  if (!uriResult.reverted) {
    return uriResult.value;
  }

  return null;
}

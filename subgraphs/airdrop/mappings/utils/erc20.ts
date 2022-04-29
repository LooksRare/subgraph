import { Address, BigInt } from "@graphprotocol/graph-ts";
import { ERC20 } from "../../generated/WyvernExchange/ERC20";

export function fetchName(address: Address): string {
  const contract = ERC20.bind(address);

  const nameResult = contract.try_name();
  if (!nameResult.reverted) {
    return nameResult.value;
  }

  return "Ethereum";
}

export function fetchSymbol(address: Address): string {
  const contract = ERC20.bind(address);

  const symbolResult = contract.try_symbol();
  if (!symbolResult.reverted) {
    return symbolResult.value;
  }

  return "ETH";
}

export function fetchDecimals(address: Address): BigInt {
  const contract = ERC20.bind(address);

  const decimalResult = contract.try_decimals();
  if (!decimalResult.reverted) {
    return BigInt.fromI32(decimalResult.value);
  }

  return BigInt.fromI32(18);
}

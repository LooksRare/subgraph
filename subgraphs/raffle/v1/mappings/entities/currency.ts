import { Address } from "@graphprotocol/graph-ts";
import { ZERO_ADDRESS } from "../../../../../helpers/constants";
import { Currency } from "../../generated/schema";
import { fetchDecimals, fetchName, fetchSymbol } from "../utils/ERC20";

export function initializeCurrency(address: Address): Currency {
  const currency = Currency.load(address.toHex());
  if (currency === null) {
    const newCurrency = new Currency(address.toHex());
    newCurrency.name = fetchName(address);
    newCurrency.symbol = fetchSymbol(address);
    newCurrency.decimals = fetchDecimals(address);
    newCurrency.isAllowed = address.equals(ZERO_ADDRESS) ? true : false;
    newCurrency.save();

    return newCurrency;
  }

  return currency;
}

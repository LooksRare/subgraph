import { Bytes } from "@graphprotocol/graph-ts";
import { ZERO_BD, ZERO_BI } from "../../../../helpers/constants";
import { User, UserByCurrency } from "../../generated/schema";

export function getOrInitializeUserByCurrency(user: User, currency: Bytes): UserByCurrency {
  const userByCurrencyID = `${user.id}-${currency.toHexString()}`;
  let userByCurrency = UserByCurrency.load(userByCurrencyID);
  if (!userByCurrency) {
    userByCurrency = new UserByCurrency(userByCurrencyID);
    userByCurrency.currency = currency;
    userByCurrency.volume = ZERO_BD;
    userByCurrency.transactions = ZERO_BI;
    userByCurrency.user = user.id;
  }
  return userByCurrency;
}

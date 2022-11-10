import { BigInt } from "@graphprotocol/graph-ts";
import { ZERO_BI, ZERO_BD, ONE_DAY_BI } from "../../../../helpers/constants";
import { UserByCurrency, UserDailyData, UserDailyDataByCurrency } from "../../generated/schema";

export function getOrInitializeUserDailyDataByCurrency(
  userDailyData: UserDailyData,
  userByCurrency: UserByCurrency,
  dayID: BigInt
): UserDailyDataByCurrency {
  const userDailyDataByCurrencyID = `${userByCurrency.id}-${dayID.toString()}`;
  let userDailyDataByCurrency = UserDailyDataByCurrency.load(userDailyDataByCurrencyID);
  if (!userDailyDataByCurrency) {
    userDailyDataByCurrency = new UserDailyDataByCurrency(userDailyDataByCurrencyID);
    const dayStartTimestamp = dayID.times(ONE_DAY_BI);
    userDailyDataByCurrency.date = dayStartTimestamp;
    userDailyDataByCurrency.currency = userByCurrency.currency;
    userDailyDataByCurrency.volume = ZERO_BD;
    userDailyDataByCurrency.transactions = ZERO_BI;
    userDailyDataByCurrency.userByCurrency = userByCurrency.id;
    userDailyDataByCurrency.userDailyData = userDailyData.id;
  }
  return userDailyDataByCurrency;
}

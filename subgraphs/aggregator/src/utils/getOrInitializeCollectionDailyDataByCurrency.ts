import { BigInt } from "@graphprotocol/graph-ts";
import { ZERO_BD, ZERO_BI, ONE_DAY_BI } from "../../../../helpers/constants";
import { CollectionByCurrency, CollectionDailyDataByCurrency } from "../../generated/schema";

export function getOrInitializeCollectionDailyDataByCurrency(
  collectionByCurrency: CollectionByCurrency,
  dayID: BigInt
): CollectionDailyDataByCurrency {
  const collectionDailyDataByCurrencyID = `${collectionByCurrency.id}-${dayID.toString()}`;
  let collectionDailyDataByCurrency = CollectionDailyDataByCurrency.load(collectionDailyDataByCurrencyID);
  if (!collectionDailyDataByCurrency) {
    collectionDailyDataByCurrency = new CollectionDailyDataByCurrency(collectionDailyDataByCurrencyID);
    const dayStartTimestamp = dayID.times(ONE_DAY_BI);
    collectionDailyDataByCurrency.date = dayStartTimestamp;
    collectionDailyDataByCurrency.currency = collectionByCurrency.currency;
    collectionDailyDataByCurrency.volume = ZERO_BD;
    collectionDailyDataByCurrency.transactions = ZERO_BI;
    collectionDailyDataByCurrency.collectionByCurrency = collectionByCurrency.id;
  }
  return collectionDailyDataByCurrency;
}

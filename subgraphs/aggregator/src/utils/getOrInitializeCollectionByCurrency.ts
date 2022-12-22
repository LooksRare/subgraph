import { Bytes } from "@graphprotocol/graph-ts";
import { ZERO_BD, ZERO_BI } from "../../../../helpers/constants";
import { CollectionByCurrency } from "../../generated/schema";

export function getOrInitializeCollectionByCurrency(collection: Bytes, currency: Bytes): CollectionByCurrency {
  const collectionByCurrencyID = `${collection.toHexString()}-${currency.toHexString()}`;
  let collectionByCurrency = CollectionByCurrency.load(collectionByCurrencyID);
  if (!collectionByCurrency) {
    collectionByCurrency = new CollectionByCurrency(collectionByCurrencyID);
    collectionByCurrency.currency = currency;
    collectionByCurrency.volume = ZERO_BD;
    collectionByCurrency.transactions = ZERO_BI;
  }
  return collectionByCurrency;
}

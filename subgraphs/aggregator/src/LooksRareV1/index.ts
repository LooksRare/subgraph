import { ONE_BI, ZERO_BI } from "../../../../helpers/constants";
import { TakerBid } from "../../generated/LooksRareV1/LooksRareExchange";
import { Collection } from "../../generated/schema";

export function handleTakerBid(event: TakerBid): void {
  const collectionID = event.params.collection.toHexString();
  let collection = Collection.load(collectionID);
  if (!collection) {
    collection = new Collection(collectionID);
    collection.transactions = ZERO_BI;

    // New aggregator/marketplace user
    // aggregator.collections = aggregator.collections.plus(ONE_BI);
    // aggregatorByCurrency.collections = aggregatorByCurrency.collections.plus(ONE_BI);
    // marketplace.collections = marketplace.collections.plus(ONE_BI);
    // marketplaceByCurrency.collections = marketplaceByCurrency.collections.plus(ONE_BI);
  }
  collection.transactions = collection.transactions.plus(ONE_BI);

  collection.save();
}

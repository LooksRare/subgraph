import { Collection } from "../generated/schema";
import { RoyaltyFeeUpdate } from "../generated/RoyaltyFeeRegistry/RoyaltyFeeRegistry";
import { toBigDecimal } from "../../../helpers/utils";
import { ZERO_ADDRESS, ZERO_BD, ZERO_BI, ONE_BI } from "../../../helpers/constants";

export function handleRoyaltyFeeUpdate(event: RoyaltyFeeUpdate): void {
  let collection = Collection.load(event.params.collection.toHex());
  if (collection === null) {
    collection = new Collection(event.params.collection.toHex());
    collection.setter = ZERO_ADDRESS;
    collection.receiver = ZERO_ADDRESS;
    collection.royaltyFee = ZERO_BD;
    collection.maxRoyaltyFee = ZERO_BD;
    collection.firstUpdateBlock = event.block.number;
    collection.firstUpdateDate = event.block.timestamp;
    collection.lastUpdateBlock = ZERO_BI;
    collection.lastUpdateDate = ZERO_BI;
    collection.numberChanges = ZERO_BI;
  }

  collection.setter = event.params.setter;
  collection.receiver = event.params.receiver;

  if (toBigDecimal(event.params.fee, 2).gt(collection.royaltyFee)) {
    collection.maxRoyaltyFee = toBigDecimal(event.params.fee, 2);
  }

  collection.royaltyFee = toBigDecimal(event.params.fee, 2);
  collection.lastUpdateBlock = event.block.number;
  collection.lastUpdateDate = event.block.timestamp;
  collection.numberChanges = collection.numberChanges.plus(ONE_BI);
  collection.save();
}

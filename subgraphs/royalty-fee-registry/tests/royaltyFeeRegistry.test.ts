import { Address, BigInt } from "@graphprotocol/graph-ts";
import { assert, clearStore, log, test } from "matchstick-as/assembly/index";
import { createRoyaltyFeeUpdateEvent } from "./helpers/utils";
import { Collection } from "../generated/schema";
import { handleRoyaltyFeeUpdate } from "../mappings";
import { ONE_BI } from "../../../helpers/constants";

test("RoyaltyFeeUpdate", () => {
  const collectionAddress = Address.fromString("0xF7c68B84A8ad29A61AF42FC31cEF1964dd80f8Ea");
  const setterAddress = Address.fromString("0x0000000000000000000000000000000000000001");
  const receiverAddress = Address.fromString("0x0000000000000000000000000000000000000002");
  let fee = BigInt.fromI32(200); // 2%

  let newRoyaltyEvent = createRoyaltyFeeUpdateEvent(collectionAddress, setterAddress, receiverAddress, fee);
  handleRoyaltyFeeUpdate(newRoyaltyEvent);

  let collection = Collection.load(collectionAddress.toHex());
  if (collection !== null) {
    assert.bytesEquals(collection.setter, setterAddress);
    assert.bytesEquals(collection.receiver, receiverAddress);
    assert.stringEquals(collection.royaltyFee.toString(), fee.div(BigInt.fromI32(100)).toString());
    assert.stringEquals(collection.maxRoyaltyFee.toString(), collection.royaltyFee.toString());
    assert.bigIntEquals(collection.firstUpdateBlock, ONE_BI);
    assert.bigIntEquals(collection.firstUpdateBlock, collection.lastUpdateBlock);
    assert.bigIntEquals(collection.lastUpdateDate, ONE_BI);
    assert.bigIntEquals(collection.numberChanges, ONE_BI);
  } else {
    log.warning("Collection doesn't exist", []);
  }

  fee = BigInt.fromI32(400); // 4%
  newRoyaltyEvent = createRoyaltyFeeUpdateEvent(collectionAddress, setterAddress, receiverAddress, fee);
  handleRoyaltyFeeUpdate(newRoyaltyEvent);

  collection = Collection.load(collectionAddress.toHex());
  if (collection !== null) {
    assert.bigIntEquals(collection.numberChanges, BigInt.fromI32(2));
    assert.stringEquals(collection.royaltyFee.toString(), "4");
    assert.stringEquals(collection.maxRoyaltyFee.toString(), collection.royaltyFee.toString());
  } else {
    log.warning("Collection doesn't exist", []);
  }

  fee = BigInt.fromI32(150); // 1.5%
  newRoyaltyEvent = createRoyaltyFeeUpdateEvent(collectionAddress, setterAddress, receiverAddress, fee);
  handleRoyaltyFeeUpdate(newRoyaltyEvent);

  collection = Collection.load(collectionAddress.toHex());
  if (collection !== null) {
    assert.bigIntEquals(collection.numberChanges, BigInt.fromI32(3));
    assert.stringEquals(collection.royaltyFee.toString(), "1.5");
    assert.stringEquals(collection.maxRoyaltyFee.toString(), "4");
  } else {
    log.warning("Collection doesn't exist", []);
  }

  clearStore();
});

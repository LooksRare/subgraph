import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { newMockEvent } from "matchstick-as";
import { RoyaltyFeeUpdate } from "../../generated/RoyaltyFeeRegistry/RoyaltyFeeRegistry";

/**
 * @param collection
 * @param setter
 * @param receiver
 * @param fee
 * @returns RoyaltyFeeUpdate Event
 */
export function createRoyaltyFeeUpdateEvent(
  collection: Address,
  setter: Address,
  receiver: Address,
  fee: BigInt
): RoyaltyFeeUpdate {
  const mockEvent = newMockEvent();
  const newRoyaltyFeeUpdateEvent = new RoyaltyFeeUpdate(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters
  );

  newRoyaltyFeeUpdateEvent.parameters = [];

  const collectionParam = new ethereum.EventParam("collection", ethereum.Value.fromAddress(collection));
  const setterParam = new ethereum.EventParam("setter", ethereum.Value.fromAddress(setter));
  const receiverParam = new ethereum.EventParam("receiver", ethereum.Value.fromAddress(receiver));
  const feeParam = new ethereum.EventParam("fee", ethereum.Value.fromSignedBigInt(fee));

  newRoyaltyFeeUpdateEvent.parameters.push(collectionParam);
  newRoyaltyFeeUpdateEvent.parameters.push(setterParam);
  newRoyaltyFeeUpdateEvent.parameters.push(receiverParam);
  newRoyaltyFeeUpdateEvent.parameters.push(feeParam);

  return newRoyaltyFeeUpdateEvent;
}

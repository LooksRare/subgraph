import { Address, BigInt, Bytes, ethereum, Wrapped } from "@graphprotocol/graph-ts";
import { newMockEvent } from "matchstick-as";
import { OrderFulfilled } from "../../generated/Seaport/Seaport";

/**
 * @param amount amount in ETH (i64)
 * @param decimals number of decimal (optional)
 * @notice Parse the amount into a BigInt instance of the amount of wei.
 */
export function parseEther(amount: i64, decimals: u8 = 18): BigInt {
  const adjuster = BigInt.fromI64(10).pow(decimals);
  return BigInt.fromI64(amount).times(adjuster);
}

export function createOrderFulfilledEvent(
  orderHash: string,
  offerer: string,
  zone: string,
  recipient: string,
  offerItemType: i32,
  offerToken: string,
  offerIdentifier: i32,
  offerAmount: i32,
  considerationItemType: i32,
  considerationToken: string,
  considerationIdentifier: i32,
  considerationAmounts: Array<string>,
  considerationRecipients: Array<string>
): OrderFulfilled {
  const mockEvent = newMockEvent();
  const orderFulfilledEvent = new OrderFulfilled(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    [],
    mockEvent.receipt
  );

  const orderHashParam = new ethereum.EventParam("orderHash", ethereum.Value.fromString(orderHash));
  const offererParam = new ethereum.EventParam("offerer", ethereum.Value.fromAddress(Address.fromString(offerer)));
  const zoneParam = new ethereum.EventParam("zone", ethereum.Value.fromAddress(Address.fromString(zone)));
  const recipientParam = new ethereum.EventParam(
    "recipient",
    ethereum.Value.fromAddress(Address.fromString(recipient))
  );

  const offer: Array<ethereum.Value> = [
    ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(offerItemType)),
    ethereum.Value.fromAddress(Address.fromString(offerToken)),
    ethereum.Value.fromI32(offerIdentifier),
    ethereum.Value.fromI32(offerAmount),
  ];

  const offerTuple = changetype<ethereum.Tuple>(offer);
  const offerTupleArray: Array<ethereum.Tuple> = [offerTuple];
  const offerParam = new ethereum.EventParam("offer", ethereum.Value.fromTupleArray(offerTupleArray));

  const considerationTupleArray: Array<ethereum.Tuple> = [];

  for (let i = 0; i < considerationAmounts.length; i++) {
    const consideration: Array<ethereum.Value> = [
      ethereum.Value.fromI32(considerationItemType),
      ethereum.Value.fromAddress(Address.fromString(considerationToken)),
      ethereum.Value.fromI32(considerationIdentifier),
      ethereum.Value.fromUnsignedBigInt(BigInt.fromString(considerationAmounts[i])),
      ethereum.Value.fromAddress(Address.fromString(considerationRecipients[i])),
    ];

    const considerationTuple = changetype<ethereum.Tuple>(consideration);
    considerationTupleArray.push(considerationTuple);
  }

  const considerationParam = new ethereum.EventParam(
    "consideration",
    ethereum.Value.fromTupleArray(considerationTupleArray)
  );

  orderFulfilledEvent.parameters.push(orderHashParam);
  orderFulfilledEvent.parameters.push(offererParam);
  orderFulfilledEvent.parameters.push(zoneParam);
  orderFulfilledEvent.parameters.push(recipientParam);
  orderFulfilledEvent.parameters.push(offerParam);
  orderFulfilledEvent.parameters.push(considerationParam);

  return orderFulfilledEvent;
}

export function newLog(address: Address, topics: Array<Bytes>): ethereum.Log {
  // Copied from https://github.com/LimeChain/matchstick-as/blob/886a3ff95bc760ccacec06d23c577d332ae03e4d/assembly/defaults.ts#L35
  const defaultAddress = Address.fromString("0xA16081F360e3847006dB660bae1c6d1b2e17eC2A");
  const defaultAddressBytes = defaultAddress as Bytes;
  const defaultBigInt = BigInt.fromI32(1);
  const defaultIntBytes = Bytes.fromI32(1);
  const defaultEventDataLogType = "default_log_type";

  return new ethereum.Log(
    address,
    topics,
    defaultAddressBytes, // data
    defaultAddressBytes, // blockHash
    defaultIntBytes, // blockNumber
    defaultAddressBytes, // transactionHash
    defaultBigInt, // transactionIndex
    defaultBigInt, // logIndex
    defaultBigInt, // transactionLogIndex
    defaultEventDataLogType, // logType
    new Wrapped(false) // removed
  );
}
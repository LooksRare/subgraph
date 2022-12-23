import { Address, BigInt, Bytes, ethereum, Wrapped } from "@graphprotocol/graph-ts";
import { newMockEvent } from "matchstick-as";
import { TakerBid } from "../../generated/LooksRareV1/LooksRareExchange";
import { OrderFulfilled } from "../../generated/Seaport/Seaport";

const stringEventParam = (key: string, value: string): ethereum.EventParam =>
  new ethereum.EventParam(key, ethereum.Value.fromString(value));

const addressEventParam = (key: string, value: string): ethereum.EventParam =>
  new ethereum.EventParam(key, ethereum.Value.fromAddress(Address.fromString(value)));

const uintEventParam = (key: string, value: i32): ethereum.EventParam =>
  new ethereum.EventParam(key, ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(value)));

export function createOrderFulfilledEvent(
  orderHash: string,
  offerer: string,
  zone: string,
  recipient: string,
  offerItemTypes: Array<i32>,
  offerTokens: Array<string>,
  offerIdentifiers: Array<i32>,
  offerAmounts: Array<i32>,
  considerationItemTypes: Array<i32>,
  considerationTokens: Array<string>,
  considerationIdentifiers: Array<i32>,
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

  const orderHashParam = stringEventParam("orderHash", orderHash);
  const offererParam = addressEventParam("offerer", offerer);
  const zoneParam = addressEventParam("zone", zone);
  const recipientParam = addressEventParam("recipient", recipient);

  const offerTupleArray: Array<ethereum.Tuple> = [];

  for (let i = 0; i < offerAmounts.length; i++) {
    const offer: Array<ethereum.Value> = [
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(offerItemTypes[i])),
      ethereum.Value.fromAddress(Address.fromString(offerTokens[i])),
      ethereum.Value.fromI32(offerIdentifiers[i]),
      ethereum.Value.fromI32(offerAmounts[i]),
    ];

    const offerTuple = changetype<ethereum.Tuple>(offer);
    offerTupleArray.push(offerTuple);
  }

  const offerParam = new ethereum.EventParam("offer", ethereum.Value.fromTupleArray(offerTupleArray));

  const considerationTupleArray: Array<ethereum.Tuple> = [];

  for (let i = 0; i < considerationAmounts.length; i++) {
    const consideration: Array<ethereum.Value> = [
      ethereum.Value.fromI32(considerationItemTypes[i]),
      ethereum.Value.fromAddress(Address.fromString(considerationTokens[i])),
      ethereum.Value.fromI32(considerationIdentifiers[i]),
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

export function createTakerBidEvent(
  orderHash: string,
  orderNonce: i32,
  taker: string,
  maker: string,
  strategy: string,
  currency: string,
  collection: string,
  tokenId: i32,
  price: i64
): TakerBid {
  const mockEvent = newMockEvent();
  const takerBidEvent = new TakerBid(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    [],
    mockEvent.receipt
  );

  const orderHashParam = stringEventParam("orderHash", orderHash);
  const orderNonceParam = uintEventParam("orderNonce", orderNonce);
  const takerParam = addressEventParam("taker", taker);
  const makerParam = addressEventParam("maker", maker);
  const strategyParam = addressEventParam("strategy", strategy);
  const currencyParam = addressEventParam("currency", currency);
  const collectionParam = addressEventParam("collection", collection);
  const tokenIdParam = uintEventParam("tokenId", tokenId);
  const amountParam = uintEventParam("amount", 1);
  const priceParam = new ethereum.EventParam("price", ethereum.Value.fromUnsignedBigInt(BigInt.fromI64(price)));

  takerBidEvent.parameters.push(orderHashParam);
  takerBidEvent.parameters.push(orderNonceParam);
  takerBidEvent.parameters.push(takerParam);
  takerBidEvent.parameters.push(makerParam);
  takerBidEvent.parameters.push(strategyParam);
  takerBidEvent.parameters.push(currencyParam);
  takerBidEvent.parameters.push(collectionParam);
  takerBidEvent.parameters.push(tokenIdParam);
  takerBidEvent.parameters.push(amountParam);
  takerBidEvent.parameters.push(priceParam);

  return takerBidEvent;
}

export function newLog(address: Address, topics: Array<Bytes>, transactionLogIndex: BigInt): ethereum.Log {
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
    transactionLogIndex,
    defaultEventDataLogType, // logType
    new Wrapped(false) // removed
  );
}

import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { newMockEvent } from "matchstick-as";
import { RoyaltyPayment, TakerAsk, TakerBid } from "../../generated/LooksRareExchange/LooksRareExchange";

/**
 * @param orderHash
 * @param orderNonce
 * @param taker
 * @param maker
 * @param strategy
 * @param currency
 * @param collection
 * @param tokenId
 * @param amount
 * @param price
 * @returns TakerAsk Event
 */
export function createTakerAskEvent(
  orderHash: Bytes,
  orderNonce: BigInt,
  taker: Address,
  maker: Address,
  strategy: Address,
  currency: Address,
  collection: Address,
  tokenId: BigInt,
  amount: BigInt,
  price: BigInt
): TakerAsk {
  const mockEvent = newMockEvent();
  const newTakerAskEvent = new TakerAsk(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters
  );

  newTakerAskEvent.parameters = [];

  const orderHashParam = new ethereum.EventParam("orderHash", ethereum.Value.fromBytes(orderHash));
  const orderNonceParam = new ethereum.EventParam("orderNonce", ethereum.Value.fromSignedBigInt(orderNonce));
  const takerParam = new ethereum.EventParam("taker", ethereum.Value.fromAddress(taker));
  const makerParam = new ethereum.EventParam("maker", ethereum.Value.fromAddress(maker));
  const strategyParam = new ethereum.EventParam("strategy", ethereum.Value.fromAddress(strategy));
  const currencyParam = new ethereum.EventParam("currency", ethereum.Value.fromAddress(currency));
  const collectionParam = new ethereum.EventParam("collection", ethereum.Value.fromAddress(collection));
  const tokenIdParam = new ethereum.EventParam("tokenId", ethereum.Value.fromSignedBigInt(tokenId));
  const amountParam = new ethereum.EventParam("amount", ethereum.Value.fromSignedBigInt(amount));
  const priceParam = new ethereum.EventParam("price", ethereum.Value.fromSignedBigInt(price));

  newTakerAskEvent.parameters.push(orderHashParam);
  newTakerAskEvent.parameters.push(orderNonceParam);
  newTakerAskEvent.parameters.push(takerParam);
  newTakerAskEvent.parameters.push(makerParam);
  newTakerAskEvent.parameters.push(strategyParam);
  newTakerAskEvent.parameters.push(currencyParam);
  newTakerAskEvent.parameters.push(collectionParam);
  newTakerAskEvent.parameters.push(tokenIdParam);
  newTakerAskEvent.parameters.push(amountParam);
  newTakerAskEvent.parameters.push(priceParam);

  return newTakerAskEvent;
}

/**
 * @param orderHash
 * @param orderNonce
 * @param taker
 * @param maker
 * @param strategy
 * @param currency
 * @param collection
 * @param tokenId
 * @param amount
 * @param price
 * @returns TakerBid Event
 */
export function createTakerBidEvent(
  orderHash: Bytes,
  orderNonce: BigInt,
  taker: Address,
  maker: Address,
  strategy: Address,
  currency: Address,
  collection: Address,
  tokenId: BigInt,
  amount: BigInt,
  price: BigInt
): TakerBid {
  const mockEvent = newMockEvent();
  const newTakerBidEvent = new TakerBid(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters
  );

  newTakerBidEvent.parameters = [];

  const orderHashParam = new ethereum.EventParam("orderHash", ethereum.Value.fromBytes(orderHash));
  const orderNonceParam = new ethereum.EventParam("orderNonce", ethereum.Value.fromSignedBigInt(orderNonce));
  const takerParam = new ethereum.EventParam("taker", ethereum.Value.fromAddress(taker));
  const makerParam = new ethereum.EventParam("maker", ethereum.Value.fromAddress(maker));
  const strategyParam = new ethereum.EventParam("strategy", ethereum.Value.fromAddress(strategy));
  const currencyParam = new ethereum.EventParam("currency", ethereum.Value.fromAddress(currency));
  const collectionParam = new ethereum.EventParam("collection", ethereum.Value.fromAddress(collection));
  const tokenIdParam = new ethereum.EventParam("tokenId", ethereum.Value.fromSignedBigInt(tokenId));
  const amountParam = new ethereum.EventParam("amount", ethereum.Value.fromSignedBigInt(amount));
  const priceParam = new ethereum.EventParam("price", ethereum.Value.fromSignedBigInt(price));

  newTakerBidEvent.parameters.push(orderHashParam);
  newTakerBidEvent.parameters.push(orderNonceParam);
  newTakerBidEvent.parameters.push(takerParam);
  newTakerBidEvent.parameters.push(makerParam);
  newTakerBidEvent.parameters.push(strategyParam);
  newTakerBidEvent.parameters.push(currencyParam);
  newTakerBidEvent.parameters.push(collectionParam);
  newTakerBidEvent.parameters.push(tokenIdParam);
  newTakerBidEvent.parameters.push(amountParam);
  newTakerBidEvent.parameters.push(priceParam);

  return newTakerBidEvent;
}

/**
 * @param collection
 * @param tokenId
 * @param royaltyRecipient
 * @param currency
 * @param amount
 * @returns RoyaltyPayment Event
 */
export function createRoyaltyPaymentEvent(
  collection: Address,
  tokenId: BigInt,
  royaltyRecipient: Address,
  currency: Address,
  amount: BigInt
): RoyaltyPayment {
  const mockEvent = newMockEvent();
  const newRoyaltyPaymentEvent = new RoyaltyPayment(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters
  );

  newRoyaltyPaymentEvent.parameters = [];

  const collectionParam = new ethereum.EventParam("collection", ethereum.Value.fromAddress(collection));
  const tokenIdParam = new ethereum.EventParam("tokenId", ethereum.Value.fromSignedBigInt(tokenId));
  const royaltyRecipientParam = new ethereum.EventParam(
    "royaltyRecipient",
    ethereum.Value.fromAddress(royaltyRecipient)
  );
  const currencyParam = new ethereum.EventParam("currency", ethereum.Value.fromAddress(currency));
  const amountParam = new ethereum.EventParam("amount", ethereum.Value.fromSignedBigInt(amount));

  newRoyaltyPaymentEvent.parameters.push(collectionParam);
  newRoyaltyPaymentEvent.parameters.push(tokenIdParam);
  newRoyaltyPaymentEvent.parameters.push(royaltyRecipientParam);
  newRoyaltyPaymentEvent.parameters.push(currencyParam);
  newRoyaltyPaymentEvent.parameters.push(amountParam);

  return newRoyaltyPaymentEvent;
}

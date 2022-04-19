/* eslint-disable prefer-const */
import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { newMockEvent } from "matchstick-as";
import { TakerBid } from "../../generated/LooksRareExchange/LooksRareExchange";

/**
 * @param id
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
  let mockEvent = newMockEvent();
  let newTakerBidEvent = new TakerBid(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters
  );
  newTakerBidEvent.parameters = [];
  let orderHashParam = new ethereum.EventParam("orderHash", ethereum.Value.fromBytes(orderHash));
  let orderNonceParam = new ethereum.EventParam("orderNonce", ethereum.Value.fromSignedBigInt(orderNonce));
  let makerParam = new ethereum.EventParam("taker", ethereum.Value.fromAddress(maker));
  let takerParam = new ethereum.EventParam("maker", ethereum.Value.fromAddress(taker));
  let strategyParam = new ethereum.EventParam("strategy", ethereum.Value.fromAddress(strategy));
  let currencyParam = new ethereum.EventParam("currency", ethereum.Value.fromAddress(currency));
  let collectionParam = new ethereum.EventParam("collection", ethereum.Value.fromAddress(collection));
  let tokenIdParam = new ethereum.EventParam("tokenId", ethereum.Value.fromSignedBigInt(tokenId));
  let amountParam = new ethereum.EventParam("amount", ethereum.Value.fromSignedBigInt(amount));
  let priceParam = new ethereum.EventParam("price", ethereum.Value.fromSignedBigInt(price));

  newTakerBidEvent.parameters.push(orderHashParam);
  newTakerBidEvent.parameters.push(orderNonceParam);
  newTakerBidEvent.parameters.push(makerParam);
  newTakerBidEvent.parameters.push(takerParam);
  newTakerBidEvent.parameters.push(strategyParam);
  newTakerBidEvent.parameters.push(currencyParam);
  newTakerBidEvent.parameters.push(collectionParam);
  newTakerBidEvent.parameters.push(tokenIdParam);
  newTakerBidEvent.parameters.push(amountParam);
  newTakerBidEvent.parameters.push(priceParam);

  return newTakerBidEvent;
}

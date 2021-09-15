/* eslint-disable prefer-const */
import { Address, BigInt, log } from "@graphprotocol/graph-ts";
import { Blockchain, Collection, Owner, Token, Transaction } from "../generated/schema";
import { TransferBatch, TransferSingle, URI } from "../generated/EIP1155/EIP1155";
import { toBigDecimal } from "./utils";
import { fetchName, fetchSymbol, fetchURI } from "./utils/eip1155";

// Constants
let ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

// BigNumber-like references
let ZERO_BI = BigInt.fromI32(0);
let ONE_BI = BigInt.fromI32(1);

export function handleTransferBatch(event: TransferBatch): void {
  let blockchain = Blockchain.load("ETH");
  if (blockchain === null) {
    // Blockchain
    blockchain = new Blockchain("ETH");
    blockchain.totalCollections = ZERO_BI;
    blockchain.totalTokens = ZERO_BI;
    blockchain.totalTransactions = ZERO_BI;
    blockchain.save();
  }
  blockchain.totalTransactions = blockchain.totalTransactions.plus(ONE_BI);
  blockchain.save();

  let collection = Collection.load(event.address.toHex());
  if (collection === null) {
    // Collection
    collection = new Collection(event.address.toHex());
    collection.name = fetchName(event.address);
    collection.symbol = fetchSymbol(event.address);
    collection.totalTokens = ZERO_BI;
    collection.totalTransactions = ZERO_BI;
    collection.block = event.block.number;
    collection.createdAt = event.block.timestamp;
    collection.updatedAt = event.block.timestamp;
    collection.save();

    // Blockchain
    blockchain.totalCollections = blockchain.totalCollections.plus(ONE_BI);
    blockchain.save();
  }
  collection.totalTransactions = collection.totalTransactions.plus(ONE_BI);
  collection.updatedAt = event.block.timestamp;
  collection.save();

  let from = Owner.load(event.params._from.toHex());
  if (from === null) {
    // Owner - as Sender
    from = new Owner(event.params._from.toHex());
    from.totalTokens = ZERO_BI;
    from.totalTokensMinted = ZERO_BI;
    from.totalTransactions = ZERO_BI;
    from.block = event.block.number;
    from.createdAt = event.block.timestamp;
    from.updatedAt = event.block.timestamp;
    from.save();
  }
  from.totalTokens = event.params._from.equals(Address.fromString(ZERO_ADDRESS))
    ? from.totalTokens
    : from.totalTokens.minus(ONE_BI);
  from.totalTransactions = from.totalTransactions.plus(ONE_BI);
  from.updatedAt = event.block.timestamp;
  from.save();

  let to = Owner.load(event.params._to.toHex());
  if (to === null) {
    // Owner - as Receiver
    to = new Owner(event.params._to.toHex());
    to.totalTokens = ZERO_BI;
    to.totalTokensMinted = ZERO_BI;
    to.totalTransactions = ZERO_BI;
    to.block = event.block.number;
    to.createdAt = event.block.timestamp;
    to.updatedAt = event.block.timestamp;
    to.save();
  }
  to.totalTokens = to.totalTokens.plus(ONE_BI);
  to.totalTransactions = to.totalTransactions.plus(ONE_BI);
  to.updatedAt = event.block.timestamp;
  to.save();

  let ids = event.params._ids;
  for (let i = 0; i < ids.length; i++) {
    let token = Token.load(event.address.toHex() + "-" + ids[i].toString());
    if (token === null) {
      // Token
      token = new Token(event.address.toHex() + "-" + ids[i].toString());
      token.collection = collection.id;
      token.tokenID = ids[i];
      token.minter = to.id;
      token.owner = to.id;
      token.burned = false;
      token.tokenURI = fetchURI(event.address, ids[i]);
      token.totalTransactions = ZERO_BI;
      token.block = event.block.number;
      token.createdAt = event.block.timestamp;
      token.updatedAt = event.block.timestamp;
      token.save();

      // Owner - as Receiver
      to.totalTokensMinted = to.totalTokensMinted.plus(ONE_BI);
      to.save();

      // Collection
      collection.totalTokens = collection.totalTokens.plus(ONE_BI);
      collection.save();

      // Blockchain
      blockchain.totalTokens = blockchain.totalTokens.plus(ONE_BI);
      blockchain.save();
    }
    token.owner = to.id;
    token.burned = event.params._to.equals(Address.fromString(ZERO_ADDRESS));
    token.totalTransactions = token.totalTransactions.plus(ONE_BI);
    token.updatedAt = event.block.timestamp;
    token.save();

    // Transaction
    let transaction = new Transaction(event.transaction.hash.toHex() + "-" + ids[i].toString());
    transaction.hash = event.transaction.hash;
    transaction.from = from.id;
    transaction.to = to.id;
    transaction.collection = collection.id;
    transaction.token = token.id;
    transaction.type = "Batch";
    transaction.gasUsed = event.transaction.gasUsed;
    transaction.gasPrice = toBigDecimal(event.transaction.gasPrice, 9);
    transaction.block = event.block.number;
    transaction.timestamp = event.block.timestamp;
    transaction.save();
  }
}

export function handleTransferSingle(event: TransferSingle): void {
  let blockchain = Blockchain.load("ETH");
  if (blockchain === null) {
    // Blockchain
    blockchain = new Blockchain("ETH");
    blockchain.totalCollections = ZERO_BI;
    blockchain.totalTokens = ZERO_BI;
    blockchain.totalTransactions = ZERO_BI;
    blockchain.save();
  }
  blockchain.totalTransactions = blockchain.totalTransactions.plus(ONE_BI);
  blockchain.save();

  let collection = Collection.load(event.address.toHex());
  if (collection === null) {
    // Collection
    collection = new Collection(event.address.toHex());
    collection.name = fetchName(event.address);
    collection.symbol = fetchSymbol(event.address);
    collection.totalTokens = ZERO_BI;
    collection.totalTransactions = ZERO_BI;
    collection.block = event.block.number;
    collection.createdAt = event.block.timestamp;
    collection.updatedAt = event.block.timestamp;
    collection.save();

    // Blockchain
    blockchain.totalCollections = blockchain.totalCollections.plus(ONE_BI);
    blockchain.save();
  }
  collection.totalTransactions = collection.totalTransactions.plus(ONE_BI);
  collection.updatedAt = event.block.timestamp;
  collection.save();

  let from = Owner.load(event.params._from.toHex());
  if (from === null) {
    // Owner - as Sender
    from = new Owner(event.params._from.toHex());
    from.totalTokens = ZERO_BI;
    from.totalTokensMinted = ZERO_BI;
    from.totalTransactions = ZERO_BI;
    from.block = event.block.number;
    from.createdAt = event.block.timestamp;
    from.updatedAt = event.block.timestamp;
    from.save();
  }
  from.totalTokens = event.params._from.equals(Address.fromString(ZERO_ADDRESS))
    ? from.totalTokens
    : from.totalTokens.minus(ONE_BI);
  from.totalTransactions = from.totalTransactions.plus(ONE_BI);
  from.updatedAt = event.block.timestamp;
  from.save();

  let to = Owner.load(event.params._to.toHex());
  if (to === null) {
    // Owner - as Receiver
    to = new Owner(event.params._to.toHex());
    to.totalTokens = ZERO_BI;
    to.totalTokensMinted = ZERO_BI;
    to.totalTransactions = ZERO_BI;
    to.block = event.block.number;
    to.createdAt = event.block.timestamp;
    to.updatedAt = event.block.timestamp;
    to.save();
  }
  to.totalTokens = to.totalTokens.plus(ONE_BI);
  to.totalTransactions = to.totalTransactions.plus(ONE_BI);
  to.updatedAt = event.block.timestamp;
  to.save();

  let token = Token.load(event.address.toHex() + "-" + event.params._id.toString());
  if (token === null) {
    // Token
    token = new Token(event.address.toHex() + "-" + event.params._id.toString());
    token.collection = collection.id;
    token.tokenID = event.params._id;
    token.minter = to.id;
    token.owner = to.id;
    token.burned = false;
    token.tokenURI = fetchURI(event.address, event.params._id);
    token.totalTransactions = ZERO_BI;
    token.block = event.block.number;
    token.createdAt = event.block.timestamp;
    token.updatedAt = event.block.timestamp;
    token.save();

    // Owner - as Receiver
    to.totalTokensMinted = to.totalTokensMinted.plus(ONE_BI);
    to.save();

    // Collection
    collection.totalTokens = collection.totalTokens.plus(ONE_BI);
    collection.save();

    // Blockchain
    blockchain.totalTokens = blockchain.totalTokens.plus(ONE_BI);
    blockchain.save();
  }
  token.owner = to.id;
  token.burned = event.params._to.equals(Address.fromString(ZERO_ADDRESS));
  token.totalTransactions = token.totalTransactions.plus(ONE_BI);
  token.updatedAt = event.block.timestamp;
  token.save();

  // Transaction
  let transaction = new Transaction(event.transaction.hash.toHex());
  transaction.hash = event.transaction.hash;
  transaction.from = from.id;
  transaction.to = to.id;
  transaction.collection = collection.id;
  transaction.token = token.id;
  transaction.type = "Single";
  transaction.gasUsed = event.transaction.gasUsed;
  transaction.gasPrice = toBigDecimal(event.transaction.gasPrice, 9);
  transaction.block = event.block.number;
  transaction.timestamp = event.block.timestamp;
  transaction.save();
}

export function handleURI(event: URI): void {
  let token = Token.load(event.address.toHex() + "-" + event.params._id.toString());
  if (token !== null) {
    token.tokenURI = event.params._value;
    token.save();
  } else {
    log.warning("Tried to update tokenURI of a non-existing token --- collection {} - {}", [
      event.address.toHex(),
      event.params._id.toString(),
    ]);
  }
}

/* eslint-disable prefer-const */
import { BigDecimal, BigInt } from "@graphprotocol/graph-ts";
import { Balance, Currency, User } from "../generated/schema";
import { AtomicMatch_Call } from "../generated/WyvernExchange/WyvernExchange";
import { fetchDecimals, fetchName, fetchSymbol } from "./utils/erc20";
import { currencies, toBigDecimal } from "./utils";

export function handleAtomicMatch(call: AtomicMatch_Call): void {
  // If the currency used for the trade isn't whitelisted, skipping.
  if (!currencies.includes(call.inputs.addrs[6].toHex())) {
    return;
  }

  // Currency
  let currency = Currency.load(call.inputs.addrs[6].toHex());
  if (currency === null) {
    currency = new Currency(call.inputs.addrs[6].toHex());
    currency.name = fetchName(call.inputs.addrs[6]);
    currency.symbol = fetchSymbol(call.inputs.addrs[6]);
    currency.decimals = fetchDecimals(call.inputs.addrs[6]);
    currency.totalTrades = BigInt.zero();
    currency.volume = BigDecimal.zero();
    currency.save();
  }
  currency.totalTrades = currency.totalTrades.plus(BigInt.fromI32(1));
  currency.volume = currency.volume.plus(toBigDecimal(call.inputs.uints[4], currency.decimals.toI32()));
  currency.save();

  // Taker a.k.a. Buyer
  let taker = User.load(call.inputs.addrs[1].toHex());
  if (taker === null) {
    taker = new User(call.inputs.addrs[1].toHex());
    taker.totalBuy = BigInt.zero();
    taker.totalSell = BigInt.zero();
    taker.firstTradeAt = call.block.timestamp;
    taker.firstTradeWith = currency.id;
    taker.lastTradeAt = call.block.timestamp;
    taker.lastTradeWith = currency.id;
    taker.save();
  }
  taker.totalBuy = taker.totalBuy.plus(BigInt.fromI32(1));
  taker.lastTradeAt = call.block.timestamp;
  taker.lastTradeWith = currency.id;
  taker.save();

  let takerBalance = Balance.load(call.inputs.addrs[1].toHex() + "-" + call.inputs.addrs[6].toHex());
  if (takerBalance === null) {
    takerBalance = new Balance(call.inputs.addrs[1].toHex() + "-" + call.inputs.addrs[6].toHex());
    takerBalance.currency = currency.id;
    takerBalance.user = taker.id;
    takerBalance.volume = BigDecimal.zero();
    takerBalance.updatedAt = call.block.timestamp;
    takerBalance.save();
  }
  takerBalance.volume = takerBalance.volume.plus(toBigDecimal(call.inputs.uints[4], currency.decimals.toI32()));
  takerBalance.updatedAt = call.block.timestamp;
  takerBalance.save();

  // Maker a.k.a. Seller
  let maker = User.load(call.inputs.addrs[8].toHex());
  if (maker === null) {
    maker = new User(call.inputs.addrs[8].toHex());
    maker.totalBuy = BigInt.zero();
    maker.totalSell = BigInt.zero();
    maker.firstTradeAt = call.block.timestamp;
    maker.firstTradeWith = currency.id;
    maker.lastTradeAt = call.block.timestamp;
    maker.lastTradeWith = currency.id;
    maker.save();
  }
  maker.totalSell = maker.totalSell.plus(BigInt.fromI32(1));
  maker.lastTradeAt = call.block.timestamp;
  maker.lastTradeWith = currency.id;
  maker.save();

  let makerBalance = Balance.load(call.inputs.addrs[8].toHex() + "-" + call.inputs.addrs[6].toHex());
  if (makerBalance === null) {
    makerBalance = new Balance(call.inputs.addrs[8].toHex() + "-" + call.inputs.addrs[6].toHex());
    makerBalance.currency = currency.id;
    makerBalance.user = maker.id;
    makerBalance.volume = BigDecimal.zero();
    makerBalance.updatedAt = call.block.timestamp;
    makerBalance.save();
  }
  makerBalance.volume = makerBalance.volume.plus(toBigDecimal(call.inputs.uints[4], currency.decimals.toI32()));
  makerBalance.updatedAt = call.block.timestamp;
  makerBalance.save();
}

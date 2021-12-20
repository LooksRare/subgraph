/* eslint-disable prefer-const */
import { Address, BigDecimal, BigInt } from "@graphprotocol/graph-ts";
import { Balance, Currency, ExchangeRate, User } from "../generated/schema";
import { AtomicMatch_Call } from "../generated/WyvernExchange/WyvernExchange";

import { currencies, ONE_BD, toBigDecimal, ZERO_BD, ZERO_BI } from "./utils";
import { fetchDecimals, fetchName, fetchSymbol } from "./utils/erc20";
import { getPrice } from "./utils/getPrice";

function initializeUser(user: string, currency: string, timestamp: BigInt): User {
  const newUser = new User(user);
  newUser.totalBuy = ZERO_BI;
  newUser.totalSell = ZERO_BI;
  newUser.totalVolumeInETH = ZERO_BD;
  newUser.firstTradeAt = timestamp;
  newUser.firstTradeWith = currency;
  newUser.lastTradeAt = ZERO_BI;
  newUser.lastTradeWith = "";
  return newUser;
}

function initializeUserBalance(user: string, currency: string): Balance {
  const balance = new Balance(user + "-" + currency);
  balance.currency = currency;
  balance.user = user;
  balance.volume = ZERO_BD;
  balance.updatedAt = ZERO_BI;
  return balance;
}

export function handleAtomicMatch(call: AtomicMatch_Call): void {
  // If the currency used for the trade isn't in the whitelist, skip.
  if (!currencies.includes(call.inputs.addrs[6].toHex())) {
    return;
  }

  // 1. Currency
  let currency = Currency.load(call.inputs.addrs[6].toHex());
  if (currency === null) {
    currency = new Currency(call.inputs.addrs[6].toHex());
    currency.name = fetchName(call.inputs.addrs[6]);
    currency.symbol = fetchSymbol(call.inputs.addrs[6]);
    currency.decimals = fetchDecimals(call.inputs.addrs[6]);
    currency.totalTrades = ZERO_BI;
    currency.volume = ZERO_BD;
    currency.save();
  }

  currency.totalTrades = currency.totalTrades.plus(BigInt.fromI32(1));
  currency.volume = currency.volume.plus(toBigDecimal(call.inputs.uints[4], currency.decimals.toI32()));
  currency.save();

  // 2. Exchange rate logic
  let adjustedCurrencyVolume = currency.volume;
  let priceOfOneETH = ONE_BD;

  // Exclude if traded currency is WETH/ETH
  if (
    currency.id != "0x0000000000000000000000000000000000000000" &&
    currency.id != "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
  ) {
    let exchangeRate = ExchangeRate.load(currency.id);
    if (exchangeRate == null) {
      exchangeRate = new ExchangeRate(currency.id);
      exchangeRate.currency = currency.id;
      exchangeRate.priceOfOneETH = ZERO_BD;
      exchangeRate.updatedAt = ZERO_BI;
    }

    priceOfOneETH = getPrice(currency.id);
    adjustedCurrencyVolume = adjustedCurrencyVolume.times(priceOfOneETH);

    exchangeRate.priceOfOneETH = priceOfOneETH;
    exchangeRate.updatedAt = call.block.timestamp;
    exchangeRate.save();
  }

  // 3. Buyer
  // 3.1 Buyer
  let buyer = User.load(call.inputs.addrs[1].toHex());
  if (buyer === null) {
    buyer = initializeUser(call.inputs.addrs[1].toHex(), currency.id, call.block.timestamp);
  }

  buyer.totalBuy = buyer.totalBuy.plus(BigInt.fromI32(1));
  buyer.lastTradeAt = call.block.timestamp;
  buyer.lastTradeWith = currency.id;
  buyer.totalVolumeInETH = buyer.totalVolumeInETH.plus(adjustedCurrencyVolume);
  buyer.save();

  // 3.2 Buyer's balance in the currency
  let buyerBalance = Balance.load(call.inputs.addrs[1].toHex() + "-" + call.inputs.addrs[6].toHex());

  if (buyerBalance === null) {
    buyerBalance = initializeUserBalance(call.inputs.addrs[1].toHex(), call.inputs.addrs[6].toHex());
  }

  buyerBalance.volume = buyerBalance.volume.plus(toBigDecimal(call.inputs.uints[4], currency.decimals.toI32()));
  buyerBalance.updatedAt = call.block.timestamp;
  buyerBalance.save();

  // 4. Seller
  // 4.1 Seller
  let seller = User.load(call.inputs.addrs[8].toHex());
  if (seller === null) {
    seller = initializeUser(call.inputs.addrs[8].toHex(), currency.id, call.block.timestamp);
  }

  seller.totalSell = seller.totalSell.plus(BigInt.fromI32(1));
  seller.totalVolumeInETH = seller.totalVolumeInETH.plus(adjustedCurrencyVolume);
  seller.lastTradeAt = call.block.timestamp;
  seller.lastTradeWith = currency.id;
  seller.save();

  // 4.2 Seller's balance
  let sellerBalance = Balance.load(call.inputs.addrs[8].toHex() + "-" + call.inputs.addrs[6].toHex());
  if (sellerBalance === null) {
    sellerBalance = initializeUserBalance(call.inputs.addrs[8].toHex(), call.inputs.addrs[6].toHex());
    sellerBalance.save();
  }

  sellerBalance.volume = sellerBalance.volume.plus(toBigDecimal(call.inputs.uints[4], currency.decimals.toI32()));
  sellerBalance.updatedAt = call.block.timestamp;
  sellerBalance.save();
}

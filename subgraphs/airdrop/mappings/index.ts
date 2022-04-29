import { BigDecimal, BigInt } from "@graphprotocol/graph-ts";
import { Balance, Currency, User } from "../generated/schema";
import { AtomicMatch_Call } from "../generated/WyvernExchange/WyvernExchange";
import { toBigDecimal } from "../../../helpers/utils";
import { ZERO_BD, ZERO_BI, ONE_BI, ONE_BD } from "../../../helpers/constants";

import { currencies, etherAddresses } from "./utils";
import { fetchDecimals, fetchName, fetchSymbol } from "./utils/erc20";
import { getPrice } from "./utils/getPrice";

const END_BLOCK = BigInt.fromString("13812868");

function initializeUser(user: string, currency: string, timestamp: BigInt): User {
  const newUser = new User(user);
  newUser.totalBuyTransactions = ZERO_BI;
  newUser.totalSellTransactions = ZERO_BI;
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
  // Stop indexing after end block
  if (call.block.number > END_BLOCK) {
    return;
  }

  // If the currency used for the trade isn't in the whitelist, skip.
  if (!currencies.includes(call.inputs.addrs[6].toHex())) {
    return;
  }

  // If the order value is equal zero, skip.
  if (call.inputs.uints[4].equals(BigInt.zero())) {
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
    currency.volumeInETH = ZERO_BD;
    currency.priceOfOneETH = ONE_BD;
    currency.updatedAt = ZERO_BI;
    if (!etherAddresses.includes(currency.id)) {
      currency.minPriceOfOneETH = BigDecimal.fromString("9999999999"); // Arbitrary large number
      currency.maxPriceOfOneETH = ZERO_BD;
    } else {
      currency.minPriceOfOneETH = ONE_BD;
      currency.maxPriceOfOneETH = ONE_BD;
    }
  }

  currency.totalTrades = currency.totalTrades.plus(ONE_BI);
  currency.volume = currency.volume.plus(toBigDecimal(call.inputs.uints[4], currency.decimals.toI32()));

  let priceOfOneETH = currency.priceOfOneETH;
  let adjustedCurrencyVolume = toBigDecimal(call.inputs.uints[4], currency.decimals.toI32());

  // Exclude if traded currency is WETH/ETH
  if (!etherAddresses.includes(currency.id)) {
    // Refresh only if not updated for 1 hour
    if (currency.updatedAt.plus(BigInt.fromString("3600")) < call.block.timestamp) {
      priceOfOneETH = getPrice(currency.id, currency.decimals.toI32());

      currency.priceOfOneETH = priceOfOneETH;

      if (priceOfOneETH > currency.maxPriceOfOneETH) {
        currency.maxPriceOfOneETH = priceOfOneETH;
      }

      if (priceOfOneETH < currency.minPriceOfOneETH) {
        currency.minPriceOfOneETH = priceOfOneETH;
      }

      currency.updatedAt = call.block.timestamp;
    }
    adjustedCurrencyVolume = adjustedCurrencyVolume.div(priceOfOneETH).truncate(18);
  }

  currency.volumeInETH = currency.volumeInETH.plus(adjustedCurrencyVolume);
  currency.save();

  // 2. Buyer
  // 2.1 Buyer
  let buyer = User.load(call.inputs.addrs[1].toHex());
  if (buyer === null) {
    buyer = initializeUser(call.inputs.addrs[1].toHex(), currency.id, call.block.timestamp);
  }

  buyer.totalBuyTransactions = buyer.totalBuyTransactions.plus(ONE_BI);
  buyer.lastTradeAt = call.block.timestamp;
  buyer.lastTradeWith = currency.id;
  buyer.totalVolumeInETH = buyer.totalVolumeInETH.plus(adjustedCurrencyVolume);
  buyer.save();

  // 2.2 Buyer's balance in the currency
  let buyerBalance = Balance.load(call.inputs.addrs[1].toHex() + "-" + call.inputs.addrs[6].toHex());

  if (buyerBalance === null) {
    buyerBalance = initializeUserBalance(call.inputs.addrs[1].toHex(), call.inputs.addrs[6].toHex());
  }

  buyerBalance.volume = buyerBalance.volume.plus(toBigDecimal(call.inputs.uints[4], currency.decimals.toI32()));
  buyerBalance.updatedAt = call.block.timestamp;
  buyerBalance.save();

  // 3. Seller
  // 3.1 Seller
  let seller = User.load(call.inputs.addrs[8].toHex());
  if (seller === null) {
    seller = initializeUser(call.inputs.addrs[8].toHex(), currency.id, call.block.timestamp);
  }

  seller.totalSellTransactions = seller.totalSellTransactions.plus(ONE_BI);
  seller.totalVolumeInETH = seller.totalVolumeInETH.plus(adjustedCurrencyVolume);
  seller.lastTradeAt = call.block.timestamp;
  seller.lastTradeWith = currency.id;
  seller.save();

  // 3.2 Seller's balance
  let sellerBalance = Balance.load(call.inputs.addrs[8].toHex() + "-" + call.inputs.addrs[6].toHex());
  if (sellerBalance === null) {
    sellerBalance = initializeUserBalance(call.inputs.addrs[8].toHex(), call.inputs.addrs[6].toHex());
    sellerBalance.save();
  }

  sellerBalance.volume = sellerBalance.volume.plus(toBigDecimal(call.inputs.uints[4], currency.decimals.toI32()));
  sellerBalance.updatedAt = call.block.timestamp;
  sellerBalance.save();
}

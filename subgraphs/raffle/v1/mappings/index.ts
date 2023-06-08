import { BigInt, log } from "@graphprotocol/graph-ts";
import { ONE_BI, ZERO_BD, ZERO_BI } from "../../../../helpers/constants";
import { toBigDecimal } from "../../../../helpers/utils";
import { EntryRefunded, EntrySold, RaffleStatusUpdated } from "../generated/Raffle/IRaffle";
import { CurrenciesStatusUpdated, PrizesClaimed, Raffle as RaffleContract } from "../generated/Raffle/Raffle";
import { Entry, Participant, Pricing, Prize, Raffle, RaffleStatusLog, Transaction, Winner } from "../generated/schema";
import { initializeCurrency } from "./entities/currency";
import { getPricing, getPrizes, getRaffle, getWinners, statusIdToEnum, typeIdToEnum } from "./utils";

export function handleCurrenciesStatusUpdated(event: CurrenciesStatusUpdated): void {
  for (let i = 0; i < event.params.currencies.length; i++) {
    const currency = initializeCurrency(event.params.currencies[i]);
    currency.isAllowed = event.params.isAllowed;
    currency.save();
  }
}

export function handleRaffleStatusUpdated(event: RaffleStatusUpdated): void {
  // Bind Raffle Contract
  const raffleContract = RaffleContract.bind(event.address);

  // Raffle
  let raffle = Raffle.load(event.params.raffleId.toString());
  if (raffle === null) {
    const raffleData = getRaffle(raffleContract, event.params.raffleId);
    if (raffleData === null) {
      log.warning("No result returned for 'raffles' RPC call.", [event.params.raffleId.toString()]);
      return;
    }

    // Currency
    initializeCurrency(raffleData.getFeeTokenAddress());

    raffle = new Raffle(event.params.raffleId.toString());
    raffle.raffleId = event.params.raffleId;
    raffle.currency = raffleData.getFeeTokenAddress().toHex();
    raffle.owner = raffleData.getOwner();
    raffle.status = statusIdToEnum(event.params.status);
    raffle.lastStatusUpdate = event.block.timestamp;
    raffle.cutoffTime = raffleData.getCutoffTime();
    raffle.minimumEntries = raffleData.getMinimumEntries();
    raffle.maximumEntriesPerParticipant = raffleData.getMaximumEntriesPerParticipant();
    raffle.prizeValue = ZERO_BD;
    raffle.currentPool = ZERO_BD;
    raffle.totalUsers = ZERO_BI;
    raffle.totalTickets = ZERO_BI;
    raffle.totalWinners = ZERO_BI;
    raffle.save();

    // Pricing
    const pricingData = getPricing(raffleContract, event.params.raffleId);
    if (pricingData === null) {
      log.warning("No result returned for 'getPricingOptions' RPC call.", [event.params.raffleId.toString()]);
      return;
    }
    for (let i = 0; i < pricingData.length; i++) {
      const pricing = new Pricing(`${event.params.raffleId.toString()}-${i.toString()}`);
      pricing.raffle = event.params.raffleId.toString();
      pricing.totalEntries = pricingData[i].entriesCount;
      pricing.price = toBigDecimal(pricingData[i].price);
      pricing.save();
    }
    raffle.prizeValue = toBigDecimal(
      pricingData[pricingData.length - 1].price
        .div(pricingData[pricingData.length - 1].entriesCount)
        .times(raffle.minimumEntries)
    );
    raffle.save();
  }
  raffle.status = statusIdToEnum(event.params.status);
  raffle.lastStatusUpdate = event.block.timestamp;
  raffle.save();

  // Status is Open, Prizes are available
  if (statusIdToEnum(event.params.status) === "Open") {
    // Prize
    const prizesData = getPrizes(raffleContract, event.params.raffleId);
    if (prizesData === null) {
      log.warning("No result returned for 'getPrizes' RPC call.", [event.params.raffleId.toString()]);
      return;
    }
    for (let i = 0; i < prizesData.length; i++) {
      const prize = new Prize(`${event.params.raffleId.toString()}-${i.toString()}`);
      prize.prizeId = BigInt.fromI32(i).plus(ONE_BI);
      prize.raffle = event.params.raffleId.toString();
      prize.tier = BigInt.fromI32(prizesData[i].prizeTier);
      prize.type = typeIdToEnum(prizesData[i].prizeType);
      prize.address = prizesData[i].prizeAddress;
      prize.tokenId = prizesData[i].prizeId;
      prize.amount = prizesData[i].prizeAmount;
      prize.totalWinners = prizesData[i].winnersCount;
      prize.totalWinnersCumulative = prizesData[i].cumulativeWinnersCount;
      prize.save();
    }
  }

  // Status is Drawn, Winners are available
  if (statusIdToEnum(event.params.status) === "Drawn") {
    // Winner
    const winnersData = getWinners(raffleContract, event.params.raffleId);
    if (winnersData === null) {
      log.warning("No result returned for 'getWinners' RPC call.", [event.params.raffleId.toString()]);
      return;
    }
    for (let i = 0; i < winnersData.length; i++) {
      const winner = new Winner(`${event.params.raffleId.toString()}-${i.toString()}`);
      winner.raffle = event.params.raffleId.toString();
      winner.participant = winnersData[i].participant.toHex();
      winner.claimed = winnersData[i].claimed;
      winner.winnerIndex = BigInt.fromI32(i);
      winner.entry = `${event.params.raffleId.toString()}-${winnersData[i].participant.toHex()}`;
      winner.entryIndex = winnersData[i].entryIndex;
      winner.prize = `${event.params.raffleId.toString()}-${winnersData[i].prizeIndex}`;
      winner.prizeIndex = BigInt.fromI32(winnersData[i].prizeIndex);
      winner.save();
    }
    raffle.totalWinners = BigInt.fromI32(winnersData.length);
    raffle.save();
  }

  const statusLog = new RaffleStatusLog(`${event.params.raffleId.toString()}-${event.params.status}`);
  statusLog.raffle = event.params.raffleId.toString();
  statusLog.status = statusIdToEnum(event.params.status);
  statusLog.transaction = event.transaction.hash;
  statusLog.timestamp = event.block.timestamp;
  statusLog.block = event.block.number;
  statusLog.save();
}

export function handleEntrySold(event: EntrySold): void {
  // Raffle
  const raffle = Raffle.load(event.params.raffleId.toString());
  if (raffle === null) {
    log.error("Tried to handle EntrySold for a Raffle that does not exist.", [event.params.raffleId.toString()]);
    return;
  }
  raffle.currentPool = raffle.currentPool.plus(toBigDecimal(event.params.price));
  raffle.totalTickets = raffle.totalTickets.plus(event.params.entriesCount);
  raffle.save();

  // Participant
  let participant = Participant.load(event.params.buyer.toHex());
  if (participant === null) {
    participant = new Participant(event.params.buyer.toHex());
    participant.totalRaffles = ZERO_BI;
    participant.totalTickets = ZERO_BI;
    participant.save();
  }
  participant.totalTickets = participant.totalTickets.plus(event.params.entriesCount);
  participant.save();

  // Entry
  let entry = Entry.load(`${event.params.raffleId.toString()}-${event.params.buyer.toHex()}`);
  if (entry === null) {
    entry = new Entry(`${event.params.raffleId.toString()}-${event.params.buyer.toHex()}`);
    entry.raffle = event.params.raffleId.toString();
    entry.participant = event.params.buyer.toHex();
    entry.totalTickets = ZERO_BI;
    entry.totalPrice = ZERO_BD;
    entry.refunded = false;
    entry.save();

    participant.totalRaffles = participant.totalRaffles.plus(ONE_BI);
    participant.save();

    raffle.totalUsers = raffle.totalUsers.plus(ONE_BI);
    raffle.save();
  }
  entry.totalTickets = entry.totalTickets.plus(event.params.entriesCount);
  entry.totalPrice = entry.totalPrice.plus(toBigDecimal(event.params.price));
  entry.save();

  let transaction = Transaction.load(event.transaction.hash.toHex());
  if (transaction === null) {
    transaction = new Transaction(event.transaction.hash.toHex());
    transaction.hash = event.transaction.hash;
    transaction.raffle = event.params.raffleId.toString();
    transaction.participant = event.params.buyer.toHex();
    transaction.entry = `${event.params.raffleId.toString()}-${event.params.buyer.toHex()}`;
    transaction.entriesCount = ZERO_BI;
    transaction.gasLimit = event.transaction.gasLimit;
    transaction.gasPrice = toBigDecimal(event.transaction.gasPrice);
    transaction.block = event.block.number;
    transaction.timestamp = event.block.timestamp;
    transaction.save();
  }
  transaction.entriesCount = transaction.entriesCount.plus(event.params.entriesCount);
  transaction.save();
}

export function handleEntryRefunded(event: EntryRefunded): void {
  // Entry
  const entry = Entry.load(`${event.params.raffleId.toString()}-${event.params.buyer.toHex()}`);
  if (entry === null) {
    log.error("Tried to handle EntryRefunded for a Entry that does not exist.", [
      event.params.raffleId.toString(),
      event.params.buyer.toHex(),
    ]);
    return;
  }
  entry.refunded = true;
  entry.save();
}

export function handlePrizesClaimed(event: PrizesClaimed): void {
  for (let i = 0; i < event.params.winnerIndex.length; i++) {
    // Winner
    const winner = new Winner(`${event.params.raffleId.toString()}-${event.params.winnerIndex[i].toString()}`);
    if (winner === null) {
      log.error("Tried to handle PrizesClaimed for a Winner that does not exist.", [
        event.params.raffleId.toString(),
        event.params.winnerIndex[i].toString(),
      ]);
      return;
    }
    winner.claimed = true;
    winner.claimedHash = event.transaction.hash;
    winner.save();
  }
}

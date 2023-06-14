import { BigInt } from "@graphprotocol/graph-ts";
import {
  Raffle,
  Raffle__getPricingOptionsResultPricingOptionsStruct,
  Raffle__getPrizesResultPrizesStruct,
  Raffle__getWinnersResultWinnersStruct,
  Raffle__rafflesResult,
} from "../../generated/Raffle/Raffle";
import {
  RaffleV2,
  RaffleV2__getPricingOptionsResultPricingOptionsStruct,
  RaffleV2__getPrizesResultPrizesStruct,
  RaffleV2__getWinnersResultWinnersStruct,
  RaffleV2__rafflesResult,
} from "../../generated/RaffleV2/RaffleV2";

export function getRaffle(contract: Raffle, raffleId: BigInt): Raffle__rafflesResult | null {
  const result = contract.try_raffles(raffleId);
  if (!result.reverted) {
    return result.value;
  }

  return null;
}

export function getRaffleV2(contract: RaffleV2, raffleId: BigInt): RaffleV2__rafflesResult | null {
  const result = contract.try_raffles(raffleId);
  if (!result.reverted) {
    return result.value;
  }

  return null;
}

export function getPricing(
  contract: Raffle,
  raffleId: BigInt,
): Array<Raffle__getPricingOptionsResultPricingOptionsStruct> | null {
  const result = contract.try_getPricingOptions(raffleId);
  if (!result.reverted) {
    return result.value;
  }

  return null;
}

export function getPricingV2(
  contract: RaffleV2,
  raffleId: BigInt
): Array<RaffleV2__getPricingOptionsResultPricingOptionsStruct> | null {
  const result = contract.try_getPricingOptions(raffleId);
  if (!result.reverted) {
    return result.value;
  }

  return null;
}

export function getPrizes(contract: Raffle, raffleId: BigInt): Array<Raffle__getPrizesResultPrizesStruct> | null {
  const result = contract.try_getPrizes(raffleId);
  if (!result.reverted) {
    return result.value;
  }

  return null;
}

export function getPrizesV2(contract: RaffleV2, raffleId: BigInt): Array<RaffleV2__getPrizesResultPrizesStruct> | null {
  const result = contract.try_getPrizes(raffleId);
  if (!result.reverted) {
    return result.value;
  }

  return null;
}

export function getWinners(contract: Raffle, raffleId: BigInt): Array<Raffle__getWinnersResultWinnersStruct> | null {
  const result = contract.try_getWinners(raffleId);
  if (!result.reverted) {
    return result.value;
  }

  return null;
}

export function getWinnersV2(
  contract: RaffleV2,
  raffleId: BigInt
): Array<RaffleV2__getWinnersResultWinnersStruct> | null {
  const result = contract.try_getWinners(raffleId);
  if (!result.reverted) {
    return result.value;
  }

  return null;
}

export function statusIdToEnum(statusId: i32): string {
  switch (statusId) {
    case 0:
      return "None";
    case 1:
      return "Created";
    case 2:
      return "Open";
    case 3:
      return "Drawing";
    case 4:
      return "RandomnessFulfilled";
    case 5:
      return "Drawn";
    case 6:
      return "Complete";
    case 7:
      return "Refundable";
    case 8:
      return "Cancelled";
    default:
      return "unknown";
  }
}

export function statusIdToEnumV2(statusId: i32): string {
  switch (statusId) {
    case 0:
      return "None";
    case 1:
      return "Open";
    case 2:
      return "Drawing";
    case 3:
      return "RandomnessFulfilled";
    case 4:
      return "Drawn";
    case 5:
      return "Complete";
    case 6:
      return "Refundable";
    case 7:
      return "Cancelled";
    default:
      return "unknown";
  }
}

export function typeIdToEnum(typeId: i32): string {
  switch (typeId) {
    case 0:
      return "ERC721";
    case 1:
      return "ERC1155";
    case 2:
      return "ETH";
    case 3:
      return "ERC20";
    default:
      return "unknown";
  }
}

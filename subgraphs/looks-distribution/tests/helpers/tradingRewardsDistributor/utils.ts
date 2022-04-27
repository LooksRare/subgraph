/* eslint-disable prefer-const */
import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { newMockEvent } from "matchstick-as";
import { ZERO_BI } from "../../../../../helpers/utils";
import { RewardsClaim } from "../../../generated/TradingRewardsDistributor/TradingRewardsDistributor";

/**
 * @param user
 * @param rewardRound
 * @param amount
 * @returns RewardsClaim Event
 */
export function createRewardsClaimEvent(
  user: Address,
  rewardRound: BigInt,
  amount: BigInt,
  blockTimestamp: BigInt = ZERO_BI
): RewardsClaim {
  let mockEvent = newMockEvent();
  let newRewardsClaimEvent = new RewardsClaim(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters
  );

  newRewardsClaimEvent.block.timestamp = blockTimestamp;

  newRewardsClaimEvent.parameters = [];
  let userParam = new ethereum.EventParam("user", ethereum.Value.fromAddress(user));
  let rewardRoundParam = new ethereum.EventParam("rewardRound", ethereum.Value.fromSignedBigInt(rewardRound));
  let amountParam = new ethereum.EventParam("amount", ethereum.Value.fromSignedBigInt(amount));

  newRewardsClaimEvent.parameters.push(userParam);
  newRewardsClaimEvent.parameters.push(rewardRoundParam);
  newRewardsClaimEvent.parameters.push(amountParam);

  return newRewardsClaimEvent;
}

import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { newMockEvent } from "matchstick-as";
import { RewardsClaim } from "../../../generated/TradingRewardsDistributor/TradingRewardsDistributor";
import { ZERO_BI } from "../../../../../helpers/constants";

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
  const mockEvent = newMockEvent();
  const newRewardsClaimEvent = new RewardsClaim(
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

  const userParam = new ethereum.EventParam("user", ethereum.Value.fromAddress(user));
  const rewardRoundParam = new ethereum.EventParam("rewardRound", ethereum.Value.fromSignedBigInt(rewardRound));
  const amountParam = new ethereum.EventParam("amount", ethereum.Value.fromSignedBigInt(amount));

  newRewardsClaimEvent.parameters.push(userParam);
  newRewardsClaimEvent.parameters.push(rewardRoundParam);
  newRewardsClaimEvent.parameters.push(amountParam);

  return newRewardsClaimEvent;
}

import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { newMockEvent } from "matchstick-as";
import { ZERO_BI } from "../../../../../helpers/constants";
import { Claim as MultiRewardsClaim } from "../../../generated/MultiRewardsDistributor/MultiRewardsDistributor";

/**
 * @param user
 * @param rewardRound
 * @param totalAmount
 * @param treeIds
 * @param amounts
 * @returns MultiRewardsClaim Event
 */
export function createMultiRewardsClaim(
  user: Address,
  rewardRound: BigInt,
  totalAmount: BigInt,
  treeIds: i32[],
  amounts: BigInt[],
  blockTimestamp: BigInt = ZERO_BI
): MultiRewardsClaim {
  const mockEvent = newMockEvent();
  const newRewardsClaimEvent = new MultiRewardsClaim(
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
  const totalAmountParam = new ethereum.EventParam("totalAmount", ethereum.Value.fromSignedBigInt(totalAmount));
  const treeIdsParam = new ethereum.EventParam("treeIds", ethereum.Value.fromI32Array(treeIds));
  const amountsParam = new ethereum.EventParam("amounts", ethereum.Value.fromSignedBigIntArray(amounts));

  newRewardsClaimEvent.parameters.push(userParam);
  newRewardsClaimEvent.parameters.push(rewardRoundParam);
  newRewardsClaimEvent.parameters.push(totalAmountParam);
  newRewardsClaimEvent.parameters.push(treeIdsParam);
  newRewardsClaimEvent.parameters.push(amountsParam);

  return newRewardsClaimEvent;
}

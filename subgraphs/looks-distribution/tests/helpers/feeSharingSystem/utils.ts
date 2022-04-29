import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { newMockEvent } from "matchstick-as";
import {
  Deposit as DepositFeeSharing,
  Harvest as HarvestFeeSharing,
  Withdraw as WithdrawFeeSharing,
  NewRewardPeriod,
} from "../../../generated/FeeSharingSystem/FeeSharingSystem";
import { ZERO_BI } from "../../../../../helpers/constants";

/**
 * @param user
 * @param amount
 * @param harvestedAmount
 * @returns Deposit Event
 */
export function createDepositFeeSharingEvent(
  user: Address,
  amount: BigInt,
  harvestedAmount: BigInt,
  blockTimestamp: BigInt = ZERO_BI
): DepositFeeSharing {
  const mockEvent = newMockEvent();
  const newDepositEvent = new DepositFeeSharing(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters
  );

  newDepositEvent.block.timestamp = blockTimestamp;
  newDepositEvent.parameters = [];

  const userParam = new ethereum.EventParam("user", ethereum.Value.fromAddress(user));
  const amountParam = new ethereum.EventParam("amount", ethereum.Value.fromSignedBigInt(amount));
  const harvestedAmountParam = new ethereum.EventParam(
    "harvestedAmount",
    ethereum.Value.fromSignedBigInt(harvestedAmount)
  );

  newDepositEvent.parameters.push(userParam);
  newDepositEvent.parameters.push(amountParam);
  newDepositEvent.parameters.push(harvestedAmountParam);

  return newDepositEvent;
}

/**
 * @param user
 * @param harvestedAmount
 * @returns Harvest Event
 */
export function createHarvestFeeSharingEvent(
  user: Address,
  harvestedAmount: BigInt,
  blockTimestamp: BigInt = ZERO_BI
): HarvestFeeSharing {
  const mockEvent = newMockEvent();
  const newHarvestEvent = new HarvestFeeSharing(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters
  );

  newHarvestEvent.block.timestamp = blockTimestamp;
  newHarvestEvent.parameters = [];

  const userParam = new ethereum.EventParam("user", ethereum.Value.fromAddress(user));
  const harvestedAmountParam = new ethereum.EventParam(
    "harvestedAmount",
    ethereum.Value.fromSignedBigInt(harvestedAmount)
  );

  newHarvestEvent.parameters.push(userParam);
  newHarvestEvent.parameters.push(harvestedAmountParam);

  return newHarvestEvent;
}

/**
 * @param user
 * @param amount
 * @param harvestedAmount
 * @returns Withdraw Event
 */
export function createWithdrawFeeSharingEvent(
  user: Address,
  amount: BigInt,
  harvestedAmount: BigInt,
  blockTimestamp: BigInt = ZERO_BI
): WithdrawFeeSharing {
  const mockEvent = newMockEvent();
  const newWithdrawEvent = new WithdrawFeeSharing(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters
  );

  newWithdrawEvent.block.timestamp = blockTimestamp;
  newWithdrawEvent.parameters = [];

  const userParam = new ethereum.EventParam("user", ethereum.Value.fromAddress(user));
  const amountParam = new ethereum.EventParam("amount", ethereum.Value.fromSignedBigInt(amount));
  const harvestedAmountParam = new ethereum.EventParam(
    "harvestedAmount",
    ethereum.Value.fromSignedBigInt(harvestedAmount)
  );

  newWithdrawEvent.parameters.push(userParam);
  newWithdrawEvent.parameters.push(amountParam);
  newWithdrawEvent.parameters.push(harvestedAmountParam);

  return newWithdrawEvent;
}

/**
 * @param numberBlocks
 * @param rewardPerBlock
 * @param reward
 * @returns NewRewardPeriod Event
 */
export function createNewRewardPeriodEvent(
  numberBlocks: BigInt,
  rewardPerBlock: BigInt,
  reward: BigInt,
  blockNumber: BigInt = ZERO_BI,
  blockTimestamp: BigInt = ZERO_BI
): NewRewardPeriod {
  const mockEvent = newMockEvent();
  const newRewardPeriodEvent = new NewRewardPeriod(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters
  );

  newRewardPeriodEvent.block.number = blockNumber;
  newRewardPeriodEvent.block.timestamp = blockTimestamp;
  newRewardPeriodEvent.parameters = [];

  const numberBlocksParam = new ethereum.EventParam("numberBlocks", ethereum.Value.fromSignedBigInt(numberBlocks));
  const rewardPerBlockPAram = new ethereum.EventParam(
    "rewardPerBlock",
    ethereum.Value.fromSignedBigInt(rewardPerBlock)
  );
  const rewardParam = new ethereum.EventParam("reward", ethereum.Value.fromSignedBigInt(reward));

  newRewardPeriodEvent.parameters.push(numberBlocksParam);
  newRewardPeriodEvent.parameters.push(rewardPerBlockPAram);
  newRewardPeriodEvent.parameters.push(rewardParam);

  return newRewardPeriodEvent;
}

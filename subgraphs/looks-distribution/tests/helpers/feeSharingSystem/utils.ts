/* eslint-disable prefer-const */
import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { newMockEvent } from "matchstick-as";
import {
  Deposit as DepositFeeSharing,
  Withdraw as WithdrawFeeSharing,
} from "../../../generated/FeeSharingSystem/FeeSharingSystem";
import { ZERO_BI } from "../../../../../helpers/utils";

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
  let mockEvent = newMockEvent();
  let newDepositEvent = new DepositFeeSharing(
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

  let userParam = new ethereum.EventParam("user", ethereum.Value.fromAddress(user));
  let amountParam = new ethereum.EventParam("amount", ethereum.Value.fromSignedBigInt(amount));
  let harvestedAmountParam = new ethereum.EventParam(
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
  let mockEvent = newMockEvent();
  let newWithdrawEvent = new WithdrawFeeSharing(
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

  let userParam = new ethereum.EventParam("user", ethereum.Value.fromAddress(user));
  let amountParam = new ethereum.EventParam("amount", ethereum.Value.fromSignedBigInt(amount));
  let harvestedAmountParam = new ethereum.EventParam(
    "harvestedAmount",
    ethereum.Value.fromSignedBigInt(harvestedAmount)
  );

  newWithdrawEvent.parameters.push(userParam);
  newWithdrawEvent.parameters.push(amountParam);
  newWithdrawEvent.parameters.push(harvestedAmountParam);

  return newWithdrawEvent;
}

/* eslint-disable prefer-const */
import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { newMockEvent } from "matchstick-as";

import { ZERO_BI } from "../../../../../helpers/constants";
import {
  ConversionToLOOKS,
  Deposit as DepositAggregatorUniswapV3,
  Withdraw as WithdrawAggregatorUniswapV3,
} from "../../../generated/AggregatorFeeSharingWithUniswapV3/AggregatorFeeSharingWithUniswapV3";

/**
 * @param user
 * @param amount
 * @returns Deposit Event
 */
export function createDepositAggregatorEvent(
  user: Address,
  amount: BigInt,
  blockTimestamp: BigInt = ZERO_BI
): DepositAggregatorUniswapV3 {
  let mockEvent = newMockEvent();
  let newDepositEvent = new DepositAggregatorUniswapV3(
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

  newDepositEvent.parameters.push(userParam);
  newDepositEvent.parameters.push(amountParam);

  return newDepositEvent;
}

/**
 * @param user
 * @param amount
 * @returns Withdraw Event
 */
export function createWithdrawAggregatorEvent(
  user: Address,
  amount: BigInt,
  blockTimestamp: BigInt = ZERO_BI
): WithdrawAggregatorUniswapV3 {
  let mockEvent = newMockEvent();
  let newWithdrawEvent = new WithdrawAggregatorUniswapV3(
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

  newWithdrawEvent.parameters.push(userParam);
  newWithdrawEvent.parameters.push(amountParam);

  return newWithdrawEvent;
}

/**
 * @param amountSold amount sold in WETH
 * @param amountReceived amount received in LOOKS
 * @returns ConversionToLOOKS Event
 */
export function createConversionToLOOKSEvent(
  amountSold: BigInt,
  amountReceived: BigInt,
  blockTimestamp: BigInt = ZERO_BI
): ConversionToLOOKS {
  let mockEvent = newMockEvent();
  let newConversionEvent = new ConversionToLOOKS(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters
  );

  newConversionEvent.block.timestamp = blockTimestamp;
  newConversionEvent.parameters = [];

  let amountSoldParam = new ethereum.EventParam("amountSold", ethereum.Value.fromSignedBigInt(amountSold));
  let amountReceivedParam = new ethereum.EventParam("amountReceived", ethereum.Value.fromSignedBigInt(amountReceived));

  newConversionEvent.parameters.push(amountSoldParam);
  newConversionEvent.parameters.push(amountReceivedParam);

  return newConversionEvent;
}

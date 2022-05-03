import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { newMockCall, newMockEvent } from "matchstick-as";
import {
  ConversionToLOOKS,
  Deposit as DepositAggregatorUniswapV3,
  Withdraw as WithdrawAggregatorUniswapV3,
  WithdrawCall,
  WithdrawAllCall,
} from "../../../generated/AggregatorFeeSharingWithUniswapV3/AggregatorFeeSharingWithUniswapV3";
import { ZERO_BI } from "../../../../../helpers/constants";

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
  const mockEvent = newMockEvent();
  const newDepositEvent = new DepositAggregatorUniswapV3(
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
  const mockEvent = newMockEvent();
  const newWithdrawEvent = new WithdrawAggregatorUniswapV3(
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
  blockNumber: BigInt = ZERO_BI,
  blockTimestamp: BigInt = ZERO_BI
): ConversionToLOOKS {
  const mockEvent = newMockEvent();
  const newConversionEvent = new ConversionToLOOKS(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters
  );

  newConversionEvent.block.number = blockNumber;
  newConversionEvent.block.timestamp = blockTimestamp;
  newConversionEvent.parameters = [];

  const amountSoldParam = new ethereum.EventParam("amountSold", ethereum.Value.fromSignedBigInt(amountSold));
  const amountReceivedParam = new ethereum.EventParam(
    "amountReceived",
    ethereum.Value.fromSignedBigInt(amountReceived)
  );

  newConversionEvent.parameters.push(amountSoldParam);
  newConversionEvent.parameters.push(amountReceivedParam);

  return newConversionEvent;
}

export function createWithdrawAggregatorCall(to: Address, from: Address, blockTimestamp: BigInt): WithdrawCall {
  const mockCall = newMockCall();

  const newWithdrawCall = new WithdrawCall(
    to,
    from,
    mockCall.block,
    mockCall.transaction,
    mockCall.inputValues,
    mockCall.outputValues
  );

  newWithdrawCall.block.timestamp = blockTimestamp;

  return newWithdrawCall;
}

export function createWithdrawAllAggregatorCall(to: Address, from: Address, blockTimestamp: BigInt): WithdrawAllCall {
  const mockCall = newMockCall();

  const newWithdrawAllCall = new WithdrawAllCall(
    to,
    from,
    mockCall.block,
    mockCall.transaction,
    mockCall.inputValues,
    mockCall.outputValues
  );

  newWithdrawAllCall.block.timestamp = blockTimestamp;

  return newWithdrawAllCall;
}

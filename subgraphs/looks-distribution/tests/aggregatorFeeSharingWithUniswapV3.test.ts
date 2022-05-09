import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { assert, clearStore, createMockedFunction, log, test } from "matchstick-as/assembly/index";
import {
  createConversionToLOOKSEvent,
  createDepositAggregatorEvent,
  createWithdrawAggregatorCall,
  createWithdrawAggregatorEvent,
} from "./helpers/aggregatorFeeSharingWithUniswapV3/utils";
import { AggregatorConversion, User } from "../generated/schema";
import {
  handleCallWithdrawAggregatorUniswapV3,
  handleConversionToLOOKSAggregatorUniswapV3,
  handleDepositAggregatorUniswapV3,
  handleWithdrawAggregatorUniswapV3,
} from "../mappings";
import { AGGREGATOR_ADDRESS } from "../mappings/utils/config/addresses";
import { ONE_BI, ONE_ETHER_IN_WEI, TWO_BI, ZERO_BI } from "../../../helpers/constants";
import { parseEther } from "../../../helpers/utils";

test("Deposit + Withdraw (inferior to deposited amount) events", () => {
  const userAddress = Address.fromString("0x0000000000000000000000000000000000000001");

  /**
   * 1. User deposits 20 LOOKS
   */
  const amountDepositedInLOOKS = 20; // 20 LOOKS
  const amountDepositedInLOOKSWei = parseEther(amountDepositedInLOOKS);
  let blockTimestamp = BigInt.fromU32(1651086000);

  const newDepositEvent = createDepositAggregatorEvent(userAddress, amountDepositedInLOOKSWei, blockTimestamp);

  createMockedFunction(AGGREGATOR_ADDRESS, "totalShares", "totalShares():(uint256)").returns([
    ethereum.Value.fromSignedBigInt(amountDepositedInLOOKSWei),
  ]);

  createMockedFunction(
    AGGREGATOR_ADDRESS,
    "calculateSharePriceInLOOKS",
    "calculateSharePriceInLOOKS():(uint256)"
  ).returns([ethereum.Value.fromSignedBigInt(ONE_ETHER_IN_WEI)]);

  handleDepositAggregatorUniswapV3(newDepositEvent);

  let user = User.load(userAddress.toHex());
  if (user !== null) {
    assert.assertTrue(user.aggregatorIsActive);
    assert.stringEquals(user.aggregatorAdjustedDepositAmount.toString(), amountDepositedInLOOKS.toString());
    assert.bigIntEquals(user.aggregatorLastDepositDate, blockTimestamp);
  } else {
    log.warning("User doesn't exist", []);
  }

  /**
   * 2. User withdraws 15 LOOKS
   */
  let amountWithdrawnInLOOKS = 15; // 15 LOOKS
  let amountWithdrawnInLOOKSWei = parseEther(amountWithdrawnInLOOKS);
  blockTimestamp = BigInt.fromU32(1651086000);

  let newWithdrawEvent = createWithdrawAggregatorEvent(userAddress, amountWithdrawnInLOOKSWei, blockTimestamp);
  handleWithdrawAggregatorUniswapV3(newWithdrawEvent);

  user = User.load(userAddress.toHex());
  if (user !== null) {
    assert.assertTrue(user.aggregatorIsActive);
    assert.stringEquals(
      user.aggregatorAdjustedDepositAmount.toString(),
      (amountDepositedInLOOKS - amountWithdrawnInLOOKS).toString()
    );
    // LOOKS are not marked as collected until the adjusted deposit amount reaches 0
    assert.stringEquals(user.aggregatorTotalCollectedLOOKS.toString(), "0");
    assert.bigIntEquals(user.aggregatorLastWithdrawDate, blockTimestamp);
  } else {
    log.warning("User doesn't exist", []);
  }

  let newWithdrawCall = createWithdrawAggregatorCall(AGGREGATOR_ADDRESS, userAddress, blockTimestamp);

  createMockedFunction(AGGREGATOR_ADDRESS, "userInfo", "userInfo(address):(uint256)")
    .withArgs([ethereum.Value.fromAddress(userAddress)])
    .returns([ethereum.Value.fromSignedBigInt(ONE_BI)]);

  handleCallWithdrawAggregatorUniswapV3(newWithdrawCall);

  user = User.load(userAddress.toHex());
  if (user !== null) {
    assert.assertTrue(user.aggregatorIsActive);
  }

  /**
   * 3. User withdraws final 10 LOOKS (User made 5 LOOKS from his original deposit compounding)
   */
  amountWithdrawnInLOOKS = 10; // 10 LOOKS
  amountWithdrawnInLOOKSWei = parseEther(amountWithdrawnInLOOKS);
  blockTimestamp = BigInt.fromU32(1651089000);

  newWithdrawEvent = createWithdrawAggregatorEvent(userAddress, amountWithdrawnInLOOKSWei, blockTimestamp);
  handleWithdrawAggregatorUniswapV3(newWithdrawEvent);

  user = User.load(userAddress.toHex());
  if (user !== null) {
    assert.assertTrue(user.aggregatorIsActive);
    assert.stringEquals(user.aggregatorAdjustedDepositAmount.toString(), "0");
    // (15 + 10) - (20) = 5
    assert.stringEquals(user.aggregatorTotalCollectedLOOKS.toString(), "5");
    assert.bigIntEquals(user.aggregatorLastWithdrawDate, blockTimestamp);
  } else {
    log.warning("User doesn't exist", []);
  }

  newWithdrawCall = createWithdrawAggregatorCall(AGGREGATOR_ADDRESS, userAddress, blockTimestamp);

  createMockedFunction(AGGREGATOR_ADDRESS, "userInfo", "userInfo(address):(uint256)")
    .withArgs([ethereum.Value.fromAddress(userAddress)])
    .returns([ethereum.Value.fromSignedBigInt(ZERO_BI)]);

  handleCallWithdrawAggregatorUniswapV3(newWithdrawCall);

  user = User.load(userAddress.toHex());
  if (user !== null) {
    assert.assertTrue(!user.aggregatorIsActive);
  }
  clearStore();
});

test("ConversionToLOOKS event creates AggregatorConversion entity", () => {
  /**
   * 2 WETH sold 2000 LOOKS
   */
  const amountSoldInWETH = 2; // 2 WETH
  const amountSoldInWETHWei = parseEther(amountSoldInWETH);
  const amountReceivedInLOOKS = 2000; // 2000 LOOKS
  const amountReceivedInLOOKSWei = parseEther(amountReceivedInLOOKS);
  const blockNumber = TWO_BI;
  const blockTimestamp = BigInt.fromU32(1651086000);

  const newConversionEvent = createConversionToLOOKSEvent(
    amountSoldInWETHWei,
    amountReceivedInLOOKSWei,
    blockNumber,
    blockTimestamp
  );
  handleConversionToLOOKSAggregatorUniswapV3(newConversionEvent);

  const conversion = AggregatorConversion.load(newConversionEvent.transaction.hash.toHex());
  if (conversion !== null) {
    assert.bigIntEquals(conversion.block, blockNumber);
    assert.bigIntEquals(conversion.date, blockTimestamp);
    assert.stringEquals(conversion.amountSold.toString(), amountSoldInWETH.toString());
    assert.stringEquals(conversion.amountReceived.toString(), amountReceivedInLOOKS.toString());
  } else {
    log.warning("Conversion doesn't exist", []);
  }
  clearStore();
});

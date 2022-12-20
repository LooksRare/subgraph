import { ONE_BI, ONE_DAY_BI, ZERO_BI } from "../../../../helpers/constants";
import { TakerBid } from "../../generated/LooksRareV1/LooksRareExchange";
import { User, UserDailyData } from "../../generated/schema";
import { extractOriginator } from "../utils/extractOriginator";
import { findSweepEventFromLogs } from "../utils/findSweepEventFromLogs";
import { getOrInitializeAggregator } from "../utils/getOrInitializeAggregator";
import { getOrInitializeAggregatorByCurrency } from "../utils/getOrInitializeAggregatorByCurrency";
import { getOrInitializeAggregatorDailyData } from "../utils/getOrInitializeAggregatorDailyData";
import { getOrInitializeAggregatorDailyDataByCurrency } from "../utils/getOrInitializeAggregatorDailyDataByCurrency";
import { getOrInitializeMarketplace } from "../utils/getOrInitializeMarketplace";
import { getOrInitializeMarketplaceByCurrency } from "../utils/getOrInitializeMarketplaceByCurrency";
import { getOrInitializeMarketplaceDailyData } from "../utils/getOrInitializeMarketplaceDailyData";
import { getOrInitializeMarketplaceDailyDataByCurrency } from "../utils/getOrInitializeMarketplaceDailyDataByCurrency";
import { getOrInitializeUserByCurrency } from "../utils/getOrInitializeUserByCurrency";
import { getOrInitializeUserDailyDataByCurrency } from "../utils/getOrInitializeUserDailyDataByCurrency";

export function handleTakerBid(event: TakerBid): void {
  const logs = event.receipt!.logs;

  const sweepEvent = findSweepEventFromLogs(logs);
  if (!sweepEvent) return;

  const currency = event.params.currency;
  const price = event.params.price.toBigDecimal();
  const dayID = event.block.timestamp.div(ONE_DAY_BI);

  // 1. Aggregator
  const aggregator = getOrInitializeAggregator();
  aggregator.transactions = aggregator.transactions.plus(ONE_BI);

  // 2. Aggregator by currency
  const aggregatorByCurrency = getOrInitializeAggregatorByCurrency(aggregator, currency);
  aggregatorByCurrency.volume = aggregatorByCurrency.volume.plus(price);
  aggregatorByCurrency.transactions = aggregatorByCurrency.transactions.plus(ONE_BI);

  // 3. Aggregator daily data
  const aggregatorDailyData = getOrInitializeAggregatorDailyData(dayID, aggregator);
  aggregatorDailyData.transactions = aggregatorDailyData.transactions.plus(ONE_BI);

  // 4. Aggregator daily data by currency
  const aggregatorDailyDataByCurrency = getOrInitializeAggregatorDailyDataByCurrency(
    aggregatorByCurrency,
    aggregatorDailyData,
    dayID
  );
  aggregatorDailyDataByCurrency.volume = aggregatorDailyDataByCurrency.volume.plus(price);

  // 5. Marketplace
  const marketplace = getOrInitializeMarketplace("LooksRareV1");
  marketplace.transactions = marketplace.transactions.plus(ONE_BI);

  // 6. Marketplace by currency
  const marketplaceByCurrency = getOrInitializeMarketplaceByCurrency(marketplace, currency);
  marketplaceByCurrency.volume = marketplaceByCurrency.volume.plus(price);
  marketplaceByCurrency.transactions = marketplaceByCurrency.transactions.plus(ONE_BI);

  // 7. Marketplace daily data
  const marketplaceDailyData = getOrInitializeMarketplaceDailyData(currency, marketplace, dayID);
  marketplaceDailyData.transactions = marketplaceDailyData.transactions.plus(ONE_BI);

  // 8. Marketplace daily data by currency
  const marketplaceDailyDataByCurrency = getOrInitializeMarketplaceDailyDataByCurrency(
    marketplaceDailyData,
    marketplaceByCurrency,
    dayID
  );
  marketplaceDailyDataByCurrency.volume = marketplaceDailyDataByCurrency.volume.plus(price);

  // 9. User
  const originator = extractOriginator(sweepEvent);
  const userID = originator.toHexString();
  let user = User.load(userID);
  if (!user) {
    user = new User(userID);
    user.transactions = ZERO_BI;

    // New aggregator/marketplace user
    aggregator.users = aggregator.users.plus(ONE_BI);
    aggregatorByCurrency.users = aggregatorByCurrency.users.plus(ONE_BI);
    marketplace.users = marketplace.users.plus(ONE_BI);
    marketplaceByCurrency.users = marketplaceByCurrency.users.plus(ONE_BI);
  }
  user.transactions = user.transactions.plus(ONE_BI);

  const userByCurrency = getOrInitializeUserByCurrency(user, currency);
  userByCurrency.volume = userByCurrency.volume.plus(price);
  userByCurrency.transactions = userByCurrency.transactions.plus(ONE_BI);

  // 10. UserDailyData
  const userDailyDataID = `${userID}-${dayID.toString()}`;
  let userDailyData = UserDailyData.load(userDailyDataID);
  if (!userDailyData) {
    userDailyData = new UserDailyData(userDailyDataID);
    const dayStartTimestamp = dayID.times(ONE_DAY_BI);
    userDailyData.date = dayStartTimestamp;
    userDailyData.transactions = ZERO_BI;
    userDailyData.user = userID;

    // New aggregator/marketplace user for the day
    aggregatorDailyData.users = aggregatorDailyData.users.plus(ONE_BI);
    aggregatorDailyDataByCurrency.users = aggregatorDailyDataByCurrency.users.plus(ONE_BI);
    marketplaceDailyData.users = marketplaceDailyData.users.plus(ONE_BI);
    marketplaceDailyDataByCurrency.users = marketplaceDailyDataByCurrency.users.plus(ONE_BI);
  }
  userDailyData.transactions = userDailyData.transactions.plus(ONE_BI);

  // 11. UesrDailyDataByCurrency
  const userDailyDataByCurrency = getOrInitializeUserDailyDataByCurrency(userDailyData, userByCurrency, dayID);
  userDailyDataByCurrency.volume = userDailyDataByCurrency.volume.plus(price);

  aggregator.save();
  aggregatorByCurrency.save();
  aggregatorDailyData.save();
  aggregatorDailyDataByCurrency.save();
  marketplace.save();
  marketplaceByCurrency.save();
  marketplaceDailyData.save();
  marketplaceDailyDataByCurrency.save();
  user.save();
  userByCurrency.save();
  userDailyData.save();
  userDailyDataByCurrency.save();
}

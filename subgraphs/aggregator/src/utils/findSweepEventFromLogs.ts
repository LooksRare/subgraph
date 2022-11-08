import { Bytes, ethereum } from "@graphprotocol/graph-ts";
import { LOOKSRARE_AGGREGATOR, LOOKSRARE_AGGREGATOR_SWEEP_EVENT_TOPIC } from "../../../../helpers/constants";

export function findSweepEventFromLogs(logs: ethereum.Log[]): ethereum.Log | null {
  const sweepEventIndex = logs.findIndex((log) => {
    return (
      log.address == LOOKSRARE_AGGREGATOR &&
      log.topics[0] == Bytes.fromHexString(LOOKSRARE_AGGREGATOR_SWEEP_EVENT_TOPIC)
    );
  });
  if (sweepEventIndex === -1) return null;
  return logs[sweepEventIndex];
}

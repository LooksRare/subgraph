import { Address, Bytes, ethereum } from "@graphprotocol/graph-ts";

export function extractOriginator(sweepEvent: ethereum.Log): Bytes {
  return Address.fromHexString(`0x${sweepEvent.topics[1].toHexString().substring(26)}`);
}

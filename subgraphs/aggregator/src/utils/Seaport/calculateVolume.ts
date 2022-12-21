import { BigDecimal } from "@graphprotocol/graph-ts";
import { ZERO_BD } from "../../../../../helpers/constants";
import { OrderFulfilledConsiderationStruct } from "../../../generated/Seaport/Seaport";

export function calculateVolume(consideration: OrderFulfilledConsiderationStruct[]): BigDecimal {
  let volume = ZERO_BD;
  for (let i = 0; i < consideration.length; i++) {
    volume = volume.plus(consideration[i].amount.toBigDecimal());
  }
  return volume;
}

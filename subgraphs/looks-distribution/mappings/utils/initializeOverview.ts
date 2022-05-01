import { ONE_BI, ZERO_BD, ZERO_BI } from "../../../../helpers/constants";
import { Overview } from "../../generated/schema";

export function initializeOverview(): Overview {
  const overview = new Overview(ONE_BI.toHex());
  overview.aggregatorActiveUsers = ZERO_BI;
  overview.aggregatorTotalStakedLOOKS = ZERO_BD;
  overview.feeSharingActiveUsers = ZERO_BI;
  overview.feeSharingTotalStakedLOOKS = ZERO_BD;
  return overview;
}

/* バリデート */

import { RequestQuery } from "../attribute/types";

/* eslint @typescript-eslint/no-explicit-any: 0 */
export const validateRequestQuery = (query: any): RequestQuery | undefined => {
  const {jobid, supporterid, code, state} = query;

  if (!jobid || !supporterid || !code || !state) {
    return undefined;
  }

  return {
    jobid,
    supporterid,
    code,
    state,
  } as RequestQuery;
};

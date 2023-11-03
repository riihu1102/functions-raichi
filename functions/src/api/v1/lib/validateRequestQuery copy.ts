/* バリデート */


/* eslint @typescript-eslint/no-explicit-any: 0 */
export const validateAffiliatorQuery =
    (query: any): {code: string, state: string} | undefined => {
      const {code, state} = query;

      if (!code || !state) {
        return undefined;
      }

      return {
        code,
        state,
      };
    };

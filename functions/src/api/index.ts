import * as listerner from "./v1/listerner";
import * as register from "./v1/register";
import * as line from "./v2/line";
import * as mock from "./v2/mock";

export const v1 = {
  listerner: {...listerner},
  register: {...register},
};

export const v2 = {
  line: {login: {...line}},
  mock: {...mock},
};

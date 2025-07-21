import { createConsola } from "consola";

const get = (namespace: string) => createConsola({ defaults: { tag: namespace } });

export const logger = {
  get,
};

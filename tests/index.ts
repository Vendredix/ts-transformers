import {enumValues} from "../index";

declare const enum Permissions {
  READ = 1,
  WRITE = 2,
  READ_WRITE = READ | WRITE,
}

declare const enum Types {
  TEXT = "text",
  INTEGER = "integer",
}

const permissions = enumValues<Permissions>();
const types = enumValues<Types>();

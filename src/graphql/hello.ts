import { extendType } from "nexus";

export const Query = extendType({
  type: "Query",
  definition(t) {
    t.nonNull.string("hello", {
      resolve() {
        return "Hello World!";
      },
    });
  },
});

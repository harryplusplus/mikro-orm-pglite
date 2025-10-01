import * as z from "zod/v4/mini";

export const VersionRow = z.object({
  version: z.string(),
});

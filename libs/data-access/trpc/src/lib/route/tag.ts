import { procedure, router } from '../core';

const listProcedure = procedure.query(async ({ ctx }) => {
  const tags = await ctx.prisma.tag.findMany();

  return tags;
});
export const tagRouter = router({
  list: listProcedure,
});

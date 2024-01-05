import { TRPCError } from "@trpc/server";

import type { NonNullableUserContext } from "../../lib/types";
import { serialize } from "../terms/utils/serialize";
import type { TEditTermSchema } from "./edit-term.schema";

type EditTermOptions = {
  ctx: NonNullableUserContext;
  input: TEditTermSchema;
};

export const editTermHandler = async ({ ctx, input }: EditTermOptions) => {
  const submission = await ctx.prisma.submission.findUnique({
    where: {
      id: input.submissionId,
      member: {
        userId: ctx.session.user.id,
      },
      submittedAt: null,
    },
  });

  if (!submission) {
    throw new TRPCError({
      code: "NOT_FOUND",
    });
  }

  const { plainText: word, richText: wordRichText } = serialize(
    input.word,
    input.wordRichText,
    false,
  );
  const { plainText: definition, richText: definitionRichText } = serialize(
    input.definition,
    input.definitionRichText,
    false,
  );

  const term = await ctx.prisma.term.update({
    where: {
      id_submissionId: {
        id: input.id,
        submissionId: input.submissionId,
      },
      authorId: ctx.session.user.id,
      ephemeral: true,
    },
    data: {
      word,
      definition,
      wordRichText,
      definitionRichText,
    },
  });
  return term;
};

export default editTermHandler;

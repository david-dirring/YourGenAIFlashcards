import {
  type MatchData,
  type MultipleChoiceData,
  type TermWithDistractors,
  type TestQuestion,
  TestQuestionType,
  type TrueFalseData,
} from "@quenti/interfaces";
import { getRandom, shuffleArray } from "@quenti/lib/array";
import type { StudySetAnswerMode, Term } from "@quenti/prisma/client";

export const getAnswerMode = (
  answerMode: StudySetAnswerMode,
): StudySetAnswerMode => {
  if (answerMode == "Both") return Math.random() > 0.5 ? "Word" : "Definition";
  return answerMode;
};

export const generateTrueFalseQuestion = (
  term: TermWithDistractors,
  answerMode: StudySetAnswerMode,
): TestQuestion<TrueFalseData> => {
  const evaluation = Math.random() > 0.5;
  const distractor = !evaluation
    ? getRandom(term.distractors.filter((d) => d.type == answerMode))
    : undefined;

  return {
    type: TestQuestionType.TrueFalse,
    answerMode: getAnswerMode(answerMode),
    data: {
      term,
      distractor,
    },
    answered: false,
  };
};

export const generateMcqQuestion = (
  term: TermWithDistractors,
  answerMode: StudySetAnswerMode,
): TestQuestion<MultipleChoiceData> => {
  // const distractors = term.;
  const choices = shuffleArray([
    term,
    ...term.distractors
      .filter((d) => d.type == answerMode)
      .map((d) => ({
        id: d.id,
        word: d.word,
        definition: d.definition,
      })),
  ]);

  return {
    type: TestQuestionType.MultipleChoice,
    answerMode: getAnswerMode(answerMode),
    data: {
      term,
      choices,
    },
    answered: false,
  };
};

export const generateMatchQuestion = (
  terms: Term[],
  answerMode: StudySetAnswerMode,
): TestQuestion<MatchData> => {
  return {
    type: TestQuestionType.Match,
    answerMode: getAnswerMode(answerMode),
    data: {
      terms: shuffleArray(Array.from(terms)),
      zones: terms,
      answer: [],
    },
    answered: false,
  };
};

export const generateWriteQuestion = (
  term: Term,
  answerMode: StudySetAnswerMode,
): TestQuestion => {
  return {
    type: TestQuestionType.Write,
    answerMode: getAnswerMode(answerMode),
    data: { term, answer: "" },
    answered: false,
  };
};

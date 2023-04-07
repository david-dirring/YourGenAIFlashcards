import type { Term } from "@prisma/client";
import React from "react";
import { createStore, useStore } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import type { StudiableTerm } from "../interfaces/studiable-term";

export interface SortFlashcardsStoreProps {
  studiableTerms: StudiableTerm[];
  allTerms: Term[];
  termsThisRound: StudiableTerm[];
  index: number;
  currentRound: number;
  progressView: boolean;
}

interface SortFlashcardsState extends SortFlashcardsStoreProps {
  initialize: (
    round: number,
    studiableTerms: StudiableTerm[],
    allTerms: Term[]
  ) => void;
  markStillLearning: (termId: string) => void;
  markKnown: (termId: string) => void;
  endSortCallback: () => void;
  nextRound: (start?: boolean) => void;
}

export type SortFlashcardsStore = ReturnType<typeof createSortFlashcardsStore>;

export const createSortFlashcardsStore = (
  initProps?: Partial<SortFlashcardsStoreProps>
) => {
  const DEFAULT_PROPS: SortFlashcardsStoreProps = {
    studiableTerms: [],
    allTerms: [],
    termsThisRound: [],
    index: 0,
    currentRound: 0,
    progressView: false,
  };

  return createStore<SortFlashcardsState>()(
    subscribeWithSelector((set) => ({
      ...DEFAULT_PROPS,
      ...initProps,
      initialize: (round, studiableTerms, allTerms) => {
        set({
          studiableTerms,
          allTerms,
          currentRound: round,
        });

        set((state) => {
          state.nextRound(true);
          return {};
        });
      },
      markStillLearning: (termId) => {
        set((state) => {
          const active = state.termsThisRound[state.index]!;
          if (active.id != termId) throw new Error("Mismatched term id");
          active.correctness = -1;
          active.incorrectCount++;

          state.endSortCallback();
          return {};
        });
      },
      markKnown: (termId) => {
        set((state) => {
          const active = state.termsThisRound[state.index]!;
          if (active.id != termId) throw new Error("Mismatched term id");
          active.correctness = 1;

          state.endSortCallback();
          return {};
        });
      },
      endSortCallback: () => {
        set((state) => {
          if (state.index == state.termsThisRound.length - 1) {
            return {
              progressView: true,
            };
          }
          return {
            index: state.index + 1,
          };
        });
      },
      nextRound: (start = false) => {
        set((state) => {
          const currentRound = state.currentRound + (!start ? 1 : 0);

          // Terms that show up as previously answered are marked with set correctness and with the current round
          const tailTerms = state.studiableTerms.filter(
            (t) => t.correctness != 0 && t.appearedInRound == currentRound
          );
          // The rest are terms that are unknown, or incorrect but haven't been shown yet (appearedInRound is one less than currentRound)
          const headTerms = state.studiableTerms.filter(
            (t) =>
              t.correctness == 0 ||
              (t.correctness == -1 && t.appearedInRound == currentRound - 1)
          );
          const termsThisRound = [...tailTerms, ...headTerms];
          // Start the index at the first head term
          const index = tailTerms.length;

          return {
            currentRound,
            index,
            termsThisRound,
            progressView: index == termsThisRound.length,
          };
        });
      },
    }))
  );
};

export const SortFlashcardsContext =
  React.createContext<SortFlashcardsStore | null>(null);

export const useSortFlashcardsContext = <T>(
  selector: (state: SortFlashcardsState) => T,
  equalityFn?: (left: T, right: T) => boolean
): T => {
  const store = React.useContext(SortFlashcardsContext);
  if (!store) throw new Error("Missing LearnContext.Provider in the tree");

  return useStore(store, selector, equalityFn);
};
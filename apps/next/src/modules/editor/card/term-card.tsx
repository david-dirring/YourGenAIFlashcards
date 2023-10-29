import type { DraggableAttributes } from "@dnd-kit/core";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import { useInView } from "framer-motion";
import React from "react";

import { Box, Card } from "@chakra-ui/react";

import { useSetEditorContext } from "../../../stores/use-set-editor-store";
import { DeloadedCard } from "./deloaded-card";
import { InnerTermCard } from "./inner-term-card";
import type { SortableTermCardProps } from "./sortable-term-card";

export interface TermCardProps extends SortableTermCardProps {
  style: React.CSSProperties;
  attributes: DraggableAttributes;
  listeners: SyntheticListenerMap | undefined;
}

export type TermCardRef = HTMLDivElement;

const padNextFour = (ranks: number[]) => {
  const last = ranks[ranks.length - 1]!;
  return [...ranks, last + 1, last + 2, last + 3, last + 4];
};

export const TermCard = React.forwardRef<TermCardRef, TermCardProps>(
  function TermCardInner(props, ref) {
    const innerRef = React.useRef<HTMLDivElement>(null);
    const inView = useInView(innerRef);
    const visible = useSetEditorContext((s) =>
      padNextFour(s.visibleTerms).includes(props.term.rank),
    );
    const hideTimeout = React.useRef<NodeJS.Timeout | null>(null);

    const setTermVisible = useSetEditorContext((s) => s.setTermVisible);

    React.useEffect(() => {
      if (inView) {
        if (hideTimeout.current) clearTimeout(hideTimeout.current);
        setTermVisible(props.term.rank, inView);
      } else {
        hideTimeout.current = setTimeout(() => {
          setTermVisible(props.term.rank, false);
        }, 300);
      }

      return () => {
        if (hideTimeout.current) clearTimeout(hideTimeout.current);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [inView]);

    return (
      <Card
        ref={ref}
        rounded="xl"
        borderWidth="2px"
        bg="white"
        borderColor="gray.50"
        _dark={{
          bg: "gray.750",
          borderColor: "gray.700",
        }}
        style={props.style}
      >
        <Box ref={innerRef}>
          {visible || props.justCreated ? (
            <InnerTermCard {...props} />
          ) : (
            <DeloadedCard
              word={props.term.word}
              definition={props.term.definition}
            />
          )}
        </Box>
      </Card>
    );
  },
);

export const TermCardPure = React.memo(TermCard);
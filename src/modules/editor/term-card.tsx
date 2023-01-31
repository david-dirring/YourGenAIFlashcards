import {
  Card,
  Flex,
  HStack,
  IconButton,
  Input,
  Stack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { AutoSaveTerm, Term } from "@prisma/client";
import { IconGripHorizontal, IconTrash } from "@tabler/icons-react";
import React from "react";

interface TermCardProps {
  term: Term | AutoSaveTerm;
  editTerm: (id: string, word: string, definition: string) => void;
  deleteTerm: (id: string) => void;
}

export const TermCard: React.FC<TermCardProps> = ({
  term,
  editTerm,
  deleteTerm,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: term.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 2000 : undefined,
  };

  const [word, setWord] = React.useState(term.word);
  const [definition, setDefinition] = React.useState(term.definition);

  React.useEffect(() => {
    setWord(term.word);
    setDefinition(term.definition);
  }, [term.word, term.definition]);

  return (
    <Card
      position="relative"
      ref={setNodeRef}
      style={style}
      shadow={isDragging ? "xl" : "lg"}
    >
      <Stack>
        <Flex
          align="center"
          borderBottom="4px"
          borderColor={useColorModeValue("gray.100", "gray.900")}
          roundedTop="md"
          bg={useColorModeValue("gray.50", "gray.750")}
          px="5"
          py="3"
          justify="space-between"
        >
          <Text fontWeight={700}>{term.rank + 1}</Text>
          <HStack>
            <IconButton
              icon={<IconGripHorizontal />}
              aria-label="Reorder"
              variant="ghost"
              {...attributes}
              {...listeners}
            />
            <IconButton
              icon={<IconTrash />}
              aria-label="Delete"
              variant="ghost"
              onClick={() => deleteTerm(term.id)}
            />
          </HStack>
        </Flex>
        <HStack px="5" pt="2" pb="6" spacing={6}>
          <Input
            placeholder="Enter term"
            variant="flushed"
            value={word}
            onChange={(e) => setWord(e.target.value)}
            onBlur={() => {
              if (word !== term.word) editTerm(term.id, word, definition);
            }}
          />
          <Input
            placeholder="Enter definition"
            variant="flushed"
            value={definition}
            onChange={(e) => setDefinition(e.target.value)}
            onBlur={() => {
              if (definition !== term.definition)
                editTerm(term.id, word, definition);
            }}
          />
        </HStack>
      </Stack>
    </Card>
  );
};

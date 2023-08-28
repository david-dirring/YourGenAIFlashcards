import { Link } from "@quenti/components";

import {
  Button,
  ButtonGroup,
  Fade,
  HStack,
  Heading,
  ScaleFade,
  SlideFade,
  Stack,
} from "@chakra-ui/react";

import { IconReport } from "@tabler/icons-react";

import { useEntityRootUrl } from "../../hooks/use-entity-root-url";
import { useTestContext } from "../../stores/use-test-store";
import { TestCardGap } from "./card-gap";
import { CardWrapper } from "./card-wrapper";
import { ResultsCard } from "./results-card";

export const ResultsView = () => {
  const result = useTestContext((s) => s.result!);
  const questionCount = useTestContext((s) => s.questionCount);
  const outline = useTestContext((s) => s.outline);
  const reset = useTestContext((s) => s.reset);

  const rootUrl = useEntityRootUrl();

  return (
    <Stack spacing="6">
      <Fade
        in
        transition={{
          enter: {
            duration: 0.5,
          },
        }}
      >
        <HStack justifyContent="space-between">
          <Heading>Your results</Heading>
          <ButtonGroup>
            <Button leftIcon={<IconReport size={18} />} onClick={() => reset()}>
              New test
            </Button>
            <Button
              variant="outline"
              colorScheme="gray"
              as={Link}
              href={rootUrl}
            >
              Back
            </Button>
          </ButtonGroup>
        </HStack>
      </Fade>
      <ScaleFade in>
        <ResultsCard />
      </ScaleFade>
      <Stack spacing="0" pb="20">
        {outline.map(({ type, count, index }) => (
          <>
            <SlideFade
              in
              transition={{
                enter: {
                  delay: 0.2,
                  duration: 0.3,
                },
              }}
            >
              <TestCardGap
                type="question"
                index={index}
                numQuestions={questionCount}
                count={count}
                correctness={result.byQuestion[index]!.correct}
              />
            </SlideFade>
            <SlideFade
              in
              initial={{
                transform: "translateY(20px)",
              }}
              animate={{
                transform: "translateY(0px)",
              }}
              transition={{
                enter: {
                  duration: 0.3,
                },
              }}
            >
              <CardWrapper
                type={type}
                i={index}
                correctness={result.byQuestion[index]!.correct}
              />
            </SlideFade>
          </>
        ))}
      </Stack>
    </Stack>
  );
};
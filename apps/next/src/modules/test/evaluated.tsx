import { Box, HStack, Text } from "@chakra-ui/react";

import { IconCircleCheckFilled, IconCircleX } from "@tabler/icons-react";

import { ScriptFormatter } from "../../components/script-formatter";
import { Clickable } from "./clickable";

export const EvaluatedFalse: React.FC<{ children: string }> = ({
  children,
}) => {
  return (
    <Clickable disabled evaluation={false}>
      <HStack textAlign="start">
        <Box>
          <IconCircleX size={18} />
        </Box>
        <Text whiteSpace="pre-wrap" fontWeight={500}>
          <ScriptFormatter>{children}</ScriptFormatter>
        </Text>
      </HStack>
    </Clickable>
  );
};

export interface EvaluatedTrueProps {
  withColor?: boolean;
  children: string;
}

export const EvaluatedTrue: React.FC<EvaluatedTrueProps> = ({
  withColor = true,
  children,
}) => {
  const icon = <IconCircleCheckFilled size={18} />;

  return (
    <Clickable disabled hasIcon>
      <HStack textAlign="start">
        {withColor ? (
          <Box
            color="green.500"
            _dark={{
              color: "green.200",
            }}
          >
            {icon}
          </Box>
        ) : (
          <Box>{icon}</Box>
        )}
        <Text whiteSpace="pre-wrap" fontWeight={500}>
          <ScriptFormatter>{children}</ScriptFormatter>
        </Text>
      </HStack>
    </Clickable>
  );
};

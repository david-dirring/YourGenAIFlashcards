import {
  Box,
  Center,
  Container,
  Flex,
  HStack,
  Heading,
  Skeleton,
  SkeletonText,
  Stack,
  Tab,
  TabList,
  TabPanels,
  Tabs,
  Text,
  Tooltip,
  useColorModeValue,
} from "@chakra-ui/react";
import { IconDiscountCheck } from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { WithFooter } from "../../components/with-footer";
import { api, type RouterOutputs } from "../../utils/api";
import { organizationIcon } from "../../utils/icons";
import { useSession } from "next-auth/react";

type BaseReturn = RouterOutputs["organizations"]["get"];
type OrgMember = BaseReturn["members"][number];

export const OrganizationContext = React.createContext<
  | (RouterOutputs["organizations"]["get"] & {
      me: OrgMember;
    })
  | null
>(null);

export const OrganizationLayout: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const session = useSession();
  const router = useRouter();
  const slug = router.query.slug as string;

  const borderColor = useColorModeValue("gray.300", "gray.700");
  const mutedColor = useColorModeValue("gray.700", "gray.300");

  const { data: org } = api.organizations.get.useQuery(slug, {
    enabled: !!slug && !!session.data?.user,
  });
  const me = org
    ? org.members.find((m) => m.user.id === session.data!.user!.id)
    : null;

  const Icon = organizationIcon(org?.icon || 0);

  const getTabIndex = (route = router.asPath) => {
    switch (route) {
      case `/orgs/[slug]`:
        return 0;
      case `/orgs/[slug]/members`:
        return 1;
      case `/orgs/[slug]/settings`:
        return 2;
      case `/orgs/[slug]/billing`:
        return 3;
    }
  };

  const [tabIndex, setTabIndex] = React.useState(getTabIndex());

  return (
    <WithFooter>
      <OrganizationContext.Provider value={org && me ? { ...org, me } : null}>
        <Container maxW="6xl" overflow="hidden">
          <Stack spacing="10">
            <HStack spacing="6">
              <Skeleton isLoaded={!!org} fitContent rounded="full">
                <Center w="16" h="16" rounded="full" bg="blue.400">
                  <Icon size={32} color="white" />
                </Center>
              </Skeleton>
              <Stack spacing="0" flex="1" overflow="hidden">
                <Flex h="43.2px" alignItems="center" w="full">
                  <SkeletonText
                    isLoaded={!!org}
                    fitContent
                    noOfLines={1}
                    skeletonHeight="36px"
                    maxW="full"
                  >
                    <HStack w="full">
                      <Heading
                        overflow="hidden"
                        whiteSpace="nowrap"
                        textOverflow="ellipsis"
                        maxW="full"
                      >
                        {org?.name || "Loading..."}
                      </Heading>
                      <Box color="blue.300">
                        <Tooltip label="Verified Organization">
                          <IconDiscountCheck aria-label="Verified" />
                        </Tooltip>
                      </Box>
                    </HStack>
                  </SkeletonText>
                </Flex>
                <Flex h="21px" alignItems="center">
                  <SkeletonText
                    noOfLines={1}
                    fitContent
                    w="max-content"
                    isLoaded={!!org}
                    skeletonHeight="10px"
                  >
                    <Text fontSize="sm" color={mutedColor}>
                      {org?.slug || "loading"}
                    </Text>
                  </SkeletonText>
                </Flex>
              </Stack>
            </HStack>
            <Tabs
              borderColor={borderColor}
              size="sm"
              index={tabIndex}
              isManual
              onChange={(i) => setTabIndex(i)}
            >
              <TabList gap="10">
                <SkeletonTab isLoaded={!!org} href={`/orgs/${slug}`}>
                  Organization
                </SkeletonTab>
                <SkeletonTab isLoaded={!!org} href={`/orgs/${slug}/members`}>
                  Members
                </SkeletonTab>
                <SkeletonTab isLoaded={!!org} href={`/orgs/${slug}/settings`}>
                  Settings
                </SkeletonTab>
                <SkeletonTab isLoaded={!!org} href={`/orgs/${slug}/billing`}>
                  Billing
                </SkeletonTab>
              </TabList>
              <TabPanels mt="10">{children}</TabPanels>
            </Tabs>
          </Stack>
        </Container>
      </OrganizationContext.Provider>
    </WithFooter>
  );
};

interface SkeletonTabProps {
  isLoaded: boolean;
  href: string;
}

const SkeletonTab: React.FC<React.PropsWithChildren<SkeletonTabProps>> = ({
  isLoaded,
  children,
  href,
}) => {
  return (
    <Link href={href}>
      <Tab px="0" bg="none" fontWeight={600} pb="3" isSelected>
        <Flex alignItems="center" h="21px">
          <SkeletonText isLoaded={isLoaded} noOfLines={1} skeletonHeight="4">
            <Text>{children}</Text>
          </SkeletonText>
        </Flex>
      </Tab>
    </Link>
  );
};
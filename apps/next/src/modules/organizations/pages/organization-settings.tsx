import {
  Box,
  Button,
  ButtonGroup,
  Divider,
  Flex,
  HStack,
  Heading,
  IconButton,
  Input,
  Skeleton,
  SkeletonText,
  Stack,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import type { MembershipRole } from "@quenti/prisma/client";
import { api } from "@quenti/trpc";
import {
  IconLogout,
  IconSettings,
  IconTrash,
  IconWorldPlus,
} from "@tabler/icons-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React from "react";
import { AnimatedCheckCircle } from "../../../components/animated-icons/check";
import { SkeletonLabel } from "../../../components/skeleton-label";
import { ORGANIZATION_ICONS } from "../../../utils/icons";
import { DeleteOrganizationModal } from "../delete-organization-modal";
import { DomainCard } from "../domain-card";
import { LeaveOrganizationModal } from "../leave-organization-modal";
import { OrganizationAdminOnly } from "../organization-admin-only";
import { RemoveDomainModal } from "../remove-domain-modal";
import { SettingsWrapper } from "../settings-wrapper";
import { UpdateDomainModal } from "../update-domain-modal";

export const OrganizationSettings = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const utils = api.useContext();
  const id = router.query.id as string;

  const { data: org } = api.organizations.get.useQuery(
    { id },
    {
      enabled: !!id && !!session?.user,
      retry: false,
    }
  );

  const toast = useToast();
  const inputBg = useColorModeValue("white", "gray.900");
  const inputBorder = useColorModeValue("gray.200", "gray.600");
  const iconColor = useColorModeValue("#171923", "white");

  const [mounted, setMounted] = React.useState(false);
  const [orgName, setOrgName] = React.useState("");
  const [icon, setIcon] = React.useState<number | undefined>();
  const [leaveOpen, setLeaveOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [domainVerify, setDomainVerify] = React.useState(false);
  const [updateDomainOpen, setUpdateDomainOpen] = React.useState(false);
  const [removeDomain, setRemoveDomain] = React.useState<
    { id: string; domain: string } | undefined
  >();

  const update = api.organizations.update.useMutation({
    onSuccess: async () => {
      toast({
        title: "Organization updated successfully",
        status: "success",
        icon: <AnimatedCheckCircle />,
        containerStyle: { marginBottom: "2rem", marginTop: "-1rem" },
      });

      await utils.organizations.get.invalidate();
    },
  });

  React.useEffect(() => {
    if (org && !mounted) {
      setMounted(true);
      setOrgName(org.name);
      setIcon(org.icon);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [org]);

  const role: MembershipRole = org
    ? org.members.find((x) => x.userId == session?.user?.id)!.role
    : "Member";

  const isOwner = role == "Owner";
  const isAdmin = role == "Admin" || isOwner;

  return (
    <Stack spacing="8">
      <LeaveOrganizationModal
        isOpen={leaveOpen}
        onClose={() => {
          setLeaveOpen(false);
        }}
      />
      <DeleteOrganizationModal
        isOpen={deleteOpen}
        onClose={() => {
          setDeleteOpen(false);
        }}
      />
      <UpdateDomainModal
        isOpen={updateDomainOpen}
        onClose={() => {
          setUpdateDomainOpen(false);
        }}
        verify={domainVerify}
        onUpdate={() => {
          setDomainVerify(true);
        }}
      />
      <RemoveDomainModal
        isOpen={!!removeDomain}
        onClose={() => setRemoveDomain(undefined)}
        id={removeDomain?.id || ""}
        domain={removeDomain?.domain || ""}
      />
      <Flex justifyContent="space-between" alignItems="center" h="40px">
        <HStack spacing="3">
          <Skeleton rounded="full" isLoaded={!!org}>
            <IconSettings />
          </Skeleton>
          <Flex alignItems="center" h="9">
            <SkeletonText
              isLoaded={!!org}
              fitContent
              noOfLines={1}
              skeletonHeight="8"
            >
              <Heading size="lg">Settings</Heading>
            </SkeletonText>
          </Flex>
        </HStack>
        <OrganizationAdminOnly>
          <ButtonGroup>
            <Button
              variant="ghost"
              onClick={() => {
                setOrgName(org!.name);
                setIcon(org!.icon);
              }}
            >
              Reset
            </Button>
            <Button
              isLoading={update.isLoading}
              onClick={() => {
                update.mutate({
                  id: org!.id,
                  name: orgName,
                  icon: icon || 0,
                });
              }}
            >
              Save changes
            </Button>
          </ButtonGroup>
        </OrganizationAdminOnly>
      </Flex>
      <Divider />
      <SettingsWrapper
        heading="General"
        description="Global organization settings"
        isLoaded={!!org}
      >
        <Stack spacing="5" pb="2px">
          <Stack spacing="1">
            <SkeletonLabel isLoaded={!!org}>Name</SkeletonLabel>
            <Skeleton rounded="md" w="full" isLoaded={!!org}>
              <Input
                bg={inputBg}
                borderColor={inputBorder}
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                shadow="sm"
                isDisabled={!isAdmin}
              />
            </Skeleton>
          </Stack>
          <Stack spacing="1">
            <SkeletonLabel isLoaded={!!org}>Domains</SkeletonLabel>
            <Stack spacing="3">
              {org?.domains.map((d) => (
                <DomainCard
                  key={d.id}
                  role={role}
                  {...d}
                  onRequestVerify={() => {
                    setDomainVerify(true);
                    setUpdateDomainOpen(true);
                  }}
                  onRequestUpdate={() => {
                    setDomainVerify(false);
                    setUpdateDomainOpen(true);
                  }}
                  onRequestRemove={() => {
                    setRemoveDomain({
                      id: d.id,
                      domain: d.requestedDomain,
                    });
                  }}
                />
              ))}
              {!!org && !org.domains.find((d) => d.type == "Student") && (
                <Button
                  w="max"
                  variant="ghost"
                  leftIcon={<IconWorldPlus size={18} />}
                  onClick={() => {
                    setUpdateDomainOpen(true);
                  }}
                >
                  Add a student domain
                </Button>
              )}
              {!org && (
                <DomainCard
                  type="Base"
                  domain="placeholder"
                  requestedDomain="placeholder"
                  role="Member"
                  verifiedAt={null}
                />
              )}
            </Stack>
          </Stack>
        </Stack>
      </SettingsWrapper>
      <Divider />
      <SettingsWrapper
        heading="Organization Icon"
        description="Choose an icon for your organization"
        isLoaded={!!org}
      >
        <Box ml="-4px" mt="-4px">
          {ORGANIZATION_ICONS.map((Icon, i) => (
            <Box display="inline-block" p="1" key={i}>
              <Skeleton rounded="md" isLoaded={!!org}>
                <IconButton
                  w="max"
                  variant={icon == i ? "solid" : "ghost"}
                  aria-label="Icon"
                  onClick={() => setIcon(i)}
                  isDisabled={!isAdmin}
                  icon={
                    <Icon
                      size={18}
                      style={{ transition: "all 300ms" }}
                      color={icon == i ? "white" : iconColor}
                    />
                  }
                />
              </Skeleton>
            </Box>
          ))}
        </Box>
      </SettingsWrapper>
      <Divider />
      <SettingsWrapper
        heading="Danger Zone"
        description="Actions in this area are irreversible"
        isLoaded={!!org}
      >
        <Skeleton isLoaded={!!org} rounded="md" fitContent>
          <Button
            colorScheme="red"
            variant="outline"
            leftIcon={
              isOwner ? <IconTrash size={18} /> : <IconLogout size={18} />
            }
            w="max"
            onClick={() => (isOwner ? setDeleteOpen(true) : setLeaveOpen(true))}
          >
            {isOwner ? "Delete" : "Leave"} {org?.name || "Organization"}
          </Button>
        </Skeleton>
      </SettingsWrapper>
    </Stack>
  );
};
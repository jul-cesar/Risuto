"use server";

import { clerkClient} from "@clerk/nextjs/server";
import { Invitation } from "@/components/layout/invitation-dropdown"; 

export async function getUserSharedOrganizations(userId: string) {
  const clerk = await clerkClient();

  const membershipsResponse = await clerk.users.getOrganizationMembershipList({ userId });

  const userOrgs = membershipsResponse.data
    .filter((membership) => membership.raw && membership.raw.organization?.created_by !== userId)
    .map((membership) => membership.raw);

  const orgsWithCreators = await Promise.all(
    userOrgs.map(async (orgMembership) => {
      if (!orgMembership || !orgMembership.organization) {
        return {
          ...orgMembership,
          organization: {
            ...(orgMembership?.organization ?? {}),
            created_by_user: null,
          },
        };
      }

      const createdById = orgMembership.organization.created_by;

      try {
        if (!createdById) {
          throw new Error("created_by is undefined");
        }
        const creator = await clerk.users.getUser(createdById);

        return {
          ...orgMembership,
          organization: {
            ...orgMembership.organization,
            created_by_user: {
              id: creator.id,
              email: creator.emailAddresses?.[0]?.emailAddress ?? null,
              first_name: creator.firstName,
              last_name: creator.lastName,
              image_url: creator.imageUrl,
              user_name: creator.username,
            },
          },
        };
      } catch (error) {
        console.error(`Error fetching user ${createdById}:`, error);

        return {
          ...orgMembership,
          organization: {
            ...orgMembership.organization,
            created_by_user: null,
          },
        };
      }
    })
  );

  return orgsWithCreators;
}

export async function getUserClerk (userId: string) {
  const clerk = await clerkClient();

  const user = await clerk.users.getUser(userId);

  return {
    id: user.id,
    email: user.emailAddresses?.[0]?.emailAddress ?? null,
    imageUrl: user.imageUrl,
    username: user.username,
  };
}

export async function getUserInvitations(userId: string): Promise<Invitation[]> {
  const clerk = await clerkClient();

  const invitationsResponse = await clerk.users.getOrganizationInvitationList({ userId });

  // Mapear y estructurar los datos según la interfaz definida
  const invitations = invitationsResponse.data.map((invitation) => ({
    id: invitation.id,
    emailAddress: invitation.emailAddress,
    role: invitation.role,
    roleName: invitation.roleName,
    status: (invitation.status ?? "pending") as "pending" | "accepted" | "revoked",
    url: invitation.url,
    expiresAt: invitation.expiresAt,
    createdAt: invitation.createdAt,
    updatedAt: invitation.updatedAt,
    publicOrganizationData: invitation.publicOrganizationData
      ? {
          id: invitation.publicOrganizationData.id,
          name: invitation.publicOrganizationData.name,
          slug: invitation.publicOrganizationData.slug,
          image_url: invitation.publicOrganizationData.image_url,
          has_image: invitation.publicOrganizationData.has_image,
        }
      : null,
  }));

  return invitations;
}
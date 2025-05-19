"use server";

import { clerkClient } from "@clerk/nextjs/server";

export async function getUserSharedOrganizations(userId: string) {
  const clerk = await clerkClient();

  const membershipsResponse = await clerk.users.getOrganizationMembershipList({ userId})

  const userOrgs = membershipsResponse.data
    .filter((membership) => membership.raw && membership.raw.organization?.created_by != userId)
    .map((membership) => membership.raw);

  return userOrgs;

}

export async function getUserClerk (userId: string) {
  const clerk = await clerkClient();

  const userResponse = await clerk.users.getUser(userId);

  return userResponse;
}
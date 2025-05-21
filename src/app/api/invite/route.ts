import { getAuth } from '@clerk/nextjs/server';
import { clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { organizationId, email, redirectUrl } = await req.json();

  try {
    const clerk = await clerkClient();
    const invitation = await clerk.organizations.createOrganizationInvitation({
      organizationId: organizationId,
      inviterUserId: userId,
      emailAddress: email,
      role: 'org:member',
      redirectUrl: redirectUrl,
    });
    console.log('Invitation created:', invitation);
    return NextResponse.json({ invitation }, { status: 201 });
  } catch (err: unknown) {
    console.error(err);
    const errorMessage = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
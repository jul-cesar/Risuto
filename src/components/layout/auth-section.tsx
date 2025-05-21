import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { ModeToggle } from "@/components/theme-selector";
import { dark } from '@clerk/themes'; 
import { getUserInvitations } from "@/actions/clerk-actions";
import { currentUser } from "@clerk/nextjs/server";
import { InvitationDropdown } from "./invitation-dropdown";

export async function AuthSection() {
  
  const user = await currentUser();
  const invitations = user ? await getUserInvitations(user.id) : []; 


  return (
    <div className="flex items-center gap-4">
      <SignedIn>
        <InvitationDropdown invitations={invitations} />
      </SignedIn>
      <ModeToggle />
      <SignedOut >
        <SignInButton 
          mode="modal" 
          fallbackRedirectUrl={"/dashboard"}
          forceRedirectUrl={"/dashboard"}
          signUpFallbackRedirectUrl={"/dashboard"}
          signUpForceRedirectUrl={"/dashboard"}
          appearance={{ baseTheme: dark }}
        />
        <SignUpButton mode="modal" 
          fallbackRedirectUrl={"/dashboard"}
          forceRedirectUrl={"/dashboard"}
          signInFallbackRedirectUrl={"/dashboard"}
          signInForceRedirectUrl={"/dashboard"}
          appearance={{ baseTheme: dark }}
          />
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </div>
  );
}
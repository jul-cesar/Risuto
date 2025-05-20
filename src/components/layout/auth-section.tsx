import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { ModeToggle } from "@/components/theme-selector";
import { dark } from '@clerk/themes'; 

export function AuthSection() {
  return (
    <div className="flex items-center gap-4">
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
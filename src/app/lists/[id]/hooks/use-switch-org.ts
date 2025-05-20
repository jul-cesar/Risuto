import { useEffect } from 'react';

export function useSwitchOrganization({
  isLoaded,
  organizationId,
  currentOrgId,
  setActive,
  loadMembers,
  setMembers,
  setError,
}: {
  isLoaded: boolean;
  organizationId: string | undefined;
  currentOrgId: string | undefined;
  setActive: ({ organization }: { organization: string }) => Promise<void>;
  loadMembers?: () => Promise<void>; // opcional
  setMembers?: (members: any[]) => void; // opcional
  setError: (error: string) => void;
}) {
  useEffect(() => {
    let isCancelled = false;

    const switchAndLoad = async () => {
      if (!isLoaded || !organizationId || !setActive) return;

      console.log('→ Switching to org:', organizationId);
      try {
        await setActive({ organization: organizationId });
        console.log('✓ Switch complete:', organizationId);

        if (isCancelled) return;

        const checkOrg = () => {
          return new Promise<void>((resolve) => {
            const interval = setInterval(() => {
              if (currentOrgId === organizationId) {
                clearInterval(interval);
                resolve();
              }
            }, 100);
          });
        };

        await checkOrg();

        if (isCancelled) return;

        if (setMembers) setMembers([]);
        if (loadMembers) await loadMembers();
      } catch (err) {
        if (isCancelled) return;
        console.error('✗ Error switching org:', err);
        setError('Could not access the organization');
      }
    };

    switchAndLoad();

    return () => {
      isCancelled = true;
    };
  }, [isLoaded, organizationId, currentOrgId]);
}

'use client';

import { useEffect, useState } from 'react';
import { Check, Copy, Loader2, Mail, X } from 'lucide-react';
import { useOrganization, useOrganizationList } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { useSwitchOrganization } from '../hooks/use-switch-org';

type InviteModalProps = {
  list: {
    id: string;
    title: string;
    organization_id: string;
  };
  onClose: () => void;
};

type Member = {
  id: string;
  email: string;
  role: string;
  status: string;
};

export function InviteModal({ list, onClose }: InviteModalProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [invitationUrl, setInvitationUrl] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  
  const { setActive } = useOrganizationList();
  
  // useOrganization nos da acceso a la organización actualmente activa
  const { organization, isLoaded } = useOrganization();

  const loadMembers = async () => {
    if (!organization) return;
    setIsLoading(true);
    setError('');
  
    try {
      // 1. Carga miembros activos
      const { data: membershipData } = await organization.getMemberships();
  
      const activeEmailMap = new Map<string, true>();
      const activeMembers = membershipData.map(m => {
        const email = m.publicUserData?.identifier?.toLowerCase() ?? '';
        activeEmailMap.set(email, true);
        return {
          id: m.id,
          email,
          role: m.role,
          status: 'active' as const,
        };
      });
  
      // 2. Carga invitaciones (todas) y filtra las “pending”
      const { data: inviteData } = await organization.getInvitations();
  
      // Filtrado por estatus ‘pending’
      const pendingRaw = inviteData.filter(inv => inv.status === 'pending');
  
      // Filtra contra miembros activos
      const pendingNotMember = pendingRaw.filter(inv => {
        const email = inv.emailAddress.toLowerCase();
        return !activeEmailMap.has(email);
      });
  
      // Deduplica por email
      const deduped: Record<string, typeof pendingNotMember[0]> = {};
      pendingNotMember.forEach(inv => {
        const key = inv.emailAddress.toLowerCase();
        if (!deduped[key]) deduped[key] = inv;
      });
      const pendingInvites = Object.values(deduped);
  
      // Mapea al formato UI
      const pendingMembers = pendingInvites.map(inv => ({
        id: inv.id,
        email: inv.emailAddress,
        role: inv.role,
        status: 'pending' as const,
      }));
  
      // 3. Combina y actualiza estado
      setMembers([...activeMembers, ...pendingMembers]);
    } catch (err) {
      console.error('Error loading members:', err);
      setError('Could not load organization members');
    } finally {
      setIsLoading(false);
    }
  };

  // Efecto para cambiar a la organización correcta al abrir el modal
  useSwitchOrganization({
    isLoaded,
    organizationId: list.organization_id,
    currentOrgId: organization?.id,
    setActive: setActive ?? (async () => {}),
    loadMembers,
    setMembers,
    setError,
  });

  // 4) Función para invitar
  const handleInvite = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!organization) {
    setError('Unable to access organization');
    return;
  }

  setIsSubmitting(true);
  setError('');
  setInvitationUrl(null); // Reset invitation URL
  setIsCopied(false);
  setSuccess('');
  const emailLower = email.toLowerCase();

  // Dedupe contra lista ya cargada
  if (members.some(m => m.email.toLowerCase() === emailLower)) {
    setError(`${email} is already a member or invited`);
    setIsSubmitting(false);
    return;
  }

  try {
    // Llamada a nuestro endpoint
    const resp = await fetch('/api/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        organizationId: organization.id,
        email,
        redirectUrl: `${window.location.origin}/accept-invitation?redirect_url=/lists/${list.id}`  // tu ruta de destino
      }),
    });

    if (!resp.ok) {
      const error = await resp.json();
      throw new Error(error.error || 'Failed to invite');
    }

    const data = await resp.json();
    setInvitationUrl(data.invitation.url); // Save the invitation URL
    setSuccess(`Invitation sent to ${email}`);
    setEmail('');
    await loadMembers(); // refresca la lista de miembros/invitaciones
  } catch (err: unknown) {
    console.error('Error sending invitation:', err);
    if (err instanceof Error) {
      setError(err.message || 'Failed to send invitation');
    } else {
      setError('Failed to send invitation');
    }
  } finally {
    setIsSubmitting(false);
  }
};

const handleCopyUrl = async () => {
  if (invitationUrl) {
    try {
      await navigator.clipboard.writeText(invitationUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Reset copy status after 2 seconds
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  }
};


  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 w-full max-w-md relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          <X className="w-5 h-5" />
        </button>
        
        <h2 className="text-xl font-bold ">Invite to {list.title}</h2>
        <p className="text-sm text-gray-500 mb-4 ">
          Solo podrás tener hasta 5 miembros en esta lista.
        </p>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <>
            <form onSubmit={handleInvite} className="mb-6">
              <div className="flex gap-2 items-center">
                <div className="flex-1">
                  <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="w-full p-2 border border-input bg-background rounded"
                  required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-primary text-primary-foreground py-2 px-4 rounded flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>Invite</>
                  )}
                </Button>
              </div>
              
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
              {success && <p className="text-green-500 text-sm mt-2">{success}</p>}
                
                {invitationUrl && (
                  <div className="mt-4 flex items-center gap-2">
                    <div className="flex-1 p-2 bg-gray-100 rounded text-sm text-gray-700 truncate">
                      {invitationUrl}
                    </div>
                    <Button
                      type="button"
                      onClick={handleCopyUrl}
                      className="bg-secondary text-secondary-foreground py-2 px-3 rounded flex items-center gap-1"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-4 h-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copy URL
                        </>
                      )}
                    </Button>
                  </div>
                )}
            
            </form>
            
            <div className="space-y-4">
              <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400">
                Members and Invitations
              </h3>
              
              {members.length === 0 ? (
                <p className="text-sm text-gray-500">No members yet</p>
              ) : (
                <ul className="space-y-2">
                  {members.map((member) => {
                    return (
                      <li 
                        key={member.id}
                        className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-zinc-800 last:border-0"
                      >
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{member.email}</span>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          member.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          : member.role === 'org:admin'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        }`}>
                          {member.status === 'pending'
                            ? 'Invitado'
                            : member.role === 'org:admin'
                              ? 'Admin'
                              : 'Member'}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
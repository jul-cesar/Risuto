'use client';

import { useEffect, useState } from 'react';
import { Loader2, Mail, X } from 'lucide-react';
import { useOrganization, useOrganizationList } from '@clerk/nextjs';

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
  
  const { setActive } = useOrganizationList();
  
  // useOrganization nos da acceso a la organización actualmente activa
  const { organization, isLoaded } = useOrganization();

  // Efecto para cambiar a la organización correcta al abrir el modal
  useEffect(() => {
    let isCancelled = false;
    const requestId = Symbol('switchOrg');
  
    const switchAndLoad = async () => {
      if (!isLoaded || !list.organization_id || !setActive) return;
  
      console.log('→ Switching to org:', list.organization_id);
      try {
        await setActive({ organization: list.organization_id });
        console.log('✓ Switch complete:', list.organization_id);
  
        if (isCancelled) return;
  
        const checkOrg = () => {
          return new Promise<void>((resolve) => {
            const interval = setInterval(() => {
              if (organization?.id === list.organization_id) {
                clearInterval(interval);
                resolve();
              }
            }, 100);
          });
        };
  
        await checkOrg();
  
        if (isCancelled) return;
  
        setMembers([]);
        await loadMembers();
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
  }, [isLoaded, list.organization_id, setActive, organization?.id]);

  // 3) Función para cargar miembros e invitaciones 
  const loadMembers = async () => {
    if (!organization) return;
    setIsLoading(true);
    setError('');
    try {
      // Miembros activos
      const { data: membershipData } = await organization.getMemberships();
      const activeEmailMap = new Map<string, true>();
      const activeMembers = membershipData.map(m => {
        const email = m.publicUserData?.identifier?.toLowerCase() ?? '';
        activeEmailMap.set(email, true);
        return { id: m.id, email, role: m.role, status: 'active' as const };
      });

      // Invitaciones pendientes
      const { data: inviteData } = await organization.getInvitations();
      const pendingEmailSet = new Set<string>();
      const pendingMembers = inviteData
        .filter(inv => {
          const email = inv.emailAddress.toLowerCase();
          if (activeEmailMap.has(email)) return false;      // ya es miembro
          if (pendingEmailSet.has(email)) return false;     // invitación duplicada
          pendingEmailSet.add(email);
          return true;
        })
        .map(inv => ({
          id: inv.id,
          email: inv.emailAddress,
          role: inv.role,
          status: 'pending' as const
        }));

      setMembers([...activeMembers, ...pendingMembers]);
    } catch (err) {
      console.error('Error loading members:', err);
      setError('Could not load organization members');
    } finally {
      setIsLoading(false);
    }
  };

  // 4) Función para invitar
  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization) {
      setError('Unable to access organization');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');
    const emailLower = email.toLowerCase();

    // Dedupe contra lista ya cargada
    if (members.some(m => m.email.toLowerCase() === emailLower)) {
      setError(`${email} is already a member or invited`);
      setIsSubmitting(false);
      return;
    }

    try {
      console.log('→ Inviting to org', organization.id, ':', email);
      await organization.inviteMember({ emailAddress: email, role: 'org:member' });
      setSuccess(`Invitation sent to ${email}`);
      setEmail('');
      await loadMembers();
    } catch (err) {
      console.error('Error sending invitation:', err);
      setError(err instanceof Error ? err.message : 'Failed to send invitation');
    } finally {
      setIsSubmitting(false);
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
        
        <h2 className="text-xl font-bold mb-4">Invite to {list.title}</h2>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <>
            <form onSubmit={handleInvite} className="mb-6">
              <div className="flex gap-2">
                <div className="flex-1">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address"
                    className="w-full p-2 border border-gray-300 dark:border-zinc-700 rounded"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>Invite</>
                  )}
                </button>
              </div>
              
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
              {success && <p className="text-green-500 text-sm mt-2">{success}</p>}
            </form>
            
            <div className="space-y-4">
              <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400">
                Members and Invitations
              </h3>
              
              {members.length === 0 ? (
                <p className="text-sm text-gray-500">No members yet</p>
              ) : (
                <ul className="space-y-2">
                  {members.map((member) => (
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
                          : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      }`}>
                        {member.status === 'pending' ? 'Invited' : 'Member'}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
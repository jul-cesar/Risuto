import { useState } from "react";
import { Pencil } from "lucide-react";
import Image from "next/image";

export function OrgImage({ organization, isLoaded, isOwner }: { organization: any, isLoaded: boolean, isOwner: boolean }) {
  const [error, setError] = useState('');

  const handleLogoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setError('');
      await organization.setLogo({ file });
      //window.location.reload();
    } catch {
      setError('Error al subir el logo.');
    }
  };

  return (
    <div className="relative w-20 h-20">
  {organization?.imageUrl ? (
    <img
      src={organization.imageUrl}
      alt="Organization Logo"
      width={80}
      height={80}
      className="rounded-full w-20 h-20 object-cover ring-2 ring-gray-200 shadow-md"
    />
  ) : (
    <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center ring-2 ring-gray-200 shadow-md">
      <span className="text-gray-400">No Logo</span>
    </div>
  )}

  {isOwner && organization?.setLogo && (
    <div className="absolute -top-1 -right-1 bg-white rounded-full w-7 h-7 flex items-center justify-center shadow hover:bg-blue-100 transition-colors duration-200">
      <label className="cursor-pointer text-gray-500 hover:text-blue-600">
        <Pencil className="w-4 h-4" />
        <input
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={handleLogoChange}
        />
      </label>
    </div>
  )}
</div>
  );
}
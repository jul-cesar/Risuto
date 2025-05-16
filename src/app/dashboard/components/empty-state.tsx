interface EmptyStateProps {
  message: string;
  height?: string;
}

export function EmptyState({ message, height = "h-40" }: EmptyStateProps) {
  return (
    <div className={`${height} flex items-center justify-center text-gray-400`}>
      {message}
    </div>
  );
}
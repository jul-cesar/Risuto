"use client";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";

// Tipos genéricos para hacer el hook más flexible
export type InfiniteScrollOptions<TData, TParams = any> = {
  queryKey: string | string[];
  fetchData: (
    page: number,
    params?: TParams
  ) => Promise<{
    data: TData[];
    nextPage: number | null;
    totalCount?: number;
  }>;
  params?: TParams;
  enabled?: boolean;
  initialData?: {
    pages: { data: TData[]; nextPage: number | null }[];
    pageParams: number[];
  };
};

export function useInfiniteScroll<TData, TParams = any>({
  queryKey,
  fetchData,
  params,
  enabled = true,
  initialData,
}: InfiniteScrollOptions<TData, TParams>) {
  // Formatear la queryKey para asegurar que sea un array
  const formattedQueryKey = Array.isArray(queryKey) ? queryKey : [queryKey];
  // Agregar los params a la queryKey para que React Query actualice cuando cambien
  const fullQueryKey = params
    ? [...formattedQueryKey, params]
    : formattedQueryKey;

  // Usar useInfiniteQuery para manejar la paginación
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    refetch,
  } = useInfiniteQuery({
    queryKey: fullQueryKey,
    queryFn: ({ pageParam = 1 }) => fetchData(pageParam, params),
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
    initialData,
    enabled,
  });

  // Aplanar los datos para mayor comodidad
  const flattenedData = data?.pages.flatMap((page) => page.data) || [];
  const totalCount = data?.pages[0]?.totalCount;

  return {
    data: flattenedData,
    totalCount,
    error,
    fetchNextPage,
    hasNextPage: Boolean(hasNextPage),
    isFetchingNextPage,
    status,
    refetch,
  };
}

// Componente contenedor para infinite scroll
interface InfiniteScrollContainerProps<TData> {
  data: TData[];
  renderItem: (item: TData, index: number) => ReactNode;
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isError?: boolean;
  onRetry?: () => void;
  emptyMessage?: string;
  className?: string;
  loaderClassName?: string;
  threshold?: number;
}

export function InfiniteScrollContainer<TData>({
  data,
  renderItem,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  isError = false,
  onRetry,
  emptyMessage = "No hay elementos para mostrar",
  className = "",
  loaderClassName = "",
  threshold = 300,
}: InfiniteScrollContainerProps<TData>) {
  const loaderRef = useRef<HTMLDivElement>(null);
  const [showRetry, setShowRetry] = useState(isError);

  useEffect(() => {
    setShowRetry(isError);
  }, [isError]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        if (firstEntry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      {
        rootMargin: `0px 0px ${threshold}px 0px`,
      }
    );

    const currentLoader = loaderRef.current;
    if (currentLoader) {
      observer.observe(currentLoader);
    }

    return () => {
      if (currentLoader) {
        observer.unobserve(currentLoader);
      }
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, threshold]);

  if (data.length === 0 && !isFetchingNextPage) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {data.map((item, index) => (
        <div key={index}>{renderItem(item, index)}</div>
      ))}

      <div ref={loaderRef} className="py-4 flex justify-center">
        {isFetchingNextPage && (
          <div
            className={`flex items-center justify-center ${loaderClassName}`}
          >
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2 text-sm text-muted-foreground">
              Cargando más elementos...
            </span>
          </div>
        )}

        {showRetry && (
          <button
            onClick={() => {
              setShowRetry(false);
              onRetry?.();
            }}
            className="px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
          >
            Reintentar cargar más
          </button>
        )}

        {!hasNextPage && data.length > 0 && !isFetchingNextPage && (
          <div className="text-sm text-muted-foreground">
            No hay más elementos para cargar
          </div>
        )}
      </div>
    </div>
  );
}

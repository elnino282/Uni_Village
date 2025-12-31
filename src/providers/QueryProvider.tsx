/**
 * Query Provider
 * Setup React Query with default configuration
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Create a client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // Data is fresh for 5 minutes
            staleTime: 5 * 60 * 1000,
            // Cache for 10 minutes
            gcTime: 10 * 60 * 1000,
            // Retry failed requests 3 times
            retry: 3,
            // Refetch on window focus
            refetchOnWindowFocus: false,
        },
        mutations: {
            // Retry mutations once
            retry: 1,
        },
    },
});

interface QueryProviderProps {
    children: React.ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}

export { queryClient };

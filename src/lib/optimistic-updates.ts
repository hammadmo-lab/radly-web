/**
 * Utilities for optimistic UI updates
 */
import { useMutation, useQueryClient, QueryKey } from '@tanstack/react-query'
import { toast } from 'sonner'

export interface OptimisticUpdateOptions<TData, TVariables> {
  /**
   * Query key to update optimistically
   */
  queryKey: QueryKey
  
  /**
   * Function to update the cached data optimistically
   */
  updateFn: (oldData: TData | undefined, variables: TVariables) => TData
  
  /**
   * Success message to show
   */
  successMessage?: string
  
  /**
   * Error message to show
   */
  errorMessage?: string
  
  /**
   * Whether to invalidate queries on success
   */
  invalidateOnSuccess?: boolean
}

/**
 * Create a mutation with optimistic updates
 */
export function useOptimisticMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: OptimisticUpdateOptions<TData, TVariables>
) {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn,
    
    // Before mutation - update cache optimistically
    onMutate: async (variables: TVariables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: options.queryKey })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData<TData>(options.queryKey)
      
      // Optimistically update cache
      queryClient.setQueryData<TData>(
        options.queryKey,
        (old) => options.updateFn(old, variables)
      )
      
      // Return context with snapshot
      return { previousData }
    },
    
    // On error - rollback
    onError: (error, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(options.queryKey, context.previousData)
      }
      toast.error(options.errorMessage || 'Something went wrong')
    },
    
    // On success - refetch to sync with server
    onSuccess: () => {
      if (options.invalidateOnSuccess !== false) {
        queryClient.invalidateQueries({ queryKey: options.queryKey })
      }
      if (options.successMessage) {
        toast.success(options.successMessage)
      }
    },
  })
}

/**
 * Create a mutation for list operations (add, update, delete)
 */
export function useOptimisticListMutation<TItem, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TItem[]>,
  options: {
    queryKey: QueryKey
    successMessage?: string
    errorMessage?: string
  }
) {
  return useOptimisticMutation(
    mutationFn,
    {
      queryKey: options.queryKey,
      updateFn: (oldData: TItem[] | undefined) => {
        // This is a generic implementation - specific update logic should be handled
        // by the component using this hook
        return oldData || []
      },
      successMessage: options.successMessage,
      errorMessage: options.errorMessage,
    }
  )
}

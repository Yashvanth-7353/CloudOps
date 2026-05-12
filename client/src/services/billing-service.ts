/**
 * Billing Service Hooks
 * Handles billing and subscription data
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { billingService } from './auth-service';

export const useBillingUsage = () => {
  return useQuery({
    queryKey: ['billing-usage'],
    queryFn: () => billingService.getUsage(),
  });
};

export const useInvoices = (params?: Record<string, any>) => {
  return useQuery({
    queryKey: ['invoices', params],
    queryFn: () => billingService.getInvoices(params),
  });
};

export const useInvoiceDetail = (invoiceId: string) => {
  return useQuery({
    queryKey: ['invoice', invoiceId],
    queryFn: () => billingService.getInvoiceDetail(invoiceId),
    enabled: !!invoiceId,
  });
};

export const useBillingPlans = () => {
  return useQuery({
    queryKey: ['billing-plans'],
    queryFn: () => billingService.getPlans(),
  });
};

export const useUpdateBillingPlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (planId: string) => billingService.updatePlan(planId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing-usage'] });
      queryClient.invalidateQueries({ queryKey: ['billing-plans'] });
    },
  });
};

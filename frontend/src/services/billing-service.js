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
export const useInvoices = (params) => {
    return useQuery({
        queryKey: ['invoices', params],
        queryFn: () => billingService.getInvoices(params),
    });
};
export const useInvoiceDetail = (invoiceId) => {
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
        mutationFn: (planId) => billingService.updatePlan(planId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['billing-usage'] });
            queryClient.invalidateQueries({ queryKey: ['billing-plans'] });
        },
    });
};

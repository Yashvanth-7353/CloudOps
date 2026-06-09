/**
 * usePagination Hook
 * Custom hook for handling pagination state
 */
import { useState, useCallback, useMemo } from 'react';
import { DEFAULT_PAGE_SIZE } from '@/lib/constants';
export const usePagination = (initialPageSize = DEFAULT_PAGE_SIZE) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(initialPageSize);
    const [totalItems, setTotalItems] = useState(0);
    const totalPages = useMemo(() => {
        return Math.ceil(totalItems / pageSize);
    }, [totalItems, pageSize]);
    const goToPage = useCallback((page) => {
        const validPage = Math.max(1, Math.min(page, totalPages));
        setCurrentPage(validPage);
    }, [totalPages]);
    const nextPage = useCallback(() => {
        goToPage(currentPage + 1);
    }, [currentPage, goToPage]);
    const prevPage = useCallback(() => {
        goToPage(currentPage - 1);
    }, [currentPage, goToPage]);
    const changePageSize = useCallback((newPageSize) => {
        setPageSize(newPageSize);
        setCurrentPage(1);
    }, []);
    const paginationState = useMemo(() => ({
        currentPage,
        pageSize,
        totalItems,
        totalPages,
    }), [currentPage, pageSize, totalItems, totalPages]);
    return {
        ...paginationState,
        setTotalItems,
        goToPage,
        nextPage,
        prevPage,
        changePageSize,
    };
};

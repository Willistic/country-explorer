import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setCurrentPage } from '../store/countriesSlice';

/**
 * Custom hook to sync pagination with URL parameters
 * This allows users to bookmark specific pages and share URLs
 */
export const usePaginationSync = () => {
  const dispatch = useAppDispatch();
  const { currentPage, totalPages } = useAppSelector((state) => state.countries);

  // Update URL when page changes
  useEffect(() => {
    const url = new URL(window.location.href);
    if (currentPage > 1) {
      url.searchParams.set('page', currentPage.toString());
    } else {
      url.searchParams.delete('page');
    }
    
    // Update URL without triggering a page refresh
    window.history.replaceState({}, '', url.toString());
  }, [currentPage]);

  // Read page from URL on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const pageParam = urlParams.get('page');
    
    if (pageParam) {
      const pageNumber = parseInt(pageParam, 10);
      if (pageNumber > 0 && pageNumber <= totalPages) {
        dispatch(setCurrentPage(pageNumber));
      }
    }
  }, [dispatch, totalPages]);

  return {
    currentPage,
    totalPages
  };
};

/**
 * Helper function to navigate to a specific page with URL update
 */
export const navigateToPage = (page: number) => {
  const url = new URL(window.location.href);
  if (page > 1) {
    url.searchParams.set('page', page.toString());
  } else {
    url.searchParams.delete('page');
  }
  window.history.pushState({}, '', url.toString());
};
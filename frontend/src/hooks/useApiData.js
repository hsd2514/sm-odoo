import { useState, useEffect } from 'react';
import api from '../services/api';

/**
 * Custom hook for fetching data from API endpoints
 * @param {string} endpoint - API endpoint to fetch from
 * @param {Array} dependencies - Dependencies array for useEffect
 * @returns {Object} { data, loading, error, refetch }
 */
export function useApiData(endpoint, dependencies = []) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(endpoint);
      setData(response.data);
    } catch (err) {
      console.error(`Failed to fetch from ${endpoint}`, err);
      setError(err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, dependencies);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook for fetching products
 */
export function useProducts(dependencies = []) {
  return useApiData('/products/', dependencies);
}

/**
 * Hook for fetching warehouses
 */
export function useWarehouses(dependencies = []) {
  return useApiData('/warehouses/', dependencies);
}

/**
 * Hook for fetching categories
 */
export function useCategories(dependencies = []) {
  return useApiData('/categories/', dependencies);
}

/**
 * Hook for fetching vendors
 */
export function useVendors(dependencies = []) {
  return useApiData('/vendors/', dependencies);
}

/**
 * Hook for fetching customers
 */
export function useCustomers(dependencies = []) {
  return useApiData('/customers/', dependencies);
}


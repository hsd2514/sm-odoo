import api from '../services/api';
import { handleApiError, confirmAction } from './errorHandler';

/**
 * Generic CRUD operations helper
 */
export function useCrudOperations(endpoint, refetchCallback) {
  const create = async (data, successMessage = 'Created successfully') => {
    try {
      await api.post(endpoint, data);
      if (refetchCallback) refetchCallback();
      return { success: true };
    } catch (error) {
      handleApiError(error, `Failed to create`);
      return { success: false, error };
    }
  };

  const update = async (id, data, successMessage = 'Updated successfully') => {
    try {
      await api.put(`${endpoint}${id}`, data);
      if (refetchCallback) refetchCallback();
      return { success: true };
    } catch (error) {
      handleApiError(error, `Failed to update`);
      return { success: false, error };
    }
  };

  const remove = async (id, confirmMessage = 'Are you sure you want to delete this item?') => {
    if (!confirmAction(confirmMessage)) {
      return { success: false, cancelled: true };
    }
    
    try {
      await api.delete(`${endpoint}${id}`);
      if (refetchCallback) refetchCallback();
      return { success: true };
    } catch (error) {
      handleApiError(error, `Failed to delete`);
      return { success: false, error };
    }
  };

  return { create, update, remove };
}


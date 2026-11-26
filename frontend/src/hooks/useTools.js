import { useState, useEffect, useCallback, useRef } from 'react';
import toolService from '../services/toolService';
import { toast } from 'react-toastify';

export const useTools = () => {
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const requestId = useRef(0);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    status: 'AVAILABLE',
  });

  const fetchTools = useCallback(async () => {
    const currentRequestId = ++requestId.current;
    setLoading(true);
    setError(null);
    try {
      const data = await toolService.getAllTools(filters);
      if (currentRequestId === requestId.current) {
        setTools(data);
      }
    } catch (err) {
      if (currentRequestId === requestId.current) {
        setError(err.message);
        toast.error('Failed to load tools');
      }
    } finally {
      if (currentRequestId === requestId.current) {
        setLoading(false);
      }
    }
  }, [filters]);

  useEffect(() => {
    fetchTools();
    return () => {
      requestId.current += 1;
    };
  }, [fetchTools]);

  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      category: '',
      status: 'AVAILABLE',
    });
  };

  return {
    tools,
    loading,
    error,
    filters,
    updateFilters,
    resetFilters,
    refreshTools: fetchTools,
  };
};

export const useTool = (id) => {
  const [tool, setTool] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchTool = async () => {
      setLoading(true);
      try {
        const data = await toolService.getToolById(id);
        setTool(data);
      } catch (err) {
        setError(err.message);
        toast.error('Failed to load tool details');
      } finally {
        setLoading(false);
      }
    };

    fetchTool();
  }, [id]);

  return { tool, loading, error };
};
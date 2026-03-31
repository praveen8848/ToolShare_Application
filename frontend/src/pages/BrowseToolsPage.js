import React from 'react';
import { Container } from 'react-bootstrap';
import { useTools } from '../hooks/useTools';
import ToolGrid from '../components/tools/ToolGrid';
import SearchFilters from '../components/tools/SearchFilters';

const BrowseToolsPage = () => {
  const {
    tools,
    loading,
    filters,
    updateFilters,
    resetFilters,
  } = useTools();

  return (
    <Container className="py-4">
      <h2 className="mb-4">Browse Tools</h2>
      
      <SearchFilters
        filters={filters}
        onFilterChange={updateFilters}
        onReset={resetFilters}
      />
      
      <ToolGrid tools={tools} loading={loading} />
    </Container>
  );
};

export default BrowseToolsPage;
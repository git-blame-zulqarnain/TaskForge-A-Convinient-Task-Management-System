import React, { useState, useEffect } from 'react';

const FilterControls = ({ onFilterChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      onFilterChange({ search: searchTerm, status: statusFilter });
    }, 500); 

    return () => {
      clearTimeout(handler); 
    };
  }, [searchTerm, onFilterChange]); 

  useEffect(() => 
    {
    onFilterChange({ search: searchTerm, status: statusFilter });
  }, [statusFilter, onFilterChange]); 


  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
  };

  return (
    <div className="filter-controls-container card">
      <div className="filter-grid">
        <div className="form-group">
          <label htmlFor="search-task" className="form-label">Search Tasks</label>
          <input
            type="text"
            id="search-task"
            className="form-input"
            placeholder="Search by title or description..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="status-filter" className="form-label">Filter by Status</label>
          <select
            id="status-filter"
            className="form-select"
            value={statusFilter}
            onChange={handleStatusChange}
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Working">Working</option>
            <option value="Finished">Finished</option>
          </select>
        </div>
        <div className="form-group clear-filters-group">
            <button onClick={handleClearFilters} className="button button-secondary" style={{width: '100%'}}>
                Clear Filters
            </button>
        </div>
      </div>
    </div>
  );
};

export default FilterControls;
import React, { useState, useEffect, useCallback } from 'react';
import { getAnalyticsOverview, getAnalyticsTrends } from '../services/analyticsService';
import { Bar, Pie, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale, 
  LinearScale,   
  BarElement,    
  Title,         
  Tooltip,       
  Legend,        
  ArcElement,    
  PointElement,  
  LineElement,   
} from 'chart.js';
import { toast } from 'react-toastify';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement
);

const AnalyticsDashboardPage = () => {
  const [overviewData, setOverviewData] = useState(null);
  const [createdTrends, setCreatedTrends] = useState(null);
  const [completedTrends, setCompletedTrends] = useState(null);
  
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [loadingCreatedTrends, setLoadingCreatedTrends] = useState(true);
  const [loadingCompletedTrends, setLoadingCompletedTrends] = useState(true);



  const fetchAllAnalyticsData = useCallback(async () => {
    setLoadingOverview(true);
    setLoadingCreatedTrends(true);
    setLoadingCompletedTrends(true);

    try {
      const overview = await getAnalyticsOverview();
      setOverviewData(overview);
    } catch (error) {
      toast.error(error.message || "Failed to load overview data.");
      console.error("Analytics Overview Error:", error);
    } finally {
      setLoadingOverview(false);
    }

    try {
      const created = await getAnalyticsTrends({ period: 'last7days', dataType: 'created' });
      setCreatedTrends(created);
    } catch (error) {
      toast.error(error.message || "Failed to load created tasks trend.");
      console.error("Analytics Created Trends Error:", error);
    } finally {
      setLoadingCreatedTrends(false);
    }

    try {
      const completed = await getAnalyticsTrends({ period: 'last7days', dataType: 'completed' });
      setCompletedTrends(completed);
    } catch (error) {
      toast.error(error.message || "Failed to load completed tasks trend.");
      console.error("Analytics Completed Trends Error:", error);
    } finally {
      setLoadingCompletedTrends(false);
    }
  }, []); 

  useEffect(() => {
    fetchAllAnalyticsData();
  }, [fetchAllAnalyticsData]);


  const statusPieChartData = overviewData ? {
    labels: ['Pending', 'In Progress', 'Finished'], 
    datasets: [{
      label: 'Task Status Breakdown',
      data: [overviewData.pendingTasks || 0, overviewData.inProgressTasks || 0, overviewData.finishedTasks || 0],
      backgroundColor: [ 'rgba(255, 159, 64, 0.8)', 'rgba(54, 162, 235, 0.8)', 'rgba(75, 192, 192, 0.8)'],
      borderColor: [ 'rgba(255, 159, 64, 1)', 'rgba(54, 162, 235, 1)', 'rgba(75, 192, 192, 1)'],
      borderWidth: 1,
    }],
  } : { labels: [], datasets: [] }; 

  const commonLineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }, 
    plugins: { legend: { position: 'top' }, title: { display: true, text: 'Chart Title' } },
  };

  const createdTrendsChartData = createdTrends ? {
    labels: createdTrends.labels,
    datasets: [{
      label: 'Tasks Created',
      data: createdTrends.data,
      fill: false,
      borderColor: 'rgb(75, 192, 192)', 
      tension: 0.1,
    }],
  } : { labels: [], datasets: [] };

  const completedTrendsChartData = completedTrends ? {
    labels: completedTrends.labels,
    datasets: [{
      label: 'Tasks Completed',
      data: completedTrends.data,
      fill: false,
      borderColor: 'rgb(153, 102, 255)', 
      tension: 0.1,
    }],
  } : { labels: [], datasets: [] };

  const isLoading = loadingOverview || loadingCreatedTrends || loadingCompletedTrends;

  return (
    <div className="analytics-dashboard-container glass-card" style={{ padding: '2rem' }}>
      <h1 className="card-title" style={{ fontSize: '1.75rem', marginBottom: '2rem', color: 'grey' }}>
        Analytics Dashboard
      </h1>

      {isLoading && <div className="loading-text">Loading analytics data...</div>}
      {!isLoading && !overviewData && <div className="error-text">Could not load overview data.</div>}
      
      {overviewData && !loadingOverview && (
        <div className="overview-stats-grid">
          <div className="stat-card glass-card"><h3>Total Tasks</h3><p>{overviewData.totalTasks}</p></div>
          <div className="stat-card glass-card"><h3>Pending</h3><p>{overviewData.pendingTasks}</p></div>
          <div className="stat-card glass-card"><h3>In Progress</h3><p>{overviewData.inProgressTasks}</p></div>
          <div className="stat-card glass-card"><h3>Finished</h3><p>{overviewData.finishedTasks}</p></div>
        </div>
      )}

      {!isLoading && (overviewData || createdTrends || completedTrends) && ( 
        <div className="charts-grid" >
          {overviewData && !loadingOverview && (
            <div className="chart-container glass-card">
              <h3 className="chart-title" style={{ color: 'grey' }}>Task Status Breakdown</h3>
              <Pie data={statusPieChartData} options={{ responsive: true, maintainAspectRatio: true, plugins: { legend: { position: 'top'}, title: {display: true, text: 'Current Task Statuses'}}}} />
            </div>
          )}
          {createdTrends && !loadingCreatedTrends && (
            <div className="chart-container glass-card">
              <h3 className="chart-title" style={{ color: 'grey' }}>Tasks Created (Last 7 Days)</h3>
              <Line data={createdTrendsChartData} options={{...commonLineChartOptions, plugins: {...commonLineChartOptions.plugins, title: {display: true, text: 'Tasks Created Trend'}}}} />
            </div>
          )}
          {completedTrends && !loadingCompletedTrends && (
            <div className="chart-container glass-card">
              <h3 className="chart-title" style={{ color: 'grey' }} >Tasks Completed (Last 7 Days)</h3>
              <Line data={completedTrendsChartData} options={{...commonLineChartOptions, plugins: {...commonLineChartOptions.plugins, title: {display: true, text: 'Tasks Completed Trend'}}}} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboardPage;
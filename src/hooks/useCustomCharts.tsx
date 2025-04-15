
import { useState, useEffect } from 'react';
import { CustomChartData } from '@/components/dashboard/chart-builder/CustomChart';

export const useCustomCharts = () => {
  const [customCharts, setCustomCharts] = useState<CustomChartData[]>([]);
  const [isBuilderVisible, setIsBuilderVisible] = useState(false);
  
  // Load saved charts from localStorage on mount
  useEffect(() => {
    try {
      const savedCharts = localStorage.getItem('customDashboardCharts');
      if (savedCharts) {
        setCustomCharts(JSON.parse(savedCharts));
      }
    } catch (error) {
      console.error('Failed to load saved charts:', error);
    }
  }, []);
  
  // Save charts to localStorage
  const saveCharts = (charts: CustomChartData[]) => {
    try {
      localStorage.setItem('customDashboardCharts', JSON.stringify(charts));
      setCustomCharts(charts);
    } catch (error) {
      console.error('Failed to save charts:', error);
    }
  };
  
  // Toggle builder visibility
  const toggleBuilder = () => {
    setIsBuilderVisible(prev => !prev);
  };
  
  return {
    customCharts,
    isBuilderVisible,
    toggleBuilder,
    saveCharts
  };
};

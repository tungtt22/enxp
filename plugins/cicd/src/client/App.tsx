import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { CicdDashboard } from './CicdDashboard';

/**
 * CICD Plugin App Component
 */
export const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<CicdDashboard />} />
    </Routes>
  );
};

export default App;

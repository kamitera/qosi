import React from 'react';
import { Routes, Route } from 'react-router-dom';
import SurveyPage from './pages/SurveyPage.jsx';
import ThankYouPage from './pages/ThankYouPage.jsx';
import AdminApp from './pages/admin/AdminApp.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<SurveyPage />} />
      <Route path="/thank-you/:id" element={<ThankYouPage />} />
      <Route path="/admin/*" element={<AdminApp />} />
    </Routes>
  );
}

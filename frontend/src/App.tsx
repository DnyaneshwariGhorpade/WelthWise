import { Routes, Route, Navigate } from 'react-router-dom';

function App() {
  return (
    <Routes>
      {/* Public / auth screens are wired in as they are implemented */}
      <Route path="/" element={<Navigate to="/app/dashboard" replace />} />
      <Route path="/app/dashboard" element={<div>Dashboard — coming soon</div>} />
    </Routes>
  );
}

export default App;
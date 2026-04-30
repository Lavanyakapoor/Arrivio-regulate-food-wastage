import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import { Error404 } from './pages';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import AddItem from './pages/AddItem';
import Donate from './pages/Donate';
import Analytics from './pages/Analytics';

const AppWithRouting = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout component={<Dashboard />} />} />
      <Route path="/inventory" element={<Layout component={<Inventory />} />} />
      <Route path="/add-item" element={<Layout component={<AddItem />} />} />
      <Route path="/donate" element={<Layout component={<Donate />} />} />
      <Route path="/analytics" element={<Layout component={<Analytics />} />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/login" element={<Login />} />
      <Route path="/not-found" element={<Layout noFooter={true} component={<Error404 />} />} />
      <Route path="*" element={<Layout noFooter={true} component={<Error404 />} />} />
    </Routes>
  );
};

export default AppWithRouting;

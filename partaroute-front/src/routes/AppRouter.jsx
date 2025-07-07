import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/Login.jsx";
import Register from "../pages/Register.jsx";
import Home from "../pages/HomePage.jsx";
import TripDetails from "../pages/TripDetails.jsx";
import MyTrips from "../pages/MyTrips.jsx";
import MyDriverTrips from "../pages/MyDriverTrips.jsx";
import Notifications from "../pages/Notifications.jsx";
import MyProfile from "../pages/MyProfile.jsx";
import BottomNav from "../components/BottomNav";
import AdminPanel from "../pages/AdminPanel.jsx";
import NotFound from "../pages/NotFound.jsx";
import ProtectedRoute from "./ProtectedRoute";
// import Dashboard from "../pages/Dashboard";

export default function AppRouter({ onOpenCreateTrip }) {
  return (
    <BrowserRouter>
      <BottomNav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/trajet/:id" element={<TripDetails />} />
        <Route path="/my-trips" element={<MyTrips />} />
        <Route path="/my-driver-trips" element={<MyDriverTrips />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/compte" element={
          <ProtectedRoute>
            <MyProfile />
          </ProtectedRoute>
        } />
        
        {/* <Route path="/dashboard" element={<Dashboard />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/Login.jsx";
import Register from "../pages/Register.jsx";
import Home from "../pages/HomePage.jsx";
import TripDetails from "../pages/TripDetails.jsx";
import MyTrips from "../pages/MyTrips.jsx";
import MyDriverTrips from "../pages/MyDriverTrips.jsx";
import Notifications from "../pages/Notifications.jsx";
import MyProfile from "../pages/MyProfile.jsx";
import Header from "../components/Header";
import AdminPanel from "../pages/AdminPanel.jsx";
import AdminDashboard from "../pages/AdminDashboard.jsx";
import AdminTrips from "../pages/AdminTrips.jsx";
import AdminReservations from "../pages/AdminReservations.jsx";
// import Dashboard from "../pages/Dashboard";

export default function AppRouter({ onOpenCreateTrip }) {
  return (
    <BrowserRouter>
      <Header onOpenCreateTrip={onOpenCreateTrip} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/trajet/:id" element={<TripDetails />} />
        <Route path="/my-trips" element={<MyTrips />} />
        <Route path="/my-driver-trips" element={<MyDriverTrips />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/profile" element={<MyProfile />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/trips" element={<AdminTrips />} />
        <Route path="/admin/reservations" element={<AdminReservations />} />
        {/* <Route path="/dashboard" element={<Dashboard />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

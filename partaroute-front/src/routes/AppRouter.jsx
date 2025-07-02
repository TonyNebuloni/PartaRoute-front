import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/Login.jsx";
import Register from "../pages/Register.jsx";
import Home from "../pages/HomePage.jsx";
import TripDetails from "../pages/TripDetails.jsx";
import MesTrajets from "../pages/MesTrajets.jsx";
import MesTrajetsConducteur from "../pages/MesTrajetsConducteur.jsx";
import Notifications from "../pages/Notifications.jsx";
import Header from "../components/Header";
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
        <Route path="/mes-trajets" element={<MesTrajets />} />
        <Route path="/mes-trajets-conducteur" element={<MesTrajetsConducteur />} />
        <Route path="/notifications" element={<Notifications />} />
        {/* <Route path="/dashboard" element={<Dashboard />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

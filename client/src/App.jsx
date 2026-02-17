import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
// Profile page removed - links go to /matches or /profile view removed
import Matches from "./pages/Matches";
import ProfileDetails from "./pages/ProfileDetails";

import AdminDashboard from "./pages/admin/AdminDashboard";
import ProtectedAdmin from "./routes/ProtectedAdmin";
import AdminProfiles from "./pages/admin/AdminProfiles";
import EditProfile from "./pages/admin/EditProfile";
import AdminCreate from "./pages/admin/AdminCreate";







function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        {/* Profile page removed. */}
        <Route path="/matches" element={<Matches />} />
        <Route path="/profile/:id" element={<ProfileDetails />} />

        {/* 🔐 PROTECTED ADMIN ROUTE */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedAdmin>
              <AdminDashboard />
            </ProtectedAdmin>
          }
        />

          <Route
           path="/admin/profiles"
           element={
             <ProtectedAdmin>
               <AdminProfiles />
             </ProtectedAdmin>
           }
           />

           <Route
            path="/admin/profiles/edit/:id"
            element={
              <ProtectedAdmin>
                <EditProfile />
              </ProtectedAdmin>
            }
          />
           <Route
            path="/admin/profiles/create"
            element={
              <ProtectedAdmin>
                <AdminCreate />
              </ProtectedAdmin>
            }
          />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

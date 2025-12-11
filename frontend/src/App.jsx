import React, { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Footer from './components/Footer';
import Listings from './pages/Listings';
import CarDetails from './pages/CarDetails';
import Blogs from './pages/Blogs';
import BlogDetail from './pages/BlogDetail';
import AdminLoginProtectedRoute from './components/AdminLoginProtectedRoute';
import AdminLoginPage from './pages/AdminLoginPage';
import SignupPage from './pages/SignupPage';
// import { useAuthStore } from './store/useAuthStore';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboard from './pages/AdminDashboard';
import { useUserAuthStore } from './store/useUserAuthStore';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import AddCarPage from './pages/AddCarPage';
import UpdateCarPage from './pages/UpdateCarPage';
import AddBlogPage from './pages/AddBlogPage';
import UpdateBlogPage from './pages/UpdateBlogPage';
import CompareCars from './pages/CompareCars';
import Contact from './pages/Contact';
import Sell from './pages/Sell';
import SellCarPage from './pages/SellForm';
import ScrollToTop from './components/ScrollToTop';
import AddStaffPage from './pages/addStaffPage';
import EditStaffPage from './pages/editStaffPage';
import NewBroadcastPage from './pages/newBroadcast';
import Makes from './pages/Makes';
import MergedNavbar from './components/MergedNav';
import Categories from './pages/Categories';
import MyRentals from './pages/MyRentals';

function App() {
  const { checkAuth, authUser } = useUserAuthStore();
  const location = useLocation(); // Get the current location

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  console.log('Authenticated User:', authUser);

  // Determine if the footer should be visible
  const showFooter = !location.pathname.startsWith('/admin');

  return (
    <div className="flex flex-col min-h-screen">
      <ScrollToTop />
      {/* <Navbar className="z-100" /> */}
      <MergedNavbar className="z-100" />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/signup"
            element={!authUser ? <SignupPage /> : <Navigate to={'/'} />}
          />
          <Route
            path="/login"
            element={!authUser ? <LoginPage /> : <Navigate to={'/'} />}
          />
          <Route
            path="/my-rentals"
            element={authUser ? <MyRentals /> : <Navigate to={'/login'} />}
          />
          <Route
            path="/profile"
            element={authUser ? <ProfilePage /> : <LoginPage />}
          />
          <Route path="/listings" element={<Listings />} />
          <Route path="/car/:id" element={<CarDetails />} />
          <Route path="/compare" element={<CompareCars />} />
          <Route path="/makes" element={<Makes />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/blog/:id" element={<BlogDetail />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/sell" element={<Sell />} />
          <Route path="/sell/form" element={<SellCarPage />} />

          {/** admin routes */}
          <Route element={<AdminLoginProtectedRoute />}>
            <Route path="/admin/login" element={<AdminLoginPage />} />
          </Route>

          <Route element={<AdminProtectedRoute />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/cars/new" element={<AddCarPage />} />
            <Route path="/admin/cars/update/:id" element={<UpdateCarPage />} />
            <Route path="/admin/blogs/new" element={<AddBlogPage />} />
            <Route
              path="/admin/blogs/update/:id"
              element={<UpdateBlogPage />}
            />
            <Route path="/admin/staff/add" element={<AddStaffPage />} />
            <Route path="/admin/staff/edit/:id" element={<EditStaffPage />} />
            <Route path='/admin/broadcast/new' element={<NewBroadcastPage />} />
          </Route>
        </Routes>

        <Toaster />
      </main>
      {showFooter && <Footer />}
    </div>
  );
}

export default App;

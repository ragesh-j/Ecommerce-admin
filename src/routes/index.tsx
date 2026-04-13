import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// import { useAppSelector } from "../app/hooks";
import ProtectedRoute from "../components/protectedRoute";
import Login from "../pages/Login";
import Banners from "../pages/Banners";
import Categories from "../pages/Categories";
import Tags from "../pages/Tags";
import Products from "../pages/Products";
import Layout from "../components/Layout";

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* public */}
        <Route path="/login" element={<Login />} />

        {/* protected admin routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/banners" replace />} />
            <Route path="/banners" element={<Banners />} />
             <Route path="/categories" element={<Categories />} />
            <Route path="/tags" element={<Tags />} />
            <Route path="/products" element={<Products />} />
          </Route>
        </Route>

        {/* fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
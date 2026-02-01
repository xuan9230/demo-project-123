import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { RequireAuth } from '@/components/auth/RequireAuth'

// Pages
import HomePage from '@/pages/home/HomePage'
import SearchPage from '@/pages/search/SearchPage'
import ListingDetailPage from '@/pages/listing/ListingDetailPage'
import PlateCheckPage from '@/pages/plate-check/PlateCheckPage'
import SellPage from '@/pages/sell/SellPage'
import FavoritesPage from '@/pages/favorites/FavoritesPage'
import MyListingsPage from '@/pages/my-listings/MyListingsPage'
import AccountPage from '@/pages/account/AccountPage'
import NotFoundPage from '@/pages/NotFoundPage'
import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage'
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/listing/:id" element={<ListingDetailPage />} />
          <Route path="/plate-check" element={<PlateCheckPage />} />
          <Route path="/plate-check/:plateNumber" element={<PlateCheckPage />} />
          <Route path="/sell/*" element={<RequireAuth><SellPage /></RequireAuth>} />
          <Route path="/favorites" element={<RequireAuth><FavoritesPage /></RequireAuth>} />
          <Route path="/my-listings" element={<RequireAuth><MyListingsPage /></RequireAuth>} />
          <Route path="/account/*" element={<RequireAuth><AccountPage /></RequireAuth>} />
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/register" element={<RegisterPage />} />
          <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App

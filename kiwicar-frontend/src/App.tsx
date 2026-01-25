import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'

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
          <Route path="/sell/*" element={<SellPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/my-listings" element={<MyListingsPage />} />
          <Route path="/account/*" element={<AccountPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App

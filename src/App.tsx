import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { GlobalAIAssistant } from "@/components/GlobalAIAssistant";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import AdminSignup from "./pages/AdminSignup";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Marketplace from "./pages/Marketplace";
import Dashboard from "./pages/Dashboard";
import Food from "./pages/Food";
import Properties from "./pages/Properties";
import Categories from "./pages/Categories";
import Taxi from "./pages/Taxi";
import Errands from "./pages/Errands";
import Admin from "./pages/Admin";
import DriverDashboard from "./pages/DriverDashboard";
import SellerDashboard from "./pages/SellerDashboard";
import RestaurantDashboard from "./pages/RestaurantDashboard";
import PropertySellerDashboard from "./pages/PropertySellerDashboard";
import DriverOnboarding from "./components/onboarding/DriverOnboarding";
import SellerOnboarding from "./components/onboarding/SellerOnboarding";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <GlobalAIAssistant />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/admin-signup" element={<AdminSignup />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/food" element={<Food />} />
            <Route path="/properties" element={<Properties />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/taxi" element={<Taxi />} />
            <Route path="/errands" element={<Errands />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/driver-dashboard" element={<DriverDashboard />} />
            <Route path="/seller-dashboard" element={<SellerDashboard />} />
            <Route path="/restaurant-dashboard" element={<RestaurantDashboard />} />
            <Route path="/property-dashboard" element={<PropertySellerDashboard />} />
            <Route path="/onboarding/driver" element={<DriverOnboarding />} />
            <Route path="/onboarding/seller" element={<SellerOnboarding />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

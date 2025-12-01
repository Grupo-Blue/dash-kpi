import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Redirect } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import CompanyDashboard from "./pages/CompanyDashboard";
import BlueConsult from "./pages/BlueConsult";
import Tokeniza from "./pages/Tokeniza";
import TokenizaAcademy from "./pages/TokenizaAcademy";
import MychelMendes from "./pages/MychelMendes";
import Admin from "./pages/Admin";
import AdminSettings from "./pages/AdminSettings";
import Integrations from "./pages/Integrations";
import LeadAnalysis from "./pages/LeadAnalysis";
import Login from "./pages/Login";
import { useAuth } from "./_core/hooks/useAuth";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

function Router() {
  const { isAuthenticated, loading } = useAuth();

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Se não autenticado, mostrar apenas página de login
  if (!isAuthenticated) {
    return <Login />;
  }
  // Se autenticado, mostrar rotas normais
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path="/:companySlug">
        {(params) => {
          const validSlugs = ['blue-consult', 'tokeniza', 'tokeniza-academy', 'mychel-mendes'];
          if (validSlugs.includes(params.companySlug)) {
            return <CompanyDashboard />;
          }
          return null; // Deixa cair para outras rotas
        }}
      </Route>
      <Route path={"/admin"} component={Admin} />
      <Route path={"/admin/settings"} component={AdminSettings} />
      <Route path={"/integrations"}>
        <Redirect to="/admin" />
      </Route>
      <Route path={"/lead-analysis"} component={LeadAnalysis} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
          {/* React Query Devtools - apenas em desenvolvimento */}
          {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

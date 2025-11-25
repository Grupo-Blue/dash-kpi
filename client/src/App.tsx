import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import BlueConsult from "./pages/BlueConsult";
import Tokeniza from "./pages/Tokeniza";
import TokenizaAcademy from "./pages/TokenizaAcademy";
import MychelMendes from "./pages/MychelMendes";
import Admin from "./pages/Admin";
import LeadAnalysis from "./pages/LeadAnalysis";
import Login from "./pages/Login";
import { useAuth } from "./_core/hooks/useAuth";

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
      <Route path={"/blue-consult"} component={BlueConsult} />
      <Route path={"/tokeniza"} component={Tokeniza} />
      <Route path={"/tokeniza-academy"} component={TokenizaAcademy} />
      <Route path={"/mychel-mendes"} component={MychelMendes} />
      <Route path={"/admin"} component={Admin} />
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
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

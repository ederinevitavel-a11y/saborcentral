/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  UtensilsCrossed, 
  CalendarDays, 
  QrCode, 
  Sparkles,
  LayoutDashboard,
  LogOut,
  Moon,
  Info,
  CheckCircle2,
  X,
  Lock,
  AlertCircle
} from 'lucide-react';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { auth, googleProvider } from './firebase';
import { SaleRecord, AgendaEvent, FoodSuggestion } from './types';
import Dashboard from './components/Dashboard';
import SalesManager from './components/SalesManager';
import AgendaManager from './components/AgendaManager';
import SuggestionPanel from './components/SuggestionPanel';
import SuggestionForm from './components/SuggestionForm';

// --- INITIAL SEED DATA ---
const INITIAL_SALES: SaleRecord[] = [
  {
    id: 'sale-1',
    date: '2026-06-14',
    items: [
      { id: 'item-1-1', name: 'Pastel de Carne', quantity: 45, unitCost: 2.50, unitPrice: 6.00 },
      { id: 'item-1-2', name: 'Pastel de Queijo', quantity: 30, unitCost: 2.50, unitPrice: 6.00 },
      { id: 'item-1-3', name: 'Refrigerante Lata', quantity: 60, unitCost: 2.00, unitPrice: 5.00 },
      { id: 'item-1-4', name: 'Bolo Fatia', quantity: 25, unitCost: 1.50, unitPrice: 4.50 },
    ],
    totalCost: 245.00,
    totalRevenue: 502.50,
    netProfit: 257.50,
    notes: 'Arrecadação excelente. Primeiro domingo pós-culto do mês.'
  },
  {
    id: 'sale-2',
    date: '2026-06-21',
    items: [
      { id: 'item-2-1', name: 'Pastel de Frango', quantity: 50, unitCost: 2.50, unitPrice: 6.00 },
      { id: 'item-2-2', name: 'Pastel de Queijo', quantity: 40, unitCost: 2.50, unitPrice: 6.00 },
      { id: 'item-2-3', name: 'Suco Natural', quantity: 35, unitCost: 1.50, unitPrice: 4.00 },
      { id: 'item-2-4', name: 'Cachorro Quente', quantity: 30, unitCost: 3.50, unitPrice: 8.00 },
    ],
    totalCost: 382.50,
    totalRevenue: 820.00,
    netProfit: 437.50,
    notes: 'Noite de frio, cachorro quente vendeu muito rápido.'
  },
  {
    id: 'sale-3',
    date: '2026-06-28',
    items: [
      { id: 'item-3-1', name: 'Cachorro Quente', quantity: 55, unitCost: 3.50, unitPrice: 8.00 },
      { id: 'item-3-2', name: 'Refrigerante Lata', quantity: 70, unitCost: 2.00, unitPrice: 5.00 },
      { id: 'item-3-3', name: 'Bolo Fatia', quantity: 30, unitCost: 1.50, unitPrice: 4.50 },
    ],
    totalCost: 377.50,
    totalRevenue: 925.00,
    netProfit: 547.50,
    notes: 'Liderança de Casais organizou o cardápio. Todo o lucro doado ao fundo de assistência social.'
  }
];

const INITIAL_EVENTS: AgendaEvent[] = [
  {
    id: 'event-1',
    date: '2026-07-12',
    title: 'Pastelada Especial de Palmito e Carne',
    description: 'Venda especial de pasteis especiais organizados pela liderança de adolescentes para arrecadação do congresso nacional.',
    category: 'Salgados',
    responsible: 'Ministério de Adolescentes',
    status: 'pending'
  },
  {
    id: 'event-2',
    date: '2026-07-19',
    title: 'Noite do Cachorro Quente Duplo',
    description: 'Prensado tradicional com duas salsichas, purê e batata palha. Equipe de mulheres coordenará as compras e preparo.',
    category: 'Eventos Especiais',
    responsible: 'Ministério de Mulheres',
    status: 'pending'
  },
  {
    id: 'event-3',
    date: '2026-07-26',
    title: 'Festival de Caldos Quentes',
    description: 'Caldo verde, canja de galinha e caldo de feijão servidos em cumbucas para aquecer o pós-culto. Organização com vendas antecipadas.',
    category: 'Eventos Especiais',
    responsible: 'Ministério de Casais',
    status: 'pending'
  }
];

const INITIAL_SUGGESTIONS: FoodSuggestion[] = [
  { id: 'sug-1', foodName: 'Espetinho de Carne com Farofa', submittedBy: 'Rodrigo Santos', date: '2026-07-06T18:30:00.000Z', status: 'pending', upvotes: 14 },
  { id: 'sug-2', foodName: 'Pizza de Calabresa em Fatia', submittedBy: 'Mariana Oliveira', date: '2026-07-06T19:15:00.000Z', status: 'approved', upvotes: 12 },
  { id: 'sug-3', foodName: 'Açaí Completo no Copo', submittedBy: 'Gabriel Costa', date: '2026-07-07T12:00:00.000Z', status: 'pending', upvotes: 8 },
  { id: 'sug-4', foodName: 'Pão de Queijo Recheado com Catupiry', submittedBy: 'Patrícia Lima', date: '2026-07-07T14:45:00.000Z', status: 'pending', upvotes: 5 }
];

const ALLOWED_EMAILS = [
  'ederlcs@hotmail.com',
  'claudiadeoliveirarangel@gmail.com',
  'camilatavares_@hotmail.com',
  'andressa.professora28@gmail.com'
];

export default function App() {
  // --- GOOGLE AUTHENTICATION STATE ---
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && user.email) {
        const emailLower = user.email.toLowerCase();
        if (ALLOWED_EMAILS.includes(emailLower)) {
          setCurrentUser(user);
          setAuthError(null);
        } else {
          setCurrentUser(null);
          setAuthError(`O e-mail ${user.email} não possui permissão de acesso. Entre em contato com o administrador.`);
          try {
            await signOut(auth);
          } catch (e) {
            console.error('Error signing out unauthorized user:', e);
          }
        }
      } else {
        setCurrentUser(null);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      if (user && user.email) {
        const emailLower = user.email.toLowerCase();
        if (ALLOWED_EMAILS.includes(emailLower)) {
          setToastMessage('Autenticação com o Google realizada com sucesso!');
        } else {
          setAuthError(`O e-mail ${user.email} não possui permissão de acesso. Entre em contato com o administrador.`);
          await signOut(auth);
        }
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/popup-blocked') {
        setAuthError('O pop-up de login foi bloqueado pelo seu navegador. Ative os pop-ups para continuar.');
      } else if (err.code === 'auth/closed-by-user') {
        setAuthError('O processo de login foi fechado antes de concluir.');
      } else {
        setAuthError('Erro ao validar login com o Google. Tente novamente.');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setToastMessage('Sessão encerrada com sucesso!');
    } catch (err) {
      console.error(err);
    }
  };

  // --- APPLICATION STATE ---
  const [sales, setSales] = useState<SaleRecord[]>(() => {
    const saved = localStorage.getItem('sabor_central_sales');
    return saved ? JSON.parse(saved) : INITIAL_SALES;
  });

  const [events, setEvents] = useState<AgendaEvent[]>(() => {
    const saved = localStorage.getItem('sabor_central_events');
    return saved ? JSON.parse(saved) : INITIAL_EVENTS;
  });

  const [suggestions, setSuggestions] = useState<FoodSuggestion[]>(() => {
    const saved = localStorage.getItem('sabor_central_suggestions');
    return saved ? JSON.parse(saved) : INITIAL_SUGGESTIONS;
  });

  // Active Admin Tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'sales' | 'agenda' | 'suggestions'>('dashboard');

  // Custom Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Customer View Toggle (hash-based routing #sugerir or simulation click)
  const [isCustomerView, setIsCustomerView] = useState(() => {
    return window.location.hash === '#sugerir';
  });

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // --- PERSISTENCE IN LOCAL STORAGE (OFFLINE CAPABILITIES) ---
  useEffect(() => {
    localStorage.setItem('sabor_central_sales', JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem('sabor_central_events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('sabor_central_suggestions', JSON.stringify(suggestions));
  }, [suggestions]);

  // Handle Hash Changes dynamically (e.g. scanning QR Code redirect)
  useEffect(() => {
    const handleHashChange = () => {
      setIsCustomerView(window.location.hash === '#sugerir');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // --- SALES MANIPULATION ---
  const handleAddSale = (newSale: SaleRecord) => {
    setSales(prev => [newSale, ...prev]);
  };

  const handleDeleteSale = (id: string) => {
    setSales(prev => prev.filter(sale => sale.id !== id));
  };

  // --- AGENDA MANIPULATION ---
  const handleAddEvent = (newEvent: AgendaEvent) => {
    setEvents(prev => [newEvent, ...prev]);
  };

  const handleUpdateEventStatus = (id: string, status: 'pending' | 'completed' | 'canceled') => {
    setEvents(prev => prev.map(evt => evt.id === id ? { ...evt, status } : evt));
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(prev => prev.filter(evt => evt.id !== id));
  };

  // --- SUGGESTIONS MANIPULATION ---
  const handleAddSuggestion = (newSug: Omit<FoodSuggestion, 'id' | 'date' | 'status' | 'upvotes'>) => {
    const suggestion: FoodSuggestion = {
      id: `sug-${Date.now()}`,
      foodName: newSug.foodName,
      submittedBy: newSug.submittedBy,
      date: new Date().toISOString(),
      status: 'pending',
      upvotes: 1
    };
    setSuggestions(prev => [suggestion, ...prev]);
  };

  const handleUpvoteSuggestion = (id: string) => {
    setSuggestions(prev => prev.map(sug => sug.id === id ? { ...sug, upvotes: sug.upvotes + 1 } : sug));
  };

  const handleApproveSuggestion = (id: string) => {
    setSuggestions(prev => prev.map(sug => sug.id === id ? { ...sug, status: 'approved' as const } : sug));
  };

  const handleRejectSuggestion = (id: string) => {
    setSuggestions(prev => prev.map(sug => sug.id === id ? { ...sug, status: 'rejected' as const } : sug));
  };

  const handleDeleteSuggestion = (id: string) => {
    setSuggestions(prev => prev.filter(sug => sug.id !== id));
  };

  // Bridge action: Convert approved suggestion to planned event
  const handleConvertSuggestionToEvent = (suggestion: FoodSuggestion) => {
    // Generate next Sunday's date automatically
    const d = new Date();
    d.setDate(d.getDate() + ((7 - d.getDay()) % 7 || 7));
    const nextSunday = d.toISOString().split('T')[0];

    const convertedEvent: AgendaEvent = {
      id: `event-converted-${Date.now()}`,
      date: nextSunday,
      title: `${suggestion.foodName} (Pedido dos Fiéis)`,
      description: `Venda baseada em sugestão sugerida por ${suggestion.submittedBy} via portal QR Code, que recebeu ${suggestion.upvotes} votos de aprovação.`,
      category: 'Salgados',
      responsible: 'Equipe da Cantina',
      status: 'pending'
    };

    handleAddEvent(convertedEvent);
    
    // Mark suggestion as converted / delete it / or just keep it
    // Let's keep it approved and give success feedback
    setToastMessage(`Sucesso! A sugestão "${suggestion.foodName}" foi convertida e adicionada ao Cronograma de Planejamento para o dia ${nextSunday.split('-').reverse().join('/')}.`);
    setActiveTab('agenda');
  };

  // Toggle hash when entering/exiting suggestion view manually
  const openCustomerView = () => {
    window.location.hash = '#sugerir';
    setIsCustomerView(true);
  };

  const closeCustomerView = () => {
    window.location.hash = '';
    setIsCustomerView(false);
  };

  // --- CUSTOMER PORTAL OVERRIDE (NO AUTHENTICATION REQUIRED) ---
  // If the user accessed the client portal (e.g. via QR Code #sugerir or manual toggle),
  // they do not need to authenticate to submit suggestions!
  if (isCustomerView) {
    return (
      <SuggestionForm 
        onAddSuggestion={handleAddSuggestion} 
        onBackToAdmin={closeCustomerView}
        initialUserName={currentUser?.displayName || ''}
        isLoggedIn={!!currentUser}
      />
    );
  }

  // --- AUTHENTICATION WALL CHECK ---
  if (authLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="text-center space-y-4 relative z-10">
          <div className="w-12 h-12 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-sm font-mono tracking-wider text-zinc-400 uppercase">Verificando Credenciais...</h2>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md bg-zinc-900/60 backdrop-blur-xl border border-zinc-850 p-8 rounded-3xl relative z-10 glow-card text-center space-y-6">
          <div className="space-y-3">
            <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg shadow-orange-500/20 mx-auto transition-transform hover:scale-105 duration-300">
              <UtensilsCrossed className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-extrabold text-white tracking-tight flex items-center justify-center gap-2">
                <span>Sabor Central</span>
                <span className="text-xs bg-orange-500/20 border border-orange-500/30 text-orange-400 font-sans px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  Cantina
                </span>
              </h1>
              <p className="text-xs text-zinc-500 font-mono mt-1">Controle Dominical & Sugestões</p>
            </div>
          </div>

          <div className="border-t border-zinc-850/60 my-2" />

          <div className="space-y-2">
            <h2 className="text-base font-bold text-zinc-200">Acesso Restrito</h2>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-sm mx-auto">
              Para entrar no sistema e registrar vendas, planejar cardápios ou enviar sugestões, faça login com sua conta Google.
            </p>
          </div>

          {authError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2.5 text-left">
              <AlertCircle className="w-4.5 h-4.5 text-red-400 shrink-0 mt-0.5" />
              <p className="text-xs text-red-300 leading-relaxed font-medium">{authError}</p>
            </div>
          )}

          <div className="flex flex-col gap-2.5">
            <button
              onClick={handleGoogleLogin}
              className="w-full bg-white hover:bg-zinc-100 text-zinc-900 font-bold py-3.5 px-4 rounded-xl shadow-lg transition duration-300 flex items-center justify-center gap-3 cursor-pointer select-none active:scale-98 mx-auto"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
              <span className="text-sm text-zinc-900">Entrar com o Google</span>
            </button>

            <button
              onClick={openCustomerView}
              className="w-full bg-zinc-950 hover:bg-zinc-850 text-zinc-300 hover:text-white font-semibold py-3.5 px-4 rounded-xl border border-zinc-850 hover:border-zinc-750 transition duration-300 flex items-center justify-center gap-2 cursor-pointer select-none active:scale-98 mx-auto text-xs"
            >
              <QrCode className="w-4 h-4 text-orange-500" />
              <span>Enviar Sugestão de Prato (Sem Login)</span>
            </button>
          </div>

          <div className="text-[10px] text-zinc-600 font-mono pt-2">
            Segurança provida via Firebase Authentication
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans flex flex-col justify-between">
      
      {/* Dynamic Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 max-w-md bg-zinc-900 border border-emerald-500/30 text-white rounded-2xl shadow-2xl p-4 flex items-start gap-3 animate-fadeIn backdrop-blur-md">
          <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="flex-1 text-xs sm:text-sm font-medium leading-relaxed">
            {toastMessage}
          </div>
          <button 
            onClick={() => setToastMessage(null)} 
            className="p-1 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-zinc-300 transition shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      
      {/* Decorative ambient gradients */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-orange-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Admin layout */}
      <div>
        
        {/* Navigation / Header bar */}
        <header className="border-b border-zinc-900 bg-zinc-950/80 sticky top-0 z-40 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              
              {/* Brand Title */}
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="w-8.5 h-8.5 sm:w-9 sm:h-9 bg-orange-500 rounded-xl flex items-center justify-center text-white font-bold shadow-md shadow-orange-500/20 shrink-0">
                  <UtensilsCrossed className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h1 className="text-base sm:text-lg font-display font-bold text-white tracking-tight flex items-center gap-1.5">
                    <span>Sabor Central</span>
                    <span className="hidden min-[380px]:inline-block text-[9px] sm:text-[10px] bg-orange-500/20 border border-orange-500/30 text-orange-400 font-sans px-2 py-0.5 rounded-full font-bold">
                      CANTINA
                    </span>
                  </h1>
                  <span className="text-[9px] sm:text-[10px] text-zinc-500 font-mono block -mt-1">Pós-Culto Dominical</span>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="hidden md:flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-full text-xs text-zinc-400 font-medium">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                <span>Modo de Operação Offline Habilitado</span>
              </div>

              {/* User Profile */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <img 
                    src={currentUser.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${currentUser.displayName || currentUser.email}`} 
                    alt="Foto do usuário" 
                    className="w-7 h-7 rounded-full border border-zinc-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="hidden lg:block text-left">
                    <p className="text-[11px] font-bold text-white leading-none truncate max-w-[100px]">{currentUser.displayName || 'Membro'}</p>
                    <p className="text-[9px] text-zinc-500 leading-none font-mono mt-0.5 truncate max-w-[100px]">{currentUser.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-zinc-500 hover:text-red-400 p-1.5 hover:bg-zinc-900 rounded-xl transition cursor-pointer min-w-[32px] min-h-[32px] flex items-center justify-center"
                    title="Sair"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          </div>
        </header>

        {/* Dashboard Tabs bar */}
        <nav className="bg-zinc-950 border-b border-zinc-900/60 sticky top-16 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-nowrap gap-4 overflow-x-auto py-2 scrollbar-none">
              
              {/* Tab: Dashboard */}
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition cursor-pointer shrink-0 ${activeTab === 'dashboard' ? 'bg-zinc-900 text-white border border-zinc-800' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'}`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Métricas & Dashboard</span>
              </button>

              {/* Tab: Sales Records */}
              <button
                onClick={() => setActiveTab('sales')}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition cursor-pointer shrink-0 ${activeTab === 'sales' ? 'bg-zinc-900 text-white border border-zinc-800' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'}`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>Registrar Vendas</span>
              </button>

              {/* Tab: Agenda */}
              <button
                onClick={() => setActiveTab('agenda')}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition cursor-pointer shrink-0 ${activeTab === 'agenda' ? 'bg-zinc-900 text-white border border-zinc-800' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'}`}
              >
                <CalendarDays className="w-4 h-4" />
                <span>Agenda & Planejamento</span>
              </button>

              {/* Tab: Suggestions */}
              <button
                onClick={() => setActiveTab('suggestions')}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition cursor-pointer shrink-0 ${activeTab === 'suggestions' ? 'bg-zinc-900 text-white border border-zinc-800' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'}`}
              >
                <QrCode className="w-4 h-4" />
                <span>Sugestões & QR Code</span>
              </button>

            </div>
          </div>
        </nav>

        {/* Core View Container */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
          
          {/* Active component view rendered */}
          {activeTab === 'dashboard' && (
            <Dashboard sales={sales} events={events} />
          )}

          {activeTab === 'sales' && (
            <SalesManager 
              sales={sales} 
              onAddSale={handleAddSale} 
              onDeleteSale={handleDeleteSale} 
            />
          )}

          {activeTab === 'agenda' && (
            <AgendaManager 
              events={events} 
              onAddEvent={handleAddEvent} 
              onUpdateEventStatus={handleUpdateEventStatus} 
              onDeleteEvent={handleDeleteEvent} 
            />
          )}

          {activeTab === 'suggestions' && (
            <SuggestionPanel 
              suggestions={suggestions}
              onUpvoteSuggestion={handleUpvoteSuggestion}
              onApproveSuggestion={handleApproveSuggestion}
              onDeleteSuggestion={handleDeleteSuggestion}
              onRejectSuggestion={handleRejectSuggestion}
              onConvertSuggestionToEvent={handleConvertSuggestionToEvent}
              onOpenCustomerView={openCustomerView}
            />
          )}

        </main>

      </div>

      {/* Elegant, humble page footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-8 text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-zinc-600" />
            <span>Sabor Central - Cantina Dominical Pós-Culto Noturno. Todos os direitos reservados.</span>
          </div>

          <div className="flex items-center gap-4">
            <span>Sincronização: <strong className="text-emerald-400 font-medium">100% Salvo Localmente</strong></span>
            <span>Estilo: Dark Theme</span>
          </div>

        </div>
      </footer>

    </div>
  );
}

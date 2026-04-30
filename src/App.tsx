/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  LayoutDashboard, 
  Route, 
  History, 
  User, 
  Plus, 
  TrendingUp, 
  MapPin, 
  DollarSign, 
  Trash2,
  Users,
  Edit2,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  PlusCircle,
  Calendar,
  Fuel,
  Layout,
  Search,
  Wallet,
  AlertCircle,
  CheckCircle2,
  Briefcase,
  Bike,
  ShoppingCart,
  PlusSquare,
  MinusSquare,
  CreditCard,
  HandCoins
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell 
} from 'recharts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Helper for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Interfaces
interface Trip {
  id: string;
  date: string;
  earnings: number;
  kmStart: number;
  kmEnd: number;
  fuelCost: number;
  platform: string;
  category: 'entrega' | 'empresa';
}

interface Debt {
  id: string;
  title: string;
  value: number;
  dueDate: string;
  isPaid: boolean;
  category: 'entrega' | 'empresa';
}

interface EmployeeSalary {
  id: string;
  name: string;
  totalValue: number;
  paidValue: number;
  month: string;
}

interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  minQuantity: number;
  category?: string;
}

interface ReceivableInstallment {
  id: string;
  dueDate: string;
  value: number;
  isPaid: boolean;
  paidDate?: string;
}

interface ReceivablePayment {
  date: string;
  value: number;
}

interface Receivable {
  id: string;
  debtorName: string;
  totalValue: number;
  installments: number;
  paidValue: number;
  isPaid: boolean;
  date: string;
  observation?: string;
  installmentDetails?: ReceivableInstallment[];
  payments?: ReceivablePayment[];
}

// --- Components ---

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card = ({ children, className }: CardProps) => (
  <div className={cn("bg-white rounded-2xl p-4 shadow-sm border border-gray-100", className)}>
    {children}
  </div>
);

const StatCard = ({ title, value, icon: Icon, colorClass, shadowClass }: { title: string, value: string, icon: any, colorClass: string, shadowClass?: string }) => (
  <div className={cn("flex-1 rounded-2xl p-4 text-white shadow-lg", colorClass, shadowClass)}>
    <p className="text-[10px] uppercase opacity-80 mb-1 flex items-center gap-1">
      <Icon size={12} />
      {title}
    </p>
    <p className="text-xl font-bold">{value}</p>
  </div>
);

export default function App() {
  const [activeTab, setActiveTab] = useState<'dash' | 'form' | 'history' | 'finance' | 'salary' | 'inventory' | 'receivables' | 'profile'>('dash');
  const [selectedFinanceMonth, setSelectedFinanceMonth] = useState(new Date().toISOString().slice(0, 7));
  const [financeCategory, setFinanceCategory] = useState<'entrega' | 'empresa'>('entrega');
  const [trips, setTrips] = useState<Trip[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [salaries, setSalaries] = useState<EmployeeSalary[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [receivables, setReceivables] = useState<Receivable[]>([]);
  const [savedDebtors, setSavedDebtors] = useState<string[]>([]);
  const [userProfile, setUserProfile] = useState<{ name: string; account: string; deliveryGoal: number; companyGoal: number }>({ name: 'Luan Almeida', account: '', deliveryGoal: 0, companyGoal: 0 });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isManagingPlatforms, setIsManagingPlatforms] = useState(false);
  const [isManagingGoals, setIsManagingGoals] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showSaveFeedback, setShowSaveFeedback] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
  const [editingInventoryItem, setEditingInventoryItem] = useState<InventoryItem | null>(null);
  const [editingReceivable, setEditingReceivable] = useState<Receivable | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const mainRef = useRef<HTMLElement>(null);
  const scrollRef = useRef<HTMLInputElement>(null);
  const [activeTrip, setActiveTrip] = useState<{
    kmStart: number;
    platform: string;
    date: string;
  } | null>(null);
  const [platforms, setPlatforms] = useState<string[]>(['Uber', '99', 'InDrive', 'Particular', 'Entrega']);
  const [newPlatform, setNewPlatform] = useState('');

  // New Trip Form State
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    earnings: '',
    kmStart: '',
    kmEnd: '',
    fuelCost: '',
    platform: 'Uber'
  });

  // Load data
  useEffect(() => {
    const saved = localStorage.getItem('runtracker_trips');
    const savedActive = localStorage.getItem('runtracker_active');
    const savedPlatforms = localStorage.getItem('runtracker_platforms');
    const savedDebts = localStorage.getItem('runtracker_debts');
    const savedSalaries = localStorage.getItem('runtracker_salaries');
    const savedProfile = localStorage.getItem('runtracker_profile');
    const savedInventory = localStorage.getItem('runtracker_inventory');
    const savedReceivables = localStorage.getItem('runtracker_receivables');
    const savedDebtorsLocal = localStorage.getItem('runtracker_debtors');

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setTrips(parsed.map((t: any) => ({ ...t, category: t.category || 'entrega' })));
      } catch (e) {
        console.error("Failed to parse trips", e);
      }
    }
    if (savedDebts) {
      try {
        const parsed = JSON.parse(savedDebts);
        setDebts(parsed.map((d: any) => ({ ...d, category: d.category || 'entrega' })));
      } catch (e) {
        console.error("Failed to parse debts", e);
      }
    }
    if (savedSalaries) {
      try {
        setSalaries(JSON.parse(savedSalaries));
      } catch (e) {
        console.error("Failed to parse salaries", e);
      }
    }
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        setUserProfile({
          ...parsed,
          deliveryGoal: parsed.deliveryGoal || 0,
          companyGoal: parsed.companyGoal || 0
        });
      } catch (e) {
        console.error("Failed to parse profile", e);
      }
    }
    if (savedInventory) {
      try {
        setInventory(JSON.parse(savedInventory));
      } catch (e) {
        console.error("Failed to parse inventory", e);
      }
    }
    if (savedReceivables) {
      try {
        setReceivables(JSON.parse(savedReceivables));
      } catch (e) {
        console.error("Failed to parse receivables", e);
      }
    }
    if (savedDebtorsLocal) {
      try {
        setSavedDebtors(JSON.parse(savedDebtorsLocal));
      } catch (e) {
        console.error("Failed to parse saved debtors", e);
      }
    }
    if (savedActive) {
      try {
        setActiveTrip(JSON.parse(savedActive));
      } catch (e) {
        console.error("Failed to parse active trip", e);
      }
    }
    if (savedPlatforms) {
      try {
        const parsed = JSON.parse(savedPlatforms);
        setPlatforms(parsed);
        if (parsed.length > 0) {
          setFormData(prev => ({ ...prev, platform: parsed[0] }));
        }
      } catch (e) {
        console.error("Failed to parse platforms", e);
      }
    }
  }, []);

  // Sync data
  useEffect(() => {
    localStorage.setItem('runtracker_trips', JSON.stringify(trips));
    localStorage.setItem('runtracker_active', JSON.stringify(activeTrip));
    localStorage.setItem('runtracker_platforms', JSON.stringify(platforms));
    localStorage.setItem('runtracker_debts', JSON.stringify(debts));
    localStorage.setItem('runtracker_salaries', JSON.stringify(salaries));
    localStorage.setItem('runtracker_inventory', JSON.stringify(inventory));
    localStorage.setItem('runtracker_receivables', JSON.stringify(receivables));
    localStorage.setItem('runtracker_debtors', JSON.stringify(savedDebtors));
    localStorage.setItem('runtracker_profile', JSON.stringify(userProfile));
  }, [trips, activeTrip, platforms, debts, salaries, inventory, receivables, userProfile]);

  useEffect(() => {
    const main = mainRef.current;
    const scrollInput = scrollRef.current;
    if (!main) return;

    const handleScroll = () => {
      if (scrollInput) {
        const scrollHeight = main.scrollHeight - main.clientHeight;
        const percentage = scrollHeight > 0 ? (main.scrollTop / scrollHeight) * 100 : 0;
        scrollInput.value = percentage.toString();
      }
    };
    main.addEventListener('scroll', handleScroll);
    return () => main.removeEventListener('scroll', handleScroll);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    // Simulate data update/refresh visual feedback
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1500);
  };

  const scrollToBottom = () => {
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: mainRef.current.scrollHeight, behavior: 'smooth' });
    }
  };

  // Derived Stats
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    
    // Helper to get receivable payments by date
    const receivablePayments = (() => {
      const pArr: { date: string, value: number }[] = [];
      receivables.forEach(r => {
        if (r.installmentDetails) {
          r.installmentDetails.forEach(i => {
            if (i.isPaid && i.paidDate) {
              pArr.push({ date: i.paidDate.split('T')[0], value: i.value });
            }
          });
        }
        if (r.payments) {
          r.payments.forEach(p => {
             pArr.push({ date: p.date.split('T')[0], value: p.value });
          });
        }
      });
      return pArr;
    })();

    const todayTrips = trips.filter(t => t.date === today);
    const todayReceivableEarnings = receivablePayments.filter(p => p.date === today).reduce((acc, p) => acc + p.value, 0);
    const todayEarnings = todayTrips.reduce((acc, t) => acc + t.earnings, 0) + todayReceivableEarnings;
    const todayKM = todayTrips.reduce((acc, t) => acc + (t.kmEnd - t.kmStart), 0);

    const totalEarningsTrips = trips.reduce((acc, t) => acc + t.earnings, 0);
    const totalEarningsReceivables = receivablePayments.reduce((acc, p) => acc + p.value, 0);
    const totalEarnings = totalEarningsTrips + totalEarningsReceivables;

    const deliveryTrips = trips.filter(t => t.category === 'entrega');
    const totalKM = deliveryTrips.reduce((acc, t) => acc + (t.kmEnd - t.kmStart), 0);
    const totalFuel = trips.reduce((acc, t) => acc + t.fuelCost, 0);
    const netProfit = totalEarnings - totalFuel;
    const efficiency = totalKM > 0 ? (deliveryTrips.reduce((acc, t) => acc + t.earnings, 0) / totalKM).toFixed(2) : '0.00';

    // Filtered by category (for finance tab specifically)
    const filteredTripsByCat = trips.filter(t => t.category === financeCategory);
    const filteredDebtsByCat = debts.filter(d => d.category === financeCategory);

    // Monthly Stats
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const monthTripsTotal = trips.filter(t => t.date.startsWith(currentMonth));
    const currentMonthReceivablePayments = receivablePayments.filter(p => p.date.startsWith(currentMonth));
    const monthReceivableEarningsTotal = currentMonthReceivablePayments.reduce((acc, p) => acc + p.value, 0);
    const monthEarningsTotal = monthTripsTotal.reduce((acc, t) => acc + t.earnings, 0) + monthReceivableEarningsTotal;
    
    const deliveryMonthEarnings = monthTripsTotal.filter(t => t.category === 'entrega').reduce((acc, t) => acc + t.earnings, 0) + monthReceivableEarningsTotal;
    const companyMonthEarnings = monthTripsTotal.filter(t => t.category === 'empresa').reduce((acc, t) => acc + t.earnings, 0);

    const monthKMTotal = monthTripsTotal.reduce((acc, t) => acc + (t.kmEnd - t.kmStart), 0);

    // Grouping by Month for History
    const monthlySummary = trips.reduce((acc: any, trip) => {
      const month = trip.date.slice(0, 7);
      if (!acc[month]) {
        acc[month] = { month, earnings: 0, km: 0, count: 0 };
      }
      acc[month].earnings += trip.earnings;
      acc[month].km += (trip.kmEnd - trip.kmStart);
      acc[month].count += 1;
      return acc;
    }, {});

    // Add receivable earnings to monthly summary
    receivablePayments.forEach(p => {
      const month = p.date.slice(0, 7);
      if (!monthlySummary[month]) {
        monthlySummary[month] = { month, earnings: 0, km: 0, count: 0 };
      }
      monthlySummary[month].earnings += p.value;
    });

    const monthlySummaryList = Object.values(monthlySummary).sort((a: any, b: any) => b.month.localeCompare(a.month));

    // Finance Months List
    const fMonths = (() => {
       const months = new Set<string>();
       months.add(new Date().toISOString().slice(0, 7));
       trips.forEach(t => months.add(t.date.slice(0, 7)));
       debts.forEach(d => months.add(d.dueDate.slice(0, 7)));
       receivablePayments.forEach(p => months.add(p.date.slice(0, 7)));
       return Array.from(months).sort();
    })();

    // Monthly Finance Details (for selected category AND month)
    const filteredByMonthDebts = filteredDebtsByCat.filter(d => d.dueDate.startsWith(selectedFinanceMonth));
    const monthPaidDebtsCat = filteredByMonthDebts.filter(d => d.isPaid).reduce((acc, d) => acc + d.value, 0);
    const monthPendingDebtsCat = filteredByMonthDebts.filter(d => !d.isPaid).reduce((acc, d) => acc + d.value, 0);
    const monthTotalDebtsCat = filteredByMonthDebts.reduce((acc, d) => acc + d.value, 0);
    
    const monthTripsCat = filteredTripsByCat.filter(t => t.date.startsWith(selectedFinanceMonth));
    const monthReceivableEarningsCat = financeCategory === 'entrega' 
      ? receivablePayments.filter(p => p.date.startsWith(selectedFinanceMonth)).reduce((acc, p) => acc + p.value, 0)
      : 0;
    const monthTotalGrossEarningsCat = monthTripsCat.reduce((acc, t) => acc + t.earnings, 0) + monthReceivableEarningsCat;
    const monthFuelCostCat = monthTripsCat.reduce((acc, t) => acc + t.fuelCost, 0);
    
    const monthSalariesPaid = salaries
      .filter(s => s.month === selectedFinanceMonth)
      .reduce((acc, s) => acc + s.paidValue, 0);

    const monthBalanceCat = financeCategory === 'entrega' 
      ? monthTotalGrossEarningsCat - monthFuelCostCat - monthPaidDebtsCat
      : monthTotalGrossEarningsCat - monthSalariesPaid;

    const monthNetProfitCat = monthTotalGrossEarningsCat - monthFuelCostCat - monthTotalDebtsCat;

    // Global stats (used in dash)
    const totalPendingDebts = debts.filter(d => !d.isPaid).reduce((acc, d) => acc + d.value, 0);

    // Chart Data (Last 6 entries/dates)
    const last7Days = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (5 - i));
      const dateStr = d.toISOString().split('T')[0];
      const dayTripEarnings = trips.filter(t => t.date === dateStr).reduce((acc, t) => acc + t.earnings, 0);
      const dayReceivableEarnings = receivablePayments.filter(p => p.date === dateStr).reduce((acc, p) => acc + p.value, 0);
      return {
        name: ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'][d.getDay()],
        ganho: dayTripEarnings + dayReceivableEarnings,
        date: dateStr
      };
    });

    return { 
      todayEarnings, 
      todayKM, 
      monthEarnings: monthEarningsTotal, 
      monthKM: monthKMTotal, 
      totalEarnings, 
      totalKM, 
      totalFuel, 
      netProfit, 
      efficiency, 
      chartData: last7Days,
      monthlySummaryList,
      totalPendingDebts,
      financeMonths: fMonths,
      filteredDebtsByMonth: filteredByMonthDebts,
      monthNetProfit: monthNetProfitCat,
      monthTotalGrossEarnings: monthTotalGrossEarningsCat,
      monthPaidDebts: monthPaidDebtsCat,
      monthFuelCost: monthFuelCostCat,
      monthTotalDebts: monthTotalDebtsCat,
      monthPendingDebts: monthPendingDebtsCat,
      monthBalance: monthBalanceCat,
      monthSalariesPaid,
      deliveryMonthEarnings,
      companyMonthEarnings
    };
  }, [trips, debts, salaries, financeCategory, selectedFinanceMonth]);

  const handleStartTrip = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveTrip({
      kmStart: Number(formData.kmStart),
      platform: formData.platform,
      date: formData.date
    });
    setFormData(prev => ({ ...prev, kmStart: '' }));
    setActiveTab('dash');
  };

  const handleFinishTrip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTrip) return;

    const newTrip: Trip = {
      id: crypto.randomUUID(),
      date: activeTrip.date,
      earnings: Number(formData.earnings),
      kmStart: activeTrip.kmStart,
      kmEnd: Number(formData.kmEnd),
      fuelCost: Number(formData.fuelCost || 0),
      platform: activeTrip.platform,
      category: 'entrega' // Standard trips are always delivery for now
    };

    setTrips([...trips, newTrip]);
    setActiveTrip(null);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      earnings: '',
      kmStart: '',
      kmEnd: '',
      fuelCost: '',
      platform: platforms[0] || 'Uber'
    });
    setActiveTab('dash');
  };

  const deleteTrip = (id: string) => {
    setTrips(trips.filter(t => t.id !== id));
  };

  const updateTrip = (updated: Trip) => {
    setTrips(trips.map(t => t.id === updated.id ? updated : t));
    setEditingTrip(null);
  };

  const updateDebt = (updated: Debt) => {
    setDebts(debts.map(d => d.id === updated.id ? updated : d));
    setEditingDebt(null);
  };

  const addManualGain = (title: string, value: number, date: string, category: 'entrega' | 'empresa') => {
    const newGain: Trip = {
      id: crypto.randomUUID(),
      date,
      earnings: value,
      kmStart: 0,
      kmEnd: 0,
      fuelCost: 0,
      platform: title, // Use title as platform name for manual entries
      category
    };
    setTrips([...trips, newGain]);
  };

  const addDebt = (title: string, value: number, dueDate: string, category: 'entrega' | 'empresa' = 'entrega', parcels: number = 1) => {
    const newDebts: Debt[] = [];
    const baseDate = new Date(dueDate + 'T00:00:00');

    for (let i = 0; i < parcels; i++) {
      const currentParcelDate = new Date(baseDate);
      currentParcelDate.setMonth(baseDate.getMonth() + i);
      
      const formattedDate = currentParcelDate.toISOString().split('T')[0];
      
      newDebts.push({
        id: crypto.randomUUID(),
        title: parcels > 1 ? `${title} (${i+1}/${parcels})` : title,
        value,
        dueDate: formattedDate,
        isPaid: false,
        category
      });
    }
    
    setDebts([...debts, ...newDebts]);
  };

  const toggleDebtPaid = (id: string) => {
    setDebts(debts.map(d => d.id === id ? { ...d, isPaid: !d.isPaid } : d));
  };

  const deleteDebt = (id: string) => {
    setDebts(debts.filter(d => d.id !== id));
  };

  const addSalary = (name: string, totalValue: number, month: string) => {
    const newSalary: EmployeeSalary = {
      id: crypto.randomUUID(),
      name,
      totalValue,
      paidValue: 0,
      month
    };
    setSalaries([...salaries, newSalary]);
  };

  const updateSalaryPaid = (id: string, additionalAmount: number) => {
    setSalaries(salaries.map(s => {
      if (s.id === id) {
        const newPaid = Math.min(s.totalValue, s.paidValue + additionalAmount);
        return { ...s, paidValue: newPaid };
      }
      return s;
    }));
  };

  const deleteSalary = (id: string) => {
    setSalaries(salaries.filter(s => s.id !== id));
  };

  const [isCounting, setIsCounting] = useState(false);
  const [countingIndex, setCountingIndex] = useState(0);
  const [tempCounts, setTempCounts] = useState<Record<string, number>>({});

  const startInventoryCount = () => {
    if (inventory.length === 0) return;
    setTempCounts({});
    setCountingIndex(0);
    setIsCounting(true);
  };

  const finishInventoryCount = () => {
    setInventory(inventory.map(item => ({
      ...item,
      quantity: tempCounts[item.id] !== undefined ? tempCounts[item.id] : item.quantity
    })));
    setIsCounting(false);
  };

  const addInventoryItem = (name: string, quantity: number, minQuantity: number) => {
    const newItem: InventoryItem = {
      id: crypto.randomUUID(),
      name,
      quantity,
      minQuantity
    };
    setInventory([...inventory, newItem]);
  };

  const updateInventoryQty = (id: string, delta: number) => {
    setInventory(inventory.map(item => {
      if (item.id === id) {
        return { ...item, quantity: Math.max(0, item.quantity + delta) };
      }
      return item;
    }));
  };

  const deleteInventoryItem = (id: string) => {
    setInventory(inventory.filter(item => item.id !== id));
  };

  const updateInventoryItem = (updated: InventoryItem) => {
    setInventory(inventory.map(item => item.id === updated.id ? updated : item));
    setEditingInventoryItem(null);
  };

  const updateReceivable = (updated: Receivable) => {
    setReceivables(receivables.map(r => r.id === updated.id ? updated : r));
    setEditingReceivable(null);
  };

  const addReceivable = (debtorName: string, totalValue: number, installments: number, date: string, observation: string = '') => {
    const installmentList: ReceivableInstallment[] = [];
    const installmentValue = totalValue / installments;
    
    for (let i = 0; i < installments; i++) {
      const dueDate = new Date(date + 'T00:00:00');
      dueDate.setMonth(dueDate.getMonth() + i);
      installmentList.push({
        id: crypto.randomUUID(),
        dueDate: dueDate.toISOString().split('T')[0],
        value: installmentValue,
        isPaid: false
      });
    }

    const newReceivable: Receivable = {
      id: crypto.randomUUID(),
      debtorName,
      totalValue,
      installments,
      paidValue: 0,
      isPaid: false,
      date,
      observation,
      installmentDetails: installmentList
    };
    setReceivables([...receivables, newReceivable]);
  };

  const payInstallment = (receivableId: string, installmentId: string) => {
    setReceivables(receivables.map(r => {
      if (r.id === receivableId && r.installmentDetails) {
        const updatedInstallments = r.installmentDetails.map(ins => {
          if (ins.id === installmentId) {
            return { ...ins, isPaid: true, paidDate: new Date().toISOString() };
          }
          return ins;
        });
        
        const newPaidValue = updatedInstallments.filter(ins => ins.isPaid).reduce((acc, ins) => acc + ins.value, 0);
        return {
          ...r,
          installmentDetails: updatedInstallments,
          paidValue: newPaidValue,
          isPaid: newPaidValue >= r.totalValue - 0.01 // Handle floating point math
        };
      }
      return r;
    }));
  };

  const deleteReceivable = (id: string) => {
    setReceivables(receivables.filter(r => r.id !== id));
  };

  const addPlatform = () => {
    if (newPlatform && !platforms.includes(newPlatform)) {
      setPlatforms([...platforms, newPlatform]);
      setNewPlatform('');
    }
  };

  const removePlatform = (plat: string) => {
    if (platforms.length <= 1) {
      alert("É necessário ter ao menos uma plataforma.");
      return;
    }
    setPlatforms(platforms.filter(p => p !== plat));
    if (formData.platform === plat) {
      setFormData({ ...formData, platform: platforms.filter(p => p !== plat)[0] });
    }
  };

  return (
    <div className="w-full h-full bg-[#F3F4F6] flex items-center justify-center font-sans select-none overflow-hidden sm:p-4">
      <div className="w-full h-screen sm:w-[375px] sm:h-[667px] bg-white sm:rounded-[48px] sm:shadow-2xl sm:border-[12px] border-[#1F2937] overflow-hidden relative flex flex-col">
        {/* Status Bar simulation (Mobile Feel) */}
        <div className="h-6 w-full flex justify-between px-8 pt-4 items-center text-[10px] font-bold text-gray-800">
          <span>{new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 bg-black rounded-full opacity-20"></div>
            <div className="w-3 h-3 bg-black rounded-full opacity-20"></div>
          </div>
        </div>

        {/* Header */}
        <header className="px-6 pt-6 pb-4 flex justify-between items-center shrink-0">
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Seu Desempenho</span>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Kms & Ganhos</h1>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-100 border-2 border-blue-500 flex items-center justify-center text-blue-600 font-bold shadow-sm uppercase">
            {userProfile.name.slice(0, 2)}
          </div>
        </header>

        {/* Main Content Areas */}
        <main ref={mainRef} className="flex-1 overflow-y-auto px-6 pb-24 scrollbar-hide">
          <AnimatePresence mode="wait">
            {activeTab === 'dash' && (
              <motion.div
                key="dash"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="space-y-6"
              >
                {/* Active Trip Banner */}
                {activeTrip && (
                  <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex justify-between items-center shadow-sm">
                    <div>
                      <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-tight">Viagem em Curso</p>
                      <p className="text-sm font-bold text-gray-800">{activeTrip.platform} • KM Inicial: {activeTrip.kmStart}</p>
                    </div>
                    <button 
                      onClick={() => setActiveTab('form')}
                      className="bg-emerald-600 text-white text-[10px] font-bold uppercase px-3 py-2 rounded-lg shadow-lg shadow-emerald-100"
                    >
                      Finalizar
                    </button>
                  </div>
                )}

                {/* Primary Stats */}
                <div className="flex gap-3">
                  <StatCard 
                    title="Ganhos Hoje" 
                    value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.todayEarnings)} 
                    icon={DollarSign}
                    colorClass="bg-blue-600"
                    shadowClass="shadow-blue-200"
                  />
                  <StatCard 
                    title="Este Mês" 
                    value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.monthEarnings)} 
                    icon={TrendingUp}
                    colorClass="bg-emerald-600"
                    shadowClass="shadow-emerald-200"
                  />
                </div>

                {/* Secondary Data Strip */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                    <p className="text-[8px] text-gray-400 font-bold uppercase tracking-tight mb-1">Km Hoje</p>
                    <p className="text-xs font-bold text-gray-800">{stats.todayKM.toFixed(1)} km</p>
                  </div>
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                    <p className="text-[8px] text-gray-400 font-bold uppercase tracking-tight mb-1">Km Mês</p>
                    <p className="text-xs font-bold text-gray-800">{stats.monthKM.toFixed(1)} km</p>
                  </div>
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                    <p className="text-[8px] text-gray-400 font-bold uppercase tracking-tight mb-1">Eficiência</p>
                    <p className="text-xs font-bold text-gray-800">R$ {stats.efficiency}/km</p>
                  </div>
                </div>

                {/* Chart Section */}
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <div className="flex justify-between items-end mb-4">
                    <h2 className="text-sm font-bold text-gray-800">Resumo Semanal</h2>
                    <span className="text-[10px] text-blue-600 font-bold cursor-pointer hover:underline" onClick={() => setActiveTab('history')}>Ver Detalhes</span>
                  </div>
                  <div className="h-32 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.chartData} margin={{ top: 0, right: 0, left: -40, bottom: 0 }}>
                        <Bar 
                          dataKey="ganho" 
                          radius={[6, 6, 0, 0]}
                          maxBarSize={30}
                        >
                          {stats.chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.date === new Date().toISOString().split('T')[0] ? '#2563EB' : '#E5E7EB'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-between mt-2 text-[8px] text-gray-400 font-bold px-2 uppercase tracking-tighter">
                    {stats.chartData.map((d, i) => <span key={i}>{d.name}</span>)}
                  </div>
                </div>

                {/* Quick Action Button */}
                <button 
                  onClick={() => setActiveTab('form')}
                  className="w-full bg-gray-900 text-white rounded-2xl py-4 font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-xl shadow-gray-200"
                >
                  <PlusCircle size={20} className="text-blue-400" />
                  {activeTrip ? 'Encerrar Entrega' : 'Iniciar Entrega'}
                </button>

                {/* Monthly Summary List */}
                <div>
                  <h2 className="text-sm font-bold text-gray-800 mb-3">Resumo por Mês</h2>
                  <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm divide-y divide-gray-50">
                    {stats.monthlySummaryList.length === 0 ? (
                      <div className="p-4 text-center text-[10px] text-gray-400 font-medium">Sem dados mensais</div>
                    ) : (
                      stats.monthlySummaryList.map((m: any) => (
                        <div key={m.month} className="p-3 flex justify-between items-center group active:bg-gray-50 transition-colors">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                              {new Date(m.month + '-01').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).replace(/^\w/, (c) => c.toUpperCase())}
                            </span>
                            <span className="text-[9px] text-gray-400 font-medium">{m.count} viagens • {m.km.toFixed(1)} km total</span>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-black text-gray-900">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(m.earnings)}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Partial History Preview */}
                <div>
                  <h2 className="text-sm font-bold text-gray-800 mb-3">Recentes</h2>
                  <div className="space-y-3">
                    {trips.length === 0 ? (
                      <div className="py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200 flex items-center justify-center text-xs text-gray-400 font-medium italic">
                        Nenhuma viagem registrada
                      </div>
                    ) : (
                      trips.slice(-3).reverse().map(trip => (
                        <div key={trip.id} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-lg">
                              {trip.platform === 'Uber' ? '🚗' : trip.platform === '99' ? '🚖' : '📦'}
                            </div>
                            <div>
                              <p className="text-[11px] font-bold text-gray-800">{trip.platform}</p>
                              <p className="text-[9px] text-gray-500 font-medium">{trip.date.split('-').reverse().slice(0,2).join('/')} • {(trip.kmEnd - trip.kmStart).toFixed(1)} km</p>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-emerald-600">
                             + {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(trip.earnings)}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'form' && (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-5"
              >
                {!activeTrip ? (
                  <>
                    <div className="flex items-center gap-3 mb-2 bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                      <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                        <Route size={20} />
                      </div>
                      <div>
                        <h2 className="text-sm font-bold text-gray-900">Iniciar Trabalho</h2>
                        <p className="text-[10px] text-blue-600 font-bold uppercase tracking-tight">Defina o KM Inicial</p>
                      </div>
                    </div>

                    <form onSubmit={handleStartTrip} className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 tracking-tight">Data</label>
                          <input 
                            type="date" 
                            required
                            value={formData.date}
                            onChange={e => setFormData({...formData, date: e.target.value})}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 tracking-tight">Plataforma</label>
                          <select 
                            value={formData.platform}
                            onChange={e => setFormData({...formData, platform: e.target.value})}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-no-repeat bg-[right_1rem_center]"
                            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")` }}
                          >
                            {platforms.map(p => <option key={p} value={p}>{p}</option>)}
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 tracking-tight">KM Inicial</label>
                        <input 
                          type="number" 
                          placeholder="Ex: 45020"
                          required
                          value={formData.kmStart}
                          onChange={e => setFormData({...formData, kmStart: e.target.value})}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        />
                      </div>

                      <button 
                        type="submit"
                        className="w-full bg-blue-600 text-white rounded-xl py-4 text-xs font-bold uppercase tracking-tight shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-[0.98]"
                      >
                        Salvar e Iniciar Viagem
                      </button>
                    </form>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-3 mb-2 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
                      <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                        <PlusCircle size={20} />
                      </div>
                      <div>
                        <h2 className="text-sm font-bold text-gray-900">Finalizar Trabalho</h2>
                        <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-tight">
                          {activeTrip.platform} • KM Inicial: {activeTrip.kmStart}
                        </p>
                      </div>
                    </div>

                    <form onSubmit={handleFinishTrip} className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 tracking-tight">KM Final</label>
                        <input 
                          type="number" 
                          placeholder="Ex: 45140"
                          required
                          value={formData.kmEnd}
                          onChange={e => setFormData({...formData, kmEnd: e.target.value})}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        />
                        {formData.kmEnd && Number(formData.kmEnd) > activeTrip.kmStart && (
                          <p className="text-[9px] text-emerald-600 font-bold mt-1 uppercase">Distância: {Number(formData.kmEnd) - activeTrip.kmStart} km percorridos</p>
                        )}
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 tracking-tight">Valor Ganho (R$)</label>
                        <div className="relative group">
                          <DollarSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-blue-500" />
                          <input 
                            type="number" 
                            step="0.01"
                            placeholder="0,00"
                            required
                            value={formData.earnings}
                            onChange={e => setFormData({...formData, earnings: e.target.value})}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 tracking-tight">Combustível (Opcional)</label>
                        <div className="relative group">
                          <Fuel size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-blue-500" />
                          <input 
                            type="number" 
                            step="0.01"
                            placeholder="0,00"
                            value={formData.fuelCost}
                            onChange={e => setFormData({...formData, fuelCost: e.target.value})}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                          />
                        </div>
                      </div>

                      <div className="pt-4 flex gap-3">
                        <button 
                          type="button" 
                          onClick={() => setActiveTrip(null)}
                          className="flex-1 bg-gray-100 text-gray-500 rounded-xl py-4 text-xs font-bold uppercase tracking-tight hover:bg-gray-200 transition-all active:scale-[0.98]"
                        >
                          Anular
                        </button>
                        <button 
                          type="submit"
                          className="flex-[2] bg-emerald-600 text-white rounded-xl py-4 text-xs font-bold uppercase tracking-tight shadow-xl shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-[0.98]"
                        >
                          Concluir e Salvar
                        </button>
                      </div>
                    </form>
                  </>
                )}
              </motion.div>
            )}

            {activeTab === 'history' && (
              <motion.div
                key="history"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm font-bold text-gray-800 uppercase tracking-tight">Histórico de Atividades</h2>
                  <div className="text-[9px] bg-blue-50 text-blue-600 px-2 py-1 rounded-md font-bold border border-blue-100">
                    {trips.length} REGISTROS
                  </div>
                </div>

                {/* Search Bar */}
                <div className="relative group">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-blue-500" />
                  <input 
                    type="text" 
                    placeholder="Pesquisar por plataforma..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
                  />
                </div>

                <div className="space-y-3">
                  {trips.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-xs text-gray-400 font-medium italic">
                      Nenhum registro encontrado.
                    </div>
                  ) : (
                    [...trips]
                      .filter(t => t.platform.toLowerCase().includes(searchTerm.toLowerCase()))
                      .reverse()
                      .map((trip) => (
                      <div key={trip.id} className="group">
                        <Card className="p-3 flex justify-between items-center hover:border-blue-200 hover:shadow-md transition-all active:scale-[0.99]">
                          <div className="flex gap-3 items-center text-xs">
                            <div className="w-10 h-10 bg-gray-50 rounded-xl flex flex-col items-center justify-center group-hover:bg-blue-50 transition-colors">
                              <Calendar size={12} className="text-gray-400 group-hover:text-blue-500" />
                              <span className="text-[8px] font-bold text-gray-500 group-hover:text-blue-600">{trip.date.split('-').slice(2)}/{trip.date.split('-').slice(1,2)}</span>
                            </div>
                            <div>
                              <div className="font-bold text-gray-900">
                                 {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(trip.earnings)}
                              </div>
                              <div className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">
                                {trip.platform} • {(trip.kmEnd - trip.kmStart).toFixed(1)} km
                              </div>
                            </div>
                          </div>
                            <div className="flex gap-1">
                              <button 
                                onClick={() => setEditingTrip(trip)}
                                className="p-2 text-gray-200 hover:text-blue-500 transition-colors"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button 
                                onClick={() => deleteTrip(trip.id)}
                                className="p-2 text-gray-200 hover:text-red-500 transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                        </Card>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'finance' && (
              <motion.div
                key="finance"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Month Selector Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-2 px-2">
                  {stats.financeMonths.map(month => (
                    <button
                      key={month}
                      onClick={() => setSelectedFinanceMonth(month)}
                      className={cn(
                        "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider whitespace-nowrap border transition-all",
                        selectedFinanceMonth === month 
                          ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100" 
                          : "bg-white border-gray-100 text-gray-400 hover:border-blue-200"
                      )}
                    >
                      {new Date(month + '-01T00:00:00').toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }).replace('.', '')}
                    </button>
                  ))}
                </div>

                {/* Category Selector */}
                <div className="flex bg-gray-100 p-1 rounded-2xl">
                  <button 
                    onClick={() => setFinanceCategory('entrega')}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                      financeCategory === 'entrega' ? "bg-white text-blue-600 shadow-sm" : "text-gray-400"
                    )}
                  >
                    <Bike size={14} />
                    Entregas
                  </button>
                  <button 
                    onClick={() => setFinanceCategory('empresa')}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                      financeCategory === 'empresa' ? "bg-white text-blue-600 shadow-sm" : "text-gray-400"
                    )}
                  >
                    <Briefcase size={14} />
                    Empresa
                  </button>
                </div>

                <div className={cn(
                  "text-white rounded-[32px] p-6 shadow-2xl relative overflow-hidden transition-colors duration-500",
                  financeCategory === 'entrega' ? "bg-gray-900" : "bg-blue-900"
                )}>
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl"></div>
                  <p className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-60 mb-1">
                    Saldo {financeCategory === 'entrega' ? 'Entregas' : 'Minha Empresa'} • {new Date(selectedFinanceMonth + '-01T00:00:00').toLocaleDateString('pt-BR', { month: 'short' })}
                  </p>
                  <h2 className="text-3xl font-black tracking-tighter mb-4">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.monthBalance)}
                  </h2>
                  <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-4">
                    <div>
                      <p className="text-[9px] uppercase font-bold opacity-40">Ganhos (Bruto)</p>
                      <p className="text-sm font-bold text-emerald-400">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.monthTotalGrossEarnings)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] uppercase font-bold opacity-40">Despesas Pagas</p>
                      <p className="text-sm font-bold text-red-300">-{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.monthPaidDebts + stats.monthFuelCost)}</p>
                    </div>
                  </div>
                </div>

                {/* Add Earnings Section (Manual) */}
                <div>
                  <div className="flex justify-between items-end mb-3">
                    <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                      <TrendingUp size={16} className="text-emerald-600" />
                      {financeCategory === 'entrega' ? 'Ganho Extra' : 'Lucro Empresa'}
                    </h3>
                    <div className="text-right">
                      <p className="text-[8px] uppercase font-bold text-gray-400 tracking-widest">Total Ganhos</p>
                      <p className="text-xs font-black text-emerald-600">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.monthTotalGrossEarnings)}</p>
                    </div>
                  </div>
                  
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      const form = e.target as HTMLFormElement;
                      const titleField = form.elements.namedItem('title') as HTMLInputElement;
                      const title = financeCategory === 'empresa' ? 'Lucro Final do Dia' : titleField.value;
                      const value = Number((form.elements.namedItem('value') as HTMLInputElement).value);
                      const date = (form.elements.namedItem('date') as HTMLInputElement).value;
                      addManualGain(title, value, date, financeCategory);
                      form.reset();
                      setShowSaveFeedback(true);
                      setTimeout(() => setShowSaveFeedback(false), 3000);
                    }}
                    className="grid grid-cols-1 gap-3 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-4"
                  >
                    {financeCategory === 'entrega' ? (
                      <input name="title" required placeholder="Ex: Corrida Particular / Bonus" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none" />
                    ) : (
                      <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-2 text-[10px] font-bold text-blue-600 uppercase tracking-tight">
                        Registrando Lucro Líquido do Dia
                        <input name="title" type="hidden" value="Lucro Final do Dia" />
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                      <input name="value" type="number" step="0.01" required placeholder="Valor R$" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none" />
                      <input name="date" type="date" required className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none" defaultValue={new Date().toISOString().split('T')[0]} />
                    </div>
                    <button type="submit" className="w-full bg-emerald-600 text-white rounded-xl py-2 text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-emerald-100 active:scale-95 transition-all">
                      {showSaveFeedback ? '✓ Salvo com Sucesso!' : 'Salvar Ganho'}
                    </button>
                  </form>

                  {/* List of gains for the current month/category */}
                  <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-hide pr-1">
                    {trips
                      .filter(t => t.category === financeCategory && t.date.startsWith(selectedFinanceMonth))
                      .sort((a, b) => b.date.localeCompare(a.date))
                      .map(t => (
                        <div key={t.id} className="bg-white border border-gray-50 p-3 rounded-xl flex justify-between items-center shadow-sm">
                          <div>
                            <p className="text-[10px] font-bold text-gray-800">{t.platform}</p>
                            <p className="text-[8px] text-gray-400 font-bold uppercase">{t.date.split('-').reverse().join('/')}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <p className="text-xs font-black text-emerald-600">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(t.earnings)}
                            </p>
                            <button onClick={() => setEditingTrip(t)} className="text-gray-200 hover:text-blue-500 transition-colors p-1">
                              <Edit2 size={12} />
                            </button>
                            <button onClick={() => deleteTrip(t.id)} className="text-gray-200 hover:text-red-500 transition-colors p-1">
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      ))}
                    {trips.filter(t => t.category === financeCategory && t.date.startsWith(selectedFinanceMonth)).length === 0 && (
                      <p className="text-[10px] text-gray-400 font-medium italic text-center py-4 bg-gray-50 rounded-xl border border-dashed border-gray-100">Nenhum ganho registrado neste mês.</p>
                    )}
                  </div>
                </div>

                {/* Add Debt Section */}
                <div>
                  <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <PlusCircle size={16} className="text-blue-600" />
                    Nova Dívida ({financeCategory === 'entrega' ? 'Entregas' : 'Empresa'})
                  </h3>
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      const form = e.target as HTMLFormElement;
                      const title = (form.elements.namedItem('title') as HTMLInputElement).value;
                      const value = Number((form.elements.namedItem('value') as HTMLInputElement).value);
                      const date = (form.elements.namedItem('date') as HTMLInputElement).value;
                      const parcels = Number((form.elements.namedItem('parcels') as HTMLInputElement).value) || 1;
                      addDebt(title, value, date, financeCategory, parcels);
                      form.reset();
                    }}
                    className="grid grid-cols-1 gap-3 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm"
                  >
                    <input name="title" required placeholder="Ex: Aluguel do Carro" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none" />
                    <div className="grid grid-cols-3 gap-3">
                      <input name="value" type="number" step="0.01" required placeholder="Valor R$" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none" />
                      <input name="date" type="date" required className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none" />
                      <input name="parcels" type="number" min="1" max="60" defaultValue="1" required placeholder="Vezes" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <button type="submit" className="w-full bg-blue-600 text-white rounded-xl py-2 text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-blue-100 active:scale-95 transition-all">
                      Adicionar Débito
                    </button>
                  </form>
                </div>

                {/* Debts List */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-bold text-gray-800">Dívidas: {financeCategory === 'entrega' ? 'Entregas' : 'Minha Empresa'} • {new Date(selectedFinanceMonth + '-01T00:00:00').toLocaleDateString('pt-BR', { month: 'short' })}</h3>
                    <div className="text-right">
                      <p className="text-[9px] uppercase font-bold text-gray-400">Total no Mês</p>
                      <p className="text-xs font-black text-gray-900">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.monthTotalDebts)}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {stats.filteredDebtsByMonth.length === 0 ? (
                      <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-xs text-gray-400 font-medium italic">
                        Nenhuma dívida para este mês nesta categoria.
                      </div>
                    ) : (
                      stats.filteredDebtsByMonth
                        .sort((a: any, b: any) => a.dueDate.localeCompare(b.dueDate))
                        .map((debt: any) => (
                        <div key={debt.id} className={cn("p-4 rounded-2xl border transition-all", debt.isPaid ? "bg-gray-50 border-gray-100 opacity-60" : "bg-white border-blue-100 shadow-sm")}>
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              {debt.isPaid ? <CheckCircle2 size={16} className="text-emerald-500" /> : <AlertCircle size={16} className="text-blue-500" />}
                              <span className={cn("text-xs font-bold", debt.isPaid ? "text-gray-500 line-through" : "text-gray-800")}>{debt.title}</span>
                            </div>
                            <span className={cn("text-xs font-black", debt.isPaid ? "text-gray-400" : "text-red-500")}>
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(debt.value)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-tight text-gray-400">
                            <p className="text-[9px] uppercase font-bold text-gray-400 tracking-tight">Vencimento: {debt.dueDate.split('-').reverse().join('/')}</p>
                            <div className="flex gap-3">
                              <button onClick={() => setEditingDebt(debt)} className="text-blue-400 hover:text-blue-600 font-bold text-[9px] uppercase">Editar</button>
                              <button onClick={() => toggleDebtPaid(debt.id)} className={cn("underline decoration-2 font-bold", debt.isPaid ? "text-blue-600 decoration-blue-100" : "text-emerald-600 decoration-emerald-100")}>
                                {debt.isPaid ? 'Reabrir' : 'Pagar'}
                              </button>
                              <button onClick={() => deleteDebt(debt.id)} className="text-red-300 hover:text-red-500 font-bold">Excluir</button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'salary' && (
              <motion.div
                key="salary"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="bg-gray-900 border border-gray-800 rounded-[32px] p-6 shadow-2xl relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl"></div>
                  <p className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-60 mb-1 text-white">Total à Pagar (Mês)</p>
                  <h2 className="text-3xl font-black tracking-tighter mb-4 text-white">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                      salaries
                        .filter(s => s.month === selectedFinanceMonth)
                        .reduce((acc, s) => acc + (s.totalValue - s.paidValue), 0)
                    )}
                  </h2>
                  <div className="flex justify-between items-center bg-white/5 rounded-xl p-3 border border-white/5">
                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-tight">Funcionárias: {salaries.filter(s => s.month === selectedFinanceMonth).length}</span>
                    <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-tight">
                      Já pago: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                        salaries
                          .filter(s => s.month === selectedFinanceMonth)
                          .reduce((acc, s) => acc + s.paidValue, 0)
                      )}
                    </span>
                  </div>
                </div>

                {/* Add Salary Form */}
                <Card>
                  <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <Users size={16} className="text-blue-600" />
                    Nova Funcionária
                  </h3>
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      const form = e.target as HTMLFormElement;
                      const name = (form.elements.namedItem('name') as HTMLInputElement).value;
                      const value = Number((form.elements.namedItem('value') as HTMLInputElement).value);
                      const month = (form.elements.namedItem('month') as HTMLInputElement).value;
                      addSalary(name, value, month);
                      form.reset();
                    }}
                    className="space-y-3"
                  >
                    <input name="name" required placeholder="Nome do Funcionário" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-xs font-medium outline-none focus:ring-2 focus:ring-blue-500" />
                    <div className="grid grid-cols-2 gap-3">
                      <input name="value" type="number" step="0.01" required placeholder="Salário R$" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500" />
                      <input name="month" type="month" required defaultValue={selectedFinanceMonth} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-xs font-medium outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <button type="submit" className="w-full bg-blue-600 text-white rounded-xl py-2 text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-blue-100 active:scale-95 transition-all">
                      Cadastrar Salário
                    </button>
                  </form>
                </Card>

                {/* Salaries List */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-gray-800 flex justify-between items-center px-1">
                    Gestão de Salários
                    <span className="text-[10px] text-gray-400 font-bold uppercase">{selectedFinanceMonth}</span>
                  </h3>
                  {salaries.filter(s => s.month === selectedFinanceMonth).length === 0 ? (
                    <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-xs text-gray-400 font-medium italic">
                      Nenhum salário para este mês.
                    </div>
                  ) : (
                    salaries
                      .filter(s => s.month === selectedFinanceMonth)
                      .map(salary => {
                        const remaining = salary.totalValue - salary.paidValue;
                        const progress = (salary.paidValue / salary.totalValue) * 100;
                        
                        return (
                          <div key={salary.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm relative overflow-hidden group">
                            {progress >= 100 && (
                              <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[8px] font-black px-2 py-0.5 rounded-bl-lg uppercase tracking-widest z-10">
                                Pago
                              </div>
                            )}
                            
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h4 className="text-sm font-bold text-gray-900">{salary.name}</h4>
                                <p className="text-[10px] font-bold text-gray-400 uppercase">Total: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(salary.totalValue)}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-black text-gray-900">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(remaining)}</p>
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Pendente</p>
                              </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="h-1.5 w-full bg-gray-100 rounded-full mb-4 overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                className={cn("h-full transition-all duration-1000", progress >= 100 ? "bg-emerald-500" : "bg-blue-600")}
                              />
                            </div>

                            {/* Payment Actions */}
                            {remaining > 0 ? (
                              <form 
                                onSubmit={(e) => {
                                  e.preventDefault();
                                  const form = e.target as HTMLFormElement;
                                  const amount = Number((form.elements.namedItem('amount') as HTMLInputElement).value);
                                  updateSalaryPaid(salary.id, amount);
                                  form.reset();
                                }}
                                className="flex gap-2"
                              >
                                <div className="relative flex-1">
                                  <DollarSign size={10} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                  <input 
                                    name="amount" 
                                    type="number" 
                                    max={remaining}
                                    step="0.01"
                                    placeholder="Valor à Pagar" 
                                    className="w-full bg-gray-50 border border-gray-100 rounded-lg pl-7 pr-3 py-1.5 text-[10px] font-bold outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                </div>
                                <button type="submit" className="bg-emerald-600 text-white text-[9px] font-bold uppercase px-4 py-1.5 rounded-lg shadow-lg shadow-emerald-100 active:scale-95 transition-all">
                                  Confirmar
                                </button>
                                <button type="button" onClick={() => deleteSalary(salary.id)} className="p-1.5 text-gray-200 hover:text-red-500 transition-colors">
                                  <Trash2 size={14} />
                                </button>
                              </form>
                            ) : (
                              <div className="flex justify-between items-center text-[10px] font-bold text-emerald-600 uppercase tracking-tighter bg-emerald-50 p-2 rounded-xl border border-emerald-100">
                                <span className="flex items-center gap-1">
                                  <CheckCircle2 size={12} />
                                  Salário Liquidado
                                </span>
                                <button onClick={() => deleteSalary(salary.id)} className="text-emerald-200 hover:text-red-500 transition-colors">
                                  Excluir Registro
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'inventory' && (
              <motion.div
                key="inventory"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {!isCounting ? (
                  <>
                    <div className="bg-orange-500 border border-orange-400 rounded-[32px] p-6 shadow-2xl relative overflow-hidden text-white">
                      <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                      <p className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-60 mb-1">Status do Estoque</p>
                      <h2 className="text-3xl font-black tracking-tighter mb-4">
                        {inventory.filter(i => i.quantity <= i.minQuantity).length} Itens em Falta
                      </h2>
                      <div className="flex justify-between items-center bg-black/10 rounded-xl p-3 border border-white/10">
                        <span className="text-[9px] font-bold uppercase tracking-tight">Total de Produtos: {inventory.length}</span>
                        <button 
                          onClick={startInventoryCount}
                          className="bg-white text-orange-600 text-[9px] font-black uppercase px-3 py-1.5 rounded-lg shadow-xl active:scale-95 transition-all"
                        >
                          Fazer Contagem
                        </button>
                      </div>
                    </div>

                    {/* Add Product Form */}
                    <Card>
                      <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <PlusSquare size={16} className="text-orange-600" />
                        Novo Produto
                      </h3>
                      <form 
                        onSubmit={(e) => {
                          e.preventDefault();
                          const form = e.target as HTMLFormElement;
                          const name = (form.elements.namedItem('name') as HTMLInputElement).value;
                          const qty = Number((form.elements.namedItem('qty') as HTMLInputElement).value);
                          const min = Number((form.elements.namedItem('min') as HTMLInputElement).value);
                          addInventoryItem(name, qty, min);
                          form.reset();
                        }}
                        className="space-y-3"
                      >
                        <input name="name" required placeholder="Nome do Produto" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-xs font-medium focus:ring-2 focus:ring-orange-500 outline-none" />
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-gray-400 uppercase ml-2">Qtd Inicial</label>
                            <input name="qty" type="number" required placeholder="Ex: 50" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-xs font-bold focus:ring-2 focus:ring-orange-500 outline-none" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-gray-400 uppercase ml-2">Qtd Mínima</label>
                            <input name="min" type="number" required placeholder="Ex: 10" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-xs font-bold focus:ring-2 focus:ring-orange-500 outline-none" />
                          </div>
                        </div>
                        <button type="submit" className="w-full bg-orange-600 text-white rounded-xl py-2 text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-orange-100 active:scale-95 transition-all">
                          Cadastrar no Estoque
                        </button>
                      </form>
                    </Card>

                    {/* Products List */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-bold text-gray-800 px-1">Itens no Estoque</h3>
                      <div className="grid grid-cols-1 gap-3">
                        {inventory.length === 0 ? (
                          <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-xs text-gray-400 font-medium italic">
                            Nenhum produto cadastrado.
                          </div>
                        ) : (
                          inventory.map(item => {
                            const isLow = item.quantity <= item.minQuantity;
                            return (
                              <div key={item.id} className={cn(
                                "bg-white border rounded-2xl p-4 shadow-sm transition-all",
                                isLow ? "border-orange-200 bg-orange-50/20" : "border-gray-100"
                              )}>
                                <div className="flex justify-between items-start mb-4">
                                  <div>
                                    <h4 className="text-sm font-bold text-gray-900">{item.name}</h4>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Mínimo desejado: {item.minQuantity}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className={cn("text-2xl font-black", isLow ? "text-orange-600" : "text-gray-900")}>
                                      {item.quantity}
                                    </p>
                                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Unidades</p>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between gap-4">
                                  <div className="flex items-center gap-2">
                                    <button 
                                      onClick={() => updateInventoryQty(item.id, -1)}
                                      className="w-8 h-8 flex items-center justify-center bg-gray-100 text-gray-600 rounded-lg active:scale-90 transition-all"
                                    >
                                      <MinusSquare size={16} />
                                    </button>
                                    <button 
                                      onClick={() => updateInventoryQty(item.id, 1)}
                                      className="w-8 h-8 flex items-center justify-center bg-orange-600 text-white rounded-lg active:scale-90 transition-all shadow-md shadow-orange-100"
                                    >
                                      <PlusSquare size={16} />
                                    </button>
                                  </div>

                                  <div className="flex items-center gap-3">
                                    {isLow && (
                                      <span className="flex items-center gap-1 text-[9px] font-black text-orange-600 uppercase bg-orange-100 px-2 py-0.5 rounded-full animate-pulse">
                                        <AlertCircle size={10} />
                                        Repor Agora
                                      </span>
                                    )}
                                    <button onClick={() => setEditingInventoryItem(item)} className="text-gray-200 hover:text-blue-500 transition-colors">
                                      <Edit2 size={16} />
                                    </button>
                                    <button onClick={() => deleteInventoryItem(item.id)} className="text-gray-200 hover:text-red-500 transition-colors">
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-gray-900 border border-black rounded-[32px] p-6 shadow-2xl relative overflow-hidden text-white">
                      <div className="absolute -right-4 -top-4 w-24 h-24 bg-orange-500/20 rounded-full blur-2xl"></div>
                      <div className="flex justify-between items-center mb-4">
                        <p className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-60">Modo de Contagem</p>
                        <button onClick={() => setIsCounting(false)} className="text-[10px] font-bold text-red-400 uppercase">Cancelar</button>
                      </div>
                      <div className="flex items-center gap-4 mb-2">
                        <span className="w-10 h-10 flex items-center justify-center bg-orange-600 rounded-full font-black text-xs">
                          {countingIndex + 1}
                        </span>
                        <div>
                          <h2 className="text-xl font-black tracking-tighter">
                            {inventory[countingIndex]?.name}
                          </h2>
                          <p className="text-[10px] text-gray-400 font-bold uppercase">Saldo Atual: {inventory[countingIndex]?.quantity} un</p>
                        </div>
                      </div>
                      <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-orange-500 transition-all duration-500" 
                          style={{ width: `${((countingIndex + 1) / inventory.length) * 100}%` }}
                        />
                      </div>
                    </div>

                    <Card>
                      <h3 className="text-sm font-bold text-gray-800 mb-6 text-center">Quantas unidades você contou?</h3>
                      <div className="flex flex-col items-center gap-6">
                        <input 
                          type="number" 
                          autoFocus
                          placeholder="0"
                          className="w-32 text-center text-5xl font-black bg-gray-50 border-b-4 border-orange-500 py-4 outline-none focus:bg-orange-50 transition-all rounded-t-2xl"
                          value={tempCounts[inventory[countingIndex]?.id] || ''}
                          onChange={(e) => setTempCounts({ ...tempCounts, [inventory[countingIndex].id]: Number(e.target.value) })}
                        />
                        
                        <div className="w-full flex gap-3">
                          {countingIndex > 0 && (
                            <button 
                              onClick={() => setCountingIndex(countingIndex - 1)}
                              className="flex-1 bg-gray-100 text-gray-600 rounded-2xl py-4 text-xs font-bold uppercase tracking-widest transition-all"
                            >
                              Voltar
                            </button>
                          )}
                          <button 
                            onClick={() => {
                              if (countingIndex < inventory.length - 1) {
                                setCountingIndex(countingIndex + 1);
                              } else {
                                finishInventoryCount();
                              }
                            }}
                            className="flex-[2] bg-orange-600 text-white rounded-2xl py-4 text-xs font-bold uppercase tracking-widest shadow-xl shadow-orange-100 active:scale-95 transition-all"
                          >
                            {countingIndex < inventory.length - 1 ? 'Próximo Item' : 'Finalizar e Atualizar'}
                          </button>
                        </div>
                      </div>
                    </Card>
                    
                    <div className="text-center">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        Item {countingIndex + 1} de {inventory.length}
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'receivables' && (
              <motion.div
                key="receivables"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="bg-emerald-600 border border-emerald-500 rounded-[32px] p-6 shadow-2xl relative overflow-hidden text-white">
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                  <p className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-60 mb-1">Total a Receber</p>
                  <h2 className="text-3xl font-black tracking-tighter mb-4">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                      receivables.reduce((acc, r) => acc + (r.totalValue - r.paidValue), 0)
                    )}
                  </h2>
                  <div className="bg-black/10 rounded-xl p-3 border border-white/10">
                    <span className="text-[9px] font-bold uppercase tracking-tight">
                      {receivables.filter(r => !r.isPaid).length} Pessoas Devendo
                    </span>
                  </div>
                </div>

                <Card className="bg-emerald-50/50 border-emerald-100">
                  <div className="flex items-center justify-between mb-3 px-1">
                    <h3 className="text-[10px] font-black text-emerald-700 uppercase tracking-widest flex items-center gap-2">
                       <Users size={14} /> Devedores Salvos
                    </h3>
                    <div className="flex gap-2">
                      <input 
                        id="newDebtorInput"
                        placeholder="Novo nome..." 
                        className="bg-white border border-emerald-100 rounded-lg px-3 py-1 text-[10px] font-bold focus:ring-1 focus:ring-emerald-500 outline-none w-24 sm:w-32"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const input = e.target as HTMLInputElement;
                            const name = input.value.trim();
                            if (name && !savedDebtors.includes(name)) {
                              setSavedDebtors([...savedDebtors, name]);
                              input.value = '';
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                  {savedDebtors.length === 0 ? (
                    <p className="text-[9px] text-emerald-400 font-medium italic text-center py-2">Sem devedores cadastrados.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {savedDebtors.map(name => (
                        <div key={name} className="flex items-center gap-1 bg-white border border-emerald-100 px-2 py-1 rounded-full text-[10px] font-bold text-emerald-700 shadow-sm">
                          {name}
                          <button 
                            onClick={() => setSavedDebtors(savedDebtors.filter(d => d !== name))}
                            className="hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={10} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>

                <Card>
                  <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <TrendingUp size={16} className="text-emerald-600" />
                    Novo Valor a Receber
                  </h3>
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      const form = e.target as HTMLFormElement;
                      const name = (form.elements.namedItem('debtorName') as HTMLInputElement).value;
                      const value = Number((form.elements.namedItem('totalValue') as HTMLInputElement).value);
                      const installments = Number((form.elements.namedItem('installments') as HTMLInputElement).value);
                      const date = (form.elements.namedItem('date') as HTMLInputElement).value;
                      const observation = (form.elements.namedItem('observation') as HTMLInputElement).value;
                      addReceivable(name, value, installments, date, observation);
                      form.reset();
                    }}
                    className="space-y-3"
                  >
                    <div className="relative">
                      <input 
                        name="debtorName" 
                        required 
                        list="debtors-list"
                        placeholder="Nome de quem deve" 
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none" 
                      />
                      <datalist id="debtors-list">
                        {savedDebtors.map(name => <option key={name} value={name} />)}
                      </datalist>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-gray-400 uppercase ml-2">Valor Total</label>
                        <input name="totalValue" type="number" step="0.01" required placeholder="R$ 0,00" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-xs font-bold focus:ring-2 focus:ring-emerald-500 outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-gray-400 uppercase ml-2">Parcelas</label>
                        <input name="installments" type="number" required defaultValue="1" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-xs font-bold focus:ring-2 focus:ring-emerald-500 outline-none" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-gray-400 uppercase ml-2">Data Inicial</label>
                        <input name="date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-xs font-bold focus:ring-2 focus:ring-emerald-500 outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-gray-400 uppercase ml-2">Observação (Opcional)</label>
                        <input name="observation" placeholder="Ex: Referente a..." className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none" />
                      </div>
                    </div>
                    <button type="submit" className="w-full bg-emerald-600 text-white rounded-xl py-2 text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-emerald-100 active:scale-95 transition-all">
                      Cadastrar Recebível
                    </button>
                  </form>
                </Card>

                <div className="space-y-6">
                  <h3 className="text-sm font-bold text-gray-800 px-1">Lista de Pendentes</h3>
                  {receivables.filter(r => !r.isPaid).length === 0 ? (
                    <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-xs text-gray-400 font-medium italic">
                      Ninguém te deve nada no momento!
                    </div>
                  ) : (
                    Object.entries(
                      receivables
                        .filter(r => !r.isPaid)
                        .reduce((acc: Record<string, Receivable[]>, r) => {
                          if (!acc[r.debtorName]) acc[r.debtorName] = [];
                          acc[r.debtorName].push(r);
                          return acc;
                        }, {})
                    ).sort(([nameA], [nameB]) => nameA.localeCompare(nameB)).map(([debtorName, debtorReceivables]: [string, Receivable[]]) => (
                      <div key={debtorName} className="space-y-3">
                        <div className="flex items-center justify-between px-1">
                          <h4 className="text-[10px] font-black text-gray-600 uppercase tracking-widest flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                            {debtorName}
                          </h4>
                          <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                            {debtorReceivables.length} {debtorReceivables.length === 1 ? 'pendência' : 'pendências'}
                          </span>
                        </div>
                        {debtorReceivables.map(r => (
                          <div key={r.id}>
                        <Card>
                          <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="text-sm font-bold text-gray-900">{r.debtorName}</h4>
                            <p className="text-[10px] font-bold text-gray-400 uppercase">
                              {r.installments > 1 ? `${r.installments}x Parcelas` : 'À Vista'} • {new Date(r.date + 'T00:00:00').toLocaleDateString('pt-BR')}
                            </p>
                            {r.observation && (
                              <p className="mt-1 text-[9px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded italic">
                                {r.observation}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-black text-emerald-600">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(r.totalValue - r.paidValue)}
                            </p>
                            <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Restante</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-emerald-500 rounded-full transition-all" 
                              style={{ width: `${(r.paidValue / r.totalValue) * 100}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-[8px] font-bold text-gray-400 uppercase tracking-tighter">
                            <span>Pago: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(r.paidValue)}</span>
                            <span>Total: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(r.totalValue)}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-4">
                          <div className="w-full space-y-3">
                            {r.installmentDetails && r.installmentDetails.length > 0 && (
                              <div className="bg-gray-50 rounded-xl p-3 space-y-2">
                                <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-1">Cronograma de Parcelas</p>
                                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                                  {r.installmentDetails.map((ins, idx) => (
                                    <div key={ins.id} className="flex items-center justify-between py-1 border-b border-gray-100 last:border-0">
                                      <div>
                                        <p className="text-[9px] font-bold text-gray-800">Parcela {idx + 1}</p>
                                        <p className="text-[7px] text-gray-400 uppercase font-medium">{new Date(ins.dueDate + 'T00:00:00').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</p>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-black text-gray-900">
                                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(ins.value)}
                                        </span>
                                        {ins.isPaid ? (
                                          <span className="bg-emerald-100 text-emerald-600 p-1 rounded-full">
                                            <CheckCircle2 size={10} />
                                          </span>
                                        ) : (
                                          <button 
                                            onClick={() => payInstallment(r.id, ins.id)}
                                            className="bg-emerald-600 text-white text-[8px] font-bold px-2 py-1 rounded shadow-sm active:scale-95"
                                          >
                                            Pagar
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className="flex items-center justify-between pt-2">
                              <div className="flex items-center gap-3">
                                {(!r.installmentDetails || r.installmentDetails.length === 0) && (
                                  <button 
                                    onClick={() => {
                                      const amount = prompt("Valor a dar baixa:");
                                      if (amount && !isNaN(Number(amount))) {
                                        // Still supporting legacy simple pay if no installments
                                        setReceivables(receivables.map(rec => {
                                          if (rec.id === r.id) {
                                            const val = Number(amount);
                                            const newPaid = Math.min(rec.totalValue, rec.paidValue + val);
                                            const newPayment = { date: new Date().toISOString(), value: val };
                                            return { 
                                              ...rec, 
                                              paidValue: newPaid, 
                                              isPaid: newPaid >= rec.totalValue - 0.01,
                                              payments: [...(rec.payments || []), newPayment]
                                            };
                                          }
                                          return rec;
                                        }));
                                      }
                                    }}
                                    className="bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase px-4 py-2 rounded-xl active:scale-95 transition-all"
                                  >
                                    Dar Baixa
                                  </button>
                                )}
                                <button 
                                  onClick={() => setEditingReceivable(r)}
                                  className="p-2 text-gray-300 hover:text-blue-500 transition-colors"
                                >
                                  <Edit2 size={16} />
                                </button>
                                <button 
                                  onClick={() => deleteReceivable(r.id)}
                                  className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                          </div>
                        ))}
                      </div>
                    ))
                  )}

                  {receivables.filter(r => r.isPaid).length > 0 && (
                    <div className="mt-8">
                      <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 text-center">Historico de Pagos</h4>
                      <div className="space-y-2 opacity-50">
                        {receivables.filter(r => r.isPaid).map(r => (
                          <div key={r.id} className="bg-gray-50 rounded-xl p-3 flex justify-between items-center border border-gray-200">
                             <div>
                               <p className="text-xs font-bold text-gray-900">{r.debtorName}</p>
                               <p className="text-[8px] font-medium text-gray-400">{new Date(r.date + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
                             </div>
                             <div className="text-right">
                               <p className="text-xs font-black text-emerald-600">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(r.totalValue)}</p>
                               <CheckCircle2 size={12} className="inline ml-1 text-emerald-500" />
                             </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                {!isManagingPlatforms && !isEditingProfile && !isManagingGoals ? (
                  <>
                    <div className="flex flex-col items-center justify-center py-8">
                      <div className="relative">
                        <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold shadow-2xl shadow-blue-200 ring-4 ring-white uppercase">
                          {userProfile.name.slice(0, 2)}
                        </div>
                        <div className="absolute bottom-0 right-0 w-6 h-6 bg-emerald-500 border-2 border-white rounded-full"></div>
                      </div>
                      <h2 className="text-lg font-extrabold mt-4 text-gray-900 tracking-tight">{userProfile.name}</h2>
                      <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded mt-2">Motorista Diamond</p>
                      {userProfile.account && (
                        <p className="text-[9px] text-gray-400 font-medium mt-1">Conta: {userProfile.account}</p>
                      )}
                    </div>

                    {(userProfile.deliveryGoal > 0 || userProfile.companyGoal > 0) && (
                      <div className="grid grid-cols-1 gap-4 px-1">
                        {userProfile.deliveryGoal > 0 && (
                          <div className="bg-white rounded-2xl p-4 border border-orange-100 shadow-sm">
                            <div className="flex justify-between items-end mb-3">
                              <div>
                                <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest flex items-center gap-1">
                                  <Bike size={10} /> Progresso Entregas
                                </p>
                                <p className="text-sm font-extrabold text-gray-800">
                                  R$ {stats.deliveryMonthEarnings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </p>
                              </div>
                              <p className="text-[10px] font-bold text-gray-400">
                                Meta: R$ {userProfile.deliveryGoal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </p>
                            </div>
                            <div className="h-2 bg-orange-50 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(100, (stats.deliveryMonthEarnings / userProfile.deliveryGoal) * 100)}%` }}
                                className="h-full bg-orange-500 rounded-full shadow-sm"
                              />
                            </div>
                            <p className="text-right text-[9px] font-bold text-orange-600 mt-2">
                              {Math.round((stats.deliveryMonthEarnings / userProfile.deliveryGoal) * 100)}% Atingido
                            </p>
                          </div>
                        )}

                        {userProfile.companyGoal > 0 && (
                          <div className="bg-white rounded-2xl p-4 border border-blue-100 shadow-sm">
                            <div className="flex justify-between items-end mb-3">
                              <div>
                                <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest flex items-center gap-1">
                                  <Briefcase size={10} /> Progresso Empresa
                                </p>
                                <p className="text-sm font-extrabold text-gray-800">
                                  R$ {stats.companyMonthEarnings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </p>
                              </div>
                              <p className="text-[10px] font-bold text-gray-400">
                                Meta: R$ {userProfile.companyGoal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </p>
                            </div>
                            <div className="h-2 bg-blue-50 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(100, (stats.companyMonthEarnings / userProfile.companyGoal) * 100)}%` }}
                                className="h-full bg-blue-500 rounded-full shadow-sm"
                              />
                            </div>
                            <p className="text-right text-[9px] font-bold text-blue-600 mt-2">
                              {Math.round((stats.companyMonthEarnings / userProfile.companyGoal) * 100)}% Atingido
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="bg-gray-50 border border-gray-100 rounded-2xl overflow-hidden divide-y divide-gray-100">
                      <button 
                        onClick={() => setIsEditingProfile(true)}
                        className="w-full flex items-center justify-between p-4 bg-white/50 hover:bg-white transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                            <User size={16} />
                          </div>
                          <span className="text-xs font-bold text-gray-700 uppercase tracking-tight">Dados da Conta</span>
                        </div>
                        <ChevronRight size={14} className="text-gray-300" />
                      </button>
                      <button 
                        onClick={() => setIsManagingPlatforms(true)}
                        className="w-full flex items-center justify-between p-4 bg-white/50 hover:bg-white transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                            <Layout size={16} />
                          </div>
                          <span className="text-xs font-bold text-gray-700 uppercase tracking-tight">Gerenciar Plataformas</span>
                        </div>
                        <ChevronRight size={14} className="text-gray-300" />
                      </button>
                      <button 
                        onClick={() => setIsManagingGoals(true)}
                        className="w-full flex items-center justify-between p-4 bg-white/50 hover:bg-white transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <TrendingUp size={16} />
                          </div>
                          <span className="text-xs font-bold text-gray-700 uppercase tracking-tight">Configurar Metas</span>
                        </div>
                        <ChevronRight size={14} className="text-gray-300" />
                      </button>
                      <button 
                        onClick={() => {
                          if (confirm("Deseja realmente limpar todos os dados?")) {
                            localStorage.removeItem('runtracker_trips');
                            localStorage.removeItem('runtracker_debts');
                            localStorage.removeItem('runtracker_salaries');
                            localStorage.removeItem('runtracker_inventory');
                            localStorage.removeItem('runtracker_receivables');
                            setTrips([]);
                            setDebts([]);
                            setSalaries([]);
                            setInventory([]);
                            setReceivables([]);
                          }
                        }}
                        className="w-full flex items-center justify-between p-4 bg-red-50/20 hover:bg-red-50/50 transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center">
                            <Trash2 size={16} />
                          </div>
                          <span className="text-xs font-bold text-red-500 uppercase tracking-tight">Apagar Histórico</span>
                        </div>
                        <ChevronRight size={14} className="text-red-200" />
                      </button>
                    </div>
                  </>
                ) : isEditingProfile ? (
                  <div className="space-y-4">
                    <button 
                      onClick={() => setIsEditingProfile(false)}
                      className="flex items-center gap-2 text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-2"
                    >
                      <ChevronRight size={14} className="rotate-180" />
                      Voltar
                    </button>
                    
                    <h2 className="text-lg font-extrabold text-gray-900 tracking-tight">Dados da Conta</h2>
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        const form = e.target as HTMLFormElement;
                        const name = (form.elements.namedItem('name') as HTMLInputElement).value;
                        const account = (form.elements.namedItem('account') as HTMLInputElement).value;
                        setUserProfile({ name, account });
                        setIsEditingProfile(false);
                      }}
                      className="space-y-4"
                    >
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 tracking-tight">Nome Completo</label>
                        <input 
                          name="name"
                          type="text" 
                          required
                          defaultValue={userProfile.name}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase ml-1 tracking-tight">Dados da Conta (Pix/Banco)</label>
                        <input 
                          name="account"
                          type="text" 
                          placeholder="Ex: Pix 123.456.789-00"
                          defaultValue={userProfile.account}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        />
                      </div>
                      <button 
                        type="submit"
                        className="w-full bg-blue-600 text-white rounded-xl py-4 text-xs font-bold uppercase tracking-tight shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-[0.98]"
                      >
                        Salvar Alterações
                      </button>
                    </form>
                  </div>
                ) : isManagingPlatforms ? (
                  <div className="space-y-4">
                    <button 
                      onClick={() => setIsManagingPlatforms(false)}
                      className="flex items-center gap-2 text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-2"
                    >
                      <ChevronRight size={14} className="rotate-180" />
                      Voltar
                    </button>
                    
                    <h2 className="text-lg font-extrabold text-gray-900 tracking-tight">Plataformas</h2>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight leading-relaxed">
                      Adicione ou remova as plataformas que você utiliza para trabalhar.
                    </p>

                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Nome da Plataforma"
                        value={newPlatform}
                        onChange={e => setNewPlatform(e.target.value)}
                        className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      />
                      <button 
                        onClick={addPlatform}
                        className="bg-blue-600 text-white p-3 rounded-xl shadow-lg shadow-blue-100 active:scale-95 transition-all"
                      >
                        <Plus size={20} />
                      </button>
                    </div>

                    <div className="space-y-2 mt-4">
                      {platforms.map(plat => (
                        <div key={plat} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
                          <span className="text-sm font-bold text-gray-700">{plat}</span>
                          <button 
                            onClick={() => removePlatform(plat)}
                            className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <button 
                      onClick={() => setIsManagingGoals(false)}
                      className="flex items-center gap-2 text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-2"
                    >
                      <ChevronRight size={14} className="rotate-180" />
                      Voltar
                    </button>
                    
                    <h2 className="text-lg font-extrabold text-gray-900 tracking-tight">Metas de Saldo</h2>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight leading-relaxed">
                      Defina suas metas mensais para cada categoria de saldo.
                    </p>

                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        const form = e.target as HTMLFormElement;
                        const deliveryGoal = Number((form.elements.namedItem('deliveryGoal') as HTMLInputElement).value);
                        const companyGoal = Number((form.elements.namedItem('companyGoal') as HTMLInputElement).value);
                        setUserProfile({ ...userProfile, deliveryGoal, companyGoal });
                        setIsManagingGoals(false);
                      }}
                      className="space-y-4 pt-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 mb-1 px-1">
                          <Bike size={12} className="text-orange-500" />
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Meta Saldo Entregas</label>
                        </div>
                        <input 
                          name="deliveryGoal"
                          type="number" 
                          step="0.01"
                          defaultValue={userProfile.deliveryGoal}
                          placeholder="Ex: 2500.00"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 mb-1 px-1">
                          <Briefcase size={12} className="text-blue-500" />
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Meta Saldo Empresa</label>
                        </div>
                        <input 
                          name="companyGoal"
                          type="number" 
                          step="0.01"
                          defaultValue={userProfile.companyGoal}
                          placeholder="Ex: 5000.00"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        />
                      </div>

                      <button 
                        type="submit"
                        className="w-full bg-blue-600 text-white rounded-xl py-4 text-xs font-bold uppercase tracking-tight shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-[0.98] mt-4"
                      >
                        Salvar Metas
                      </button>
                    </form>
                  </div>
                )}

                <div className="text-center pt-8">
                  <div className="h-1 w-12 bg-gray-200 rounded-full mx-auto mb-2"></div>
                  <p className="text-[8px] text-gray-300 font-bold uppercase tracking-[0.2em]">RunTracker Cloud Pro • 2026</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Edit Trip Modal */}
        <AnimatePresence>
          {editingTrip && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-4"
            >
              <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-gray-800">Editar Registro</h3>
                  <button onClick={() => setEditingTrip(null)} className="text-gray-400 hover:text-gray-600">
                    <Trash2 size={20} className="rotate-45" /> {/* Using Trash rotated as an X */}
                  </button>
                </div>

                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.currentTarget;
                    const updated: Trip = {
                      ...editingTrip,
                      platform: (form.elements.namedItem('platform') as HTMLInputElement).value,
                      earnings: Number((form.elements.namedItem('earnings') as HTMLInputElement).value),
                      kmStart: Number((form.elements.namedItem('kmStart') as HTMLInputElement).value),
                      kmEnd: Number((form.elements.namedItem('kmEnd') as HTMLInputElement).value),
                      fuelCost: Number((form.elements.namedItem('fuelCost') as HTMLInputElement).value),
                      date: (form.elements.namedItem('date') as HTMLInputElement).value,
                    };
                    updateTrip(updated);
                  }}
                  className="space-y-4"
                >
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Plataforma / Título</label>
                    <input name="platform" defaultValue={editingTrip.platform} required className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Ganhos R$</label>
                      <input name="earnings" type="number" step="0.01" defaultValue={editingTrip.earnings} required className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-emerald-600 focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Custo Comb.</label>
                      <input name="fuelCost" type="number" step="0.01" defaultValue={editingTrip.fuelCost} required className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-red-500 focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">KM Inicial</label>
                      <input name="kmStart" type="number" step="0.1" defaultValue={editingTrip.kmStart} required className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">KM Final</label>
                      <input name="kmEnd" type="number" step="0.1" defaultValue={editingTrip.kmEnd} required className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Data</label>
                    <input name="date" type="date" defaultValue={editingTrip.date} required className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button type="button" onClick={() => setEditingTrip(null)} className="flex-1 bg-gray-100 text-gray-500 rounded-xl py-3 text-sm font-bold hover:bg-gray-200 transition-all">
                      Cancelar
                    </button>
                    <button type="submit" className="flex-2 bg-blue-600 text-white rounded-xl py-3 text-sm font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all">
                      Salvar Alterações
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
          {editingDebt && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-4"
            >
              <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-gray-800">Editar Conta / Dívida</h3>
                  <button onClick={() => setEditingDebt(null)} className="text-gray-400 hover:text-gray-600">
                    <Trash2 size={20} className="rotate-45" />
                  </button>
                </div>

                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.currentTarget;
                    const updated: Debt = {
                      ...editingDebt,
                      title: (form.elements.namedItem('title') as HTMLInputElement).value,
                      value: Number((form.elements.namedItem('value') as HTMLInputElement).value),
                      dueDate: (form.elements.namedItem('dueDate') as HTMLInputElement).value,
                    };
                    updateDebt(updated);
                  }}
                  className="space-y-4"
                >
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Título da Conta</label>
                    <input name="title" defaultValue={editingDebt.title} required className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Valor R$</label>
                      <input name="value" type="number" step="0.01" defaultValue={editingDebt.value} required className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-red-500 focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Vencimento</label>
                      <input name="dueDate" type="date" defaultValue={editingDebt.dueDate} required className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button type="button" onClick={() => setEditingDebt(null)} className="flex-1 bg-gray-100 text-gray-500 rounded-xl py-3 text-sm font-bold hover:bg-gray-200 transition-all">
                      Cancelar
                    </button>
                    <button type="submit" className="flex-2 bg-blue-600 text-white rounded-xl py-3 text-sm font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all">
                      Salvar Alterações
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}

          {editingInventoryItem && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-4"
            >
              <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-gray-800">Editar Produto</h3>
                  <button onClick={() => setEditingInventoryItem(null)} className="text-gray-400 hover:text-gray-600">
                    <Trash2 size={20} className="rotate-45" />
                  </button>
                </div>

                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.currentTarget;
                    const updated: InventoryItem = {
                      ...editingInventoryItem,
                      name: (form.elements.namedItem('name') as HTMLInputElement).value,
                      quantity: Number((form.elements.namedItem('quantity') as HTMLInputElement).value),
                      minQuantity: Number((form.elements.namedItem('minQuantity') as HTMLInputElement).value),
                    };
                    updateInventoryItem(updated);
                  }}
                  className="space-y-4"
                >
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Nome do Produto</label>
                    <input name="name" defaultValue={editingInventoryItem.name} required className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-orange-500 outline-none" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Quantidade Atual</label>
                      <input name="quantity" type="number" defaultValue={editingInventoryItem.quantity} required className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-orange-500 outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Qtd Mínima</label>
                      <input name="minQuantity" type="number" defaultValue={editingInventoryItem.minQuantity} required className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-orange-500 outline-none" />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button type="button" onClick={() => setEditingInventoryItem(null)} className="flex-1 bg-gray-100 text-gray-500 rounded-xl py-3 text-sm font-bold hover:bg-gray-200 transition-all">
                      Cancelar
                    </button>
                    <button type="submit" className="flex-2 bg-orange-600 text-white rounded-xl py-3 text-sm font-bold shadow-lg shadow-orange-100 hover:bg-orange-700 active:scale-95 transition-all">
                      Salvar Alterações
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}

          {editingReceivable && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-4"
            >
              <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-gray-800">Editar Recebível</h3>
                  <button onClick={() => setEditingReceivable(null)} className="text-gray-400 hover:text-gray-600">
                    <Trash2 size={20} className="rotate-45" />
                  </button>
                </div>

                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.currentTarget;
                    const updated: Receivable = {
                      ...editingReceivable,
                      debtorName: (form.elements.namedItem('debtorName') as HTMLInputElement).value,
                      totalValue: Number((form.elements.namedItem('totalValue') as HTMLInputElement).value),
                      date: (form.elements.namedItem('date') as HTMLInputElement).value,
                    };
                    updateReceivable(updated);
                  }}
                  className="space-y-4"
                >
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Nome do Devedor</label>
                    <input name="debtorName" defaultValue={editingReceivable.debtorName} required className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Valor Total R$</label>
                      <input name="totalValue" type="number" step="0.01" defaultValue={editingReceivable.totalValue} required className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-emerald-600 focus:ring-2 focus:ring-emerald-500 outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Data Inicial</label>
                      <input name="date" type="date" defaultValue={editingReceivable.date} required className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none" />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button type="button" onClick={() => setEditingReceivable(null)} className="flex-1 bg-gray-100 text-gray-500 rounded-xl py-3 text-sm font-bold hover:bg-gray-200 transition-all">
                      Cancelar
                    </button>
                    <button type="submit" className="flex-2 bg-emerald-600 text-white rounded-xl py-3 text-sm font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-700 active:scale-95 transition-all">
                      Salvar Alterações
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Custom Scroll Controller Bar */}
        <div className="absolute right-2 top-24 bottom-24 w-6 flex flex-col items-center justify-center z-50 pointer-events-none">
          <div className="h-full w-1 bg-gray-200/30 rounded-full relative pointer-events-auto">
            <input 
              ref={scrollRef}
              type="range"
              min="0"
              max="100"
              step="0.1"
              defaultValue="0"
              onChange={(e) => {
                if (mainRef.current) {
                  const percentage = Number(e.target.value);
                  const scrollHeight = mainRef.current.scrollHeight - mainRef.current.clientHeight;
                  mainRef.current.scrollTop = (percentage / 100) * scrollHeight;
                }
              }}
              style={{
                writingMode: 'vertical-lr' as any,
                appearance: 'none',
                width: '6px',
                height: '100%',
                background: 'transparent',
                cursor: 'pointer'
              }}
              className="absolute -left-[2px] inset-0 z-10 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-10 [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:active:scale-110 transition-transform"
            />
          </div>
        </div>

        {/* Global Refresh Overlay (Visual Feedback Only) */}
        <AnimatePresence>
          {isRefreshing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-blue-500/10 backdrop-blur-[2px] z-[60] flex items-center justify-center pointer-events-none"
            >
              <div className="bg-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 border border-blue-100">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-black text-blue-600 uppercase tracking-widest">Atualizando Dados...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Nav Bar */}
        <nav className="absolute bottom-0 left-0 right-0 h-20 bg-white border-t border-gray-100 flex items-center justify-around px-4 z-50">
          <NavButton 
            active={activeTab === 'dash'} 
            onClick={() => setActiveTab('dash')} 
            icon={LayoutDashboard} 
            label="Home" 
          />
          <NavButton 
            active={activeTab === 'form'} 
            onClick={() => setActiveTab('form')} 
            icon={PlusCircle} 
            label="Kms" 
          />
          <NavButton 
            active={activeTab === 'history'} 
            onClick={() => setActiveTab('history')} 
            icon={History} 
            label="Viagens" 
          />
          <NavButton 
            active={activeTab === 'finance'} 
            onClick={() => setActiveTab('finance')} 
            icon={Wallet} 
            label="Ganhos" 
          />
          <NavButton 
            active={activeTab === 'receivables'} 
            onClick={() => setActiveTab('receivables')} 
            icon={HandCoins} 
            label="Me Deve" 
          />
          <NavButton 
            active={activeTab === 'salary'} 
            onClick={() => setActiveTab('salary')} 
            icon={Users} 
            label="Salários" 
          />
          <NavButton 
            active={activeTab === 'inventory'} 
            onClick={() => setActiveTab('inventory')} 
            icon={ShoppingCart} 
            label="Estoque" 
          />
          <NavButton 
            active={activeTab === 'profile'} 
            onClick={() => setActiveTab('profile')} 
            icon={User} 
            label="Perfil" 
          />
        </nav>

        {/* Home Indicator (Apple Style) */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-gray-200 rounded-full pointer-events-none"></div>
      </div>

      {/* Side Help/Notes (Desktop only) */}
      <div className="absolute right-10 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-4 w-64 text-[10px]">
        <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-200">
          <h4 className="font-bold text-blue-600 uppercase tracking-widest mb-4">Professional Polish</h4>
          <ul className="text-gray-500 space-y-3 font-semibold leading-relaxed">
            <li className="flex gap-2 underline underline-offset-4 decoration-blue-200">
              <span className="text-blue-500 font-black">●</span> 
              Bezel dark frame for app simulation.
            </li>
            <li className="flex gap-2">
              <span className="text-emerald-500 font-black">●</span> 
              Cards with soft blue/emerald highlights.
            </li>
            <li className="flex gap-2">
              <span className="text-gray-400 font-black">●</span> 
              Clean typography with tracking adjustments.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function NavButton({ active, onClick, icon: Icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 transition-all duration-300",
        active ? "text-blue-600 transform scale-105" : "text-gray-400"
      )}
    >
      <div className={cn(
        "w-6 h-6 rounded-md flex items-center justify-center transition-all",
        active ? "bg-blue-600 text-white shadow-lg shadow-blue-100" : "bg-gray-100"
      )}>
        <Icon size={14} strokeWidth={active ? 3 : 2} />
      </div>
      <span className={cn("text-[9px] font-bold uppercase tracking-tighter transition-all", active ? "opacity-100" : "opacity-60")}>
        {label}
      </span>
    </button>
  );
}

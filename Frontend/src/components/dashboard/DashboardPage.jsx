import React, { useEffect, useState, useMemo } from "react";
import {
  CreditCard,
  TrendingUp,
  ShoppingBag,
  Users,
  AlertTriangle,
  ArrowRight,
  RotateCw,
  Banknote,
  QrCode,
  Flame,
} from "lucide-react";
import { useApp } from "../../context/AppContext";

export default function DashboardPage({ setActiveTab }) {
  const { users = [], lowStockCount = 0, activeBranch = "Colombo - Head Office" } = useApp() || {};
  const [liveBills, setLiveBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [timeFilter, setTimeFilter] = useState("today");

  const handleNavigate = (tab) => {
    if (typeof setActiveTab === "function") {
      setActiveTab(tab);
    }
  };

  const fetchDashboardBills = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/bills");
      if (response.ok) {
        const result = await response.json();
        const billsData = Array.isArray(result) ? result : (result?.data || []);
        setLiveBills(billsData);
      }
    } catch (err) {
      console.error("[DashboardPage] Live bills fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardBills();
  }, []);

  const getBillAmount = (b) => Number(b.grandTotal ?? b.total ?? 0);

  const completedBills = useMemo(() => {
    return liveBills.filter((b) => !b.status || b.status === "Completed");
  }, [liveBills]);

  const filteredBills = useMemo(() => {
    if (timeFilter === "all") return completedBills;
    const todayStr = new Date().toDateString();
    return completedBills.filter((b) => {
      const billDate = b.createdAt ? new Date(b.createdAt).toDateString() : (b.date ? new Date(b.date).toDateString() : todayStr);
      return billDate === todayStr;
    });
  }, [completedBills, timeFilter]);

  const totalRevenue = useMemo(() => {
    return filteredBills.reduce((sum, b) => sum + getBillAmount(b), 0);
  }, [filteredBills]);

  const paymentBreakdown = useMemo(() => {
    let cash = 0;
    let card = 0;
    let qr = 0;
    filteredBills.forEach((b) => {
      const amt = getBillAmount(b);
      const method = (b.paymentMethod || "Cash").toLowerCase();
      if (method.includes("cash")) cash += amt;
      else if (method.includes("card")) card += amt;
      else if (method.includes("qr") || method.includes("lanka")) qr += amt;
      else cash += amt;
    });
    return { cash, card, qr };
  }, [filteredBills]);

  const topProducts = useMemo(() => {
    const itemMap = {};
    liveBills.forEach((b) => {
      if (Array.isArray(b.items)) {
        b.items.forEach((it) => {
          const name = it.name || "Product";
          const qty = Number(it.quantity || it.qty || 1);
          const val = Number(it.lineTotal || it.total || (it.price || it.unitPrice || 0) * qty);
          if (!itemMap[name]) {
            itemMap[name] = { name, qty: 0, val: 0 };
          }
          itemMap[name].qty += qty;
          itemMap[name].val += val;
        });
      }
    });

    const sorted = Object.values(itemMap).sort((a, b) => b.qty - a.qty);
    if (sorted.length > 0) return sorted.slice(0, 4);

    return [
      { name: "Basmati Rice 5kg", qty: 24, val: 12000 },
      { name: "Highland Fresh Full Cream", qty: 18, val: 8280 },
      { name: "Anchor Milk Powder 400g", qty: 14, val: 16100 },
      { name: "Dilmah Premium Tea 200g", qty: 9, val: 4140 },
    ];
  }, [liveBills]);

  const recentBills = liveBills.slice(0, 6);

  return (
    <div className="p-5 md:p-6 w-full max-w-[1700px] mx-auto space-y-5 animate-fade-in">
      {/* Welcome Header: Clean White Card with Blue Text */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5 transition-all">
        <div className="space-y-1.5">
          <div 
            style={{ backgroundColor: "#F0F5FA", borderColor: "#6B9CD2" }}
            className="inline-flex items-center gap-2 border px-3 py-1 rounded-full text-xs font-bold text-[#2B527E]"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Store Terminal • {activeBranch}
          </div>
          
          <h1 
            style={{ color: "#1E4976" }} 
            className="text-2xl md:text-3xl font-black tracking-tight"
          >
            Supermarket Operations Command
          </h1>
          
          <p className="text-slate-600 text-xs md:text-sm font-medium max-w-2xl leading-relaxed">
            Real-time cashier velocity, counter transactions, shelf inventory health, and register settlement for EgoTech World.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={fetchDashboardBills}
            disabled={loading}
            className="bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-700 font-bold px-4 py-2.5 rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer border border-slate-200 shadow-2xs"
            title="Refresh Live Data"
          >
            <RotateCw size={15} className={loading ? "animate-spin text-[#5A8BC1]" : ""} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => handleNavigate("pos")}
            className="bg-[#5A8BC1] hover:bg-[#4A7BB0] active:bg-[#3B6A9E] text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-sm hover:shadow transition-all flex items-center gap-2 cursor-pointer"
          >
            <CreditCard size={16} />
            <span>Launch POS Register</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4.5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {timeFilter === "today" ? "Today's Revenue" : "Total Revenue"}
              </span>
              <button 
                onClick={() => setTimeFilter(prev => prev === "today" ? "all" : "today")}
                className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#F4F8FC] text-[#3B6A9E] border border-[#6B9CD2]/30 hover:bg-[#E2EDF8] cursor-pointer"
              >
                {timeFilter === "today" ? "Today" : "All Time"}
              </button>
            </div>
            <p className="text-2xl font-black text-slate-900 mt-2 font-mono tracking-tight">
              Rs. {totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-1 font-bold text-emerald-600">
              <TrendingUp size={13} /> Live synced
            </span>
            <span className="text-[11px] font-semibold text-slate-400">Terminal #01</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4.5 shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Counter Checkouts
            </p>
            <p className="text-2xl font-black text-slate-900 mt-1.5 font-mono tracking-tight">
              {filteredBills.length} Bills
            </p>
            <span className="text-xs font-bold text-slate-500 mt-1.5 block">
              100% register uptime
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ShoppingBag size={22} />
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4.5 shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Cashiers & Staff
            </p>
            <p className="text-2xl font-black text-slate-900 mt-1.5 font-mono tracking-tight">
              {users && users.length > 0 ? users.filter((u) => u.status === "Active").length : 8} Active
            </p>
            <span className="text-xs font-bold text-slate-500 mt-1.5 block">
              Across shifts today
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Users size={22} />
          </div>
        </div>

        <div
          onClick={() => handleNavigate("inventory")}
          className="bg-white border border-slate-200/90 hover:border-amber-400 rounded-2xl p-4.5 shadow-xs flex items-center justify-between cursor-pointer group transition-all hover:shadow-md"
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Low Stock Warnings
            </p>
            <p className="text-2xl font-black text-rose-600 mt-1.5 font-mono tracking-tight">
              {lowStockCount} SKUs
            </p>
            <span className="text-xs font-bold text-amber-600 mt-1.5 group-hover:underline flex items-center gap-1">
              Replenish inventory <ArrowRight size={12} />
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-colors flex items-center justify-center shrink-0">
            <AlertTriangle size={22} />
          </div>
        </div>
      </div>

      {/* Register Drawer Settlement */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Register Drawer Settlement (Tender Breakdown)
            </h4>
            <p className="text-[11px] text-slate-400">Cash vs Electronic receipts for day-end reconciliation</p>
          </div>
          <span className="text-xs font-bold text-[#2B527E] bg-[#F4F8FC] px-3 py-1 rounded-lg">
            Settlement Total: Rs. {totalRevenue.toFixed(2)}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
          <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center">
                <Banknote size={16} />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-emerald-800">Cash in Drawer</span>
                <p className="text-sm font-extrabold font-mono text-emerald-950">Rs. {paymentBreakdown.cash.toFixed(2)}</p>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-700">{totalRevenue > 0 ? Math.round((paymentBreakdown.cash / totalRevenue) * 100) : 0}%</span>
          </div>

          <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#5A8BC1] text-white flex items-center justify-center">
                <CreditCard size={16} />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-[#1E4976]">Card Terminal</span>
                <p className="text-sm font-extrabold font-mono text-[#1E4976]">Rs. {paymentBreakdown.card.toFixed(2)}</p>
              </div>
            </div>
            <span className="text-xs font-bold text-[#2B527E]">{totalRevenue > 0 ? Math.round((paymentBreakdown.card / totalRevenue) * 100) : 0}%</span>
          </div>

          <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500 text-white flex items-center justify-center">
                <QrCode size={16} />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-indigo-800">LankaQR & UPI</span>
                <p className="text-sm font-extrabold font-mono text-indigo-950">Rs. {paymentBreakdown.qr.toFixed(2)}</p>
              </div>
            </div>
            <span className="text-xs font-bold text-indigo-700">{totalRevenue > 0 ? Math.round((paymentBreakdown.qr / totalRevenue) * 100) : 0}%</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm md:text-base">Hourly Sales Velocity</h3>
              <p className="text-xs font-medium text-slate-500">Customer checkout volume across today's operating hours</p>
            </div>
            <span 
              style={{ color: "#2B527E", backgroundColor: "#F4F8FC", borderColor: "rgba(107, 156, 210, 0.4)" }}
              className="text-xs font-bold border px-3 py-1 rounded-xl"
            >
              Peak: 09:00 - 11:00 AM
            </span>
          </div>

          <div className="h-40 flex items-end justify-between gap-2 pt-4 pb-2 px-2 border-b border-slate-100">
            {[
              { time: "08 AM", height: "35%", val: "Rs. 2.4k" },
              { time: "09 AM", height: "85%", val: "Rs. 8.2k" },
              { time: "10 AM", height: "95%", val: "Rs. 9.1k" },
              { time: "11 AM", height: "65%", val: "Rs. 5.8k" },
              { time: "12 PM", height: "50%", val: "Rs. 4.6k" },
              { time: "01 PM", height: "45%", val: "Rs. 3.9k" },
              { time: "02 PM", height: "60%", val: "Rs. 5.2k" },
              { time: "03 PM", height: "70%", val: "Rs. 6.4k" },
              { time: "04 PM", height: "80%", val: "Rs. 7.5k" },
              { time: "05 PM", height: "90%", val: "Rs. 8.8k" },
            ].map((bar, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 group">
                <div className="w-full bg-slate-100 hover:bg-blue-50 rounded-t-lg h-32 flex items-end justify-center overflow-hidden p-0.5">
                  <div
                    className="w-full hover:opacity-85 rounded-t-md transition-all relative"
                    style={{ height: bar.height, backgroundColor: "#5A8BC1" }}
                    title={bar.val}
                  />
                </div>
                <span className="text-[11px] font-bold text-slate-500 group-hover:text-[#5A8BC1]">
                  {bar.time}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-1">
            <div className="flex items-center gap-1.5 mb-2">
              <Flame size={15} className="text-amber-500" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Today's Fast-Moving Products</h4>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {topProducts.map((p, i) => (
                <div key={i} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
                  <p className="text-xs font-bold text-slate-800 truncate">{p.name}</p>
                  <p className="text-[11px] font-bold text-[#2B527E] mt-0.5 font-mono">{p.qty} Units Sold</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm md:text-base">Top Revenue Categories</h3>
            <p className="text-xs font-medium text-slate-500 mb-3">Contribution by supermart department</p>

            <div className="space-y-3">
              {[
                { name: "Groceries & Staples", share: 38, hex: "#5A8BC1" },
                { name: "Dairy & Eggs", share: 24, hex: "#10B981" },
                { name: "Beverages", share: 18, hex: "#F59E0B" },
                { name: "Bakery & Confectionery", share: 12, hex: "#A855F7" },
                { name: "Household & Care", share: 8, hex: "#EC4899" },
              ].map((cat) => (
                <div key={cat.name} className="space-y-1 text-xs">
                  <div className="flex justify-between font-bold">
                    <span className="text-slate-800">{cat.name}</span>
                    <span className="font-mono font-extrabold text-slate-900">{cat.share}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all" 
                      style={{ width: `${cat.share}%`, backgroundColor: cat.hex }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-slate-100">
            <button
              onClick={() => handleNavigate("reports")}
              style={{ color: "#2B527E" }}
              className="w-full text-center text-xs font-bold hover:underline cursor-pointer"
            >
              View Detailed Analytics →
            </button>
          </div>
        </div>
      </div>

      {/* Recent Sales Ledger */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3.5">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm md:text-base">Recent Counter Checkouts</h3>
            <p className="text-xs font-medium text-slate-500">Latest completed sales bills at register stations</p>
          </div>
          <button
            onClick={() => handleNavigate("bills")}
            style={{ color: "#2B527E" }}
            className="text-xs font-bold hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View Full Ledger</span> <ArrowRight size={13} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 uppercase font-bold text-[11px] tracking-wider">
              <tr>
                <th className="px-4 py-3 rounded-l-xl">Invoice</th>
                <th className="px-4 py-3">Date & Time</th>
                <th className="px-4 py-3">Branch</th>
                <th className="px-4 py-3">Cashier</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3 rounded-r-xl">Payment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentBills.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-5 text-center font-medium text-slate-400">
                    No transactions found.
                  </td>
                </tr>
              ) : (
                recentBills.map((b, index) => {
                  const invNumber = b.invoiceNumber || b.billNumber || b.transactionId || b.id || `TXN-${index}`;
                  const amount = getBillAmount(b);
                  const itemCount = Array.isArray(b.items) ? b.items.length : 0;
                  const dateDisplay = b.date || (b.createdAt ? new Date(b.createdAt).toLocaleString() : "Recent");

                  return (
                    <tr key={b._id || b.id || invNumber || index} className="hover:bg-slate-50/70 transition-colors">
                      <td style={{ color: "#2B527E" }} className="px-4 py-3 font-extrabold font-mono">{invNumber}</td>
                      <td className="px-4 py-3 font-medium text-slate-600">{dateDisplay}</td>
                      <td className="px-4 py-3 font-semibold text-slate-800">{b.branch || "Head Office"}</td>
                      <td className="px-4 py-3 font-medium text-slate-700">{b.cashierName || b.cashier || "Cashier"}</td>
                      <td className="px-4 py-3 font-bold text-slate-600">{itemCount} items</td>
                      <td className="px-4 py-3 font-black font-mono text-slate-900 text-sm">
                        Rs. {amount.toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-[11px]">
                          {b.paymentMethod || "Cash"}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
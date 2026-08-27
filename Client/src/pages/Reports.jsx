import { useEffect, useMemo, useState } from "react";
import { Droplets, IndianRupee, WalletCards, UserRound, CalendarDays, Store, Plus } from "lucide-react";
import api from "../lib/api";

const currentMonth = new Date().toISOString().slice(0, 7);
const today = new Date().toISOString().slice(0, 10);

export default function Reports() {
  const [date, setDate] = useState(today);
  const [dailyReport, setDailyReport] = useState(null);
  const [month, setMonth] = useState(currentMonth);
  const [customers, setCustomers] = useState([]);
  const [customerId, setCustomerId] = useState("");
  const [monthly, setMonthly] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadDaily() {
      try {
        const response = await api.get("/reports/daily", { params: { date } });
        setDailyReport(response.data);
      } catch (error) {
        console.error("Daily report error:", error);
      }
    }
    loadDaily();
  }, [date]);

  useEffect(() => {
    async function loadCustomers() {
      try {
        const response = await api.get("/customers");
        setCustomers(response.data);
        if (!customerId && response.data.length) setCustomerId(response.data[0]._id);
      } catch (error) {
        console.error("Customer report load error:", error);
      }
    }
    loadCustomers();
  }, []);

  useEffect(() => {
    async function loadCustomerReport() {
      if (!customerId) return;
      try {
        setLoading(true);
        const [monthlyResponse, historyResponse] = await Promise.all([
          api.get("/reports/monthly", { params: { month, customerId } }),
          api.get(`/reports/customer-history/${customerId}`),
        ]);
        setMonthly(monthlyResponse.data);
        setHistory(historyResponse.data.history || []);
      } catch (error) {
        console.error("Customer monthly report error:", error);
      } finally {
        setLoading(false);
      }
    }
    loadCustomerReport();
  }, [customerId, month]);

  const selectedCustomer = useMemo(
    () => customers.find((customer) => customer._id === customerId),
    [customers, customerId],
  );

  const totalValue = dailyReport?.total?.amount || 0;
  const paid = dailyReport?.total?.paid || 0;
  const pending = dailyReport?.total?.pending || 0;
  const dailyRegularLitres =
    Number(dailyReport?.morning?.litres || 0) + Number(dailyReport?.evening?.litres || 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[.2em] text-black/35">Ledger</p>
          <h1 className="mt-1 text-4xl font-black tracking-tight">Reports</h1>
          <p className="mt-1 text-sm font-semibold text-black/40">Daily route and customer history.</p>
        </div>
        <label className="rounded-2xl bg-white px-4 py-3 shadow-sm">
          <span className="mr-2 text-xs font-black uppercase tracking-wider text-black/35">Day</span>
          <input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="text-sm font-black outline-none" />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric icon={<Droplets />} title="Milk" value={`${dailyReport?.total?.litres || 0} L`} />
        <Metric icon={<IndianRupee />} title="Sales" value={`₹${totalValue}`} />
        <Metric icon={<WalletCards />} title="Collected" value={`₹${paid}`} />
        <Metric icon={<WalletCards />} title="Pending" value={`₹${pending}`} />
      </div>

      <section className="overflow-hidden rounded-[28px] bg-white shadow-soft">
        <div className="border-b border-black/5 bg-cream p-5">
          <p className="text-xs font-black uppercase tracking-widest text-black/35">Daily breakdown</p>
          <h2 className="mt-1 text-xl font-black">Where today&apos;s milk went</h2>
        </div>

        <div className="grid gap-3 p-4 sm:grid-cols-2">
          <Breakdown title="Morning" value={`${dailyReport?.morning?.litres || 0} L`} amount={`₹${dailyReport?.morning?.amount || 0}`} />
          <Breakdown title="Evening" value={`${dailyReport?.evening?.litres || 0} L`} amount={`₹${dailyReport?.evening?.amount || 0}`} />
          <Breakdown title="Occasional" value={`${dailyReport?.occasional?.litres || 0} L`} amount={`₹${dailyReport?.occasional?.amount || 0}`} />
          <Breakdown title="Milk booth" value={dailyReport?.booth?.litres != null ? `${dailyReport.booth.litres} L` : "Quantity unknown"} amount={`₹${dailyReport?.booth?.amount || 0}`} icon={<Store size={17} />} />
        </div>

        <div className="border-t border-black/5 p-5 text-sm font-bold text-black/50">
          Regular customer milk: <span className="font-black text-ink">{dailyRegularLitres} L</span>
          <span className="mx-2">·</span>
          Occasional: <span className="font-black text-ink">{dailyReport?.occasional?.litres || 0} L</span>
          <span className="mx-2">·</span>
          Booth: <span className="font-black text-ink">₹{dailyReport?.booth?.amount || 0}</span>
        </div>
      </section>

      <section className="rounded-[28px] bg-ink p-5 text-black shadow-soft sm:p-6">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10"><CalendarDays size={20} /></div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-white/45">Monthly customer statement</p>
            <h2 className="mt-1 text-xl font-black">Choose customer + month</h2>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <label>
            <span className="mb-2 block text-xs font-black uppercase tracking-wider text-black">Customer</span>
            <select value={customerId} onChange={(event) => setCustomerId(event.target.value)} className="w-full rounded-2xl bg-white px-4 py-3 font-black text-ink">
              {customers.map((customer) => <option key={customer._id} value={customer._id}>{customer.name}</option>)}
            </select>
          </label>
          <label>
            <span className="mb-2 block text-xs font-black uppercase tracking-wider text-white/45">Month</span>
            <input type="month" value={month} onChange={(event) => setMonth(event.target.value)} className="w-full rounded-2xl bg-white px-4 py-3 font-black text-ink" />
          </label>
        </div>
      </section>

      {monthly && (
        <section className="space-y-4">
          <div className="rounded-[28px] bg-white p-5 shadow-soft">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-sky font-black">
                {selectedCustomer?.name?.slice(0, 1).toUpperCase() || "C"}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-widest text-black/35">{month}</p>
                <h2 className="truncate text-2xl font-black">{monthly.customer?.name || "Customer"}</h2>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <CustomerMetric label="Morning" value={`${monthly.summary.morningLitres} L`} />
              <CustomerMetric label="Evening" value={`${monthly.summary.eveningLitres} L`} />
              <CustomerMetric label="Occasional" value={`${monthly.summary.occasionalLitres} L`} />
              <CustomerMetric label="Total" value={`${monthly.summary.litres} L`} />
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <CustomerMetric label="Amount" value={`₹${monthly.summary.amount}`} />
              <CustomerMetric label="Paid" value={`₹${monthly.summary.paid}`} />
              <CustomerMetric label="Pending" value={`₹${monthly.summary.pending}`} />
            </div>
          </div>

          <div className="rounded-[28px] bg-white shadow-soft">
            <div className="flex items-center justify-between border-b border-black/5 p-5">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-black/35">All months</p>
                <h2 className="mt-1 text-xl font-black">Customer history</h2>
              </div>
              <UserRound size={20} className="text-black/30" />
            </div>

            {loading ? (
              <div className="p-8 text-center text-sm font-bold text-black/35">Loading history...</div>
            ) : history.length === 0 ? (
              <div className="p-8 text-center text-sm font-bold text-black/35">No previous milk records found.</div>
            ) : (
              <div className="divide-y divide-black/5">
                {history.map((item) => (
                  <button key={item.month} type="button" onClick={() => setMonth(item.month)} className={`flex w-full items-center gap-4 p-4 text-left transition hover:bg-cream/70 ${item.month === month ? "bg-cream/60" : ""}`}>
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cream"><CalendarDays size={16} /></div>
                    <div className="min-w-0 flex-1">
                      <div className="font-black">{formatMonth(item.month)}</div>
                      <div className="text-xs font-semibold text-black/40">{item.morningLitres} L AM · {item.eveningLitres} L PM · {item.occasionalLitres} L extra</div>
                    </div>
                    <div className="text-right">
                      <div className="font-black">₹{item.amount}</div>
                      <div className="text-xs font-bold text-black/35">{item.litres} L</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

function Metric({ icon, title, value }) {
  return (
    <div className="rounded-[26px] bg-white p-5 shadow-soft">
      <div className="mb-4 grid h-10 w-10 place-items-center rounded-xl bg-cream">{icon}</div>
      <div className="text-xs font-black uppercase tracking-widest text-black/35">{title}</div>
      <div className="mt-1 text-3xl font-black">{value}</div>
    </div>
  );
}

function Breakdown({ title, value, amount, icon }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-cream p-4">
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-white">{icon || <Droplets size={17} />}</div>
      <div className="min-w-0 flex-1">
        <div className="font-black">{title}</div>
        <div className="text-xs font-semibold text-black/40">{value}</div>
      </div>
      <div className="font-black">{amount}</div>
    </div>
  );
}

function CustomerMetric({ label, value }) {
  return (
    <div className="rounded-2xl bg-cream p-4">
      <div className="text-xs font-black uppercase tracking-wider text-black/35">{label}</div>
      <div className="mt-1 text-xl font-black">{value}</div>
    </div>
  );
}

function formatMonth(value) {
  const [year, month] = value.split("-");
  return new Date(Number(year), Number(month) - 1, 1).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
}

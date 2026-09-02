import { useEffect, useMemo, useState } from "react";
import {
  IndianRupee,
  Droplets,
  Users,
  TrendingUp,
  Milk,
  Plus,
  Store,
  X,
  Minus,
} from "lucide-react";

import api from "../lib/api";
import StatCard from "../components/StatCard";
import SessionCard from "../components/SessionCard";

const today = new Date().toISOString().slice(0, 10);

const emptyOccasional = {
  customerId: "",
  session: "morning",
  litres: 1,
  paid: true,
  note: "",
};

const emptyBooth = {
  amount: "",
  litres: "",
  paid: true,
  note: "",
};

export default function Dashboard() {
  const [date, setDate] = useState(today);
  const [customers, setCustomers] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [report, setReport] = useState(null);
  const [occasionalSales, setOccasionalSales] = useState([]);
  const [booth, setBooth] = useState(null);
  const [showOccasional, setShowOccasional] = useState(false);
  const [showBooth, setShowBooth] = useState(false);
  const [occasionalForm, setOccasionalForm] = useState(emptyOccasional);
  const [boothForm, setBoothForm] = useState(emptyBooth);
  const [savingExtra, setSavingExtra] = useState(false);

  async function loadDashboard() {
    try {
      const [customerResponse, deliveryResponse, reportResponse, occasionalResponse, boothResponse] =
        await Promise.all([
          api.get("/customers"),
          api.get("/deliveries", { params: { date } }),
          api.get("/reports/daily", { params: { date } }),
          api.get("/occasional-sales", { params: { date } }),
          api.get("/booth-sales", { params: { date } }),
        ]);

      setCustomers(customerResponse.data);
      setDeliveries(deliveryResponse.data);
      setReport(reportResponse.data);
      setOccasionalSales(occasionalResponse.data);
      setBooth(boothResponse.data[0] || null);
    } catch (error) {
      console.error("Dashboard load error:", error);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, [date]);

function buildSession(session) {
  return customers
    .filter((customer) => {
      const sessionData = customer?.[session];

      console.log(
        `${session} customer:`,
        customer.name,
        sessionData
      );

      return (
        customer.active !== false &&
        sessionData &&
        sessionData.enabled === true
      );
    })
    .map((customer) => {
      const delivery = deliveries.find(
        (item) =>
          item.customerId?._id === customer._id &&
          item.session === session
      );

      const configuredLitres = Number(
        customer?.[session]?.litres || 0
      );

      return {
        ...customer,

        delivered:
          delivery?.delivered ?? false,

        litres: configuredLitres,

        paid:
          delivery?.paid ?? false,

        deliveryId:
          delivery?._id || null,

        deliveredLitres:
          Number(delivery?.litres || 0),
      };
    });
}

  const morning = useMemo(() => buildSession("morning"), [customers, deliveries]);
  const evening = useMemo(() => buildSession("evening"), [customers, deliveries]);

  async function toggleDelivery(customer, session) {
    try {
      const existing = deliveries.find(
        (item) =>
          item.customerId?._id === customer._id &&
          item.session === session,
      );

      const regularLitres = Number(customer[session]?.litres || 0);
      const nextDelivered = !customer.delivered;

      await api.post("/deliveries/mark", {
        customerId: customer._id,
        date,
        session,
        litres: regularLitres,
        delivered: nextDelivered,
        paid: existing?.paid ?? false,
      });

      await loadDashboard();
    } catch (error) {
      console.error("Toggle delivery error:", error);
    }
  }

  async function markAllSession(session, customersList) {
    try {
      const pendingCustomers = customersList.filter(
        (customer) => !customer.delivered,
      );

      if (pendingCustomers.length === 0) return;

      await Promise.all(
        pendingCustomers.map((customer) =>
          api.post("/deliveries/mark", {
            customerId: customer._id,
            date,
            session,
            litres: Number(customer[session]?.litres || 0),
            delivered: true,
            paid: false,
          }),
        ),
      );

      await loadDashboard();
    } catch (error) {
      console.error("Mark all delivery error:", error);
    }
  }

  function openOccasional() {
    setOccasionalForm({
      ...emptyOccasional,
      customerId: customers[0]?._id || "",
    });
    setShowOccasional(true);
  }

  function openBooth() {
    setBoothForm({
      amount: booth?.amount ?? "",
      litres: booth?.litres ?? "",
      paid: booth?.paid ?? true,
      note: booth?.note ?? "",
    });
    setShowBooth(true);
  }

  async function saveOccasional(event) {
    event.preventDefault();
    if (!occasionalForm.customerId || Number(occasionalForm.litres) <= 0) return;

    try {
      setSavingExtra(true);
      await api.post("/occasional-sales", {
        ...occasionalForm,
        date,
        litres: Number(occasionalForm.litres),
      });
      setShowOccasional(false);
      await loadDashboard();
    } catch (error) {
      console.error("Occasional sale error:", error);
    } finally {
      setSavingExtra(false);
    }
  }

  async function saveBooth(event) {
    event.preventDefault();
    if (boothForm.amount === "" || Number(boothForm.amount) < 0) return;

    try {
      setSavingExtra(true);
      await api.put("/booth-sales", {
        date,
        amount: Number(boothForm.amount),
        litres: boothForm.litres === "" ? null : Number(boothForm.litres),
        paid: boothForm.paid,
        note: boothForm.note,
      });
      setShowBooth(false);
      await loadDashboard();
    } catch (error) {
      console.error("Booth sale error:", error);
    } finally {
      setSavingExtra(false);
    }
  }

  async function deleteOccasional(id) {
    try {
      await api.delete(`/occasional-sales/${id}`);
      await loadDashboard();
    } catch (error) {
      console.error(error);
    }
  }

  const totalValue = report?.total?.amount || 0;
  const paid = report?.total?.paid || 0;
  const pending = report?.total?.pending || 0;
  const regularLitres =
    Number(report?.morning?.litres || 0) + Number(report?.evening?.litres || 0);
  const occasionalLitres = Number(report?.occasional?.litres || 0);
  const collectionPercentage =
    totalValue > 0 ? Math.min(100, Math.round((paid / totalValue) * 100)) : 0;

  return (
    <div className="space-y-6">
      <section className="grain overflow-hidden rounded-[32px] bg-ink p-6 text-black shadow-soft sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[.25em] text-gray-500">
              Today&apos;s route
            </p>
            <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">
              Milk, marked.
            </h1>
            <p className="mt-2 max-w-xl text-sm font-medium text-gray-300">
              Mark regular deliveries, add occasional milk, and record whatever
              remaining milk is sold to the booth.
            </p>
          </div>

          <div className="rounded-2xl bg-white/10 p-1">
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="rounded-xl bg-transparent px-3 py-2 text-sm font-bold text-white outline-none"
            />
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Milk" value={`${report?.total?.litres || 0} L`} sub="regular + occasional" tone="sky" icon={<Droplets size={18} />} />
        <StatCard label="Today&apos;s value" value={`₹${totalValue}`} sub="customer + booth sales" tone="leaf" icon={<IndianRupee size={18} />} />
        <StatCard label="Collected" value={`₹${paid}`} sub="cash received" tone="amber" icon={<TrendingUp size={18} />} />
        <StatCard label="Pending" value={`₹${pending}`} sub="cash still to collect" icon={<Users size={18} />} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SessionCard
          title="Morning milk"
          customers={morning}
          onToggle={(customer) => toggleDelivery(customer, "morning")}
          onMarkAll={() => markAllSession("morning", morning)}
        />
        <SessionCard
          title="Evening milk"
          customers={evening}
          onToggle={(customer) => toggleDelivery(customer, "evening")}
          onMarkAll={() => markAllSession("evening", evening)}
        />
      </div>

      <section className="rounded-[28px] bg-white p-5 shadow-soft">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-black/35">Extra milk</p>
            <h3 className="mt-1 text-xl font-black">Occasional sales & booth</h3>
            <p className="mt-1 text-xs font-semibold text-black/40">
              Regular: {regularLitres} L · Occasional: {occasionalLitres} L
              {booth?.amount != null ? ` · Booth: ₹${booth.amount}` : " · Booth not recorded"}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={openOccasional} className="tap flex items-center gap-2 rounded-2xl bg-ink px-4 py-3 text-xs font-black text-black">
              <Plus size={16} /> Occasional
            </button>
            <button type="button" onClick={openBooth} className="tap flex items-center gap-2 rounded-2xl bg-cream px-4 py-3 text-xs font-black text-ink">
              <Store size={16} /> Booth sale
            </button>
          </div>
        </div>

        {occasionalSales.length > 0 && (
          <div className="mt-5 space-y-2">
            {occasionalSales.map((sale) => (
              <div key={sale._id} className="flex items-center gap-3 rounded-2xl bg-cream p-3">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-sky font-black">
                  {sale.customerId?.name?.slice(0, 1).toUpperCase() || "C"}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-black">{sale.customerId?.name || "Customer"}</div>
                  <div className="text-xs font-semibold text-black/40">
                    {sale.litres} L · ₹{sale.amount} · {sale.session === "morning" ? "Morning" : "Evening"}
                  </div>
                </div>
                <button type="button" onClick={() => deleteOccasional(sale._id)} className="grid h-9 w-9 place-items-center rounded-xl bg-white text-black/40" aria-label="Delete occasional sale">
                  <X size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-[28px] bg-white p-5 shadow-soft">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-black/35">Daily pulse</p>
            <h3 className="mt-1 text-xl font-black">₹{totalValue} total sales today</h3>
          </div>
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-ink text-white">
            <Milk size={20} />
          </div>
        </div>

        <div className="mt-5 h-3 overflow-hidden rounded-full bg-black/5">
          <div className="h-full rounded-full bg-ink transition-all" style={{ width: `${collectionPercentage}%` }} />
        </div>
        <div className="mt-2 flex justify-between text-xs font-bold text-black/40">
          <span>Cash collected</span>
          <span>{collectionPercentage}%</span>
        </div>
      </section>

      {showOccasional && (
        <Modal title="Occasional milk" onClose={() => setShowOccasional(false)}>
          <form onSubmit={saveOccasional} className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-xs font-black uppercase tracking-wider text-black/45">Customer</span>
              <select value={occasionalForm.customerId} onChange={(event) => setOccasionalForm({ ...occasionalForm, customerId: event.target.value })} className="w-full rounded-2xl bg-cream px-4 py-3 font-bold">
                {customers.map((customer) => <option key={customer._id} value={customer._id}>{customer.name}</option>)}
              </select>
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-xs font-black uppercase tracking-wider text-black/45">Session</span>
                <select value={occasionalForm.session} onChange={(event) => setOccasionalForm({ ...occasionalForm, session: event.target.value })} className="w-full rounded-2xl bg-cream px-4 py-3 font-bold">
                  <option value="morning">Morning</option>
                  <option value="evening">Evening</option>
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-black uppercase tracking-wider text-black/45">Extra litres</span>
                <div className="flex rounded-2xl bg-cream p-1">
                  <button type="button" onClick={() => setOccasionalForm({ ...occasionalForm, litres: Math.max(0.25, Number(occasionalForm.litres) - 0.25) })} className="grid h-11 w-11 place-items-center rounded-xl bg-white"><Minus size={16} /></button>
                  <input type="number" min="0.25" step="0.25" value={occasionalForm.litres} onChange={(event) => setOccasionalForm({ ...occasionalForm, litres: Number(event.target.value) })} className="w-full bg-transparent text-center font-black outline-none" />
                  <button type="button" onClick={() => setOccasionalForm({ ...occasionalForm, litres: Number(occasionalForm.litres) + 0.25 })} className="grid h-11 w-11 place-items-center rounded-xl bg-white"><Plus size={16} /></button>
                </div>
              </label>
            </div>

            <label className="flex items-center gap-3 rounded-2xl bg-cream p-4">
              <input type="checkbox" checked={occasionalForm.paid} onChange={(event) => setOccasionalForm({ ...occasionalForm, paid: event.target.checked })} className="h-5 w-5" />
              <span className="text-sm font-black">Paid now</span>
            </label>

            <textarea placeholder="Optional note" value={occasionalForm.note} onChange={(event) => setOccasionalForm({ ...occasionalForm, note: event.target.value })} className="min-h-20 w-full rounded-2xl bg-cream px-4 py-3 font-bold" />

            <button disabled={savingExtra} className="tap w-full rounded-2xl bg-ink px-5 py-3 font-black text-white disabled:opacity-50">
              {savingExtra ? "Saving..." : "Record occasional milk"}
            </button>
          </form>
        </Modal>
      )}

      {showBooth && (
        <Modal title="Milk booth sale" onClose={() => setShowBooth(false)}>
          <form onSubmit={saveBooth} className="space-y-4">
            <div className="rounded-2xl bg-cream p-4">
              <p className="text-xs font-black uppercase tracking-wider text-black/40">Remaining milk</p>
              <p className="mt-1 text-sm font-semibold text-black/55">You do not need to know the exact remaining litres.</p>
            </div>

            <label className="block">
              <span className="mb-2 block text-xs font-black uppercase tracking-wider text-black/45">Booth amount received</span>
              <div className="flex items-center rounded-2xl bg-cream px-4">
                <IndianRupee size={17} className="text-black/40" />
                <input autoFocus type="number" min="0" step="1" required value={boothForm.amount} onChange={(event) => setBoothForm({ ...boothForm, amount: event.target.value })} placeholder="Example: 800" className="w-full bg-transparent px-2 py-3 font-black outline-none" />
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-black uppercase tracking-wider text-black/45">Litres (optional)</span>
              <input type="number" min="0" step="0.25" value={boothForm.litres} onChange={(event) => setBoothForm({ ...boothForm, litres: event.target.value })} placeholder="Leave empty if unknown" className="w-full rounded-2xl bg-cream px-4 py-3 font-black" />
            </label>

            <label className="flex items-center gap-3 rounded-2xl bg-cream p-4">
              <input type="checkbox" checked={boothForm.paid} onChange={(event) => setBoothForm({ ...boothForm, paid: event.target.checked })} className="h-5 w-5" />
              <span className="text-sm font-black">Booth paid today</span>
            </label>

            <textarea placeholder="Optional note" value={boothForm.note} onChange={(event) => setBoothForm({ ...boothForm, note: event.target.value })} className="min-h-20 w-full rounded-2xl bg-cream px-4 py-3 font-bold" />

            <button disabled={savingExtra} className="tap w-full rounded-2xl bg-ink px-5 py-3 font-black text-black disabled:opacity-50">
              {savingExtra ? "Saving..." : booth ? "Update booth sale" : "Record booth sale"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/45 p-0 sm:items-center sm:p-4">
      <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-[30px] bg-white p-5 shadow-2xl sm:max-w-lg sm:rounded-[30px]">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-black">{title}</h2>
          <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-xl bg-cream"><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

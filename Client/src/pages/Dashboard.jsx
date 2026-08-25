import {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  IndianRupee,
  Droplets,
  Users,
  TrendingUp,
  Milk
} from "lucide-react";

import api from "../lib/api";

import StatCard from "../components/StatCard";
import SessionCard from "../components/SessionCard";


const today =
  new Date()
    .toISOString()
    .slice(0, 10);


export default function Dashboard() {

  const [date, setDate] =
    useState(today);

  const [customers, setCustomers] =
    useState([]);

  const [deliveries, setDeliveries] =
    useState([]);

  const [report, setReport] =
    useState(null);


  async function loadDashboard() {

    try {

      const [
        customerResponse,
        deliveryResponse,
        reportResponse
      ] = await Promise.all([

        api.get("/customers"),

        api.get(
          "/deliveries",
          {
            params: { date }
          }
        ),

        api.get(
          "/reports/daily",
          {
            params: { date }
          }
        )

      ]);


      setCustomers(
        customerResponse.data
      );

      setDeliveries(
        deliveryResponse.data
      );

      setReport(
        reportResponse.data
      );

    } catch (error) {

      console.error(error);

    }

  }


  useEffect(() => {

    loadDashboard();

  }, [date]);


  /*
  Convert customer configuration
  into today's delivery status.
  */

  function buildSession(session) {

    return customers

      .filter(
        customer =>
          customer[session]?.enabled
      )

      .map(customer => {

        const delivery =
          deliveries.find(
            item =>
              item.customerId?._id ===
                customer._id &&
              item.session ===
                session
          );


        return {

          ...customer,

          delivered:
            delivery?.delivered ??
            false,

          litres:
            delivery?.litres ??
            customer[session].litres,

          paid:
            delivery?.paid ??
            false,

          deliveryId:
            delivery?._id

        };

      });

  }


  const morning =
    useMemo(
      () =>
        buildSession("morning"),
      [
        customers,
        deliveries
      ]
    );


  const evening =
    useMemo(
      () =>
        buildSession("evening"),
      [
        customers,
        deliveries
      ]
    );


  /*
  One tap delivery.
  */

  async function toggleDelivery(
    customer,
    session
  ) {

    try {

      const existing =
        deliveries.find(
          item =>
            item.customerId?._id ===
              customer._id &&
            item.session ===
              session
        );


      await api.post(
        "/deliveries/mark",
        {

          customerId:
            customer._id,

          date,

          session,

          litres:
            customer.litres,

          delivered:
            !customer.delivered,

          paid:
            existing?.paid ??
            false

        }
      );


      loadDashboard();

    } catch (error) {

      console.error(error);

    }

  }


  const totalValue =
    report?.total?.amount || 0;


  const paid =
    report?.total?.paid || 0;


  const pending =
    report?.total?.pending || 0;


  const collectionPercentage =
    totalValue > 0
      ? Math.round(
          (paid / totalValue) * 100
        )
      : 0;


  return (

    <div className="space-y-6">

      {/* HERO */}

      <section
        className="
          grain
          overflow-hidden
          rounded-[32px]
          bg-ink
          p-6
          text-white
          shadow-soft
          sm:p-8
        "
      >

        <div
          className="
            flex
            flex-col
            gap-5
            sm:flex-row
            sm:items-end
            sm:justify-between
            text-gray-500
          "
        >

          <div>

            <p
              className="
                text-xs
                font-black
                uppercase
                tracking-[.25em]
                text-white/45
              "
            >
              Today's route
            </p>


            <h1
              className="
                mt-2
                text-4xl
                font-black
                tracking-tight
                sm:text-5xl
              "
            >
              Milk, marked.
            </h1>


            <p
              className="
                mt-2
                max-w-xl
                text-sm
                font-medium
                text-gray-300 
              "
            >
              One tap per customer.
              Morning + evening become
              one daily ledger automatically.
            </p>

          </div>


          <div
            className="
              rounded-2xl
              bg-white/10
              p-1
            "
          >

            <input
              type="date"
              value={date}
              onChange={
                event =>
                  setDate(
                    event.target.value
                  )
              }
              className="
                rounded-xl
                bg-transparent
                px-3
                py-2
                text-sm
                font-bold
                outline-none
              "
            />

          </div>

        </div>

      </section>


      {/* STAT CARDS */}

      <div
        className="
          grid
          gap-4
          sm:grid-cols-2
          lg:grid-cols-4
        "
      >

        <StatCard
          label="Milk"
          value={
            `${report?.total?.litres || 0} L`
          }
          sub="morning + evening"
          tone="sky"
          icon={
            <Droplets size={18} />
          }
        />


        <StatCard
          label="Today's value"
          value={`₹${totalValue}`}
          sub="all marked deliveries"
          tone="leaf"
          icon={
            <IndianRupee size={18} />
          }
        />


        <StatCard
          label="Collected"
          value={`₹${paid}`}
          sub="cash received"
          tone="amber"
          icon={
            <TrendingUp size={18} />
          }
        />


        <StatCard
          label="Pending"
          value={`₹${pending}`}
          sub="cash still to collect"
          icon={
            <Users size={18} />
          }
        />

      </div>


      {/* MORNING + EVENING */}

      <div
        className="
          grid
          gap-6
          lg:grid-cols-2
        "
      >

        <SessionCard
          title="Morning milk"
          customers={morning}
          onToggle={
            customer =>
              toggleDelivery(
                customer,
                "morning"
              )
          }
        />


        <SessionCard
          title="Evening milk"
          customers={evening}
          onToggle={
            customer =>
              toggleDelivery(
                customer,
                "evening"
              )
          }
        />

      </div>


      {/* CASH COLLECTION */}

      <section
        className="
          rounded-[28px]
          bg-white
          p-5
          shadow-soft
        "
      >

        <div
          className="
            flex
            items-center
            justify-between
          "
        >

          <div>

            <p
              className="
                text-xs
                font-black
                uppercase
                tracking-widest
                text-black/35
              "
            >
              Daily pulse
            </p>


            <h3
              className="
                mt-1
                text-xl
                font-black
              "
            >
              ₹{totalValue}
              {" "}
              milk value today
            </h3>

          </div>


          <div
            className="
              grid
              h-12
              w-12
              place-items-center
              rounded-2xl
              bg-ink
              text-white
            "
          >

            <Milk size={20} />

          </div>

        </div>


        <div
          className="
            mt-5
            h-3
            overflow-hidden
            rounded-full
            bg-black/5
          "
        >

          <div
            className="
              h-full
              rounded-full
              bg-ink
              transition-all
            "
            style={{
              width:
                `${collectionPercentage}%`
            }}
          />

        </div>


        <div
          className="
            mt-2
            flex
            justify-between
            text-xs
            font-bold
            text-black/40
          "
        >

          <span>
            Cash collected
          </span>

          <span>
            {collectionPercentage}%
          </span>

        </div>

      </section>

    </div>

  );

}
import {
  useEffect,
  useState
} from "react";

import {
  Droplets,
  IndianRupee,
  WalletCards
} from "lucide-react";

import api from "../lib/api";


export default function Reports() {

  const [
    date,
    setDate
  ] = useState(
    new Date()
      .toISOString()
      .slice(0, 10)
  );


  const [
    report,
    setReport
  ] = useState(null);


  useEffect(() => {

    async function loadReport() {

      try {

        const response =
          await api.get(
            "/reports/daily",
            {
              params: {
                date
              }
            }
          );


        setReport(
          response.data
        );

      } catch (error) {

        console.error(error);

      }

    }


    loadReport();

  }, [date]);


  return (

    <div className="space-y-6">

      {/* HEADER */}

      <div
        className="
          flex
          flex-col
          gap-3
          sm:flex-row
          sm:items-end
          sm:justify-between
        "
      >

        <div>

          <p
            className="
              text-xs
              font-black
              uppercase
              tracking-[.2em]
              text-black/35
            "
          >
            Ledger
          </p>


          <h1
            className="
              mt-1
              text-4xl
              font-black
              tracking-tight
            "
          >
            Daily report
          </h1>

        </div>


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
            rounded-2xl
            bg-white
            px-4
            py-3
            text-sm
            font-black
            shadow-sm
            outline-none
          "
        />

      </div>


      {/* METRICS */}

      <div
        className="
          grid
          gap-4
          md:grid-cols-3
        "
      >

        <Metric
          icon={<Droplets />}
          title="Milk"
          value={
            `${report?.total?.litres || 0} L`
          }
        />


        <Metric
          icon={<IndianRupee />}
          title="Milk value"
          value={
            `₹${report?.total?.amount || 0}`
          }
        />


        <Metric
          icon={<WalletCards />}
          title="Pending"
          value={
            `₹${report?.total?.pending || 0}`
          }
        />

      </div>


      {/* SESSION TABLE */}

      <div
        className="
          overflow-hidden
          rounded-[28px]
          bg-white
          shadow-soft
        "
      >

        <div
          className="
            grid
            grid-cols-3
            border-b
            border-black/5
            bg-cream
            p-4
            text-xs
            font-black
            uppercase
            tracking-wider
            text-black/40
          "
        >

          <span>
            Session
          </span>

          <span>
            Milk
          </span>

          <span>
            Value
          </span>

        </div>


        {[
          [
            "Morning",
            report?.morning
          ],

          [
            "Evening",
            report?.evening
          ],

          [
            "Total",
            report?.total
          ]

        ].map(
          ([name, row]) => (

            <div
              key={name}
              className="
                grid
                grid-cols-3
                border-b
                border-black/5
                p-5
                last:border-0
              "
            >

              <span
                className="
                  font-black
                "
              >
                {name}
              </span>


              <span
                className="
                  font-bold
                "
              >
                {row?.litres || 0} L
              </span>


              <span
                className="
                  font-black
                "
              >
                ₹{row?.amount || 0}
              </span>

            </div>

          )
        )}

      </div>


      {/* CASH FLOW */}

      <div
        className="
          rounded-[28px]
          bg-ink
          p-6
          text-white
        "
      >

        <p
          className="
            text-xs
            font-black
            uppercase
            tracking-widest
            text-white/45
          "
        >
          Cash flow
        </p>


        <div
          className="
            mt-2
            text-4xl
            font-black
          "
        >
          ₹
          {report?.total?.paid || 0}
        </div>


        <p
          className="
            mt-1
            text-sm
            font-semibold
            text-white/55
          "
        >

          received today

          {" · "}

          ₹
          {report?.total?.pending || 0}

          {" "}
          still pending

        </p>

      </div>

    </div>

  );

}


function Metric({
  icon,
  title,
  value
}) {

  return (

    <div
      className="
        rounded-[26px]
        bg-white
        p-5
        shadow-soft
      "
    >

      <div
        className="
          mb-5
          grid
          h-10
          w-10
          place-items-center
          rounded-xl
          bg-cream
        "
      >

        {icon}

      </div>


      <div
        className="
          text-xs
          font-black
          uppercase
          tracking-widest
          text-black/35
        "
      >
        {title}
      </div>


      <div
        className="
          mt-1
          text-3xl
          font-black
        "
      >
        {value}
      </div>

    </div>

  );

}
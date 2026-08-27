import {
  Check,
  CircleDashed,
} from "lucide-react";

export default function SessionCard({
  title,
  customers,
  onToggle,
  onMarkAll,
}) {
  const completed =
    customers.filter(
      customer => customer.delivered
    ).length;

  const total =
    customers.length;

  const pending =
    total - completed;

  const percentage =
    total > 0
      ? Math.round(
          (completed / total) * 100
        )
      : 0;

  return (
    <section
      className="
        overflow-hidden
        rounded-[28px]
        bg-white
        shadow-soft
      "
    >

      {/* ========================= */}
      {/* HEADER */}
      {/* ========================= */}

      <div
        className="
          flex
          flex-col
          gap-4
          border-b
          border-black/5
          p-5

          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >

        {/* LEFT */}

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
            {title}
          </p>

          <h2
            className="
              mt-1
              text-xl
              font-black
            "
          >
            {completed}/{total} completed
          </h2>
        </div>


        {/* RIGHT */}

        <div
          className="
            flex
            items-center
            justify-between
            gap-3
          "
        >

          {/* MARK ALL */}

          {pending > 0 && (
            <button
              type="button"
              onClick={onMarkAll}
              className="
                rounded-xl
                bg-ink
                px-4
                py-2.5
                text-xs
                font-black
                text-green-500
                shadow-sm

                transition-all

                hover:scale-[1.02]
                active:scale-95
              "
            >
              Mark all
            </button>
          )}


          {/* ALL DONE */}

          {pending === 0 &&
            total > 0 && (
              <span
                className="
                  rounded-xl
                  bg-leaf
                  px-4
                  py-2.5
                  text-xs
                  font-black
                  text-green-800
                "
              >
                All done ✓
              </span>
            )}


          {/* PROGRESS */}

          <div
            className="
              relative
              grid
              h-14
              w-14
              shrink-0
              place-items-center
              rounded-full
              bg-cream
            "
          >

            <svg
              className="-rotate-90"
              width="56"
              height="56"
            >

              <circle
                cx="28"
                cy="28"
                r="23"
                fill="none"
                stroke="currentColor"
                className="text-black/5"
                strokeWidth="5"
              />

              <circle
                cx="28"
                cy="28"
                r="23"
                fill="none"
                stroke="currentColor"
                className="text-ink"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={`
                  ${percentage * 1.445}
                  144.5
                `}
              />

            </svg>

            <span
              className="
                absolute
                text-xs
                font-black
              "
            >
              {percentage}%
            </span>

          </div>

        </div>

      </div>


      {/* ========================= */}
      {/* CUSTOMERS */}
      {/* ========================= */}

      <div
        className="
          divide-y
          divide-black/5
        "
      >

        {customers.length === 0 ? (

          <div
            className="
              p-8
              text-center
              text-sm
              font-bold
              text-black/30
            "
          >
            No customers for this session.
          </div>

        ) : (

          customers.map(
            customer => (

              <button
                key={customer._id}
                onClick={() =>
                  onToggle(customer)
                }
                className="
                  flex
                  w-full
                  items-center
                  gap-3
                  px-5
                  py-4
                  text-left
                  transition
                  hover:bg-cream/70
                  active:bg-cream
                "
              >

                {/* STATUS */}

                <span
                  className={`
                    grid
                    h-10
                    w-10
                    shrink-0
                    place-items-center
                    rounded-2xl

                    ${
                      customer.delivered
                        ? "bg-leaf text-green-800"
                        : "bg-black/5 text-black/25"
                    }
                  `}
                >

                  {customer.delivered ? (
                    <Check size={19} />
                  ) : (
                    <CircleDashed
                      size={19}
                    />
                  )}

                </span>


                {/* INFO */}

                <span
                  className="
                    min-w-0
                    flex-1
                  "
                >

                  <span
                    className="
                      block
                      truncate
                      font-extrabold
                    "
                  >
                    {customer.name}
                  </span>

                  <span
                    className="
                      text-xs
                      font-semibold
                      text-black/40
                    "
                  >
                    {customer.litres} L
                    {" · "}
                    ₹
                    {customer.litres *
                      (
                        customer.pricePerLitre ||
                        50
                      )}
                  </span>

                </span>


                {/* STATUS */}

                <span
                  className={`
                    shrink-0
                    rounded-full
                    px-3
                    py-1
                    text-[10px]
                    font-black
                    uppercase

                    ${
                      customer.delivered
                        ? "bg-leaf text-green-800"
                        : "bg-black/5 text-black/35"
                    }
                  `}
                >
                  {customer.delivered
                    ? "done"
                    : "skip"}
                </span>

              </button>

            )
          )

        )}

      </div>

    </section>
  );
}
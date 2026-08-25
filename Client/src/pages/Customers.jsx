import {
  useEffect,
  useState
} from "react";

import {
  Plus,
  Search,
  Phone,
  Pencil
} from "lucide-react";

import api from "../lib/api";


const initialForm = {

  name: "",

  phone: "",

  address: "",

  pricePerLitre: 50,

  morning: {
    enabled: true,
    litres: 1
  },

  evening: {
    enabled: false,
    litres: 1
  }

};


export default function Customers() {

  const [
    customers,
    setCustomers
  ] = useState([]);


  const [
    form,
    setForm
  ] = useState(initialForm);


  const [
    editingId,
    setEditingId
  ] = useState(null);


  const [
    search,
    setSearch
  ] = useState("");


  async function loadCustomers() {

    const response =
      await api.get("/customers");

    setCustomers(
      response.data
    );

  }


  useEffect(() => {

    loadCustomers();

  }, []);


  async function handleSubmit(
    event
  ) {

    event.preventDefault();


    try {

      if (editingId) {

        await api.put(
          `/customers/${editingId}`,
          form
        );

      } else {

        await api.post(
          "/customers",
          form
        );

      }


      setForm(initialForm);

      setEditingId(null);

      loadCustomers();

    } catch (error) {

      console.error(error);

    }

  }


  function editCustomer(customer) {

    setEditingId(
      customer._id
    );


    setForm({

      name: customer.name,

      phone:
        customer.phone || "",

      address:
        customer.address || "",

      pricePerLitre:
        customer.pricePerLitre,

      morning:
        customer.morning,

      evening:
        customer.evening

    });


    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

  }


  const filteredCustomers =
    customers.filter(
      customer =>
        customer.name
          .toLowerCase()
          .includes(
            search.toLowerCase()
          )
    );


  return (

    <div className="space-y-6">

      {/* TITLE */}

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
          Route book
        </p>


        <h1
          className="
            mt-1
            text-4xl
            font-black
            tracking-tight
          "
        >
          Customers
        </h1>

      </div>


      {/* CUSTOMER FORM */}

      <form
        onSubmit={handleSubmit}
        className="
          rounded-[28px]
          bg-white
          p-5
          shadow-soft
        "
      >

        <div
          className="
            grid
            gap-3
            md:grid-cols-2
          "
        >

          <input
            required
            placeholder="Customer name"
            value={form.name}
            onChange={
              event =>
                setForm({
                  ...form,
                  name:
                    event.target.value
                })
            }
            className="
              rounded-2xl
              bg-cream
              px-4
              py-3
              font-bold
              outline-none
            "
          />


          <input
            placeholder="Phone"
            value={form.phone}
            onChange={
              event =>
                setForm({
                  ...form,
                  phone:
                    event.target.value
                })
            }
            className="
              rounded-2xl
              bg-cream
              px-4
              py-3
              font-bold
              outline-none
            "
          />


          <input
            placeholder="Address / landmark"
            value={form.address}
            onChange={
              event =>
                setForm({
                  ...form,
                  address:
                    event.target.value
                })
            }
            className="
              rounded-2xl
              bg-cream
              px-4
              py-3
              font-bold
              outline-none
            "
          />


          <input
            type="number"
            min="1"
            value={form.pricePerLitre}
            onChange={
              event =>
                setForm({
                  ...form,
                  pricePerLitre:
                    Number(
                      event.target.value
                    )
                })
            }
            className="
              rounded-2xl
              bg-cream
              px-4
              py-3
              font-bold
              outline-none
            "
          />

        </div>


        {/* MORNING / EVENING */}

        <div
          className="
            mt-4
            grid
            gap-3
            sm:grid-cols-2
          "
        >

          {[
            "morning",
            "evening"
          ].map(session => (

            <div
              key={session}
              className="
                rounded-2xl
                border
                border-black/5
                p-4
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

                  <div
                    className="
                      font-black
                      capitalize
                    "
                  >
                    {session}
                  </div>


                  <div
                    className="
                      text-xs
                      font-semibold
                      text-black/40
                    "
                  >
                    Regular litres
                  </div>

                </div>


                <input
                  type="checkbox"
                  checked={
                    form[session].enabled
                  }
                  onChange={
                    event =>
                      setForm({
                        ...form,
                        [session]: {
                          ...form[session],
                          enabled:
                            event.target.checked
                        }
                      })
                  }
                  className="
                    h-5
                    w-5
                  "
                />

              </div>


              <input
                type="number"
                min="0"
                step="0.25"
                value={
                  form[session].litres
                }
                onChange={
                  event =>
                    setForm({
                      ...form,
                      [session]: {
                        ...form[session],
                        litres:
                          Number(
                            event.target.value
                          )
                      }
                    })
                }
                className="
                  mt-3
                  w-full
                  rounded-xl
                  bg-cream
                  px-3
                  py-2
                  text-center
                  font-black
                "
              />

            </div>

          ))}

        </div>


        <button
          type="submit"
          className="
            mt-4
            flex
            items-center
            gap-2
            rounded-2xl
            bg-ink
            px-5
            py-3
            text-sm
            font-black
            text-white
          "
        >

          <Plus size={17} />

          {editingId
            ? "Update customer"
            : "Add customer"}

        </button>

      </form>


      {/* SEARCH */}

      <div
        className="
          flex
          items-center
          gap-3
          rounded-2xl
          bg-white
          px-4
          py-3
          shadow-sm
        "
      >

        <Search
          size={18}
          className="text-black/30"
        />


        <input
          value={search}
          onChange={
            event =>
              setSearch(
                event.target.value
              )
          }
          placeholder="
            Search your customers...
          "
          className="
            w-full
            bg-transparent
            text-sm
            font-bold
            outline-none
          "
        />

      </div>


      {/* CUSTOMER LIST */}

      <div
        className="
          grid
          gap-3
          md:grid-cols-2
        "
      >

        {filteredCustomers.map(
          customer => (

            <div
              key={customer._id}
              className="
                flex
                items-center
                gap-4
                rounded-[24px]
                bg-white
                p-4
                shadow-soft
              "
            >

              {/* AVATAR */}

              <div
                className="
                  grid
                  h-12
                  w-12
                  shrink-0
                  place-items-center
                  rounded-2xl
                  bg-sky
                  font-black
                "
              >
                {customer.name
                  .slice(0, 1)
                  .toUpperCase()}
              </div>


              {/* CUSTOMER */}

              <div className="min-w-0 flex-1">

                <div
                  className="
                    truncate
                    font-black
                  "
                >
                  {customer.name}
                </div>


                <div
                  className="
                    text-xs
                    font-semibold
                    text-black/40
                  "
                >

                  {customer.morning.enabled &&
                    `${customer.morning.litres}L AM`}

                  {customer.morning.enabled &&
                    customer.evening.enabled &&
                    " · "}

                  {customer.evening.enabled &&
                    `${customer.evening.litres}L PM`}

                  {" · "}

                  ₹{customer.pricePerLitre}/L

                </div>

              </div>


              {/* ACTIONS */}

              <div className="flex gap-1">

                {customer.phone && (

                  <a
                    href={`tel:${customer.phone}`}
                    className="
                      grid
                      h-9
                      w-9
                      place-items-center
                      rounded-xl
                      bg-cream
                    "
                  >

                    <Phone size={15} />

                  </a>

                )}


                <button
                  onClick={() =>
                    editCustomer(
                      customer
                    )
                  }
                  className="
                    grid
                    h-9
                    w-9
                    place-items-center
                    rounded-xl
                    bg-cream
                  "
                >

                  <Pencil size={15} />

                </button>

              </div>

            </div>

          )
        )}

      </div>

    </div>

  );

}
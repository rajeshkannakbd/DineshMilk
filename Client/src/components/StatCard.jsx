export default function StatCard({
  label,
  value,
  sub,
  icon,
  tone = "white"
}) {

  const tones = {

    white: "bg-white",

    sky: "bg-sky",

    leaf: "bg-leaf",

    amber: "bg-ambermilk"

  };


  return (

    <div
      className={`
        ${tones[tone]}
        rounded-3xl
        p-5
        shadow-soft
      `}
    >

      <div
        className="
          mb-4
          flex
          items-center
          justify-between
        "
      >

        <span
          className="
            text-xs
            font-black
            uppercase
            tracking-widest
            text-black/45
          "
        >
          {label}
        </span>


        <span
          className="
            grid
            h-9
            w-9
            place-items-center
            rounded-xl
            bg-white/70
          "
        >
          {icon}
        </span>

      </div>


      <div
        className="
          text-3xl
          font-black
          tracking-tight
        "
      >
        {value}
      </div>


      <div
        className="
          mt-1
          text-xs
          font-semibold
          text-black/45
        "
      >
        {sub}
      </div>

    </div>

  );

}
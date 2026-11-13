// import Card from "./card";

// function Cardrow(){
//   return (
//     <div className="bg-orange-400 h-100 w-370 m-auto mt-2.5 flex items-center overflow-scroll">
//         <div className="flex gap-5">
//           <Card  />
//         </div>


//     </div>
//   );
// };
// export default Cardrow;


import Card from "./card";
import { useNavigate } from "react-router-dom";

function CardRow({ title, icon, professionals }) {
  const navigate = useNavigate();

  return (
    <section className="mb-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-3 text-xl font-bold text-gray-900">
          <span className="text-2xl text-orange-500">
            {icon}
          </span>
          {title}
        </h2>

        <button
          aria-label={`Explore more ${title.toLowerCase()}`}
          onClick={() => navigate(`/Services?profession=${encodeURIComponent(title)}`)}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-xl transition hover:bg-orange-500 hover:text-white"
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {professionals.slice(0, 3).map((professional) => (
          <Card
            key={professional._id}
            professional={professional}
          />
        ))}
      </div>
    </section>
  );
}

export default CardRow;

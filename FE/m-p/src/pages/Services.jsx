// // import React from 'react'
// import bgsrv from "./option/bgsrv.png";
// // import Cardrow from "../componet/card-row/card-row";
// // import { Search } from "lucide-react";
// import CardRow from "../componet/card-row/card-row";
// import { professionals } from "../componet/card-row/professionals";

// const Services = () => {
//   return (
//     <div>
//       <div
//   className="min-h-90 w-full bg-cover bg-no-repeat bg-center flex items-center py-10 "
//   style={{ backgroundImage: `url(${bgsrv})` }}
// >
//   <div className="px-4 sm:px-8 lg:px-10 w-full">
//     <p className="text-orange-500 font-bold text-sm sm:text-base">
//       FIXNEAR SERVICE
//     </p>

//     <h1 className="font-bold text-3xl sm:text-4xl lg:text-5xl mt-0.5">
//       What do you need fixed?
//     </h1>

//     <p className="text-gray-500 mt-3 max-w-md text-sm sm:text-base">
//       Find trusted professionals for your everyday home and technical repair
//       needs.
//     </p>

//     <form
//       onSubmit={(e) => {
//         e.preventDefault();
//         // handle search here
//       }}
//       className="bg-white h-10 w-full max-w-md lg:max-w-lg rounded flex items-center border border-gray-300 mt-5"
//     >
//       <input
//         type="text"
//         placeholder="Search services"
//         className="flex-1 min-w-0 ml-2 h-9 outline-0"
//       />
//       <button
//         type="submit"
//         className="bg-orange-500 text-black hover:text-white transition ml-2 w-20 h-10 rounded shrink-0"
//         aria-label="Search"
//       >
//         Search
//       </button>
//     </form>
//   </div>
// </div>

//       <section className="bg-gray-50 px-5 py-8 md:px-10 lg:px-16">
//   <CardRow
//     title="Plumbers"
//     icon="🔧"
//     professionals={professionals.filter(
//       (p) => p.category === "Plumbers"
//     )}
//   />

//   <CardRow
//     title="Carpenters"
//     icon="🪚"
//     professionals={professionals.filter(
//       (p) => p.category === "Carpenters"
//     )}
//   />

//   <CardRow
//     title="Electricians"
//     icon="⚡"
//     professionals={professionals.filter(
//       (p) => p.category === "Electricians"
//     )}
//   />
// </section>
      
//     </div>
//   )
// }

// export default Services



import { useEffect, useState } from "react";

import bgsrv from "./option/bgsrv.png";
import CardRow from "../componet/card-row/card-row";
import API from "../componet/api";
import { useSearchParams } from "react-router-dom";

const Services = () => {
  const [searchParams] = useSearchParams();
  const initialProfession = searchParams.get("profession") || "";
  const initialLocation = searchParams.get("location") || "";
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState(initialProfession);

  useEffect(() => {
    let active = true;

    API.get("/providers", {
      params: {
        ...(initialProfession ? { profession: initialProfession } : {}),
        ...(initialLocation ? { location: initialLocation } : {}),
      },
    })
      .then((response) => {
        if (active) setProviders(response.data.providers || []);
      })
      .catch((err) => {
        console.error("Provider fetching error:", err);
        if (active) setError("Unable to load service providers.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [initialLocation, initialProfession]);

  const handleSearch = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const profession = searchTerm.trim();
      const response = await API.get("/providers", {
        params: {
          ...(profession ? { profession } : {}),
          ...(initialLocation ? { location: initialLocation } : {}),
        },
      });
      setProviders(response.data.providers || []);
    } catch (err) {
      console.error("Provider search error:", err);
      setError("Unable to search service providers.");
    } finally {
      setLoading(false);
    }
  };

  // Group providers according to profession
  const groupedProviders = providers.reduce((groups, provider) => {
    const profession = provider.profession?.trim();

    if (!profession) return groups;

    if (!groups[profession]) {
      groups[profession] = [];
    }

    groups[profession].push(provider);

    return groups;
  }, {});

  return (
    <div>
      {/* Hero Section */}
      <div
        className="min-h-90 w-full bg-cover bg-no-repeat bg-center flex items-center py-10"
        style={{ backgroundImage: `url(${bgsrv})` }}
      >
        <div className="px-4 sm:px-8 lg:px-10 w-full">
          <p className="text-orange-500 font-bold text-sm sm:text-base">
            FIXNEAR SERVICE
          </p>

          <h1 className="font-bold text-3xl sm:text-4xl lg:text-5xl mt-0.5">
            What do you need fixed?
          </h1>

          <p className="text-gray-500 mt-3 max-w-md text-sm sm:text-base">
            Find trusted professionals for your everyday home and technical
            repair needs.
          </p>

          <form
            onSubmit={handleSearch}
            className="bg-white h-10 w-full max-w-md lg:max-w-lg rounded flex items-center border border-gray-300 mt-5"
          >
            <input
              type="text"
              placeholder="Search services"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="flex-1 min-w-0 ml-2 h-9 outline-0"
            />

            <button
              type="submit"
              className="bg-orange-500 text-black hover:text-white transition ml-2 w-20 h-10 rounded shrink-0"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Provider Section */}
      <section className="bg-gray-50 px-5 py-8 md:px-10 lg:px-16">

        {loading && (
          <p className="text-center py-10 text-gray-500">
            Loading professionals...
          </p>
        )}

        {error && (
          <p className="text-center py-10 text-red-500">
            {error}
          </p>
        )}

        {!loading && !error && Object.keys(groupedProviders).length === 0 && (
          <p className="text-center py-10 text-gray-500">
            No service providers available right now.
          </p>
        )}

        {!loading &&
          !error &&
          Object.entries(groupedProviders).map(([profession, list]) => (
            <CardRow
              key={profession}
              title={profession.charAt(0).toUpperCase() + profession.slice(1)}
              icon="🔧"
              professionals={list}
            />
          ))}

      </section>
    </div>
  );
};

export default Services;

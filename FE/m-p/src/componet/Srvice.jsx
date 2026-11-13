
import { useState } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
// import ServiceRow from "../components/ServiceRow";
// import { professionals } from "../data/professionals";

function Srvice() {
  const navigate = useNavigate();
  const [location, setLocation] = useState("Indore");
  const [service, setService] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();

    if (!service.trim()) {
      alert("Please enter a service");
      return;
    }

    const params = new URLSearchParams({
      profession: service.trim(),
      location,
    });
    navigate(`/Services?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSearch}
      className="ml-5 mr-6 flex h-12 items-center
     border-2 border-black rounded hover:bg-orange-100 "
    >
      {/* Location Selector */}
      <div className="flex items-center gap-2 border-r border-gray-200 px-4">
        <span className="text-orange-500">📍</span>

        <select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-24 cursor-pointer bg-transparent text-sm outline-none"
          aria-label="Select location"
        >
          <option value="Indore">Indore</option>
          <option value="Bhopal">Bhopal</option>
          <option value="Delhi">Delhi</option>
          <option value="Mumbai">Mumbai</option>
        </select>
      </div>

      {/* Service Input */}
      <div className="flex items-center gap-2 px-4">
        <input
          type="text"
          placeholder="Search services..."
          value={service}
          onChange={(e) => setService(e.target.value)}
          className="w-40 bg-transparent text-sm outline-none
          placeholder:text-gray-400"
          aria-label="Search services"
        />

        <button
          type="submit"
          className="text-gray-500 transition hover:text-orange-500"
          aria-label="Search"
        >
          <Search />
        </button>
      </div>
    </form>
  );
}

export default Srvice;


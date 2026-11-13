import { useNavigate } from "react-router-dom";

function Card({ professional }) {
  const navigate = useNavigate();

  const handleBooking = () => {
    navigate(`/bookingpage?providerId=${professional._id}`);
  };

  return (
    <article className="flex min-w-0 gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:border-orange-300 hover:shadow-lg">

      {/* Provider Image */}
      <img
        src={
          professional.profileImage ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(
            professional.user?.Name || "Provider"
          )}&background=ffedd5&color=ea5800`
        }
        alt={professional.user?.Name || "Provider"}
        className="h-28 w-24 shrink-0 rounded-xl object-cover"
      />

      {/* Provider Details */}
      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div>
          <h3 className="truncate font-bold text-gray-900">
            {professional.user?.Name || "Professional"}
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            {professional.profession}
          </p>

          <p className="mt-1 text-sm text-gray-500">
            {professional.experience} years experience
          </p>

          <p className="mt-1 text-sm text-amber-700">
            {professional.reviewCount > 0
              ? `★ ${Number(professional.ratingAverage).toFixed(1)} · ${professional.reviewCount} ${professional.reviewCount === 1 ? "review" : "reviews"}`
              : "No reviews yet"}
          </p>

          <p className="mt-2 text-sm font-semibold text-gray-700">
            Starting at ₹{professional.charges}
          </p>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
            ✓ Available
          </span>

          <button
            onClick={handleBooking}
            className="rounded-lg bg-orange-500 px-3 py-2 text-sm font-semibold text-white hover:bg-orange-600"
          >
            Book Now →
          </button>
        </div>
      </div>
    </article>
  );
}

export default Card;

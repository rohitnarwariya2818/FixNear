import { useState } from "react";
import { Star } from "lucide-react";
import API from "./api.js";

function ReviewForm({ booking, onSubmitted }) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submitReview = async (event) => {
    event.preventDefault();
    if (!rating) {
      setError("Choose a star rating before submitting.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const { data } = await API.post(`/bookings/${booking._id}/review`, { rating, comment });
      onSubmitted?.({ ...booking, review: data.review });
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to submit your review.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submitReview} className="mt-4 rounded-xl border border-orange-100 bg-orange-50/50 p-4">
      <h3 className="font-semibold text-gray-900">How was this provider?</h3>
      <div className="mt-2 flex items-center gap-1" role="radiogroup" aria-label="Provider rating">
        {[1, 2, 3, 4, 5].map((value) => (
          <button key={value} type="button" role="radio" aria-checked={rating === value} aria-label={`${value} star${value > 1 ? "s" : ""}`} onMouseEnter={() => setHovered(value)} onMouseLeave={() => setHovered(0)} onFocus={() => setHovered(value)} onBlur={() => setHovered(0)} onClick={() => setRating(value)} className="rounded p-1 focus:outline-none focus:ring-2 focus:ring-orange-500">
            <Star size={25} className={(hovered || rating) >= value ? "fill-amber-400 text-amber-500" : "text-gray-300"} />
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-600">{rating ? `${rating} / 5` : "Select a rating"}</span>
      </div>
      <label className="mt-3 block text-sm font-medium text-gray-700">Comment (optional)
        <textarea value={comment} onChange={(event) => setComment(event.target.value)} maxLength="1000" rows="3" placeholder="Share a few details about your experience" className="mt-1 w-full rounded-lg border border-gray-300 bg-white p-3" />
      </label>
      {error && <p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}
      <button type="submit" disabled={busy} className="mt-3 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50">{busy ? "Submitting..." : "Submit review"}</button>
    </form>
  );
}

export default ReviewForm;

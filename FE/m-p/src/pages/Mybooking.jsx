import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../componet/api.js";
import PaymentPanel from "../componet/PaymentPanel.jsx";
import ReviewForm from "../componet/ReviewForm.jsx";

function Mybooking() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");

  const loadBookings = useCallback(async () => {
    try {
      const { data: session } = await API.get("/auth/me");
      if (session.user.role !== "customer") {
        setError("This page is for customer accounts. Provider accounts can view requests from the provider dashboard.");
        setBookings([]);
        return;
      }
      const { data } = await API.get(`/bookings/customer/${session.user.id}`);
      setBookings(data.bookings || []);
    } catch (requestError) {
      setError(requestError.response?.status === 401 ? "Log in as a customer to see your bookings." : requestError.response?.data?.message || "Unable to load bookings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const fetchInitialBookings = async () => {
      try {
        const { data: session } = await API.get("/auth/me");
        if (!active) return;
        if (session.user.role !== "customer") {
          setError("This page is for customer accounts. Provider accounts can view requests from the provider dashboard.");
          setBookings([]);
          return;
        }
        const { data } = await API.get(`/bookings/customer/${session.user.id}`);
        if (active) setBookings(data.bookings || []);
      } catch (requestError) {
        if (active) setError(requestError.response?.status === 401 ? "Log in as a customer to see your bookings." : requestError.response?.data?.message || "Unable to load bookings.");
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchInitialBookings();
    return () => { active = false; };
  }, []);

  const performAction = async (booking, action, decision) => {
    setBusyId(booking._id);
    setError("");
    try {
      if (action === "cancel") await API.patch(`/bookings/${booking._id}/cancel`, {});
      else await API.patch(`/bookings/${booking._id}/quotation/respond`, { decision });
      await loadBookings();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to update this booking.");
    } finally {
      setBusyId("");
    }
  };

  const updateBookingInList = (updatedBooking) => {
    setBookings((current) => current.map((booking) => booking._id === updatedBooking._id ? { ...booking, ...updatedBooking } : booking));
  };

  return (
    <main className="min-h-[75vh] bg-gray-50 px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-5xl">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
          <div><p className="text-sm font-semibold uppercase tracking-wide text-orange-600">Customer account</p><h1 className="mt-1 text-3xl font-bold text-gray-900">My bookings</h1></div>
          <Link to="/Services" className="rounded-lg bg-orange-500 px-4 py-2.5 font-semibold text-white hover:bg-orange-600">Book a service</Link>
        </div>
        {error && <p role="alert" className="mb-5 rounded-lg bg-amber-50 p-4 text-sm text-amber-900">{error}</p>}
        {loading ? <p className="py-10 text-center text-gray-600">Loading your bookings...</p> : bookings.length === 0 ? (
          <section className="rounded-2xl border bg-white p-8 text-center shadow-sm">
            <p className="text-lg font-semibold text-gray-800">No bookings yet</p>
            <p className="mt-2 text-gray-600">Choose a service and book a nearby provider.</p>
            <Link to="/Services" className="mt-5 inline-block font-semibold text-orange-600 hover:underline">Browse services</Link>
          </section>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => {
              const provider = booking.provider;
              const providerName = provider?.user?.Name || provider?.profession || "Service provider";
              return (
                <article key={booking._id} className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div><h2 className="text-lg font-bold text-gray-900">{booking.service} <span className="font-normal text-gray-500">with {providerName}</span></h2>
                      <p className="mt-1 text-sm capitalize text-gray-600">{booking.bookingType} · {new Date(booking.scheduledAt).toLocaleString()}</p>
                    </div>
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold capitalize text-gray-700">{booking.status}</span>
                  </div>
                  <div className="mt-4 grid gap-2 text-sm text-gray-700 sm:grid-cols-2">
                    <p><strong>Address:</strong> {booking.address}</p>
                    <p><strong>Charge:</strong> {booking.bookingType === "quotation" && booking.quotationAmount == null ? "Quotation pending" : `₹${booking.charges}`}</p>
                    {booking.description && <p className="sm:col-span-2"><strong>Problem:</strong> {booking.description}</p>}
                    {Number.isFinite(booking.latitude) && Number.isFinite(booking.longitude) && <p><strong>Coordinates:</strong> {booking.latitude}, {booking.longitude}</p>}
                    {booking.quotationAmount != null && <p><strong>Provider quote:</strong> ₹{booking.quotationAmount} ({booking.quotationStatus})</p>}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {booking.bookingType === "quotation" && booking.status === "accepted" && booking.quotationAmount != null && booking.quotationStatus === "pending" && (
                      <>
                        <button type="button" disabled={busyId === booking._id} onClick={() => performAction(booking, "quotation", "accepted")} className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Accept quote</button>
                        <button type="button" disabled={busyId === booking._id} onClick={() => performAction(booking, "quotation", "rejected")} className="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 disabled:opacity-50">Reject quote</button>
                      </>
                    )}
                    {["pending", "accepted"].includes(booking.status) && <button type="button" disabled={busyId === booking._id} onClick={() => performAction(booking, "cancel")} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 disabled:opacity-50">{busyId === booking._id ? "Updating..." : "Cancel booking"}</button>}
                  </div>
                  <PaymentPanel booking={booking} onBookingUpdated={updateBookingInList} />
                  {booking.status === "completed" && (booking.review ? (
                    <div className="mt-4 rounded-xl border border-green-100 bg-green-50 p-4">
                      <p className="text-sm font-semibold text-green-900">Your review · <span className="text-amber-600">{"★".repeat(booking.review.rating)}{"☆".repeat(5 - booking.review.rating)}</span></p>
                      {booking.review.comment && <p className="mt-1 text-sm text-gray-700">{booking.review.comment}</p>}
                    </div>
                  ) : <ReviewForm booking={booking} onSubmitted={updateBookingInList} />)}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

export default Mybooking;

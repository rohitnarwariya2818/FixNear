import { useEffect, useState } from "react";
import API from "../componet/api.js";

function Provider() {
  const [user, setUser] = useState(null);
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookings, setBookings] = useState([]);
  const [actionError, setActionError] = useState("");
  const [busyId, setBusyId] = useState("");
  const [quotationAmounts, setQuotationAmounts] = useState({});

  const refreshBookings = async (providerId) => {
    const response = await API.get(`/bookings/provider/${providerId}`);
    setBookings(response.data.bookings || []);
  };

  useEffect(() => {
    let active = true;

    API.get("/auth/me")
      .then(async ({ data }) => {
        const currentUser = data.user;
        if (!active) return;
        setUser(currentUser);

        if (currentUser.role !== "provider") {
          setError("This dashboard is only available to provider accounts.");
          return;
        }

        const response = await API.get(`/providers/profile/${currentUser.id}`);
        if (active) {
          setProvider(response.data.provider);
          const bookingResponse = await API.get(`/bookings/provider/${response.data.provider._id}`);
          if (active) setBookings(bookingResponse.data.bookings || []);
        }
      })
      .catch((requestError) => {
        if (!active) return;
        setError(
          requestError.response?.status === 404
            ? "Provider profile not found. Sign up again as a provider to create a complete profile."
            : requestError.response?.data?.message || "Unable to load the provider dashboard.",
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const updateBooking = async (booking, action, value) => {
    setBusyId(booking._id);
    setActionError("");
    try {
      if (action === "status") await API.patch(`/bookings/${booking._id}/status`, { status: value });
      else if (action === "cancel") await API.patch(`/bookings/${booking._id}/cancel`, {});
      else if (action === "confirm-payment") await API.patch(`/bookings/${booking._id}/payment/confirm`, {});
      else await API.patch(`/bookings/${booking._id}/quotation`, { quotationAmount: Number(value) });
      await refreshBookings(provider._id);
    } catch (requestError) {
      setActionError(requestError.response?.data?.message || "Unable to update this booking.");
    } finally {
      setBusyId("");
    }
  };

  if (loading) {
    return <p className="p-10 text-center text-gray-600">Loading provider dashboard...</p>;
  }

  if (error || !provider) {
    return (
      <main className="min-h-[60vh] bg-gray-50 p-8">
        <p className="mx-auto max-w-2xl rounded-xl bg-white p-6 text-center text-red-600 shadow-sm">
          {error || "Provider profile is unavailable."}
        </p>
      </main>
    );
  }

  const mapSource = Number.isFinite(provider.latitude) && Number.isFinite(provider.longitude)
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${provider.longitude - 0.01}%2C${provider.latitude - 0.01}%2C${provider.longitude + 0.01}%2C${provider.latitude + 0.01}&layer=mapnik&marker=${provider.latitude}%2C${provider.longitude}`
    : "";

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <section className="overflow-hidden rounded-2xl border bg-white shadow-sm">
          <div className="flex flex-col gap-5 bg-orange-50 p-6 sm:flex-row sm:items-center sm:p-8">
            {provider.profileImage ? (
              <img src={provider.profileImage} alt={`${user?.Name || "Provider"} profile`} className="h-24 w-24 rounded-2xl object-cover" />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-orange-100 text-3xl font-bold text-orange-700">
                {user?.Name?.charAt(0)?.toUpperCase() || "P"}
              </div>
            )}
            <div className="flex-1">
              <p className="text-sm font-semibold uppercase tracking-wide text-orange-700">Provider Dashboard</p>
              <h1 className="mt-1 text-3xl font-bold text-gray-900">{user?.Name}</h1>
              <p className="mt-1 text-gray-600">{provider.profession}</p>
              <p className="mt-2 text-sm text-gray-600">{user?.Email}</p>
              <p className="mt-2 text-sm font-semibold text-amber-700">{provider.reviewCount > 0 ? `★ ${Number(provider.ratingAverage).toFixed(1)} · ${provider.reviewCount} reviews` : "No customer reviews yet"}</p>
            </div>
            <span className={`w-fit rounded-full px-3 py-1 text-sm font-semibold ${provider.isAvailable ? "bg-emerald-100 text-emerald-800" : "bg-gray-200 text-gray-700"}`}>
              {provider.isAvailable ? "Available" : "Unavailable"}
            </span>
          </div>

          <div className="grid gap-5 p-6 sm:grid-cols-2 sm:p-8">
            <section className="rounded-xl border p-5">
              <h2 className="font-semibold text-gray-900">Professional details</h2>
              <p className="mt-3 text-sm text-gray-700">{provider.description || "No description provided."}</p>
              <p className="mt-3 text-sm text-gray-600"><strong>Experience:</strong> {provider.experience} years</p>
              <p className="mt-2 text-sm text-gray-600"><strong>Services:</strong> {provider.services?.join(", ") || "—"}</p>
              <p className="mt-2 text-sm text-gray-600"><strong>Phone:</strong> {provider.phone || user?.phone || "—"}</p>
              <p className="mt-2 text-sm text-gray-600"><strong>Working hours:</strong> {provider.workingHours || "Not set"}</p>
            </section>

            <section className="rounded-xl border p-5">
              <h2 className="font-semibold text-gray-900">Pricing and service area</h2>
              <p className="mt-3 text-sm text-gray-600"><strong>Starting charges:</strong> ₹{provider.charges}</p>
              <p className="mt-2 text-sm text-gray-600"><strong>Inspection fee:</strong> ₹{provider.inspectionFee ?? 100}</p>
              <p className="mt-2 text-sm text-gray-600"><strong>Service area:</strong> {provider.serviceArea?.join(", ") || "—"}</p>
              <p className="mt-2 text-sm text-gray-600"><strong>Address:</strong> {provider.address || "—"}</p>
              {Number.isFinite(provider.latitude) && Number.isFinite(provider.longitude) && (
                <p className="mt-2 text-sm text-gray-600"><strong>Coordinates:</strong> {provider.latitude}, {provider.longitude}</p>
              )}
            </section>

            {mapSource && (
              <section className="sm:col-span-2">
                <h2 className="mb-3 font-semibold text-gray-900">Service location</h2>
                <iframe title="Provider service location" src={mapSource} className="h-64 w-full rounded-xl border" loading="lazy" />
              </section>
            )}
          </div>
        </section>

        <section className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-bold text-gray-900">Booking requests</h2>
            <span className="text-sm text-gray-500">{bookings.length} total</span>
          </div>
          {actionError && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{actionError}</p>}
          {bookings.length === 0 ? <p className="mt-3 text-sm text-gray-600">New booking requests will appear here.</p> : (
            <div className="mt-4 space-y-4">
              {bookings.map((booking) => (
                <article key={booking._id} className="rounded-xl border p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">{booking.service} · {booking.customer?.Name || "Customer"}</h3>
                      <p className="mt-1 text-sm capitalize text-gray-600">{booking.bookingType} · {new Date(booking.scheduledAt).toLocaleString()}</p>
                    </div>
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold capitalize text-gray-700">{booking.status}</span>
                  </div>
                  <p className="mt-3 text-sm text-gray-700"><strong>Address:</strong> {booking.address}</p>
                  {booking.description && <p className="mt-1 text-sm text-gray-600"><strong>Problem:</strong> {booking.description}</p>}
                  {Number.isFinite(booking.latitude) && Number.isFinite(booking.longitude) && <p className="mt-1 text-sm text-gray-600">Coordinates: {booking.latitude}, {booking.longitude}</p>}
                  <p className="mt-1 text-sm text-gray-600">Customer contact: {booking.customer?.phone || booking.customer?.Email || "—"}</p>
                  <p className="mt-1 text-sm text-gray-600">Payment: <strong className="uppercase">{booking.paymentMethod || "cod"}</strong> · <span className="capitalize">{(booking.paymentStatus || "unpaid").replaceAll("_", " ")}</span></p>
                  {booking.paymentReference && <p className="mt-1 text-sm text-gray-600">UPI reference: <strong>{booking.paymentReference}</strong></p>}

                  <div className="mt-4 flex flex-wrap items-end gap-2">
                    {booking.status === "pending" && <>
                      <button type="button" disabled={busyId === booking._id} onClick={() => updateBooking(booking, "status", "accepted")} className="rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50">Accept</button>
                      <button type="button" disabled={busyId === booking._id} onClick={() => updateBooking(booking, "status", "rejected")} className="rounded-lg border border-red-300 px-3 py-2 text-sm font-semibold text-red-700 disabled:opacity-50">Reject</button>
                    </>}
                    {booking.status === "accepted" && booking.bookingType === "quotation" && booking.quotationStatus === "pending" && booking.quotationAmount == null && <>
                      <label className="text-sm font-medium">Quote amount
                        <input type="number" min="1" step="0.01" value={quotationAmounts[booking._id] || ""} onChange={(event) => setQuotationAmounts((current) => ({ ...current, [booking._id]: event.target.value }))} className="ml-2 w-36 rounded-lg border p-2" />
                      </label>
                      <button type="button" disabled={busyId === booking._id || !quotationAmounts[booking._id]} onClick={() => updateBooking(booking, "quotation", quotationAmounts[booking._id])} className="rounded-lg bg-orange-500 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50">Send quote</button>
                    </>}
                    {booking.bookingType === "quotation" && booking.quotationAmount != null && <p className="text-sm text-gray-700">Quote: ₹{booking.quotationAmount} ({booking.quotationStatus})</p>}
                    {booking.status === "accepted" && (booking.bookingType !== "quotation" || booking.quotationStatus === "accepted") && <button type="button" disabled={busyId === booking._id} onClick={() => updateBooking(booking, "status", "completed")} className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50">Mark completed</button>}
                    {booking.paymentMethod === "upi" && booking.paymentStatus === "pending_verification" && <button type="button" disabled={busyId === booking._id} onClick={() => updateBooking(booking, "confirm-payment")} className="rounded-lg bg-emerald-700 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50">Confirm UPI received</button>}
                    {booking.paymentMethod === "cod" && booking.status === "completed" && booking.paymentStatus !== "paid" && <button type="button" disabled={busyId === booking._id} onClick={() => updateBooking(booking, "confirm-payment")} className="rounded-lg bg-emerald-700 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50">Confirm cash received</button>}
                    {["pending", "accepted"].includes(booking.status) && <button type="button" disabled={busyId === booking._id} onClick={() => updateBooking(booking, "cancel")} className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 disabled:opacity-50">Cancel</button>}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default Provider;

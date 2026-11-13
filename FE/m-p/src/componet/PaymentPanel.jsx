import { useState } from "react";
import { CheckCircle2, Copy, CreditCard, Wallet } from "lucide-react";
import API from "./api.js";

const UPI_ID = import.meta.env.VITE_FIXNEAR_UPI_ID?.trim() || "";

function PaymentPanel({ booking, onBookingUpdated }) {
  const [reference, setReference] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const amount = Number(booking.charges || 0);
  const canPay = ["accepted", "completed"].includes(booking.status) &&
    (booking.bookingType !== "quotation" || booking.quotationStatus === "accepted") && amount > 0;
  const upiLink = UPI_ID && canPay
    ? `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=FixNear&am=${encodeURIComponent(amount.toFixed(2))}&cu=INR&tn=${encodeURIComponent(`FixNear-${booking._id}`)}`
    : "";

  const submitReference = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const { data } = await API.patch(`/bookings/${booking._id}/payment/upi-reference`, { transactionReference: reference });
      onBookingUpdated?.(data.booking);
      setMessage(data.message || "Payment reference sent for verification.");
      setReference("");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to submit the UPI reference.");
    } finally {
      setBusy(false);
    }
  };

  const copyUpiId = async () => {
    try {
      await navigator.clipboard.writeText(UPI_ID);
      setMessage("UPI ID copied.");
      setError("");
    } catch {
      setError("Could not copy automatically. Select and copy the UPI ID.");
    }
  };

  return (
    <section className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="flex items-center gap-2">
        {booking.paymentMethod === "upi" ? <CreditCard size={18} className="text-orange-600" /> : <Wallet size={18} className="text-orange-600" />}
        <h3 className="font-semibold text-gray-900">Payment</h3>
        <span className="ml-auto rounded-full bg-white px-2.5 py-1 text-xs font-semibold uppercase text-gray-600">{booking.paymentMethod || "cod"}</span>
      </div>

      <div className="mt-3 flex items-center justify-between border-b border-gray-200 pb-3 text-sm">
        <span className="text-gray-600">{booking.bookingType === "inspection" ? "Inspection / visit fee" : booking.bookingType === "quotation" ? "Accepted quotation" : "Service charge"}</span>
        <strong className="text-gray-900">{amount > 0 ? `₹${amount.toFixed(2)}` : "Awaiting quote"}</strong>
      </div>
      <div className="mt-3 flex items-center justify-between text-base">
        <span className="font-semibold text-gray-900">Total due</span>
        <strong className="text-gray-900">{amount > 0 ? `₹${amount.toFixed(2)}` : "To be confirmed"}</strong>
      </div>
      <p className="mt-1 text-xs text-gray-500">No additional platform or tax fee is currently added.</p>

      {booking.paymentStatus === "paid" ? (
        <p className="mt-3 flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm font-semibold text-green-800"><CheckCircle2 size={18} /> Payment received and confirmed{booking.paymentConfirmedAt ? ` on ${new Date(booking.paymentConfirmedAt).toLocaleDateString()}` : ""}.</p>
      ) : booking.paymentMethod !== "upi" ? (
        <p className="mt-3 rounded-lg bg-white p-3 text-sm text-gray-700">Cash on Delivery: pay the provider after the service is completed. Payment status: <strong>unpaid</strong>.</p>
      ) : booking.paymentStatus === "pending_verification" ? (
        <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">UPI reference <strong>{booking.paymentReference}</strong> was submitted. Waiting for the provider to verify the payment.</p>
      ) : !UPI_ID ? (
        <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">UPI is not configured yet. Add <code>VITE_FIXNEAR_UPI_ID</code> to <code>FE/m-p/.env.local</code> to enable payments. You can still use Cash on Delivery.</p>
      ) : !canPay ? (
        <p className="mt-3 rounded-lg bg-white p-3 text-sm text-gray-700">UPI payment becomes available after the provider accepts the booking and confirms the amount.</p>
      ) : (
        <div className="mt-3 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white p-3 text-sm">
            <div><p className="text-xs text-gray-500">Pay FixNear via UPI</p><p className="font-semibold text-gray-900">{UPI_ID}</p></div>
            <button type="button" onClick={copyUpiId} className="inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-xs font-semibold text-gray-700"><Copy size={14} /> Copy ID</button>
          </div>
          <a href={upiLink} className="block rounded-lg bg-orange-500 px-4 py-3 text-center font-semibold text-white hover:bg-orange-600">Pay ₹{amount.toFixed(2)} with a UPI app</a>
          <form onSubmit={submitReference} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">After paying, enter your UPI transaction reference
              <input value={reference} onChange={(event) => setReference(event.target.value)} minLength="6" maxLength="100" required placeholder="UPI transaction / UTR reference" className="mt-1 w-full rounded-lg border bg-white p-3" />
            </label>
            <button type="submit" disabled={busy} className="w-full rounded-lg border border-orange-500 py-2.5 font-semibold text-orange-700 disabled:opacity-50">{busy ? "Submitting..." : "I’ve paid — submit reference"}</button>
          </form>
        </div>
      )}
      {error && <p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}
      {message && <p role="status" className="mt-2 text-sm text-green-700">{message}</p>}
    </section>
  );
}

export default PaymentPanel;

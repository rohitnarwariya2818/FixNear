import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import API from "../componet/api.js";
import PaymentPanel from "../componet/PaymentPanel.jsx";

const UPI_ID = import.meta.env.VITE_FIXNEAR_UPI_ID?.trim() || "";

const localDate = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};

function BookingPage() {
  const [searchParams] = useSearchParams();
  const providerId = searchParams.get("providerId");
  const [provider, setProvider] = useState(null);
  const [providerReviews, setProviderReviews] = useState([]);
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [locationMessage, setLocationMessage] = useState("");
  const [reverseGeocoding, setReverseGeocoding] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [dragPosition, setDragPosition] = useState(null);
  const locationMapRef = useRef(null);
  const draggingLocation = useRef(false);
  const [createdBooking, setCreatedBooking] = useState(null);
  const [formData, setFormData] = useState({
    bookingType: "fix",
    paymentMethod: "cod",
    service: "",
    description: "",
    address: "",
    latitude: "",
    longitude: "",
    scheduledDate: "",
    scheduledTime: "",
  });

  useEffect(() => {
    let active = true;
    const loadPage = async () => {
      try {
        if (!providerId) {
          setError("Provider ID not found.");
          return;
        }
        const [providerResult, accountResult, reviewsResult] = await Promise.allSettled([
          API.get(`/providers/profile/${providerId}`),
          API.get("/auth/me"),
          API.get(`/providers/profile/${providerId}/reviews`),
        ]);
        if (!active) return;
        if (providerResult.status === "fulfilled") {
          setProvider(providerResult.value.data.provider || providerResult.value.data);
        } else {
          setError(providerResult.reason.response?.data?.message || "Unable to load provider details.");
        }
        if (accountResult.status === "fulfilled") setAccount(accountResult.value.data.user);
        if (reviewsResult.status === "fulfilled") setProviderReviews(reviewsResult.value.data.reviews || []);
      } catch {
        if (active) setError("Unable to load booking details.");
      } finally {
        if (active) {
          setLoading(false);
          setAuthChecked(true);
        }
      }
    };
    loadPage();
    return () => { active = false; };
  }, [providerId]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const applyReverseGeocode = async (latitude, longitude) => {
    setReverseGeocoding(true);
    setLocationMessage("Finding the address for this map location...");
    try {
      const params = new URLSearchParams({
        format: "jsonv2",
        lat: String(latitude),
        lon: String(longitude),
        zoom: "18",
        addressdetails: "1",
      });
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${params}`);
      if (!response.ok) throw new Error("Address lookup failed");
      const result = await response.json();
      if (!result.display_name) throw new Error("No address found for this location");
      setFormData((current) => ({ ...current, address: result.display_name }));
      setLocationMessage("Address found. Review it and edit if needed.");
    } catch (lookupError) {
      setLocationMessage(`${lookupError.message}. Enter the address manually.`);
    } finally {
      setReverseGeocoding(false);
    }
  };

  const useCurrentLocation = () => {
    setLocationMessage("");
    if (!navigator.geolocation) {
      setLocationMessage("Location is not supported by this browser. Enter your address manually.");
      return;
    }
    setLocationMessage("Requesting location permission...");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const latitude = coords.latitude.toFixed(6);
        const longitude = coords.longitude.toFixed(6);
        setFormData((current) => ({ ...current, latitude, longitude }));
        applyReverseGeocode(latitude, longitude);
      },
      (geoError) => {
        const messages = {
          1: "Location permission was denied. Allow location access in your browser or enter your address manually.",
          2: "Your current location could not be determined. Try again or enter the address manually.",
          3: "Location lookup timed out. Try again or enter the address manually.",
        };
        setLocationMessage(messages[geoError.code] || "Could not get your location. Enter the address manually.");
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 },
    );
  };

  const updateAddressFromCoordinates = () => {
    const latitude = Number(formData.latitude);
    const longitude = Number(formData.longitude);
    if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90 ||
        !Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
      setLocationMessage("Enter valid latitude and longitude coordinates.");
      return;
    }
    applyReverseGeocode(latitude, longitude);
  };

  const handlePinPointerDown = (event) => {
    if (!hasCoordinates) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    draggingLocation.current = true;
  };

  const handlePinPointerMove = (event) => {
    if (!draggingLocation.current || !locationMapRef.current) return;
    const bounds = locationMapRef.current.getBoundingClientRect();
    setDragPosition({
      x: Math.max(0, Math.min(bounds.width, event.clientX - bounds.left)),
      y: Math.max(0, Math.min(bounds.height, event.clientY - bounds.top)),
    });
  };

  const handlePinPointerUp = (event) => {
    if (!draggingLocation.current || !locationMapRef.current) return;
    draggingLocation.current = false;
    const bounds = locationMapRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(bounds.width, event.clientX - bounds.left));
    const y = Math.max(0, Math.min(bounds.height, event.clientY - bounds.top));
    const latitudeSpan = 0.016;
    const longitudeSpan = 0.016;
    const adjustedLatitude = latitude + latitudeSpan / 2 - (y / bounds.height) * latitudeSpan;
    const adjustedLongitude = longitude - longitudeSpan / 2 + (x / bounds.width) * longitudeSpan;
    const nextLatitude = adjustedLatitude.toFixed(6);
    const nextLongitude = adjustedLongitude.toFixed(6);
    setDragPosition(null);
    setFormData((current) => ({ ...current, latitude: nextLatitude, longitude: nextLongitude }));
    applyReverseGeocode(nextLatitude, nextLongitude);
  };

  const validateBooking = () => {
    if (!account) return "Log in with a customer account before booking.";
    if (account.role !== "customer") return "Provider accounts cannot create customer bookings. Log in with a customer account.";
    if (formData.paymentMethod === "upi" && !UPI_ID) return "UPI is not configured yet. Choose Cash on Delivery, or configure the FixNear UPI ID first.";
    if (!formData.service || !formData.description.trim() || !formData.address.trim() ||
        !formData.scheduledDate || !formData.scheduledTime) {
      return "Complete the service, problem description, address, date and time.";
    }
    const scheduledAt = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`);
    if (Number.isNaN(scheduledAt.getTime()) || scheduledAt <= new Date()) return "Choose a future date and time.";
    const hasLatitude = formData.latitude !== "";
    const hasLongitude = formData.longitude !== "";
    if (hasLatitude !== hasLongitude) return "Enter both coordinates or clear both fields.";
    if (hasLatitude && (!Number.isFinite(Number(formData.latitude)) || Number(formData.latitude) < -90 || Number(formData.latitude) > 90 ||
        !Number.isFinite(Number(formData.longitude)) || Number(formData.longitude) < -180 || Number(formData.longitude) > 180)) {
      return "Enter valid map coordinates.";
    }
    return "";
  };

  const handleReview = (event) => {
    event.preventDefault();
    setMessage("");
    const validationMessage = validateBooking();
    if (validationMessage) {
      setMessage(validationMessage);
      return;
    }
    setReviewing(true);
  };

  const handleSubmit = async () => {
    setMessage("");
    const validationMessage = validateBooking();
    if (validationMessage) {
      setMessage(validationMessage);
      setReviewing(false);
      return;
    }
    setSubmitting(true);
    try {
      const scheduledAt = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`).toISOString();
      const response = await API.post("/bookings", {
        providerId,
        service: formData.service,
        bookingType: formData.bookingType,
        paymentMethod: formData.paymentMethod,
        address: formData.address.trim(),
        description: formData.description.trim(),
        latitude: formData.latitude === "" ? undefined : Number(formData.latitude),
        longitude: formData.longitude === "" ? undefined : Number(formData.longitude),
        scheduledAt,
      });
      setCreatedBooking(response.data.booking);
      setReviewing(false);
    } catch (requestError) {
      setMessage(requestError.response?.data?.message || "Unable to create the booking. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="p-10 text-center">Loading provider...</p>;
  if (error || !provider) return <p className="p-10 text-center text-red-500">{error || "Provider not found"}</p>;

  const providerName = provider.user?.Name || "Professional";
  const hasCoordinates = formData.latitude !== "" && formData.longitude !== "" &&
    Number.isFinite(Number(formData.latitude)) && Number.isFinite(Number(formData.longitude));
  const latitude = Number(formData.latitude);
  const longitude = Number(formData.longitude);
  const mapSource = hasCoordinates
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.008}%2C${latitude - 0.008}%2C${longitude + 0.008}%2C${latitude + 0.008}&layer=mapnik&marker=${latitude}%2C${longitude}`
    : "https://www.openstreetmap.org/export/embed.html?bbox=77.37%2C28.57%2C77.40%2C28.60&layer=mapnik";
  const bookingPrice = formData.bookingType === "fix"
    ? `₹${provider.charges}`
    : formData.bookingType === "inspection"
      ? `₹${provider.inspectionFee ?? 100}`
      : "Provider will send a quotation";

  if (createdBooking) {
    return (
      <main className="min-h-[70vh] bg-gray-50 px-4 py-12">
        <section className="mx-auto max-w-2xl rounded-2xl bg-white p-6 shadow-sm sm:p-8">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl text-green-700">✓</div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Booking request sent</h1>
            <p className="mt-2 text-gray-600">Your request for {createdBooking.service} has been sent to {providerName}.</p>
            <p className="mt-2 text-sm text-gray-500">Booking reference: {createdBooking._id}</p>
          </div>
          <PaymentPanel booking={createdBooking} onBookingUpdated={setCreatedBooking} />
          <div className="mt-5 text-center">
            <Link to="/Mybooking" className="inline-flex rounded-lg bg-orange-500 px-5 py-3 font-semibold text-white hover:bg-orange-600">View my bookings</Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:py-10">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-6 text-3xl font-bold text-gray-900">Book your service</h1>
        {authChecked && !account && (
          <p className="mb-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900">
            Please <Link to="/" className="font-semibold underline">log in as a customer</Link> before booking.
          </p>
        )}
        {account?.role === "provider" && (
          <p className="mb-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900">You are logged in with a provider account. Sign out and log in with a customer account to book a service.</p>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-5">
          <section className="h-fit rounded-2xl border bg-white p-6 shadow-sm md:col-span-2">
            <div className="flex items-center gap-4">
              <img src={provider.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(providerName)}`} alt={providerName} className="h-20 w-20 rounded-xl object-cover" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">{providerName}</h2>
                <p className="text-sm text-gray-500">{provider.profession}</p>
                <p className="mt-1 text-sm text-gray-500">{provider.experience} years experience</p>
                <p className="mt-2 text-sm text-amber-700">{provider.ratingAverage > 0 ? `★ ${Number(provider.ratingAverage).toFixed(1)}` : "No ratings yet"}{provider.reviewCount > 0 ? ` · ${provider.reviewCount} ${provider.reviewCount === 1 ? "review" : "reviews"}` : ""}</p>
              </div>
            </div>
            <hr className="my-5" />
            <h3 className="font-semibold text-gray-900">Services offered</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {provider.services?.map((service) => <span key={service} className="rounded-full bg-orange-50 px-3 py-1 text-sm text-orange-700">{service}</span>)}
            </div>
            <p className="mt-5 text-sm text-gray-600">Starting charges: ₹{provider.charges}</p>
            <p className="mt-2 text-sm text-gray-600">Inspection fee: ₹{provider.inspectionFee ?? 100}</p>
            <p className="mt-2 text-sm text-gray-600">Service area: {provider.serviceArea?.join(", ") || "Not specified"}</p>
            <hr className="my-5" />
            <h3 className="font-semibold text-gray-900">Customer reviews</h3>
            {providerReviews.length === 0 ? <p className="mt-2 text-sm text-gray-500">No customer reviews yet.</p> : (
              <div className="mt-3 space-y-3">
                {providerReviews.slice(0, 4).map((review) => (
                  <div key={review._id} className="rounded-lg bg-gray-50 p-3">
                    <div className="flex justify-between gap-2 text-sm"><strong>{review.customer?.Name || "Customer"}</strong><span className="text-amber-600">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</span></div>
                    {review.comment && <p className="mt-1 text-sm text-gray-600">{review.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6 md:col-span-3">
            <h2 className="mb-5 text-xl font-bold text-gray-900">{reviewing ? "Review your booking" : "Booking details"}</h2>
            {reviewing ? (
              <div className="space-y-4">
                <dl className="grid gap-3 rounded-xl bg-gray-50 p-4 text-sm sm:grid-cols-2">
                  <div><dt className="text-gray-500">Provider</dt><dd className="font-semibold">{providerName}</dd></div>
                  <div><dt className="text-gray-500">Service</dt><dd className="font-semibold">{formData.service}</dd></div>
                  <div><dt className="text-gray-500">Booking type</dt><dd className="font-semibold">{formData.bookingType}</dd></div>
                  <div><dt className="text-gray-500">Payment method</dt><dd className="font-semibold">{formData.paymentMethod === "cod" ? "Cash on Delivery" : "UPI"}</dd></div>
                  <div><dt className="text-gray-500">Estimated total</dt><dd className="font-semibold">{bookingPrice}</dd></div>
                  <div className="sm:col-span-2 rounded-lg border border-gray-200 bg-white p-3 text-xs text-gray-600">Total uses the provider’s service or inspection charge. No extra platform or tax fee is currently added.</div>
                  <div><dt className="text-gray-500">Date and time</dt><dd className="font-semibold">{formData.scheduledDate} at {formData.scheduledTime}</dd></div>
                  <div className="sm:col-span-2"><dt className="text-gray-500">Service address</dt><dd className="font-semibold">{formData.address}</dd></div>
                  <div className="sm:col-span-2"><dt className="text-gray-500">Problem description</dt><dd className="font-semibold">{formData.description}</dd></div>
                </dl>
                <div className="flex flex-col-reverse gap-3 sm:flex-row">
                  <button type="button" onClick={() => setReviewing(false)} className="flex-1 rounded-lg border border-gray-300 py-3 font-semibold">Back to edit</button>
                  <button type="button" disabled={submitting} onClick={handleSubmit} className="flex-1 rounded-lg bg-orange-500 py-3 font-semibold text-white hover:bg-orange-600 disabled:opacity-60">{submitting ? "Submitting..." : "Confirm booking"}</button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleReview} className="space-y-5">
                <label className="block text-sm font-medium">Booking type
                  <select name="bookingType" value={formData.bookingType} onChange={handleChange} className="mt-1 w-full rounded-lg border p-3 outline-none focus:border-orange-500">
                    <option value="fix">Fix service</option><option value="inspection">Inspection / visit</option><option value="quotation">Quotation</option>
                  </select>
                </label>
                <label className="block text-sm font-medium">Service
                  <select name="service" value={formData.service} onChange={handleChange} required className="mt-1 w-full rounded-lg border p-3 outline-none focus:border-orange-500">
                    <option value="">Choose a service</option>
                    {provider.services?.map((service) => <option key={service} value={service}>{service}</option>)}
                  </select>
                </label>
                <label className="block text-sm font-medium">Describe the problem
                  <textarea name="description" value={formData.description} onChange={handleChange} required maxLength="2000" rows="3" placeholder="Explain what service you need..." className="mt-1 w-full rounded-lg border p-3 outline-none focus:border-orange-500" />
                </label>

                <div className="space-y-3 rounded-xl border border-gray-200 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="text-sm font-semibold">Service location</label>
                    <button type="button" onClick={useCurrentLocation} className="rounded-lg border border-orange-500 px-3 py-2 text-sm font-semibold text-orange-600 hover:bg-orange-50">Use my current location</button>
                  </div>
                  {locationMessage && <p role="status" className="text-sm text-gray-600">{locationMessage}</p>}
                  <div ref={locationMapRef} className="relative h-56 overflow-hidden rounded-lg border">
                    <iframe title="Booking service location map" src={mapSource} className="h-full w-full" loading="lazy" />
                    {hasCoordinates && (
                      <button type="button" aria-label="Drag to adjust service location" title="Drag to adjust location" onPointerDown={handlePinPointerDown} onPointerMove={handlePinPointerMove} onPointerUp={handlePinPointerUp} onPointerCancel={handlePinPointerUp} className="absolute z-[5] flex h-9 w-9 -translate-x-1/2 -translate-y-full touch-none items-center justify-center rounded-full border-2 border-white bg-orange-500 text-lg text-white shadow-lg" style={{ left: dragPosition?.x ?? "50%", top: dragPosition?.y ?? "50%" }}>●</button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">Drag the orange pin to adjust the location. You can also edit the coordinates below.</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="text-sm">Latitude
                      <input name="latitude" type="number" step="any" min="-90" max="90" value={formData.latitude} onChange={handleChange} placeholder="e.g. 22.7196" className="mt-1 w-full rounded-lg border p-3" />
                    </label>
                    <label className="text-sm">Longitude
                      <input name="longitude" type="number" step="any" min="-180" max="180" value={formData.longitude} onChange={handleChange} placeholder="e.g. 75.8577" className="mt-1 w-full rounded-lg border p-3" />
                    </label>
                  </div>
                  <button type="button" disabled={!hasCoordinates || reverseGeocoding} onClick={updateAddressFromCoordinates} className="rounded-md px-1 py-1 text-sm font-semibold text-orange-600 disabled:text-gray-400">{reverseGeocoding ? "Finding address..." : "Update address from map coordinates"}</button>
                  <label className="block text-sm font-medium">Complete address
                    <textarea name="address" value={formData.address} onChange={handleChange} required rows="2" maxLength="500" placeholder="House / street, area, city, postal code" className="mt-1 w-full rounded-lg border p-3 outline-none focus:border-orange-500" />
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="text-sm font-medium">Preferred date
                    <input type="date" name="scheduledDate" value={formData.scheduledDate} onChange={handleChange} min={localDate()} required className="mt-1 w-full rounded-lg border p-3" />
                  </label>
                  <label className="text-sm font-medium">Preferred time
                    <input type="time" name="scheduledTime" value={formData.scheduledTime} onChange={handleChange} required className="mt-1 w-full rounded-lg border p-3" />
                  </label>
                </div>

                <fieldset>
                  <legend className="mb-2 text-sm font-semibold text-gray-800">Choose payment method</legend>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      { id: "cod", title: "Cash on Delivery", detail: "Pay the provider after the service" },
                      { id: "upi", title: "UPI", detail: UPI_ID ? `Pay to ${UPI_ID} after acceptance` : "Configure a FixNear UPI ID to enable" },
                    ].map((method) => (
                      <label key={method.id} className={`flex cursor-pointer gap-3 rounded-xl border p-4 ${formData.paymentMethod === method.id ? "border-orange-500 bg-orange-50" : "border-gray-200"}`}>
                        <input type="radio" name="paymentMethod" value={method.id} checked={formData.paymentMethod === method.id} onChange={handleChange} className="mt-1 accent-orange-500" />
                        <span><span className="block font-semibold text-gray-900">{method.title}</span><span className="mt-1 block text-xs text-gray-600">{method.detail}</span></span>
                      </label>
                    ))}
                  </div>
                </fieldset>
                {message && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{message}</p>}
                <button type="submit" className="w-full rounded-lg bg-orange-500 py-3 font-semibold text-white transition hover:bg-orange-600">Review booking details →</button>
              </form>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

export default BookingPage;

import { useState } from "react";
import API from "../api.js";

const categories = [
  "Electrician",
  "Plumber",
  "Carpenter",
  "AC Technician",
  "Laptop Repair",
  "Painter",
  "Cleaner",
  "Appliance Repair",
  "Other",
];

const splitList = (value) =>
  value.split(",").map((item) => item.trim()).filter(Boolean);

function Singup({ onSwitch, onAuthenticated }) {
  const [providerMode, setProviderMode] = useState(false);
  const [formData, setFormData] = useState({
    Name: "",
    Email: "",
    Phone: "",
    Password: "",
    ConfirmPassword: "",
    profession: "Electrician",
    otherProfession: "",
    services: "",
    experience: "",
    description: "",
    address: "",
    latitude: "",
    longitude: "",
    serviceArea: "",
    charges: "",
    inspectionFee: "100",
    isAvailable: true,
    workingHours: "",
  });
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [locationMessage, setLocationMessage] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationMessage("This browser does not support location access.");
      return;
    }

    setLocationMessage("Getting your location...");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setFormData((current) => ({
          ...current,
          latitude: coords.latitude.toFixed(6),
          longitude: coords.longitude.toFixed(6),
        }));
        setLocationMessage("Location added. Please confirm your address below.");
      },
      () => setLocationMessage("Location access failed. You can enter coordinates manually."),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0] || null;
    setProfileImage(file);
    setImagePreview(file ? URL.createObjectURL(file) : "");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    if (formData.Password !== formData.ConfirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }
    if (formData.Password.length < 8) {
      setMessage("Password must be at least 8 characters.");
      return;
    }

    const data = new FormData();
    data.append("Name", formData.Name.trim());
    data.append("Email", formData.Email.trim());
    data.append("Phone", formData.Phone.trim());
    data.append("Password", formData.Password);
    data.append("ConfirmPassword", formData.ConfirmPassword);
    data.append("role", providerMode ? "provider" : "customer");

    if (providerMode) {
      const latitude = Number(formData.latitude);
      const longitude = Number(formData.longitude);
      const profession = formData.profession === "Other"
        ? formData.otherProfession.trim()
        : formData.profession;

      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        setMessage("Add your current latitude and longitude before registering.");
        return;
      }
      if (!profileImage) {
        setMessage("Please choose a profile picture.");
        return;
      }

      data.append("providerProfile", JSON.stringify({
        profession,
        services: splitList(formData.services),
        experience: Number(formData.experience),
        description: formData.description.trim(),
        address: formData.address.trim(),
        latitude,
        longitude,
        serviceArea: splitList(formData.serviceArea),
        charges: Number(formData.charges),
        inspectionFee: Number(formData.inspectionFee),
        isAvailable: formData.isAvailable,
        workingHours: formData.workingHours.trim(),
      }));
      data.append("profileImage", profileImage);
    }

    try {
      setLoading(true);
      const response = await API.post("/auth/signup", data);
      onAuthenticated?.(response.data.user);
    } catch (error) {
      setMessage(error.response?.data?.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const hasCoordinates = Number.isFinite(Number(formData.latitude)) &&
    Number.isFinite(Number(formData.longitude)) &&
    formData.latitude !== "" && formData.longitude !== "";
  const latitude = Number(formData.latitude);
  const longitude = Number(formData.longitude);
  const mapSource = hasCoordinates
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.01}%2C${latitude - 0.01}%2C${longitude + 0.01}%2C${latitude + 0.01}&layer=mapnik&marker=${latitude}%2C${longitude}`
    : "";

  const inputClass = "mt-1 w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-orange-500";

  return (
    <div className="flex items-center justify-center py-8">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-lg sm:p-8">
        <h1 className="text-center text-3xl font-bold">
          Welcome to <span className="text-orange-500">FixNear</span>
        </h1>
        <p className="mb-6 mt-2 text-center text-gray-500">
          {providerMode ? "Create your provider account and profile." : "Create a customer account."}
        </p>

        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium text-gray-700">
            Full name
            <input name="Name" value={formData.Name} onChange={handleChange} required className={inputClass} autoComplete="name" />
          </label>
          <label className="text-sm font-medium text-gray-700">
            Email address
            <input name="Email" type="email" value={formData.Email} onChange={handleChange} required className={inputClass} autoComplete="email" />
          </label>
          <label className="text-sm font-medium text-gray-700">
            Phone number
            <input name="Phone" type="tel" value={formData.Phone} onChange={handleChange} required className={inputClass} autoComplete="tel" />
          </label>
          <label className="text-sm font-medium text-gray-700">
            Password
            <input name="Password" type="password" minLength="8" value={formData.Password} onChange={handleChange} required className={inputClass} autoComplete="new-password" />
          </label>
          <label className="text-sm font-medium text-gray-700 sm:col-span-2">
            Confirm password
            <input name="ConfirmPassword" type="password" minLength="8" value={formData.ConfirmPassword} onChange={handleChange} required className={inputClass} autoComplete="new-password" />
          </label>

          {providerMode && (
            <>
              <div className="sm:col-span-2">
                <label className="text-sm font-medium text-gray-700">
                  Profile picture
                  <input type="file" accept="image/*" onChange={handleImageChange} required className={inputClass} />
                </label>
                {imagePreview && <img src={imagePreview} alt="Profile preview" className="mt-3 h-24 w-24 rounded-xl object-cover" />}
              </div>

              <label className="text-sm font-medium text-gray-700">
                Profession / service category
                <select name="profession" value={formData.profession} onChange={handleChange} className={inputClass}>
                  {categories.map((category) => <option key={category}>{category}</option>)}
                </select>
              </label>
              {formData.profession === "Other" && (
                <label className="text-sm font-medium text-gray-700">
                  Enter profession
                  <input name="otherProfession" value={formData.otherProfession} onChange={handleChange} required className={inputClass} />
                </label>
              )}
              <label className="text-sm font-medium text-gray-700 sm:col-span-2">
                Services offered (comma separated)
                <input name="services" value={formData.services} onChange={handleChange} required className={inputClass} placeholder="Wiring, fan repair" />
              </label>
              <label className="text-sm font-medium text-gray-700">
                Years of experience
                <input name="experience" type="number" min="0" step="1" value={formData.experience} onChange={handleChange} required className={inputClass} />
              </label>
              <label className="text-sm font-medium text-gray-700">
                Starting charges (₹)
                <input name="charges" type="number" min="0" step="0.01" value={formData.charges} onChange={handleChange} required className={inputClass} />
              </label>
              <label className="text-sm font-medium text-gray-700">
                Inspection fee (₹)
                <input name="inspectionFee" type="number" min="0" step="0.01" value={formData.inspectionFee} onChange={handleChange} required className={inputClass} />
              </label>
              <label className="text-sm font-medium text-gray-700">
                Service area (comma separated)
                <input name="serviceArea" value={formData.serviceArea} onChange={handleChange} required className={inputClass} placeholder="Indore, Rau" />
              </label>
              <label className="text-sm font-medium text-gray-700 sm:col-span-2">
                About you
                <textarea name="description" value={formData.description} onChange={handleChange} required rows="3" maxLength="2000" className={inputClass} placeholder="Tell customers about your experience and work." />
              </label>

              <div className="sm:col-span-2">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="text-sm font-medium text-gray-700">Current location</span>
                  <button type="button" onClick={getCurrentLocation} className="rounded-lg border border-orange-500 px-4 py-2 text-sm font-semibold text-orange-600 hover:bg-orange-50">
                    Use my current location
                  </button>
                </div>
                {locationMessage && <p className="mt-2 text-sm text-gray-600">{locationMessage}</p>}
              </div>
              <label className="text-sm font-medium text-gray-700">
                Latitude
                <input name="latitude" type="number" step="any" min="-90" max="90" value={formData.latitude} onChange={handleChange} required className={inputClass} />
              </label>
              <label className="text-sm font-medium text-gray-700">
                Longitude
                <input name="longitude" type="number" step="any" min="-180" max="180" value={formData.longitude} onChange={handleChange} required className={inputClass} />
              </label>
              <label className="text-sm font-medium text-gray-700 sm:col-span-2">
                Complete address
                <textarea name="address" value={formData.address} onChange={handleChange} required rows="2" className={inputClass} autoComplete="street-address" />
              </label>
              {mapSource && (
                <iframe title="Selected provider location map" src={mapSource} className="h-56 w-full rounded-lg border sm:col-span-2" loading="lazy" />
              )}
              <label className="text-sm font-medium text-gray-700 sm:col-span-2">
                Working hours (optional)
                <input name="workingHours" value={formData.workingHours} onChange={handleChange} className={inputClass} placeholder="Monday–Saturday, 9 AM–6 PM" />
              </label>
              <label className="flex items-center gap-3 text-sm font-medium text-gray-700 sm:col-span-2">
                <input name="isAvailable" type="checkbox" checked={formData.isAvailable} onChange={handleChange} className="h-4 w-4 accent-orange-500" />
                Available for new bookings
              </label>
            </>
          )}

          {message && <p role="alert" className="text-sm text-red-600 sm:col-span-2">{message}</p>}

          {!providerMode && (
            <button type="button" onClick={() => setProviderMode(true)} className="rounded-lg border border-orange-500 py-3 font-semibold text-orange-600 hover:bg-orange-50 sm:col-span-2">
              Become a Provider
            </button>
          )}
          {providerMode && (
            <button type="button" onClick={() => setProviderMode(false)} className="text-sm font-semibold text-orange-600 hover:underline sm:col-span-2">
              Back to Customer Signup
            </button>
          )}

          <button type="submit" disabled={loading} className="w-full rounded-lg bg-orange-500 py-3 font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2">
            {loading ? "Creating account..." : providerMode ? "Create Provider Account" : "Create Customer Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600">
          Already have an account?{" "}
          <button type="button" className="font-semibold text-orange-500 hover:underline" onClick={onSwitch}>Login</button>
        </p>
      </div>
    </div>
  );
}

export default Singup;

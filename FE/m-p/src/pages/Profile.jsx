import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../componet/api.js";

function Profile() {
  const [account, setAccount] = useState(null);
  const [formData, setFormData] = useState({ Name: "", Email: "", phone: "", address: "" });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    API.get("/auth/profile")
      .then(({ data }) => {
        if (!active) return;
        const user = data.user;
        setAccount(user);
        setFormData({
          Name: user.Name || "",
          Email: user.Email || "",
          phone: user.phone || "",
          address: user.address || "",
        });
        setPreview(user.profileImage || "");
      })
      .catch((requestError) => {
        if (active) setError(requestError.response?.status === 401 ? "Log in to view and edit your profile." : requestError.response?.data?.message || "Unable to load your profile.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const handleChange = (event) => {
    setFormData((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleImage = (event) => {
    const selected = event.target.files?.[0] || null;
    setImage(selected);
    setPreview(selected ? URL.createObjectURL(selected) : account?.profileImage || "");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    if (!formData.Name.trim() || !formData.Email.trim() || !formData.phone.trim()) {
      setError("Name, email, and phone number are required.");
      return;
    }
    const payload = new FormData();
    payload.append("Name", formData.Name.trim());
    payload.append("Email", formData.Email.trim());
    payload.append("phone", formData.phone.trim());
    payload.append("address", formData.address.trim());
    if (image) payload.append("profileImage", image);

    setSaving(true);
    try {
      const { data } = await API.put("/auth/profile", payload);
      setAccount((current) => ({ ...current, ...data.user }));
      setFormData({
        Name: data.user.Name || "",
        Email: data.user.Email || "",
        phone: data.user.phone || "",
        address: data.user.address || "",
      });
      setPreview(data.user.profileImage || "");
      setImage(null);
      setMessage("Your profile has been updated.");
      setEditing(false);
      window.dispatchEvent(new CustomEvent("auth:user-updated", { detail: data.user }));
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to save your profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="p-10 text-center text-gray-600">Loading profile...</p>;
  if (error && !account) {
    return <main className="mx-auto max-w-2xl px-4 py-12"><p className="rounded-xl bg-amber-50 p-5 text-amber-900">{error}</p><Link to="/" className="mt-4 inline-block font-semibold text-orange-600">Go to home</Link></main>;
  }

  return (
    <main className="min-h-[75vh] bg-gray-50 px-4 py-8 sm:py-12">
      <section className="mx-auto max-w-3xl rounded-2xl border bg-white p-5 shadow-sm sm:p-8">
        <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
          <div><p className="text-sm font-semibold uppercase tracking-wide text-orange-600">{account.role} account</p><h1 className="mt-1 text-2xl font-bold text-gray-900">Your profile</h1></div>
          <Link to={account.role === "provider" ? "/Provider" : "/Mybooking"} className="text-sm font-semibold text-orange-600 hover:underline">{account.role === "provider" ? "Provider dashboard" : "My bookings"}</Link>
        </div>

        {!editing ? (
          <>
            <div className="mb-6 flex items-center gap-4 rounded-xl bg-gray-50 p-4">
              <img src={preview || `https://ui-avatars.com/api/?name=${encodeURIComponent(account.Name || "FixNear")}`} alt="Profile" className="h-20 w-20 rounded-full border object-cover" />
              <div><p className="font-semibold text-gray-900">{account.Name}</p><p className="text-sm text-gray-600">{account.Email}</p><p className="mt-1 text-xs capitalize text-gray-500">{account.role} account</p></div>
            </div>
            <dl className="grid gap-4 rounded-xl border p-5 text-sm sm:grid-cols-2">
              <div><dt className="text-gray-500">Phone</dt><dd className="mt-1 font-medium text-gray-900">{account.phone || "—"}</dd></div>
              <div><dt className="text-gray-500">Address</dt><dd className="mt-1 font-medium text-gray-900">{account.address || "—"}</dd></div>
              {account.role === "provider" && account.profession && <>
                <div><dt className="text-gray-500">Profession</dt><dd className="mt-1 font-medium text-gray-900">{account.profession}</dd></div>
                <div><dt className="text-gray-500">Experience</dt><dd className="mt-1 font-medium text-gray-900">{account.experience} years</dd></div>
                <div className="sm:col-span-2"><dt className="text-gray-500">Services</dt><dd className="mt-1 font-medium text-gray-900">{account.services?.join(", ") || "—"}</dd></div>
                <div className="sm:col-span-2"><dt className="text-gray-500">Service area</dt><dd className="mt-1 font-medium text-gray-900">{account.serviceArea?.join(", ") || "—"}</dd></div>
              </>}
            </dl>
            <button type="button" onClick={() => { setEditing(true); setMessage(""); setError(""); }} className="mt-6 w-full rounded-lg bg-orange-500 py-3 font-semibold text-white hover:bg-orange-600 sm:w-auto sm:px-8">Edit Profile</button>
            {message && <p role="status" className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">{message}</p>}
          </>
        ) : (
        <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-medium text-gray-700">Full name
            <input name="Name" value={formData.Name} onChange={handleChange} required maxLength="50" autoComplete="name" className="mt-1 w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-orange-500" />
          </label>
          <label className="text-sm font-medium text-gray-700">Email address
            <input name="Email" type="email" value={formData.Email} onChange={handleChange} required autoComplete="email" className="mt-1 w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-orange-500" />
          </label>
          <label className="text-sm font-medium text-gray-700">Phone number
            <input name="phone" type="tel" value={formData.phone} onChange={handleChange} required autoComplete="tel" className="mt-1 w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-orange-500" />
          </label>
          <label className="text-sm font-medium text-gray-700">Profile image
            <input type="file" accept="image/*" onChange={handleImage} className="mt-1 w-full rounded-lg border border-gray-300 p-2.5" />
            <span className="mt-1 block text-xs font-normal text-gray-500">Image files up to 2 MB</span>
          </label>
          <label className="text-sm font-medium text-gray-700 sm:col-span-2">Address
            <textarea name="address" value={formData.address} onChange={handleChange} rows="3" maxLength="500" className="mt-1 w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-orange-500" />
          </label>
          {account.role === "provider" && account.profession && (
            <div className="rounded-xl border border-orange-100 bg-orange-50/50 p-4 text-sm sm:col-span-2">
              <p className="font-semibold text-gray-900">Professional details</p>
              <p className="mt-2 text-gray-700">{account.profession} · {account.experience} years experience</p>
              <p className="mt-1 text-gray-600">Services: {account.services?.join(", ") || "—"}</p>
              <p className="mt-1 text-gray-600">Service area: {account.serviceArea?.join(", ") || "—"}</p>
            </div>
          )}
          {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700 sm:col-span-2">{error}</p>}
          {message && <p role="status" className="rounded-lg bg-green-50 p-3 text-sm text-green-700 sm:col-span-2">{message}</p>}
          <div className="sm:col-span-2">
            <div className="flex flex-col gap-3 sm:flex-row">
              <button type="submit" disabled={saving} className="w-full rounded-lg bg-orange-500 py-3 font-semibold text-white hover:bg-orange-600 disabled:opacity-60 sm:w-auto sm:px-8">{saving ? "Saving..." : "Save profile"}</button>
              <button type="button" disabled={saving} onClick={() => { setEditing(false); setError(""); setImage(null); setPreview(account.profileImage || ""); }} className="w-full rounded-lg border border-gray-300 py-3 font-semibold text-gray-700 disabled:opacity-60 sm:w-auto sm:px-8">Cancel</button>
            </div>
          </div>
        </form>
        )}
      </section>
    </main>
  );
}

export default Profile;

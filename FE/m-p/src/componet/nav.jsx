import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { LogOut, UserRound, X } from "lucide-react";
import fixnear from "./asset/fixnear.svg";
import Srvice from "./Srvice.jsx";
import Auth from "./auth/Auth.jsx";
import API from "./api.js";

function Nav() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showAccount, setShowAccount] = useState(false);

  useEffect(() => {
    let active = true;

    API.get("/auth/me")
      .then(({ data }) => {
        if (active) setCurrentUser(data.user);
      })
      .catch((error) => {
        if (error.response?.status !== 401) {
          console.error("Unable to restore login session:", error);
        }
      })
      .finally(() => {
        if (active) setAuthLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const updateAccount = (event) => setCurrentUser((user) => ({ ...user, ...event.detail }));
    window.addEventListener("auth:user-updated", updateAccount);
    return () => window.removeEventListener("auth:user-updated", updateAccount);
  }, []);

  const openAuth = (mode) => {
    setAuthMode(mode);
    setShowAuth(true);
    setShowAccount(false);
  };

  const handleAuthenticated = (user) => {
    setCurrentUser(user);
    setShowAuth(false);
    setOpen(false);
    if (user.role === "provider") navigate("/Provider");
    else navigate("/");
  };

  const handleLogout = async () => {
    try {
      await API.post("/auth/logout");
      setCurrentUser(null);
      setShowAccount(false);
      setOpen(false);
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Services", path: "/Services" },
    ...(currentUser?.role === "provider"
      ? [{ name: "Provider Dashboard", path: "/Provider" }]
      : currentUser?.role === "customer"
        ? [{ name: "My Booking", path: "/Mybooking" }]
        : []),
  ];

  const accountLink = "/Profile";
  const accountLinkLabel = "Edit profile";
  const dashboardLink = currentUser?.role === "provider" ? "/Provider" : "/Mybooking";
  const dashboardLinkLabel = currentUser?.role === "provider" ? "Provider Dashboard" : "My bookings";

  return (
    <>
      <header className="sticky top-0 z-50 mt-2.5 flex h-15 w-full items-center justify-between border-b border-black bg-white/90 px-3 backdrop-blur-sm sm:px-5">
        <Link to="/" aria-label="FixNear home" className="h-full w-32 shrink-0 bg-contain bg-left bg-no-repeat sm:w-44 lg:w-56" style={{ backgroundImage: `url(${fixnear})` }} />

        <nav className="ml-5 hidden h-12 w-full max-w-xl items-center justify-evenly lg:flex">
          {navLinks.map((link) => (
            <Link key={link.name} to={link.path} className="py-1 transition hover:text-orange-600">
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:block">
          <Srvice />
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2 lg:ml-3">
          {!authLoading && !currentUser && (
            <div className="hidden items-center sm:flex">
              <button type="button" onClick={() => openAuth("login")} className="h-10 rounded-l-full border border-gray-300 px-4 transition hover:bg-orange-500 hover:text-white">
                Login
              </button>
              <button type="button" onClick={() => openAuth("signup")} className="h-10 rounded-r-full border border-l-0 border-gray-300 px-4 transition hover:bg-orange-500 hover:text-white">
                Sign-Up
              </button>
            </div>
          )}

          {currentUser && (
            <>
              <div className="relative hidden sm:block">
                <button
                  type="button"
                  aria-label="Account profile"
                  aria-expanded={showAccount}
                  onClick={() => setShowAccount((visible) => !visible)}
                  className="flex h-10 items-center gap-2 rounded-full border border-gray-300 px-3 hover:border-orange-500"
                >
                  <UserRound size={19} />
                  <span className="max-w-28 truncate">{currentUser.Name}</span>
                </button>
                {showAccount && (
                  <div className="absolute right-0 top-12 z-[60] w-64 rounded-xl border bg-white p-4 shadow-xl">
                    <p className="font-semibold text-gray-900">{currentUser.Name}</p>
                    <p className="mt-1 break-all text-sm text-gray-600">{currentUser.Email}</p>
                    <p className="mt-2 text-xs font-semibold uppercase text-orange-600">{currentUser.role} account</p>
                    <Link to={accountLink} onClick={() => setShowAccount(false)} className="mt-3 block text-sm text-gray-700 hover:text-orange-600">
                      {accountLinkLabel}
                    </Link>
                    <Link to={dashboardLink} onClick={() => setShowAccount(false)} className="mt-2 block text-sm text-gray-700 hover:text-orange-600">
                      {dashboardLinkLabel}
                    </Link>
                  </div>
                )}
              </div>
              <button type="button" onClick={handleLogout} className="hidden h-10 items-center gap-2 rounded-full border border-gray-300 px-4 hover:bg-orange-500 hover:text-white sm:flex">
                <LogOut size={17} /> Logout
              </button>
            </>
          )}

          <button type="button" className="rounded-md p-2 hover:bg-orange-100 lg:hidden" onClick={() => setOpen((value) => !value)} aria-label="Toggle menu" aria-expanded={open}>
            <span className="flex w-6 flex-col gap-1.5">
              <span className={`h-0.5 bg-black transition-all ${open ? "translate-y-2 rotate-45" : ""}`} />
              <span className={`h-0.5 bg-black transition-all ${open ? "opacity-0" : ""}`} />
              <span className={`h-0.5 bg-black transition-all ${open ? "-translate-y-2 -rotate-45" : ""}`} />
            </span>
          </button>
        </div>

        {open && (
          <div className="absolute left-0 top-full flex w-full flex-col gap-4 bg-white p-5 shadow-md lg:hidden">
            {navLinks.map((link) => (
              <Link key={link.name} to={link.path} onClick={() => setOpen(false)} className="py-1 font-medium hover:text-orange-600">
                {link.name}
              </Link>
            ))}
            <Srvice />
            {currentUser ? (
              <div className="border-t pt-4 sm:hidden">
                <p className="font-semibold">{currentUser.Name}</p>
                <p className="text-sm text-gray-600">{currentUser.Email}</p>
                <p className="mt-1 text-xs font-semibold uppercase text-orange-600">{currentUser.role} account</p>
                <Link to={accountLink} onClick={() => setOpen(false)} className="mt-3 block text-sm text-gray-700">{accountLinkLabel}</Link>
                <Link to={dashboardLink} onClick={() => setOpen(false)} className="mt-2 block text-sm text-gray-700">{dashboardLinkLabel}</Link>
                <button type="button" onClick={handleLogout} className="mt-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <LogOut size={16} /> Logout
                </button>
              </div>
            ) : !authLoading && (
              <div className="flex gap-2 border-t pt-4 sm:hidden">
                <button type="button" onClick={() => openAuth("login")} className="h-10 flex-1 rounded-full border border-gray-300 hover:bg-orange-500 hover:text-white">Login</button>
                <button type="button" onClick={() => openAuth("signup")} className="h-10 flex-1 rounded-full border border-gray-300 hover:bg-orange-500 hover:text-white">Sign-Up</button>
              </div>
            )}
          </div>
        )}
      </header>

      {showAuth && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <button type="button" aria-label="Close authentication dialog" className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowAuth(false)} />
          <div className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">
            <button type="button" onClick={() => setShowAuth(false)} aria-label="Close" className="absolute right-3 top-3 z-10 rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-black">
              <X className="h-5 w-5" />
            </button>
            <Auth initialMode={authMode} onAuthenticated={handleAuthenticated} />
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}

export default Nav;

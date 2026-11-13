
import Nav from "./componet/nav";
import Home from "./pages/Home";
import { Route,Routes } from "react-router-dom";
import Services from "./pages/Services";
import Mybooking from "./pages/Mybooking";
import Provider from "./pages/Provider";
import BookingPage from "./pages/BookingPage";
import Profile from "./pages/Profile";

// import axios from "axios";

function App() {
  return (
    <div>
      <Nav />
     <Routes>
      <Route path="/" element={<Home/>}/>
      <Route path="/Services" element={<Services/>}/>
      <Route path="/Mybooking" element={<Mybooking/>}/>
      <Route path="/Provider"  element={<Provider/>}/>
      <Route path="/Profile" element={<Profile/>}/>
      <Route path="/bookingpage" element={<BookingPage/>} />
      <Route path="*" element={<h1>nothing</h1>}/>
     </Routes>
    </div>
  );
}

export default App;

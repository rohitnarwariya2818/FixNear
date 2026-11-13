// // function Home(){
// //   return(
// //     <div className="bg-red-500 h-full w-1/2">

// //     </div>
// //   )
// // };

// import two from "./two.png";
// import men from "./option/men.png";
// import women from "./option/women.png";
// import vac from "./option/vac.png";
// import ac from "./option/ac.png";
// import srv from "./option/srv.png";
// import menu from "./option/menu.png";
// import { Star, UsersRound } from "lucide-react";

// function Home() {
//   return (
//     <div className="flex flex-wrap">
//       <div className=" h-160 w-1/2 border-2 border-gray-200 rounded-xl ml-5 mt-5">
//         <div className=" h-1/4 w-full rounded-xl flex justify-center items-center">
//           <div className="h-25 w-full  text-4xl font-bold overflow-hidden text-center flex justify-center items-center text-shadow-lg">
//             <h2>Home service at your doorstep</h2>
//           </div>
//         </div>
//         {/* Service box */}
//         <div className=" h-50 w-150 rounded-xl flex  justify-center items-center ml-15 mt-10 border-0.5 border-black shadow-xl/30 ">
//           <div className="grid grid-cols-3 gap-4 ">
//             <div className=" bg-gray-100  h-20 w-40 rounded-xl flex items-center justify-center text-xs font-bold text-wrap align-middle text-center  transition delay-150 duration-700 ease-in-out hover:-translate-z-2 hover:scale-110 hover:bg-white-500">
//               <img src={men} alt="men" className="w-19 h-14" />
//               Men's Salon & Massage
//             </div>
//             <div className=" h-20 w-40 rounded-xl flex items-center justify-center text-xs font-bold text-wrap align-middle text-center border-1 border-black transition delay-150 duration-700 ease-in-out hover:-translate-y-1 hover:scale-110 hover:bg-white-500">
//               <img src={women} alt="men" className="w-19 h-14" />
//               women Salon & Sap
//             </div>
//             <div className="  h-20 w-40 rounded-xl flex items-center justify-center text-xs font-bold text-wrap align-middle text-center border-1 border-black transition delay-150 duration-700 ease-in-out hover:-translate-y-1 hover:scale-110 hover:bg-white-500">
//               <img src={vac} alt="men" className="w-19 h-14" />
//               Vacuum Cleanin1
//             </div>
//             <div className="  h-20 w-40 rounded-xl flex items-center justify-center text-xs font-bold text-wrap align-middle text-center border-1 border-black transition delay-150 duration-700 ease-in-out hover:-translate-y-1 hover:scale-110 hover:bg-white-500">
//               <img src={ac} alt="men" className="w-19 h-14" />
//               Air Conditioning
//             </div>
//             <div className="  h-20 w-40 rounded-xl flex items-center justify-center text-xs font-bold text-wrap align-middle text-center border-1 border-black transition delay-150 duration-700 ease-in-out hover:-translate-y-1 hover:scale-110 hover:bg-white-500">
//               <img src={srv} alt="men" className="w-19 h-14" />
//               Services
//             </div>
//             <div className="  h-20 w-40 rounded-xl flex items-center justify-center text-xs font-bold text-wrap align-middle text-center border-1 border-black transition delay-150 duration-700 ease-in-out hover:-translate-y-1 hover:scale-110 hover:bg-white-500">
//               <img src={menu} alt="men" className="w-19 h-14" />
//               All services
//             </div>
//           </div>
//         </div>

//         <div className="flex  justify-center items-center gap-10 p-4 mt-25 ">
//           {/* Service Rating */}
//           <div className="flex items-start gap-4">
//             <Star size={40} strokeWidth={1.5} />

//             <div>
//               <h2 className="text-2xl font-medium leading-none transition delay-150 duration-700 ease-in-out hover:-translate-z-5   hover:scale-110 hover:bg-white-500 ">4.8</h2>
//               <p className="mt-3 text-base text-gray-600 whitespace-nowrap">
//                 Service Rating*
//               </p>
//             </div>
//           </div>
//           {/* Customers Globally */}
//           <div className="flex items-start gap-4">
//             <UsersRound size={40} strokeWidth={1.5} />

//             <div>
//               <h2 className="text-2xl font-medium leading-none">12M+</h2>
//               <p className="mt-3 text-base text-gray-600 whitespace-nowrap">
//                 Customers Globally*
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>

//       <diV
//         className="bg-cover h-150 w-150 rounded-xl ml-5 mt-5  shadow-xl/30"
//         style={{ backgroundImage: `url(${two})` }}
//       ></diV>
//     </div>
//   );
// }

// export default Home;

// // export default Home;




import fixnearcollage from "./option/fixnearcollage.png";
import men from "./option/men.png";
import women from "./option/women.png";
import vac from "./option/vac.png";
import ac from "./option/ac.png";
import srv from "./option/srv.png";
import menu from "./option/menu.png";
import { Star, UsersRound } from "lucide-react";

const services = [
  { img: men, alt: "Men's salon", label: "Men's Salon & Massage" },
  { img: women, alt: "Women's salon", label: "Women's Salon & Spa" },
  { img: vac, alt: "Vacuum cleaning", label: "Vacuum Cleaning" },
  { img: ac, alt: "Air conditioning", label: "Air Conditioning" },
  { img: srv, alt: "Services", label: "Services" },
  { img: menu, alt: "All services", label: "All services" },
];

const tileClass =
  "h-20 w-full rounded-xl flex items-center justify-center gap-1 px-1 text-xs font-bold text-center border border-black bg-white " +
  "transition duration-300 ease-in-out hover:-translate-y-1 hover:scale-105";

function Home() {
  return (
    // Mobile/tablet: stacked (column). Laptop (lg+): side by side (row)
    <div className="flex flex-col lg:flex-row gap-5 p-4 sm:p-5 justify-evenly">
      {/* LEFT CARD */}
      <div className="w-full lg:w-1/2 min-h-0 lg:min-h-160 border-2 border-gray-200 rounded-xl p-4 sm:p-6 flex flex-col">
        {/* Heading */}
        <div className="flex justify-center items-center text-center py-4 sm:py-6">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-shadow-lg">
            Home service at your doorstep
          </h2>
        </div>

        {/* Service box */}
        <div className="w-full max-w-xl mx-auto mt-4 sm:mt-8 rounded-xl shadow-xl/30 p-4 sm:p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {services.map((s) => (
              <div key={s.label} className={tileClass}>
                <img
                  src={s.img}
                  alt={s.alt}
                  className="w-10 h-10 sm:w-14 sm:h-14 object-contain shrink-0"
                />
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-10 p-4 mt-8 lg:mt-auto">
          <div className="flex items-start gap-4">
            <Star size={40} strokeWidth={1.5} />
            <div>
              <h2 className="text-2xl font-medium leading-none">4.8</h2>
              <p className="mt-3 text-sm sm:text-base text-gray-600 whitespace-nowrap">
                Service Rating*
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <UsersRound size={40} strokeWidth={1.5} />
            <div>
              <h2 className="text-2xl font-medium leading-none">12M+</h2>
              <p className="mt-3 text-sm sm:text-base text-gray-600 whitespace-nowrap">
                Customers Globally*
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT IMAGE */}
      <div
        className="w-full lg:w-150 h-64 sm:h-96 lg:h-160 bg-cover bg-center rounded-xl shadow-xl/30"
        style={{ backgroundImage: `url(${fixnearcollage})` }}
      ></div>
    </div>
  );
}

export default Home;

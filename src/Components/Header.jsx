import React, { useEffect, useState } from "react";
import bgVideo from "../Videos/TestBgVideo.mp4";
import galaxyVideo from "../Videos/SolarSystemBgVideo.mp4";
import TTTLogo from "../Images/TicTacToe shift logo.png";
import { Link } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import GameLauncher from "./GameLauncher";
import LockedDiscussionChat from "./LockedDiscussionChat";

const Header = () => {
  const [isDark, setIsDark] = useState(() => {
    const storedTheme = localStorage.getItem("theme");
    return storedTheme === "dark";
  });

  const [isVideoVisible, setIsVideoVisible] = useState({
    light: !isDark,
    dark: isDark,
  });

  // Update theme and document class when isDark changes
  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    const isValidTheme = storedTheme === "dark" || storedTheme === "light";
    if (isValidTheme) {
      if (storedTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  const handleThemeToggle = () => {
    setIsVideoVisible({
      light: isDark,
      dark: !isDark,
    });
    setIsDark(!isDark);
  };

  return (
    <div className="min-h-screen transition-all duration-700 ease-in-out">
      {/* Background Videos Container */}
      <div className="fixed top-0 left-0 w-full h-full -z-10">
        {/* Light Mode Video */}
        <video
          className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
            isVideoVisible.light ? "opacity-100" : "opacity-0"
          }`}
          autoPlay
          muted
          playsInline
          loop
          src={bgVideo}
        ></video>
        {/* Dark Mode Video */}
        <video
          className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
            isVideoVisible.dark ? "opacity-100" : "opacity-0"
          }`}
          autoPlay
          muted
          playsInline
          loop
          src={galaxyVideo}
        ></video>
      </div>

      <div className="relative">
        <nav className="top-0 z-50 container mx-auto flex justify-between items-center px-2 bg-opacity-20 -mt-[5vh] rounded-full">
          <div className="logo">
            <Link to="/">
              <img
                className="w-[20vw] ml-[30vw] object-contain transition-transform duration-300 ease-in-out hover:scale-105"
                src={TTTLogo}
                alt=""
              />
            </Link>
          </div>
          <button
            onClick={handleThemeToggle}
            className="p-2 rounded-full bg-white shadow-lg transition-all duration-300 ease-in-out hover:scale-110 hover:shadow-xl active:scale-95 ml-auto mr-4"
            aria-label="Toggle theme"
          >
            {isDark ? (
              <Sun className="w-6 h-6 text-yellow-500 transition-colors duration-300" />
            ) : (
              <Moon className="w-6 h-6 text-gray-700 transition-colors duration-300" />
            )}
          </button>
        </nav>

        <div className="container mx-auto pb-20">
          <div className="w-[85vw] min-h-[80vh] mx-auto rounded-xl border-[1px] relative overflow-hidden mb-10 transition-all duration-700 ease-in-out">
            <div className="bg-gray-800 bg-opacity-10 backdrop-filter backdrop-blur-lg absolute inset-0 transition-all duration-700 ease-in-out"></div>
            <div className="relative z-10 p-8">
              <GameLauncher isDark={isDark} />
            </div>
          </div>

          <h2 className="text-4xl font-bold mx-auto text-center relative top-[5vh] text-yellow-400 dark:text-yellow-300 mb-[10vh] transition-colors duration-700 ease-in-out">
            About Game
          </h2>

          <p className=" playwrite-gb-s-font1  ml-[20vw] w-[50vw] mx-auto text-center text-[1.1vw] mb-[10vh] dark:text-gray-200 transition-colors duration-700 ease-in-out">
            "Experience Tic Tac Toe like never before! Tic Tac Toe Shift combines
            strategy and skill, challenging you to think ahead and outmaneuver.
            Unlock your cognitive potential and reign supreme! Engage your mind
            with addictive gameplay, Master the shift and claim your victory
            today!"
          </p>

          <h2 className="text-4xl font-bold text-center text-yellow-400 dark:text-yellow-300 mt-[10vh] mb-10 transition-colors duration-700 ease-in-out">
            How To Play
          </h2>

          <div className="flex flex-col md:flex-row justify-between space-y-4 md:space-y-0 md:space-x-4">
            {[1, 2, 3].map((box) => (
              <div
                key={box}
                className="flex-1 h-[30vh] bg-white dark:bg-gray-800 bg-opacity-30 backdrop-filter backdrop-blur-lg p-6 rounded-xl border border-sky-200 dark:border-sky-700 transition-all duration-700 ease-in-out hover:shadow-lg"
              >
                <h2 className="text-xl font-bold mb-2 dark:text-white transition-colors duration-700 ease-in-out">
                  Box {box}
                </h2>
                <p className="dark:text-gray-300 transition-colors duration-700 ease-in-out">
                  This is the content for Box {box}. You can add more details
                  here.
                </p>
              </div>
            ))}
          </div>

          <h2 className="text-4xl font-bold text-center text-yellow-400 dark:text-yellow-300 mt-[10vh] mb-10 transition-colors duration-700 ease-in-out">
            Discussion
          </h2>
          <LockedDiscussionChat />

          <h2 className="text-4xl font-bold text-left ml-5 text-yellow-400 dark:text-yellow-300 mt-[10vh] mb-10 transition-colors duration-700 ease-in-out">
            About Developer
          </h2>
          <p className=" dancing-script-cursive ml-5 dark:text-gray-200 transition-colors duration-700 ease-in-out">
            "Hi, I'm Sourabh, a frontend developer passionate about crafting
            interactive experiences. For Tic Tac Toe Shift, I learned and
            implemented Web Sockets from scratch, demonstrating my ability to
            adapt and innovate. I'm committed to delivering creative solutions,
            continuously expanding my skills, and pushing the limits of frontend
            development."
          </p>

          <h1 className=" text-white ml-[35vw] text-[1  vw]  relative top-[8vh] mt-2 font-serif  ">ThankYou For HackaThon , Appwrite 🚀</h1>
        </div>
      </div>
    </div>
  );
};

export default Header;

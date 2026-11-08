import React, { useEffect } from "react";
import Header from "./Components/Header";
import { useAuthStore } from "./store/authStore";

const App = () => {
  const checkSession = useAuthStore((s) => s.checkSession);

  // Restore a saved sign-in once on load.
  useEffect(() => {
    checkSession();
  }, [checkSession]);

  return <Header />;
};

export default App;

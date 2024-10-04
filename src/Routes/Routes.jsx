import { Routes, Route } from "react-router-dom";
import App from "../App.jsx";

const RoutesConfig = () => {
  return (
    <Routes>
      <Route path="/" element={<App />} />
    </Routes>
  );
};

export default RoutesConfig;

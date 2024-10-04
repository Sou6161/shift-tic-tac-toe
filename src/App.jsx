import React from "react";
import { useLenis } from "@studio-freight/react-lenis";
import Header from "./Components/Header";



const App = () => {

  function SomeComponent() {
    useLenis(({ scroll }) => {
      // console.log("Scrolled", scroll);
    });
  
    // Rest of your component code hello i am surabh sain
  }
  SomeComponent()
  
  return (
    <div>
      <div><Header/></div>
      
    </div>
  );
};

export default App;

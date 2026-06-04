import './App.css';
import {Outlet} from "react-router-dom";

function App() {
  console.log('git email test');
  return (
      <div className="App">
          <Outlet />
      </div>
  );
}

export default App;

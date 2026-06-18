import './App.css';
import {Outlet} from "react-router-dom";
import {ErrorBoundary} from "./components/common/ErrorBoundary";

function App() {
  return (
      <div className="App">
          <ErrorBoundary>
              <Outlet />
          </ErrorBoundary>
      </div>
  );
}

export default App;

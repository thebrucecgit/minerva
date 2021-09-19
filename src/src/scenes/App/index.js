import { ToastContainer } from "react-toastify";
import { CloudinaryContext } from "cloudinary-react";

import Routes from "../../routes";
import AuthHelpers from "../../services/AuthHelpers";
import Authentication from "../../services/Authentication";
import Apollo from "../../services/Apollo";

import "../../styles/app.scss";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <div className="App">
      <AuthHelpers
        children={(authHelpers) => (
          <Apollo authHelpers={authHelpers}>
            <Authentication
              authHelpers={authHelpers}
              children={(authService) => (
                <CloudinaryContext
                  cloudName={process.env.REACT_APP_CLOUDINARY_CLOUDNAME}
                >
                  <div>
                    <Routes authService={authService} />
                    <ToastContainer position="bottom-right" />
                  </div>
                </CloudinaryContext>
              )}
            />
          </Apollo>
        )}
      />
    </div>
  );
}

export default App;

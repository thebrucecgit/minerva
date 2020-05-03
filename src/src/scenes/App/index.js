import React from "react";

import Routes from "../../routes";
import AuthHelpers from "../../services/AuthHelpers";
import Authentication from "../../services/Authentication";
import Apollo from "../../services/Apollo";

import "../../styles/app.scss";

function App() {
  return (
    <div className="App">
      <AuthHelpers
        children={(authHelpers) => (
          <Apollo authHelpers={authHelpers}>
            <Authentication
              authHelpers={authHelpers}
              children={(authService) => <Routes authService={authService} />}
            />
          </Apollo>
        )}
      />
    </div>
  );
}

export default App;

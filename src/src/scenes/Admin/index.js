import { Switch, Route } from "react-router-dom";
import Main from "./scenes/Main";
import Review from "./scenes/Review";

function Admin({ match, authService }) {
  const { path } = match;
  const { currentUser } = authService;

  if (!currentUser.user?.admin?.status) return <h2>401 Unauthorized</h2>;

  return (
    <Switch>
      <Route exact path={path}>
        <Main />
      </Route>
      <Route exact path={`${path}/review`}>
        <Review />
      </Route>
    </Switch>
  );
}

export default Admin;

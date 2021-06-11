import { Switch, Route } from 'react-router-dom'
import Welcome from './Welcome'
import Login from './Login'
import Register from './Register'
import CreateInvite from './CreateInvite'
import EnsureLoggedIn from './EnsureLoggedIn'

const Main = () => {
  return (
    <main className="main">
      <Switch>
        <Route path="/login">
          <Login />
        </Route>
        <Route path="/register">
          <Register />
        </Route>
        <Route path="/invites">
          <EnsureLoggedIn>
            <CreateInvite />
          </EnsureLoggedIn>
        </Route>
        <Route path="/">
          <Welcome />
        </Route>
      </Switch>
    </main>
  )
}

export default Main
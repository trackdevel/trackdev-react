import { Component } from 'react'
import { Link, Redirect } from 'react-router-dom'
import UserContext from '../contexts/UserContext'
import Api from '../utils/api'

class Login extends Component {
  constructor(props) {
    super(props)
    this.state = {
      username: '',
      password: '',
      hasApiError: false,
      errorMessage: ''
    }
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleInputChange = this.handleInputChange.bind(this)
  }

  handleSubmit(e) {
    e.preventDefault();
    this.setState({ hasApiError: false, errorMessage: ''})
    this.requestLogin()
  }

  requestLogin() {
    var requestBody = {
      username: this.state.username,
      password: this.state.password
    }
    Api.post('/auth/login', requestBody)
      .then(async response => {
        const data = await response.json();
        if(!response.ok) {
          this.setState({ hasApiError: true, errorMessage: data.message || 'Unknown error from server'})
        } else {
          this.context.setUser({
            isLoggedIn: true,
            username: data.userdata.username
          })
        }
      })
      .catch(error => {
        this.setState({ hasApiError: true, errorMessage: 'Unexpected error'})
      })
  }

  handleInputChange(e) {
    let inputChange = {}
    inputChange[e.target.name] = e.target.value
    this.setState(inputChange)
  }

  render() {
    if(this.context.user && this.context.user.isLoggedIn) {
      return (<Redirect to="/" />)
    }
    return (
      <div className="login">
        <h2>Login</h2>
        <form onSubmit={this.handleSubmit}>
          <label>
            Username
            <input name="username" value={this.state.username} onChange={this.handleInputChange} required />
          </label>
          <label>
            Password
            <input name="password" type="password" value={this.state.password} onChange={this.handleInputChange} required/>
          </label>
          <button type="submit">Login</button>
          {
            this.state.hasApiError ? (<p>{this.state.errorMessage}</p>) : null
          }
          <p>Don't have an account yet? Go to <Link to="/register">register</Link>.</p>
        </form>
      </div>
    )
  }
}

Login.contextType = UserContext

export default Login
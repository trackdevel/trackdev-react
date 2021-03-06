import { Component } from 'react'
import { Link, Redirect } from 'react-router-dom'
import UserContext from '../contexts/UserContext'
import Api from '../utils/api'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import Alert from 'react-bootstrap/Alert'

class Login extends Component {
  constructor(props) {
    super(props)
    this.state = {
      username: '',
      password: '',
      error: null,
      validated: false
    }
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleInputChange = this.handleInputChange.bind(this)
  }

  handleSubmit(e) {
    e.preventDefault();
    const isValidForm = e.currentTarget.checkValidity()
    this.setState( {validated: true})
    if(isValidForm === true) {
      this.requestLogin()
    }
  }

  requestLogin() {
    var requestBody = {
      username: this.state.username,
      password: this.state.password
    }
    Api.post('/auth/login', requestBody)
      .then(data => {
        this.context.setUser({
          isLoggedIn: true,
          profile: data.userdata
        })
      })
      .catch(error => {
        this.setState({ error: error?.details?.message || 'Unknown error'})
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
        <Form onSubmit={this.handleSubmit} noValidate validated={this.state.validated}>

          <Form.Group controlId="login-username">
            <Form.Label>Username</Form.Label>
            <Form.Control name="username" value={this.state.username} onChange={this.handleInputChange} required />
            <Form.Control.Feedback type="invalid">
              Please enter a username.
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group controlId="login-password">
            <Form.Label>Password</Form.Label>
            <Form.Control name="password" type="password" value={this.state.password} onChange={this.handleInputChange} required />
            <Form.Control.Feedback type="invalid">
              Please enter a password.
            </Form.Control.Feedback>
          </Form.Group>

          <Button type="submit" variant="primary">Login</Button>
          {
            this.state.error ? (<Alert variant="danger">{this.state.error}</Alert>) : null
          }
          <p>Don't have an account yet? Go to <Link to="/register">register</Link>.</p>
        </Form>
      </div>
    )
  }
}

Login.contextType = UserContext

export default Login
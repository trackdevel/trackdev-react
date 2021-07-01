import { Component } from 'react'
import Restricted from "../../components/Restricted"
import Api from '../../utils/api'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import Alert from 'react-bootstrap/Alert'

class CreateInvite extends Component {
  constructor(props) {
    super(props)
    this.state = {
      email: '',
      roles: [],
      created: false,
      error: '',
      validated: false
    }
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleInputChange = this.handleInputChange.bind(this)
    this.handleMultipleSelectChange = this.handleMultipleSelectChange.bind(this)
  }

  handleSubmit(e) {
    e.preventDefault();
    this.setState({ error: ''})
    const isValidForm = e.currentTarget.checkValidity()
    this.setState( {validated: true})
    if(isValidForm === true) {
      this.requestCreateInvite()
    }
  }

  requestCreateInvite() {
    var requestBody = {
      email: this.state.email,
      roles: this.state.roles
    }
    Api.post('/invites', requestBody)
      .then(data => {
        this.setState({ created: true })        
      })
      .catch(error => this.setState({ error: error?.details?.message || 'Unknown error'}) )
  }

  handleInputChange(e) {
    let inputChange = {}
    inputChange[e.target.name] = e.target.value
    this.setState(inputChange)
  }

  handleMultipleSelectChange(e) {
    let inputChange = {}
    const options = Array.from(e.target.options)
    inputChange[e.target.name] = options
        .filter(o => o.selected)
        .map(o => o.value)
    this.setState(inputChange)
  }

  render() {
    if(this.state.created) {
      return (<div><p>Invite has been created successfully.</p></div>)
    }
    return (
      <Restricted allowed={["PROFESSOR", "ADMIN"]} fallback={(<p>You don't have access to here.</p>)}>
        <div className="create-invite">
          <h2>Invite</h2>
          <Form onSubmit={this.handleSubmit} noValidate validated={this.state.validated}>
            <Form.Group controlId="create-invite-email">
              <Form.Label>Email</Form.Label>
              <Form.Control name="email" type="email" value={this.state.email} onChange={this.handleInputChange} required />
              <Form.Control.Feedback type="invalid">
                Please enter a valid email.
              </Form.Control.Feedback>
            </Form.Group>
            
            <Form.Group controlId="create-invite-roles">
              <Form.Label>Roles</Form.Label>
              <Form.Control as="select" name="roles" value={this.state.roles} onChange={this.handleMultipleSelectChange} multiple required>
                  <option value="" disabled>Not selected</option>
                  <option value="STUDENT">Student</option>
                  <option value="PROFESSOR">Professor</option>
                  <option value="ADMIN">Admin</option>
              </Form.Control>
              <Form.Control.Feedback type="invalid">
                  Please select some roles.
              </Form.Control.Feedback>
            </Form.Group>
            <Button type="submit" variant="primary">Invite</Button>
            {
              this.state.error ? (<Alert variant="danger">{this.state.error}</Alert>) : null
            }
          </Form>
        </div>
      </Restricted>
    )
  }
}

export default CreateInvite
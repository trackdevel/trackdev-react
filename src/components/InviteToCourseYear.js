import { useState } from "react"
import Api from "../utils/api"
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import Alert from 'react-bootstrap/Alert'
import FormSubmitCancelButtons from "./FormSubmitCancelButtons"

const InviteToCourseYear = ( { courseYearId, onDataTouched } ) => {
  const [mode, setMode] = useState("normal") // normal/create
  const [errors, setErrors] = useState({})
  const [email, setEmail] = useState("")
  const [validated, setValidated] = useState(false)

  function handleSubmit(e) {
    e.preventDefault();
    const isValidForm = e.currentTarget.checkValidity()
    setValidated(true)
    if(isValidForm === true) {
      requestCreate()
    }
  }

  function handleNewClick() {
    setMode("create")
  }

  function handleCancelClick() {
    resetState()
  }

  async function requestCreate() {
    Api.post(`/courses/years/${courseYearId}/invites`, {
      email: email
    })
    .then(data => {  
      onDataTouched()
      resetState()
    })
    .catch(error => setErrors({ create: error?.details?.message || 'Unknown error' }))
  }

  function resetState() {
    setMode("normal")
    setEmail("")
    setErrors({})
    setValidated(false)
  }

  // Render
  if(mode === "normal") {
    return (
      <div className="mb-3">
        <Button type="button" onClick={handleNewClick} variant="primary" size="sm">
          Invite
        </Button>
      </div>
    )
  }

  return (
    <div className="mb-3">
      <h4>Invite to course year</h4>
      <Form onSubmit={handleSubmit} noValidate validated={validated}>
        <Form.Group controlId="invite-to-course-email">
          <Form.Label>Email</Form.Label>
          <Form.Control name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Form.Control.Feedback type="invalid">
              Please enter a valid email.
          </Form.Control.Feedback>
        </Form.Group>

        <FormSubmitCancelButtons submitButtonText="Invite" onCancelClick={handleCancelClick} />
        {
          errors.create ? (<Alert variant="danger">{errors.create}</Alert>) : null
        }
      </Form>
    </div>
  )
}

export default InviteToCourseYear
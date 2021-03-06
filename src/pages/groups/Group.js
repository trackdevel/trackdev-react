import { useState } from 'react'
import { Redirect, withRouter } from 'react-router-dom'
import withData from '../../components/withData'
import UsersList from '../../components/UsersList'
import Backlogs from '../../components/Backlogs'
import Restricted from '../../components/Restricted'
import ConfirmationModal from '../../components/ConfirmationModal'
import Api from '../../utils/api'
import Button from 'react-bootstrap/Button'
import Alert from 'react-bootstrap/Alert'
import Form from 'react-bootstrap/Form'
import Col from 'react-bootstrap/Col'
import { LinkContainer } from 'react-router-bootstrap'
import Breadcrumbs from '../../components/Breadcrumbs'

const Group = ({ group }) => {
  const [error, setError] = useState(null)
  const [askConfirmDelete, setAskConfirmDelete] = useState(false)
  const [deleted, setDeleted] = useState(false)

  function handleDeleteClick() {
    setAskConfirmDelete(true)
  }

  function handleActualDelete() {
    Api.delete(`/groups/${group.id}`)
      .then(() => {
        setAskConfirmDelete(false)
        setDeleted(true)
      })
      .catch(error => {
        setAskConfirmDelete(false)
        setError(error?.details?.message || 'Unknown error') 
      })
  }

  if(group == null) {
    return null
  }
  if(deleted) {
    return (<Redirect to={`/courses/years/${group.courseYear.id}`} />)
  }
  let links = [];
  const fullName = `${group.courseYear?.course?.name} ${group.courseYear.startYear}`
  links.push({ text: fullName, href: `/courses/years/${group.courseYear.id}` });
  links.push({ text: group.name })
  return (
    <div>
      <Breadcrumbs links={links} />
      <Restricted allowed={["PROFESSOR"]} fallback={(<h2>{group.name}</h2>)}>
        <Form.Row>
          <Col><h2>{group.name}</h2></Col>
          <Col xs="auto">
            <LinkContainer to={`/groups/${group.id}/edit`}><Button size="sm" variant="outline-primary">Edit</Button></LinkContainer>
          </Col>
          <Col xs="auto">
            <Button type="button" onClick={handleDeleteClick} variant="outline-secondary" size="sm">Delete</Button>
          </Col>
        </Form.Row>
      </Restricted>
      {
        error ? <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert> : null
      }
      <p>Members <UsersList users={group.members} /></p>

      <Backlogs backlogs={group.backlogs} />
      
      <ConfirmationModal show={askConfirmDelete}
          title="Sure you want to delete this group?"
          onCancel={() => setAskConfirmDelete(false)}
          onConfirm={handleActualDelete}
          >
        <p>Please keep in mind that when a group is deleted its backlogs and tasks are deleted as well.</p>
        <p>You cannot recover from this action.</p>
      </ConfirmationModal>
    </div>
  )
}

const GroupWithData = withData(
  Group,
  'group',
  (props) => Api.get(`/groups/${props.match.params.groupId}`))

export default withRouter(GroupWithData)
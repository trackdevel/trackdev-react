import './backlog-tasks-list.css'
import { useEffect, useState } from 'react'
import AddBacklogTask from './AddBacklogTask'
import DroppableBacklogTasksList from "./DroppableBacklogTasksList"
import CreateSprint from './CreateSprint'
import EditSprint from './EditSprint'
import ActiveSprintColumns from './ActiveSprintColumns'
import SprintsHistory from './SprintsHistory'
import SprintStatus from './SprintStatus'
import Tabs from 'react-bootstrap/Tabs'
import Tab from 'react-bootstrap/Tab'
import Toast from 'react-bootstrap/Toast'
import Form from 'react-bootstrap/Form'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import Api from '../utils/api'
import { DragDropContext } from 'react-beautiful-dnd'


const BacklogTasksList = ({ backlog }) => {
  const [sprints, setSprints] = useState(null)
  const [sprintTasks, setSprintTasks] = useState([])
  const [backlogTasks, setBacklogTasks] = useState([])
  const [error, setError] = useState(null)

  useEffect(function() {    
    if(backlog?.id) {
      requestSprints(backlog.id)
      requestBacklogTasks(backlog.id)
    }
  }, [backlog])

  useEffect(function() {
    if(backlog?.id && sprints != null && sprints.length > 0) {
      let sprintId = sprints[0].id
      requestSprintTasks(backlog.id, sprintId)
    }
  }, [sprints])

  useEffect(function() {
    if(error) {
      const timer = setTimeout(() => setError(null), 4000)
      return () => clearTimeout(timer)
    }
  }, [error])

  async function requestSprints(backlogId) {
    Api.get(`/backlogs/${backlogId}/sprints`)
      .then(data => setSprints(data))
      .catch(() => {})
  }

  async function requestBacklogTasks(backlogId) {
    Api.get(`/backlogs/${backlogId}/tasks?search=activeSprintId:NULL AND parentTaskId:NULL`)
      .then(data => setBacklogTasks(data))
      .catch(() => {})
  }

  async function requestSprintTasks(backlogId, sprintId) {
    Api.get(`/backlogs/${backlogId}/tasks?search=activeSprintId:${sprintId}`)
      .then(data => setSprintTasks(data))
      .catch(() => {})
  }

  function onBacklogDataTouched() {
    requestBacklogTasks(backlog.id)
  }

  function onSprintDataTouched() {
    requestSprintTasks(backlog.id, sprints[0].id)
  }

  function onSprintsTouched() {
    requestSprints(backlog.id)
  }

  function toggleToast() {
    setError(null)
  }

  function newTasksListOrdered(tasks, taskId, sourceIndex, destinationIndex) {
    const movedTask = tasks.find(t => t.id == taskId)
    const newTasks = Array.from(tasks)
    newTasks.splice(sourceIndex, 1)
    newTasks.splice(destinationIndex, 0, movedTask)
    return newTasks
  }


  function resolveDestinationRank(source, destination) {
    let rank = destination.index
    if(destination.droppableId.startsWith("backlog-tasks")) {
      if(backlogTasks.length > 0) {
        rank+= backlogTasks[0].rank
      } else if (sprintTasks.length > 0) {
        rank+= sprintTasks[sprintTasks.length - 1].rank + 1
      }
      if(source.droppableId !== destination.droppableId
        && source.droppableId.startsWith("sprint-tasks-")) {
        rank--
      }
    } else if (destination.droppableId.startsWith("sprint-tasks-")) {
      if(sprintTasks.length > 0) {
        rank+= sprintTasks[0].rank
      } else {
        rank++
      }
    }
    return rank
  }

  function beautifulOnDragEnd(result) {
    const { destination, source, draggableId } = result;
    if(!destination) {
      return;
    }
    if(destination.droppableId === source.droppableId &&
      destination.index === source.index) {
      return;
    }

    const draggedTaskId = draggableId.split('-')[2]
    const rank = resolveDestinationRank(source, destination)
    if(source.droppableId === destination.droppableId) {
      // Just re-order.
      // Optimistically save new order in local state
      if(source.droppableId.startsWith("backlog-tasks")) {
        const newTasks = newTasksListOrdered(backlogTasks, draggedTaskId, source.index, destination.index)
        setBacklogTasks(newTasks)         
      } else if (source.droppableId.startsWith("sprint-tasks-")) {
        const newTasks = newTasksListOrdered(sprintTasks, draggedTaskId, source.index, destination.index)
        setSprintTasks(newTasks)
      }
      // Update to server
      updateTask(draggedTaskId, { rank: rank }) 

    } else if(destination.droppableId.startsWith('sprint-tasks-') 
      && source.droppableId.startsWith('backlog-tasks')) {        
        // Add to sprint

        // In local state
        const movedTask = backlogTasks.find(t => t.id == draggedTaskId)
        const newBacklogTasks = Array.from(backlogTasks)
        newBacklogTasks.splice(source.index, 1)
        setBacklogTasks(newBacklogTasks)

        const newSprintTasks = Array.from(sprintTasks)
        newSprintTasks.splice(destination.index, 0, movedTask)
        setSprintTasks(newSprintTasks)
        
        // Update to server
        const sprintId = destination.droppableId.split('-')[2]
        updateTask(draggedTaskId, { activeSprint: sprintId, rank: rank })

    } else if(destination.droppableId.startsWith('backlog-tasks')
      && source.droppableId.startsWith('sprint-tasks-')) {
        // Remove from sprint

        // In local state
        const movedTask = sprintTasks.find(t => t.id == draggedTaskId)        
        const newSprintTasks = Array.from(sprintTasks)
        newSprintTasks.splice(source.index, 1)
        setSprintTasks(newSprintTasks)

        const newBacklogTasks = Array.from(backlogTasks)
        newBacklogTasks.splice(destination.index, 0, movedTask)
        setBacklogTasks(newBacklogTasks)

        // Update to server        
        updateTask(draggedTaskId, { activeSprint: null, rank: rank })        
    }
    // Move from sprint to another sprint not supported
  }
  
  function updateTask(taskId, changes) {
    Api.patch(`/tasks/${taskId}`, changes)
    .then(data => { })
    .catch(error => {
      setError(error?.details?.message || 'Unknown error')
    })
    .finally(() => {
      // refresh data
      onBacklogDataTouched()
      onSprintDataTouched()
    })
  }

  function updateSprintStatus(sprintId, status) {
    Api.patch(`/sprints/${sprintId}`, {
      status: status
    })
    .then(data => { onSprintsTouched() })
    .catch(error => { setError(error?.details?.message || 'Unknown error')})
  }

  function handleOpenSprint(sprintId) {
    updateSprintStatus(sprintId, "ACTIVE")
  }

  function handleCloseSprint(sprintId) {
    updateSprintStatus(sprintId, "CLOSED")
  }

  function onStatusChange(taskId, newStatus) {
    // Update in local to ensure smooth drag & drop
    const newList = Array.from(sprintTasks)    
    const updatedTask = newList.find(t => t.id == taskId)
    updatedTask.status = newStatus
    setSprintTasks(newList)
    
    // Save to server
    updateTask(taskId, {status: newStatus})
  }

  if(!backlog || !backlogTasks || !sprints) {
    return null
  }

  var activeSprint = sprints != null && sprints.length > 0 ? sprints.find(s => s.status === "DRAFT" || s.status === "ACTIVE") : null

  const backlogView = (
    <DragDropContext onDragEnd={beautifulOnDragEnd}>
      {
        activeSprint
          ? (
            <div>
              <Form.Row>
                <Col>
                  <h4>{activeSprint.name} <SprintStatus status={activeSprint.status} isTitle={true} /></h4>
                  <p>{new Date(activeSprint.startDate).toLocaleDateString()} - {new Date(activeSprint.endDate).toLocaleDateString()}</p>
                </Col>
                <Col xs="auto">
                  <EditSprint sprint={activeSprint} backlogId={backlog.id} onDataTouched={onSprintsTouched} />
                </Col>
                <Col xs="auto">
                  {activeSprint.status === "DRAFT" ? <Button variant="primary" size="sm" onClick={() => handleOpenSprint(activeSprint.id)}>Open</Button> : null }
                  {activeSprint.status === "ACTIVE" ? <Button variant="primary" size="sm" onClick={() => handleCloseSprint(activeSprint.id)}>Close</Button> : null}
                </Col>
              </Form.Row>
              <DroppableBacklogTasksList listId={`sprint-tasks-${activeSprint.id}`} tasks={sprintTasks} onDataTouched={onSprintDataTouched} />                
            </div>
        )
        : (<div><p>You don't have any active sprint.</p></div>)
      }
      <div className="inline-buttons">
        <AddBacklogTask backlogId={backlog.id} onDataTouched={onBacklogDataTouched} />
        { activeSprint ? null : <CreateSprint backlogId={backlog.id} onDataTouched={onSprintsTouched} /> }
      </div>
      <div>
        <DroppableBacklogTasksList listId="backlog-tasks" tasks={backlogTasks} onDataTouched={onBacklogDataTouched}/>
      </div>      
    </DragDropContext>
  )

  const activeSprintView = (
      <ActiveSprintColumns sprint={activeSprint} tasks={sprintTasks} onDataTouched={onSprintDataTouched} onStatusChange={onStatusChange} />
  )

  const sprintsHistoryView = (
    <SprintsHistory backlogId={backlog.id} sprints={sprints} />
  )

  return (
    <div>
      <Tabs defaultActiveKey="backlogView" transition={false}>
        <Tab eventKey="backlogView" title="Backlog">
          <div className="backlog-tasks-list__tab children-bottom-space">
            {backlogView}
          </div>          
        </Tab>
        <Tab eventKey="activeSprintView" title="Active Sprint">
          <div className="backlog-tasks-list__tab children-bottom-space">
            {activeSprintView}
          </div>
        </Tab>
        <Tab eventKey="sprintsHistoryView" title="History">
          <div className="backlog-tasks-list__tab children-bottom-space">
            {sprintsHistoryView}
          </div>          
        </Tab>
      </Tabs>
      {
        error
          ? (
            <div aria-live="polite" style={{position:'fixed', bottom: '30px', right: '30px', zIndex: 5}}>
              <Toast onClose={toggleToast} delay={4000} autohide className="bg-danger text-white" animation={false}>
                <Toast.Header><span className="mr-auto">Error editing tasks</span></Toast.Header>
                <Toast.Body>{error}</Toast.Body>
              </Toast>
            </div>
          )
          : null
      }           
    </div>
  )
}

export default BacklogTasksList
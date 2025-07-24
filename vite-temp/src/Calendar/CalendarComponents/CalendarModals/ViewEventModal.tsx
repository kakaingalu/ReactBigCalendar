import { useState } from 'react';
import { Modal, Button, Row, Col, Badge, Container, Card } from 'react-bootstrap';
import { Calendar, MapPin, Briefcase, FileText, User, Mail, Flag, Building, AlignLeft, Send } from 'lucide-react';
/* Removed import of non-existent CSS file to fix build errors */

// Function to format date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Function to determine priority color

const getPriorityColor = (priority: string): string => {
  switch(priority.toLowerCase()) {
    case 'high':
      return 'danger';
    case 'medium':
      return 'warning';
    case 'low':
      return 'success';
    default:
      return 'secondary';
  }
};

type CalendarViewEventModalProps = {
  eventInfo: any;
  showModal: boolean;
  onHide: () => void;
  setEditEventInfo: (info: any) => void;
  setShowEditModal: (show: boolean) => void;
  setShowViewModal: (show: boolean) => void;
  setViewEventInfo: (show: boolean) => void;
  handleDeleteEvent: (info: any) => void;
};

export default function CalendarViewEventModal({
  eventInfo,
  showModal,
  onHide,
  setEditEventInfo,
  setShowEditModal,
  setShowViewModal,
  setViewEventInfo,
  handleDeleteEvent
}: CalendarViewEventModalProps) {
  const [showReminder, setShowReminder] = useState(false);

  if (!eventInfo || !eventInfo.event) {
    return null; // Or some loading/error state
  }
  const { event } = eventInfo; // FullCalendar EventApi object

  const handleEditEventClick = () => {
    // Send click info to event modal
    setEditEventInfo(eventInfo);
    setShowViewModal(false);
    setShowEditModal(true);
    setViewEventInfo(true);
  };

  const handleDelete = () =>{
    handleDeleteEvent(eventInfo)
  }

  const eventData = {
    id: event.id,
    matter_title: event.extendedProps.matter_title,
    title: event.title,
    caseNumber: event.extendedProps.caseNumber,
    client_name: event.extendedProps.client_name,
    client_email: event.extendedProps.client_email,
    case_reason: event.extendedProps.case_reason,
    priority: event.extendedProps.priority,
    location: event.extendedProps.location,
    court: event.extendedProps.court,
    description: event.extendedProps.description,
    start_date: event.startStr,
    end_date: event.endStr,
    startStr: event.startStr,
    endStr: event.endStr,
    allDay: event.allDay,
    backgroundColor: null,
    attendees: event.extendedProps.attendees,
  };

   const handleSendReminder = () => {
    setShowReminder(true);
    setTimeout(() => {
      setShowReminder(false);
    }, 3000);
  };

  // Handles closing the modal when the "Show Event Details" button is used
  function setShow(show: boolean): void {
    if (!show) {
      onHide();
    }
    // If show is true, do nothing since showModal is controlled by parent
  }
  return (
    <div className="calendar-view-modal">
      <Button variant="primary" onClick={() => setShow(true)} className="mb-4">
        Show Event Details
      </Button>
      {/* Removed unused Show Event Details button */}
      <Modal
        onHide={onHide}
        size="lg"
        centered
        className="calendar-view-modal"
        show={showModal}
      >
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title className="fw-bold fs-4">{eventData.title}</Modal.Title>
        </Modal.Header>

        <Modal.Body className="p-0">
          <div className="bg-light p-3 border-bottom">
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center">
                <Calendar size={20} className="text-primary me-2" />
                <span className="fw-bold text-secondary">
                  {formatDate(eventData.start_date)} -{" "}
                  {formatDate(eventData.end_date)}
                </span>
              </div>
              <Badge
                bg={getPriorityColor(eventData.priority)}
                className="px-3 py-2"
              >
                {eventData.priority} Priority
              </Badge>
            </div>
          </div>

          <Container className="py-4">
            <Row className="g-4">
              <Col md={6}>
                <Card className="h-100 shadow-sm">
                  <Card.Header className="bg-white border-bottom-0">
                    <h5 className="mb-0 text-primary">Case Details</h5>
                  </Card.Header>
                  <Card.Body>
                    <div className="mb-3 d-flex">
                      <Briefcase
                        size={18}
                        className="text-secondary me-2 mt-1"
                      />
                      <div>
                        <div className="text-secondary text-sm">
                          Matter Title
                        </div>
                        <div className="fw-semibold">
                          {eventData.matter_title}
                        </div>
                      </div>
                    </div>

                    <div className="mb-3 d-flex">
                      <FileText
                        size={18}
                        className="text-secondary me-2 mt-1"
                      />
                      <div>
                        <div className="text-secondary text-sm">
                          Case Number
                        </div>
                        <div className="fw-semibold">
                          {eventData.caseNumber}
                        </div>
                      </div>
                    </div>

                    <div className="mb-3 d-flex">
                      <Flag size={18} className="text-secondary me-2 mt-1" />
                      <div>
                        <div className="text-secondary text-sm">
                          Case Reason
                        </div>
                        <div className="fw-semibold">
                          {eventData.case_reason}
                        </div>
                      </div>
                    </div>

                    <div className="d-flex">
                      <Building
                        size={18}
                        className="text-secondary me-2 mt-1"
                      />
                      <div>
                        <div className="text-secondary text-sm">Court</div>
                        <div className="fw-semibold">{eventData.court}</div>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={6}>
                <Card className="h-100 shadow-sm">
                  <Card.Header className="bg-white border-bottom-0">
                    <h5 className="mb-0 text-primary">Client Information</h5>
                  </Card.Header>
                  <Card.Body>
                    <div className="mb-3 d-flex">
                      <User size={18} className="text-secondary me-2 mt-1" />
                      <div>
                        <div className="text-secondary text-sm">
                          Client Name
                        </div>
                        <div className="fw-semibold">
                          {eventData.client_name}
                        </div>
                      </div>
                    </div>

                    <div className="mb-3 d-flex">
                      <Mail size={18} className="text-secondary me-2 mt-1" />
                      <div>
                        <div className="text-secondary text-sm">Email</div>
                        <div className="fw-semibold">
                          {eventData.client_email}
                        </div>
                      </div>
                    </div>

                    <div className="d-flex">
                      <MapPin size={18} className="text-secondary me-2 mt-1" />
                      <div>
                        <div className="text-secondary text-sm">Location</div>
                        <div className="fw-semibold">{eventData.location}</div>
                      </div>
                    </div>
                    <hr></hr>
                    {showReminder && (
                      <div className="reminder-alert p-1 mb-1">
                        Reminder sent to {eventData.client_email}!
                      </div>
                    )}
                    <Button
                      variant="warning"
                      className="reminder-btn w-100"
                      onClick={handleSendReminder}
                      disabled={showReminder}
                    >
                      <Send size={16} className="me-1" />
                      Send Reminder
                    </Button>
                  </Card.Body>
                </Card>
              </Col>

              {eventData.description && (
                <Col md={12}>
                  <Card className="shadow-sm">
                    <Card.Header className="bg-white border-bottom-0">
                      <h5 className="mb-0 text-primary">Description</h5>
                    </Card.Header>
                    <Card.Body>
                      <div className="d-flex">
                        <AlignLeft
                          size={18}
                          className="text-secondary me-2 mt-1"
                        />
                        <div className="fw-normal">{eventData.description}</div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              )}
            </Row>
          </Container>
        </Modal.Body>

        <Modal.Footer className="border-top justify-content-between">
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
          <Button variant="primary" onClick={handleEditEventClick}>
            Edit Event
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
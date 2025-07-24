import { useState, useEffect } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
// import axios from 'axios';
import { Modal, Button, Form as BootstrapForm, Row, Col } from 'react-bootstrap';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Chip from '@mui/material/Chip';
import Swal from 'sweetalert2';
// import { addCalendarEvent } from '@redux/features/calendarEventSlice'; // To be handled by parent
// import { useDispatch } from 'react-redux'; // To be handled by parent
import { useSelector, useDispatch } from 'react-redux';
// Removed selectEmployees and setEmployee imports because they do not exist in calendarEventSlice
// Updated imports for casesSlice to correct named exports
import { selectCalendarEvents, setCalendarEvents } from '../../../redux/casesSlice';
const setCasesRedux = setCalendarEvents;
import axiosInstance from '../../../services/httpService';

// Assuming formatDateForInput is in a utils file or defined above
// import { formatDateForInput } from './utils/dateUtils';
// Or define it here:
interface FormatDateForInput {
    (dateStr: string | Date | undefined | null): string;
}

const formatDateForInput: FormatDateForInput = (dateStr) => {
    if (!dateStr) return '';
    try {
        return new Date(dateStr).toISOString().split('T')[0];
    } catch (error) {
        if (typeof dateStr === 'string' && dateStr.length >= 10) return dateStr.substring(0, 10);
        return '';
    }
};

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
};


import type { Theme } from '@mui/material/styles';

function getStyles(name: string, personName: readonly string[], theme: Theme): React.CSSProperties {
    return {
        fontWeight:
            personName.indexOf(name) === -1
                ? theme.typography.fontWeightRegular
                : theme.typography.fontWeightMedium,
    };
}

interface MultipleChipSelectProps {
    setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void;
    initialAttendees?: any[];
    employeeOptions?: any[];
}

const MultipleChipSelect: React.FC<MultipleChipSelectProps> = ({ setFieldValue, initialAttendees = [], employeeOptions = [] }) => {
    const theme = useTheme();
    const [personName, setPersonName] = useState<string[]>([]);

    useEffect(() => {
        if (initialAttendees && Array.isArray(initialAttendees)) {
            setPersonName(initialAttendees);
        }
    }, [initialAttendees]);

    const handleChange = (event: { target: { value: any; }; }) => {
        const {
            target: { value },
        } = event;
        const newAttendees = typeof value === 'string' ? value.split(',') : value;
        setFieldValue("attendees", newAttendees);
        setPersonName(newAttendees);
    };
    
    return (
        <div>
            <FormControl sx={{ m: 1, width: '100%' }}>
                <InputLabel id="attendees-label">Attendees</InputLabel>
                <Select
                    labelId="attendees-label"
                    id="attendees"
                    multiple
                    value={personName}
                    onChange={handleChange}
                    input={<OutlinedInput id="select-multiple-chip" label="Attendees" />}
                    renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {selected.map((id) => {
                                const attendee = employeeOptions.find((emp) => emp.id === id);
                                return <Chip key={id} label={attendee ? attendee.full_name : `ID: ${id}`} />;
                            })}
                        </Box>
                    )}
                    MenuProps={MenuProps}
                >
                    {employeeOptions.map((employee) => (
                        <MenuItem
                            key={employee.id}
                            value={employee.id}
                            style={getStyles(employee.full_name, personName.map(id => {
                                const emp = employeeOptions.find((e: { id: any; }) => e.id === id);
                                return emp ? emp.full_name : '';
                            }), theme)}
                        >
                            {employee.full_name}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </div>
    );
};


function getBGColor(reason: string): string {
    switch (reason) {
        case 'Hearing': return '#3498db';
        case 'Mention': return '#9b59b6';
        case 'Judgment': return '#2ecc71';
        case 'Bring Up': return '#f1c40f';
        case 'Other': return '#1abc9c';
        default: return '#3498db';
    }
}

interface EventDetails {
    title: string;
    description: string;
    clientID: string;
    case: string;
    case_reason: string;
    location: string;
    court: string;
    priority: string;
    start_date: string;
    end_date: string;
    attendees: string[];
    sendReminders: boolean;
}

interface SelectedInfo {
    startStr: string;
    endStr: string;
    allDay: boolean;
}

// This function should ideally be passed via props or be part of a service
const createNewCalendarEventAPI = async (eventDetails: EventDetails, selectedInfo: SelectedInfo) => {
    const eventsUrl = "pms/calendar-events/";
    const calendarEventDetails = {
        ...eventDetails, // includes title, description, case, clientID etc from form
        start_date: selectedInfo.startStr, // Or eventDetails.start_date if you want to use the formatted one
        end_date: selectedInfo.endStr,     // Or eventDetails.end_date
        all_day: selectedInfo.allDay,
        // Backend should ideally set its own background color based on reason or other logic
        // background_color: getBGColor(eventDetails.case_reason), 
    };

    try {
        const response = await axiosInstance.post(eventsUrl, calendarEventDetails);
        if (response.status === 201 && response.data) {
            // Add client-side determined color if backend doesn't provide it
            // This is for immediate display in FullCalendar if backend response doesn't include it.
            return { ...response.data, backgroundColor: getBGColor(response.data.case_reason || eventDetails.case_reason) };
        }
        throw new Error(`Server responded with status: ${response.status}`);
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Error Submitting event: ", error.message);
            throw error;
        } else {
            console.error("An unknown error occurred: ", error);
            throw new Error("An unknown error occurred during event submission.");
        }
    }
};


interface NewEventModalProps {
    selectedInfo: SelectedInfo | null;
    show: boolean;
    onHide: () => void;
    onEventAddSuccess: (event: any) => void;
}

const NewEventModal: React.FC<NewEventModalProps> = ({ selectedInfo, show, onHide, onEventAddSuccess }) => {
    const dispatch = useDispatch();
    const allCases = useSelector(selectCalendarEvents); 
    const [employees, setEmployees] = useState([]);
    const [selectedClientName, setSelectedClientName] = useState('');

    // Fetch initial data for dropdowns (cases, employees for attendees)
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Cases if not in Redux
                if (!allCases || allCases.length === 0) {
                    const caseResponse = await axiosInstance.get('pms/cases/');
                    if (caseResponse.status !== 200) throw new Error(`HTTP error fetching cases! Status: ${caseResponse.status}`);
                    const casesData = await caseResponse.data;
                dispatch(setCasesRedux(casesData)); // Update Redux store
                }
                // Fetch Employees (for MultipleChipSelect)
                const employeeResponse = await axiosInstance.get('pms/employees/');
                if (employeeResponse.data) {
                    setEmployees(employeeResponse.data);
                }
            } catch (error: unknown) {
                if (error instanceof Error) {
                    console.error('Error fetching initial modal data:', error.message);
                    Swal.fire('Error', `Could not load data: ${error.message}`, 'error');
                } else {
                    console.error('An unknown error occurred:', error);
                    Swal.fire('Error', 'An unknown error occurred while fetching data.', 'error');
                }
            }
        };
        fetchData();
    }, [dispatch, allCases]);


    const handleCaseChange = (e: React.ChangeEvent<HTMLSelectElement>, setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void) => {
        const caseId = e.target.value;
        setFieldValue("case", caseId); // Store case

        const selectedCase = allCases.find(c => c.id.toString() === caseId.toString());
        if (selectedCase) {
            setFieldValue("clientID", selectedCase.clientID); // Store clientID
            // Fetch client details if only clientID is stored in case, or use name from case object
            // This part depends on your data structure for clients.
            // For now, assuming selectedCase has client_name or similar.
            setSelectedClientName(selectedCase.client_name || 'Client name not found'); // Display client_name
        } else {
            setFieldValue("clientID", "");
            setSelectedClientName('');
        }
    };

    const validationSchema = Yup.object().shape({
        title: Yup.string().required('Title is required'),
        description: Yup.string(),
        clientID: Yup.string().required('Client is required (auto-set from case)'),
        case: Yup.string().required('Case is required'),
        case_reason: Yup.string().required('Case Reason is required'),
        location: Yup.string(),
        court: Yup.string(),
        priority: Yup.string().required('Priority is required'),
        start_date: Yup.date().required("Start Date is required"),
        end_date: Yup.date().required("End Date is required").min(
            Yup.ref('start_date'),
            "End date can't be before start date"
        ),
        attendees: Yup.array().min(1, 'At least one attendee is required').required('Attendees are required'),
        sendReminders: Yup.boolean(),
    });

    const initialValues = {
        title: '',
        description: '',
        clientID: '', // Will be set by case selection
        case: '',   // User selects this
        case_reason: 'Hearing',
        court: '',
        priority: 'Medium',
        location: '',
        start_date: formatDateForInput(selectedInfo?.startStr),
        end_date: formatDateForInput(selectedInfo?.endStr),
        attendees: [],
        sendReminders: true,
    };

    const handleSubmit = async (values: EventDetails, { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }) => {
        if (!selectedInfo) {
            Swal.fire('Error!', 'No date selected.', 'error');
            setSubmitting(false);
            return;
        }

        try {
            const createdEventData = await createNewCalendarEventAPI(values, selectedInfo);
            Swal.fire('Success!', 'Event Created Successfully', 'success');
            if (onEventAddSuccess) {
                onEventAddSuccess(createdEventData); // Pass new event to parent
            }
        } catch (error: unknown) {
            console.error('Error submitting form:', error);
            if (error instanceof Error) {
                Swal.fire('Error!', `Fill All Fields Correctly. Error: ${error.message}`, 'error');
            } else {
                Swal.fire('Error!', 'An unknown error occurred.', 'error');
            }
        } finally {
            setSubmitting(false);
            // onHide(); // Parent should handle hiding on success
        }
    };

    return (
        <Modal show={show} onHide={onHide} size="lg" centered backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>Create New Event</Modal.Title>
            </Modal.Header>
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
                enableReinitialize
            >
                {({ values, errors, touched, isSubmitting, setFieldValue }) => (
                    <Form>
                        <Modal.Body>
                            <Row className="g-2 mb-3">
                                <Col md={12}>
                                    <BootstrapForm.Group controlId="newEventTitle">
                                        <BootstrapForm.Label>Event Title</BootstrapForm.Label>
                                        <Field name="title" type="text" placeholder="e.g., Hearing for Case X" className={`form-control ${errors.title && touched.title ? 'is-invalid' : ''}`} />
                                        {errors.title && touched.title && <BootstrapForm.Control.Feedback type="invalid">{errors.title}</BootstrapForm.Control.Feedback>}
                                    </BootstrapForm.Group>
                                </Col>
                            </Row>

                            <Row className="g-2 mb-3">
                                <Col md={6}>
                                    <BootstrapForm.Group controlId="newEventStartDate">
                                        <BootstrapForm.Label>Starts</BootstrapForm.Label>
                                        <Field name="start_date" type="date" className={`form-control ${errors.start_date && touched.start_date ? 'is-invalid' : ''}`} />
                                        {errors.start_date && touched.start_date && <BootstrapForm.Control.Feedback type="invalid">{errors.start_date}</BootstrapForm.Control.Feedback>}
                                    </BootstrapForm.Group>
                                </Col>
                                <Col md={6}>
                                    <BootstrapForm.Group controlId="newEventEndDate">
                                        <BootstrapForm.Label>Ends</BootstrapForm.Label>
                                        <Field name="end_date" type="date" className={`form-control ${errors.end_date && touched.end_date ? 'is-invalid' : ''}`} />
                                        {errors.end_date && touched.end_date && <BootstrapForm.Control.Feedback type="invalid">{errors.end_date}</BootstrapForm.Control.Feedback>}
                                    </BootstrapForm.Group>
                                </Col>
                            </Row>
                            
                            <Row className="g-2 mb-3">
                                <Col md={12}>
                                    <BootstrapForm.Group controlId="newEventDescription">
                                        <BootstrapForm.Label>Brief Description</BootstrapForm.Label>
                                        <Field name="description" as="textarea" rows={3} placeholder="Details about the event..." className={`form-control ${errors.description && touched.description ? 'is-invalid' : ''}`} />
                                        {errors.description && touched.description && <BootstrapForm.Control.Feedback type="invalid">{errors.description}</BootstrapForm.Control.Feedback>}
                                    </BootstrapForm.Group>
                                </Col>
                            </Row>

                            <Row className="g-2 mb-3">
                                <Col md={6}>
                                    <BootstrapForm.Group controlId="newEventCase">
                                        <BootstrapForm.Label>Case</BootstrapForm.Label>
                                        <Field
                                            as="select"
                                            name="case"
                                            onChange={(e) => handleCaseChange(e, setFieldValue)}
                                            className={`form-select ${errors.case && touched.case ? 'is-invalid' : ''}`}
                                        >
                                            <option value="">Select Case</option>
                                            {Array.isArray(allCases) && allCases.map((single_case) => (
                                                <option key={single_case.id} value={single_case.id}>{single_case.caseNumber} - {single_case.matter_title}</option>
                                            ))}
                                        </Field>
                                        {errors.case && touched.case && <BootstrapForm.Control.Feedback type="invalid">{errors.case}</BootstrapForm.Control.Feedback>}
                                    </BootstrapForm.Group>
                                </Col>
                                <Col md={6}>
                                    <BootstrapForm.Group controlId="newEventClient">
                                        <BootstrapForm.Label>Client (auto-filled from Case)</BootstrapForm.Label>
                                        <BootstrapForm.Control type="text" value={selectedClientName} disabled readOnly />
                                        {/* Hidden field for clientID if needed by form submission and not just for display */}
                                        <Field name="clientID" type="hidden" /> 
                                        {errors.clientID && touched.clientID && <BootstrapForm.Control.Feedback type="invalid">{errors.clientID}</BootstrapForm.Control.Feedback>}
                                    </BootstrapForm.Group>
                                </Col>
                            </Row>

                            <Row className="g-2 mb-3">
                                <Col md={6}>
                                    <BootstrapForm.Group controlId="newEventCaseReason">
                                        <BootstrapForm.Label>Case Reason</BootstrapForm.Label>
                                        <Field name="case_reason" as="select" className={`form-select ${errors.case_reason && touched.case_reason ? 'is-invalid' : ''}`}>
                                            <option value="">Select Reason</option>
                                            <option value="Hearing">Hearing</option>
                                            <option value="Mention">Mention</option>
                                            <option value="Judgment">Judgment</option>
                                            <option value="Bring Up">Bring Up</option>
                                            <option value="Other">Other</option>
                                        </Field>
                                        {errors.case_reason && touched.case_reason && <BootstrapForm.Control.Feedback type="invalid">{errors.case_reason}</BootstrapForm.Control.Feedback>}
                                    </BootstrapForm.Group>
                                </Col>
                                <Col md={6}>
                                    <BootstrapForm.Group controlId="newEventPriority">
                                        <BootstrapForm.Label>Priority</BootstrapForm.Label>
                                        <Field name="priority" as="select" className={`form-select ${errors.priority && touched.priority ? 'is-invalid' : ''}`}>
                                            <option value="">Select Priority</option>
                                            <option value="Low">Low</option>
                                            <option value="Medium">Medium</option>
                                            <option value="High">High</option>
                                        </Field>
                                        {errors.priority && touched.priority && <BootstrapForm.Control.Feedback type="invalid">{errors.priority}</BootstrapForm.Control.Feedback>}
                                    </BootstrapForm.Group>
                                </Col>
                            </Row>

                            <Row className="g-2 mb-3">
                                <Col md={6}>
                                    <BootstrapForm.Group controlId="newEventLocation">
                                        <BootstrapForm.Label>Location</BootstrapForm.Label>
                                        <Field name="location" type="text" placeholder="e.g., Courtroom 5, City Hall" className={`form-control ${errors.location && touched.location ? 'is-invalid' : ''}`} />
                                        {errors.location && touched.location && <BootstrapForm.Control.Feedback type="invalid">{errors.location}</BootstrapForm.Control.Feedback>}
                                    </BootstrapForm.Group>
                                </Col>
                                <Col md={6}>
                                    <BootstrapForm.Group controlId="newEventCourt">
                                        <BootstrapForm.Label>Court</BootstrapForm.Label>
                                        <Field name="court" type="text" placeholder="e.g., High Court of City" className={`form-control ${errors.court && touched.court ? 'is-invalid' : ''}`} />
                                        {errors.court && touched.court && <BootstrapForm.Control.Feedback type="invalid">{errors.court}</BootstrapForm.Control.Feedback>}
                                    </BootstrapForm.Group>
                                </Col>
                            </Row>
                            
                            <Row className="g-2 mb-3">
                                <Col md={12}>
                                   <BootstrapForm.Label>Attendees</BootstrapForm.Label>
                                   <MultipleChipSelect 
                                        setFieldValue={setFieldValue} 
                                        initialAttendees={values.attendees}
                                        employeeOptions={employees}
                                    />
                                    {errors.attendees && touched.attendees && <div className="invalid-feedback d-block">{errors.attendees}</div>}
                                </Col>
                            </Row>

                            <BootstrapForm.Group controlId="newEventSendReminders" className="mb-3">
                                <Field name="sendReminders" type="checkbox" as={BootstrapForm.Check} checked={values.sendReminders} label="Send Reminders to Attendees" className={`${errors.sendReminders && touched.sendReminders ? 'is-invalid' : ''}`} />
                                {errors.sendReminders && touched.sendReminders && <BootstrapForm.Control.Feedback type="invalid">{errors.sendReminders}</BootstrapForm.Control.Feedback>}
                            </BootstrapForm.Group>

                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={onHide}>
                                Close
                            </Button>
                            <Button variant="primary" type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Creating...' : 'Create Event'}
                            </Button>
                        </Modal.Footer>
                    </Form>
                )}
            </Formik>
        </Modal>
    );
}

export default NewEventModal;

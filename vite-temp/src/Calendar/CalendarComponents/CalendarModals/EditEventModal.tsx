import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, FormikHelpers, FormikProps } from 'formik';
import * as Yup from 'yup';
import { Modal, Button, Form as BootstrapForm, Row, Col } from 'react-bootstrap';
import { useTheme, Theme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Chip from '@mui/material/Chip';
import Swal from 'sweetalert2';
import axiosInstance from '../../../services/httpService';
import type { EventClickArg } from '@fullcalendar/core';

interface Employee {
    id: string;
    full_name: string;
}

interface EventFormValues {
    title: string;
    description: string;
    caseNumber: string;
    client_name: string;
    case_reason: string;
    location: string;
    court: string;
    priority: string;
    start_date: string;
    end_date: string;
    attendees: string[];
    sendReminders: boolean;
    [key: string]: any; 
}

interface EditEventModalProps {
    eventInfo: EventClickArg;
    show: boolean;
    onHide: () => void;
    onDeleteEvent: (eventInfo: EventClickArg) => void;
    onEventUpdateSuccess: (updatedEvent: any) => void;
}

interface MultipleChipSelectProps {
    setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void;
    initialAttendees?: string[];
    employeeOptions?: Employee[];
}

const formatDateForInput = (dateStr: string | undefined): string => {
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

function getStyles(name: string, personName: readonly string[], theme: Theme): React.CSSProperties {
    return {
        fontWeight:
            personName.indexOf(name) === -1
                ? theme.typography.fontWeightRegular
                : theme.typography.fontWeightMedium,
    };
}

const MultipleChipSelect: React.FC<MultipleChipSelectProps> = ({ setFieldValue, initialAttendees = [], employeeOptions = [] }) => {
    const theme = useTheme();
    const [personName, setPersonName] = useState<string[]>([]);

    useEffect(() => {
        if (initialAttendees && Array.isArray(initialAttendees)) {
            setPersonName(initialAttendees);
        }
    }, [initialAttendees]);

    const handleChange = (event: SelectChangeEvent<string[]>) => {
        const {
            target: { value },
        } = event;
        const newAttendees = typeof value === 'string' ? value.split(',') : value;
        setFieldValue('attendees', newAttendees);
        setPersonName(newAttendees as string[]);
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
                            style={getStyles(
                                employee.full_name,
                                personName.map((id) => {
                                    const emp = employeeOptions.find((e) => e.id === id);
                                    return emp ? emp.full_name : '';
                                }),
                                theme
                            )}
                        >
                            {employee.full_name}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </div>
    );
};

const EditEventModal: React.FC<EditEventModalProps> = ({ eventInfo, show, onHide, onDeleteEvent, onEventUpdateSuccess }) => {
    if (!eventInfo || !eventInfo.event) {
        return null;
    }
    const { event } = eventInfo;
    const [employees, setEmployees] = useState<Employee[]>([]);

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const response = await axiosInstance.get('pms/employees/');
                if (response.data) {
                    setEmployees(response.data);
                }
            } catch (error: unknown) {
                if (error instanceof Error) {
                    console.error('Error fetching employees:', error.message);
                } else {
                    console.error('An unknown error occurred:', error);
                }
            }
        };
        fetchEmployees();
    }, []);
    
    const extendedProps = event.extendedProps || {};

    const validationSchema = Yup.object().shape({
        title: Yup.string().required('Title is required'),
        description: Yup.string(),
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

    const initialValues: EventFormValues = {
        ...extendedProps,
        title: event.title,
        description: extendedProps.description || '',
        caseNumber: extendedProps.caseNumber || 'N/A',
        client_name: extendedProps.client_name || 'N/A',
        case_reason: extendedProps.case_reason || '',
        location: extendedProps.location || '',
        court: extendedProps.court || '',
        priority: extendedProps.priority || 'Medium',
        start_date: formatDateForInput(event.startStr),
        end_date: formatDateForInput(event.endStr),
        attendees: extendedProps.attendees || [],
        sendReminders: extendedProps.sendReminders !== undefined ? extendedProps.sendReminders : true,
    };

    const handleSubmit = async (values: EventFormValues, { setSubmitting }: FormikHelpers<EventFormValues>) => {
        const calendarApi = eventInfo.view.calendar;

        const payload = {
            id: event.id,
            ...values,
        };

        try {
            const response = await axiosInstance.put(`pms/calendar-events/${event.id}/`, payload)
            if (response.status !== 200) {
                throw new Error(`Failed to update event. Status: ${response.status}`);
            }
            
            const fcEvent = calendarApi.getEventById(event.id);
            if (fcEvent) {
                fcEvent.setProp('title', values.title);
                fcEvent.setDates(values.start_date, values.end_date, { allDay: eventInfo.event.allDay });
                fcEvent.setExtendedProp('description', values.description);
                fcEvent.setExtendedProp('case_reason', values.case_reason);
                fcEvent.setExtendedProp('location', values.location);
                fcEvent.setExtendedProp('court', values.court);
                fcEvent.setExtendedProp('priority', values.priority);
                fcEvent.setExtendedProp('attendees', values.attendees);
                fcEvent.setExtendedProp('sendReminders', values.sendReminders);
            }
            
            Swal.fire('Updated!', 'Event has been updated.', 'success');
            if (onEventUpdateSuccess) {
                onEventUpdateSuccess({ ...payload, ...extendedProps });
            }
        } catch (error: unknown) {
            console.error('Error updating event:', error);
            if (error instanceof Error) {
                Swal.fire('Error!', `Could not update event: ${error.message}`, 'error');
            } else {
                Swal.fire('Error!', 'An unknown error occurred.', 'error');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = () => {
        if (onDeleteEvent) {
            onDeleteEvent(eventInfo);
        }
    };

    return (
        <Modal show={show} onHide={onHide} size="lg" centered backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>Edit Event: {initialValues.title}</Modal.Title>
            </Modal.Header>
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
                enableReinitialize
            >
                {({ values, errors, touched, isSubmitting, setFieldValue }: FormikProps<EventFormValues>) => (
                    <Form>
                        <Modal.Body>
                            <Row className="g-2 mb-3">
                                <Col md={12}>
                                    <BootstrapForm.Group controlId="editEventTitle">
                                        <BootstrapForm.Label>Event Title</BootstrapForm.Label>
                                        <Field name="title" type="text" className={`form-control ${errors.title && touched.title ? 'is-invalid' : ''}`} />
                                        {errors.title && touched.title && <BootstrapForm.Control.Feedback type="invalid">{errors.title}</BootstrapForm.Control.Feedback>}
                                    </BootstrapForm.Group>
                                </Col>
                            </Row>

                            <Row className="g-2 mb-3">
                                <Col md={6}>
                                    <BootstrapForm.Group controlId="editEventStartDate">
                                        <BootstrapForm.Label>Starts</BootstrapForm.Label>
                                        <Field name="start_date" type="date" className={`form-control ${errors.start_date && touched.start_date ? 'is-invalid' : ''}`} />
                                        {errors.start_date && touched.start_date && <BootstrapForm.Control.Feedback type="invalid">{errors.start_date}</BootstrapForm.Control.Feedback>}
                                    </BootstrapForm.Group>
                                </Col>
                                <Col md={6}>
                                    <BootstrapForm.Group controlId="editEventEndDate">
                                        <BootstrapForm.Label>Ends</BootstrapForm.Label>
                                        <Field name="end_date" type="date" className={`form-control ${errors.end_date && touched.end_date ? 'is-invalid' : ''}`} />
                                        {errors.end_date && touched.end_date && <BootstrapForm.Control.Feedback type="invalid">{errors.end_date}</BootstrapForm.Control.Feedback>}
                                    </BootstrapForm.Group>
                                </Col>
                            </Row>
                            
                            <Row className="g-2 mb-3">
                                <Col md={12}>
                                    <BootstrapForm.Group controlId="editEventDescription">
                                        <BootstrapForm.Label>Brief Description</BootstrapForm.Label>
                                        <Field name="description" as="textarea" rows={3} className={`form-control ${errors.description && touched.description ? 'is-invalid' : ''}`} />
                                        {errors.description && touched.description && <BootstrapForm.Control.Feedback type="invalid">{errors.description}</BootstrapForm.Control.Feedback>}
                                    </BootstrapForm.Group>
                                </Col>
                            </Row>

                            <Row className="g-2 mb-3">
                                <Col md={6}>
                                    <BootstrapForm.Group controlId="editEventCaseNumber">
                                        <BootstrapForm.Label>Case</BootstrapForm.Label>
                                        <Field name="caseNumber" type="text" className="form-control" disabled />
                                    </BootstrapForm.Group>
                                </Col>
                                <Col md={6}>
                                    <BootstrapForm.Group controlId="editEventClientName">
                                        <BootstrapForm.Label>Client</BootstrapForm.Label>
                                        <Field name="client_name" type="text" className="form-control" disabled />
                                    </BootstrapForm.Group>
                                </Col>
                            </Row>

                            <Row className="g-2 mb-3">
                                <Col md={6}>
                                    <BootstrapForm.Group controlId="editEventCaseReason">
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
                                    <BootstrapForm.Group controlId="editEventPriority">
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
                                    <BootstrapForm.Group controlId="editEventLocation">
                                        <BootstrapForm.Label>Location</BootstrapForm.Label>
                                        <Field name="location" type="text" className={`form-control ${errors.location && touched.location ? 'is-invalid' : ''}`} />
                                        {errors.location && touched.location && <BootstrapForm.Control.Feedback type="invalid">{errors.location}</BootstrapForm.Control.Feedback>}
                                    </BootstrapForm.Group>
                                </Col>
                                <Col md={6}>
                                    <BootstrapForm.Group controlId="editEventCourt">
                                        <BootstrapForm.Label>Court</BootstrapForm.Label>
                                        <Field name="court" type="text" className={`form-control ${errors.court && touched.court ? 'is-invalid' : ''}`} />
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
                                    {errors.attendees && touched.attendees && <div className="invalid-feedback d-block">{typeof errors.attendees === 'string' && errors.attendees}</div>}
                                </Col>
                            </Row>

                            <BootstrapForm.Group controlId="editEventSendReminders" className="mb-3">
                                <Field name="sendReminders" type="checkbox" as={BootstrapForm.Check} label="Send Reminders to Attendees" className={`${errors.sendReminders && touched.sendReminders ? 'is-invalid' : ''}`} />
                                {errors.sendReminders && touched.sendReminders && <BootstrapForm.Control.Feedback type="invalid">{errors.sendReminders as string}</BootstrapForm.Control.Feedback>}
                            </BootstrapForm.Group>

                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="danger" onClick={handleDelete} className="me-auto">
                                <i className="bi bi-trash-fill"></i> Delete Event
                            </Button>
                            <Button variant="secondary" onClick={onHide}>
                                Close
                            </Button>
                            <Button variant="primary" type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </Modal.Footer>
                    </Form>
                )}
            </Formik>
        </Modal>
    );
}

export default EditEventModal;
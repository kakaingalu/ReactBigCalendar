import { useState, useEffect } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../services/httpService';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import Swal from 'sweetalert2';

import EditEventModal from './CalendarComponents/CalendarModals/EditEventModal.tsx';
import NewEventModal, { type SelectedInfo } from './CalendarComponents/CalendarModals/NewEventModal.tsx';
import ViewEventModal from './CalendarComponents/CalendarModals/ViewEventModal.tsx';

import { enUS } from 'date-fns/locale';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const getBGColor = (reason: string): string => {
  switch (reason) {
    case 'Hearing': return '#3498db';
    case 'Mention': return '#9b59b6';
    case 'Judgment': return '#2ecc71';
    case 'Bring Up': return '#f1c40f';
    case 'Other': return '#1abc9c';
    default: return '#6c757d';
  }
};

interface CaseReasonDotProps {
  reason: string;
}

const CaseReasonDot = ({ reason }: CaseReasonDotProps) => {
  const bgColor = getBGColor(reason);
  const dotStyle = {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: bgColor,
    display: 'inline-block',
    marginRight: '8px',
    flexShrink: 0,
  };
  return <div style={dotStyle} title={reason}></div>;
};

interface EventAttendee {
  id: number | string;
  name: string;
  email?: string;
}

interface CalendarEvent {
  id: number | string;
  matter_title?: string;
  start_date: string;
  end_date: string;
  all_day?: boolean;
  description?: string;
  client_name?: string;
  priority?: string;
  case_reason?: string;
  client_email?: string;
  caseNumber?: string;
  location?: string;
  court?: string;
  attendees?: EventAttendee[];
}

interface EventItemProps {
  event: CalendarEvent;
}

const EventItem = ({ event }: EventItemProps) => {
  const formatSidebarEventTime = (startDateStr: string) => {
    const start = new Date(startDateStr);
    const dateString = start.toLocaleDateString('en-US', {
      weekday: 'short', day: 'numeric', month: 'short',
    });
    const timeString = start.toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit', hour12: true,
    });
    return `${dateString}, ${timeString}`;
  };

  return (
    <div className="mb-2 shadow-sm rounded border border-gray-200 calendar-event-item">
      <div className="p-2">
        <div className="flex items-center mb-1">
          <CaseReasonDot reason={event.case_reason || ''} />
          <span className="font-semibold text-xs text-gray-500">{formatSidebarEventTime(event.start_date)}</span>
        </div>
        <h6 className="mb-1 font-semibold text-sm text-gray-800 calendar-event-item-title">{event.caseNumber || 'N/A'} | {event.case_reason}</h6>
        <p className="mb-1 text-xs text-gray-700 calendar-event-item-matter">{event.matter_title}</p>
      </div>
      {(event.location || event.court) && (
        <div className="p-1 px-2 bg-gray-100 text-gray-500 text-xs calendar-event-item-footer rounded-b">
          {event.location}{event.court && event.location ? `, ${event.court}` : event.court || ''}
        </div>
      )}
    </div>
  );
};

interface FormattedEvent {
  id: number | string;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  extendedProps: {
    description?: string;
    client_name?: string;
    matter_title?: string;
    priority?: string;
    case_reason?: string;
    client_email?: string;
    caseNumber?: string;
    caseReason?: string;
    location?: string;
    court?: string;
    attendees?: EventAttendee[];
  };
}

const Calendar = () => {
  const [events, setEvents] = useState<FormattedEvent[]>([]);
  const [eventsFromServer, setEventsFromServer] = useState<CalendarEvent[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedInfo, setSelectedInfo] = useState<CalendarEvent | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editEventInfo, setEditEventInfo] = useState<CalendarEvent | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewEventInfo, setViewEventInfo] = useState<CalendarEvent | null>(null);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch events using TanStack Query
  const { data, refetch } = useQuery<CalendarEvent[]>({
    queryKey: ['calendarEvents'],
    queryFn: async () => {
      const response = await axiosInstance.get('/pms/calendar-events/');
      if (response.status !== 200) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.data;
    },
  });

  useEffect(() => {
    if (data) {
      setEventsFromServer(data);
      formatAndSetEventsForCalendar(data);
    }
  }, [data]);

  // Effect to adjust sidebar visibility based on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 992) {
        setSidebarVisible(false);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSelectSlot = (slotInfo: any) => {
    setSelectedInfo({
      startStr: slotInfo.start,
      endStr: slotInfo.end,
      allDay: slotInfo.allDay,
    });
    setShowModal(true);
  };

  const handleSelectEvent = (event: FormattedEvent) => {
    setEditEventInfo(event as any);
    setViewEventInfo(event as any);
    setShowViewModal(true);
  };

  const formatAndSetEventsForCalendar = (serverEvents: any[]) => {
    const formattedEvents: FormattedEvent[] = serverEvents.map(event => ({
      id: event.id,
      title: event.matter_title || 'Untitled Event',
      start: new Date(event.start_date),
      end: new Date(event.end_date),
      allDay: event.all_day || false,
      extendedProps: {
        description: event.description,
        client_name: event.client_name,
        matter_title: event.matter_title,
        priority: event.priority,
        case_reason: event.case_reason,
        client_email: event.client_email,
        caseNumber: event.caseNumber,
        caseReason: event.case_reason,
        location: event.location,
        court: event.court,
        attendees: event.attendees,
      },
    }));
    setEvents(formattedEvents);
  };

  const hideModals = () => {
    setShowModal(false);
    setShowEditModal(false);
    setShowViewModal(false);
  };

  const handleEventAddSuccess = () => {
    refetch();
    hideModals();
  };

  const handleEventUpdateSuccess = () => {
    refetch();
    hideModals();
  };

  const deleteEventFromCalendar = async (event: CalendarEvent) => {
    const eventId = event.id;
    const eventTitle = event.matter_title || 'Untitled Event';

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete the event: "${eventTitle}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel',
    });

    if (result.isConfirmed) {
      try {
        const response = await axiosInstance.delete(`pms/calendar-events/${eventId}`);
        if (response.status !== 204) throw new Error('Failed to delete event');

        setEventsFromServer(prev => prev.filter((e: CalendarEvent) => e.id.toString() !== eventId.toString()));

        Swal.fire('Deleted!', 'The event has been deleted.', 'success');
      } catch (error) {
        console.error('Error deleting event:', error);
        Swal.fire('Error!', 'Could not delete the event.', 'error');
      }
    }
    hideModals();
  };

  const filteredEventsFromServer = eventsFromServer.filter(event => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      (event.matter_title && event.matter_title.toLowerCase().includes(searchTermLower)) ||
      (event.caseNumber && event.caseNumber.toLowerCase().includes(searchTermLower)) ||
      (event.case_reason && event.case_reason.toLowerCase().includes(searchTermLower)) ||
      (event.location && event.location.toLowerCase().includes(searchTermLower)) ||
      (event.court && event.court.toLowerCase().includes(searchTermLower))
    );
  });

  return (
    <div className="shadow calendar-page-wrapper bg-white rounded-md">
      <div className="p-0 md:p-3">
        <div className="flex flex-col lg:flex-row min-h-[85vh]">
          {sidebarVisible && (
            <div className="calendar-sidebar hidden lg:flex flex-col p-2 border-r border-gray-300">
              <div className="h-full shadow-none">
                <div className="bg-gray-100 p-2 flex justify-between items-center">
                  <h5 className="mb-0 text-base font-semibold">Events</h5>
                  <button
                    className="p-1 rounded hover:bg-gray-200"
                    onClick={() => setSidebarVisible(false)}
                    title="Hide sidebar"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                </div>
                <div className="p-2 flex flex-col calendar-sidebar-body">
                  <div className="mb-3 flex space-x-2">
                    <input
                      type="search"
                      placeholder="Search events..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      aria-label="Search events"
                      className="flex-grow rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button className="p-1 rounded border border-gray-300 hover:bg-gray-200">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex-grow calendar-sidebar-event-list overflow-y-auto max-h-[calc(85vh-8rem)]">
                    {filteredEventsFromServer.length > 0 ? (
                      filteredEventsFromServer.map((event) => (
                        <EventItem key={event.id} event={event} />
                      ))
                    ) : (
                      <p className="text-gray-500 text-center mt-3">No events found.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="calendar-main-area flex flex-col flex-grow p-0 lg:p-2 relative">
            {!sidebarVisible && (
              <button
                className="p-1 shadow-sm hidden lg:inline-block rounded hover:bg-gray-200 absolute top-0 left-0 m-2"
                onClick={() => setSidebarVisible(true)}
                title="Show sidebar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
            <div className="flex-grow calendar-fullcalendar-wrapper">
              <BigCalendar<FormattedEvent>
                localizer={localizer}
                events={events}
                startAccessor={event => event.start}
                endAccessor={event => event.end}
                style={{ height: '100%' }}
                selectable
                onSelectSlot={handleSelectSlot}
                onSelectEvent={handleSelectEvent}
                views={['month', 'week', 'day', 'agenda']}
                popup
              />
            </div>
          </div>
        </div>

        {showModal && selectedInfo && (
          <NewEventModal
            selectedInfo={selectedInfo}
            show={showModal}
            onHide={hideModals}
            onEventAddSuccess={handleEventAddSuccess}
          />
        )}
        {showEditModal && editEventInfo && (
          <EditEventModal
            eventInfo={editEventInfo}
            show={showEditModal}
            onHide={hideModals}
            onDeleteEvent={deleteEventFromCalendar}
            onEventUpdateSuccess={handleEventUpdateSuccess}
          />
        )}
        {showViewModal && viewEventInfo && (
          <ViewEventModal
            showModal={showViewModal}
            setEditEventInfo={setEditEventInfo}
            setShowEditModal={setShowEditModal}
            setShowViewModal={setShowViewModal}
            setViewEventInfo={(show: boolean) => setViewEventInfo(show ? viewEventInfo : null)}
            handleDeleteEvent={deleteEventFromCalendar}
            onHide={hideModals}
            eventInfo={viewEventInfo}
          />
        )}
      </div>
    </div>
  );
};

export default Calendar;

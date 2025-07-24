import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CalendarEvent {
    id: string;
    [key: string]: any;
}

const initialState: CalendarEvent[] = [];

const calendarEventSlice = createSlice({
    name: 'calendarEvents',
    initialState,
    reducers: {
        setCalendarEvents(state, action: PayloadAction<CalendarEvent[]>) {
            return action.payload;
        },
        addCalendarEvent(state, action: PayloadAction<CalendarEvent>) {
            state.push(action.payload);
        },
        removeCalendarEvent(state, action: PayloadAction<string>) {
            const index = state.findIndex(calendarEvent => calendarEvent.id === action.payload);
            if (index !== -1) {
                state.splice(index, 1);
            }
        },
        updateCalendarEvent(state, action: PayloadAction<{ id: string; newData: Partial<CalendarEvent> }>) {
            const { id, newData } = action.payload;
            const calendarEvent = state.find(calendarEvent => calendarEvent.id === id);
            if (calendarEvent) {
                Object.assign(calendarEvent, newData);
            }
        },
    },
});

export const { setCalendarEvents, addCalendarEvent, removeCalendarEvent, updateCalendarEvent } = calendarEventSlice.actions;
export const selectCalendarEvents = (state: { calendarEvents: CalendarEvent[] }) => state.calendarEvents;

export default calendarEventSlice.reducer;

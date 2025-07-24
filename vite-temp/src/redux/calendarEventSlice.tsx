import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface CaseCalendarEvent {
    id: string;
    [key: string]: any;
}

const initialState: CaseCalendarEvent[] = [];

const caseCalendarEventSlice = createSlice({
    name: 'caseCalendarEvents',
    initialState,
    reducers: {
        setCaseCalendarEvents(state, action: PayloadAction<CaseCalendarEvent[]>) {
            return action.payload;
        },
        addCaseCalendarEvent(state, action: PayloadAction<CaseCalendarEvent>) {
            state.push(action.payload);
        },
        removeCaseCalendarEvent(state, action: PayloadAction<string>) {
            const index = state.findIndex(caseCalendarEvent => caseCalendarEvent.id === action.payload);
            if (index !== -1) {
                state.splice(index, 1);
            }
        },
        updateCaseCalendarEvent(state, action: PayloadAction<{ id: string; newData: Partial<CaseCalendarEvent> }>) {
            const { id, newData } = action.payload;
            const caseCalendarEvent = state.find(caseCalendarEvent => caseCalendarEvent.id === id);
            if (caseCalendarEvent) {
                Object.assign(caseCalendarEvent, newData);
            }
        },
    },
});

export const { setCaseCalendarEvents, addCaseCalendarEvent, removeCaseCalendarEvent, updateCaseCalendarEvent } = caseCalendarEventSlice.actions;
export const selectCaseCalendarEvents = (state: { caseCalendarEvents: CaseCalendarEvent[] }) => state.caseCalendarEvents;

export default caseCalendarEventSlice.reducer;

import { createSlice } from '@reduxjs/toolkit';

const scheduleSlice = createSlice({
    name: 'schedules',
    initialState: [],
    reducers: {
            setSchedule: (state, action) => {
                // state.schedules = action.payload;
                return action.payload;
            },
            addSchedule: (state, action) => {
                state.push(action.payload);
            },
            removeSchedule: (state, action) => {
                const index = state.findIndex((stored_schedule) => stored_schedule.id === action.payload);
                if (index !== -1) {
                    state.splice(index, 1);
                }
            },
            updateSchedule: (state, action) => {
                const { id, newData } = action.payload;
                const stored_schedule = state.find((stored_schedule) => stored_schedule.id === id);
                if (stored_schedule) {
                    Object.assign(stored_schedule, newData);
                }
            },
        },
});

export const { setSchedule, addSchedule, removeSchedule, updateSchedule } = scheduleSlice.actions;
export const selectSchedules = (state) => state.schedules;

export default scheduleSlice.reducer;
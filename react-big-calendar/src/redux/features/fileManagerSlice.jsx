import { createSlice } from '@reduxjs/toolkit';

const fileManagerSlice = createSlice({
    name: 'files',
    initialState: [],
    reducers: {
            setFiles: (state, action) => {
                // state.files = action.payload;
                return action.payload;
            },
            addFiles: (state, action) => {
                state.push(action.payload);
            },
            removeFiles: (state, action) => {
                const index = state.findIndex((stored_file) => stored_file.id === action.payload);
                if (index !== -1) {
                    state.splice(index, 1);
                }
            },
            updateFiles: (state, action) => {
                const { id, newData } = action.payload;
                const stored_file = state.find((stored_file) => stored_file.id === id);
                if (stored_file) {
                    Object.assign(stored_file, newData);
                }
            },
        },
});

export const { setFiles, addFiles, removeFiles, updateFiles } = fileManagerSlice.actions;
export const selectFiles = (state) => state.files;

export default fileManagerSlice.reducer;
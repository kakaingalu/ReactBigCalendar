import { createSlice } from "@reduxjs/toolkit";

const matterSlice = createSlice({
    name: "matters",
    initialState: [],
    reducers: {
        setMatter: (state, action) => {
            // state.matter = action.payload;
            return action.payload;
        },
        addMatter: (state, action) => {
            state.push(action.payload);
        },
        removeMatter: (state, action) => {
            const index = state.findIndex((matter) => matter.id === action.payload);
            if (index !== -1) {
                state.splice(index, 1);
            }
        },
        updateMatter: (state, action) => {
            const { id, newData } = action.payload;
            const matter = state.find((matter) => matter.id === id);
            if (matter) {
                Object.assign(matter, newData);
            }
        },
    },
});

export const { setMatter, addMatter, removeMatter, updateMatter } = matterSlice.actions;
export const selectMatter = (state) => state.matters;

export default matterSlice.reducer;

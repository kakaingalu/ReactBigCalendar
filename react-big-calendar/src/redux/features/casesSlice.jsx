import { createSlice, createSelector } from '@reduxjs/toolkit';

const caseSlice = createSlice({
    name: 'cases',
    initialState: [],
    reducers: {
            setCase: (state, action) => {
                // state.cases = action.payload;
                return action.payload;
            },
            addCase: (state, action) => {
                state.push(action.payload);
            },
            removeCase: (state, action) => {
                const index = state.findIndex((stored_case) => stored_case.id === action.payload);
                if (index !== -1) {
                    state.splice(index, 1);
                }
            },
            updateCase: (state, action) => {
                const { id, newData } = action.payload;
                const stored_case = state.find((stored_case) => stored_case.id === id);
                if (stored_case) {
                    Object.assign(stored_case, newData);
                }
            },
        },
});

export const { setCase, addCase, removeCase, updateCase } = caseSlice.actions;
export const selectCases = (state) => state.cases;

export const selectCaseById = createSelector(
  [selectCases, (state, caseId) => caseId], // selectCases is your existing selector for all cases
  (cases, caseId) => {
    if (!Array.isArray(cases)) {
      console.warn("selectCaseById: 'cases' is not an array. Check your selectCases selector.", cases);
      return undefined;
    }
    return cases.find(caseItem => caseItem.id === caseId);
  }
);

export default caseSlice.reducer;
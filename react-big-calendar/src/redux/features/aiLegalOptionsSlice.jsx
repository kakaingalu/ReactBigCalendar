import { createSlice, createSelector } from '@reduxjs/toolkit';

const aiLegalOptionsSlice = createSlice({
    name: 'ai_legal_options', 
    initialState: [], 
    reducers: {
        setAiLegalOptions: (state, action) => {
            return action.payload;
        },
        addAiLegalOption: (state, action) => {
            state.push(action.payload);
        },
        removeAiLegalOption: (state, action) => {
            const index = state.findIndex((option) => option.id === action.payload);
            if (index !== -1) {
                state.splice(index, 1);
            }
        },
        updateAiLegalOption: (state, action) => {
            const { id, newData } = action.payload;
            const option = state.find((opt) => opt.id === id);
            if (option) {
                Object.assign(option, newData);
            }
        },
    },
});

export const {
    setAiLegalOptions,
    addAiLegalOption,
    removeAiLegalOption,
    updateAiLegalOption,
} = aiLegalOptionsSlice.actions;

// Selector to get all AI legal options
export const selectAiLegalOptions = (state) => state.ai_legal_options;

// Selector to get a specific AI legal option by its ID
export const selectAiLegalOptionById = createSelector(
  [selectAiLegalOptions, (state, optionId) => optionId],
  (options, optionId) => {
    if (!Array.isArray(options)) {
      console.warn("selectAiLegalOptionById: 'ai_legal_options' is not an array. Check your selectAiLegalOptions selector.", options);
      return undefined;
    }
    return options.find(option => option.id === optionId);
  }
);

export default aiLegalOptionsSlice.reducer;
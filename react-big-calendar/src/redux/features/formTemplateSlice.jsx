import { createSlice, createSelector } from '@reduxjs/toolkit';

const formTemplatesSlice = createSlice({
    name: 'form_templates',
    initialState: [], 
    reducers: {
        setFormTemplates: (state, action) => {
            return action.payload;
        },
        addFormTemplate: (state, action) => {
            // Adds a new form template to the array
            state.push(action.payload);
        },
        removeFormTemplate: (state, action) => {
            // Removes a form template by its ID
            // action.payload is expected to be the ID of the template to remove
            const index = state.findIndex((template) => template.id === action.payload);
            if (index !== -1) {
                state.splice(index, 1);
            }
        },
        updateFormTemplate: (state, action) => {
            // Updates an existing form template
            // action.payload is expected to be { id: templateId, newData: { ... } }
            const { id, newData } = action.payload;
            const template = state.find((tmpl) => tmpl.id === id);
            if (template) {
                Object.assign(template, newData);
            }
        },
    },
});

export const {
    setFormTemplates,
    addFormTemplate,
    removeFormTemplate,
    updateFormTemplate,
} = formTemplatesSlice.actions;

// Selector to get all form templates
export const selectFormTemplates = (state) => state.form_templates;

// Selector to get a specific form template by its ID
export const selectFormTemplateById = createSelector(
  [selectFormTemplates, (state, templateId) => templateId],
  (templates, templateId) => {
    if (!Array.isArray(templates)) {
      console.warn("selectFormTemplateById: 'form_templates' is not an array. Check your selectFormTemplates selector.", templates);
      return undefined;
    }
    return templates.find(template => template.id === templateId);
  }
);

export default formTemplatesSlice.reducer;
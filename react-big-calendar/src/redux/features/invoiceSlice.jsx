import { createSlice } from '@reduxjs/toolkit';

const invoiceSlice = createSlice({
    name: 'invoice',
    initialState: [],
    reducers: {
        setInvoices: (state, action) => {
            return action.payload;
        },
        addInvoice: (state, action) => {
            state.push(action.payload);
        },
        deleteInvoice: (state, action) => {
            const index = state.findIndex((invoice) => invoice.id === action.payload);
            if (index !== -1) {
                state.splice(index, 1);
            }
        },
        updateInvoice: (state, action) => {
            const { id, newData } = action.payload;
            const invoice = state.find((invoice) => invoice.id === id);
            if (invoice) {
                Object.assign(invoice, newData);
            }
        },
    }
});

export const { setInvoices, addInvoice, deleteInvoice, updateInvoice } = invoiceSlice.actions;
export const selectInvoices = (state) => state.invoices;

export default invoiceSlice.reducer;

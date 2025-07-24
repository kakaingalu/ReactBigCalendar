import { createSlice, createSelector } from '@reduxjs/toolkit';

const clientSlice = createSlice({
    name: 'clients',
    initialState: [],
    reducers: {
            setClient: (state, action) => {
                // state.clients = action.payload;
                return action.payload;
            },
            addClient: (state, action) => {
                state.push(action.payload);
            },
            removeClient: (state, action) => {
                const index = state.findIndex((client) => client.id === action.payload);
                if (index !== -1) {
                    state.splice(index, 1);
                }
            },
            updateClient: (state, action) => {
                const { id, newData } = action.payload;
                const client = state.find((client) => client.id === id);
                if (client) {
                    Object.assign(client, newData);
                }
            },
        },
});

export const { setClient, addClient, removeClient, updateClient } = clientSlice.actions;
export const selectClient = (state) => state.clients;

export const selectClientById = createSelector(
  [selectClient, (state, clientId) => clientId],
  (clients, clientId) => {
    if (!Array.isArray(clients)) return undefined;
    return clients.find(client => client.id === clientId);
  }
);

export default clientSlice.reducer;

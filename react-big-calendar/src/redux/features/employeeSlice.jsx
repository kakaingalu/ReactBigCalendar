import { createSlice } from '@reduxjs/toolkit';

const employeeSlice = createSlice({
    name: 'employees',
    initialState: [],
    reducers: {
        setEmployee(state, action) {
            return action.payload;
        },
        addEmployee(state, action) {
            state.push(action.payload);
        },
        removeEmployee(state, action) {
            const index = state.findIndex(employee => employee.id === action.payload);
            if (index !== -1) {
                state.splice(index, 1);
            }
        },
        updateEmployee(state, action) {
            const { id, newData } = action.payload;
            const employee = state.find(employee => employee.id === id);
            if (employee) {
                Object.assign(employee, newData);
            }
        },
    },
});

export const { setEmployee, addEmployee, removeEmployee, updateEmployee } = employeeSlice.actions;
export const selectEmployees = state => state.employees;

export default employeeSlice.reducer;

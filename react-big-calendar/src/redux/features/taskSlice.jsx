import { createSlice, createSelector } from '@reduxjs/toolkit';

const taskSlice = createSlice({
    name: 'task',
    initialState: [],
    reducers: {
        setTask: (state, action) => {
            return action.payload;
        },
        addTask: (state, action) => {
            state.push(action.payload);
        },
        removeTask: (state, action) => {
            const index = state.findIndex((stored_task) => stored_task.id === action.payload);
            if (index !== -1) {
                state.splice(index, 1)
            }
        },
        updatedTask: (state, action) => {
            const {id, newData} = action.payload;
            const stored_task = state.find((stored_task) => stored_task.id === id);
            if (stored_task) {
                Object.assign(stored_task, newData)
            }
        }

    }
})

export const { setTask, addTask, removeTask, updatedTask } = taskSlice.actions;
export const selectTasks = (state) => state.task;

export const selectTaskById = createSelector(
  [selectTasks, (state, taskId) => taskId], // selectTasks is your existing selector for all tasks
  (tasks, taskId) => {
    if (!Array.isArray(tasks)) {
      console.warn("selectTaskById: 'tasks' is not an array. Check your selectTasks selector.", tasks);
      return undefined;
    }
    return tasks.find(taskItem => taskItem.id === taskId);
  }
);


export default taskSlice.reducer;
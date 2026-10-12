import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { api } from '../Api/Api';

export interface ToDoImage {
  id: number;
  imageName: string;
}

export interface ToDo {
  id: number;
  name: string;
  description: string;
  isCompleted: boolean;
  images: ToDoImage[];
}

export interface UserState {
  todos: ToDo[];
  currentTodo: ToDo | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  todos: [],
  currentTodo: null,
  loading: false,
  error: null,
};

export const fetchUsers = createAsyncThunk<ToDo[]>('to-dos/fetchUsers', async () => {
  const { data } = await axios.get(`${api}to-dos`, {
    params: { PageNumber: 1, PageSize: 100 },
  });
  return (data.data ?? []) as ToDo[];
});

export const fetchUserById = createAsyncThunk<ToDo, number | string>(
  'to-dos/fetchUserById',
  async (id) => {
    const { data } = await axios.get(`${api}to-dos/${id}`);
    return data.data as ToDo;
  }
);

export const addUser = createAsyncThunk<
  void,
  { name: string; description: string; images: File[] }
>('to-dos/addUser', async ({ name, description, images }) => {
  const form = new FormData();
  form.append('Name', name);
  form.append('Description', description);
  images.forEach((image) => form.append('Images', image));
  await axios.post(`${api}to-dos`, form);
});

export const updateUser = createAsyncThunk<
  void,
  { id: number; name: string; description: string }
>('to-dos/updateUser', async ({ id, name, description }) => {
  await axios.put(`${api}to-dos`, { id, name, description });
});

export const deleteUser = createAsyncThunk<void, number>(
  'to-dos/deleteUser',
  async (id) => {
    await axios.delete(`${api}to-dos`, { params: { id } });
  }
);

export const addImages = createAsyncThunk<
  void,
  { id: number; images: File[] }
>('to-dos/addImages', async ({ id, images }) => {
  const form = new FormData();
  images.forEach((image) => form.append('Images', image));
  await axios.post(`${api}to-dos/${id}/images`, form);
});

export const deleteImage = createAsyncThunk<void, number>(
  'to-dos/deleteImage',
  async (imageId) => {
    await axios.delete(`${api}to-dos/images/${imageId}`);
  }
);

export const toggleCompleted = createAsyncThunk<void, number>(
  'to-dos/toggleCompleted',
  async (id) => {
    await axios.put(`${api}completed`, null, { params: { id } });
  }
);

const toMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Something went wrong';

export const userSlice = createSlice({
  name: 'to-do',
  initialState,
  reducers: {
    clearCurrentTodo: (state) => {
      state.currentTodo = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.todos = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = toMessage(action.error);
      })
      .addCase(fetchUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTodo = action.payload;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = toMessage(action.error);
      })
      .addCase(addUser.rejected, (state, action) => {
        state.error = toMessage(action.error);
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.error = toMessage(action.error);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.error = toMessage(action.error);
      })
      .addCase(addImages.rejected, (state, action) => {
        state.error = toMessage(action.error);
      })
      .addCase(deleteImage.rejected, (state, action) => {
        state.error = toMessage(action.error);
      })
      .addCase(toggleCompleted.rejected, (state, action) => {
        state.error = toMessage(action.error);
      });
  },
});

export const { clearCurrentTodo } = userSlice.actions;
export default userSlice.reducer;

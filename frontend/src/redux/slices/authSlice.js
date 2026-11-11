import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

const getSavedUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    return null;
  }
};

export const registerUser = createAsyncThunk("auth/register", async (data, thunkAPI) => {
  try {
    const response = await api.post("/auth/register", data);
    localStorage.setItem("token", response.data.token);
    localStorage.setItem("user", JSON.stringify(response.data.user));
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || "Registration failed");
  }
});

export const loginUser = createAsyncThunk("auth/login", async (data, thunkAPI) => {
  try {
    const response = await api.post("/auth/login", data);
    localStorage.setItem("token", response.data.token);
    localStorage.setItem("user", JSON.stringify(response.data.user));
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || "Login failed");
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: getSavedUser(),
    loading: false,
    error: null
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  },
  extraReducers: (builder) => {
    [registerUser, loginUser].forEach((action) => {
      builder
        .addCase(action.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(action.fulfilled, (state, result) => {
          state.loading = false;
          state.user = result.payload.user;
        })
        .addCase(action.rejected, (state, result) => {
          state.loading = false;
          state.error = result.payload;
        });
    });
  }
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export const fetchProducts = createAsyncThunk("products/fetch", async (_, thunkAPI) => {
  try {
    const response = await api.get("/products");
    return response.data.products;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || "Could not load products");
  }
});

const productSlice = createSlice({
  name: "products",
  initialState: { items: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export default productSlice.reducer;

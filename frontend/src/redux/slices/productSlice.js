
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";


export const fetchProducts = createAsyncThunk(
  "products/fetch",
  async (_, thunkAPI) => {
    try {
      const response = await api.get("/products");


      console.log("Full API Response:", response.data);
      console.log("Response type:", typeof response.data);
      console.log("Is Array:", Array.isArray(response.data));

      console.log("Products API Response:", response.data);

      const products = Array.isArray(response.data)
        ? response.data
        : response.data?.products;

      if (!Array.isArray(products)) {
        return thunkAPI.rejectWithValue(
          "Invalid API response: products array not found"
        );
      }

      return products;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message ||
        error.message ||
        "Could not load products"
      );
    }
  }
);

const productSlice = createSlice({
  name: "products",

  initialState: {
    items: [],
    loading: false,
    error: null,
  },

  reducers: {},

  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.error = null;
      })

      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.items = [];
        state.error = action.payload || "Failed to load products";
      });
  },
});

export default productSlice.reducer;

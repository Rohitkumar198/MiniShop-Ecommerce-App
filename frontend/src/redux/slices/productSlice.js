
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export const fetchProducts = createAsyncThunk(
  "products/fetch",
  async (_, thunkAPI) => {
    try {
      const response = await api.get("/products");

      console.log("API Base URL:", api.defaults.baseURL);
      console.log("Products API Response:", response.data);

      const responseData = response.data;

      // Handle different API response formats
      const products = Array.isArray(responseData)
        ? responseData
        : Array.isArray(responseData?.products)
        ? responseData.products
        : Array.isArray(responseData?.data)
        ? responseData.data
        : Array.isArray(responseData?.data?.products)
        ? responseData.data.products
        : null;

      if (!products) {
        console.error("Invalid Products Response:", responseData);

        return thunkAPI.rejectWithValue(
          "Invalid API response: products array not found. Check API URL and backend response."
        );
      }

      console.log("Products Loaded Successfully:", products.length);

      return products;
    } catch (error) {
      console.error("Fetch Products Error:", error);

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
        state.error = action.payload || "Failed to load products";
      });
  },
});

export default productSlice.reducer;

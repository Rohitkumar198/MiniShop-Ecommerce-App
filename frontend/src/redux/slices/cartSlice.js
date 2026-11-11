import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export const fetchCart = createAsyncThunk("cart/fetch", async (_, thunkAPI) => {
  try {
    const response = await api.get("/cart");
    return response.data.cart;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || "Could not load cart");
  }
});

export const addCartItem = createAsyncThunk("cart/add", async (data, thunkAPI) => {
  try {
    const response = await api.post("/cart", data);
    return response.data.cart;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || "Could not add item");
  }
});

export const updateCartItem = createAsyncThunk("cart/update", async ({ productId, quantity }, thunkAPI) => {
  try {
    const response = await api.put(`/cart/${productId}`, { quantity });
    return response.data.cart;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || "Could not update cart");
  }
});

export const removeCartItem = createAsyncThunk("cart/remove", async (productId, thunkAPI) => {
  try {
    const response = await api.delete(`/cart/${productId}`);
    return response.data.cart;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || "Could not remove item");
  }
});

export const placeOrder = createAsyncThunk("cart/placeOrder", async (shippingAddress, thunkAPI) => {
  try {
    const response = await api.post("/orders", { shippingAddress });
    return response.data.order;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || "Could not place order");
  }
});

const cartSlice = createSlice({
  name: "cart",
  initialState: { data: { items: [] }, loading: false, error: null, lastOrder: null },
  reducers: {
    resetCart: (state) => { state.data = { items: [] }; state.lastOrder = null; state.error = null; }
  },
  extraReducers: (builder) => {
    [fetchCart, addCartItem, updateCartItem, removeCartItem].forEach((action) => {
      builder
        .addCase(action.pending, (state) => { state.loading = true; state.error = null; })
        .addCase(action.fulfilled, (state, result) => {
          state.loading = false;
          state.data = result.payload;
          if (action === addCartItem) state.lastOrder = null;
        })
        .addCase(action.rejected, (state, result) => {
          state.loading = false;
          state.error = result.payload;
        });
    });
    builder
      .addCase(placeOrder.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(placeOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.data = { ...state.data, items: [] };
        state.lastOrder = action.payload;
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { resetCart } = cartSlice.actions;
export default cartSlice.reducer;

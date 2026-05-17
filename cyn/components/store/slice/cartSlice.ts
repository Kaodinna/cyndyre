import { CartProduct } from "@/types/type";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";

export interface CartState {
  cart: CartProduct[];
  selectedItems: string[];
}
interface IncreaseQuantityPayload {
  id: string;
}

interface DecreaseQuantityPayload {
  id: string;
}

interface RemoveItemPayload {
  id: string;
}

interface RemoveMultiplePayload {
  ids: string[];
}

const cartSlice = createSlice({
  name: "cart",
  initialState: { cart: [], selectedItems: [] } as CartState,
  reducers: {
    addToCart: (state, action) => {
      const itemInCart = state.cart.find(
        (item) => item.id === action.payload.id,
      );

      if (!itemInCart) {
        state.cart.push({
          ...action.payload,
          quantity: action.payload.quantity,
        });
      } else {
        // Optional: Update the quantity if the item is already in the cart
        itemInCart.quantity += action.payload.quantity;
      }
    },
    increaseQuantity: (
      state,
      action: PayloadAction<IncreaseQuantityPayload>,
    ) => {
      const item = state.cart.find((item) => item.id === action.payload.id);
      if (item && item.quantity !== undefined) {
        item.quantity++;
      }
    },

    decreaseQuantity: (
      state,
      action: PayloadAction<DecreaseQuantityPayload>,
    ) => {
      const item = state.cart.find((item) => item.id === action.payload.id);
      if (item && item.quantity !== undefined && item.quantity > 1) {
        item.quantity--;
      }
    },

    // removeItem: (state, action: PayloadAction<RemoveItemPayload>) => {
    //   state.cart = state.cart.filter((item) => item.id !== action.payload.id);
    // },
    removeItem: (state, action: PayloadAction<RemoveItemPayload>) => {
      state.cart = state.cart.filter((item) => item.id !== action.payload.id);
      state.selectedItems = state.selectedItems.filter(
        (id) => id !== action.payload.id,
      ); // also remove from selection
    },
    // Toggle selection of a single item
    toggleSelect: (state, action: PayloadAction<string>) => {
      // safety check
      if (!state.selectedItems) {
        state.selectedItems = [];
      }

      const id = action.payload;
      if (state.selectedItems.includes(id)) {
        state.selectedItems = state.selectedItems.filter(
          (itemId) => itemId !== id,
        );
      } else {
        state.selectedItems.push(id);
      }
    },
    // Select all items
    selectAll: (state) => {
      state.selectedItems = state.cart.map((item) => item.id);
    },

    // Clear selection
    clearSelection: (state) => {
      state.selectedItems = [];
    },

    // Remove multiple selected items
    removeSelectedItems: (state) => {
      const removeSet = new Set(state.selectedItems);
      state.cart = state.cart.filter((item) => !removeSet.has(item.id));
      state.selectedItems = [];
    },

    // Optional: remove multiple items by passing an array of IDs
    removeMultipleItems: (
      state,
      action: PayloadAction<RemoveMultiplePayload>,
    ) => {
      const removeSet = new Set(action.payload.ids);
      state.cart = state.cart.filter((item) => !removeSet.has(item.id));
      state.selectedItems = state.selectedItems.filter(
        (id) => !removeSet.has(id),
      );
    },
    // ✅ ADD THIS
    clearCart: (state) => {
      state.cart = [];
      state.selectedItems = [];
    },
  },
});

export const {
  addToCart,
  increaseQuantity,
  decreaseQuantity,
  removeItem,
  toggleSelect,
  selectAll,
  clearSelection,
  removeSelectedItems,
  removeMultipleItems,
  clearCart,
} = cartSlice.actions;

export const cartReducer = cartSlice.reducer;

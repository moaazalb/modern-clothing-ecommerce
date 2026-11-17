import { configureStore, createListenerMiddleware } from "@reduxjs/toolkit";

import authReducer, { clearCredentials } from "@/features/auth/store/authSlice";
import { baseApi } from "@/lib/api/baseApi";

/**
 * Creates a new Redux store instance.
 *
 * A separate store instance is created for each application provider.
 * When the credentials are cleared (logout or failed refresh), the whole API
 * cache is reset so one user's data is never shown to the next user.
 *
 * @returns A configured Redux store.
 */
export function makeStore() {
  const listener = createListenerMiddleware();

  listener.startListening({
    actionCreator: clearCredentials,
    effect: (_action, api) => {
      api.dispatch(baseApi.util.resetApiState());
    },
  });

  return configureStore({
    reducer: {
      auth: authReducer,
      [baseApi.reducerPath]: baseApi.reducer,
    },

    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().prepend(listener.middleware).concat(baseApi.middleware),
  });
}

export type AppStore = ReturnType<typeof makeStore>;

export type RootState = ReturnType<AppStore["getState"]>;

export type AppDispatch = AppStore["dispatch"];
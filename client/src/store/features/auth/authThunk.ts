// // redux/features/auth/authThunks.ts
// import { createAsyncThunk } from "@reduxjs/toolkit";
// import api from "@/lib/api"; // You said you already use this
// import { registerSuccess, registerFailure, registerStart } from "./authSlice";

// export const registerUser = (userData: any) => async (dispatch: any) => {
//   try {
//     dispatch(registerStart());

//     const res = await api.post("/auth/register", userData);

//     const { token, user } = res.data;

//     dispatch(registerSuccess({ token, user }));
//     return { success: true }; // good for use in frontend
//   } catch (err: any) {
//     const message = err.response?.data?.message || "Unexpected error";
//     dispatch(registerFailure(message));
//     return { success: false, error: message }; // optional
//   }
// };

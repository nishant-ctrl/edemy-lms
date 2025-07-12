import { create } from "zustand";
import { createAuthSlice } from "./slices/authSlice";
import { createCourseSlice } from "./slices/courseSlice";
import { createEducatorSlice } from "./slices/educatorSlice";

export const useAppStore = create()((...a) => ({
    ...createAuthSlice(...a),
    ...createCourseSlice(...a),
    ...createEducatorSlice(...a),
}));

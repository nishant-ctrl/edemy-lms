import { dummyCourses } from "../../assets/assets";

export const createEducatorSlice = (set) => ({
    isEducator: false,
    setIsEducator: (isEducator) => set({ isEducator }),
});

import { dummyCourses } from "../../assets/assets";

export const createCourseSlice = (set) => ({
    allCourses: [],
    setAllCourses: (allCourses) => set({ allCourses }),
});


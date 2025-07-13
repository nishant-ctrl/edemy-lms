import { createContext, useContext, useEffect, useState } from "react";
import { dummyCourses } from "../assets/assets";
import humanizeDuration from "humanize-duration";
export const AppContext = createContext({});

export const useAppContext = () => {
  return useContext(AppContext);
};

export const AppContextProvider = ({ children }) => {
  const currency = import.meta.env.VITE_CURRENCY;
  const [allCourses, setAllCourses] = useState([]);
  const [isEducator, setIsEducator] = useState(true);
  const [enrolledCourses, setenrolledCourses] = useState([]);
  const fetchUserEnrolledCourses = async () => {
    setenrolledCourses(dummyCourses);
  };
  const fetchAllCourses = async () => {
    setAllCourses(dummyCourses);
  };
  const calculateRating = (course) => {
    if (course.courseRatings.length === 0) {
      return 0;
    }
    let totalRating = 0;
    course.courseRatings.forEach((rating) => {
      totalRating += rating.rating;
    });
    return totalRating / course.courseRatings.length;
  };
  const calculateChapterTime = (chapter) => {
    let time = 0;
    chapter.chapterContent.map((lecture) => (time += lecture.lectureDuration));
    return humanizeDuration(time * 60 * 1000, { units: ["h", "m"] });
  };
  const calculateCourseDuration = (course) => {
    let time = 0;
    course.courseContent.map((chapter) =>
      chapter.chapterContent.map((lecture) => {
        time += lecture.lectureDuration;
      })
    );
    return humanizeDuration(time * 60 * 1000, { units: ["h", "m"] });
  };
  const calculateNoOfLectures = (course) => {
    let totalLectures = 0;
    course.courseContent.forEach((chapter) => {
      if (Array.isArray(chapter.chapterContent)) {
        totalLectures += chapter.chapterContent.length;
      }
    });
    return totalLectures;
  };
  useEffect(() => {
    fetchAllCourses();
    fetchUserEnrolledCourses();
  }, []);
  const value = {
    currency,
    allCourses,
    setAllCourses,
    isEducator,
    setIsEducator,
    calculateRating,
    calculateCourseDuration,
    calculateChapterTime,
    calculateNoOfLectures,
    enrolledCourses,
  };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

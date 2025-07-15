import { createContext, useContext, useEffect, useState } from "react";
import { dummyCourses } from "../assets/assets";
import humanizeDuration from "humanize-duration";
import { useAuth, useUser } from "@clerk/clerk-react";
import axios from "axios";
import { toast } from "react-toastify";
export const AppContext = createContext({});
export const useAppContext = () => {
  return useContext(AppContext);
};

export const AppContextProvider = ({ children }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const currency = import.meta.env.VITE_CURRENCY;
  const [allCourses, setAllCourses] = useState([]);
  const [isEducator, setIsEducator] = useState(false);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [userData, setUserData] = useState(null);

  const { getToken } = useAuth();
  const { user } = useUser();

  const fetchUserEnrolledCourses = async () => {
    try {
      const token = await getToken();
      const res = await axios.get(backendUrl + "/api/user/enrolled-courses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.statusCode === 200) {
        setEnrolledCourses(res.data.data.enrolledCourses.reverse());
      }
    } catch (error) {
      // console.log(error.message);
      toast.error(error.response.data.message);
    }
  };
  const fetchUserData = async () => {
    if (user.publicMetadata.role === "educator") {
      setIsEducator(true);
    }
    try {
      const token = await getToken();
      const res = await axios.get(backendUrl + "/api/user/data", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.statusCode === 200) {
        setUserData(res.data.data);
      }
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };
  const fetchAllCourses = async () => {
    try {
      const res = await axios.get(backendUrl + "/api/course/all");
      if (res.data.statusCode === 200) {
        setAllCourses(res.data.data);
      }
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  const calculateRating = (course) => {
    if (course.courseRatings.length === 0) {
      return 0;
    }
    let totalRating = 0;
    course.courseRatings.forEach((rating) => {
      totalRating += rating.rating;
    });
    return Math.floor(totalRating / course.courseRatings.length);
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
  }, []);
  useEffect(() => {
    if (user) {
      fetchUserData();
      fetchUserEnrolledCourses();
    }
  }, [user]);
  const value = {
    backendUrl,
    getToken,
    fetchAllCourses,
    fetchUserEnrolledCourses,
    userData,
    setUserData,
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

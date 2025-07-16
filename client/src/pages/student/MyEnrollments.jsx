import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import { Line } from "rc-progress";
import Footer from "../../components/student/Footer";
import axios from "axios";
function MyEnrollments() {
  const navigate = useNavigate();
  const {
    enrolledCourses,
    calculateCourseDuration,
    userData,
    fetchUserEnrolledCourses,
    backendUrl,
    getToken,
    calculateNoOfLectures,
  } = useAppContext();
  const [progressArray, setProgressArray] = useState([]);

  const getCourseProgress = async () => {
    try {
      const token = await getToken();
      const tempProgressArray = await Promise.all(
        enrolledCourses.map(async (course) => {
          const res = await axios.post(
            `${backendUrl}/api/user/get-course-progress`,
            { courseId: course._id },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const data = res.data.data;
          let totalLectures = calculateNoOfLectures(course);
          const lectureCompleted = data.lectureCompleted
            ? data.lectureCompleted.length
            : 0;
          return { totalLectures, lectureCompleted };
        })
      );
      setProgressArray(tempProgressArray);
    } catch (error) {
      toast.error(error.data.message);
    }
  };
  useEffect(() => {
    if (userData) {
      fetchUserEnrolledCourses();
    }
  }, [userData]);
  useEffect(() => {
    if (enrolledCourses.length > 0) {
      getCourseProgress();
    }
  }, [enrolledCourses]);
  return (
    <>
      <div className="px-8 md:px-36 pt-10">
        <h1 className="text-2xl font-semibold">My Enrollments</h1>
        <table className="table-fixed md:table-auto w-full overflow-hidden border mt-10">
          <thead className="text-gray-900 border-b border-gray-500/20 text-sm text-left max-sm:hidden">
            <tr>
              <th className="px-4 py-3 font-semibold truncate">Course</th>
              <th className="px-4 py-3 font-semibold truncate">Duration</th>
              <th className="px-4 py-3 font-semibold truncate">Completed</th>
              <th className="px-4 py-3 font-semibold truncate">Status</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {enrolledCourses.map((course, i) => {
              return (
                <tr key={i} className="border-b border-gray-500/20">
                  <td className="md:px-4 pl-2 md:pl-4 py-3 flex items-center space-x-3">
                    <img
                      className="w-14 ms:w-24 md:w-28"
                      src={course.courseThumbnail}
                      alt="course-thumbnail"
                    />
                    <div className="flex-1">
                      <p className="mb-1 max-sm:text-sm">
                        {course.courseTitle}
                      </p>
                      <Line
                        strokeWidth={2}
                        percent={
                          progressArray[i]
                            ? (progressArray[i].lectureCompleted /
                                progressArray[i].totalLectures) *
                              100
                            : 0
                        }
                        className="bg-gray-300 rounded-full"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3 max-sm:hidden">
                    {calculateCourseDuration(course)}
                  </td>
                  <td className="px-4 py-3 max-sm:hidden">
                    {progressArray[i]
                      ? `${progressArray[i].lectureCompleted} / ${progressArray[i].totalLectures}`
                      : `0`}{" "}
                    <span>Lectures</span>
                  </td>
                  <td className="px-4 py-3 max-sm:text-right">
                    <button
                      className="w-full px-3 sm:px-5 py-1.5 sm:py-2 bg-blue-600 max-sm:text-xs text-white"
                      onClick={() => {
                        navigate(`/player/${course._id}`);
                      }}
                    >
                      {progressArray[i] &&
                      progressArray[i].lectureCompleted /
                        progressArray[i].totalLectures ===
                        1
                        ? "Completed"
                        : "On Going"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Footer />
    </>
  );
}

export default MyEnrollments;

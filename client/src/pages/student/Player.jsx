import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import Loading from "../../components/student/Loading";
import Rating from "../../components/student/Rating";
import { assets } from "../../assets/assets";
import humanizeDuration from "humanize-duration";
import YouTube from "react-youtube";
import Footer from "../../components/student/Footer";
import axios from "axios";
import { toast } from "react-toastify";
function Player() {
  const { courseId } = useParams();
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(false);
  const {
    enrolledCourses,
    calculateChapterTime,
    backendUrl,
    getToken,
    userData,
    fetchUserEnrolledCourses,
  } = useAppContext();
  const [openSection, setOpenSection] = useState({});
  const [playerData, setPlayerData] = useState(null);

  const [progressData, setProgressData] = useState(null);
  const [initialRating, setInitialRating] = useState(0);

  const getCourseData = () => {
    setLoading(true);
    enrolledCourses.map((course) => {
      if (course._id === courseId) {
        setCourseData(course);
        course.courseRatings.map((item) => {
          if (item.userId === userData._id) {
            setInitialRating(item.rating);
          }
        });
      }
    });
    setLoading(false);
  };
  const getCourseProgress = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const res = await axios.post(
        backendUrl + "/api/user/get-course-progress",
        { courseId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.data.statusCode === 200) {
        setProgressData(res.data.data);
      }
    } catch (error) {
      const e = error?.response?.data?.message;
      toast.error(e);
    } finally {
      setLoading(false);
    }
  };
  const markLectureAsCompleted = async (lectureId) => {
    try {
      setLoading(true);
      const token = await getToken();
      const res = await axios.post(
        backendUrl + "/api/user/update-course-progress",
        { courseId, lectureId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.data.statusCode === 200) {
        toast.success(res.data.message);
        await getCourseProgress();
      }
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };
  const handleRate = async (rating) => {
    try {
      const token = await getToken();
      const res = await axios.post(
        backendUrl + "/api/user/add-rating",
        { courseId, rating },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.data.statusCode === 200) {
        toast.success(res.data.message);
        await fetchUserEnrolledCourses();
      }
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };
  const handleToggle = (i) => {
    setOpenSection((prev) => ({ ...prev, [i]: !prev[i] }));
  };

  useEffect(() => {
    getCourseProgress();
  }, []);
  useEffect(() => {
    if (enrolledCourses.length > 0) {
      getCourseData();
    }
  }, [enrolledCourses, courseId]);
  if (loading || enrolledCourses.length === 0) {
    return <Loading />;
  }
  if (!courseData) return <div>Course Not Found</div>;
  return (
    <>
      <div className="p-4 sm:p-10 flex flex-col-reverse md:grid md:grid-cols-2 gap-10 md:px-36">
        <div className="text-gray-800">
          <h2 className="text-xl font-semibold">Course Structure</h2>
          <div className="pt-5">
            {courseData &&
              courseData.courseContent.map((chapter, i) => (
                <div
                  key={i}
                  className="border border-gray-300 bg-white mb-2 rounded"
                >
                  <div
                    className="flex items-center justify-between px-4 py-3 cursor-pointer select-none"
                    onClick={() => handleToggle(i)}
                  >
                    <div className="flex items-center gap-2">
                      <img
                        className={`transform transition-transform ${
                          openSection[i] ? "rotate-180" : ""
                        }`}
                        src={assets.down_arrow_icon}
                        alt="arrow-icon"
                      />
                      <p className="font-medium md:text-base text-sm">
                        {chapter.chapterTitle}
                      </p>
                    </div>
                    <p className="text-sm md:text-default">
                      {chapter.chapterContent.length} lectures -{" "}
                      {calculateChapterTime(chapter)}
                    </p>
                  </div>
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      openSection[i] ? "max-h-96" : "hidden max-h-0"
                    }`}
                  >
                    <ul className="list-disc md:pl-10 pl-4 pr-4 py-2 text-gray-600 border-t border-r-gray-300">
                      {chapter.chapterContent.map((lecture, i) => (
                        <li className="flex items-start gap-2 py-1" key={i}>
                          <img
                            src={
                              progressData &&
                              progressData.lectureCompleted.includes(
                                lecture.lectureId
                              )
                                ? assets.blue_tick_icon
                                : assets.play_icon
                            }
                            alt="play-icon"
                            className="w-4 h-4 mt-1"
                          />
                          <div className="flex items-center justify-between w-full text-gray-800 text-xs md:text-default">
                            <p>{lecture.lectureTitle}</p>
                            <div className="flex gap-2">
                              {lecture.lectureUrl && (
                                <p
                                  className="text-blue-500 cursor-pointer"
                                  onClick={() => {
                                    setPlayerData({
                                      ...lecture,
                                      chapter: i + 1,
                                      lecture: i + 1,
                                    });
                                  }}
                                >
                                  Watch
                                </p>
                              )}
                              <p className="text-blue-500 cursor-pointer">
                                {humanizeDuration(
                                  lecture.lectureDuration * 60 * 1000,
                                  {
                                    units: ["h", "m"],
                                  }
                                )}
                              </p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
          </div>

          <div className="flex items-center gap-2 py-3 mt-10">
            <h1 className="text-xl font-bold">Rate this course:</h1>
            <Rating initialRating={initialRating} onRate={handleRate} />
          </div>
        </div>

        <div className="md:mt-10">
          {playerData ? (
            <div>
              <YouTube
                key={playerData.lectureUrl}
                videoId={playerData.lectureUrl.split("/").pop()}
                iframeClassName="w-full aspect-video"
              />
              <div className="flex justify-between items-center mt-1">
                <p>
                  {playerData.chapter}.{playerData.lecture}.
                  {playerData.lectureTitle}
                </p>
                <button
                  className="text-white bg-blue-500 px-2 py-1 rounded cursor-pointer"
                  onClick={() => markLectureAsCompleted(playerData.lectureId)}
                >
                  {progressData &&
                  progressData.lectureCompleted.includes(playerData.lectureId)
                    ? "Completed"
                    : "Mark Complete"}
                </button>
              </div>
            </div>
          ) : (
            <img
              src={courseData ? courseData.courseThumbnail : ""}
              alt="thumbnail"
            />
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Player;

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Loading from "../../components/student/Loading";
import { useAppContext } from "../../context/AppContext";
import truncate from "truncate-html";
import { assets } from "../../assets/assets";
import Footer from "../../components/student/Footer";
import humanizeDuration from "humanize-duration";
import Youtube from "react-youtube";
import { toast } from "react-toastify";
import axios from "axios";
function CourseDetails() {
  const { id } = useParams();
  const [isAlreadyEnrolled, setIsAlreadyEnrolled] = useState(false);
  const [courseData, setCourseData] = useState(null);
  const [playerData, setPlayerData] = useState(null);
  const [loading, setLoading] = useState(false);
  const {
    currency,
    allCourses,
    calculateRating,
    calculateCourseDuration,
    calculateChapterTime,
    calculateNoOfLectures,
    backendUrl,
    userData,
    getToken,
  } = useAppContext();
  const [openSection, setOpenSection] = useState({});
  const extractYouTubeVideoId = (url) => {
    const match = url.match(
      /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/))([a-zA-Z0-9_-]{11})/
    );
    return match ? match[1] : null;
  };

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(backendUrl + "/api/course/" + id);
      if (res.data.statusCode === 200) {
        setCourseData(res.data.data);
      }
    } catch (error) {
      toast.error(error.data.message);
    } finally {
      setLoading(false);
    }
  };

  const enrollCourse = async () => {
    try {
      if (!userData) {
        toast.warn("Login to enroll");
      }
      if (isAlreadyEnrolled) {
        toast.warn("Already Enrolled");
      }
      setLoading(true);
      const token = await getToken();
      const res = await axios.post(
        backendUrl + "/api/user/purchase",
        { courseId: courseData._id },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.data.statusCode === 200) {
        const { session_url } = res.data.data;
        window.location.replace(session_url);
      }
    } catch (error) {
      toast.error(error.data.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (i) => {
    setOpenSection((prev) => ({ ...prev, [i]: !prev[i] }));
  };
  useEffect(() => {
    fetchCourseData();
  }, [allCourses, id]);
  useEffect(() => {
    if (userData && courseData) {
      setIsAlreadyEnrolled(userData.enrolledCourses.includes(courseData._id));
    }
  }, [userData, courseData]);
  if (loading) {
    return <Loading />;
  }
  if (!courseData) return <div>Course Not Found</div>;
  return (
    <>
      <div className="flex md:flex-row flex-col-reverse gap-10 relative items-start justify-between md:px-36 px-8 md:pt-30 pt-20 text-left">
        <div className="absolute top-0 left-0 w-full h-[500px] z-1 bg-gradient-to-b from-cyan-100/70"></div>
        <div className="max-w-xl z-10 text-gray-500">
          <h1 className="md:text-[36px] md:leading-[44px] text-[26px] leading-[36px] font-semibold text-gray-800">
            {courseData.courseTitle}
          </h1>

          <p
            className="pt-4 md:text-base text-sm"
            dangerouslySetInnerHTML={{
              __html: truncate(courseData.courseDescription, 200),
            }}
          ></p>
          <div className="flex items-center space-x-2 pt-3 pb-1 text-sm">
            <p>{calculateRating(courseData)}</p>
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <img
                  className="w-3.5 h-3.5"
                  key={i}
                  src={
                    i < Math.floor(calculateRating(courseData))
                      ? assets.star
                      : assets.star_blank
                  }
                  alt="star"
                />
              ))}
            </div>
            <p className="text-blue-600">
              ({courseData.courseRatings?.length}
              {courseData.courseRatings?.length > 1 ? ` ratings` : ` rating`})
            </p>
            <p>
              {courseData.enrolledStudents.length}
              {courseData.enrolledStudents.length > 1
                ? ` students`
                : ` student`}
            </p>
          </div>
          <p className="text-sm">
            Course by{" "}
            <span className="text-blue-600 underline">
              {courseData.educator.name}
            </span>
          </p>
          <div className="pt-8 text-gray-800">
            <h2 className="text-xl font-semibold">Course Structure</h2>
            <div className="pt-5">
              {courseData.courseContent.map((chapter, i) => (
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
                            src={assets.play_icon}
                            alt="play-icon"
                            className="w-4 h-4 mt-1"
                          />
                          <div className="flex items-center justify-between w-full text-gray-800 text-xs md:text-default">
                            <p>{lecture.lectureTitle}</p>
                            <div className="flex gap-2">
                              {lecture.isPreviewFree && (
                                <p
                                  className="text-blue-500 cursor-pointer"
                                  onClick={() =>
                                    setPlayerData({
                                      videoId: extractYouTubeVideoId(
                                        lecture.lectureUrl
                                      ),
                                    })
                                  }
                                >
                                  Preview
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
          </div>
          <div className="py-20 text-sm md:text-default">
            <h3 className="text-xl font-semibold text-gray-800">
              Course Description
            </h3>
            <p
              className="pt-3 rich-text"
              dangerouslySetInnerHTML={{
                __html: truncate(courseData.courseDescription),
              }}
            ></p>
          </div>
        </div>
        <div className="max-w-[420px] z-10 shadow-[0px_4px_15px_2px_rgba(0,0,0,0.1)] rounded-t md:rounded-none overflow-hidden bg-white min-w-[300px] sm:min-w-[420px]">
          {playerData ? (
            <Youtube
              videoId={playerData.videoId}
              opts={{
                playerVars: {
                  autoplay: 1,
                },
              }}
              iframeClassName="w-full aspect-video"
            />
          ) : (
            <img src={courseData.courseThumbnail} alt="course-thumbnail" />
          )}

          <div className="p-5">
            <div className="flex items-center gap-2">
              <img
                src={assets.time_left_clock_icon}
                alt="time-left-clock-icon"
                className="w-3.5"
              />
              <p className="text-red-500">
                <span className="font-medium">5 days</span> left at this price
              </p>
            </div>
            <div className="flex gap-3 items-center pt-2">
              <p className="text-gray-800 md:text-4xl text-2xl font-semibold">
                {currency}
                {(
                  courseData.coursePrice -
                  (courseData.discount * courseData.coursePrice) / 100
                ).toFixed(2)}
              </p>
              <p className="md:text-lg text-gray-500 line-through">
                {currency}
                {courseData.coursePrice}
              </p>
              <p className="md:text-lg text-gray-500">
                {courseData.discount}% off
              </p>
            </div>
            <div className="flex items-center text-sm md:text-default gap-4 pt-2 md:pt-4 text-gray-500">
              <div className="flex items-center gap-1">
                <img src={assets.star} alt="star-icon" />
                <p>{calculateRating(courseData)}</p>
              </div>
              <div className="flex items-center gap-1">
                <img src={assets.time_clock_icon} alt="clock-icon" />
                <p>{calculateCourseDuration(courseData)}</p>
              </div>
              <div className="h-4 w-px bg-gray-500/40"></div>
              <div className="flex items-center gap-1">
                <img src={assets.lesson_icon} alt="clock-icon" />
                <p>{calculateNoOfLectures(courseData)} lessions</p>
              </div>
            </div>
            <button
              className="cursor-pointer md:mt-6 mt-4 w-full py-3 rounded bg-blue-600 text-white font-medium"
              onClick={enrollCourse}
            >
              {isAlreadyEnrolled ? "Already Enrolled" : "Enroll Now"}
            </button>
            <div className="pt-6">
              <p className="text-lg md:text-xl font-medium text-gray-800">
                What's in the course?
              </p>
              <ul className="ml-4 pt-2 text-sm md:text-default list-disc text-gray-500">
                <li>Lifetime access with free updates.</li>
                <li>Step-by-step, hands-on project guidance.</li>
                <li>Downloadable resources and source code.</li>
                <li>Quizzes to test your knowledge.</li>
                <li>Certificate of completition.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
export default CourseDetails;

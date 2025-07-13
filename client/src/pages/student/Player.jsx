import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import Loading from "../../components/student/Loading";
import { assets } from "../../assets/assets";
import humanizeDuration from "humanize-duration";

function Player() {
  const { courseId } = useParams();
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(false);
  const { enrolledCourses, calculateChapterTime } = useAppContext();
  const [openSection, setOpenSection] = useState({});
  const [playerData, setPlayerData] = useState(null);
  const getCourseData = () => {
    setLoading(true);
    enrolledCourses.map((course) => {
      if (course._id === courseId) {
        setCourseData(course);
      }
    });
    setLoading(false);
  };
  const handleToggle = (i) => {
    setOpenSection((prev) => ({ ...prev, [i]: !prev[i] }));
  };
  useEffect(() => {
    getCourseData();
  }, [enrolledCourses, courseId]);
  if (loading) {
    return <Loading />;
  }
  if (!courseData) return <div>Course Not Found</div>;
  return (
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
                          src={false ? assets.blue_tick_icon : assets.play_icon}
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
                                    videoId: lecture.lectureUrl
                                      .split("/")
                                      .pop(),
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
      <div></div>
    </div>
  );
}

export default Player;

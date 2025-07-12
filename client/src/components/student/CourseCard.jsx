import React from "react";
import { assets } from "../../assets/assets";
import { useAppStore } from "../../store";
import { Link } from "react-router-dom";

function CourseCard({ course }) {
    const { currency } = useAppStore();
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
    return (
        <Link
            to={`/course/${course._id}`}
            onClick={() => scrollTo(0, 0)}
            className="border border-gray-500/30 pb-6 overflow-hidden rounded-lg"
        >
            <img
                className="w-full"
                src={course.courseThumbnail}
                alt="thumbnail"
            />
            <div className="p-3 text-left">
                <h3 className="text-base font-semibold">
                    {course.courseTitle}
                </h3>
                <p className="text-gray-500">{course.educator.name}</p>
                <div className="flex items-center space-x-2">
                    <p>{calculateRating(course)}</p>
                    <div className="flex">
                        {[...Array(5)].map((_, i) => (
                            <img
                                className="w-3.5 h-3.5"
                                key={i}
                                src={
                                    i < Math.floor(calculateRating(course))
                                        ? assets.star
                                        : assets.star_blank
                                }
                                alt="star"
                            />
                        ))}
                    </div>
                    <p className="text-gray-500">
                        {course.courseRatings?.length}
                    </p>
                </div>
                <p className="text-base font-semibold text-gray-800">
                    {currency}
                    {(
                        course.coursePrice -
                        (course.discount * course.coursePrice) / 100
                    ).toFixed(2)}
                </p>
            </div>
        </Link>
    );
}

export default CourseCard;

import React from "react";
import { Route, Routes, useMatch } from "react-router-dom";
import {CourseDetails, CoursesList, Home, MyEnrollments, Player} from "./pages/student"
import {AddCouse, Dashboard, Educator, MyCourses, StudentsEnrolled} from "./pages/educator"
import {Loading, Navbar} from "./components/student"

function App() {

    const isEducatorRoute=useMatch("/educator/")


    return (
        <div className="text-default min-h-scren bg-white">
            {!isEducatorRoute && <Navbar />}
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/course-list" element={<CoursesList />} />
                <Route path="/course-list/:input" element={<CoursesList />} />
                <Route path="/course/:id" element={<CourseDetails />} />
                <Route path="/my-enrollments" element={<MyEnrollments />} />
                <Route path="/player/:courseId" element={<Player />} />
                <Route path="/loading/:path" element={<Loading />} />
                <Route path="/educator" element={<Educator />}>
                    <Route path="" element={<Dashboard />} />
                    <Route path="add-course" element={<AddCouse />} />
                    <Route path="my-courses" element={<MyCourses />} />
                    <Route
                        path="student-enrolled"
                        element={<StudentsEnrolled />}
                    />
                </Route>
            </Routes>
        </div>
    );
}

export default App;

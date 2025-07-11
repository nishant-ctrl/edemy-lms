import React from "react";
import { Route, Routes } from "react-router-dom";
import {CourseDetails, CoursesList, Home, MyEnrollments, Player} from "./pages/student"
import {Educator} from "./pages/educator"
import {Loading} from "./components/student"

function App() {
    return <div>
        <Routes>
            <Route path="/" element={<Home />}/>
            <Route path="/course-list" element={<CoursesList />}/>
            <Route path="/course-list/:input" element={<CoursesList />}/>
            <Route path="/course/:id" element={<CourseDetails />}/>
            <Route path="/my-enrollments" element={<MyEnrollments />}/>
            <Route path="/player/:courseId" element={<Player />}/>
            <Route path="/loading/:path" element={<Loading />}/>
            <Route path="/educator" element={<Educator />}>

            </Route>
        </Routes>
    </div>;
}

export default App;

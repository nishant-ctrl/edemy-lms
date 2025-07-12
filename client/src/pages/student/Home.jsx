import React from 'react'
import { CallToAction, Companies, CoursesSection, Footer, Hero, TestimonialsSection } from '../../components/student'

function Home() {
  return (
    <div className='flex flex-col items-center space-y-7 text-center'>
      <Hero />
      <Companies />
      <CoursesSection />
      <TestimonialsSection />
      <CallToAction />
      <Footer />
    </div>
  )
}

export default Home
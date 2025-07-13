import React, { useEffect, useState } from 'react'
import Navbar from '../../components/educator/Navbar'
import {useAppContext} from "../../context/AppContext"
import { dummyDashboardData } from '../../assets/assets'
import Loading from "../../components/student/Loading"
function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null)
  const {currency}=useAppContext()
  const fetchDashboardData=async () => {
    setDashboardData(dummyDashboardData)
  }
  useEffect(()=>{
    fetchDashboardData()
  },[])
  if(!dashboardData) return <Loading />
  return (
      <div className=''>

      </div>
  );
}

export default Dashboard
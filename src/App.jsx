import React, { useEffect, useState } from 'react'
import FirstPage from './FirstPage'
import AppointmentDetailPage from './AppointmentDetailPage'

export default function App(){
  const [route, setRoute] = useState(window.location.hash || '#/')

  useEffect(()=>{
    const onHash = ()=> setRoute(window.location.hash || '#/')
    window.addEventListener('hashchange', onHash)
    return ()=> window.removeEventListener('hashchange', onHash)
  },[])

  const navigate = (to)=> { window.location.hash = to }

  if(route.startsWith('#/detail')){
    return <AppointmentDetailPage navigate={navigate} />
  }
  return <FirstPage navigate={navigate} />
}

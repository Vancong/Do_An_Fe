import React from 'react'
import HeaderComponent from '../HeaderComponent/HeaderComponent'
import Footer from '../Footer/Footer'
import ChatWidget from '../ChatWidget/ChatWidget'

const DefaultCompoent = ({children}) => {
  return (
    <div>
        <HeaderComponent />
        {children}
        <ChatWidget />
        <Footer/>
       
    
    </div>
  )
}

export default DefaultCompoent
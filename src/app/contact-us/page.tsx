import React from 'react'
import HeroSection from '@/components/Contactus/contacthero'
import Contactus from '@/components/Contactus/contactus'
import { Metadata } from 'next';


export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Contact Us | Infinitech Advertising Corporation | Web Develompent',
    description: 'Discover expert web development and system development services tailored to elevate your digital presence. Explore our solutions designed to meet your needs.',
  };
}

const page = () => {
  return (
    <div>
      <HeroSection/>
      <div className="my-8">
        <Contactus />
      </div>


    </div>

  )
}

export default page

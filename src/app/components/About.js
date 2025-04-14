import React from 'react';
import Image from 'next/image';
import './../styles/Dropdown.css';
import roomate1 from '../../../public/Roomate1.jpg';
import roomate2 from '../../../public/Roomate2.jpg';
import roomate3 from '../../../public/Roomate3.jpg';
import '../styles/styles.css';

export const Header = ({ title }) => (
  <div className="section">
    <h1 style={{ marginTop: '40px' }}>{title}</h1>
  </div>
);

export const AboutSection = () => (
  <div className="section">
    <div className="about-content">
      <div className='image-container'>
        <Image src={roomate1} 
          placeholder='blur'
          quality={100} 
          width={700}
          style={{ borderRadius: '15px' }}
          height={350}
          alt="roomate1" />
      </div>
      <div className='text-container'>
        <p>
        Roommixer connects college students with compatible roommates based on shared interests, ensuring a harmonious living experience without random assignments or compatibility issues.
        </p>
      </div>
    </div>
    <div className="about-content">
      <div className='text-container'>
        <p>
        Roommixer aims to build an inclusive community where every student feels supported and understood. Their mission is to create diverse and inclusive living environments where friendships thrive, fostering a brighter and more connected college experience for all.
        </p>
      </div>
      <div className='image-container'>
        <Image 
          src={roomate2} 
          style={{ borderRadius: '15px' }}
          width={700}
          height={350}
          placeholder='blur'
          quality={100} 
          alt="roomate2" />
      </div>
    </div>
    <div className="about-content">
      <div className='image-container'>
        <Image 
          src={roomate3} 
          style={{ borderRadius: '15px' }}
          width={700}
          height={350}
          placeholder='blur'
          quality={100} 
          alt="roomate3" />
      </div>
      <div className='text-container'>
        <p>
        Roommixer aims to expand beyond roommate matching, becoming a hub for student connection and growth. They plan to offer academic, career, and personal development resources, striving to be the go-to platform for all college needs.
        </p>
      </div>
    </div>
    <h3>This is our Team</h3>
  </div>
);

export const CreatorCard = ({ name, title, image }) => (
  <div className="creator-card">
    <Image src={image} 
      alt="catImage1"
      placeholder='blur'
      quality={100} />
    <h3>{name}</h3>
    <p>{title}</p>
  </div>
);

export const GettingStartedSection = () => (
  <div className="section">
    {/* Getting started section content */}
  </div>
);

// pages/about.js
"use client";
import React from 'react';
import { Header, AboutSection, CreatorCard, GettingStartedSection } from '../components/About';
import '../styles/styles.css';
import Link from 'next/link';
import Aaron from '../../../public/Aaron.jpg';
import Elnatan from '../../../public/Elnatan.jpg';
import Ilyas from '../../../public/Ilyas.jpg';
import Aymane from '../../../public/Aymane.jpg';
import Dropdown from '../components/Dropdown';
import ContactUs from '../components/ContactUs';

const AboutPage = () => {
  const options = [
    {
      value: 'Where to Begin',
      label: 'Where to Begin',
      description: "Share your interests and preferences by filling out the <a href='/profile'>questionnaire</a>. This helps us personalize your experience and match you with compatible users.",
    },
    {
      value: 'Are we a match',
      label: 'Are we a match',
      description: "If you are unable to see your match percentage, this can be caused by an incomplete <a href='/profile'>profile page</a>.",
    },
    {
      value: 'Find your matches',
      label: 'Find your matches',
      description: "Find and send match requests using the pick a roommate page. You can search for specific people and reply to current match requests as well!",
    },
    {
      value: 'Edit Your Profile',
      label: 'Edit Your Profile',
      description: "Let your personality shine through! Customize your profile picture, bio, and any other details you'd like to share on your <a href='/dashboard'>profile</a>.",
    },
    {
      value: 'View Matches',
      label: 'View Matches',
      description: "Explore your matches based on your preferences and compatibility scores. You can see profiles, interests, and any additional information people choose to share on the <a href='/dashboard'>dashboard</a> page.",
    },
    {
      value: 'Send Friend Requests',
      label: 'Send Friend Requests',
      description: "Once you find someone interesting, send them a friend request to initiate communication. You can chat, share messages, and build friendships.",
    },
    {
      value: 'Find Rentals',
      label: 'Find Rentals',
      description: "If you are looking for homes, local offerings near campus can be found under <a href='/rentals'>the rentals page</a>.",
    },
  ];

  return (
    <div className="about-page">
      <Header title="About Us" />
      <AboutSection />
      <div className="creators">
        <CreatorCard name="Aaron Afework" title="Front-End Designer" image={Aaron} />
        <CreatorCard name="Aymane Sghier" title="UX/UI Designer" image={Aymane} />
        <CreatorCard name="Elnatan Tesfa" title="Lead Developer" image={Elnatan} />
        <CreatorCard name="Ilyas Jamil" title="Back-End Developer" image={Ilyas} />
      </div>
      <GettingStartedSection />
      <ContactUs />
      <div className="dropdown-container">
        <Dropdown options={options} />
      </div>
      <Link className='profile-Button' href="/profile">
        <button type="button" className="button">Profile</button>
      </Link>
    </div>
  );
};

export default AboutPage;

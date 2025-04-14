import React from 'react';
import "../globals.css";

const Contacts = () => {
  return (
    <div className="contacts-section" id="contact">
      <h1 style={{fontSize: '50px', color: 'White'}}>Contact Us</h1>
      <div className="contact-form">
        <h3>Send a Message</h3>
        <form action="https://formsubmit.co/tesfaelnatan@gmail.com" method="POST">
          <input type="text" name="name" placeholder="Your Name" required />
          <input type="email" name="email" placeholder="Your Email" required />
          <textarea name="message" placeholder="Your Message" required></textarea>
          <input type="hidden" name="_captcha" value="false" />
          <button type="submit">Send</button>
        </form>
      </div>
    </div>
  );
};

export default Contacts;

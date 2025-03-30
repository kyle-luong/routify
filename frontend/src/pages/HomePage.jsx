import React from 'react';
import '../styles/HomePage.css';
import Navbar from '../components/Navbar.jsx';
import UploadForm from '../components/UploadForm.jsx';
import About from '../components/About.jsx';
import Team from '../components/Team.jsx';
import Contact from '../components/Contact.jsx';

const HomePage = () => {
    return (
        <div className="home-page">
            <Navbar />
            <div className="home-page-container">
                <UploadForm />
            </div>
            <About />
            <Team />
            <Contact />
        </div>
    );
};

export default HomePage;
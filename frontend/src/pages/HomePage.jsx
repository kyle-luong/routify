import React from 'react';
import '../styles/HomePage.css';
import Navbar from '../components/Navbar.jsx';
import UploadForm from '../components/UploadForm.jsx';
import About from '../components/About.jsx';

const HomePage = () => {
    return (
        <div className="home-page">
            <Navbar />
            <div className="home-page-container">
                <UploadForm />
            </div>
            <About />
            <div id="team">
                <p>team section</p>
            </div>
            <div id="contact">
                <p>contact section</p>
            </div>
        </div>
    );
};

export default HomePage;
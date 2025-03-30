import React from 'react';
import '../styles/HomePage.css';
import Navbar from '../components/Navbar.jsx';
import UploadForm from '../components/UploadForm.jsx';

const HomePage = () => {
    return (
        <div className="home-page">
            <Navbar />
            <div className="home-page-container">
                <UploadForm />
            </div>
            <div id="about">
                <p>about section</p>
            </div>
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
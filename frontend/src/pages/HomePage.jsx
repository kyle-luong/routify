import React from 'react';
import '../styles/HomePage.css';
import Navbar from '../components/Navbar/Navbar.jsx';
import UploadForm from '../components/Upload/UploadForm/UploadForm.jsx';
import About from '../components/About/About.jsx';
import Team from '../components/Team/Team.jsx';
import Contact from '../components/Contact/Contact.jsx';

const HomePage = () => {
    return (
        <div className="home-page">
            <Navbar />
            <div className="home-page-container">
                <div className="animated-title">
                    <div className="text-top">
                        <div>
                            <span>rethink</span>
                            <span>your course scheduling</span>
                        </div>
                    </div>
                    <div className="text-bottom">
                        <div>experience.</div>
                    </div>
                </div>
                <div className="upload-form">
                    <UploadForm />
                </div>
            </div>
            <About />
            <Team />
            <Contact />
        </div>
    );
};

export default HomePage;
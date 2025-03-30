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
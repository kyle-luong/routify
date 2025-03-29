import React from 'react';
import '../styles/HomePage.css';
import Navbar from '../components/Navbar.jsx';
import UploadForm from '../components/UploadForm.jsx';

const HomePage = () => {
    return (
        <div className="home-page">
            <Navbar />
            <UploadForm />
        </div>
    );
};

export default HomePage;
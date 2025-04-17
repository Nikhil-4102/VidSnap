import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import VideoSummarizer from './components/VideoSummarizer';
import Register from './components/Register';
import Login from './components/Login';

function App() {
    return (
        <Router>
            <nav className="bg-gray-800 p-4 text-white flex justify-between items-center">
                <div className="text-lg font-bold"><a href='/'>AI Thumbnail Generator</a></div>
                <div className="space-x-4 flex items-center">
                    <a href="/register" className="hover:text-gray-300">Register</a>
                    <a href="/signin" className="hover:text-gray-300">Login</a>
                </div>
            </nav>
            <div className="bg-gradient-to-br from-black via-gray-900 to-gray-800 min-h-screen flex flex-col items-center justify-center">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/signin" element={<Login />} />
                    <Route path="/summarizer" element={<VideoSummarizer />} />
                </Routes>
            </div>
        </Router>
    );
}

function Home() {
    return (
        <div className="text-center text-white px-6">
            <h1 className="text-4xl font-bold mb-4">Your YouTube Thumbnail Created in Seconds</h1>
            <p className="text-lg mb-8">
                One of the first dedicated AI Image Models to create high-performing YouTube thumbnails in seconds
            </p>
            <a
                href="/signin"
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg text-lg font-semibold"
            >
                Create Now
            </a>

        
        </div>
    );
}

export default App;

import React, { useState, useEffect, useRef } from 'react';
import styles from './ProfilePage.module.css';

const ProfilePage = () => {
    // 1. State
    const [resumeText, setResumeText] = useState('');
    const [resumeFilename, setResumeFilename] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const fileInputRef = useRef(null);

    // 2. Load profile (placeholder)
    const loadProfile = async () => {
        setLoading(true);
        console.log("Loading profile...");
        setLoading(false);
    };

    useEffect(() => {
        loadProfile();
    }, []);

    // 3. PDF upload + parsing (placeholder)
    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setResumeFilename(file.name);
            console.log("Setting filename:", file.name);
        }
    };

    // 4. Save profile (placeholder)
    const saveProfile = async () => {
        console.log("Saving profile...");
        setMessage("Changes saved!");
    };

    return (
        <div className={styles.profileContainer}>
            <header className={styles.header}>
                <h1 className={styles.title}>Profile & Documents</h1>
            </header>

            {message && (
                <div className={styles.messageBanner}>
                    {message}
                </div>
            )}

            <div className={styles.grid}>
                {/* Resume Section */}
                <section className={styles.card}>
                    <h2>📄 Resume</h2>
                    <div>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileUpload} 
                            accept=".pdf"
                            style={{ display: 'none' }} 
                        />
                        <button 
                            className={styles.button} 
                            onClick={() => fileInputRef.current.click()}
                        >
                            Upload PDF
                        </button>
                        {resumeFilename && (
                            <span className={styles.filenameText}>
                                📄 {resumeFilename}
                            </span>
                        )}
                    </div>

                    <textarea 
                        className={styles.textarea}
                        value={resumeText}
                        onChange={(e) => setResumeText(e.target.value)}
                        placeholder="Paste your resume content or upload a PDF above..."
                    />
                </section>

                {/* Job Description Section */}
                <section className={styles.card}>
                    <h2>🎯 Job Description</h2>
                    <textarea 
                        className={styles.textarea}
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        placeholder="Paste the target job description here..."
                    />
                </section>
            </div>

            <button 
                className={`${styles.button} ${styles.saveButton}`} 
                onClick={saveProfile}
            >
                Save All Changes
            </button>
        </div>
    );
};

export default ProfilePage;

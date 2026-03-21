import React, { useState, useEffect, useRef } from 'react';
import styles from './ProfilePage.module.css';
import { FileText, Target, Upload, Save, CheckCircle } from 'lucide-react';

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
        // Simulate load...
        setLoading(false);
    };

    useEffect(() => {
        loadProfile();
    }, []);

    // 3. PDF upload + parsing (placeholder)
    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.type !== 'application/pdf') {
                setMessage("Please select a PDF file.");
                return;
            }
            setResumeFilename(file.name);
            setMessage(`File "${file.name}" selected.`);
        }
    };

    // 4. Save profile (placeholder)
    const saveProfile = async () => {
        setMessage("All changes saved successfully.");
        // Fade message out...
        setTimeout(() => setMessage(''), 3000);
    };

    if (loading) return <div className={styles.profileContainer}>LOADING...</div>;

    return (
        <div className={styles.profileContainer}>
            <header className={styles.header}>
                <h1 className={styles.title}>Profile & Document Management</h1>
                {message && (
                    <div className={styles.banner}>
                        {message}
                    </div>
                )}
            </header>

            <div className={styles.grid}>
                {/* Resume Section */}
                <section className={styles.card}>
                    <div className={styles.cardHeader}>
                        <FileText size={20} />
                        <h2>Resume</h2>
                    </div>
                    
                    <div className={styles.uploadControls}>
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
                            <Upload size={16} />
                            Upload PDF
                        </button>
                        {resumeFilename && (
                            <span className={styles.filename}>
                                {resumeFilename}
                            </span>
                        )}
                    </div>

                    <div className={styles.textareaContainer}>
                        <textarea 
                            className={styles.textarea}
                            value={resumeText}
                            onChange={(e) => setResumeText(e.target.value)}
                            placeholder="Paste your resume content or upload a PDF to extract text..."
                        />
                    </div>
                </section>

                {/* Target Job Description Section */}
                <section className={styles.card}>
                    <div className={styles.cardHeader}>
                        <Target size={20} />
                        <h2>Target Job Description</h2>
                    </div>
                    
                    <div className={styles.textareaContainer}>
                        <textarea 
                            className={styles.textarea}
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            placeholder="Paste the target job description details here..."
                        />
                    </div>
                </section>
            </div>

            <footer className={styles.footer}>
                <button 
                    className={`${styles.button} ${styles.saveButton}`} 
                    onClick={saveProfile}
                >
                    <Save size={18} />
                    Save All Changes
                </button>
            </footer>
        </div>
    );
};

export default ProfilePage;

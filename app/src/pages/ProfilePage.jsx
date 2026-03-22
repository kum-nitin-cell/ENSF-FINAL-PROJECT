import React, { useState, useRef, useEffect } from 'react';
import styles from './ProfilePage.module.css';
import { FileText, Target, Upload, Save, CheckCircle } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import { supabase } from '../lib/supabase';

// Configure PDF.js worker
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const ProfilePage = () => {
    // 1. State
    const [resumeText, setResumeText] = useState('');
    const [resumeFilename, setResumeFilename] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const [isParsing, setIsParsing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState({ text: '', type: '' });

    const fileInputRef = useRef(null);

    // 2. Load profile (on mount)
    useEffect(() => {
        const loadProfile = async () => {
            setIsLoading(true);
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) throw new Error("No authenticated user.");

                const { data, error } = await supabase
                    .from('profiles')
                    .select('resume_text, resume_filename, job_description')
                    .eq('id', user.id)
                    .single();

                if (error) throw error;

                if (data) {
                    setResumeText(data.resume_text || '');
                    setResumeFilename(data.resume_filename || '');
                    setJobDescription(data.job_description || '');
                }
            } catch (error) {
                console.error("Error loading profile:", error);
                setMessage({
                    text: `Failed to load profile: ${error.message || 'Check your connection'}`,
                    type: 'error'
                });
            } finally {
                setIsLoading(false);
            }
        };

        loadProfile();
    }, []);

    // 3. PDF upload + parsing
    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            setMessage({ text: 'Please select a valid PDF file.', type: 'error' });
            return;
        }

        setResumeFilename(file.name);
        setIsParsing(true);

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const arrayBuffer = event.target.result;
                const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
                const pdf = await loadingTask.promise;

                let fullText = '';
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    const pageText = textContent.items.map(item => item.str).join(' ');
                    fullText += pageText + '\n\n';
                }

                setResumeText(fullText.trim());
            } catch (error) {
                console.error("PDF Parsing Error:", error);
                setMessage({ text: 'Failed to parse PDF. Please paste your resume text manually.', type: 'error' });
            } finally {
                setIsParsing(false);
            }
        };

        reader.onerror = () => {
            setMessage({ text: 'Failed to read file. Please try again.', type: 'error' });
            setIsParsing(false);
        };

        reader.readAsArrayBuffer(file);
        fileInputRef.current.value = '';
    };

    // 4. Save profile (upsert)
    const saveProfile = async () => {
        // 1. Loading State
        setIsSaving(true);
        setMessage({ text: '', type: '' });

        try {
            // 2. Data Preparation
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Authentication required.");

            const updates = {
                id: user.id,
                email: user.email,
                full_name: user.user_metadata?.full_name || '', // Sourced from metadata
                resume_text: resumeText,
                resume_filename: resumeFilename,
                job_description: jobDescription,
                updated_at: new Date().toISOString()
            };

            // 3. Database Update (Supabase Upsert)
            const { error } = await supabase
                .from('profiles')
                .upsert(updates);

            if (error) throw error;

            // 4. Feedback (Success)
            setMessage({ text: "Profile saved successfully!", type: 'success' });

            // Auto-dismiss after 3 seconds
            setTimeout(() => setMessage({ text: '', type: '' }), 3000);

        } catch (error) {
            // 4. Feedback (Error)
            console.error("Error saving profile:", error);
            setMessage({
                text: `Failed to save profile: ${error.message || 'Check your connection'}`,
                type: 'error'
            });
        } finally {
            // 5. Reset
            setIsSaving(false);
        }
    };

    if (isLoading) return (
        <div className={styles.profileContainer}>
            <div className={styles.loadingPulse}>Loading your profile...</div>
        </div>
    );

    return (
        <div className={styles.profileContainer}>
            <header className={styles.header}>
                <h1 className={styles.title}>Profile & Document Management</h1>
            </header>

            {/* Status Feedback Banner at the top */}
            {message.text && (
                <div className={`${styles.banner} ${styles[message.type]}`}>
                    {message.type === 'success' ? <CheckCircle size={18} /> : null}
                    {message.text}
                </div>
            )}

            <div className={styles.grid}>
                {/* Resume Section */}
                <section className={styles.card}>
                    <div className={styles.cardHeader}>
                        <FileText size={20} />
                        <h2>Resume</h2>
                    </div>

                    <div className={styles.uploadControls}>
                        {resumeFilename && (
                            <span className={styles.filename}>
                                {resumeFilename}
                            </span>
                        )}
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
                            disabled={isParsing || isSaving}
                        >
                            <Upload size={16} />
                            {isParsing ? 'Parsing...' : 'Upload PDF'}
                        </button>
                    </div>

                    <div className={styles.textareaContainer}>
                        <textarea
                            className={styles.textarea}
                            value={resumeText}
                            onChange={(e) => {
                                setResumeText(e.target.value);
                                if (resumeFilename) setResumeFilename('');
                            }}
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
                    disabled={isSaving || isParsing}
                >
                    <Save size={18} />
                    {isSaving ? 'Saving...' : 'Save All Changes'}
                </button>
            </footer>
        </div>
    );
};

export default ProfilePage;

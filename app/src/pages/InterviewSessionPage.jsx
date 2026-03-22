import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function InterviewSessionPage() {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [sessionData, setSessionData] = useState(null);
    const [profile, setProfile] = useState(null);
    const [questions, setQuestions] = useState([]);

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswer, setUserAnswer] = useState('');
    const [loadingContext, setLoadingContext] = useState(true);

    const [isGeneratingNext, setIsGeneratingNext] = useState(false);
    const [isEvaluating, setIsEvaluating] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        async function loadSession() {
            try {
                const { data: session, error: sessErr } = await supabase
                    .from('interview_sessions')
                    .select('*')
                    .eq('id', id)
                    .single();
                if (sessErr) throw sessErr;

                const { data: prof, error: profErr } = await supabase
                    .from('profiles')
                    .select('resume_text, job_description')
                    .eq('id', session.user_id)
                    .single();
                if (profErr) throw profErr;

                const { data: existingQ, error: qErr } = await supabase
                    .from('session_questions')
                    .select('*')
                    .eq('session_id', id)
                    .order('question_number', { ascending: true });
                if (qErr) throw qErr;

                setSessionData(session);
                setProfile(prof);
                setQuestions(existingQ || []);

                const unansweredIdx = existingQ.findIndex(q => !q.user_answer);
                if (unansweredIdx !== -1) {
                    setCurrentQuestionIndex(unansweredIdx);
                } else if (existingQ.length > 0) {
                    if (existingQ.length < session.num_questions) {
                        setCurrentQuestionIndex(existingQ.length);
                    } else {
                        setCurrentQuestionIndex(existingQ.length - 1);
                        if (session.status !== 'completed') {
                            completeInterview(session.id, existingQ);
                        }
                    }
                }

            } catch (err) {
                setError("Failed to load session details.");
                console.error(err);
            } finally {
                setLoadingContext(false);
            }
        }
        if (user) loadSession();
    }, [id, user]);

    const completeInterview = async (sessionId, qs) => {
        try {
            let totalScore = 0;
            let count = 0;
            qs.forEach(q => { if (q.score !== null) { totalScore += q.score; count++; } });
            const overall = count > 0 ? Math.round((totalScore / count) * 10) : 0;
            await supabase.from('interview_sessions').update({ status: 'completed', overall_score: overall, completed_at: new Date().toISOString() }).eq('id', sessionId);
            navigate(`/summary/${sessionId}`);
        } catch (err) { console.error("Completion error:", err); }
    };

    const generateFirstQuestion = async () => { console.log("AI trigger placeholder"); };
    const generateNextQuestion = async (prevQs) => { console.log("AI trigger placeholder"); };
    const handleAnswerSubmit = async () => { console.log("AI evaluation placeholder"); };

    if (loadingContext || !sessionData) return <div className="p-8 center text-muted">Loading session...</div>;
    const currentQ = questions[currentQuestionIndex];
    const isAnswered = currentQ && currentQ.user_answer;

    return (
        <div className="session-page" style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
            <div className="dashboard-header mb-4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ margin: 0 }}>Interview: {sessionData.interview_type}</h2>
                    <p className="text-muted" style={{ margin: 0, fontSize: '0.875rem' }}>Question {currentQuestionIndex + 1} of {sessionData.num_questions}</p>
                </div>
                <button className="btn secondary" onClick={() => navigate('/dashboard')}>Exit</button>
            </div>

            {error && <div className="alert error mb-4">{error}</div>}

            <div className="dashboard-grid" style={{ flex: 1, minHeight: 0 }}>
                <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    {isGeneratingNext ? (
                        <div className="flex-1 center"><div className="mb-4">Loading AI Question...</div></div>
                    ) : currentQ ? (
                        <>
                            <div className="mb-4" style={{ fontSize: '1.2rem', fontWeight: '500' }}><span className="text-primary mr-2">Q:</span>{currentQ.question_text}</div>
                            <div className="form-group flex-1" style={{ display: 'flex', flexDirection: 'column' }}>
                                <textarea value={isAnswered ? currentQ.user_answer : userAnswer} onChange={e => setUserAnswer(e.target.value)} disabled={isAnswered || isEvaluating} placeholder="Answer here..." style={{ flex: 1, resize: 'none' }} />
                            </div>
                            <div className="mt-4" style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                {!isAnswered ? (
                                    <button className="btn primary" onClick={handleAnswerSubmit} disabled={isEvaluating || !userAnswer.trim()}>{isEvaluating ? 'Evaluating...' : 'Submit Answer'}</button>
                                ) : (
                                    <button className="btn primary" onClick={() => generateNextQuestion(questions)}>{currentQuestionIndex + 1 >= sessionData.num_questions ? 'Finish' : 'Next Question'}</button>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 center text-center mt-12">
                            <p className="text-muted mb-4">No question generated.</p>
                            <button className="btn primary" onClick={generateFirstQuestion} disabled={isGeneratingNext}>Retry</button>
                        </div>
                    )}
                </div>

                <div className="card" style={{ overflowY: 'auto' }}>
                    <h3 className="card-title">Feedback</h3>
                    {!isAnswered ? <p className="text-muted text-center mt-8">Submit your answer to see feedback.</p> : (
                        <div className="feedback-content">
                            <div className="mb-4">Score: <strong>{currentQ.score}/10</strong></div>
                            {currentQ.feedback_strengths && <div className="mb-2"><strong>Strengths:</strong><ul style={{ fontSize: '0.9rem' }}>{currentQ.feedback_strengths.map((s, i) => <li key={i}>{s}</li>)}</ul></div>}
                            {currentQ.feedback_improvements && <div className="mb-2"><strong>Improvements:</strong><ul style={{ fontSize: '0.9rem' }}>{currentQ.feedback_improvements.map((s, i) => <li key={i}>{s}</li>)}</ul></div>}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
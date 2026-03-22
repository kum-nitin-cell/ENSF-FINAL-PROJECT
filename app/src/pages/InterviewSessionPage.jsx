import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function InterviewSessionPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [sessionData, setSessionData] = useState({ interview_type: 'behavioral', num_questions: 5 });
    const [questions, setQuestions] = useState([]);

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswer, setUserAnswer] = useState('');

    const [isGeneratingNext, setIsGeneratingNext] = useState(false);
    const [isEvaluating, setIsEvaluating] = useState(false);
    const [error, setError] = useState('');

    const handleAnswerSubmit = async () => {
        console.log("Submit answer clicked");
    };

    const generateFirstQuestion = async () => {
        console.log("Generate first question clicked");
    };

    const generateNextQuestion = async () => {
        console.log("Next question clicked");
    };

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
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useAppContext } from '../context/AppContext';
import '../styles/TestPage.css';

const TestPage = () => {
  const { moduleId } = useParams();
  const [testPayload, setTestPayload] = useState(null);
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { fetchJson, refreshPlatformData, currentUser } = useAppContext();

  useEffect(() => {
    fetchJson(`/tests/${moduleId}`)
      .then((data) => setTestPayload(data))
      .catch((error) => {
        Swal.fire('Access Required', error.message, 'warning').then(() => navigate('/participation'));
      });
  }, [moduleId, fetchJson, navigate]);

  const handleAnswer = (testId, answer) => {
    setAnswers((prev) => ({ ...prev, [testId]: answer }));
  };

  const handleSubmit = async () => {
    const persistedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    const user = currentUser || (persistedUser ? JSON.parse(persistedUser) : null);
    const tests = testPayload?.questions || [];
    if (!user) {
      navigate('/login');
      return;
    }
    if (tests.length !== Object.keys(answers).length) {
      Swal.fire('Incomplete', 'Answer all questions before submitting.', 'warning');
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await fetchJson('/submit-test', {
        method: 'POST',
        body: JSON.stringify({
          attemptId: testPayload.attemptId,
          userId: user.id,
          moduleId: parseInt(moduleId, 10),
          answers: Object.entries(answers).map(([questionId, selectedAnswer]) => ({
            questionId: Number(questionId),
            selectedAnswer
          }))
        })
      });

      await refreshPlatformData();

      Swal.fire(
        result.passed ? 'Passed' : 'Submitted Test Successfully',
        result.passed
          ? `Score: ${result.score}%. Certificate issued successfully.`
          : `${result.message} Score: ${result.score}%.`,
        result.passed ? 'success' : 'info'
      ).then(() => navigate('/student'));
    } catch (error) {
      Swal.fire('Submit Failed', error.message || 'Unable to submit the test.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const tests = testPayload?.questions || [];

  return (
    <div className="test-page">
      <div className="test-page__inner">
        <button onClick={() => navigate(-1)} className="test-page__back">
          Back
        </button>

        <div className="test-page__hero">
          <h1>Domain Test</h1>
          {testPayload?.domainName && (
            <p>
              {testPayload.categoryName} - {testPayload.domainName}. Answer all 20 questions to complete your assessment.
            </p>
          )}
        </div>

        {tests.length === 0 && (
          <div className="test-page__empty">
            No questions found for this module.
          </div>
        )}

        {tests.map((t, i) => (
          <div key={t.id} className="test-page__card">
            <p className="test-page__question"><strong>Q{i + 1}: {t.question}</strong></p>
            <div className="test-page__options">
              {['A', 'B', 'C', 'D'].map((opt) => (
                <label
                  key={opt}
                  className={`test-page__option ${answers[t.id] === `option${opt}` ? 'test-page__option--selected' : ''}`}
                >
                  <input
                    type="radio"
                    name={`q${t.id}`}
                    value={`option${opt}`}
                    checked={answers[t.id] === `option${opt}`}
                    onChange={() => handleAnswer(t.id, `option${opt}`)}
                  />
                  <span>{t[`option${opt}`]}</span>
                </label>
              ))}
            </div>
          </div>
        ))}

        {tests.length > 0 && (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="test-page__submit"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Test'}
          </button>
        )}
      </div>
    </div>
  );
};

export default TestPage;

"use client";
import { useEffect, useState } from 'react';
import { db } from '../firebase'; 
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { useRouter } from 'next/navigation'; // Import useRouter for navigation
import { Button, TextField, Typography, CircularProgress, Box } from '@mui/material';

const Onboarding = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchQuestions = async () => {
      setIsLoading(true);
      const q = query(collection(db, 'onboardingQuestions'), orderBy('order'));
      const querySnapshot = await getDocs(q);
      const fetchedQuestions = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setQuestions(fetchedQuestions);
      setIsLoading(false);
    };

    fetchQuestions();
  }, []);

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(current => current + 1);
    } else {
      console.log('Submit responses:', responses);
      // After submission, redirect or notify user
      router.push('/profile'); // Redirect back to profile or a confirmation page
    }
  };

  const handleChange = (e) => {
    setResponses({...responses, [questions[currentQuestionIndex].id]: e.target.value});
  };

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>;

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <Box sx={{ maxWidth: 480, mx: 'auto', my: 4 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        {currentQuestion.questionText}
      </Typography>
      <TextField
        fullWidth
        variant="outlined"
        type="text"
        value={responses[currentQuestion.id] || ''}
        onChange={handleChange}
        margin="normal"
      />
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
        <Button variant="contained" color="primary" onClick={handleNext}>
          {currentQuestionIndex === questions.length - 1 ? 'Submit' : 'Next'}
        </Button>
      </Box>
    </Box>
  );
};

export default Onboarding;

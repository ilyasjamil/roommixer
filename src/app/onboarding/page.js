"use client";
import React, { useEffect, useState, useContext } from 'react';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy, writeBatch, doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { UserAuth } from '../context/AuthContext';
import { Button, Typography, CircularProgress, Box, FormControl, FormControlLabel, Checkbox, Container, Paper, Stepper, Step, StepLabel, useTheme, useMediaQuery, Select, MenuItem } from '@mui/material';

const Onboarding = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [hasSubmittedResponses, setHasSubmittedResponses] = useState(false);
  const router = useRouter();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const { user } = UserAuth();

  useEffect(() => {
    const fetchQuestionsAndResponses = async () => {
      setIsLoading(true);

      const q = query(collection(db, 'onboardingQuestions'), orderBy('order'));
      const querySnapshot = await getDocs(q);
      const fetchedQuestions = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      let existingResponses = {};

      const responsesRef = doc(db, 'userResponses', user.uid);
      const responsesDoc = await getDoc(responsesRef);
      if (responsesDoc.exists()) {
        existingResponses = responsesDoc.data().responses;
        setHasSubmittedResponses(true);
      }

      const initializedResponses = fetchedQuestions.reduce((acc, question) => {
        acc[question.id] = existingResponses[question.id] || { response: '', visibility: true };
        return acc;
      }, {});

      setQuestions(fetchedQuestions);
      setResponses(initializedResponses);
      setIsLoading(false);
    };

    if (user) {
      fetchQuestionsAndResponses();
    }
  }, [user]);

  const handleResponseChange = (event, questionId, property) => {
    const updatedResponses = {
      ...responses,
      [questionId]: {
        ...responses[questionId],
        [property]: property === 'visibility' ? event.target.checked : event.target.value
      }
    };
    setResponses(updatedResponses);
  };

  const handleNext = async () => {
    const currentResponse = responses[questions[currentQuestionIndex].id];
    if (!currentResponse || currentResponse.response === undefined) {
      alert("Please answer the question before proceeding.");
      return;
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(current => current + 1);
    } else {
      await handleSubmitResponses();
    }
  };

  const handleSubmitResponses = async () => {
    if (!user) {
      console.error('User must be logged in to submit responses.');
      return;
    }

    const responsesForFirestore = Object.keys(responses).reduce((acc, questionId) => {
      acc[questionId] = {
        ...responses[questionId],
        visibility: responses[questionId].visibility || false
      };
      return acc;
    }, {});

    const batch = writeBatch(db);
    const responsesRef = doc(db, 'userResponses', user.uid);
    batch.set(responsesRef, {
      userId: user.uid,
      responses: responsesForFirestore,
      submittedAt: new Date(),
    });

    try {
      await batch.commit();
      console.log('Responses submitted successfully');
      router.push('/dashboard');
    } catch (error) {
      console.error('Error submitting responses:', error);
    }
  };

  const headingText = hasSubmittedResponses ? "Edit Onboarding Responses" : "Start Onboarding";

  if (isLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}><CircularProgress /></Box>;
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: isSmallScreen ? 2 : 4 }}>
        <Stepper activeStep={currentQuestionIndex} alternativeLabel nonLinear sx={{ mb: 4 }}>
          {questions.map((_, index) => (
            <Step key={index}>
              {!isSmallScreen && <StepLabel>{`Question ${index + 1}`}</StepLabel>}
            </Step>
          ))}
        </Stepper>
        <Typography variant={isSmallScreen ? "h5" : "h4"} gutterBottom component="div" sx={{ fontWeight: 'bold', mb: 3 }}>
          {headingText}
        </Typography>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>{currentQuestion.questionText}</Typography>
          <FormControl fullWidth margin="normal">
            <Select
              value={responses[currentQuestion.id]?.response || ''}
              onChange={(e) => handleResponseChange(e, currentQuestion.id, 'response')}
            >
              {currentQuestion.options.map((option, index) => (
                <MenuItem key={index} value={option}>{option}</MenuItem>
              ))}
            </Select>
            <FormControlLabel
              control={<Checkbox checked={responses[currentQuestion.id]?.visibility || false} onChange={(e) => handleResponseChange(e, currentQuestion.id, 'visibility')} />}
              label="Make response visible to other users"
            />
          </FormControl>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            variant="outlined"
            disabled={currentQuestionIndex === 0}
            onClick={() => setCurrentQuestionIndex(current => Math.max(current - 1, 0))}
          >
            Back
          </Button>
          <Button variant="contained" onClick={handleNext}>
            {currentQuestionIndex === questions.length - 1 ? 'Submit' : 'Next'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Onboarding;

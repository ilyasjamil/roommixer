"use client";
import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy
} from 'firebase/firestore';
import {
  Button,
  TextField,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Container,
  Grid,
  Typography,
  Snackbar,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper
} from '@mui/material';

function AdminPage() {
  const [questions, setQuestions] = useState([]);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newOptions, setNewOptions] = useState('');
  const [newOrder, setNewOrder] = useState('');
  const [newType, setNewType] = useState('categorical');
  const [newWeight, setNewWeight] = useState(3);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editQuestion, setEditQuestion] = useState(null);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const fetchQuestions = async () => {
    const q = query(collection(db, 'onboardingQuestions'), orderBy('order'));
    const querySnapshot = await getDocs(q);
    const fetchedQuestions = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setQuestions(fetchedQuestions);
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleAddQuestion = async () => {
    const questionTextTrimmed = newQuestionText.trim();
    const newOptionsTrimmed = newOptions.trim();
    let order = parseInt(newOrder.trim(), 10);
    const optionsArray = newOptionsTrimmed.split(',').map(opt => opt.trim()).filter(opt => opt);

    if (!questionTextTrimmed || optionsArray.length === 0 || isNaN(order) || order <= 0) {
      alert('Please make sure all fields are filled correctly and the order is a positive number.');
      return;
    }

    const maxOrder = questions.reduce((max, q) => Math.max(max, q.order), 0);

    if (order > maxOrder) {
      order = maxOrder + 1;
    } else {
      const existingQuestionWithOrder = questions.find(q => q.order === order);
      if (existingQuestionWithOrder) {
        for (let question of questions.filter(q => q.order >= order)) {
          await updateDoc(doc(db, 'onboardingQuestions', question.id), {
            ...question,
            order: question.order + 1
          });
        }
      }
    }

    try {
      await addDoc(collection(db, 'onboardingQuestions'), {
        questionText: questionTextTrimmed,
        options: optionsArray,
        order,
        type: newType,
        weight: newWeight,
        visibility: true
      });
      setNewQuestionText('');
      setNewOptions('');
      setNewOrder('');
      setNewType('categorical');
      setNewWeight(3);
      setSnackbarOpen(true);
      setSnackbarMessage('Question added successfully');
      await fetchQuestions();
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  const handleDeleteQuestion = async (id) => {
    const questionToDelete = questions.find(q => q.id === id);
    const deleteOrder = questionToDelete.order;

    try {
      await deleteDoc(doc(db, 'onboardingQuestions', id));

      const questionsToUpdate = questions.filter(q => q.order > deleteOrder);
      for (let question of questionsToUpdate) {
        await updateDoc(doc(db, 'onboardingQuestions', question.id), {
          ...question,
          order: question.order - 1
        });
      }

      setSnackbarOpen(true);
      setSnackbarMessage('Question deleted successfully');
      await fetchQuestions();
    } catch (error) {
      console.error("Error deleting document: ", error);
    }
  };

  const handleOpenEditModal = (question) => {
    const editedQuestion = {
      ...question,
      options: Array.isArray(question.options) ? question.options : question.options.split(', ')
    };
    setEditQuestion(editedQuestion);
    setOpenEditModal(true);
  };

  const handleUpdateQuestion = async () => {
    if (editQuestion) {
      const { id, questionText, options, order, type, weight } = editQuestion;
      let finalOrder = parseInt(order, 10);
      const optionsArray = typeof options === 'string' ? options.split(',').map(opt => opt.trim()) : options;

      const maxOrder = questions.reduce((max, q) => Math.max(max, q.order), 0);

      if (finalOrder > maxOrder) {
        finalOrder = maxOrder + 1;
      } else {
        const orderConflict = questions.find(q => q.order === finalOrder && q.id !== id);
        if (orderConflict) {
          const isMovingForward = finalOrder > editQuestion.order;
          const startOrder = isMovingForward ? editQuestion.order : finalOrder;
          const endOrder = isMovingForward ? finalOrder : editQuestion.order;

          questions.filter(q => q.order >= startOrder && q.order <= endOrder && q.id !== id)
            .forEach(async (question) => {
              const newOrder = isMovingForward ? question.order - 1 : question.order + 1;
              await updateDoc(doc(db, 'onboardingQuestions', question.id), {
                ...question,
                order: newOrder
              });
            });
        }
      }

      try {
        await updateDoc(doc(db, 'onboardingQuestions', id), {
          questionText,
          options: optionsArray,
          order: finalOrder,
          type, 
          weight 
        });
        setSnackbarOpen(true);
        setSnackbarMessage('Question edited successfully');
        await fetchQuestions();
        handleCloseEditModal();
      } catch (error) {
        console.error("Error updating document: ", error);
      }
    }
  };

  const handleCloseEditModal = () => {
    setOpenEditModal(false);
    setEditQuestion(null);
  };

  return (
    <div>
      <Container>
        <Typography variant="h4" style={{fontWeight: 'bold', color: 'darkblue'}}gutterBottom component="div" sx={{ pt: 4, mb: 2 }}>
          Customize Questionnaire
        </Typography>
        <Box component="form" noValidate autoComplete="off" onSubmit={(e) => e.preventDefault()} sx={{ mb: 5 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Question Text"
                value={newQuestionText}
                onChange={(e) => setNewQuestionText(e.target.value)}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Options (comma-separated)"
                value={newOptions}
                onChange={(e) => setNewOptions(e.target.value)}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <TextField
                label="Order"
                type="number"
                value={newOrder}
                onChange={(e) => setNewOrder(e.target.value)}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={newType}
                  label="Type"
                  onChange={(e) => setNewType(e.target.value)}
                >
                  <MenuItem value="categorical">Categorical</MenuItem>
                  <MenuItem value="ordinal">Ordinal</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography id="input-slider" gutterBottom>
                Weight
              </Typography>
              <Slider
                value={newWeight}
                onChange={(e, newValue) => setNewWeight(newValue)}
                aria-labelledby="input-slider"
                min={1}
                max={5}
                marks
                step={1}
                valueLabelDisplay="auto"
              />
            </Grid>
            <Grid item xs={12} sm={12}>
              <Button variant="contained" color="primary" onClick={handleAddQuestion}>
                Add Question
              </Button>
            </Grid>
          </Grid>
        </Box>
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          message={snackbarMessage}
        />
        
        <Paper sx={{ p: 2, mt: 2}}>
          {questions.map((question) => (
            <Box
              key={question.id}
              sx={{
                mb: 3,
                borderBottom: '1px solid #ccc',
                '&:last-child': {
                  borderBottom: 0
                },
              
              }}
            >
              <Typography variant="h6" sx={{ mb: 1 }}>
                {question.order}. {question.questionText}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Options: {question.options.join(', ')}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Type: {question.type} | Weight: {question.weight}
              </Typography>
              <Box sx={{ mt: 2, mb: 2 }}>
                <Button variant="contained" color="primary" onClick={() => handleOpenEditModal(question)} sx={{ mr: 1 }}>
                  Edit
                </Button>
                <Button variant="contained" color="secondary" onClick={() => handleDeleteQuestion(question.id)}>
                  Delete
                </Button>
              </Box>
            </Box>
          ))}
        </Paper>
      </Container>
      <Dialog open={openEditModal} onClose={handleCloseEditModal}>
        <DialogContent>
          <TextField
            margin="dense"
            label="Question Text"
            fullWidth
            variant="outlined"
            value={editQuestion?.questionText || ''}
            onChange={(e) => setEditQuestion({ ...editQuestion, questionText: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Options (comma-separated)"
            fullWidth
            variant="outlined"
            value={typeof editQuestion?.options === 'string' ? editQuestion.options : editQuestion?.options.join(', ') || ''}
            onChange={(e) => setEditQuestion({ ...editQuestion, options: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Order"
            type="number"
            fullWidth
            variant="outlined"
            value={editQuestion?.order || ''}
            onChange={(e) => setEditQuestion({ ...editQuestion, order: e.target.value })}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Type</InputLabel>
            <Select
              value={editQuestion?.type || 'categorical'}
              onChange={(e) => setEditQuestion({ ...editQuestion, type: e.target.value })}
            >
              <MenuItem value="categorical">Categorical</MenuItem>
              <MenuItem value="ordinal">Ordinal</MenuItem>
            </Select>
          </FormControl>
          <Typography id="edit-slider" gutterBottom>
            Weight
          </Typography>
          <Slider
            value={editQuestion?.weight || 3}
            onChange={(e, newValue) => setEditQuestion({ ...editQuestion, weight: newValue })}
            aria-labelledby="edit-slider"
            min={1}
            max={5}
            marks
            step={1}
            valueLabelDisplay="auto"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditModal}>Cancel</Button>
          <Button onClick={handleUpdateQuestion}>Update</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default AdminPage;

"use client";
import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDoc, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Avatar,
  Rating,
  Paper,
  IconButton,
  Grid,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { UserAuth } from '../context/AuthContext';
import "../globals.css";

function ReviewPage() {
  const [reviews, setReviews] = useState([]);
  const { user } = UserAuth();
  const [currentUserProfile, setCurrentUserProfile] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(2.5);
  const [editMode, setEditMode] = useState(false);
  const [editReviewId, setEditReviewId] = useState(null);
  const [averageRating, setAverageRating] = useState(null);
  const [showMyComments, setShowMyComments] = useState(false);

  useEffect(() => {
    if (user) fetchUserProfile();
    fetchReviews();
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;
    const userDocRef = doc(db, 'userProfiles', user.uid);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      setCurrentUserProfile(userDoc.data());
    } else {
      console.log('No profile found for the current user');
      setCurrentUserProfile(null);
    }
  };

  const fetchReviews = async () => {
    const reviewsSnapshot = await getDocs(collection(db, 'reviews'));
    const loadedReviews = reviewsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    setReviews(loadedReviews);
    if (loadedReviews.length > 0) {
      const total = loadedReviews.reduce((acc, review) => acc + review.rating, 0);
      setAverageRating(total / loadedReviews.length);
    } else {
      setAverageRating(null);
    }
  };

  const handlePostReview = async () => {
    if (!newComment.trim() || !currentUserProfile) return;
    const reviewData = {
      userName: currentUserProfile.name,
      comment: newComment,
      rating: newRating,
      userId: user.uid,
      imageUrl: currentUserProfile.imageUrl,
      timestamp: new Date(),
    };

    if (editMode) {
      await updateDoc(doc(db, 'reviews', editReviewId), reviewData);
      setEditMode(false);
      setEditReviewId(null);
    } else {
      await addDoc(collection(db, 'reviews'), reviewData);
    }

    setNewComment('');
    setNewRating(2.5);
    fetchReviews();
  };

  const handleDeleteReview = async (reviewId) => {
    await deleteDoc(doc(db, 'reviews', reviewId));
    fetchReviews();
  };

  const handleEditReview = (review) => {
    setNewComment(review.comment);
    setNewRating(review.rating);
    setEditReviewId(review.id);
    setEditMode(true);
  };

  const toggleMyComments = () => {
    setShowMyComments(!showMyComments);
  };

  const filteredReviews = showMyComments
    ? reviews.filter(review => review.userId === user.uid)
    : reviews;

  return (
    <Container
      sx={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        minHeight: '100vh',
      }}
    >
      <div className="text-container">
        <h4 className="reviews-title">
          Reviews --  Leave a rating and share your experience
        </h4>
      </div>
      {averageRating !== null && (
        <Typography variant="h7" gutterBottom>
          Average Rating: {averageRating.toFixed(1)} <Rating value={averageRating} readOnly />
        </Typography>
      )}
      <Box component="form" noValidate autoComplete="off" sx={{ mb: 5 }}>
        <Rating
          name="simple-controlled"
          value={newRating}
          onChange={(event, newValue) => {
            setNewRating(newValue);
          }}
        />
        <TextField
          label="Leave a comment"
          fullWidth
          multiline
          rows={4}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          margin="normal"
        />
        <Grid container spacing={2}>
          <Grid item>
            <Button variant="contained" color="primary" onClick={handlePostReview}>
              {editMode ? 'Update' : 'Comment'}
            </Button>
          </Grid>
          <Grid item>
            <Button variant="contained" color="secondary" onClick={toggleMyComments}>
              {showMyComments ? 'All Comments' : 'My Comments'}
            </Button>
          </Grid>
        </Grid>
      </Box>
      {filteredReviews.map((review) => (
        <Paper key={review.id} sx={{ p: 2, mb: 2, display: 'flex', alignItems: 'center' }}>
          <Avatar src={review.imageUrl} sx={{ mr: 2 }} />
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle1">{review.userName}</Typography>
            <Rating name="read-only" value={review.rating} readOnly />
            <Typography variant="body2">{review.comment}</Typography>
            <Typography variant="caption" color="text.secondary">
              Posted on: {review.timestamp.toDate().toLocaleString()}
            </Typography>
          </Box>
          {currentUserProfile && user.uid === review.userId && (
            <Box>
              <IconButton onClick={() => handleEditReview(review)}>
                <EditIcon />
              </IconButton>
              <IconButton onClick={() => handleDeleteReview(review.id)}>
                <DeleteIcon />
              </IconButton>
            </Box>
          )}
        </Paper>
      ))}
    </Container>
  );
}

export default ReviewPage;

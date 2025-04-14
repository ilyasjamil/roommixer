"use client";
import React, { useEffect, useState } from 'react';
import {
  Container, Typography, TextField, Button, Card, CardContent, Grid, CardActions,
  InputAdornment, IconButton, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { db } from '../firebase';
import { collection, addDoc, getDocs, getDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import EmailIcon from '@mui/icons-material/Email'; 
import EditIcon from '@mui/icons-material/Edit'; 
import DeleteIcon from '@mui/icons-material/Delete'; 
import { UserAuth } from '../context/AuthContext';
import axios from 'axios';
import { styled } from '@mui/system';
import Autosuggest from 'react-autosuggest';
import '../globals.css'; 

const PrimaryButton = styled(Button)(({ theme }) => ({
    backgroundImage: 'linear-gradient(45deg, #003DA5 30%, #002D80 90%)',
    color: '#FFFFFF',
    fontWeight: 'bold',
    boxShadow: '0 3px 5px 2px rgba(0, 123, 255, .3)',
    '&:hover': {
      backgroundImage: 'linear-gradient(45deg, #002D80 30%, #003DA5 90%)',
    }
}));

const SecondaryButton = styled(Button)(({ theme }) => ({
    backgroundImage: 'linear-gradient(45deg, #85C1E9 30%, #5DADE2 90%)',
    color: '#000000',
    fontWeight: 'bold',
    boxShadow: '0 3px 5px 2px rgba(255, 193, 7, .3)',
    '&:hover': {
      backgroundImage: 'linear-gradient(45deg, #E0A800 30%, #FDB913 90%)',
    }
}));

function Listing() {
    const { user } = UserAuth();
    const [listings, setListings] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showMyListings, setShowMyListings] = useState(false);
    const [currentUserProfile, setCurrentUserProfile] = useState(null);
    const [formData, setFormData] = useState({
        address: '',
        rent: '',
        numRoommates: '',
        notes: '',
        imageUrl: ''
    });
    const [open, setOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editId, setEditId] = useState(null);
    const [suggestions, setSuggestions] = useState([]);

    useEffect(() => {
        if (user) fetchUserProfile();
        fetchListings();
    }, [user]);

    const fetchListings = async () => {
        const querySnapshot = await getDocs(collection(db, "listings"));
        setListings(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

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

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const filteredListings = listings.filter(listing =>
        listing.address.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!user) {
            alert("You must be logged in to create or update a listing.");
            return;
        }

        const apiKey = process.env.NEXT_PUBLIC_OPENCAGE_API_KEY;
        const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(formData.address)}&countrycode=us&key=${apiKey}`;

        try {
            const response = await axios.get(url);
            if (response.data.results && response.data.results.length > 0) {
                if (editMode) {
                    await updateDoc(doc(db, "listings", editId), {
                      ...formData,
                      userId: user.uid,
                      userEmail: user.email
                    });
                    alert("Listing updated successfully!");
                    setListings(prevListings => prevListings.map(listing => listing.id === editId ? { ...listing, ...formData } : listing));
                    setEditMode(false);
                    setEditId(null);
                } else { 
                    const newDoc = await addDoc(collection(db, "listings"), {
                      ...formData,
                      userId: user.uid,
                      userEmail: user.email
                    });
                    alert("Listing created successfully!");
                    setListings(prevListings => [{ id: newDoc.id, ...formData }, ...prevListings]);
                    setFormData({ address: '', rent: '', numRoommates: '', notes: '', imageUrl: '' });
                    fetchListings();
                }
                setOpen(false); 
            } else {
                alert("The address entered could not be verified. Please check the address and try again.");
            }
        } catch (error) {
            console.error("Failed to validate address: ", error);
            alert("Error validating address. Please try again.");
        }
        };

    const handleOpen = (listing = null) => {
        if (listing) {
            setFormData({
                address: listing.address,
                rent: listing.rent,
                numRoommates: listing.numRoommates,
                notes: listing.notes,
                imageUrl: listing.imageUrl
            });
            setEditId(listing.id);
            setEditMode(true);
        }
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setEditMode(false);
        setEditId(null);
        setFormData({ address: '', rent: '', numRoommates: '', notes: '', imageUrl: '' });
    };

    const handleDelete = async (id) => {
        alert("Listing deleted successfully!");
        await deleteDoc(doc(db, "listings", id));
        setListings(prevListings => prevListings.filter(listing => listing.id !== id));
    };

    const getSuggestions = async (value) => {
        const apiKey = process.env.NEXT_PUBLIC_OPENCAGE_API_KEY;
        const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(value)}&countrycode=us&key=${apiKey}`;
        try {
            const response = await axios.get(url);
            if (response.data.results && response.data.results.length > 0) {
                return response.data.results.map(result => ({
                    address: result.formatted
                }));
            } else {
                return [];
            }
        } catch (error) {
            console.error("Failed to fetch suggestions: ", error);
            return [];
        }
    };

    const onSuggestionsFetchRequested = async ({ value }) => {
        const suggestions = await getSuggestions(value);
        setSuggestions(suggestions);
    };

    const onSuggestionsClearRequested = () => {
        setSuggestions([]);
    };

    const onSuggestionSelected = (event, { suggestion }) => {
        setFormData(prevState => ({
            ...prevState,
            address: suggestion.address
        }));
    };

    const renderSuggestion = (suggestion) => (
        <div className="suggestion-content">
            {suggestion.address}
        </div>
    );

    const inputProps = {
        placeholder: 'Search by address',
        value: formData.address,
        onChange: (event, { newValue }) => {
            setFormData(prevState => ({
                ...prevState,
                address: newValue
            }));
        },
        style: {
            width: '100%',
            padding: '15px 20px',
            fontSize: '1.2rem',
            borderRadius: '4px',
            border: '1px solid #ccc',
            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
            marginBottom: '10px'
        }
    };
    
    const myListings = listings.filter(listing => listing.userId === user.uid);
    const displayedListings = showMyListings ? myListings : filteredListings;

    const theme = {
        container: 'autosuggest-container',
        suggestionsContainerOpen: 'suggestions-container-open',
        suggestionsList: 'suggestions-list',
        suggestion: 'suggestion',
        suggestionHighlighted: 'suggestion-highlighted'
    };

    const formatAddress = (address) => {
        return address.replace(', United States of America', '');
    };

    return (
        <div style={{ 
          minHeight: '100vh',
          display: 'flex',
          marginTop: '50px',
          marginBottom: '50px',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'white',
          fontFamily: 'Lato, sans-serif',
          color: '#fff'
        }}>
            <Container maxWidth="md" sx={{
              mt: 0,
              py: 3,
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              color: '#333',
              textShadow: '1px 1px 2px rgba(0,0,0,0.2)',
              borderRadius: '0px',
              boxShadow: '0 10px 20px rgba(0, 0, 0, 0.2)',
              position: 'relative',
              overflow: 'hidden'
            }}>
                <Typography variant="h4" gutterBottom sx={{
                  fontWeight: 'bold',
                  fontSize: '40px', 
                  textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
                  textAlign: 'center',
                  marginTop: '20px',
                  marginBottom: '30px'

                }}>
                    Housing Listings
                </Typography>
                <PrimaryButton onClick={() => handleOpen()} sx={{ mb: 2 }}>
                    Create New Listing
                </PrimaryButton>
                <SecondaryButton onClick={() => setShowMyListings(!showMyListings)} sx={{ mb: 2, ml: 2 }}>
                    {showMyListings ? 'Show All Listings' : 'My Listings'}
                </SecondaryButton>
                <TextField
                    fullWidth
                    label="Search Listings"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    margin="normal"
                    variant="outlined"
                    sx={{ mb: 2 }}
                />
                <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                    <DialogTitle>{editMode ? "Edit Listing" : "Create a New Listing"}</DialogTitle>
                    <form onSubmit={handleSubmit}>
                        <DialogContent>
                            <Autosuggest
                                suggestions={suggestions}
                                onSuggestionsFetchRequested={onSuggestionsFetchRequested}
                                onSuggestionsClearRequested={onSuggestionsClearRequested}
                                getSuggestionValue={(suggestion) => suggestion.address}
                                renderSuggestion={renderSuggestion}
                                onSuggestionSelected={onSuggestionSelected}
                                inputProps={inputProps}
                                theme={theme}
                            />
                            <TextField
                                fullWidth
                                label="Rent"
                                name="rent"
                                type="number"
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                }}
                                value={formData.rent}
                                onChange={handleChange}
                                margin="normal"
                                required
                            />
                            <TextField
                                fullWidth
                                label="Number of Roommates Needed"
                                name="numRoommates"
                                type="number"
                                value={formData.numRoommates}
                                onChange={handleChange}
                                margin="normal"
                                required
                            />
                            <TextField
                                fullWidth
                                label="Notes"
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                margin="normal"
                                multiline
                                rows={4}
                            />
                        </DialogContent>
                        <DialogActions>
                            <SecondaryButton onClick={handleClose}>
                                Cancel
                            </SecondaryButton>
                            <PrimaryButton type="submit">
                                {editMode ? "Update Listing" : "Create Listing"}
                            </PrimaryButton>
                        </DialogActions>
                    </form>
                </Dialog>
                <Grid container spacing={2} sx={{ mt: 4 }}>
                    {displayedListings.map(listing => (
                        <Grid item xs={12} md={6} key={listing.id}>
                            <Card sx={{
                                transition: '0.3s',
                                boxShadow: '0px 8px 20px rgba(0,0,0,0.12)',
                                '&:hover': {
                                    transform: 'scale(1.03)',
                                    boxShadow: '0px 16px 40px rgba(0,0,0,0.2)'
                                }
                            }}>
                                <CardContent>
                                    <Typography variant="h5" sx={{ color: '#333', fontWeight: 'medium' }}>{formatAddress(listing.address)}</Typography>
                                    <Typography variant="body1" sx={{ color: '#555' }}>${listing.rent} / month</Typography>
                                    <Typography variant="body2" sx={{ color: '#777' }}>{listing.numRoommates} roommates needed</Typography>
                                    <Typography variant="body2" sx={{ color: '#999' }}>{listing.notes}</Typography>
                                </CardContent>
                                <CardActions>
                                    {currentUserProfile && user.uid === listing.userId ? (
                                        <>
                                            <IconButton
                                                color="primary"
                                                onClick={() => handleOpen(listing)}
                                                sx={{ '&:hover': { backgroundColor: 'rgba(76, 175, 80, 0.2)' } }}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton
                                                color="secondary"
                                                onClick={() => handleDelete(listing.id)}
                                                sx={{ '&:hover': { backgroundColor: 'rgba(244, 67, 54, 0.2)' } }}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </>
                                    ) : (
                                        <IconButton
                                            color="primary"
                                            component="span"
                                            onClick={() => window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${listing.userEmail}&su=About%20Housing%20Listing:%20${encodeURIComponent(formatAddress(listing.address))}`, '_blank')}
                                            sx={{ '&:hover': { backgroundColor: 'rgba(255, 235, 59, 0.2)' } }}
                                        >
                                            <EmailIcon />
                                        </IconButton>
                                    )}
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </div>
    );
}    

export default Listing;

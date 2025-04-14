"use client";
import React, { useEffect, useState } from 'react';
import { db } from '../firebase';  
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Container, TextField, Card, CardContent, CardMedia, IconButton, Typography, Button, Grid, InputLabel, Select, MenuItem, FormControl } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EmailIcon from '@mui/icons-material/Email';
import Box from '@mui/material/Box';
import * as XLSX from 'xlsx';

const MatchedUsers = () => {
    const [allUsers, setAllUsers] = useState([]);
    const [matches, setMatches] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [academicYear, setAcademicYear] = useState('');
    const [academicYearOptions, setAcademicYearOptions] = useState(['Freshman', 'Sophomore', 'Junior', 'Senior']);

    useEffect(() => {
        const fetchAcademicQuestionId = async () => {
            const questionsSnapshot = await getDocs(query(collection(db, 'onboardingQuestions'), where('questionText', '==', 'What is your current academic year status?')));
            const questionDoc = questionsSnapshot.docs[0];
            return questionDoc.id;
        };

        const fetchUsers = async () => {
            const questionId = await fetchAcademicQuestionId();
            const usersSnapshot = await getDocs(collection(db, 'userProfiles'));
            const userResponsesSnapshot = await getDocs(collection(db, 'userResponses'));

            const usersData = usersSnapshot.docs.map(doc => {
                const userData = doc.data();
                const responseDoc = userResponsesSnapshot.docs.find(r => r.id === doc.id);
                const responses = responseDoc ? responseDoc.data().responses : {};
                userData.academicStatus = responses[questionId] ? responses[questionId].response : '';
                return { id: doc.id, ...userData };
            });

            const matchesQuery = query(collection(db, 'matchRequests'), where('status', '==', 'accepted'));
            const matchesSnapshot = await getDocs(matchesQuery);
            const matchedUsers = matchesSnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    fromUser: usersData.find(user => user.id === data.from),
                    toUser: usersData.find(user => user.id === data.to),
                };
            }).filter(match => match.fromUser && match.toUser);
            setMatches(matchedUsers);
            setAllUsers(usersData);
        };

        fetchUsers();
    }, []);

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value.toLowerCase());
    };

    const handleAcademicYearChange = (event) => {
        setAcademicYear(event.target.value);
    };

    const createMailToLink = (email1, email2) => {
        return `https://mail.google.com/mail/?view=cm&fs=1&to=${email1},${email2}&su=Matching Update`;
    };

    const handleCreateDataSheet = () => {
        const filteredMatches = matches.filter(match => {
            const fromMatches = match.fromUser.name.toLowerCase().includes(searchTerm) || match.toUser.name.toLowerCase().includes(searchTerm);
            const academicMatches = academicYear ? (match.fromUser.academicStatus === academicYear || match.toUser.academicStatus === academicYear) : true;
            return fromMatches && academicMatches;
        });

        const matchedUsersData = filteredMatches.map(match => ({
            'User 1': match.fromUser.name,
            'User 2': match.toUser.name
        }));

        const worksheet = XLSX.utils.json_to_sheet(matchedUsersData);
        const workbook = XLSX.utils.book_new();
        const sheetName = academicYear ? `${academicYear} Matches` : 'All Matches';
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

        const wscols = [
            { wch: 20 }, 
            { wch: 20 }, 
        ];
        worksheet['!cols'] = wscols;

        XLSX.writeFile(workbook, `${sheetName}.xlsx`);
    };

    const filteredMatches = matches.filter(match => {
        const fromMatches = match.fromUser.name.toLowerCase().includes(searchTerm) || match.toUser.name.toLowerCase().includes(searchTerm);
        const academicMatches = academicYear ? (match.fromUser.academicStatus === academicYear || match.toUser.academicStatus === academicYear) : true;
        return fromMatches && academicMatches;
    });

    return (
        <Container>
            <Typography variant="h4" style={{fontWeight: 'bold', color: 'darkblue'}} sx={{ pt: 4, pb: 2 }}>Matched Users</Typography>
            <TextField
                placeholder="Search by name..."
                onChange={handleSearchChange}
                variant="outlined"
                sx={{ mb: 2, width: '100%' }}
                InputProps={{
                    endAdornment: <SearchIcon />
                }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="academic-year-select-label">Academic Year</InputLabel>
                <Select
                    labelId="academic-year-select-label"
                    id="academic-year-select"
                    value={academicYear}
                    label="Academic Year"
                    onChange={handleAcademicYearChange}
                >
                    <MenuItem value=""><em>Any</em></MenuItem>
                    {academicYearOptions.map((year, index) => (
                        <MenuItem key={index} value={year}>{year}</MenuItem>
                    ))}
                </Select>
            </FormControl>
            <Button onClick={handleCreateDataSheet} variant="contained" color="primary" sx={{ mb: 2 }}>Create DataSheet</Button>
            <Typography style={{ color: 'darkblue' }} sx={{mb: 2}}variant="h6">Total Matches: {filteredMatches.length}</Typography>
            {filteredMatches.map((match, index) => (
                <Grid item xs={12} md={6} key={index} sx={{pb:2}}>
                <Card sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    mb: 2,
                    p: 2,
                    transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                        transform: 'scale(1.03)',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)'
                    }
                    
                }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <CardMedia
                        component="img"
                        sx={{ width: { xs: '150px', md: 151 }, borderRadius: '20px', height: { xs: '150px', md: 150 }}}
                        image={match.fromUser.imageUrl || 'https://via.placeholder.com/150'}
                        alt={match.fromUser.name}
                    />
                    </Box>
                    <CardContent sx={{ flex: '1 0 auto' }}>
                        <Typography variant="h5" style={{textAlign: 'center'}}>{match.fromUser.name}</Typography>
                        <Typography variant="body2"style={{textAlign: 'center'}}>{match.fromUser.email}</Typography>
                    </CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <CardMedia
                        component="img"
                        sx={{ width: { xs: '50%', md: 151 }, borderRadius: '20px', justifyContent: 'center', height: { xs: '150px', md: 150 }}}
                        image={match.toUser.imageUrl || 'https://via.placeholder.com/150'}
                        alt={match.toUser.name}
                    />
                    </Box>
                    <CardContent sx={{ flex: '1 0 auto' }}>
                        <Typography variant="h5" style={{textAlign: 'center'}}>{match.toUser.name}</Typography>
                        <Typography variant="body2" style={{textAlign: 'center'}}>{match.toUser.email}</Typography>
                    </CardContent>
                    <IconButton href={createMailToLink(match.fromUser.email, match.toUser.email)} target="_blank" aria-label="send email">
                        <EmailIcon />
                    </IconButton>
                </Card>
            </Grid>
            ))}
        </Container>
    );
};

export default MatchedUsers;

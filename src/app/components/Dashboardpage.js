import React, { useEffect, useState } from 'react';
import { Container, Grid, Button, Card, Typography, FormControl, InputLabel, Select, MenuItem, TextField } from '@mui/material';
import { UserAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { getMatchingScores } from './matching';
import { motion } from 'framer-motion';
import { StyledEngineProvider } from '@mui/material/styles';
import UserProfileCard from './userProfileCard';

const DashboardPage = () => {
  const { user, logOut, isAdmin } = UserAuth();
  const router = useRouter();

  const [users, setUsers] = useState([]);
  const [questionMap, setQuestionMap] = useState({});
  const [matchingScores, setMatchingScores] = useState({});
  const [isMounted, setIsMounted] = useState(false);
  const [filters, setFilters] = useState({
    gender: '',
    major: '',
    academicYear: '',
    residenceHall: ''
  });
  const [searchQuery, setSearchQuery] = useState('');

  const cardVariants = {
    offscreen: {
      y: 50,
      opacity: 0
    },
    onscreen: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        bounce: 0.4,
        duration: 0.8
      }
    }
  };

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    if (isAdmin) {
      router.push('/AdminPage');
    }
  }, [isAdmin, router]);

  const db = getFirestore();

  useEffect(() => {
    if (user) {
      fetchUsersAndScores();
    }
  }, [user]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const fetchUsersAndScores = async () => {
    const db = getFirestore();
    const usersCollection = collection(db, 'userProfiles');
    const responsesCollection = collection(db, 'userResponses');
    const questionsCollection = collection(db, 'onboardingQuestions');

    const questionSnapshot = await getDocs(questionsCollection);
    const newQuestionMap = questionSnapshot.docs.reduce((acc, doc) => {
      acc[doc.data().questionText] = doc.id;
      return acc;
    }, {});
    if (isMounted) {
      setQuestionMap(newQuestionMap);
    }

    const userSnapshot = await getDocs(usersCollection);
    const responsesSnapshot = await getDocs(responsesCollection);
    const responsesData = responsesSnapshot.docs.map(doc => ({
      id: doc.id,
      responses: doc.data().responses
    }));

    const userList = userSnapshot.docs.map(doc => {
      const response = responsesData.find(r => r.id === doc.id);
      return {
        id: doc.id,
        ...doc.data(),
        responses: response ? response.responses : {}
      };
    });

    const filteredUserList = userList.filter(u => u.id !== user.uid);
    if (isMounted) {
      setUsers(filteredUserList);
    }

    const scores = await getMatchingScores(user.uid);
    const scoresMap = scores.reduce((acc, score) => {
      acc[score.userId] = score.matchPercentage;
      return acc;
    }, {});
    if (isMounted) {
      setMatchingScores(scoresMap);
    }
  };

  const filteredUsers = users.filter(user => {
    return (!filters.gender || user.responses[questionMap['What is your gender?']]?.response === filters.gender) &&
      (!filters.major || user.responses[questionMap["What's your major?"]]?.response === filters.major) &&
      (!filters.academicYear || user.responses[questionMap['What is your current academic year status?']]?.response === filters.academicYear) &&
      (!filters.residenceHall || user.responses[questionMap['What residence hall would you prefer to move to?']]?.response === filters.residenceHall) &&
      (!searchQuery || user.name.toLowerCase().includes(searchQuery.toLowerCase()));
  });
  

  return (
    <StyledEngineProvider injectFirst>
      <Container maxWidth="xl">
        <Typography variant="h3" sx={{ fontFamily: 'poppins, sans-serif', paddingTop: 10, marginBottom: 4, textAlign: 'center' }}>
          Dashboard
        </Typography>
        <Grid container spacing={2} alignItems="center" style={{ marginBottom: '20px' }}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Search by name"
              variant="outlined"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Gender</InputLabel>
              <Select value={filters.gender} name="gender" onChange={handleFilterChange}>
                <MenuItem value="">Any</MenuItem>
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Academic Year</InputLabel>
              <Select value={filters.academicYear} name="academicYear" onChange={handleFilterChange}>
                <MenuItem value="">Any</MenuItem>
                <MenuItem value="Freshman">Freshman</MenuItem>
                <MenuItem value="Sophomore">Sophomore</MenuItem>
                <MenuItem value="Junior">Junior</MenuItem>
                <MenuItem value="Senior">Senior</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Residence Preference</InputLabel>
              <Select value={filters.residenceHall} name="residenceHall" onChange={handleFilterChange}>
                <MenuItem value="">Any</MenuItem>
                <MenuItem value="No Preference">No Preference</MenuItem>
                <MenuItem value="Seminary Hall">Seminary Hall</MenuItem>
                <MenuItem value="Andreen Hall">Andreen Hall</MenuItem>
                <MenuItem value="Swanson Commons">Swanson Commons</MenuItem>
                <MenuItem value="Erickson Hall">Erickson Hall</MenuItem>
                <MenuItem value="Westerlin Hall">Westerlin Hall</MenuItem>
                <MenuItem value="Naeseth Tonwhouses">Naeseth Tonwhouses</MenuItem>
                <MenuItem value="Parkander">Parkander</MenuItem>
                <MenuItem value="Arbaugh">Arbaugh</MenuItem>
                <MenuItem value="other TLAs">other TLAs</MenuItem>
                <MenuItem value="Off Campus House">Off Campus House</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        <Card style={{
          paddingLeft: '10px', paddingRight: '10px', marginTop: '20px', backgroundColor: '#e8e8e8', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        }}>
          <Grid container spacing={2} sx={{ mt: 2 }}>
            {filteredUsers.map((userProfile, index) => (
              <Grid item xs={12} sm={6} md={4} key={userProfile.id}>
                <motion.div
                  initial="offscreen"
                  whileInView="onscreen"
                  viewport={{ once: true, amount: 0.8 }}
                  variants={cardVariants}
                >
                  <UserProfileCard userProfile={userProfile} matchingScores={matchingScores} />
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Card>
      </Container>
    </StyledEngineProvider>
  );
};

export default DashboardPage;

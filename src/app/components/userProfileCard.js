import { Container, Grid, Card, Typography } from '@mui/material';
import UserProfileModal from './UserProfileModal';

const UserProfileCard = ({ userProfile, matchingScores }) => {
    return (
        <Card style={{
            textAlign: 'center',
            margin: '2rem',
            marginBottom: '0.5rem',
            padding: '2.4rem',
            maxWidth: '100%',
            borderRadius: '15px',
            minHeight: '30rem',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            transition: 'transform 0.3s',
            backgroundImage: 'linear-gradient(to bottom right, #ffffff, #f0f0f0)',
            border: '1px solid #e0e0e0',
            ':hover': {
                transform: 'scale(1.05)',
            },
            display: 'flex',
            flexDirection: 'column',
            '@media (max-width: 600px)': {
                margin: '1rem',
                padding: '1.2rem',
            }
        }}>
            <Grid container spacing={2.5}>
                <Grid item xs={12}>
                    <img src={userProfile.imageUrl || `https://via.placeholder.com/150x150.png?text=No+Image`} alt={`User ${userProfile.name}`} style={{ width: '150px', height: '150px', borderRadius: '15px', margin: 'auto' }} />
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="h5" sx={{ fontFamily: 'poppins, sans-serif', '@media (max-width: 600px)': { fontSize: '1.2rem' } }}>
                        {userProfile.name || "Name not available"}
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="body" sx={{ '@media (max-width: 600px)': { fontSize: '0.6rem' } }}>
                        {userProfile.email || "Email not available"}
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="body" sx={{ '@media (max-width: 600px)': { fontSize: '0.8rem' } }}>
                        Match: {matchingScores[userProfile.id] ? matchingScores[userProfile.id].toFixed(1) : 0}%
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    {userProfile && <UserProfileModal userProfile={userProfile} matchingScores={matchingScores} />}
                </Grid>
            </Grid>
        </Card>
    );
}

export default UserProfileCard;

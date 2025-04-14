import { getFirestore, collection, getDocs } from "firebase/firestore";

function similarityScore(option1, option2, options) {
  const index1 = options.indexOf(option1);
  const index2 = options.indexOf(option2);
  if (index1 === -1 || index2 === -1) return 0; 
  const maxDistance = options.length - 1;
  const distance = Math.abs(index1 - index2);
  return (maxDistance - distance) / maxDistance; 
}

function calculateMatch(user1, user2, questions) {
  let score = 0;
  let totalWeight = 0;

  questions.forEach(question => {
    const weight = question.weight;
    const questionType = question.type;
    const questionOptions = question.options;
    totalWeight += weight;

    const response1 = user1.responses[question.id]?.response;
    const response2 = user2.responses[question.id]?.response;
    console.log(user1, user2);
    if (response1 && response2) {
      if (response1 === response2) {
        score += weight;
      } else if (questionType === "ordinal") { 
        const partialScore = similarityScore(response1, response2, questionOptions) * weight;
        score += partialScore;
      }
    }
  });

  const matchPercentage = (score / totalWeight) * 100; 
  return matchPercentage;
}

export async function getMatchingScores(currentUserUID) {
  const db = getFirestore();
  const usersCollection = collection(db, "userResponses");
  const questionsCollection = collection(db, "onboardingQuestions");
  const snapshot = await getDocs(usersCollection);
  const questionSnapshot = await getDocs(questionsCollection);
  const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  const questions = questionSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  const currentUser = users.find(user => user.userId === currentUserUID);

  if (!currentUser || !currentUser.responses) {
    console.error('Current user data or responses missing');
    return [];
  }

  const matchingIdsAndScores = users.map(user => {
    if (user.responses) {
      return {
        userId: user.userId,
        matchPercentage: calculateMatch(currentUser, user, questions)
      };
    }
  }).filter(userIdAndScore => userIdAndScore && userIdAndScore.userId !== currentUserUID);

  return matchingIdsAndScores;
}

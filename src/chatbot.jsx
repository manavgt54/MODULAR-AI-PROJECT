const handleFeedback = async (messageIndex, feedbackType) => {
  const botMessage = messages[messageIndex];

  try {
    await fetch('http://localhost:3001/logs.', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: botMessage.text,
        feedback: feedbackType,
        timestamp: new Date().toISOString()
      }),
    });
  } catch (err) {
    console.error("Failed to send feedback", err);
  }
};


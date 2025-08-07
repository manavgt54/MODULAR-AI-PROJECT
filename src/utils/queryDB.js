const queryDB = (input, questions) => {
  if (!input || typeof input !== 'string') return "Please enter a valid question or keyword.";

  const normalizedInput = input.trim().toLowerCase();

  // First: Exact match or partial match to question text or tag
  const matched = questions.find((q) => {
    const questionText = q.question.toLowerCase();
    const tag = q.tag.toLowerCase();

    return (
      questionText.includes(normalizedInput) ||
      tag.includes(normalizedInput) ||
      normalizedInput.includes(tag)
    );
  });

  return matched ? matched.answer : "I couldn't find a matching question. Try using simpler keywords like 'print', 'string', or 'branching'.";
};

export default queryDB;

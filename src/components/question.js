import React from 'react';

const Question = ({ question }) => {
  return (
    <div>
      <h2 className='question_text'>{question.question}</h2>
      {/* Render options here */}
    </div>
  );
};

export default Question;
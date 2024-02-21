
import React from "react";

const ResultTable = ({ allAnswers, questions }) =>{
    return (
      <div className="result-table">
        <h2>Results:</h2>
        <table>
          <thead>
            <tr>
              <th>Question</th>
              <th>Your Answer</th>
            </tr>
          </thead>
          <tbody>
            {allAnswers.map((answer, index) => (
              <tr key={index}>
                <td>{questions[index].question}</td>
                <td>{answer}</td>
  
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  export default ResultTable;
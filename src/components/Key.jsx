import React from "react";

export default function Key({
  isAbsent,
  isPresent,
  isCorrect,
  letter,
  typeLetter,
}) {
  return (
    <div
      className={`key ${isAbsent && "key--absent"} ${
        isPresent && "key--present"
      } ${isCorrect && "key--correct"}`}
      onClick={() => typeLetter(letter)}
    >
      {letter}
    </div>
  );
}

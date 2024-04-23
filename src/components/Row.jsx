import React from 'react'
import "../styles/Row.css";

export default function Row({ word, applyRotation, solution, bounceOnError, onBounceEnd }) {
    return (
        <div className={`row ${bounceOnError && "row--bounce"}`} onAnimationEnd={onBounceEnd}>
            {word.split("").map((letter, index) => {
                const bgClass =
                    solution[index] === letter
                        ? "correct"
                        : solution.includes(letter)
                        ? "present"
                        : "absent";

                return (
                    <div
                        className={`letter ${bgClass} ${
                        applyRotation && `rotate--${index + 1}00`
                        } ${letter !== " " && "letter--active"}`}
                        key={index}
                    >
                        {letter}
                        <div className="back">{letter}</div>
                    </div>
                );
            })}
        </div>
    );
}
import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import "../styles/Wordle.css";
import Row from "./Row";
import Keyboard from "./Keyboard";
import {SUCCESS_MSGS, LETTERS, potential_words} from "../data/letters_and_words";

const SOLUTION = "apple";

export default function Wordle() {
    const [guesses, setGuesses] = useState([
        "     ",
        "     ",
        "     ",
        "     ",
        "     ",
        "     ",
    ]);
    const [solutionFound, setSolutionFound] = useState(false);
    const [notification, setNotification] = useState(0);
    const [activeLetterIndex, setActiveLetterIndex] = useState(0);    
    const [activeRowIndex, setActiveRowIndex] = useState(0);
    const [failedGuesses, setFailedGuesses] = useState([]);
    const [correctLetters, setCorrectLetters] = useState([]);
    const [presentLetters, setPresentLetters] = useState([]);
    const [absentLetters, setAbsentLetters] = useState([]);

    const wordleRef = useRef();

    useEffect(() => {
        wordleRef.current.focus();
    }, []);

    const typeLetter = (letter) => {
        if (activeLetterIndex < 5) {
            setNotification(0);
            let newGuesses = [...guesses];
            newGuesses[activeRowIndex] = replaceCharacter(newGuesses[activeRowIndex], activeLetterIndex, letter);
            setGuesses(newGuesses);
            setActiveLetterIndex(activeLetterIndex + 1);
        }
    };

    const replaceCharacter = (string, index, replacement) => {
        return string.slice(0, index) + replacement + string.slice(index + 1)
    }

    const hitEnter = () => {
        if (activeRowIndex === 7) return;
        if (activeLetterIndex === 5) {
            const currentGuess = guesses[activeRowIndex];
            if (currentGuess === SOLUTION) {
                setSolutionFound(true);
                setNotification(0);
                toast(SUCCESS_MSGS[activeRowIndex]);

                setCorrectLetters([...SOLUTION]);
            } else if (!potential_words.includes(currentGuess)) {
                setNotification(notification + 1);
                toast("not in word list");
            } else if (failedGuesses.includes(currentGuess)) {
                setNotification(notification + 1);
                toast("already guessed");
            } else {
                setNotification(0);
                let correctLetters = [];
                [...currentGuess].forEach((letter, index) => {
                    if (SOLUTION.includes(letter)) correctLetters.push(letter);
                });
                setCorrectLetters([...new Set(correctLetters)]);      
                setPresentLetters([
                        ...new Set(
                            [...presentLetters, 
                            ...[...currentGuess].filter((letter) => SOLUTION.includes(letter))
                        ])
                ]);
                setAbsentLetters([
                    ...new Set(
                        [...absentLetters, 
                        ...[...currentGuess].filter((letter) => !SOLUTION.includes(letter))
                    ])
                ]);

                setFailedGuesses([...failedGuesses, currentGuess]);
                setActiveRowIndex(activeRowIndex + 1);
                setActiveLetterIndex(0);
                if (activeRowIndex === 7) {
                    setNotification(0);
                    toast('{{solution}}', {
                        duration: Infinity,
                    });
                }
            }
        } else {
            setNotification(notification + 1);
            toast("minimum 5 letters");            
        }
    };

    const hitBackspace = () => {
        setNotification(0);

        if (guesses[activeRowIndex][0] !== " ") {
            const newGuesses = [...guesses];

            newGuesses[activeRowIndex] = replaceCharacter(
                newGuesses[activeRowIndex],
                activeLetterIndex - 1,
                " "
            );

            setGuesses(newGuesses);
            setActiveLetterIndex((index) => index - 1);
        }
    };

    const handleKeyDown = (event) => {
        if (solutionFound) return;
        if (LETTERS.includes(event.key)) {
            typeLetter(event.key);
            return;
        }
        if (event.key === "Enter") {
            hitEnter();
            return;
        }
        if (event.key === "Backspace") {
            hitBackspace();
        }
    }

    return (
        <div className="wordle" ref={wordleRef} tabIndex="0" onBlur={(e) => {e.target.focus();}} onKeyDown={handleKeyDown}>
            <div className="title">wordle<span className="tinytitle"> by hemmy</span></div>
            {/* <div className={`notification ${solutionFound && "notification--green"}`}>{notification}</div> */}
            {guesses.map((guess, index) => {
                return (
                    <Row
                        key={index}
                        word={guess}
                        applyRotation={
                        activeRowIndex > index ||
                        (solutionFound && activeRowIndex === index)
                        }
                        solution={SOLUTION}
                        bounceOnError={
                            notification > 0 &&
                            activeRowIndex === index
                        }
                        onBounceEnd={() => {
                            setNotification(0);
                        }}
                    />
                );
            })}
            <Keyboard
                presentLetters={presentLetters}
                correctLetters={correctLetters}
                absentLetters={absentLetters}
                typeLetter={typeLetter}
                hitEnter={hitEnter}
                hitBackspace={hitBackspace}
            />
        </div>
    );
}
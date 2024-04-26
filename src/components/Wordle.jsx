import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import "../styles/Wordle.css";
import Row from "./Row";
import Keyboard from "./Keyboard";
import shareicon from "../data/shareicon.png";
import {SUCCESS_MSGS, LETTERS, potential_words} from "../data/letters_and_words";
import {solution_words, title1, title2, altTinyTitle} from "../../solutions";

const startTime = new Date('2024-04-26T00:00:00'); // CHANGE THIS TO START DATE
const currTime = new Date();
const daysSince = Math.floor((currTime - startTime) / (1000 * 60 * 60 * 24));

let SOLUTION  = potential_words[daysSince % potential_words.length];
const ALT_SOLUTION = solution_words[(daysSince % (solution_words.length - 1) + 1)];

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
    const [altMode, setAltMode] = useState(false);
    const [index, setIndex] = useState(daysSince % potential_words.length)
    const [totalLength, setTotalLength] = useState(potential_words.length)
    const [enableShare, setEnableShare] = useState(false)

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
        if (activeRowIndex >= 6) return;
        if (activeLetterIndex === 5) {
            const currentGuess = guesses[activeRowIndex];
            if (activeRowIndex == 0 && altMode === false && currentGuess === solution_words[0]) {
                setAltMode(true);
                guesses[activeRowIndex] = "     ";
                setGuesses([...guesses]);
                setActiveLetterIndex(0);
                toast("hi " + solution_words[0] + "!");
                setTimeout(() => toast("you're on " + title1 + title2 + " " + daysSince % solution_words.length + "/" + solution_words.length, {duration: 2000}), 1000);
                setIndex((daysSince % (solution_words.length-1)));
                setTotalLength(solution_words.length-1);
                SOLUTION = ALT_SOLUTION;

                // change the color of --present and --correct variables in app.css
                document.documentElement.style.setProperty('--present', '#eb8ae7');
                document.documentElement.style.setProperty('--correct', '#2298d7');

            } else if (currentGuess === SOLUTION) {
                setSolutionFound(true);
                setNotification(0);
                setTimeout(() => toast(SUCCESS_MSGS[activeRowIndex]), 1000);
                setTimeout(() => setEnableShare(true), 1000);
                setCorrectLetters([...SOLUTION]);
            } else if (!potential_words.includes(currentGuess) && (altMode ? !solution_words.includes(currentGuess) : true)) {
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
                if (activeRowIndex === 5) {
                    setNotification(0);
                     
                    setTimeout(() => toast(SOLUTION, {duration: Infinity, style: {textTransform: "uppercase"}}), 1000);
                    setTimeout(() => setEnableShare(true), 1000);
                    setSolutionFound(true);
                    setActiveRowIndex(10);
                } else {
                    setActiveRowIndex(activeRowIndex + 1);   
                }
                setActiveLetterIndex(0);                
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

    const share = () => {
        if (solutionFound) {
            let shareable = ""
            altMode ? shareable += title1.substring(0, 1).toUpperCase() + title2.substring(1) + " " : shareable += "Wordle ";
            shareable += (index+1) + " ";

            shareable += activeRowIndex == 10 ? "X" : activeRowIndex+1;
            shareable += "/6\n";

            let correctsquare = !altMode ? "🟩" : "🟦";
            let presentsquare = !altMode ? "🟨" : "🟪";
            let absentsquare = "⬛"

            // loop through activeRowIndex
            let loopto = activeRowIndex;
            if (activeRowIndex == 10) {
                loopto = 5;
            }
            for (let i = 0; i <= loopto; i++) {
                shareable += "\n";
                // go through each letter of guess
                let currGuess = guesses[i];
                for (let j = 0; j < 5; j++) {
                    let currLetter = currGuess[j];
                    // if curr letter in solution
                    if (SOLUTION[j] === currLetter) {
                        shareable += correctsquare;
                    } else if (SOLUTION.includes(currLetter)) {
                        shareable += presentsquare;
                    } else {
                        shareable += absentsquare;
                    }
                }    
            }

            navigator.clipboard.writeText(shareable);
            toast("copied to clipboard");   

        }
    }

    return (
        <div className="wordle" ref={wordleRef} tabIndex="0" onBlur={(e) => {e.target.focus();}} onKeyDown={handleKeyDown}>
            <div className="nav">
                <div className="navdata">
                    <img src={shareicon} onClick={share} className="sharebuttonleft"></img>
                    <div className="title">
                        {altMode ?
                            <>
                                <span className="title1">{title1}</span>
                                <span className="title2">{title2}</span>
                            </>
                            :
                            'wordle'
                        }
                        <span className="tinytitle">
                        {altMode ? altTinyTitle : ' by hemanth'}
                        </span>
                    </div>                
                    <img src={shareicon} onClick={share} className={`sharebutton ${!enableShare ? 'enable' : ''}`}></img>
                </div>
            </div>
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
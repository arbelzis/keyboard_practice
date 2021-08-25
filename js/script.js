'user strict';

const logoName = document.querySelector('.logo-name');
const hamburgers = document.querySelectorAll('.hamburgers');
const sideBar = document.querySelector('.side-bar');
const textSelectors = document.querySelectorAll('.side-bar__item');
const innerTextSelectors = document.querySelectorAll('.side-bar__inner-item');
const displayChosenText = document.querySelector('.text-to-type');
const gameStats = document.querySelector('.game-stats')
const clockDisplay = document.querySelector('.clock');
const playBtn = document.querySelector('.play');
const restartBtn = document.querySelector('.restart');
const currentSpeed = document.querySelector('.current-speed');
const speedBtn = document.querySelector('.speed-btn');
const computerField = document.querySelector('.computer-input');
const userInput = document.querySelector('.user-input');
const winnerIndicator = document.querySelectorAll('.winner-indicator');
const secondsCountdown = document.querySelector('.countdown');
const countdownModal = document.querySelector('.countdown-modal');

const bestTime = document.querySelector('#best-time');
const whoFaster = document.querySelector('#who-faster');
const wordsWithErrors = document.querySelector('#words-with-errors');
const wordsMissing = document.querySelector('#words-missing');
const wordsPerMinute = document.querySelector('#words-per-minute');


userInput.setAttribute('disabled', 'disabled');

//INTERVALS
let clockIntervals;
let aiTypingIntervals;

let userFinalInput = '';
let minutes = seconds = miliSec = counterWatch = 0;
let isPlay = false;
let isGameOver = false;
let currentTextPlayedID = 0;
let outputComputerString;

const MAX_RUNNING_CLOCK = 15000;


const textObj = {
    1: 'How much wood would a woodchuck chuck if a woodchuck could chuck wood?',
    2: 'Fuzzy Wuzzy was a bear. Fuzzy Wuzzy had no hair. Fuzzy Wuzzy wasn\'t fuzzy, was he?',
    3: 'I have got a date at a quarter to eight. I\'ll see you at the gate, so don\'t be late.',
    4: 'Once upon a time there was a turtle named Rob. Rob is the fastest and toughest animal in the jungle. Every time he gets out of his armor the whole jungle trembles with fear.',
    5: 'I\'m a scientist because I invent, transform, create, and destroy for a living, and when I don\'t like something about the world, I change it, usually for the best.',
    6: 'here was the time I fed my daughters cookie dough and sushi for dinner. Steve was away so we had an indoor picnic. It was my "most fun mom" moment and they don\'t even remember.',
    7: 'An aggressive alien creature visited our planet. it was ugly, with a big nose, pinkish hairy skin, and feet that smelled. It was frightened of us for no reason. It resented our differences. It laid claim to our planet. This strange alien was an Earth Human. It called me "alien."',
    8: 'The fan really wanted to see a great game. But it was dull. One nil. His team\'s striker dived in the box to claim an undeserved penalty. His goalkeeper sneakily handled outside the box. A midfielder broke an opponent\'s leg. But the fan\'s team won, so he went home happy.',
    9: 'I awoke to a grey morning. My heart was heavy, my soul lifeless. My lover writes each month. Today the letter finally arrived, so colour flooded my day. Emotions stirred my heart. Sparks revitalised my soul. I came alive. A month now to fade to grey until my next awakening.'
}



// ENSURING LOCALSTORAGE CAN BE USED
if (!localStorage.keyboardPractice) {
    localStorage.clear();
    localStorage.keyboardPractice = 1;
}



// RESTART THE STATS

const restartingStats = () => {
    whoFaster.innerText = '';
    wordsWithErrors.innerText = '';
    wordsMissing.innerText = '';
    wordsPerMinute.innerText = '';
}






// PRESSING RESTART

const restart = () => {
    displayChosenText.style.transform = 'rotateX(0deg)';
    gameStats.style.transform = 'rotateX(180deg)';

    setTimeout(() => {
        restartingStats();
    }, 500);

    if (isPlay) {
        playBtn.innerHTML = '<use xlink:href="img/sprite.svg#icon-play2"></use>';
        isPlay = false;
        clearInterval(clockIntervals);
        clearInterval(aiTypingIntervals);
        minutes = seconds = miliSec = counterWatch = 0;
        clockDisplay.innerText = '00:00:00';
    } else {
        minutes = seconds = miliSec = counterWatch = 0;
        clockDisplay.innerText = '00:00:00'
    }
    userInput.setAttribute('disabled', 'disabled');
    setTimeout(() => {
        computerField.innerText = '';
        winnerIndicator[1].style.backgroundColor = 'transparent';
        winnerIndicator[0].style.backgroundColor = 'transparent';
    }, 250);
    userInput.value = '';
    userFinalInput = "";
    isGameOver = false;
    outputComputerString = '';


}




// CHECKING IF TEXT SELECTED

const ifChosenTextValidation = () => {
    for (let i = 0; i < Object.values(textObj).length; i++) {
        if (Object.values(textObj)[i] === displayChosenText.innerText) {
            return true;
        }
    }
    return false;
}





// CHECKING TEXT ACCURACY

const checkTextAccuracy = (text) => {
    const textArr = text.split(/[\s]+/).filter(el => el != '');
    const originTextArr = displayChosenText.innerText.split(/[\s]+/);

    let errCounter = 0;
    let missingWords = 0;

    if (textArr.length != originTextArr.length) {
        missingWords = originTextArr.length - textArr.length;
    }

    for (let i = 0; i < textArr.length; i++) {
        if (textArr[i].length != originTextArr[i].length) {
            errCounter++;
        } else if (textArr[i] != originTextArr[i]) {
            errCounter++;
        }
    }
    // alert(`Errors: ${errCounter} \nMissing words: ${missingWords}`)
    return { errCounter, missingWords };
}






// PRESSING PLAY OR PAUSE

const playOrPause = () => {
    if (!isPlay) { // CURRENT STATE IS PAUSED
        if (isGameOver) return;
        if (!ifChosenTextValidation()) return;
        playBtn.innerHTML = '<use xlink:href="img/sprite.svg#icon-pause"></use>'
        isPlay = true;
        if (counterWatch === 0) {
            countdownModal.style.visibility = 'visible';
            start3Countdown();
        } else {
            userInput.removeAttribute('disabled');
            userInput.focus();
            computerTypes(currentSpeed.innerText);
            runningClock();
        }

    } else { // CURRENT STATE IS PLAYED
        playBtn.innerHTML = '<use xlink:href="img/sprite.svg#icon-play2"></use>'
        isPlay = false;
        clearInterval(clockIntervals);
        clearInterval(aiTypingIntervals);
        userInput.setAttribute('disabled', 'disabled');
    }
}







// TIME STRING

const calculateTimeString = () => {
    return `${(minutes + '').padStart(2, '0')}:${(seconds + '').padStart(2, '0')}:${(miliSec + 1 + '').padStart(2, '0')}`;
}



// RENDER BESTTIME ON SELECT

const displayBestTimeOnSelection = () => {
    if (localStorage[currentTextPlayedID]) {
        bestTime.innerText = localStorage[currentTextPlayedID];
    } else {
        bestTime.innerText = '';
    }
}






// CHECK LOCALSTORAGE

const checkLocalStorage = () => {
    const currentMin = Number(localStorage[currentTextPlayedID][0] + localStorage[currentTextPlayedID][1]);

    const currentSec = Number(localStorage[currentTextPlayedID][3] + localStorage[currentTextPlayedID][4]);

    const currentMil = Number(localStorage[currentTextPlayedID][6] + localStorage[currentTextPlayedID][7]);

    if (minutes < currentMin) {
        localStorage.setItem(currentTextPlayedID, calculateTimeString());
        bestTime.innerText = calculateTimeString();
    } else if (minutes === currentMin) {
        if (seconds < currentSec) {
            localStorage.setItem(currentTextPlayedID, calculateTimeString());
            bestTime.innerText = calculateTimeString();
        } else if (seconds === currentSec) {
            if (miliSec <= currentMil) {
                localStorage.setItem(currentTextPlayedID, calculateTimeString());
                bestTime.innerText = calculateTimeString();
            } else {
                return;
            }
        }
    }
}



// ENDING GAME

const endGame = () => {
    isGameOver = true;

    playOrPause();
    const { errCounter: wordsWithErr, missingWords } = checkTextAccuracy(userFinalInput);

    // rendering stats on the screen;
    whoFaster.innerText = userFinalInput.length > computerField.innerText.length ? 'YOU' : 'AI'
    if (missingWords != displayChosenText.innerText.split(' ').length) {
        wordsWithErrors.innerText = wordsWithErr;
    }
    wordsMissing.innerText = missingWords;
    if (userFinalInput.split(' ').length > 1) {
        wordsPerMinute.innerText = ((60 * userFinalInput.split(' ').length) / (counterWatch / 100)).toFixed(2);
    }
    if (missingWords === 0 && wordsWithErr === 0) {
        if (!localStorage[currentTextPlayedID]) {
            localStorage.setItem(currentTextPlayedID, calculateTimeString());
            bestTime.innerText = calculateTimeString();
        } else {
            checkLocalStorage();
        }
    }

    displayChosenText.style.transform = 'rotateX(180deg)';
    gameStats.style.transform = 'rotateX(360deg)';
}










logoName.addEventListener('click', () => {
    hamburgers[0].classList.toggle('ham-1-active');
    hamburgers[1].classList.toggle('ham-2-active');
    hamburgers[2].classList.toggle('ham-3-active');

    document.querySelector('.copy').classList.toggle('copy-active')

    sideBar.classList.toggle('side-bar-active');
    document.querySelector('.side-bar__list').classList.toggle('side-bar__list-active')
})

////////////////////////////////// DROPDOWN SELECTORS ///////////////////////////

textSelectors.forEach(el => {
    el.addEventListener('click', function () {
        el.lastElementChild.classList.toggle('inner-list-open');
    })
});

innerTextSelectors.forEach(el => {
    el.addEventListener('click', () => {
        displayChosenText.innerText = textObj[el.dataset.id];
        currentTextPlayedID = el.dataset.id;
        displayBestTimeOnSelection();
        restart();
    })
})







function computerTypes(string) {
    const time = string === '1x' ? 300 : string === '2x' ? 230 : string === '3x' ? 160 : 370;

    if (!outputComputerString) {
        outputComputerString = displayChosenText.innerText;
    }

    aiTypingIntervals = setInterval(() => {
        if (outputComputerString.length === 1) {
            clearInterval(aiTypingIntervals);
            endGame();
        }

        computerField.innerHTML += outputComputerString[0];
        outputComputerString = outputComputerString.slice(1)

        //******** SHOWING CURRENT WINNER *********/
        if (computerField.innerText.length > userFinalInput.length) {
            winnerIndicator[0].style.backgroundColor = 'red';
            winnerIndicator[1].style.backgroundColor = 'transparent';

        } else if (userFinalInput.length > computerField.innerText.length) {
            winnerIndicator[1].style.backgroundColor = 'hsl(120, 72%, 48%)';
            winnerIndicator[0].style.backgroundColor = 'transparent';
        } else {
            winnerIndicator[1].style.backgroundColor = 'transparent';
            winnerIndicator[0].style.backgroundColor = 'transparent';
        }
    }, time);
}




// LISTENING TO KEY STROKES

userInput.addEventListener('keydown', (e) => {
    //******** MAKING THE INPUT *********/
    if ((/[0-9a-zA-z,.\s?!-']/).test(e.key) && e.key.length === 1) {
        userFinalInput += e.key;
    } else if (e.key === 'Backspace') {
        setTimeout(() => {
            userFinalInput = userInput.value;
        }, 1);
        // userFinalInput = userFinalInput.slice(0, userFinalInput.length - 1)
    } else if (e.key === 'Enter') {
        e.preventDefault();
        endGame();
    }
})



// PREVENTING COPY PASTE

userInput.onpaste = (e) => {
    e.preventDefault()
}

displayChosenText.oncopy = (e) => {
    e.preventDefault()
}











// CLOCK

const runningClock = () => {
    clockIntervals = setInterval(() => {
        if (counterWatch === MAX_RUNNING_CLOCK) {
            clearInterval(clockIntervals);
            endGame();
        }

        minutes = Math.floor(counterWatch / 6000) % 60;
        seconds = Math.floor(counterWatch / 100) % 60;
        miliSec = (counterWatch % 100) - 1;
        counterWatch++;
        clockDisplay.innerText = calculateTimeString();
    }, 10);
};







// PLAY STOP RESTART BUTTONS
// PLAY PAUSE
playBtn.addEventListener('click', playOrPause);

// RESTART
restartBtn.addEventListener('click', restart);






// SPEED BUTTONS

speedBtn.addEventListener('click', (e) => {
    if (e.target.classList.contains('speed-down')) {
        if (currentSpeed.innerText != '0.5x') {
            if (currentSpeed.innerText === '1x') {
                currentSpeed.innerText = (currentSpeed.innerText.split(/[a-z]/)[0] / 2) + 'x';
            } else {
                currentSpeed.innerText = (currentSpeed.innerText.split(/[a-z]/)[0] - 1) + 'x';
            }
        }
    }
    if (e.target.classList.contains('speed-up')) {
        if (currentSpeed.innerText != '3x') {
            if (currentSpeed.innerText === '0.5x') {
                currentSpeed.innerText = (currentSpeed.innerText.split(/[a-z]/)[0] * 2) + 'x';
            } else {
                currentSpeed.innerText = (+currentSpeed.innerText.split(/[a-z]/)[0] + 1) + 'x';
            }
        }
    }
})








function start3Countdown() {
    let counting3 = 1;
    secondsCountdown.innerText = 4 - counting3;
    const modal = setInterval(() => {
        counting3++;
        if (counting3 === 4) {
            clearInterval(modal);
            countdownModal.style.visibility = 'hidden';
            userInput.removeAttribute('disabled')
            userInput.focus();
            runningClock();
            computerTypes(currentSpeed.innerText);
        }
        secondsCountdown.innerText = 4 - counting3;
    }, 1000);
}










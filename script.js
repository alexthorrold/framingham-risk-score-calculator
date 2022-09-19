const forms = document.querySelectorAll('form');
const results = document.querySelector('#results');
const canvas = document.querySelector('canvas');

const ageRange = document.querySelector('#age');
const ageSpan = document.querySelector('#ageSpan');

const prevButton = document.querySelector('#previous');
const nextButton = document.querySelector('#next');
const getResultsButton = document.querySelector('#getResults');
const resetButton = document.querySelector('#reset');

let locIndex = 0;

ageSpan.textContent = ageRange.value;

/**
 * Hides the current form/results page and displays the previous form
 */
prevButton.addEventListener('click', () => {
    // Hides results div and re-enables getResultsButton if moving off the results div
    if (locIndex === forms.length) {
        results.classList.toggle('hide');
        canvas.classList.toggle('hide');
        getResultsButton.disabled = false;
    }
    else {
        // Shows next button and hides getResultsButton if moving off the final form
        if (locIndex === forms.length - 1) {
            nextButton.classList.toggle('hide');
            getResultsButton.classList.toggle('hide');
        }

        // Hides current form
        forms[locIndex].classList.toggle('hide');
    }

    // Displays previous form
    locIndex--;
    forms[locIndex].classList.toggle('hide');

    if (locIndex === 0) {
        prevButton.disabled = true;
    }
});

/**
 * Hides the current form and displays the next one/results page
 */
nextButton.addEventListener('click', () => {
    // Doesn't go to next form if there was an invalid input
    if (sendInputWarning()) {
        return;
    }

    // Hide current form and display the next one
    forms[locIndex].classList.toggle('hide');
    locIndex++;
    forms[locIndex].classList.toggle('hide');

    prevButton.disabled = false;

    // Switches next button to get results button if moving to the last form
    if (locIndex === forms.length - 1) {
        nextButton.classList.toggle('hide');
        getResultsButton.classList.toggle('hide');
        getResultsButton.disabled = false;
    }
});

/**
 * Sends an input if there is an invalid input
 * @returns {boolean} Whether or not a warning was sent
 */
function sendInputWarning() {
    /**
     * Sends an alert to user that they have left a field unanswered
     */
    function sendBlankFieldAlert() {
        alert('Please enter an answer for all fields.');
    }

    // Checks fields based on what form is currently visible
    switch (forms[locIndex].id) {
        case 'ageGender':
            const radioButtons = document.querySelectorAll('input[name="gender"]');
            let hasChecked = false;
            for (const rb of radioButtons) {
                if (rb.checked) {
                    hasChecked = true;
                }
            }
            if (!hasChecked) {
                alert('Please select a gender');
                return true;
            }
            return false;

        case 'cholesterol':
            const totalChol = document.querySelector('#totalCholesterol');
            const hdlChol = document.querySelector('#hdlCholesterol');
            if (totalChol.value < 0 || hdlChol.value < 0) {
                alert('Please enter a non-negative cholesterol level');
                return true;
            }
            if (totalChol.value === "" || hdlChol.value === "") {
                sendBlankFieldAlert();
                return true;
            }
            return false;

        case 'smoker':
            return false;

        case 'bloodPressure':
            if (document.querySelector('#bloodPressureInput').value === "") {
                sendBlankFieldAlert();
                return true;
            }
            return false;

        default:
            alert("SCRIPT ERROR");
            return true;
    }
}

/**
 * Calculates and displays results
 */
getResultsButton.addEventListener('click', () => {
    // Doesn't go to results if there was an invalid input
    if (sendInputWarning()) {
        return;
    }

    // Calculates results and displays results visually on canvas
    const risk = calculateResults();
    displayResults(risk);

    // Hides visible form and displays results div
    forms[locIndex].classList.toggle('hide');
    locIndex++;
    results.classList.toggle('hide');
    canvas.classList.toggle('hide');


    getResultsButton.disabled = true;
});

/**
 * Displays the user's results as a pie chart using a canvas
 * @param risk 10-year risk as a percentage
 */
function displayResults(risk) {
    canvas.width = 450;
    canvas.height = 450;

    let endAngle = ((risk / 100) * Math.PI * 2);

    // Displays risk of less than 1% as 0.5%, so it is visible
    if (risk === 0) {
        endAngle = (0.005 * Math.PI * 2);
    }

    let label;

    // If risk is 0 or 30 the actual result is as follows
    if (risk === 0) {
        label = 'Less than 1% risk';
    }
    else if (risk >= 30) {
        label = 'Greater than 30% risk';
    }
    else {
        label = `${risk}% risk`;
    }

    drawSection(0, endAngle, label, '#CD5334');

    drawSection(endAngle, 0, '', '#17BEBB');
}

/**
 * Draws a section of the pie chart
 * @param startAngle Starting angle of the pie section to be drawn
 * @param endAngle Ending angle of the pie section to be drawn
 * @param label Label to attach to the section
 * @param color Color to fill the section with
 */
function drawSection(startAngle, endAngle, label, color) {
    const context = canvas.getContext('2d');

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    const radius = 100;

    context.fillStyle = color;
    context.lineWidth = 1;
    context.strokeStyle = '#000';
    context.beginPath();

    // Draws and fills a section of the pie chart
    context.moveTo(cx, cy);
    context.arc(cx, cy, radius, startAngle, endAngle, false);
    context.lineTo(cx, cy);
    context.fill();
    context.stroke();
    context.closePath();

    // Draws a label if the label is not an empty string
    if (label !== '') {
        context.beginPath();
        context.font = '20px Inter, sans-serif';
        context.textAlign = 'center';
        context.fillStyle = 'black';

        let deltaY = Math.sin(Math.PI / 2) * 1.5 * radius;
        let deltaX = Math.cos(Math.PI / 2) * 1.5 * radius;

        context.fillText(label, deltaX + cx, deltaY + cy);
        context.closePath();
    }
}

/**
 * Resets all forms and returns to the first one
 */
resetButton.addEventListener('click', () => {
    prevButton.disabled = true;
    nextButton.disabled = false;

    for (let f of forms) {
        f.reset();
    }

    // Hides the current form if not on last form or results page
    if (locIndex < forms.length - 1) {
        forms[locIndex].classList.toggle('hide');
    }
    else {
        // Hides results page if on results page
        if (locIndex === forms.length) {
            results.classList.toggle('hide');
            canvas.classList.toggle('hide');
        }
        // Otherwise hides current form (last)
        else {
            forms[locIndex].classList.toggle('hide');
        }

        nextButton.classList.toggle('hide');
        getResultsButton.classList.toggle('hide');
    }

    // Resets the age displayed beside slider as it doesn't automatically reset with form
    ageSpan.textContent = ageRange.value;

    // Displays first form
    locIndex = 0;
    forms[locIndex].classList.toggle('hide');
});

ageRange.addEventListener('input', () => {
    ageSpan.textContent = ageRange.value;
});

/**
 * Calculates the 10-year cardiovascular risk of an individual
 * @returns {number} 10 year risk in percent
 */
function calculateResults() {
    // Values for calculating score
    const isMale = document.querySelector('#male').checked;
    const age = parseInt(document.querySelector('#age').value);
    const totalCholesterol = parseInt(document.querySelector('#totalCholesterol').value);
    const hdlCholesterol = parseInt(document.querySelector('#hdlCholesterol').value);
    const isSmoker = document.querySelector('#smokerCheckbox').checked;
    const bloodPressure = document.querySelector('#bloodPressureInput').value;
    const isTreated = document.querySelector('#treated').checked;

    let points = 0;

    // Scores adding 0 are included for formula clarity
    if (isMale) {
        // Calculations for age points, as well as smoker and totalCholesterol points which vary based on age
        if (age <= 39) {
            if (age <= 34) {
                points -= 9;
            }
            else {
                points -= 4;
            }

            if (isSmoker) {
                points += 8;
            }

            if (totalCholesterol < 160) {
                points += 0;
            }
            else if (totalCholesterol <= 199) {
                points += 4;
            }
            else if (totalCholesterol <= 239) {
                points += 7;
            }
            else if (totalCholesterol <= 279) {
                points += 9;
            }
            else {
                points += 11;
            }
        }
        else if (age <= 49) {
            if (age <= 44) {
                points += 0;
            }
            else {
                points += 3;
            }

            if (isSmoker) {
                points += 5;
            }

            if (totalCholesterol < 160) {
                points += 0;
            }
            else if (totalCholesterol <= 199) {
                points += 3;
            }
            else if (totalCholesterol <= 239) {
                points += 5;
            }
            else if (totalCholesterol <= 279) {
                points += 6;
            }
            else {
                points += 8;
            }
        }
        else if (age <= 59) {
            if (age <= 54) {
                points += 6;
            }
            else {
                points += 8;
            }

            if (isSmoker) {
                points += 3;
            }

            if (totalCholesterol < 160) {
                points += 0;
            }
            else if (totalCholesterol <= 199) {
                points += 2;
            }
            else if (totalCholesterol <= 239) {
                points += 3;
            }
            else if (totalCholesterol <= 279) {
                points += 4;
            }
            else {
                points += 5;
            }
        }
        else if (age <= 69) {
            if (age <= 64) {
                points += 10;
            }
            else {
                points += 11;
            }

            if (isSmoker) {
                points += 1;
            }

            if (totalCholesterol < 160) {
                points += 0;
            }
            else if (totalCholesterol <= 239) {
                points += 1;
            }
            else if (totalCholesterol <= 279) {
                points += 2;
            }
            else {
                points += 3;
            }
        }
        else {
            if (age <= 74) {
                points += 12;
            }
            else {
                points += 13;
            }

            if (isSmoker) {
                points += 1;
            }

            if (totalCholesterol <= 239) {
                points += 0;
            }
            else {
                points += 1;
            }
        }

        if (hdlCholesterol >= 60) {
            points -= 1;
        }
        else if (hdlCholesterol >= 50) {
            points += 0;
        }
        else if (hdlCholesterol >= 40) {
            points += 1;
        }
        else {
            points += 2;
        }

        // Blood pressure is a drop-down list so checks against the value of each drop-down option
        if (isTreated) {
            if (bloodPressure === 'under120') {
                points += 0;
            }
            else if (bloodPressure === 'between120to129') {
                points += 1;
            }
            else if (bloodPressure === 'between130to139' || bloodPressure === 'between140to159') {
                points += 2;
            }
            else {
                points += 3;
            }
        }
        else {
            if (bloodPressure === 'under120' || bloodPressure === 'between120to129') {
                points += 0;
            }
            else if (bloodPressure === 'between130to139' || bloodPressure === 'between140to159') {
                points += 1;
            }
            else {
                points += 2;
            }
        }

        // Calculates 10-year risk in % from points
        if (points <= 0) {
            // Returns 0 which actually means less than 1% chance
            return 0;
        }
        else if (points <= 4) {
            return 1;
        }
        else if (points <= 6) {
            return 2;
        }
        else if (points === 7) {
            return 3;
        }
        else if (points === 8) {
            return 4;
        }
        else if (points === 9) {
            return 5;
        }
        else if (points === 10) {
            return 6;
        }
        else if (points === 11) {
            return 8;
        }
        else if (points === 12) {
            return 10;
        }
        else if (points === 13) {
            return 12;
        }
        else if (points === 14) {
            return 16;
        }
        else if (points === 15) {
            return 20;
        }
        else if (points === 16) {
            return 25;
        }
        else {
            // Returns 30 which actually means over 30% chance
            return 30;
        }
    }
    else {
        // Calculations for age points, as well as smoker and totalCholesterol points which vary based on age
        if (age <= 39) {
            if (age <= 34) {
                points -= 7;
            }
            else {
                points -= 3;
            }

            if (isSmoker) {
                points += 9;
            }

            if (totalCholesterol < 160) {
                points += 0;
            }
            else if (totalCholesterol <= 199) {
                points += 4;
            }
            else if (totalCholesterol <= 239) {
                points += 8;
            }
            else if (totalCholesterol <= 279) {
                points += 11;
            }
            else {
                points += 13;
            }
        }
        else if (age <= 49) {
            if (age <= 44) {
                points += 0;
            }
            else {
                points += 3;
            }

            if (isSmoker) {
                points += 7;
            }

            if (totalCholesterol < 160) {
                points += 0;
            }
            else if (totalCholesterol <= 199) {
                points += 3;
            }
            else if (totalCholesterol <= 239) {
                points += 6;
            }
            else if (totalCholesterol <= 279) {
                points += 8;
            }
            else {
                points += 10;
            }
        }
        else if (age <= 59) {
            if (age <= 54) {
                points += 6;
            }
            else {
                points += 8;
            }

            if (isSmoker) {
                points += 4;
            }

            if (totalCholesterol < 160) {
                points += 0;
            }
            else if (totalCholesterol <= 199) {
                points += 2;
            }
            else if (totalCholesterol <= 239) {
                points += 4;
            }
            else if (totalCholesterol <= 279) {
                points += 5;
            }
            else {
                points += 7;
            }
        }
        else if (age <= 69) {
            if (age <= 64) {
                points += 10;
            }
            else {
                points += 12;
            }

            if (isSmoker) {
                points += 2;
            }

            if (totalCholesterol < 160) {
                points += 0;
            }
            else if (totalCholesterol <= 199) {
                points += 1;
            }
            else if (totalCholesterol <= 239) {
                points += 2;
            }
            else if (totalCholesterol <= 279) {
                points += 3;
            }
            else {
                points += 4;
            }
        }
        else {
            if (age <= 74) {
                points += 14;
            }
            else {
                points += 16;
            }

            if (isSmoker) {
                points += 1;
            }

            if (totalCholesterol < 160) {
                points += 0;
            }
            if (totalCholesterol <= 239) {
                points += 1;
            }
            else {
                points += 2;
            }
        }

        if (hdlCholesterol >= 60) {
            points -= 1;
        }
        else if (hdlCholesterol >= 50) {
            points += 0;
        }
        else if (hdlCholesterol >= 40) {
            points += 1;
        }
        else {
            points += 2;
        }

        // Blood pressure is a drop-down list so checks against the value of each drop-down option
        if (isTreated) {
            if (bloodPressure === 'between140to159') {
                points += 0;
            }
            else if (bloodPressure === 'between140to159') {
                points += 3;
            }
            else if (bloodPressure === 'between130to139') {
                points += 4;
            }
            else if (bloodPressure === 'between140to159') {
                points += 5;
            }
            else {
                points += 6;
            }
        }
        else {
            if (bloodPressure === 'under120') {
                points += 0;
            }
            else if (bloodPressure === 'between120to129') {
                points += 1;
            }
            else if (bloodPressure === 'between130to139') {
                points += 2;
            }
            else if (bloodPressure === 'between140to159') {
                points += 3;
            }
            else {
                points += 4;
            }
        }

        // Calculates 10-year risk in % from points
        if (points < 9) {
            // Returns 0 which actually means less than 1% chance
            return 0;
        }
        else if (points <= 12) {
            return 1;
        }
        else if (points <= 14) {
            return 2;
        }
        else if (points === 15) {
            return 3;
        }
        else if (points === 16) {
            return 4;
        }
        else if (points === 17) {
            return 5;
        }
        else if (points === 18) {
            return 6;
        }
        else if (points === 19) {
            return 8;
        }
        else if (points === 20) {
            return 11;
        }
        else if (points === 21) {
            return 14;
        }
        else if (points === 22) {
            return 17;
        }
        else if (points === 23) {
            return 22;
        }
        else if (points === 24) {
            return 27;
        }
        else {
            // Returns 30 which actually means over 30% chance
            return 30;
        }
    }
}
document.addEventListener('DOMContentLoaded', function () {
    // DOM Elements
    // const startShiftBtn = document.getElementById('start-shift-btn');
    // const shiftTimestamp = document.getElementById('shift-timestamp');
    // const timestampValue = document.getElementById('timestamp-value');

    // Initialize any saved state
    // initializeShiftState();

    // Event Listeners
    // startShiftBtn.addEventListener('click', handleStartShift);

    // function initializeShiftState() {
    //     const savedTimestamp = localStorage.getItem('shiftStartTime');

    //     if (savedTimestamp) {
    //         // Format and display the saved timestamp
    //         timestampValue.textContent = formatTimestamp(new Date(savedTimestamp));
    //         shiftTimestamp.classList.add('active');

    //         // Update button text to reflect current state
    //         startShiftBtn.innerHTML = '<i>⏱️</i> Update Shift Time';
    //     }
    // }


    // function handleStartShift() {
    //     // Get current time
    //     const now = new Date();

    //     // Update timestamp display
    //     timestampValue.textContent = formatTimestamp(now);
    //     shiftTimestamp.classList.add('active');

    //     // Save to localStorage (would be an API call in production)
    //     localStorage.setItem('shiftStartTime', now.toISOString());

    //     // Update button text after first click
    //     startShiftBtn.innerHTML = '<i>⏱️</i> Update Shift Time';

    //     // Provide visual feedback (button animation)
    //     startShiftBtn.classList.add('clicked');
    //     setTimeout(() => {
    //         startShiftBtn.classList.remove('clicked');
    //     }, 200);
    // }

    // function formatTimestamp(date) {
    //     // Options for time formatting
    //     const options = {
    //         hour: 'numeric',
    //         minute: '2-digit',
    //         hour12: true
    //     };

    //     // Format the time portion
    //     const timeString = date.toLocaleTimeString('en-US', options);

    //     // Return formatted string
    //     return timeString;
    // }

    // function loadUserProfile() {
    //     // for ahmed hafez
    //     // you can add here the handling code to displya the acutal user info and so on
    //     // remimber to select the queries from the html code first.
    // }
});

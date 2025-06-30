console.log("Script loaded and DOMContentLoaded listener setting up...");
// Global variable to hold the CKEditor instance
let editorInstance;
// Global variable to hold the audio player modal Bootstrap instance
let audioPlayerModalInstance; 

// Function to open the text modal (formerly error modal)
function openModal() {
    console.log("openModal function called.");
    const textModalEl = document.getElementById('errorModal'); // ID kept as errorModal based on your provided file
    // Create Bootstrap modal instance each time, or get existing
    const textModal = new bootstrap.Modal(textModalEl);
    textModal.show();
}

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOMContentLoaded event fired.");
    // Get references to your new parent containers for toggling
    const timelineContainerWrapper = document.getElementById('timelineContainerWrapper');
    const ckeditorContainerWrapper = document.getElementById('ckeditorContainerWrapper');
    
    // Get references to buttons and new icons
    const avantiButton = document.getElementById('avantiButton'); 
    const saveNotesButton = document.getElementById('saveNotesButton');
    const cancelNotesButton = document.getElementById('cancelNotesButton');
    const settingsIcon = document.getElementById('settingsIcon'); // Gear icon for spinner
    
    const spinnerOverlay = document.getElementById('spinnerOverlay'); // Spinner overlay reference
    
    // Audio Player elements
    const audioPlayer = document.getElementById('audioPlayer');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const progressBar = document.getElementById('progressBar');
    const progressContainer = document.getElementById('progressContainer');
    const currentTimeSpan = document.getElementById('currentTime');
    const durationSpan = document.getElementById('duration');
    const audioDownloadIcon = document.getElementById('audioDownloadIcon'); // New download icon in header
    const openAudioModalBtn = document.getElementById('openAudioModalBtn'); // Headphone icon for audio modal
    
    // Get modal elements for event listeners
    const textModalEl = document.getElementById('errorModal'); // ID kept as errorModal
    const audioPlayerModalEl = document.getElementById('audioPlayerModal');
    
    // Initialize audioPlayerModalInstance once DOM is ready
    audioPlayerModalInstance = new bootstrap.Modal(audioPlayerModalEl);
    
    // --- Top-level Container References ---
    const newTableContainer = document.getElementById('newTableContainer');
    const mainContentContainer = document.getElementById('mainContentContainer');
    const showMainContentBtn = document.getElementById('showMainContentBtn');
    const showNewTableBtn = document.getElementById('showNewTableBtn');
    
    
    // --- Initial State Setup for all containers ---
    // newTableContainer starts visible and active
    newTableContainer.classList.remove('is-hidden'); 
    newTableContainer.style.display = 'block'; 
    console.log("Initial state: newTableContainer visible.");
    
    // mainContentContainer starts hidden
    mainContentContainer.classList.add('is-hidden'); 
    mainContentContainer.style.display = 'none'; 
    console.log("Initial state: mainContentContainer hidden.");
    
    // timelineContainerWrapper starts visible and active (nested in mainContentContainer)
    timelineContainerWrapper.classList.remove('is-hidden'); 
    timelineContainerWrapper.style.display = 'block'; 
    console.log("Initial state: timelineContainerWrapper visible.");
    
    // ckeditorContainerWrapper starts hidden (nested in mainContentContainer)
    ckeditorContainerWrapper.classList.add('is-hidden'); 
    ckeditorContainerWrapper.style.display = 'none'; 
    console.log("Initial state: ckeditorContainerWrapper hidden.");
    
    // --- Function to hide an element with a smooth fade-out ---
    function hideElement(element, callback = null) {
        console.log(`hideElement called for: ${element.id}`);
        // Ensure the element is part of the layout before applying transition for hiding
        element.offsetWidth; 
        element.classList.add('is-hidden'); // This applies opacity: 0 and pointer-events: none
        
        const transitionEndHandler = () => {
            console.log(`Transition ended for hiding: ${element.id}`);
            element.style.display = 'none'; // Only set display: none AFTER the visual transition
            element.removeEventListener('transitionend', transitionEndHandler);
            if (callback) {
                callback();
            }
        };
        element.addEventListener('transitionend', transitionEndHandler, { once: true });
    }
    
    // --- Function to show an element with a smooth fade-in ---
    function showElement(element, displayType = 'block') { // Default to 'block'
        console.log(`showElement called for: ${element.id}`);
        element.style.display = displayType; // Set display first to make it part of layout
        
        // Force reflow: Ensures display change is applied BEFORE opacity transition
        element.offsetWidth; 
        console.log(`Forced reflow for: ${element.id}`);
        
        element.classList.remove('is-hidden'); // This removes opacity: 0, allowing it to transition to its natural opacity (often 1)
    }
    
    // --- Top-level Toggle Event Listeners ---
    showMainContentBtn.addEventListener('click', () => {
        console.log("showMainContentBtn (right arrow) clicked!");
        hideElement(newTableContainer, () => {
            setTimeout(() => {
                showElement(mainContentContainer, 'block');
            }, 100);
        });
    });
    
    showNewTableBtn.addEventListener('click', () => {
        console.log("showNewTableBtn (left arrow) clicked!");
        hideElement(mainContentContainer, () => {
            setTimeout(() => {
                showElement(newTableContainer, 'block');
            }, 100);
        });
    });
    
    
    // --- "Avanti" Button (Timeline to CKEditor) Click Handler ---
    avantiButton.addEventListener('click', () => {
        console.log("Avanti button clicked (Timeline to CKEditor)");
        hideElement(timelineContainerWrapper, () => {
            setTimeout(() => { 
                showElement(ckeditorContainerWrapper, 'block'); 
            }, 100); 
        });
        
        // Initialize CKEditor if it hasn't been initialized yet
        if (!editorInstance) {
            ClassicEditor
            .create(document.querySelector('#editor'), {
                toolbar: {
                    items: [
                        'heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', '|',
                        'outdent', 'indent', '|', 'blockQuote', 'undo', 'redo'
                    ]
                }
            })
            .then(editor => {
                console.log('CKEditor was initialized successfully!', editor);
                editorInstance = editor; // Store the editor instance
                editorInstance.setData('<p>Scrivi o incolla il tuo testo...</p>');
            })
            .catch(error => {
                console.error('There was an error initializing the CKEditor:', error);
            });
        } else {
            // If CKEditor is already initialized, just ensure its content is visible
            editorInstance.setData('<p>Scrivi o incolla il tuo testo...</p>'); // Or load previously saved data
        }
    });
    
    // --- "Save Notes" Button Click Handler ---
    saveNotesButton.addEventListener('click', () => {
        console.log("Save Notes button clicked.");
        if (editorInstance) {
            const notesContent = editorInstance.getData();
            console.log('Notes saved:', notesContent);
            // In a real application, you would send 'notesContent' to your backend or save it.
            console.log('Notes saved to console!');
        }
        // After saving, switch back to the timeline view
        switchBackToTimeline();
    });
    
    // --- "Cancel Notes" Button Click Handler ---
    cancelNotesButton.addEventListener('click', () => {
        console.log("Cancel Notes button clicked.");
        // Optionally clear CKEditor content on cancel
        if (editorInstance) {
            editorInstance.setData('');
        }
        // Switch back to the timeline view
        switchBackToTimeline();
    });
    
    // Helper function to switch back to the timeline view
    function switchBackToTimeline() {
        console.log("switchBackToTimeline function called.");
        hideElement(ckeditorContainerWrapper, () => {
            setTimeout(() => { 
                showElement(timelineContainerWrapper, 'block'); 
            }, 100); 
        });
    }
    
    // --- Settings Icon Click Handler (for spinner) ---
    settingsIcon.addEventListener('click', () => {
        console.log("Settings icon clicked.");
        spinnerOverlay.style.display = 'flex'; // Show the spinner overlay
        
        setTimeout(() => {
            spinnerOverlay.style.display = 'none'; // Hide the spinner overlay after 2 seconds
        }, 2000); // 2000 milliseconds = 2 seconds
    });
    
    // --- Audio Player Modal Logic ---
    
    // Function to format time for display
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    }
    
    // Event listener to open the audio modal
    openAudioModalBtn.addEventListener('click', () => {
        console.log("Open Audio Modal button clicked.");
        // Set the audioPlayer.src to your local MP3 file
        // IMPORTANT: If running locally, replace this URL with the actual path to your MP3 file, e.g., "media/speech.mp3"
        audioPlayer.src = "http://techslides.com/demos/sample-audio.mp3"; 
        
        audioPlayerModalInstance.show(); // Use the initialized instance
    });
    
    // Play/Pause functionality
    playPauseBtn.addEventListener('click', () => {
        console.log("Play/Pause button clicked.");
        if (audioPlayer.paused) {
            audioPlayer.play();
            playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        } else {
            audioPlayer.pause();
            playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        }
    });
    
    // Update progress bar and current time
    audioPlayer.addEventListener('timeupdate', () => {
        const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        progressBar.style.width = `${progress}%`;
        currentTimeSpan.textContent = formatTime(audioPlayer.currentTime);
    });
    
    // Display duration when metadata is loaded
    audioPlayer.addEventListener('loadedmetadata', () => {
        durationSpan.textContent = formatTime(audioPlayer.duration);
    });
    
    // Handle progress bar clicks to seek
    progressContainer.addEventListener('click', (e) => {
        const seekTime = (e.offsetX / progressContainer.offsetWidth) * audioPlayer.duration;
        audioPlayer.currentTime = seekTime;
    });
    
    // Reset player when modal is hidden
    audioPlayerModalEl.addEventListener('hidden.bs.modal', () => {
        console.log("Audio Player Modal hidden.");
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
        playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        progressBar.style.width = '0%';
        currentTimeSpan.textContent = '0:00';
    });
    
    // Download audio functionality for the new header icon
    audioDownloadIcon.addEventListener('click', () => {
        console.log("Audio Download icon clicked.");
        const audioUrl = audioPlayer.src;
        const link = document.createElement('a');
        link.href = audioUrl;
        link.download = 'recording.mp3'; // Default filename
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
});
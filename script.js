// Global variable to hold the CKEditor instance
let editorInstance;

// Function to open the error modal (from your original project)
function openModal() {
    const errorModalEl = document.getElementById('errorModal');
    const errorModal = new bootstrap.Modal(errorModalEl);
    errorModal.show();
}

document.addEventListener('DOMContentLoaded', () => {
    // Get references to your new parent containers for toggling
    const timelineContainerWrapper = document.getElementById('timelineContainerWrapper');
    const ckeditorContainerWrapper = document.getElementById('ckeditorContainerWrapper');
    
    // Get references to buttons and new icons
    const avantiButton = document.getElementById('avantiButton'); 
    const saveNotesButton = document.getElementById('saveNotesButton');
    const cancelNotesButton = document.getElementById('cancelNotesButton');
    const settingsIcon = document.getElementById('settingsIcon'); // Gear icon for spinner
    const openAudioModalBtn = document.getElementById('openAudioModalBtn'); // Headphone icon for audio modal
    
    const spinnerOverlay = document.getElementById('spinnerOverlay'); // Spinner overlay reference
    
    // Audio Player elements
    const audioPlayer = document.getElementById('audioPlayer');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const progressBar = document.getElementById('progressBar');
    const progressContainer = document.getElementById('progressContainer');
    const currentTimeSpan = document.getElementById('currentTime');
    const durationSpan = document.getElementById('duration');
    const audioDownloadIcon = document.getElementById('audioDownloadIcon'); // New download icon in header
    
    // Transcription Modal Body for text extraction (although not used directly for TTS src anymore)
    const transcriptionModalBody = document.querySelector('#errorModal .modal-body');
    
    // Get audio modal instance
    const audioPlayerModalEl = document.getElementById('audioPlayerModal');
    const audioPlayerModal = new bootstrap.Modal(audioPlayerModalEl);
    
    // --- Initial State Setup (critical for fade transitions) ---
    // Ensure timelineContainerWrapper is visible and active initially
    timelineContainerWrapper.style.opacity = '1';
    timelineContainerWrapper.style.pointerEvents = 'auto';
    timelineContainerWrapper.style.display = 'block'; 
    
    // Ensure ckeditorContainerWrapper is hidden initially
    ckeditorContainerWrapper.style.opacity = '0';
    ckeditorContainerWrapper.style.pointerEvents = 'none';
    ckeditorContainerWrapper.style.display = 'none'; 
    
    // --- Function to hide an element with a smooth fade-out ---
    function hideElement(element, callback = null) {
        element.style.opacity = '0'; // Start fading out visually
        element.style.pointerEvents = 'none'; // Make it unclickable immediately
        
        const transitionEndHandler = () => {
            element.style.display = 'none'; // Remove from flow after fade
            element.removeEventListener('transitionend', transitionEndHandler); // Clean up listener
            if (callback) {
                callback(); // Execute callback after element is fully hidden
            }
        };
        // Ensure the transitionend listener is on the element itself
        element.addEventListener('transitionend', transitionEndHandler, { once: true });
    }
    
    // --- Function to show an element with a smooth fade-in ---
    function showElement(element, displayType = 'block') { // Default to 'block'
        element.style.display = displayType; // Make it occupy space immediately
        
        // Force reflow: This is CRITICAL. It ensures the browser applies the `display` change
        // BEFORE animating the `opacity`. Without this, the opacity transition might not run.
        element.offsetWidth; 
        
        element.style.opacity = '1'; // Start fading in
        element.style.pointerEvents = 'auto'; // Enable clicks
    }
    
    // --- "Avanti" Button Click Handler ---
    avantiButton.addEventListener('click', () => {
        // Hide the timeline wrapper, and then show CKEditor wrapper after a delay
        hideElement(timelineContainerWrapper, () => {
            // This callback executes AFTER timelineContainerWrapper has faded out and display: none
            setTimeout(() => { // Add a short delay before showing the next container
                showElement(ckeditorContainerWrapper, 'block'); 
            }, 100); // 100ms delay (adjust as needed)
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
        console.log('Notes editing cancelled.');
        // Optionally clear CKEditor content on cancel
        if (editorInstance) {
            editorInstance.setData('');
        }
        // Switch back to the timeline view
        switchBackToTimeline();
    });
    
    // Helper function to switch back to the timeline view
    function switchBackToTimeline() {
        // Hide CKEditor wrapper, and then show timeline wrapper after a delay
        hideElement(ckeditorContainerWrapper, () => {
            // This callback executes AFTER ckeditorContainerWrapper has faded out and display: none
            setTimeout(() => { // Add a short delay before showing the next container
                showElement(timelineContainerWrapper, 'block'); 
            }, 100); // 100ms delay (adjust as needed)
        });
    }
    
    // --- Settings Icon Click Handler (for spinner) ---
    settingsIcon.addEventListener('click', () => {
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
        // Set the audioPlayer.src to your local MP3 file
        audioPlayer.src = "media/speech.mp3"; 
        
        audioPlayerModal.show();
    });
    
    // Play/Pause functionality
    playPauseBtn.addEventListener('click', () => {
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
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
        playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        progressBar.style.width = '0%';
        currentTimeSpan.textContent = '0:00';
    });
    
    // Download audio functionality for the new header icon
    audioDownloadIcon.addEventListener('click', () => {
        const audioUrl = audioPlayer.src;
        const link = document.createElement('a');
        link.href = audioUrl;
        link.download = 'recording.mp3'; // Default filename
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
});
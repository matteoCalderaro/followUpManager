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
    
    // Get references to buttons 
    const avantiButton = document.getElementById('avantiButton'); 
    const saveNotesButton = document.getElementById('saveNotesButton');
    const cancelNotesButton = document.getElementById('cancelNotesButton');
    const settingsIcon = document.getElementById('settingsIcon'); // Get reference to the new gear icon

    const spinnerOverlay = document.getElementById('spinnerOverlay'); // Get reference to the spinner overlay
    
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
        }, 4000); // 2000 milliseconds = 2 seconds
    });
});
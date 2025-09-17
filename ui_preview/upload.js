// Port Your Bond - File Upload Handler
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('uploadForm');
    const statusDiv = document.getElementById('status');
    const faqToggle = document.getElementById('faqToggle');
    const faqContent = document.getElementById('faqContent');

    // FAQ Toggle
    faqToggle.addEventListener('click', function() {
        faqContent.classList.toggle('hidden');
        faqToggle.textContent = faqContent.classList.contains('hidden') 
            ? 'What is this? (FAQ)' 
            : 'Hide FAQ';
    });

    // Form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const file = document.getElementById('file').files[0];
        
        if (!email || !file) {
            showStatus('❌ Please provide both email and file.', 'error');
            return;
        }

        // Validate file type
        const allowedTypes = ['.json', '.md', '.markdown'];
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
        if (!allowedTypes.includes(fileExtension)) {
            showStatus('❌ Please upload a JSON or Markdown file.', 'error');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('email', email);

        try {
            showStatus('⏳ Uploading and processing...', 'loading');
            
            const response = await fetch('/start-port', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const result = await response.json();
                showStatus(`✅ Success! Job submitted (ID: ${result.jobId}). You will receive an email when processing is complete.`, 'success');
                form.reset();
            } else {
                const error = await response.text();
                showStatus(`❌ Upload failed: ${error}`, 'error');
            }
        } catch (error) {
            console.error('Upload error:', error);
            showStatus('❌ Network error. Please try again.', 'error');
        }
    });

    function showStatus(message, type) {
        statusDiv.textContent = message;
        statusDiv.classList.remove('hidden');
        
        // Remove existing color classes
        statusDiv.classList.remove('text-red-300', 'text-green-300', 'text-yellow-300', 'text-indigo-300');
        
        // Add appropriate color
        switch(type) {
            case 'error':
                statusDiv.classList.add('text-red-300');
                break;
            case 'success':
                statusDiv.classList.add('text-green-300');
                break;
            case 'loading':
                statusDiv.classList.add('text-yellow-300');
                break;
            default:
                statusDiv.classList.add('text-indigo-300');
        }
    }
});
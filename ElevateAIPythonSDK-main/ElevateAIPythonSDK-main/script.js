// script.js
async function uploadAudio() {
    const fileInput = document.getElementById('audioFile');
    const file = fileInput.files[0];
    if (!file) {
        document.getElementById('status').innerText = 'Please select a file.';
        return;
    }

    document.getElementById('loading').classList.remove('hidden');
    document.getElementById('status').innerText = '';

    try {
        const response = await fetch('http://localhost:3000/api/v1/interactions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-TOKEN': '<YOUR_API_TOKEN>'
            },
            body: JSON.stringify({
                type: 'audio',
                languageTag: 'en-us',
                vertical: 'default',
                audioTranscriptionMode: 'highAccuracy',
                includeAiResults: true,
                originalFilename: file.name
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const interactionId = data.interactionIdentifier;

        // Now upload the file
        const formData = new FormData();
        formData.append('file', file);

        const uploadResponse = await fetch(`http://localhost:3000/api/v1/interactions/${interactionId}/upload`, {
            method: 'POST',
            headers: {
                'X-API-TOKEN': '<YOUR_API_TOKEN>'
            },
            body: formData
        });

        if (!uploadResponse.ok) {
            throw new Error(`Upload error! status: ${uploadResponse.status}`);
        }

        // Check the status until it's processed
        let status;
        do {
            const statusResponse = await fetch(`http://localhost:3000/api/v1/interactions/${interactionId}/status`, {
                method: 'GET',
                headers: {
                    'X-API-TOKEN': '<YOUR_API_TOKEN>'
                }
            });

            if (!statusResponse.ok) {
                throw new Error(`Status error! status: ${statusResponse.status}`);
            }

            const statusData = await statusResponse.json();
            status = statusData.status;
            document.getElementById('status').innerText = `Status: ${status}`;
            if (status !== 'processed') {
                await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for 5 seconds before checking again
            }
        } while (status !== 'processed');

        // Fetch the transcription
        const transcriptionResponse = await fetch(`http://localhost:3000/api/v1/interactions/${interactionId}/transcripts/punctuated`, {
            method: 'GET',
            headers: {
                'X-API-TOKEN': '4c90d090-0115-4fed-9546-d5f446b4459b'
            }
        });

        if (!transcriptionResponse.ok) {
            throw new Error(`Transcription error! status: ${transcriptionResponse.status}`);
        }

        const transcriptionData = await transcriptionResponse.json();
        document.getElementById('loading').classList.add('hidden');
        document.getElementById('transcription').innerText = JSON.stringify(transcriptionData, null, 2);

    } catch (error) {
        document.getElementById('loading').classList.add('hidden');
        document.getElementById('error').classList.remove('hidden');
        document.getElementById('error').innerText = `Error: ${error.message}`;
    }
}

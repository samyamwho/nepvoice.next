const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

async function sendAudioForASR(audioFilePath) {
  try {
    // Check if file exists
    if (!fs.existsSync(audioFilePath)) {
      throw new Error(`Audio file not found: ${audioFilePath}`);
    }

    console.log(`Processing audio file: ${audioFilePath}`);
    console.log(`File size: ${fs.statSync(audioFilePath).size} bytes`);

    // Create form data
    const form = new FormData();
    form.append('audio_file', fs.createReadStream(audioFilePath), {
      filename: path.basename(audioFilePath),
      contentType: 'audio/wav'
    });

    console.log('Sending request to ASR API...');

    // Make the request using axios
    const response = await axios.post(
      'https://demo.wiseyak.com/feature/asr?lang=english',
      form,
      {
        headers: {
          'accept': 'application/json',
          ...form.getHeaders()
        }
      }
    );

    console.log(`Response status: ${response.status} ${response.statusText}`);
    return response.data;

  } catch (error) {
    if (error.response) {
      console.error(`HTTP error! status: ${error.response.status}, message: ${error.response.data}`);
    } else {
      console.error('Error making ASR request:', error.message);
    }
    throw error;
  }
}

// Function to find audio files in current directory
function findAudioFiles() {
  const audioExtensions = ['.wav', '.mp3', '.m4a', '.flac', '.ogg'];
  const files = fs.readdirSync('.');
  return files.filter(file => {
    const ext = path.extname(file).toLowerCase();
    return audioExtensions.includes(ext);
  });
}

async function main() {
  try {
    const audioFilePath = "C:\\Users\\pashw\\Downloads\\short_test.mp3"; // Change this to your specific file name

    console.log(`\n=== Starting ASR Processing ===`);
    const result = await sendAudioForASR(audioFilePath);
    
    console.log('\n=== ASR Result ===');
    console.log(JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('\n=== Error ===');
    console.error('Failed to process audio:', error.message);
  }
}

// Run the script
console.log('ASR Audio Processing Script (Axios Version)');
console.log('Current directory:', process.cwd());
main();
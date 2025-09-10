import axios from 'axios';

const RUNPOD_API_KEY = process.env.RUNPOD_API_KEY;
const ENDPOINT_ID = 'your-endpoint-id';

const inputFileURL = 'https://your-bucket/input/conversation.json';

const response = await axios.post(
  `https://api.runpod.io/v2/${ENDPOINT_ID}/run`,
  {
    input: {
      fileURL: inputFileURL,
    },
  },
  {
    headers: {
      Authorization: `Bearer ${RUNPOD_API_KEY}`,
    },
  }
);

console.log('Job submitted:', response.data);

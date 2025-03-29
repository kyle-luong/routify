import axios from 'axios';

const BASE_URL = 'http://localhost:8000/api'; // backend(Django) server

export const parseSchedule = async (file, universityName) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('university', universityName);

  try {
    const response = await axios.post(`${BASE_URL}/parse-ics/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to upload ICS file:', error);
    throw error;
  }
};

const axios = require('axios');
const fs = require('fs/promises'); // Using the promises version for async/await

const DATA_FILE_PATH = 'data.json';

async function removeInvalidLinks() {
  try {
    // Read the data from the JSON file
    const rawData = await fs.readFile(DATA_FILE_PATH, 'utf-8');
    const dataArray = JSON.parse(rawData);

    for (let i = 0; i < dataArray.length; i++) {
      const data = dataArray[i];
      const slide = data.slide;

      for (const key in slide) {
        const link = slide[key][0]; // Assuming the link is always at index 0

        // Check if the link is valid
        const isValid = await isLinkValid(link);

        // If the link is not valid (returns 404), remove the entry from the slide object
        if (!isValid) {
          console.log(`Removing invalid link at key ${key} in object ${i}: ${link}`);
          delete slide[key];
        }
      }

      console.log(`Invalid links removed in object ${i}:`, slide);
    }

    // Write the updated data back to the JSON file
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(dataArray, null, 2));

    console.log('All objects processed.');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

async function isLinkValid(link) {
  try {
    // Make a HEAD request to check if the link returns a 2xx status
    const response = await axios.head(link);
    return response.status >= 200 && response.status < 300;
  } catch (error) {
    // If there's an error (e.g., 404), consider the link invalid
    return false;
  }
}

// Run the script
removeInvalidLinks();

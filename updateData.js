const fs = require('fs');
const axios = require('axios');

// Read the data.json file
const dataPath = 'data.json';

fs.readFile(dataPath, 'utf8', async (err, data) => {
  if (err) {
    console.error('Error reading data.json:', err);
    return;
  }

  try {
    const jsonData = JSON.parse(data);

    // Function to check if a link is valid
    const isLinkValid = async (link) => {
      try {
        const response = await axios.head(link);
        return response.status === 200;
      } catch (error) {
        return false;
      }
    };

    // Function to filter out invalid links
    const filterValidLinks = async (slides) => {
      const validSlides = [];

      for (const slide of slides) {
        const [id, link] = slide;
        if (await isLinkValid(link)) {
          validSlides.push([id, link]);
        } else {
          console.log(`Removing invalid link: ${link}`);
        }
      }

      return validSlides;
    };

    // Update the data with valid links
    const updatedData = jsonData.map(item => {
      if (item.slides && Array.isArray(item.slides)) {
        const validSlides = filterValidLinks(item.slides);
        return { ...item, slides: validSlides };
      }
      return item;
    });

    // Write the updated data back to data.json
    fs.writeFile(dataPath, JSON.stringify(updatedData, null, 2), 'utf8', (writeErr) => {
      if (writeErr) {
        console.error('Error writing to data.json:', writeErr);
      } else {
        console.log('Data.json updated successfully.');
      }
    });
  } catch (parseError) {
    console.error('Error parsing data.json:', parseError);
  }
});

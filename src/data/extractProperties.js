const fs = require('fs');
const path = require('path');

// Path to the sig.json file
const filePath = path.join(__dirname, 'src/assets/sig.json');

// Function to extract properties from the GeoJSON file
async function extractProperties() {
  try {
    // Read the file as a string
    const data = await fs.promises.readFile(filePath, 'utf8');
    
    // Parse the data as JSON
    const geoJSON = JSON.parse(data);
    
    // Extract properties from each feature
    const properties = geoJSON.features.map(feature => feature.properties);
    
    // Save the properties to a new file
    await fs.promises.writeFile(
      path.join(__dirname, 'extracted_properties.json'), 
      JSON.stringify(properties, null, 2)
    );
    
    console.log(`Extracted ${properties.length} property objects`);
    console.log('Sample of extracted properties:');
    console.log(JSON.stringify(properties.slice(0, 3), null, 2));
    
    return properties;
  } catch (error) {
    console.error('Error processing the file:', error);
  }
}

// Run the extraction
extractProperties(); 
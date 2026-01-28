const { favicons } = require('favicons');
const fs = require('fs').promises;
const path = require('path');

const source = 'src/assets/favicon.svg';
const configuration = {
  path: '/',
  appName: 'Wunero',
  appShortName: 'Wunero',
  appDescription: 'Wishlist management application',
  developerName: null,
  background: '#fff',
  theme_color: '#000',
  icons: {
    android: true,
    appleIcon: true,
    appleStartup: false,
    favicons: true,
    windows: true,
    yandex: false,
    source: true
  }
};

(async () => {
  try {
    console.log('Generating favicons from', source);
    const response = await favicons(source, configuration);
    
    // Write images
    await Promise.all(response.images.map(async (image) => {
      const outputPath = path.join('public', image.name);
      await fs.writeFile(outputPath, image.contents);
      console.log('✓ Created', image.name);
    }));
    
    // Write files (manifest, browserconfig, etc.)
    await Promise.all(response.files.map(async (file) => {
      const outputPath = path.join('public', file.name);
      await fs.writeFile(outputPath, file.contents);
      console.log('✓ Created', file.name);
    }));
    
    // Write HTML tags to a file for reference
    await fs.writeFile('favicon-tags.html', response.html.join('\n'));
    console.log('✓ Created favicon-tags.html (reference for HTML <head> tags)');
    
    console.log('\n✓ Favicons generated successfully!');
    console.log('\nNext steps:');
    console.log('1. Check favicon-tags.html for HTML tags to add to your layout');
    console.log('2. Review the generated files in the public/ folder');
  } catch (error) {
    console.error('Error generating favicons:', error);
    process.exit(1);
  }
})();

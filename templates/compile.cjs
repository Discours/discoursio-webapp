const fs = require('fs');
const path = require('path');

const components = ['email_confirmation', 'first_publication', 'new_comment', 'password_reset'];
const template = fs.readFileSync("templates/main.html", "utf-8");
const outputDir = 'templates/dist';

// Generate HTML files for each template
components.forEach(component => {
  const filePath = path.join(outputDir, `authorizer_${component}.html`);

  // Read the component file
  const componentContent = fs.readFileSync(`templates/entries/${component}.html`, 'utf-8');

  // Replace placeholder with compiled component code
  const htmlContent = template.replace('<tbody id="#app"></tbody>', componentContent);


  // Write formatted HTML file to disk
  fs.writeFileSync(filePath, htmlContent);
  console.log(`${filePath} was generated successfully`);
});

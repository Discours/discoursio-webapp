const fs = require('fs');
const path = require('path');

const currentDir = process.cwd();
const templatePath = path.join(currentDir, 'templates', 'main.html');
const outputDir = path.join(currentDir, 'templates', 'dist');
const componentsDir = path.join(currentDir, 'templates', 'entries');

const components = ['email_confirmation', 'first_publication', 'new_comment', 'password_reset'];

try {
  // Read the template file
  const template = fs.readFileSync(templatePath, 'utf-8');

  // Generate HTML files for each template
  components.forEach(component => {
    const filePath = path.join(outputDir, `authorizer_${component}.html`);
    const componentFilePath = path.join(componentsDir, `${component}.html`);

    try {
      // Read the component file
      const componentContent = fs.readFileSync(componentFilePath, 'utf-8');

      // Replace placeholder with compiled component code
      const htmlContent = template.replace('<tbody id="#app"></tbody>', componentContent);

      // Write formatted HTML file to disk
      fs.writeFileSync(filePath, htmlContent);
      console.log(`${filePath} was generated successfully`);
    } catch (error) {
      console.error(`Error reading component file ${componentFilePath}:`, error);
    }
  });
} catch (error) {
  console.error(`Error reading template file ${templatePath}:`, error);
}

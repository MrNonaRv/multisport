const fs = require('fs');

function updateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // For the Match Report
  content = content.replace(/padding: 40px;/g, 'padding: 24px;');
  content = content.replace(/border-radius: 16px;/g, 'border-radius: 12px;');
  content = content.replace(/margin-bottom: 30px;/g, 'margin-bottom: 20px;');
  content = content.replace(/padding-bottom: 20px;/g, 'padding-bottom: 16px;');
  content = content.replace(/font-size: 28px;/g, 'font-size: 22px;');
  content = content.replace(/font-size: 16px;/g, 'font-size: 13px;');
  
  // Teams section
  content = content.replace(/background: #f8fafc; padding: 20px;/g, 'background: #f8fafc; padding: 12px;');
  content = content.replace(/font-size: 20px; font-weight: 800;/g, 'font-size: 16px; font-weight: 800;');
  content = content.replace(/font-size: 48px; font-weight: 900;/g, 'font-size: 32px; font-weight: 900;');
  content = content.replace(/font-size: 24px; font-weight: 900; color: #94a3b8; padding: 0 20px;/g, 'font-size: 18px; font-weight: 900; color: #94a3b8; padding: 0 16px;');

  // Table padding and font sizes in Match Report
  content = content.replace(/<td style="padding: 10px; font-weight: 700; font-size: 14px;">/g, '<td style="padding: 6px 8px; font-weight: 700; font-size: 12px;">');
  content = content.replace(/<th style="padding: 12px; font-size: 12px;/g, '<th style="padding: 8px; font-size: 10px;');
  content = content.replace(/<td style="padding: 10px; text-align: center; font-weight: 700;">/g, '<td style="padding: 6px 8px; text-align: center; font-weight: 700; font-size: 12px;">');
  
  // For the MVP Report
  content = content.replace(/<h1 style="margin: 0; font-size: 32px;/g, '<h1 style="margin: 0; font-size: 22px;');
  content = content.replace(/<p style="margin: 8px 0 0; font-size: 18px;/g, '<p style="margin: 8px 0 0; font-size: 13px;');
  content = content.replace(/width: 120px; height: 120px;/g, 'width: 80px; height: 80px;');
  content = content.replace(/justify-content: center; font-size: 48px;/g, 'justify-content: center; font-size: 32px;');
  content = content.replace(/<h2 style="margin: 0; font-size: 36px;/g, '<h2 style="margin: 0; font-size: 24px;');
  // Also fix font-size: 20px; font-weight: 700; for MVP Team
  content = content.replace(/<p style="margin: 8px 0 0; font-size: 20px;/g, '<p style="margin: 4px 0 0; font-size: 14px;');
  
  content = content.replace(/<h3 style="font-size: 20px;/g, '<h3 style="font-size: 16px;');
  content = content.replace(/padding: 12px;/g, 'padding: 8px;');
  content = content.replace(/margin-top: 60px;/g, 'margin-top: 30px;');
  
  fs.writeFileSync(filePath, content);
}

updateFile('src/pages/SportPage.tsx');
updateFile('src/pages/Dashboard.tsx');
console.log("Done");

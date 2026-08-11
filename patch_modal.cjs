const fs = require('fs');
const content = fs.readFileSync('src/components/LiveMatchControlModal.tsx', 'utf8');

const lines = content.split('\n');

const startIndex = lines.findIndex(l => l.includes('const [period, setPeriod] = useState'));
const endIndex = lines.findIndex(l => l.includes('}, [match.clock_status, match.last_clock_update, match.remaining_seconds]);'));

if (startIndex !== -1 && endIndex !== -1) {
  const hookLines = lines.splice(startIndex, endIndex - startIndex + 1);
  
  // replace match. with match?. in hookLines
  const safeHookLines = hookLines.map(l => l
    .replace(/match\.current_period/g, 'match?.current_period')
    .replace(/match\.remaining_time/g, 'match?.remaining_time')
    .replace(/match\.clock_status/g, 'match?.clock_status')
    .replace(/match\.last_clock_update/g, 'match?.last_clock_update')
    .replace(/match\.remaining_seconds/g, 'match?.remaining_seconds')
  );

  const insertIndex = lines.findIndex(l => l.includes('const match = db.matches.find'));
  
  lines.splice(insertIndex + 1, 0, ...safeHookLines);
  
  fs.writeFileSync('src/components/LiveMatchControlModal.tsx', lines.join('\n'), 'utf8');
  console.log('patched LiveMatchControlModal');
} else {
  console.log('could not find hook lines');
}

export function printHtml(htmlContent: string, title: string = "Print Report") {
  const originalTitle = document.title;
  document.title = title;

  // 1. Create or get the print container
  let printContainer = document.getElementById('print-container');
  if (!printContainer) {
    printContainer = document.createElement('div');
    printContainer.id = 'print-container';
    document.body.appendChild(printContainer);
  }

  // 2. Add print-specific styles
  let styleEl = document.getElementById('print-style');
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'print-style';
    styleEl.innerHTML = `
      @media screen {
        #print-container { display: none; }
      }
      @media print {
        body > *:not(#print-container):not(style):not(script) {
          display: none !important;
        }
        #print-container {
          display: block !important;
          background: white;
          color: black;
          width: 100%;
          margin: 0;
          padding: 0;
        }
        @page { margin: 1cm; }
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
      }
    `;
    document.head.appendChild(styleEl);
  }

  // 3. Inject the HTML
  printContainer.innerHTML = `
    <div style="font-family: 'Inter', system-ui, sans-serif;">
      ${htmlContent}
    </div>
  `;

  // 4. Trigger print after a brief delay to ensure styles and DOM apply
  setTimeout(() => {
    window.print();
    
    // Clean up content and title after print dialog closes
    setTimeout(() => {
      document.title = originalTitle;
      if (printContainer) printContainer.innerHTML = '';
    }, 1000);
  }, 250);
}


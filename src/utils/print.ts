export function printHtml(htmlContent: string, title: string = "Print Report") {
  // Try to open a new window for printing (best for mobile and responsive)
  const printWindow = window.open('', '_blank');
  
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { 
              font-family: 'Inter', system-ui, -apple-system, sans-serif; 
              padding: 40px; 
              margin: 0;
              color: #0f172a; 
              background: white;
              line-height: 1.5;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            @media print { 
              body { padding: 0; margin: 0; }
              @page { margin: 1cm; }
            }
            * { box-sizing: border-box; }
            img { max-width: 100%; height: auto; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 1rem; }
            th, td { border: 1px solid #e2e8f0; padding: 12px; text-align: left; }
            th { background-color: #f8fafc; font-weight: 600; }
            
            /* Responsive container */
            .print-wrapper { width: 100%; max-width: 100%; overflow-x: hidden; }
            @media (max-width: 600px) {
              body { padding: 20px; }
            }
          </style>
        </head>
        <body>
          <div class="print-wrapper">
            ${htmlContent}
          </div>
          <script>
            // Execute print once the page is fully loaded
            window.onload = function() {
              setTimeout(function() {
                window.print();
                setTimeout(function() { window.close(); }, 500);
              }, 250);
            };
            
            // Fallback in case onload doesn't fire
            setTimeout(function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            }, 2000);
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  } else {
    // Fallback if popup blocker is active
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);
    
    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${title}</title>
            <style>
              body { 
                font-family: 'Inter', system-ui, -apple-system, sans-serif; 
                padding: 40px; 
                color: #0f172a; 
                background: white;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              @media print { 
                body { padding: 0; margin: 0; }
                @page { margin: 1cm; }
              }
              * { box-sizing: border-box; }
              table { width: 100%; border-collapse: collapse; }
              th, td { border: 1px solid #e2e8f0; padding: 8px; text-align: left; }
              th { background-color: #f8fafc; }
            </style>
          </head>
          <body>
            ${htmlContent}
          </body>
        </html>
      `);
      doc.close();
      
      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch (e) {
          console.error("Iframe print failed", e);
        }
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 1000);
      }, 500);
    }
  }
}


export function printHtml(htmlContent: string, title: string = "Print Report") {
  // Remove any existing print iframe if present
  const existing = document.getElementById('print-report-iframe');
  if (existing) {
    document.body.removeChild(existing);
  }

  const iframe = document.createElement('iframe');
  iframe.id = 'print-report-iframe';
  iframe.style.position = 'fixed';
  iframe.style.top = '0';
  iframe.style.left = '0';
  iframe.style.width = '100vw';
  iframe.style.height = '100vh';
  iframe.style.zIndex = '999999';
  iframe.style.border = '0';
  iframe.style.background = 'white';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (doc) {
    doc.open();
    doc.write(`
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
              .no-print { display: none !important; }
            }
            * { box-sizing: border-box; }
            img { max-width: 100%; height: auto; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 1rem; }
            th, td { border: 1px solid #e2e8f0; padding: 12px; text-align: left; }
            th { background-color: #f8fafc; font-weight: 600; }
            .print-header {
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              background: #0f172a;
              color: white;
              padding: 12px 24px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              box-shadow: 0 4px 12px rgba(0,0,0,0.15);
              z-index: 1000;
            }
            .print-btn {
              background: #38bdf8;
              color: #0f172a;
              border: none;
              padding: 8px 16px;
              border-radius: 6px;
              font-weight: 800;
              cursor: pointer;
            }
            .close-btn {
              background: rgba(239,68,68,0.2);
              color: #ef4444;
              border: none;
              padding: 8px 16px;
              border-radius: 6px;
              font-weight: 800;
              cursor: pointer;
            }
            @media print {
              .print-header { display: none; }
              body { padding-top: 0; }
            }
          </style>
        </head>
        <body>
          <div class="print-header no-print">
            <span style="font-weight: 800; font-size: 14px;">🖨️ ${title}</span>
            <div style="display: flex; gap: 12px;">
              <button class="print-btn" onclick="window.print()">Print Now</button>
              <button class="close-btn" onclick="window.parent.postMessage('CLOSE_PRINT_IFRAME', '*')">Close</button>
            </div>
          </div>
          <div style="margin-top: 60px;">
            ${htmlContent}
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 500);
            };
          </script>
        </body>
      </html>
    `);
    doc.close();

    const handleMessage = (event: MessageEvent) => {
      if (event.data === 'CLOSE_PRINT_IFRAME') {
        const el = document.getElementById('print-report-iframe');
        if (el && document.body.contains(el)) {
          document.body.removeChild(el);
        }
        window.removeEventListener('message', handleMessage);
      }
    };
    window.addEventListener('message', handleMessage);
  }
}

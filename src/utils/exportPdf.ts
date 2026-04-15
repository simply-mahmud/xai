import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export async function downloadChatAsPdf(chatWindowId: string) {
  const element = document.getElementById(chatWindowId);
  if (!element) {
    console.error(`Element with id ${chatWindowId} not found`);
    return;
  }

  // Temporarily style for PDF rendering (remove scrollbars, set background)
  const originalStyle = element.style.cssText;
  element.style.height = 'auto';
  element.style.overflow = 'visible';
  element.style.backgroundColor = '#f8fafc'; // light mode background for standard paper readability

  try {
    const canvas = await html2canvas(element, {
      scale: 2, // Higher resolution
      useCORS: true,
      logging: false,
      backgroundColor: '#f8fafc',
      windowHeight: element.scrollHeight
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    let heightLeft = pdfHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
    heightLeft -= pdf.internal.pageSize.getHeight();

    // Handle pagination if chat is very long
    while (heightLeft > 0) {
      position = heightLeft - pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pdf.internal.pageSize.getHeight();
    }

    const dateStr = new Date().toISOString().split('T')[0];
    pdf.save(`xAI-Chat-Log-${dateStr}.pdf`);
  } catch (error) {
    console.error('Failed to export PDF:', error);
  } finally {
    // Restore original styles
    element.style.cssText = originalStyle;
  }
}

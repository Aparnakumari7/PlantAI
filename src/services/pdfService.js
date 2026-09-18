import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generatePlantReport = (result, lang = 'en') => {
  try {
    console.log('PDF Service - Starting generation');
    console.log('PDF Service - Result:', result);
    console.log('PDF Service - Language:', lang);
    
    if (!result) {
      throw new Error('No result data provided');
    }

    const isHindi = lang === 'hi';
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let currY = 20;

    // Helper for text alignment and wrapping
    const addTitle = (text, size = 18, color = [16, 185, 129]) => {
      try {
        doc.setFontSize(size);
        doc.setTextColor(color[0], color[1], color[2]);
        doc.setFont('helvetica', 'bold');
        doc.text(String(text || ''), margin, currY);
        currY += size / 2 + 5;
      } catch (e) {
        console.error('Error in addTitle:', e);
        throw e;
      }
    };

    const addHeader = (text, size = 12) => {
      try {
        doc.setFontSize(size);
        doc.setTextColor(100, 100, 100);
        doc.setFont('helvetica', 'bold');
        doc.text(String(text || '').toUpperCase(), margin, currY);
        currY += 8;
      } catch (e) {
        console.error('Error in addHeader:', e);
        throw e;
      }
    };

    const addBodyText = (text, size = 10) => {
      try {
        doc.setFontSize(size);
        doc.setTextColor(60, 60, 60);
        doc.setFont('helvetica', 'normal');
        const lines = doc.splitTextToSize(String(text || ''), pageWidth - margin * 2);
        doc.text(lines, margin, currY);
        currY += lines.length * 5 + 5;
      } catch (e) {
        console.error('Error in addBodyText:', e);
        throw e;
      }
    };

    const addSectionTable = (title, items, color) => {
      try {
        if (!items) {
          console.log(`Skipping section ${title} - no items`);
          return;
        }
        
        // Ensure items is an array
        let itemsArray = [];
        if (Array.isArray(items)) {
          itemsArray = items;
        } else if (typeof items === 'object') {
          // Handle object (like smartTimeline)
          itemsArray = Object.entries(items).map(([key, value]) => `${key}: ${value}`);
        } else {
          itemsArray = [String(items)];
        }
        
        if (itemsArray.length === 0) {
          console.log(`Skipping section ${title} - empty array`);
          return;
        }
        
        if (currY > 240) {
          doc.addPage();
          currY = 20;
        }

        addHeader(title);
        
        const tableData = itemsArray.map((item, index) => {
          // Convert item to string if it's not already
          const itemText = typeof item === 'string' ? item : String(item);
          return [
            index + 1,
            itemText.replace(/\*\*/g, '') // Remove markdown bolding for PDF
          ];
        });

        doc.autoTable({
          startY: currY - 2,
          head: [],
          body: tableData,
          theme: 'plain',
          styles: { fontSize: 9, cellPadding: 2 },
          columnStyles: {
            0: { cellWidth: 10, fontStyle: 'bold', textColor: color },
            1: { cellWidth: pageWidth - margin * 2 - 10 }
          },
          margin: { left: margin },
          didDrawPage: (data) => {
            currY = data.cursor.y + 10;
          }
        });

        currY = doc.lastAutoTable.finalY + 10;
      } catch (e) {
        console.error(`Error in addSectionTable for ${title}:`, e);
        console.error('Items:', items);
        // Don't throw, just skip this section
      }
    };

    // 1. Report Header
    console.log('PDF Service - Adding header');
    doc.setFillColor(16, 185, 129); // Primary Color
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('PlantAI Analysis Report', margin, 25);
    
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth - margin - 50, 25);
    
    currY = 55;

    // 2. Identification Details
    console.log('PDF Service - Adding identification');
    const statusLabel = result.isHealthy ? (isHindi ? 'स्वस्थ' : 'HEALTHY') : (isHindi ? 'बीमार' : 'DISEASED');
    const statusColor = result.isHealthy ? [16, 185, 129] : [239, 68, 68];
    
    addTitle(result.plantIdentified || 'Unknown Plant', 22, [31, 41, 55]);
    
    doc.setFontSize(14);
    doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
    doc.text(`${statusLabel} - ${result.confidence || '95%'}`, margin, currY);
    currY += 12;

    if (!result.isHealthy && result.diseaseName) {
      addTitle(result.diseaseName, 16, statusColor);
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text(`Severity: ${(result.severity || 'MEDIUM').toUpperCase()}`, margin, currY);
      currY += 10;
    }

    // Divider
    doc.setDrawColor(230, 230, 230);
    doc.line(margin, currY, pageWidth - margin, currY);
    currY += 10;

    // 3. Description
    console.log('PDF Service - Adding description');
    addHeader(isHindi ? 'विश्लेषण विवरण' : 'Analysis Description');
    addBodyText(result.description || 'No description provided.');

    // 4. End of main content - PDF will only contain diagnosis information

    // 5. Footer / Disclaimer
    console.log('PDF Service - Adding footer');
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      const disclaimer = isHindi 
        ? 'अस्वीकरण: यह एआई-जनित रिपोर्ट केवल सूचनात्मक उद्देश्यों के लिए है। कृपया किसी विशेषज्ञ से परामर्श करें।'
        : 'Disclaimer: This AI-generated report is for informational purposes only. Consult an agricultural expert for critical decisions.';
      doc.text(disclaimer, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
    }

    // Save the PDF
    console.log('PDF Service - Saving PDF');
    const fileName = `Plant_Report_${(result.plantIdentified || 'Unknown').replace(/\s+/g, '_')}.pdf`;
    doc.save(fileName);
    
    console.log('PDF Service - PDF saved successfully');
    return true;
  } catch (error) {
    console.error('PDF Generation Error:', error);
    console.error('Error stack:', error.stack);
    throw error;
  }
};

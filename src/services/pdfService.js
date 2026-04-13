import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generatePlantReport = (result, lang = 'en') => {
  try {
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
      doc.setFontSize(size);
      doc.setTextColor(color[0], color[1], color[2]);
      doc.setFont('helvetica', 'bold');
      doc.text(text, margin, currY);
      currY += size / 2 + 5;
    };

    const addHeader = (text, size = 12) => {
      doc.setFontSize(size);
      doc.setTextColor(100, 100, 100);
      doc.setFont('helvetica', 'bold');
      doc.text(text.toUpperCase(), margin, currY);
      currY += 8;
    };

    const addBodyText = (text, size = 10) => {
      doc.setFontSize(size);
      doc.setTextColor(60, 60, 60);
      doc.setFont('helvetica', 'normal');
      const lines = doc.splitTextToSize(text, pageWidth - margin * 2);
      doc.text(lines, margin, currY);
      currY += lines.length * 5 + 5;
    };

    const addSectionTable = (title, items, color) => {
      if (!items || items.length === 0) return;
      
      if (currY > 240) {
        doc.addPage();
        currY = 20;
      }

      addHeader(title);
      
      const tableData = items.map((item, index) => [
        index + 1,
        item.replace(/\*\*/g, '') // Remove markdown bolding for PDF
      ]);

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
    };

    // 1. Report Header
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
    const statusLabel = result.isHealthy ? (isHindi ? 'स्वस्थ' : 'HEALTHY') : (isHindi ? 'बीमार' : 'DISEASED');
    const statusColor = result.isHealthy ? [16, 185, 129] : [239, 68, 68];
    
    addTitle(result.plantIdentified || 'Unknown Plant', 22, [31, 41, 55]);
    
    doc.setFontSize(14);
    doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
    doc.text(`${statusLabel} - ${result.confidence || '95%'} Confidence`, margin, currY);
    currY += 12;

    if (!result.isHealthy && result.diseaseName) {
      addTitle(result.diseaseName, 16, statusColor);
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text(`Severity: ${result.severity?.toUpperCase() || 'MEDIUM'}`, margin, currY);
      currY += 10;
    }

    // Divider
    doc.setDrawColor(230, 230, 230);
    doc.line(margin, currY, pageWidth - margin, currY);
    currY += 10;

    // 3. Description
    addHeader(isHindi ? 'विश्लेषण विवरण' : 'Analysis Description');
    addBodyText(result.description || 'No description provided.');

    // 4. Detailed Sections
    if (result.causes && result.causes.length > 0) {
      addSectionTable(isHindi ? 'संभावित कारण' : 'Potential Causes', result.causes, [245, 158, 11]);
    }

    if (result.homeRemedies && result.homeRemedies.length > 0) {
      addSectionTable(isHindi ? 'घरेलू और जैविक उपाय' : 'Home & Organic Remedies', result.homeRemedies, [16, 185, 129]);
    }

    if (result.chemicalTreatments && result.chemicalTreatments.length > 0) {
      addSectionTable(isHindi ? 'रासायनिक उपचार' : 'Chemical Treatments', result.chemicalTreatments, [139, 92, 246]);
    }

    if (result.prevention && result.prevention.length > 0) {
      addSectionTable(isHindi ? 'रोकथाम और देखभाल' : 'Prevention & Care', result.prevention, [20, 184, 166]);
    }

    // 5. Footer / Disclaimer
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
    const fileName = `Plant_Report_${(result.plantIdentified || 'Unknown').replace(/\s+/g, '_')}.pdf`;
    doc.save(fileName);
    
    return true;
  } catch (error) {
    console.error('PDF Generation Error:', error);
    throw error;
  }
};

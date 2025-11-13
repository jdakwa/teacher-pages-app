import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface GeneratePDFOptions {
    elementId: string;
    filename?: string;
    orientation?: 'portrait' | 'landscape';
    format?: 'a3' | 'a4' | 'a5' | 'letter' | 'legal';
}

/**
 * Generate a PDF from an HTML element using html2canvas and jsPDF
 * @param elementId - The ID of the HTML element to convert to PDF
 * @param filename - Optional filename for the PDF
 * @returns Promise<Blob> - The generated PDF as a Blob
 */
export async function generatePDFFromHTML(
    elementId: string,
    filename?: string
): Promise<Blob> {
    const element = document.getElementById(elementId);

    if (!element) {
        throw new Error(`Element with ID "${elementId}" not found`);
    }

    try {
        const pages = element.querySelectorAll('[data-page]') as NodeListOf<HTMLElement>;

        if (pages.length === 0) {
            throw new Error('No pages found in worksheet');
        }

        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        for (let i = 0; i < pages.length; i++) {
            const pageElement = pages[i];

            const canvas = await html2canvas(pageElement, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                windowWidth: pageElement.scrollWidth,
                windowHeight: pageElement.scrollHeight,
            });

            const imgData = canvas.toDataURL('image/png');
            const imgWidth = pdfWidth;
            const imgHeight = (canvas.height * pdfWidth) / canvas.width;

            if (i > 0) {
                pdf.addPage();
            }

            if (imgHeight <= pdfHeight) {
                pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            } else {
                const scaledHeight = pdfHeight;
                const scaledWidth = (canvas.width * pdfHeight) / canvas.height;
                const xOffset = (pdfWidth - scaledWidth) / 2;
                pdf.addImage(imgData, 'PNG', xOffset, 0, scaledWidth, scaledHeight);
            }
        }

        const blob = pdf.output('blob');
        return blob;
    } catch (error) {
        console.error('Error generating PDF:', error);
        throw new Error('Failed to generate PDF. Please try again.');
    }
}

/**
 * Generate and download PDF from HTML element
 * @param elementId - The ID of the HTML element to convert to PDF
 * @param filename - The filename for the downloaded PDF
 */
export async function downloadPDFFromHTML(
    elementId: string,
    filename: string = 'worksheet.pdf'
): Promise<void> {
    const blob = await generatePDFFromHTML(elementId, filename);

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}


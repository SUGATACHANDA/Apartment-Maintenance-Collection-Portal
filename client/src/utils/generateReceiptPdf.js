import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export default async function generateReceiptPdf(transaction) {
    function getMonthName(dateInput) {
        try {
            const date = new Date(dateInput);
            if (isNaN(date)) return 'Invalid Date';
            return date.toLocaleString('en-IN', { month: 'long', year: 'numeric' });
        } catch (err) {
            console.log(err);
            return 'Invalid Date';
        }
    }

    const billMonth = getMonthName(transaction.date);
    const doc = new jsPDF({ unit: 'pt', format: 'a4', orientation: 'landscape' });

    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 40;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('ADYA MANDIR APARTMENT SOCIETY', pageWidth / 2, y, { align: 'center' });

    y += 25;
    doc.setFontSize(12);
    doc.text(`Transaction Receipt for the month of ${billMonth}`, pageWidth / 2, y, { align: 'center' });

    y += 30;

    const tableBody = [
        ['Transaction ID', transaction.transactionId || ''],
        ['Date', new Date(transaction.date).toLocaleString('en-IN')],
        ['Payment Gateway', 'RAZORPAY'],
        ['Consumer ID', transaction.consumerId || ''],
        ['Email', transaction.email || ''],
        ['Invoice No. / Application No.', transaction.transactionId],
        ['Bill Paid For', billMonth],
        ['Payment Mode', 'E-Payment'],
        ['Received Amount (INR)', `INR ${transaction.amount}`],
    ];

    autoTable(doc, {
        startY: y,
        head: [['Details', 'Information']],
        body: tableBody,
        styles: {
            halign: 'center',
            valign: 'middle',
            fontSize: 10,
        },
        headStyles: {
            fillColor: [60, 141, 188],
            textColor: 255,
        },
        margin: { left: 50, right: 50 },
        tableWidth: 'auto',
    });

    // Signature & label
    const signatureImageUrl = '/signature.png'; // must be in public folder
    const signatureImage = await fetch(signatureImageUrl)
        .then(res => res.blob())
        .then(blob => {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.readAsDataURL(blob);
            });
        });

    const signatureWidth = 100;
    const signatureHeight = 40;
    const imageY = doc.lastAutoTable.finalY + 40;
    const rightX = pageWidth - 80 - signatureWidth; // right-aligned with 80px margin

    doc.addImage(signatureImage, 'PNG', rightX, imageY, signatureWidth, signatureHeight);

    doc.setFontSize(9);
    doc.setTextColor(120); // grey
    doc.setFont('helvetica', 'normal');
    doc.text('Authorized Signatory', rightX + signatureWidth / 2, imageY + signatureHeight + 12, {
        align: 'center',
    });

    // Disclaimer centered
    doc.setFontSize(9);
    doc.setTextColor(0);
    doc.text(
        '* This is an electronically generated receipt. No signature is required. For any discrepancies, please contact support within 7 days.',
        pageWidth / 2,
        imageY + signatureHeight + 40,
        { align: 'center' }
    );

    doc.save(`Receipt_${transaction.transactionId}.pdf`);
}

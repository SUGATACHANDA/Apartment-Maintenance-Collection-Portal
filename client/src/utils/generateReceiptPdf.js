import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function generateReceiptPdf(transaction) {
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
    // Use unit: 'pt' for precise height calculation
    const doc = new jsPDF({ unit: 'pt', format: 'a4', orientation: "landscape" });

    const pageWidth = doc.internal.pageSize.getWidth();
    const centerX = pageWidth / 2;
    let y = 40;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('ADYA MANDIR APARTMENT SOCIETY', centerX, y, { align: 'center' });

    y += 25;
    doc.setFontSize(12);
    doc.text(`Transaction Receipt for the month of ${billMonth}`, centerX, y, { align: 'center' });

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

    const finalY = doc.lastAutoTable.finalY + 30;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(
        '* This is an electronically generated receipt. No signature is required. For any discrepancies, please contact support within 7 days.',
        centerX,
        finalY,
        { align: 'center' }
    );

    doc.save(`Receipt_${transaction.transactionId}.pdf`);
}

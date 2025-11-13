import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { Invoice } from '@/types/accounting';
import { formatCurrency, formatDate, formatTime, formatDuration, invoiceTranslations } from '@/lib/invoice-utils';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#2563eb',
  },
  logo: {
    width: 120,
    height: 60,
    objectFit: 'contain',
  },
  companyInfo: {
    textAlign: 'right',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 5,
  },
  invoiceNumber: {
    fontSize: 12,
    color: '#666',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1f2937',
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  column: {
    flex: 1,
  },
  label: {
    fontSize: 9,
    color: '#6b7280',
    marginBottom: 3,
  },
  value: {
    fontSize: 10,
    color: '#111827',
    fontWeight: 'bold',
  },
  table: {
    marginTop: 20,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    padding: 8,
    fontWeight: 'bold',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tableCol1: {
    flex: 3,
  },
  tableCol2: {
    flex: 1,
    textAlign: 'right',
  },
  totalsSection: {
    marginTop: 20,
    alignItems: 'flex-end',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 250,
    paddingVertical: 5,
  },
  totalLabel: {
    fontSize: 10,
    color: '#6b7280',
  },
  totalValue: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  grandTotal: {
    borderTopWidth: 2,
    borderTopColor: '#2563eb',
    paddingTop: 8,
    marginTop: 5,
  },
  grandTotalLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  grandTotalValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  qrSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  qrCode: {
    width: 100,
    height: 100,
  },
  signatureSection: {
    marginTop: 30,
  },
  signature: {
    width: 200,
    height: 80,
    borderWidth: 1,
    borderColor: '#d1d5db',
    marginTop: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 9,
    color: '#6b7280',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  notes: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f9fafb',
    borderRadius: 4,
    fontSize: 9,
    color: '#4b5563',
  },
});

interface InvoicePDFProps {
  invoice: Invoice;
  companyName?: string;
  companyAddress?: string;
  companyPhone?: string;
  companyEmail?: string;
}

const InvoicePDF: React.FC<InvoicePDFProps> = ({ 
  invoice,
  companyName = 'Sky Walkers Paragliding',
  companyAddress = 'Ölüdeniz, Fethiye, Turkey',
  companyPhone = '+90 XXX XXX XX XX',
  companyEmail = 'info@skywalkers.com'
}) => {
  const lang = invoice.invoice_language || 'en';
  const t = invoiceTranslations[lang];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            {invoice.company_logo_url && (
              <Image src={invoice.company_logo_url} style={styles.logo} />
            )}
            <Text style={{ fontSize: 16, fontWeight: 'bold', marginTop: 10 }}>
              {companyName}
            </Text>
            <Text style={{ fontSize: 9, color: '#6b7280', marginTop: 5 }}>
              {companyAddress}
            </Text>
            <Text style={{ fontSize: 9, color: '#6b7280' }}>{companyPhone}</Text>
            <Text style={{ fontSize: 9, color: '#6b7280' }}>{companyEmail}</Text>
          </View>
          <View style={styles.companyInfo}>
            <Text style={styles.title}>{t.invoice}</Text>
            <Text style={styles.invoiceNumber}>
              {t.invoiceNumber}: {invoice.invoice_number}
            </Text>
          </View>
        </View>

        {/* Dates and Customer Info */}
        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.sectionTitle}>{t.billTo}</Text>
            <Text style={styles.value}>{invoice.customer_name}</Text>
            <Text style={{ fontSize: 9, color: '#6b7280' }}>
              {invoice.customer_email}
            </Text>
            {invoice.customer_address && (
              <Text style={{ fontSize: 9, color: '#6b7280', marginTop: 5 }}>
                {invoice.customer_address}
              </Text>
            )}
          </View>
          <View style={styles.column}>
            <View style={{ marginBottom: 10 }}>
              <Text style={styles.label}>{t.issueDate}</Text>
              <Text style={styles.value}>{formatDate(invoice.issue_date, lang)}</Text>
            </View>
            <View>
              <Text style={styles.label}>{t.dueDate}</Text>
              <Text style={styles.value}>{formatDate(invoice.due_date, lang)}</Text>
            </View>
          </View>
        </View>

        {/* Flight Details */}
        {(invoice.pilot_name || invoice.flight_date || invoice.tour_type) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t.flightDetails}</Text>
            <View style={styles.row}>
              {invoice.pilot_name && (
                <View style={styles.column}>
                  <Text style={styles.label}>{t.pilot}</Text>
                  <Text style={styles.value}>{invoice.pilot_name}</Text>
                </View>
              )}
              {invoice.flight_date && (
                <View style={styles.column}>
                  <Text style={styles.label}>{t.flightDate}</Text>
                  <Text style={styles.value}>{formatDate(invoice.flight_date, lang)}</Text>
                </View>
              )}
              {invoice.flight_time && (
                <View style={styles.column}>
                  <Text style={styles.label}>{t.flightTime}</Text>
                  <Text style={styles.value}>{formatTime(invoice.flight_time)}</Text>
                </View>
              )}
            </View>
            <View style={styles.row}>
              {invoice.tour_type && (
                <View style={styles.column}>
                  <Text style={styles.label}>{t.tourType}</Text>
                  <Text style={styles.value}>{invoice.tour_type}</Text>
                </View>
              )}
              {invoice.flight_duration_minutes && (
                <View style={styles.column}>
                  <Text style={styles.label}>{t.duration}</Text>
                  <Text style={styles.value}>
                    {formatDuration(invoice.flight_duration_minutes)}
                  </Text>
                </View>
              )}
              {invoice.payment_method_detail && (
                <View style={styles.column}>
                  <Text style={styles.label}>{t.paymentMethod}</Text>
                  <Text style={styles.value}>{invoice.payment_method_detail}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Invoice Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableCol1}>{t.description}</Text>
            <Text style={styles.tableCol2}>{t.amount}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCol1}>
              {invoice.tour_type ? `${invoice.tour_type} Paragliding Flight` : 'Paragliding Flight'}
            </Text>
            <Text style={styles.tableCol2}>
              {formatCurrency(invoice.subtotal, invoice.currency)}
            </Text>
          </View>
        </View>

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>{t.subtotal}:</Text>
            <Text style={styles.totalValue}>
              {formatCurrency(invoice.subtotal, invoice.currency)}
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>
              {t.vat} ({invoice.tax_rate}%):
            </Text>
            <Text style={styles.totalValue}>
              {formatCurrency(invoice.tax_amount, invoice.currency)}
            </Text>
          </View>
          <View style={[styles.totalRow, styles.grandTotal]}>
            <Text style={styles.grandTotalLabel}>{t.total}:</Text>
            <Text style={styles.grandTotalValue}>
              {formatCurrency(invoice.total_amount, invoice.currency)}
            </Text>
          </View>
        </View>

        {/* Notes */}
        {invoice.notes && (
          <View style={styles.notes}>
            <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>{t.notes}:</Text>
            <Text>{invoice.notes}</Text>
          </View>
        )}

        {/* QR Code and Signature */}
        <View style={styles.qrSection}>
          <View>
            {invoice.customer_signature && (
              <View style={styles.signatureSection}>
                <Text style={styles.label}>{t.customerSignature}</Text>
                <Image src={invoice.customer_signature} style={styles.signature} />
              </View>
            )}
          </View>
          <View>
            {invoice.qr_code_data && (
              <View style={{ alignItems: 'center' }}>
                <Image src={invoice.qr_code_data} style={styles.qrCode} />
                <Text style={{ fontSize: 8, color: '#6b7280', marginTop: 5 }}>
                  {t.scanToPay}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>{t.thankYou}</Text>
          <Text style={{ marginTop: 5 }}>
            {companyName} - {companyEmail}
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default InvoicePDF;

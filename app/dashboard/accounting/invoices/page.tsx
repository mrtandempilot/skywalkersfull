'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { Invoice } from '@/types/accounting';
import { pdf } from '@react-pdf/renderer';
import InvoicePDF from '@/components/InvoicePDF';
import SignatureCanvas from '@/components/SignatureCanvas';
import { generateQRCode, generatePaymentLink } from '@/lib/invoice-utils';

export default function InvoicesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [generating, setGenerating] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_address: '',
    pilot_name: '',
    flight_date: '',
    flight_time: '',
    flight_duration_minutes: 30,
    tour_type: 'Tandem' as 'Solo' | 'Tandem' | 'VIP',
    subtotal: 0,
    tax_rate: 20,
    payment_method_detail: 'Cash',
    invoice_language: 'en' as 'tr' | 'en',
    notes: '',
    due_date: '',
    status: 'draft' as 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled',
  });

  const [customerSignature, setCustomerSignature] = useState('');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const user = await getCurrentUser();
      if (!user || user.email !== 'mrtandempilot@gmail.com') {
        router.push('/login');
        return;
      }
      await fetchInvoices();
      setLoading(false);
    } catch (error) {
      router.push('/login');
    }
  };

  const fetchInvoices = async () => {
    try {
      const response = await fetch('/api/invoices');
      if (response.ok) {
        const data = await response.json();
        setInvoices(data);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
    }
  };


  const calculateTotal = () => {
    const subtotal = formData.subtotal;
    const taxAmount = (subtotal * formData.tax_rate) / 100;
    const total = subtotal + taxAmount;
    return { taxAmount, total };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);

    try {
      const { taxAmount, total } = calculateTotal();
      
      // Set due date if not set (30 days from now)
      const dueDate = formData.due_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      // Generate payment link and QR code
      const paymentLink = generatePaymentLink('TEMP', total, 'USD');
      const qrCodeData = await generateQRCode(paymentLink);

      // Create invoice
      const invoiceData = {
        ...formData,
        due_date: dueDate,
        tax_amount: taxAmount,
        total_amount: total,
        customer_signature: customerSignature,
        qr_code_data: qrCodeData,
      };

      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoiceData),
      });

      if (response.ok) {
        const invoice = await response.json();
        
        // Generate PDF
        await downloadInvoicePDF(invoice);
        
        // Refresh list and close form
        await fetchInvoices();
        setShowForm(false);
        resetForm();
        alert('Invoice created and PDF downloaded successfully!');
      } else {
        alert('Failed to create invoice');
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
      alert('Error creating invoice');
    } finally {
      setGenerating(false);
    }
  };

  const downloadInvoicePDF = async (invoice: Invoice) => {
    try {
      const blob = await pdf(<InvoicePDF invoice={invoice} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Invoice-${invoice.invoice_number}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF');
    }
  };

  const resetForm = () => {
    setFormData({
      customer_name: '',
      customer_email: '',
      customer_address: '',
      pilot_name: '',
      flight_date: '',
      flight_time: '',
      flight_duration_minutes: 30,
      tour_type: 'Tandem',
      subtotal: 0,
      tax_rate: 20,
      payment_method_detail: 'Cash',
      invoice_language: 'en',
      notes: '',
      due_date: '',
      status: 'draft',
    });
    setCustomerSignature('');
    setEditingInvoice(null);
  };

  const startEdit = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setFormData({
      customer_name: invoice.customer_name || '',
      customer_email: invoice.customer_email || '',
      customer_address: invoice.customer_address || '',
      pilot_name: invoice.pilot_name || '',
      flight_date: invoice.flight_date || '',
      flight_time: invoice.flight_time || '',
      flight_duration_minutes: invoice.flight_duration_minutes || 30,
      tour_type: invoice.tour_type as 'Solo' | 'Tandem' | 'VIP' || 'Tandem',
      subtotal: invoice.subtotal || 0,
      tax_rate: invoice.tax_rate || 20,
      payment_method_detail: invoice.payment_method_detail || 'Cash',
      invoice_language: invoice.invoice_language as 'tr' | 'en' || 'en',
      notes: invoice.notes || '',
      due_date: invoice.due_date || '',
      status: invoice.status as 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled' || 'draft',
    });
    setCustomerSignature(invoice.customer_signature || '');
    setShowForm(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInvoice) return;

    setGenerating(true);

    try {
      const { taxAmount, total } = calculateTotal();

      const updateData = {
        ...formData,
        tax_amount: taxAmount,
        total_amount: total,
        customer_signature: customerSignature,
        status: formData.status || editingInvoice.status, // Keep existing status if not changed
      };

      const response = await fetch('/api/invoices', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingInvoice.id, ...updateData }),
      });

      if (response.ok) {
        await fetchInvoices();
        setShowForm(false);
        resetForm();
        alert('Invoice updated successfully!');
      } else {
        alert('Failed to update invoice');
      }
    } catch (error) {
      console.error('Error updating invoice:', error);
      alert('Error updating invoice');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  const { taxAmount, total } = calculateTotal();

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Invoices</h1>
            <p className="mt-2 text-gray-400">Create and manage customer invoices with PDF export</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
          >
            {showForm ? 'Cancel' : '+ New Invoice'}
          </button>
        </div>

        {showForm && (
          <div className="bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-700 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">
              {editingInvoice ? 'Edit Invoice' : 'Create New Invoice'}
            </h2>
            <form onSubmit={editingInvoice ? handleEditSubmit : handleSubmit} className="space-y-6">
              {/* Customer Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.customer_name}
                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Customer Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.customer_email}
                    onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Customer Address
                </label>
                <input
                  type="text"
                  value={formData.customer_address}
                  onChange={(e) => setFormData({ ...formData, customer_address: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Flight Details */}
              <div className="border-t border-gray-700 pt-6">
                <h3 className="text-xl font-bold text-white mb-4">Flight Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Pilot Name
                    </label>
                    <input
                      type="text"
                      value={formData.pilot_name}
                      onChange={(e) => setFormData({ ...formData, pilot_name: e.target.value })}
                      placeholder="Enter pilot name (optional)"
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Tour Type *
                    </label>
                    <select
                      required
                      value={formData.tour_type}
                      onChange={(e) => setFormData({ ...formData, tour_type: e.target.value as any })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Solo">Solo</option>
                      <option value="Tandem">Tandem</option>
                      <option value="VIP">VIP</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Flight Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.flight_date}
                      onChange={(e) => setFormData({ ...formData, flight_date: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Flight Time *
                    </label>
                    <input
                      type="time"
                      required
                      value={formData.flight_time}
                      onChange={(e) => setFormData({ ...formData, flight_time: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Duration (minutes) *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.flight_duration_minutes}
                      onChange={(e) => setFormData({ ...formData, flight_duration_minutes: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Payment Method *
                    </label>
                    <select
                      required
                      value={formData.payment_method_detail}
                      onChange={(e) => setFormData({ ...formData, payment_method_detail: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Cash">Cash</option>
                      <option value="Credit Card">Credit Card</option>
                      <option value="Online Payment">Online Payment</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="border-t border-gray-700 pt-6">
                <h3 className="text-xl font-bold text-white mb-4">Pricing</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Subtotal (USD) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.subtotal}
                      onChange={(e) => setFormData({ ...formData, subtotal: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Tax Rate (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={formData.tax_rate}
                      onChange={(e) => setFormData({ ...formData, tax_rate: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Invoice Language
                    </label>
                    <select
                      value={formData.invoice_language}
                      onChange={(e) => setFormData({ ...formData, invoice_language: e.target.value as any })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="en">English</option>
                      <option value="tr">Türkçe</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="draft">Draft</option>
                      <option value="sent">Sent</option>
                      <option value="paid">Paid</option>
                      <option value="overdue">Overdue</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                {/* Calculations Display */}
                <div className="mt-4 p-4 bg-gray-700 rounded-lg">
                  <div className="flex justify-between text-gray-300">
                    <span>Subtotal:</span>
                    <span>${formData.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-300 mt-2">
                    <span>Tax ({formData.tax_rate}%):</span>
                    <span>${taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-white font-bold text-lg mt-2 pt-2 border-t border-gray-600">
                    <span>Total:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Any additional notes or terms..."
                />
              </div>

              {/* Customer Signature */}
              <div className="border-t border-gray-700 pt-6">
                <SignatureCanvas
                  onSave={(signature) => setCustomerSignature(signature)}
                  onClear={() => setCustomerSignature('')}
                  label="Customer Signature (Optional)"
                />
              </div>

              {/* Submit */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={generating}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                >
                  {generating ? 'Saving...' : (editingInvoice ? 'Update Invoice' : 'Create Invoice & Download PDF')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Invoices List */}
        <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700">
          <div className="px-6 py-4 border-b border-gray-700">
            <h2 className="text-xl font-bold text-white">All Invoices</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Invoice #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Pilot
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                      No invoices yet. Create your first invoice!
                    </td>
                  </tr>
                ) : (
                  invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-750">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">
                        {invoice.invoice_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {invoice.customer_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {invoice.pilot_name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-bold">
                        ${invoice.total_amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          invoice.status === 'paid' ? 'bg-green-900 text-green-300' :
                          invoice.status === 'sent' ? 'bg-blue-900 text-blue-300' :
                          invoice.status === 'overdue' ? 'bg-red-900 text-red-300' :
                          'bg-gray-700 text-gray-300'
                        }`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {new Date(invoice.issue_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        <button
                          onClick={() => startEdit(invoice)}
                          className="text-green-400 hover:text-green-300"
                        >
                          Edit
                        </button>
                        <span className="text-gray-600">|</span>
                        <button
                          onClick={() => downloadInvoicePDF(invoice)}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          Download PDF
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

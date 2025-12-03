import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download } from 'lucide-react';
import { dataService, Quote } from '../../lib/dataService';

export default function QuoteDetail() {
  const { id } = useParams<{ id: string }>();
  const [quote, setQuote] = useState<Quote | null>(null);

  useEffect(() => {
    if (id) {
      const quoteData = dataService.getQuoteById(id);
      setQuote(quoteData || null);
    }
  }, [id]);

  if (!quote) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <Link to="/quotes" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Quotes
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{quote.title}</h1>
            <p className="text-slate-600 mt-1">{quote.quoteNumber}</p>
          </div>
          <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            <Download className="w-5 h-5" />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Client Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-600">Client Name</label>
                <p className="text-slate-900 mt-1">{quote.clientName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Contact</label>
                <p className="text-slate-900 mt-1">{quote.clientContact}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Quote Items</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-200">
                  <tr>
                    <th className="text-left py-3 text-sm font-medium text-slate-600">Description</th>
                    <th className="text-center py-3 text-sm font-medium text-slate-600">Qty</th>
                    <th className="text-right py-3 text-sm font-medium text-slate-600">Unit Price</th>
                    <th className="text-right py-3 text-sm font-medium text-slate-600">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {quote.items.map((item) => (
                    <tr key={item.id}>
                      <td className="py-3 text-slate-900">{item.description}</td>
                      <td className="py-3 text-center text-slate-900">{item.quantity}</td>
                      <td className="py-3 text-right text-slate-900">£{item.unitPrice.toLocaleString()}</td>
                      <td className="py-3 text-right font-semibold text-slate-900">£{item.total.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t-2 border-slate-300">
                  <tr>
                    <td colSpan={3} className="py-3 text-right font-medium text-slate-900">Subtotal</td>
                    <td className="py-3 text-right font-semibold text-slate-900">£{quote.subtotal.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="py-3 text-right font-medium text-slate-900">Tax (20%)</td>
                    <td className="py-3 text-right font-semibold text-slate-900">£{quote.tax.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="py-3 text-right font-bold text-slate-900 text-lg">Total</td>
                    <td className="py-3 text-right font-bold text-blue-600 text-lg">£{quote.total.toLocaleString()}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Terms & Conditions</h2>
            <p className="text-slate-600">{quote.terms}</p>
          </div>

          {quote.notes && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Additional Notes</h2>
              <p className="text-slate-600">{quote.notes}</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Status</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-slate-600">Current Status</p>
                <p className={`text - lg font - bold mt - 1 ${quote.status === 'Accepted' ? 'text-green-600' :
                  quote.status === 'Rejected' ? 'text-red-600' :
                    quote.status === 'Pending' ? 'text-orange-600' :
                      'text-slate-600'
                  } `}>{quote.status}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Created</p>
                <p className="text-sm font-medium text-slate-900 mt-1">
                  {new Date(quote.createdDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Valid Until</p>
                <p className="text-sm font-medium text-slate-900 mt-1">
                  {new Date(quote.validUntil).toLocaleDateString()}
                </p>
              </div>
              {quote.acceptedDate && (
                <div>
                  <p className="text-sm text-slate-600">Accepted On</p>
                  <p className="text-sm font-medium text-slate-900 mt-1">
                    {new Date(quote.acceptedDate).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Actions</h2>
            <div className="space-y-2">
              <button className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                Mark as Accepted
              </button>
              <button className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
                Mark as Rejected
              </button>
              <button className="w-full border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50">
                Edit Quote
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

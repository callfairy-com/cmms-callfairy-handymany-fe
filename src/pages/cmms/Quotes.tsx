import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, FileText, CheckCircle, XCircle, Clock, X, User, DollarSign } from 'lucide-react';
import { dataService, Quote } from '../../lib/dataService';

export default function Quotes() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [filteredQuotes, setFilteredQuotes] = useState<Quote[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    clientName: '',
    clientContact: '',
    notes: '',
    terms: '',
    validUntil: '',
    items: [{ description: '', quantity: 1, unitPrice: 0, total: 0 }]
  });

  useEffect(() => {
    const allQuotes = dataService.getQuotes();
    setQuotes(allQuotes);
    setFilteredQuotes(allQuotes);
  }, []);

  useEffect(() => {
    let filtered = quotes;

    if (filterStatus !== 'all') {
      filtered = filtered.filter(quote => quote.status === filterStatus);
    }

    if (searchTerm) {
      filtered = filtered.filter(quote =>
        quote.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredQuotes(filtered);
  }, [filterStatus, searchTerm, quotes]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Accepted': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'Rejected': return <XCircle className="w-5 h-5 text-red-600" />;
      case 'Pending': return <Clock className="w-5 h-5 text-orange-600" />;
      default: return <FileText className="w-5 h-5 text-slate-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Accepted': return 'bg-green-100 text-green-700';
      case 'Rejected': return 'bg-red-100 text-red-700';
      case 'Pending': return 'bg-orange-100 text-orange-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const totalValue = quotes.reduce((sum, q) => sum + q.total, 0);
  const acceptedValue = quotes.filter(q => q.status === 'Accepted').reduce((sum, q) => sum + q.total, 0);

  const handleCreateQuote = () => {
    const newQuote: Quote = {
      id: `quote-${Date.now()}`,
      quoteNumber: `QT-${String(quotes.length + 1).padStart(4, '0')}`,
      title: formData.title,
      clientName: formData.clientName,
      clientContact: formData.clientContact,
      notes: formData.notes,
      terms: formData.terms,
      items: formData.items.map(item => ({
        id: `item-${Date.now()}-${Math.random()}`,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.quantity * item.unitPrice
      })),
      subtotal: formData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0),
      tax: formData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0) * 0.2, // 20% tax
      total: formData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0) * 1.2, // Including tax
      status: 'Draft',
      createdDate: new Date().toISOString(),
      acceptedDate: null,
      validUntil: formData.validUntil
    };

    const updatedQuotes = [...quotes, newQuote];
    setQuotes(updatedQuotes);
    setFilteredQuotes(updatedQuotes);
    setShowCreateModal(false);
    resetForm();

    alert('Quote created successfully!');
  };

  const resetForm = () => {
    setFormData({
      title: '',
      clientName: '',
      clientContact: '',
      notes: '',
      terms: '',
      validUntil: '',
      items: [{ description: '', quantity: 1, unitPrice: 0, total: 0 }]
    });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: '', quantity: 1, unitPrice: 0, total: 0 }]
    });
  };

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index);
      setFormData({ ...formData, items: newItems });
    }
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };

    // Recalculate total for the item
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].total = newItems[index].quantity * newItems[index].unitPrice;
    }

    setFormData({ ...formData, items: newItems });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Quotes & Proposals</h1>
          <p className="text-slate-600 mt-1">Create and manage project quotes</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          <span>Create Quote</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search quotes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="Draft">Draft</option>
            <option value="Pending">Pending</option>
            <option value="Accepted">Accepted</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-600">Total Quotes</p>
          <p className="text-2xl font-bold text-slate-900">{quotes.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-600">Total Value</p>
          <p className="text-2xl font-bold text-slate-900">£{totalValue.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-600">Accepted Value</p>
          <p className="text-2xl font-bold text-green-600">£{acceptedValue.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-600">Win Rate</p>
          <p className="text-2xl font-bold text-blue-600">
            {quotes.length > 0 ? Math.round((quotes.filter(q => q.status === 'Accepted').length / quotes.length) * 100) : 0}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredQuotes.map((quote) => (
          <Link
            key={quote.id}
            to={`/quotes/${quote.id}`}
            className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                {getStatusIcon(quote.status)}
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(quote.status)}`}>
                {quote.status}
              </span>
            </div>

            <h3 className="font-bold text-slate-900 mb-1">{quote.title}</h3>
            <p className="text-sm text-slate-500 mb-3">{quote.quoteNumber}</p>

            <div className="space-y-2 text-sm mb-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Client</span>
                <span className="font-medium text-slate-900">{quote.clientName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Items</span>
                <span className="font-medium text-slate-900">{quote.items.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Valid Until</span>
                <span className="font-medium text-slate-900">{new Date(quote.validUntil).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Total Amount</span>
                <span className="text-xl font-bold text-slate-900">£{quote.total.toLocaleString()}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Create Quote Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Create New Quote</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Generate a professional quote for your client</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Quote Details */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-slate-900 dark:text-white">Quote Details</h4>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Quote Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                      placeholder="Enter quote title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Valid Until *
                    </label>
                    <input
                      type="date"
                      value={formData.validUntil}
                      onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                    />
                  </div>
                </div>

                {/* Client Details */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center">
                    <User className="w-5 h-5 mr-2 text-slate-600 dark:text-slate-400" />
                    Client Information
                  </h4>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Client Name *
                    </label>
                    <input
                      type="text"
                      value={formData.clientName}
                      onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                      placeholder="Enter client name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Client Contact
                    </label>
                    <input
                      type="text"
                      value={formData.clientContact}
                      onChange={(e) => setFormData({ ...formData, clientContact: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                      placeholder="Email or phone number"
                    />
                  </div>
                </div>
              </div>

              {/* Quote Items */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center">
                    <DollarSign className="w-5 h-5 mr-2 text-slate-600 dark:text-slate-400" />
                    Quote Items
                  </h4>
                  <button
                    onClick={addItem}
                    className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  >
                    Add Item
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-3 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                      <div className="md:col-span-5">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => updateItem(index, 'description', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-600 dark:text-white text-sm"
                          placeholder="Item description"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-600 dark:text-white text-sm"
                          placeholder="Qty"
                          min="1"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-600 dark:text-white text-sm"
                          placeholder="Unit Price"
                          step="0.01"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <div className="px-3 py-2 bg-slate-100 dark:bg-slate-600 rounded-lg text-sm font-medium text-slate-900 dark:text-white">
                          £{(item.quantity * item.unitPrice).toFixed(2)}
                        </div>
                      </div>
                      <div className="md:col-span-1">
                        <button
                          onClick={() => removeItem(index)}
                          className="w-full px-2 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg text-sm"
                          disabled={formData.items.length === 1}
                        >
                          <X className="w-4 h-4 mx-auto" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Quote Summary */}
                <div className="mt-4 p-4 bg-slate-100 dark:bg-slate-700 rounded-lg">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Subtotal:</span>
                      <span className="font-medium text-slate-900 dark:text-white">
                        £{formData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Tax (20%):</span>
                      <span className="font-medium text-slate-900 dark:text-white">
                        £{(formData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0) * 0.2).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t border-slate-300 dark:border-slate-600 pt-2">
                      <span className="text-slate-900 dark:text-white">Total:</span>
                      <span className="text-slate-900 dark:text-white">
                        £{(formData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0) * 1.2).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Terms and Notes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Terms & Conditions
                  </label>
                  <textarea
                    value={formData.terms}
                    onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                    rows={4}
                    placeholder="Enter terms and conditions"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                    rows={4}
                    placeholder="Additional notes or comments"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700">
              <div className="text-sm text-slate-600 dark:text-slate-400">
                All fields marked with * are required
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateQuote}
                  disabled={!formData.title || !formData.clientName || !formData.validUntil}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
                >
                  Create Quote
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

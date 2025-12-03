import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, QrCode } from 'lucide-react';
import { dataService, Asset, Job } from '../../lib/dataService';

export default function AssetDetail() {
  const { id } = useParams<{ id: string }>();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [relatedJobs, setRelatedJobs] = useState<Job[]>([]);

  useEffect(() => {
    if (id) {
      const assetData = dataService.getAssetById(id);
      if (assetData) {
        setAsset(assetData);

        const jobs = dataService.getJobs().filter(job => job.assetId === id);
        setRelatedJobs(jobs);

      }
    }
  }, [id]);

  if (!asset) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <Link to="/assets" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Assets
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{asset.name}</h1>
            <p className="text-slate-600 mt-1">Asset ID: {asset.id}</p>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Create Work Order
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-600">Current Value</p>
          <p className="text-2xl font-bold text-slate-900">£{asset.currentValue.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-600">Status</p>
          <p className="text-2xl font-bold text-green-600">{asset.status}</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-600">Condition</p>
          <p className="text-2xl font-bold text-blue-600">{asset.condition}</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-600">Work Orders</p>
          <p className="text-2xl font-bold text-slate-900">{relatedJobs.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Asset Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-600">Type</label>
                <p className="text-slate-900 mt-1">{asset.type}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Category</label>
                <p className="text-slate-900 mt-1">{asset.category}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Manufacturer</label>
                <p className="text-slate-900 mt-1">{asset.manufacturer}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Model</label>
                <p className="text-slate-900 mt-1">{asset.model}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Serial Number</label>
                <p className="text-slate-900 mt-1">{asset.serialNumber}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Site</label>
                <p className="text-slate-900 mt-1">{asset.site}</p>
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-slate-600">Location</label>
                <p className="text-slate-900 mt-1">{asset.location}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Related Work Orders</h2>
            <div className="space-y-3">
              {relatedJobs.map((job) => (
                <Link
                  key={job.id}
                  to={`/work-orders/${job.id}`}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100"
                >
                  <div>
                    <p className="font-medium text-blue-600">{job.title}</p>
                    <p className="text-sm text-slate-600">{job.id} • {job.category}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${job.status === 'Complete' ? 'bg-green-100 text-green-700' :
                    job.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                      'bg-slate-200 text-slate-700'
                    }`}>
                    {job.status}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Financial Info</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-slate-600">Purchase Price</p>
                <p className="text-lg font-bold text-slate-900">£{asset.purchasePrice.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Current Value</p>
                <p className="text-lg font-bold text-slate-900">£{asset.currentValue.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Depreciation</p>
                <p className="text-lg font-bold text-red-600">
                  -£{(asset.purchasePrice - asset.currentValue).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Dates</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-slate-600">Installation</p>
                <p className="text-sm font-medium text-slate-900">
                  {new Date(asset.installationDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Warranty Expiry</p>
                <p className="text-sm font-medium text-slate-900">
                  {new Date(asset.warrantyExpiry).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Last Service</p>
                <p className="text-sm font-medium text-slate-900">
                  {new Date(asset.lastServiceDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Next Service</p>
                <p className="text-sm font-medium text-blue-600">
                  {new Date(asset.nextServiceDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Expected Replacement</p>
                <p className="text-sm font-medium text-slate-900">
                  {new Date(asset.expectedReplacement).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Identification</h2>
            <div className="space-y-3">
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <QrCode className="w-16 h-16 mx-auto text-slate-400 mb-2" />
                <p className="text-xs text-slate-600">{asset.qrCode}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Barcode</p>
                <p className="text-sm font-mono font-medium text-slate-900">{asset.barcode}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

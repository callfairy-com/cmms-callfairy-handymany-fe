import { useState, useEffect } from 'react';
import { Search, Image, FileText, Film, Download, Upload } from 'lucide-react';
import { dataService, Document } from '../../lib/dataService';
import { useDataAccess } from '../../hooks/useDataAccess';
import { useAuth } from '../../contexts/AuthContext';

export default function Documents() {
  const { user } = useAuth();
  const { filterDocuments, canUploadDocument } = useDataAccess();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocs, setFilteredDocs] = useState<Document[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<FileList | null>(null);
  const [uploadData, setUploadData] = useState({
    category: '',
    description: '',
    tags: '',
  });

  const readFileAsDataUrl = (file: File) => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  useEffect(() => {
    const allDocs = dataService.getDocuments();
    // Filter documents based on user access
    const userDocs = filterDocuments(allDocs);
    setDocuments(userDocs);
    setFilteredDocs(userDocs);
  }, [filterDocuments]);

  useEffect(() => {
    let filtered = documents;

    if (filterType !== 'all') {
      filtered = filtered.filter(doc => doc.type === filterType);
    }

    if (searchTerm) {
      filtered = filtered.filter(doc =>
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredDocs(filtered);
  }, [filterType, searchTerm, documents]);

  const handleUpload = async () => {
    if (!uploadFiles || uploadFiles.length === 0) {
      alert('Please select files to upload');
      return;
    }

    try {
      const createdDocuments: Document[] = [];

      for (const file of Array.from(uploadFiles)) {
        const fileType = file.type.startsWith('image/') ? 'image' :
          file.type.startsWith('video/') ? 'video' : 'document';

        const dataUrl = await readFileAsDataUrl(file);
        const tags = uploadData.tags
          ? uploadData.tags
            .split(',')
            .map(tag => tag.trim())
            .filter(Boolean)
          : [];

        const created = dataService.createDocument({
          name: file.name,
          type: fileType,
          category: uploadData.category || 'General',
          description: uploadData.description || `Uploaded file: ${file.name}`,
          url: dataUrl,
          size: file.size,
          uploadedBy: user?.id ? String(user.id) : 'unknown',
          tags,
          jobId: '',
          assetId: '',
        });

        createdDocuments.push(created);
      }

      const refreshedDocs = filterDocuments(dataService.getDocuments());
      setDocuments(refreshedDocs);
      setFilteredDocs(refreshedDocs);

      // Reset form and close modal
      setUploadFiles(null);
      setUploadData({
        category: '',
        description: '',
        tags: '',
      });
      setShowUploadModal(false);

      alert(`${createdDocuments.length} file(s) uploaded successfully!`);
    } catch (error) {
      console.error(error);
      alert('Failed to upload files. Please try again.');
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="w-5 h-5" />;
      case 'video': return <Film className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Documents & Media</h1>
          <p className="text-slate-600 mt-1">Manage photos, documents, and files</p>
        </div>
        {canUploadDocument() && (
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Upload className="w-5 h-5" />
            <span>Upload Files</span>
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="image">Images</option>
            <option value="document">Documents</option>
            <option value="video">Videos</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-600">Total Files</p>
          <p className="text-2xl font-bold text-slate-900">{documents.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-600">Images</p>
          <p className="text-2xl font-bold text-blue-600">
            {documents.filter(d => d.type === 'image').length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-600">Documents</p>
          <p className="text-2xl font-bold text-green-600">
            {documents.filter(d => d.type === 'document').length}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-600">Videos</p>
          <p className="text-2xl font-bold text-purple-600">
            {documents.filter(d => d.type === 'video').length}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredDocs.map((doc) => {
          const uploader = dataService.getUserById(doc.uploadedBy);
          const isImagePreview = doc.type === 'image' && doc.url;
          const isVideoPreview = doc.type === 'video' && doc.url;

          return (
            <div key={doc.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow">
              {isImagePreview ? (
                <div className="aspect-video bg-slate-100">
                  <img src={doc.url} alt={doc.name} className="w-full h-full object-cover" />
                </div>
              ) : isVideoPreview ? (
                <div className="aspect-video bg-slate-100">
                  <video src={doc.url} className="w-full h-full object-cover" controls preload="metadata" />
                </div>
              ) : (
                <div className="aspect-video bg-slate-100 flex items-center justify-center">
                  <div className={`w-16 h-16 rounded-lg flex items-center justify-center ${doc.type === 'image' ? 'bg-blue-100 text-blue-600' :
                      doc.type === 'video' ? 'bg-purple-100 text-purple-600' :
                        'bg-green-100 text-green-600'
                    }`}>
                    {getIcon(doc.type)}
                  </div>
                </div>
              )}

              <div className="p-4">
                <h3 className="font-medium text-slate-900 truncate mb-1">{doc.name}</h3>
                <p className="text-xs text-slate-500 mb-3 line-clamp-2">{doc.description}</p>

                <div className="flex items-center justify-between text-xs text-slate-600 mb-3">
                  <span>{doc.category}</span>
                  <span>{formatFileSize(doc.size)}</span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                  <div className="flex items-center space-x-2">
                    {uploader && (
                      <img src={uploader.avatar} alt={uploader.name} className="w-6 h-6 rounded-full" />
                    )}
                    <div>
                      <p className="text-xs text-slate-600">{uploader?.name || 'Unknown'}</p>
                      <p className="text-xs text-slate-500">{new Date(doc.uploadDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  {!!doc.url && (
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  )}
                </div>

                {doc.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {doc.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-6">Upload Files</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Select Files</label>
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx,.txt,.xlsx,.ppt,.pptx"
                  onChange={(e) => setUploadFiles(e.target.files)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Supported: Images, PDFs, Documents, Spreadsheets, Presentations
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                <select
                  value={uploadData.category}
                  onChange={(e) => setUploadData({ ...uploadData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Category</option>
                  <option value="General">General</option>
                  <option value="Work Orders">Work Orders</option>
                  <option value="Assets">Assets</option>
                  <option value="Compliance">Compliance</option>
                  <option value="Safety">Safety</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Reports">Reports</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                <textarea
                  value={uploadData.description}
                  onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Brief description of the files"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Tags</label>
                <input
                  type="text"
                  value={uploadData.tags}
                  onChange={(e) => setUploadData({ ...uploadData, tags: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter tags separated by commas"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Example: maintenance, urgent, building-a
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 pt-6 border-t border-slate-200 mt-6">
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadFiles(null);
                  setUploadData({
                    category: '',
                    description: '',
                    tags: '',
                  });
                }}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={!uploadFiles || uploadFiles.length === 0}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Files</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

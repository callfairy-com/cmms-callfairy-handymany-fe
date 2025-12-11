# Quick Start Guide

## Common Tasks

### 1. Create a New Page

```typescript
// src/pages/cmms/MyNewPage.tsx
import { useApiQuery } from '@/hooks';
import { myResourceApi } from '@/api';
import { LoadingState, EmptyState } from '@/components/common';

export default function MyNewPage() {
    const { data, loading } = useApiQuery(() => myResourceApi.list());

    if (loading) return <LoadingState />;
    if (!data?.length) return <EmptyState icon={Icon} title="No items" />;

    return <div>{/* Your content */}</div>;
}
```

### 2. Fetch Data from API

```typescript
// Using the hook
const { data, loading, error, refetch } = useApiQuery(
    () => workOrderApi.listWorkOrders(),
    { 
        autoFetch: true,
        showErrorToast: true 
    }
);

// Manual fetching
const loadData = async () => {
    try {
        const result = await workOrderApi.listWorkOrders();
        // Handle result
    } catch (error) {
        // Handle error
    }
};
```

### 3. Create/Update Data

```typescript
const { mutate, loading } = useMutation(
    (data) => workOrderApi.createWorkOrder(data),
    {
        showSuccessToast: true,
        successMessage: 'Work order created',
        onSuccess: () => navigate('/work-orders')
    }
);

// Use it
const handleSubmit = (formData) => {
    mutate(formData);
};
```

### 4. Check Permissions

```typescript
import { useAuth } from '@/contexts/AuthContext';

const { hasPermission } = useAuth();
const canCreate = hasPermission('can_create_work_orders');

return (
    <div>
        {canCreate && <button>Create</button>}
    </div>
);
```

### 5. Display Status Badges

```typescript
import { StatusBadge, PriorityBadge } from '@/components/common';

<StatusBadge status={workOrder.status} />
<PriorityBadge priority={workOrder.priority} size="md" />
```

### 6. Format Dates and Currency

```typescript
import { formatDate, formatCurrency } from '@/utils';

<span>{formatDate(workOrder.created_at)}</span>
<span>{formatCurrency(workOrder.estimated_cost)}</span>
```

### 7. Show Empty/Loading States

```typescript
import { EmptyState, LoadingState, ErrorState } from '@/components/common';
import { Package } from 'lucide-react';

if (loading) return <LoadingState message="Loading work orders..." />;

if (error) return <ErrorState 
    message={error.message} 
    onRetry={refetch} 
/>;

if (!data?.length) return <EmptyState
    icon={Package}
    title="No work orders found"
    description="Create your first work order to get started"
    action={{
        label: 'Create Work Order',
        onClick: () => navigate('/work-orders/new')
    }}
/>;
```

### 8. Normalize API Responses

```typescript
import { normalizeToArray } from '@/utils';

const { data: response } = useApiQuery(() => api.fetch());
const items = normalizeToArray(response); // Always returns an array
```

### 9. Add Debounced Search

```typescript
import { debounce } from '@/utils';
import { useState, useCallback } from 'react';

const [searchTerm, setSearchTerm] = useState('');

const handleSearch = useCallback(
    debounce((value: string) => {
        // Perform search
    }, 300),
    []
);

<input onChange={(e) => {
    setSearchTerm(e.target.value);
    handleSearch(e.target.value);
}} />
```

### 10. Protected Routes

```typescript
// In MaintenanceApp.tsx
<Route
    path="/my-page"
    element={
        <ProtectedRoute requiredPermission="can_do_something">
            <MyPage />
        </ProtectedRoute>
    }
/>
```

---

## API Imports

```typescript
// Import all APIs from one place
import { workOrderApi, locationApi, assetApi } from '@/api';

// Use them
const workOrders = await workOrderApi.listWorkOrders();
const sites = await locationApi.listSites();
const assets = await assetApi.listAssets();
```

---

## Common Patterns

### List Page Pattern

```typescript
export default function ResourceList() {
    const navigate = useNavigate();
    const { hasPermission } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    
    const { data, loading, refetch } = useApiQuery(
        () => resourceApi.list({ search: searchTerm })
    );

    const canCreate = hasPermission('can_create_resource');

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex justify-between mb-6">
                <h1>Resources</h1>
                {canCreate && (
                    <button onClick={() => navigate('/resource/new')}>
                        Create
                    </button>
                )}
            </div>

            {/* Search */}
            <input 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
            />

            {/* List */}
            {loading ? (
                <LoadingState />
            ) : data?.length ? (
                data.map(item => <div key={item.id}>{item.name}</div>)
            ) : (
                <EmptyState icon={Icon} title="No items" />
            )}
        </div>
    );
}
```

### Detail Page Pattern

```typescript
export default function ResourceDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { hasPermission } = useAuth();

    const { data: item, loading } = useApiQuery(
        () => resourceApi.get(id!)
    );

    const { mutate: deleteItem } = useMutation(
        () => resourceApi.delete(id!),
        {
            showSuccessToast: true,
            onSuccess: () => navigate('/resources')
        }
    );

    const canEdit = hasPermission('can_edit_resource');
    const canDelete = hasPermission('can_delete_resource');

    if (loading) return <LoadingState />;
    if (!item) return <ErrorState message="Not found" />;

    return (
        <div className="p-6">
            <h1>{item.name}</h1>
            
            {/* Actions */}
            <div className="flex gap-2">
                {canEdit && (
                    <button onClick={() => navigate(`/resources/${id}/edit`)}>
                        Edit
                    </button>
                )}
                {canDelete && (
                    <button onClick={() => deleteItem()}>
                        Delete
                    </button>
                )}
            </div>

            {/* Content */}
            <div>{/* Item details */}</div>
        </div>
    );
}
```

### Form Page Pattern

```typescript
export default function ResourceForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = Boolean(id);

    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });

    // Load data if editing
    useApiQuery(
        () => resourceApi.get(id!),
        {
            autoFetch: isEditMode,
            onSuccess: (data) => setFormData(data)
        }
    );

    // Submit mutation
    const { mutate, loading } = useMutation(
        (data) => isEditMode 
            ? resourceApi.update(id!, data)
            : resourceApi.create(data),
        {
            showSuccessToast: true,
            onSuccess: () => navigate('/resources')
        }
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutate(formData);
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            
            <button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save'}
            </button>
        </form>
    );
}
```

---

## Styling

Use Tailwind CSS utility classes:

```typescript
// Container
<div className="p-6 max-w-7xl mx-auto">

// Card
<div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

// Button
<button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">

// Input
<input className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500">
```

---

## Icons

Use Lucide React icons:

```typescript
import { Plus, Edit2, Trash2, Search, Filter } from 'lucide-react';

<Plus className="w-4 h-4" />
<Edit2 className="w-5 h-5 text-indigo-600" />
```

---

## Troubleshooting

### Issue: API returns undefined
**Solution:** Use `normalizeToArray()` to safely handle responses
```typescript
const items = normalizeToArray(response);
```

### Issue: Permission checks not working
**Solution:** Ensure user is authenticated and permissions are loaded
```typescript
const { user, hasPermission } = useAuth();
if (!user) return null;
```

### Issue: Component re-renders too often
**Solution:** Use `useCallback` for functions and memoize expensive computations
```typescript
const handleClick = useCallback(() => {
    // logic
}, [dependencies]);
```

---

## Next Steps

1. Review `CLEANUP_SUMMARY.md` for detailed cleanup information
2. Review `PROJECT_STRUCTURE.md` for architecture details
3. Check existing pages for real-world examples
4. Follow the patterns above for consistency

Happy coding! 🚀

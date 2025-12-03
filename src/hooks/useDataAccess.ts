import { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Job, Asset, Document as DocType, Variation } from '../lib/dataService';
import userDataMappingJson from '../data/userDataMapping.json';

export interface UserDataAccess {
  userId: string;
  role: string;
  dataAccess: 'all' | 'managed' | 'assigned' | 'readonly';
  assignedWorkOrders: string[];
  assignedAssets: string[];
  assignedDocuments: string[];
  assignedVariations?: string[];
  assignedReports?: string[];
  managedUsers?: string[];
  canApprove: boolean;
  canManageUsers: boolean;
  canSubmitForApproval?: boolean;
  canUploadDocuments?: boolean;
  canEdit?: boolean;
}

const userDataMapping = userDataMappingJson as Record<string, UserDataAccess>;

export function useDataAccess() {
  const { user } = useAuth();

  const userAccess = useMemo<UserDataAccess | null>(() => {
    if (!user?.email) return null;
    return userDataMapping[user.email.toLowerCase()] || null;
  }, [user?.email]);

  const filterWorkOrders = useMemo(() => {
    return (workOrders: Job[]): Job[] => {
      if (!userAccess) return [];

      // Admin sees all
      if (userAccess.dataAccess === 'all') {
        return workOrders;
      }

      // Manager sees assigned work orders
      if (userAccess.dataAccess === 'managed') {
        return workOrders.filter(wo => 
          userAccess.assignedWorkOrders.includes(wo.id) ||
          (userAccess.managedUsers && userAccess.managedUsers.includes(wo.assignedTo)) ||
          wo.createdBy === userAccess.userId
        );
      }

      // Contractor sees only their assigned work orders
      if (userAccess.dataAccess === 'assigned') {
        return workOrders.filter(wo => 
          userAccess.assignedWorkOrders.includes(wo.id) ||
          wo.assignedTo === userAccess.userId
        );
      }

      // Viewer sees nothing
      return [];
    };
  }, [userAccess]);

  const filterAssets = useMemo(() => {
    return (assets: Asset[]): Asset[] => {
      if (!userAccess) return [];

      // Admin sees all
      if (userAccess.dataAccess === 'all') {
        return assets;
      }

      // Manager sees assigned assets
      if (userAccess.dataAccess === 'managed') {
        return assets.filter(asset => 
          userAccess.assignedAssets.includes(asset.id)
        );
      }

      // Contractor and Viewer see nothing (per requirements)
      return [];
    };
  }, [userAccess]);

  const filterDocuments = useMemo(() => {
    return (documents: DocType[]): DocType[] => {
      if (!userAccess) return [];

      // Admin sees all
      if (userAccess.dataAccess === 'all') {
        return documents;
      }

      // Contractor sees documents assigned to them OR related to their work orders
      if (userAccess.dataAccess === 'assigned') {
        return documents.filter(doc => 
          userAccess.assignedDocuments.includes(doc.id) ||
          (doc.jobId && userAccess.assignedWorkOrders.includes(doc.jobId))
        );
      }

      // Manager and Viewer see assigned documents
      return documents.filter(doc => 
        userAccess.assignedDocuments.includes(doc.id)
      );
    };
  }, [userAccess]);

  const filterVariations = useMemo(() => {
    return (variations: Variation[]): Variation[] => {
      if (!userAccess) return [];

      // Admin sees all
      if (userAccess.dataAccess === 'all') {
        return variations;
      }

      // Manager sees variations for managed work orders/users
      if (userAccess.dataAccess === 'managed') {
        return variations.filter(variation => {
          if (userAccess.assignedWorkOrders.includes(variation.jobId)) return true;
          if (userAccess.managedUsers?.includes(variation.requestedBy)) return true;
          return false;
        });
      }

      // Contractor sees assigned variations or ones they created
      if (userAccess.dataAccess === 'assigned') {
        return variations.filter(variation => {
          if (userAccess.assignedVariations?.includes(variation.id)) return true;
          if (variation.requestedBy === userAccess.userId) return true;
          if (userAccess.assignedWorkOrders.includes(variation.jobId)) return true;
          return false;
        });
      }

      // Viewer and others see none
      return [];
    };
  }, [userAccess]);

  const canEditWorkOrder = useMemo(() => {
    return (workOrderId: string): boolean => {
      if (!userAccess) return false;

      // Admin can edit all
      if (userAccess.dataAccess === 'all') return true;

      // Manager can edit assigned work orders
      if (userAccess.dataAccess === 'managed') {
        return userAccess.assignedWorkOrders.includes(workOrderId);
      }

      // Contractor can edit their assigned work orders
      if (userAccess.dataAccess === 'assigned') {
        return userAccess.assignedWorkOrders.includes(workOrderId);
      }

      // Viewer cannot edit
      return false;
    };
  }, [userAccess]);

  const canApproveWorkOrder = useMemo(() => {
    return (workOrderId: string): boolean => {
      if (!userAccess) return false;
      
      // Only users with canApprove flag can approve
      if (!userAccess.canApprove) return false;

      // Admin can approve all
      if (userAccess.dataAccess === 'all') return true;

      // Manager can approve assigned work orders
      if (userAccess.dataAccess === 'managed') {
        return userAccess.assignedWorkOrders.includes(workOrderId);
      }

      return false;
    };
  }, [userAccess]);

  const canUploadDocument = useMemo(() => {
    return (): boolean => {
      if (!userAccess) return false;
      return userAccess.canUploadDocuments === true;
    };
  }, [userAccess]);

  const canSubmitForApproval = useMemo(() => {
    return (): boolean => {
      if (!userAccess) return false;
      return userAccess.canSubmitForApproval === true;
    };
  }, [userAccess]);

  return {
    userAccess,
    filterWorkOrders,
    filterAssets,
    filterDocuments,
    filterVariations,
    canEditWorkOrder,
    canApproveWorkOrder,
    canUploadDocument,
    canSubmitForApproval,
    isAdmin: userAccess?.dataAccess === 'all',
    isManager: userAccess?.dataAccess === 'managed',
    isContractor: userAccess?.dataAccess === 'assigned',
    isViewer: userAccess?.dataAccess === 'readonly',
  };
}

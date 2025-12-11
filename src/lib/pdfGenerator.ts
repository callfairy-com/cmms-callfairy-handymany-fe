// PDF Generation utility using jsPDF
import jsPDF from 'jspdf';

export const generateWorkOrderPDF = (job: any) => {
  const content = `
WORK ORDER DETAILS
==================

Job ID: ${job.id}
Title: ${job.title}
Status: ${job.status}
Priority: ${job.priority}

DESCRIPTION:
${job.description}

LOCATION:
Site: ${job.site}
Location: ${job.location}

SCHEDULE:
Scheduled Date: ${new Date(job.scheduledDate).toLocaleDateString()}
Due Date: ${new Date(job.dueDate).toLocaleDateString()}
${job.completedDate ? `Completed: ${new Date(job.completedDate).toLocaleDateString()}` : ''}

ESTIMATES:
Estimated Hours: ${job.estimatedHours}h
Estimated Cost: £${job.estimatedCost || 0}
Progress: ${job.progress}%

NOTES:
${job.notes || 'No notes'}

Generated: ${new Date().toLocaleString()}
  `.trim();

  generatePDF(content, `work-order-${job.id}.pdf`);
};

export const generateAssetPDF = (asset: any) => {
  const content = `
ASSET DETAILS
=============

Asset Name: ${asset.name}
Serial Number: ${asset.serialNumber}
Type: ${asset.type}
Category: ${asset.category}
${asset.subCategory ? `Sub-Category: ${asset.subCategory}` : ''}

STATUS & CONDITION:
Status: ${asset.status}
Condition: ${asset.condition}

LOCATION:
Site: ${asset.site}
Location: ${asset.location}

SPECIFICATIONS:
Manufacturer: ${asset.manufacturer}
Model: ${asset.model}

FINANCIAL:
Purchase Price: £${asset.purchasePrice.toLocaleString()}
Current Value: £${asset.currentValue.toLocaleString()}

MAINTENANCE:
Installation Date: ${new Date(asset.installationDate).toLocaleDateString()}
Next Service: ${new Date(asset.nextServiceDate).toLocaleDateString()}
${asset.warrantyExpiry ? `Warranty Expiry: ${new Date(asset.warrantyExpiry).toLocaleDateString()}` : ''}

Generated: ${new Date().toLocaleString()}
  `.trim();

  generatePDF(content, `asset-${asset.serialNumber}.pdf`);
};

export const generateMaintenanceSchedulePDF = (schedule: any, asset: any) => {
  const content = `
MAINTENANCE SCHEDULE
====================

Schedule Name: ${schedule.name}
Schedule ID: ${schedule.id}
Status: ${schedule.status}
Priority: ${schedule.priority}

DESCRIPTION:
${schedule.description}

ASSET:
${asset ? `${asset.name} (${asset.serialNumber})` : 'N/A'}

SCHEDULE:
Frequency: ${schedule.frequency}
Interval: Every ${schedule.interval} ${schedule.intervalUnit}(s)
Last Completed: ${new Date(schedule.lastCompleted).toLocaleDateString()}
Next Due: ${new Date(schedule.nextDue).toLocaleDateString()}

ASSIGNMENT:
Assigned Team: ${schedule.assignedTeam}
Estimated Duration: ${schedule.estimatedDuration} hours

SETTINGS:
Auto-generate Work Orders: ${schedule.autoGenerate ? 'Yes' : 'No'}
${schedule.checklistTemplate ? `Checklist Template: ${schedule.checklistTemplate}` : ''}

HISTORY:
${schedule.history && schedule.history.length > 0 
  ? schedule.history.map((h: any) => `- ${new Date(h.date).toLocaleDateString()}: ${h.status} (Job: ${h.jobId})`).join('\n')
  : 'No history available'}

Generated: ${new Date().toLocaleString()}
  `.trim();

  generatePDF(content, `maintenance-schedule-${schedule.id}.pdf`);
};

export const generateComplianceChecklistPDF = (checklist: any) => {
  const completedCount = checklist.items.filter((item: any) => item.completed).length;
  const totalCount = checklist.items.length;
  const completionRate = Math.round((completedCount / totalCount) * 100);

  const content = `
COMPLIANCE & SAFETY CHECKLIST
==============================

Checklist Name: ${checklist.name}
ID: ${checklist.id}
Category: ${checklist.category}
Compliance Standard: ${checklist.compliance}
Frequency: ${checklist.frequency}

DESCRIPTION:
${checklist.description}

COMPLETION STATUS:
Progress: ${completionRate}% (${completedCount}/${totalCount} items)

CHECKLIST ITEMS:
${checklist.items.map((item: any, idx: number) => `
${idx + 1}. ${item.task} ${item.required ? '(Required)' : ''}
   Status: ${item.completed ? '✓ Completed' : '○ Pending'}
   ${item.notes ? `Notes: ${item.notes}` : ''}`).join('\n')}

Generated: ${new Date().toLocaleString()}
  `.trim();

  generatePDF(content, `compliance-checklist-${checklist.id}.pdf`);
};

export const generateComplianceReportPDF = (reportData: any) => {
  const content = `
COMPLIANCE & SAFETY REPORT
==========================

Generated: ${reportData.generatedDate}

SUMMARY:
--------
Total Checklists: ${reportData.totalChecklists}
Overall Compliance Rate: ${reportData.complianceRate}%
Completed Items: ${reportData.completedItems}
Pending Items: ${reportData.pendingItems}
Total Items: ${reportData.totalItems}

DETAILED BREAKDOWN:
-------------------
${reportData.checklists.map((cl: any) => `
${cl.name} (${cl.category})
  Completion Rate: ${cl.completionRate}%
  Items: ${cl.completedItems}/${cl.totalItems}
  Compliance: ${cl.completionRate === 100 ? 'COMPLIANT' : 'IN PROGRESS'}`).join('\n')}

RECOMMENDATIONS:
----------------
${reportData.complianceRate === 100 
  ? 'All compliance requirements are met. Continue monitoring.'
  : `- ${reportData.pendingItems} items require attention
- Focus on checklists with lowest completion rates
- Review and update procedures as needed`}

Generated: ${new Date().toLocaleString()}
  `.trim();

  generatePDF(content, `compliance-report-${new Date().toISOString().split('T')[0]}.pdf`);
};

export const generateCostTrackingPDF = (cost: any, job: any) => {
  const variance = cost.actualCost - cost.estimatedCost;
  
  const content = `
COST ENTRY DETAILS
==================

Cost ID: ${cost.id}
Date: ${new Date(cost.date).toLocaleDateString()}

DESCRIPTION:
${cost.description}

DETAILS:
Type: ${cost.type}
Supplier: ${cost.supplier}
${cost.invoiceNumber ? `Invoice: ${cost.invoiceNumber}` : ''}
Status: ${cost.status}

RELATED JOB:
${job ? `${job.id} - ${job.title}` : 'General Expense (No job assigned)'}

QUANTITY:
${cost.quantity} ${cost.unit}
Unit Cost: £${cost.unitCost.toLocaleString()}

COSTS:
Estimated Cost: £${cost.estimatedCost.toLocaleString()}
Actual Cost: £${cost.actualCost.toLocaleString()}
Variance: ${variance > 0 ? '+' : ''}£${Math.abs(variance).toLocaleString()} (${variance > 0 ? 'Over' : variance < 0 ? 'Under' : 'On'} Budget)

Generated: ${new Date().toLocaleString()}
  `.trim();

  generatePDF(content, `cost-entry-${cost.id}.pdf`);
};

// Helper function to generate and download PDF
const generatePDF = (content: string, filename: string) => {
  const doc = new jsPDF();
  
  // Set font size and style
  doc.setFontSize(10);
  
  // Split content into lines and add to PDF
  const lines = content.split('\n');
  let yPosition = 15;
  const lineHeight = 6;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 15;
  
  lines.forEach((line) => {
    // Check if we need a new page
    if (yPosition > pageHeight - margin) {
      doc.addPage();
      yPosition = 15;
    }
    
    // Handle long lines by splitting them
    const maxWidth = 180;
    const splitText = doc.splitTextToSize(line, maxWidth);
    
    splitText.forEach((textLine: string) => {
      if (yPosition > pageHeight - margin) {
        doc.addPage();
        yPosition = 15;
      }
      doc.text(textLine, 15, yPosition);
      yPosition += lineHeight;
    });
  });
  
  // Save the PDF
  doc.save(filename);
};

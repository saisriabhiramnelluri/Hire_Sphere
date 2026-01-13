import React, { useState } from 'react';
import { IoDownload, IoDocument } from 'react-icons/io5';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import FadeIn from '../../components/animations/FadeIn';
import api from '../../services/api';
import toast from 'react-hot-toast';

const Reports = () => {
  const [loading, setLoading] = useState({});

  const handleExportReport = async (reportType) => {
    setLoading(prev => ({ ...prev, [reportType]: true }));

    try {
      let csvContent = '';
      let filename = '';

      switch (reportType) {
        case 'placement-summary':
          filename = 'placement_summary_report.csv';
          csvContent = await generatePlacementSummaryCSV();
          break;
        case 'branch-wise':
          filename = 'branch_wise_report.csv';
          csvContent = await generateBranchWiseCSV();
          break;
        case 'company-wise':
          filename = 'company_wise_report.csv';
          csvContent = await generateCompanyWiseCSV();
          break;
        case 'student-database':
          filename = 'student_database.csv';
          csvContent = await generateStudentDatabaseCSV();
          break;
        default:
          throw new Error('Unknown report type');
      }

      // Download the CSV file
      downloadCSV(csvContent, filename);
      toast.success(`Report exported successfully!`);
    } catch (error) {
      toast.error('Failed to export report');
      console.error(error);
    } finally {
      setLoading(prev => ({ ...prev, [reportType]: false }));
    }
  };

  const generatePlacementSummaryCSV = async () => {
    const response = await api.get('/admin/analytics/overall');

    if (!response.success) throw new Error('Failed to fetch data');

    const data = response.data;
    const rows = [
      ['Placement Summary Report'],
      ['Generated on', new Date().toLocaleDateString()],
      [''],
      ['Metric', 'Value'],
      ['Total Students', data.totalStudents || 0],
      ['Placed Students', data.placedStudents || 0],
      ['Placement Rate', `${data.placementRate || 0}%`],
      ['Total Drives', data.totalDrives || 0],
      ['Active Drives', data.activeDrives || 0],
      ['Total Applications', data.totalApplications || 0],
      ['Offers Made', data.offersAccepted || 0],
      ['Average Package', data.avgPackage ? `${(data.avgPackage / 100000).toFixed(2)} LPA` : 'N/A'],
      ['Highest Package', data.highestPackage ? `${(data.highestPackage / 100000).toFixed(2)} LPA` : 'N/A'],
    ];

    return rows.map(row => row.join(',')).join('\n');
  };

  const generateBranchWiseCSV = async () => {
    const response = await api.get('/admin/analytics/branch-wise');

    if (!response.success) throw new Error('Failed to fetch data');

    const rows = [
      ['Branch-wise Placement Report'],
      ['Generated on', new Date().toLocaleDateString()],
      [''],
      ['Branch', 'Total Students', 'Placed', 'Placement Rate'],
    ];

    const data = response.data;
    if (data.branchWise && Array.isArray(data.branchWise)) {
      data.branchWise.forEach(branch => {
        const rate = branch.total > 0 ? ((branch.placed / branch.total) * 100).toFixed(1) : 0;
        rows.push([branch._id || 'Unknown', branch.total, branch.placed, `${rate}%`]);
      });
    } else if (Array.isArray(data)) {
      data.forEach(branch => {
        const rate = branch.total > 0 ? ((branch.placed / branch.total) * 100).toFixed(1) : 0;
        rows.push([branch._id || 'Unknown', branch.total || 0, branch.placed || 0, `${rate}%`]);
      });
    }

    return rows.map(row => row.join(',')).join('\n');
  };

  const generateCompanyWiseCSV = async () => {
    const response = await api.get('/admin/analytics/company-wise');

    if (!response.success) throw new Error('Failed to fetch data');

    const rows = [
      ['Company-wise Hiring Report'],
      ['Generated on', new Date().toLocaleDateString()],
      [''],
      ['Company', 'Total Hires', 'Average Package'],
    ];

    const data = response.data;
    if (data.topHiringCompanies && Array.isArray(data.topHiringCompanies)) {
      data.topHiringCompanies.forEach(company => {
        rows.push([
          company._id || 'Unknown',
          company.hires || 0,
          company.avgPackage ? `${(company.avgPackage / 100000).toFixed(1)} LPA` : 'N/A'
        ]);
      });
    } else if (Array.isArray(data)) {
      data.forEach(company => {
        rows.push([
          company._id || company.companyName || 'Unknown',
          company.hires || company.count || 0,
          company.avgPackage ? `${(company.avgPackage / 100000).toFixed(1)} LPA` : 'N/A'
        ]);
      });
    }

    return rows.map(row => row.join(',')).join('\n');
  };

  const generateStudentDatabaseCSV = async () => {
    const response = await api.get('/admin/users', { params: { role: 'student', limit: 1000 } });

    if (!response.success) throw new Error('Failed to fetch data');

    const rows = [
      ['Student Database Export'],
      ['Generated on', new Date().toLocaleDateString()],
      [''],
      ['Email', 'Status', 'Verified', 'Created At'],
    ];

    if (response.data.users) {
      response.data.users.forEach(user => {
        rows.push([
          user.email,
          user.isActive ? 'Active' : 'Inactive',
          user.isVerified ? 'Yes' : 'No',
          new Date(user.createdAt).toLocaleDateString()
        ]);
      });
    }

    return rows.map(row => row.join(',')).join('\n');
  };

  const downloadCSV = (content, filename) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const reports = [
    {
      title: 'Placement Summary Report',
      description: 'Overall placement statistics and trends',
      type: 'placement-summary',
    },
    {
      title: 'Branch-wise Report',
      description: 'Detailed branch-wise placement analysis',
      type: 'branch-wise',
    },
    {
      title: 'Company-wise Report',
      description: 'Company hiring statistics and patterns',
      type: 'company-wise',
    },
    {
      title: 'Student Database',
      description: 'Complete student information export',
      type: 'student-database',
    },
  ];

  return (
    <div className="space-y-6">
      <FadeIn>
        <div>
          <h1 className="text-3xl font-bold text-primary-900">Reports & Exports</h1>
          <p className="text-primary-600 mt-1">Generate and download placement reports</p>
        </div>
      </FadeIn>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((report, index) => (
          <FadeIn key={index} delay={index * 0.1}>
            <Card hoverable>
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-secondary-50 rounded-lg">
                  <IoDocument className="text-secondary-600" size={32} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-primary-900 mb-1">
                    {report.title}
                  </h3>
                  <p className="text-sm text-primary-600 mb-4">{report.description}</p>
                  <Button
                    size="sm"
                    icon={loading[report.type] ? null : <IoDownload />}
                    onClick={() => handleExportReport(report.type)}
                    disabled={loading[report.type]}
                  >
                    {loading[report.type] ? 'Exporting...' : 'Export Report'}
                  </Button>
                </div>
              </div>
            </Card>
          </FadeIn>
        ))}
      </div>
    </div>
  );
};

export default Reports;

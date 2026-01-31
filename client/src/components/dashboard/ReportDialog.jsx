import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { api } from '@/services/api';
import { Download, FileText, FileSpreadsheet, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { exportToCSV } from '@/utils/exportData';
import { formatCurrency, formatDate } from '@/utils/formatters';

export function ReportDialog({ open, onOpenChange }) {
    const [reportType, setReportType] = useState('transaction_history');
    const [dateRange, setDateRange] = useState('last_30_days');
    const [format, setFormat] = useState('pdf');
    const [loading, setLoading] = useState(false);

    const handleDownload = async () => {
        setLoading(true);
        try {
            if (reportType === 'transaction_history') {
                // Calculate date range
                let startDate = new Date();
                if (dateRange === 'last_7_days') {
                    startDate.setDate(startDate.getDate() - 7);
                } else if (dateRange === 'last_30_days') {
                    startDate.setDate(startDate.getDate() - 30);
                } else if (dateRange === 'this_month') {
                    startDate =  new Date(startDate.getFullYear(), startDate.getMonth(), 1);
                } else if (dateRange === 'previous_month') {
                    startDate = new Date(startDate.getFullYear(), startDate.getMonth() - 1, 1);
                }
                
                // Fetch transactions
                const response = await api.get('/transactions');
                const transactions = response.data?.transactions || [];
                
                // Filter by date range
                const filtered = transactions.filter(t => {
                    const txDate = new Date(t.created_at);
                    return txDate >= startDate;
                });
                
                if (filtered.length === 0) {
                    toast.info('No transactions found for selected date range');
                    return;
                }
                
                // Export based on format
                if (format === 'csv') {
                    exportToCSV(
                        filtered,
                        [
                            { key: 'mOrderId', label: 'Order ID' },
                            { key: 'beneficiary_name', label: 'Beneficiary' },
                            { key: 'account_number', label: 'Account Number' },
                            { key: 'ifsc_code', label: 'IFSC Code' },
                            { key: 'bank_name', label: 'Bank' },
                            { key: 'amount', label: 'Amount (₹)', format: formatCurrency },
                            { key: 'status', label: 'Status' },
                            { key: 'utr', label: 'UTR' },
                            { key: 'created_at', label: 'Date', format: (d) => formatDate(d, 'full') }
                        ],
                        `transactions_${dateRange}`
                    );
                    toast.success('CSV Downloaded Successfully');
                    // Only close modal on successful download
                    onOpenChange(false);
                } else {
                    // PDF not available - keep modal open
                    toast.info('PDF export coming soon', { description: 'Use CSV format for now' });
                }
            } else {
                // Other report types not available - keep modal open
                toast.info('Coming Soon', { description: 'This report type is not yet available.' });
            }
        } catch (error) {
            console.error('Report generation failed', error);
            toast.error('Failed to download report');
            // Keep modal open on error so user can retry
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Download Reports</DialogTitle>
                    <DialogDescription>
                        Generate and download detailed reports for your transactions and account usage.
                    </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-6 py-4">
                    {/* Report Type */}
                    <div className="grid gap-2">
                        <Label htmlFor="type">Report Type</Label>
                        <Select value={reportType} onValueChange={setReportType}>
                            <SelectTrigger id="type">
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="transaction_history">Transaction History</SelectItem>
                                {/* <SelectItem value="statement">Account Statement (Coming Soon)</SelectItem> */}
                                {/* <SelectItem value="tax_report">Tax / GST Report (Coming Soon)</SelectItem> */}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Date Range */}
                    <div className="grid gap-2">
                        <Label htmlFor="range">Date Range</Label>
                        <Select value={dateRange} onValueChange={setDateRange}>
                            <SelectTrigger id="range">
                                <SelectValue placeholder="Select range" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="last_7_days">Last 7 Days</SelectItem>
                                <SelectItem value="last_30_days">Last 30 Days</SelectItem>
                                <SelectItem value="this_month">This Month</SelectItem>
                                <SelectItem value="previous_month">Last Month</SelectItem>
                                <SelectItem value="custom">Custom Range</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Format Selection */}
                    <div className="grid gap-2">
                        <Label>Export Format</Label>
                        <RadioGroup defaultValue="pdf" value={format} onValueChange={setFormat} className="grid grid-cols-2 gap-4">
                            <div>
                                <RadioGroupItem value="pdf" id="pdf" className="peer sr-only" />
                                <Label
                                    htmlFor="pdf"
                                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                >
                                    <FileText className="mb-2 h-6 w-6" />
                                    PDF
                                </Label>
                            </div>
                            <div>
                                <RadioGroupItem value="csv" id="csv" className="peer sr-only" />
                                <Label
                                    htmlFor="csv"
                                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                >
                                    <FileSpreadsheet className="mb-2 h-6 w-6" />
                                    CSV
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleDownload} disabled={loading}>
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
                            </>
                        ) : (
                            <>
                                <Download className="mr-2 h-4 w-4" /> Download
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

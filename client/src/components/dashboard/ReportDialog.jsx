import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { api } from '@/services/api';
import { Download, FileText, FileSpreadsheet, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function ReportDialog({ open, onOpenChange }) {
    const [reportType, setReportType] = useState('transaction_history');
    const [dateRange, setDateRange] = useState('last_30_days');
    const [format, setFormat] = useState('pdf');
    const [loading, setLoading] = useState(false);

    const handleDownload = async () => {
        setLoading(true);
        try {
            // BACKEND LIMITATION: Currently only Transaction History (CSV) is supported via GET /api/transactions/export
            if (reportType === 'transaction_history') {
                 // Construct query params for filtering
                 const params = new URLSearchParams();
                 if (dateRange === 'last_7_days') {
                     const date = new Date();
                     date.setDate(date.getDate() - 7);
                     params.append('start_date', date.toISOString());
                 } else if (dateRange === 'last_30_days') {
                     const date = new Date();
                     date.setDate(date.getDate() - 30);
                     params.append('start_date', date.toISOString());
                 }
                 // ... add more date logic if needed
                 
                 // Trigger browser download by opening URL
                 const downloadUrl = `${process.env.NEXT_PUBLIC_API_URL}/transactions/export?${params.toString()}`;
                 
                 // We use a hidden link to trigger the download with auth token if needed
                 // Since standard links don't carry headers, we might need a fetch-blob approach if auth is strict.
                 // But for now, let's try the direct api.downloadReport wrapper which handles blob.
                 
                 await api.downloadReport({ reportType, dateRange, format });
                 toast.success("Statement Downloaded");
                 onOpenChange(false);
            } else {
                 toast.info("Coming Soon", { description: "This report type is not yet available." });
            }

        } catch (error) {
            console.error("Report generation failed", error);
            toast.error("Failed to download report");
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

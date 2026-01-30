'use client';

import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { toast } from 'sonner';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Plus, ArrowUpDown, CalendarIcon, Download } from 'lucide-react';
import Link from 'next/link';
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { formatAmount, formatTimestamp } from "@/utils/helpers";
import { StatusBadge } from "@/components/shared/StatusBadge";

export default function PayoutsPage() {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sourceFilter, setSourceFilter] = useState('ALL');
  const [accountSearch, setAccountSearch] = useState('');
  const [beneficiarySearch, setBeneficiarySearch] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [dateFilter, setDateFilter] = useState();

  useEffect(() => {
    fetchPayouts();
  }, []);

  const fetchPayouts = async () => {
    setLoading(true);
    try {
      const response = await api.get('/payouts');
      // Backend returns: { success: true, data: { payouts, total } }
      if (response.success && response.data) {
        setPayouts(response.data.payouts || []);
      } else if (Array.isArray(response.data)) {
        // Fallback if response.data is directly an array
        setPayouts(response.data);
      }
    } catch (error) {
       console.error("Failed to fetch payouts", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPayouts = payouts.filter(item => {
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    const matchesSource = sourceFilter === 'ALL' || item.source === sourceFilter;
    const matchesAccount = item.account_number.toLowerCase().includes(accountSearch.toLowerCase());
    const matchesBeneficiary = item.beneficiary_name.toLowerCase().includes(beneficiarySearch.toLowerCase());
    
    let matchesAmount = true;
    const amount = parseFloat(item.amount);
    if (minAmount && amount < parseFloat(minAmount)) matchesAmount = false;
    if (maxAmount && amount > parseFloat(maxAmount)) matchesAmount = false;

    let matchesDate = true;
    if (dateFilter?.from) {
        const itemDate = new Date(item.created_at);
        const fromDate = new Date(dateFilter.from);
        fromDate.setHours(0, 0, 0, 0);
        
        const toDate = dateFilter.to ? new Date(dateFilter.to) : new Date(dateFilter.from);
        toDate.setHours(23, 59, 59, 999);

        matchesDate = itemDate >= fromDate && itemDate <= toDate;
    }

    return matchesStatus && matchesSource && matchesAccount && matchesBeneficiary && matchesAmount && matchesDate;
  });

  const resetFilters = () => {
      setStatusFilter('ALL');
      setSourceFilter('ALL');
      setAccountSearch('');
      setBeneficiarySearch('');
      setMinAmount('');
      setMaxAmount('');
      setDateFilter(undefined);
  };

  const handleExport = () => {
      if (filteredPayouts.length === 0) {
          toast.error("No payouts to export");
          return;
      }
      
      const csvContent = [
          ["ID", "Order ID", "Beneficiary", "Account", "Amount", "Status", "Date"],
          ...filteredPayouts.map(p => [
              p.id,
              p.mOrderId,
              p.beneficiary_name,
              p.account_number,
              p.amount,
              p.status,
              new Date(p.created_at).toLocaleString()
          ])
      ].map(e => e.join(",")).join("\n");

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `payouts_export_${Date.now()}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  // Helpers removed - using shared utils

  const columns = [
      {
         accessorKey: "mOrderId",
         header: "Order ID",
         cell: ({ row }) => <div className="font-mono text-xs">{row.getValue("mOrderId")}</div>,
      },
      {
         accessorKey: "beneficiary_name",
         header: ({ column }) => (
            <Button variant="ghost" className="p-0 hover:bg-transparent" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
               Beneficiary <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
         ),
         cell: ({ row }) => (
            <div className="flex flex-col">
                <div className="flex items-center gap-2">
                    <span className="font-medium">{row.getValue("beneficiary_name")}</span>
                    {row.original.source === 'ONE_TIME' && (
                        <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 border-blue-500/30 text-blue-400 bg-blue-500/10">One-Time</Badge>
                    )}
                </div>
                <div className="text-xs text-muted-foreground font-mono mt-0.5">
                    {row.original.account_number}
                </div>
            </div>
         )
      },
      {
        accessorKey: "amount",
        header: ({ column }) => (
            <Button variant="ghost" className="p-0 hover:bg-transparent" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
               Amount <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => <div className="font-medium">{formatAmount(row.getValue("amount"))}</div>,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
      },
      {
        accessorKey: "created_at",
        header: ({ column }) => (
            <Button variant="ghost" className="p-0 hover:bg-transparent" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
               Date <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => <div className="text-sm text-muted-foreground">{formatTimestamp(row.getValue("created_at"))}</div>,
      },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight">Payouts</h2>
        <div className="flex gap-4">
             <Button onClick={handleExport} variant="outline" className="gap-2">
                <Download className="h-4 w-4" /> Export CSV
            </Button>
            <Link href="/payouts/new">
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Create Payout
                </Button>
            </Link>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4 items-end sm:items-center flex-wrap">
              {/* Beneficiary Search */}
              <div className="w-full sm:w-[250px] relative">
                   <Input 
                       placeholder="Search Beneficiary..." 
                       value={beneficiarySearch}
                       onChange={(e) => setBeneficiarySearch(e.target.value)}
                       className="bg-transparent"
                   />
              </div>

              {/* Account Search */}
              <div className="w-full sm:w-[250px] relative">
                   <Input 
                       placeholder="Search Account No..." 
                       value={accountSearch}
                       onChange={(e) => setAccountSearch(e.target.value)}
                       className="bg-transparent"
                   />
              </div>

              {/* Status Filter */}
                <div className="w-full sm:w-[150px]">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger>
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Status</SelectItem>
                            <SelectItem value="INITIAL">Initial</SelectItem>
                            <SelectItem value="SUCCESS">Success</SelectItem>
                            <SelectItem value="PROCESSING">Processing</SelectItem>
                            <SelectItem value="FAILED">Failed</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Source Filter */}
                <div className="w-full sm:w-[150px]">
                     <Select value={sourceFilter} onValueChange={setSourceFilter}>
                        <SelectTrigger>
                            <SelectValue placeholder="Source" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Sources</SelectItem>
                            <SelectItem value="SAVED">Saved Beneficiary</SelectItem>
                            <SelectItem value="ONE_TIME">One-Time</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Date Filter */}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn(
                                "w-full sm:w-[240px] justify-start text-left font-normal",
                                !dateFilter && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateFilter?.from ? (
                                dateFilter.to ? (
                                    <>
                                        {format(dateFilter.from, "LLL dd")} to {format(dateFilter.to, "LLL dd")}
                                    </>
                                ) : (
                                    format(dateFilter.from, "LLL dd")
                                )
                            ) : (
                                <span>Date Range</span>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        {/* ... Calendar Content ... */}
                        <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={dateFilter?.from}
                            selected={dateFilter}
                            onSelect={setDateFilter}
                            numberOfMonths={2}
                        />
                    </PopoverContent>
                </Popover>

                {/* Reset Button */}
                <Button variant="ghost" onClick={resetFilters} className="px-2 lg:px-3 text-muted-foreground hover:text-foreground">
                    Reset
                </Button>
        </div>
                <div className="flex flex-col sm:flex-row gap-4 sm:items-center pt-2">
             <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Amount Range:</span>
             <div className="flex items-center gap-2 w-full sm:w-auto">
                 <Input 
                     type="number" 
                     placeholder="Min" 
                     className="w-full sm:w-[120px]" 
                     value={minAmount}
                     onChange={(e) => setMinAmount(e.target.value)}
                 />
                 <span className="text-muted-foreground">-</span>
                 <Input 
                     type="number" 
                     placeholder="Max" 
                     className="w-full sm:w-[120px]" 
                     value={maxAmount}
                     onChange={(e) => setMaxAmount(e.target.value)}
                 />
             </div>
          </div>
      </div>
      
      {loading ? <div>Loading...</div> : <DataTable columns={columns} data={filteredPayouts} />}
    </div>
  );
}

"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"

// Schema for One-time payout (all fields required)
const oneTimeSchema = z.object({
  beneficiary_name: z.string().min(2),
  account_number: z.string().min(8),
  ifsc_code: z.string().min(4),
  amount: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: "Amount must be greater than 0"
  }),
  description: z.string().optional(),
})

// Schema for Existing Beneficiary (select ID required)
const existingSchema = z.object({
  beneficiary_id: z.string().min(1, { message: "Select a beneficiary" }),
  amount: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: "Amount must be greater than 0"
  }),
  description: z.string().optional(),
})

export function PayoutForm() {
  const router = useRouter()
  const [mode, setMode] = useState("onetime")
  const [loading, setLoading] = useState(false)
  const [beneficiaries, setBeneficiaries] = useState([])

  // Fetch real beneficiaries when component mounts
  useEffect(() => {
    const fetchBeneficiaries = async () => {
      try {
        const response = await api.get('/beneficiaries');
        if (response.success && response.data) {
          setBeneficiaries(response.data.beneficiaries || []);
        } else if (Array.isArray(response.data)) {
          setBeneficiaries(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch beneficiaries", error);
        toast.error("Failed to load beneficiaries");
      }
    };
    fetchBeneficiaries();
  }, []);
  
  return (
    <Tabs defaultValue="onetime" onValueChange={setMode} className="w-full max-w-2xl mx-auto">
      <TabsList className="grid w-full grid-cols-2 mb-8">
        <TabsTrigger value="onetime">One-Time Payout</TabsTrigger>
        <TabsTrigger value="existing">Saved Beneficiary</TabsTrigger>
      </TabsList>
      
      <TabsContent value="onetime">
         <OneTimePayoutForm onSubmit={async (data) => {
             setLoading(true)
             console.log("Processing One-time", data)
             // Simulate API
             setTimeout(() => {
                 setLoading(false)
                 router.push('/transactions')
             }, 1000)
         }} loading={loading} />
      </TabsContent>
      
      <TabsContent value="existing">
          <ExistingPayoutForm onSubmit={async (data) => {
             setLoading(true)
              console.log("Processing Existing", data)
             // Simulate API
             setTimeout(() => {
                 setLoading(false)
                 router.push('/transactions')
             }, 1000)
         }} loading={loading} beneficiaries={beneficiaries} />
      </TabsContent>
    </Tabs>
  )
}

import { api } from "@/services/api"
import { toast } from "sonner"

function OneTimePayoutForm({ onSubmit, loading }) {
    const router = useRouter()
    const form = useForm({
        resolver: zodResolver(oneTimeSchema),
        defaultValues: {
            beneficiary_name: "",
            account_number: "",
            ifsc_code: "",
            amount: "",
            description: "",
            upi: "", 
        }
    })

    const handleFormSubmit = async (data) => {
        try {
            const payload = {
                beneficiary_name: data.beneficiary_name,
                account_number: data.account_number,
                ifsc_code: data.ifsc_code,
                upi: data.upi || '',
                amount: parseFloat(data.amount).toFixed(2),
                source: 'ONE_TIME',
                description: data.description || ''
            };

            await onSubmit(payload); 
            
            const response = await api.post('/payouts', payload);
            
            if (response.success || response.data) {
                toast.success("Payout Initiated Successfully");
                router.push('/payouts');
            } else {
                console.error("Payout failed", response);
                toast.error("Payout failed. Please try again.");
            }
        } catch (error) {
            console.error("Payout error", error);
            toast.error("An error occurred while processing the payout.");
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>One-Time Transfer</CardTitle>
                <CardDescription>Enter beneficiary details for a single payout.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="beneficiary_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Beneficiary Name</FormLabel>
                                    <FormControl><Input placeholder="Name" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="account_number"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Account Number</FormLabel>
                                        <FormControl><Input placeholder="Account No" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="ifsc_code"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>IFSC Code</FormLabel>
                                        <FormControl><Input placeholder="IFSC" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        
                        <FormField
                            control={form.control}
                            name="upi"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>UPI ID (Optional)</FormLabel>
                                    <FormControl><Input placeholder="username@upi" {...field} /></FormControl>
                                    <FormDescription>Provide UPI ID OR Bank Account details</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Amount (INR)</FormLabel>
                                    <FormControl><Input type="number" placeholder="0.00" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Processing..." : "Proceed to Pay"}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}

function ExistingPayoutForm({ onSubmit, loading, beneficiaries }) {
    const form = useForm({
        resolver: zodResolver(existingSchema),
        defaultValues: {
            beneficiary_id: "",
            amount: "",
            description: "",
        }
    })

    return (
        <Card>
             <CardHeader>
                <CardTitle>Select Beneficiary</CardTitle>
                <CardDescription>Choose a saved beneficiary for quick transfer.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                         <FormField
                            control={form.control}
                            name="beneficiary_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Beneficiary</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a beneficiary" />
                                        </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="max-h-[200px]">
                                            {beneficiaries.map(ben => (
                                                <SelectItem key={ben.id} value={ben.id}>
                                                    {ben.name} - {ben.bank_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Amount (INR)</FormLabel>
                                    <FormControl><Input type="number" placeholder="0.00" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full" disabled={loading}>
                             {loading ? "Processing..." : "Proceed to Pay"}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}

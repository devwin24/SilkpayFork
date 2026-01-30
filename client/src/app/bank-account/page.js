export default function BankAccountPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Bank Account</h2>
      </div>
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
        <h3 className="text-lg font-semibold">Wallet Balance</h3>
        <p className="text-sm text-muted-foreground mt-2">Manage your digital wallet and transaction ledger.</p>
        <div className="mt-4 p-4 bg-muted rounded-md border text-center text-muted-foreground">
           Bank Account / Wallet features coming soon...
        </div>
      </div>
    </div>
  );
}

import { Badge } from "@/components/ui/badge";
import { getStatusBadgeColor } from "@/utils/helpers";

export function StatusBadge({ status }) {
    const s = status?.toUpperCase();
    const className = getStatusBadgeColor(s);
    let variant = "secondary";
    
    // Determine variant mostly for semantic meaning, though className overrides colors
    if (s === 'SUCCESS' || s === 'ACTIVE') variant = "default";
    else if (s === 'FAILED' || s === 'REJECTED' || s === 'INACTIVE') variant = "destructive";
    
    return <Badge variant={variant} className={className}>{status}</Badge>;
}

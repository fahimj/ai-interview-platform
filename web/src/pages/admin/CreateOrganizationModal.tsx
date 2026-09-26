import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Building2 } from "lucide-react";
import { adminOrganizationsApi } from "@/services/adminOrganizations";

interface CreateOrganizationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOrgCreated: () => void;
}

export default function CreateOrganizationModal({
  open,
  onOpenChange,
  onOrgCreated,
}: CreateOrganizationModalProps) {
  const [name, setName] = useState("");
  const [scheme, setScheme] = useState("");
  const [host, setHost] = useState("");
  const [isSchemeManual, setIsSchemeManual] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setName("");
    setScheme("");
    setHost("");
    setIsSchemeManual(false);
    setError(null);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!isSchemeManual) {
      const slug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setScheme(slug);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await adminOrganizationsApi.create({
        name: name.trim(),
        scheme: scheme.trim().toLowerCase(),
        host: host.trim() || undefined,
      });
      resetForm();
      onOrgCreated();
      onOpenChange(false);
    } catch (err: any) {
      const msg = err.response?.data?.errors?.[0]?.message || err.response?.data?.message || "Failed to create organization.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) resetForm();
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Provision Client Organization
          </DialogTitle>
          <DialogDescription>
            Register a new enterprise client tenant. This establishes the cryptographic and query isolation boundary for all client assessments.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md border border-destructive/20" role="alert">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="org-name">Organization Name</Label>
            <Input
              id="org-name"
              placeholder="e.g. Tokopedia Indonesia"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="org-scheme">Tenant Scheme Identifier</Label>
              <span className="text-xs text-muted-foreground">Used in JWT claims & schemas</span>
            </div>
            <Input
              id="org-scheme"
              placeholder="e.g. tokopedia"
              value={scheme}
              onChange={(e) => {
                setIsSchemeManual(true);
                setScheme(e.target.value);
              }}
              required
              pattern="^[a-z0-9\-_]+$"
              title="Only lowercase letters, numbers, hyphens, and underscores"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="org-host">Primary Host / Domain (Optional)</Label>
              <span className="text-xs text-muted-foreground">Defaults to scheme.localhost</span>
            </div>
            <Input
              id="org-host"
              placeholder="e.g. tokopedia.com"
              value={host}
              onChange={(e) => setHost(e.target.value)}
            />
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Organization
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface SocialMediaManualEntryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: number;
  network: 'twitter' | 'linkedin' | 'threads';
  networkLabel: string; // "Twitter/X", "LinkedIn", "Threads"
  onSuccess?: () => void;
}

export function SocialMediaManualEntryModal({ 
  open, 
  onOpenChange, 
  companyId, 
  network,
  networkLabel,
  onSuccess 
}: SocialMediaManualEntryModalProps) {
  const [formData, setFormData] = useState({
    recordDate: new Date().toISOString().split('T')[0], // today's date in YYYY-MM-DD
    followers: 0,
    posts: 0,
    totalLikes: 0,
    totalComments: 0,
    totalShares: 0,
    totalViews: 0,
    totalReach: 0,
    totalImpressions: 0,
    notes: '',
  });

  const saveMutation = trpc.socialMediaMetrics.save.useMutation({
    onSuccess: () => {
      toast.success(`Métricas do ${networkLabel} salvas com sucesso!`);
      onOpenChange(false);
      // Reset form
      setFormData({
        recordDate: new Date().toISOString().split('T')[0],
        followers: 0,
        posts: 0,
        totalLikes: 0,
        totalComments: 0,
        totalShares: 0,
        totalViews: 0,
        totalReach: 0,
        totalImpressions: 0,
        notes: '',
      });
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(`Erro ao salvar métricas: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate({
      companyId,
      network,
      ...formData,
    });
  };

  const handleNumberChange = (field: keyof typeof formData, value: string) => {
    const numValue = parseInt(value) || 0;
    setFormData(prev => ({ ...prev, [field]: numValue }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar Dados Manuais - {networkLabel}</DialogTitle>
          <DialogDescription>
            Insira as métricas do {networkLabel} manualmente para acompanhamento histórico
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="recordDate">Data do Registro</Label>
              <Input
                id="recordDate"
                type="date"
                value={formData.recordDate}
                onChange={(e) => setFormData(prev => ({ ...prev, recordDate: e.target.value }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="followers">Seguidores</Label>
              <Input
                id="followers"
                type="number"
                min="0"
                value={formData.followers}
                onChange={(e) => handleNumberChange('followers', e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="posts">Total de Posts</Label>
              <Input
                id="posts"
                type="number"
                min="0"
                value={formData.posts}
                onChange={(e) => handleNumberChange('posts', e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="totalLikes">Total de Likes</Label>
              <Input
                id="totalLikes"
                type="number"
                min="0"
                value={formData.totalLikes}
                onChange={(e) => handleNumberChange('totalLikes', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="totalComments">Total de Comentários</Label>
              <Input
                id="totalComments"
                type="number"
                min="0"
                value={formData.totalComments}
                onChange={(e) => handleNumberChange('totalComments', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="totalShares">Total de Compartilhamentos</Label>
              <Input
                id="totalShares"
                type="number"
                min="0"
                value={formData.totalShares}
                onChange={(e) => handleNumberChange('totalShares', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="totalViews">Total de Visualizações</Label>
              <Input
                id="totalViews"
                type="number"
                min="0"
                value={formData.totalViews}
                onChange={(e) => handleNumberChange('totalViews', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="totalReach">Alcance Total</Label>
              <Input
                id="totalReach"
                type="number"
                min="0"
                value={formData.totalReach}
                onChange={(e) => handleNumberChange('totalReach', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="totalImpressions">Impressões Totais</Label>
              <Input
                id="totalImpressions"
                type="number"
                min="0"
                value={formData.totalImpressions}
                onChange={(e) => handleNumberChange('totalImpressions', e.target.value)}
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="notes">Notas (opcional)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Adicione observações sobre este registro..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "Salvando..." : "Salvar Métricas"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

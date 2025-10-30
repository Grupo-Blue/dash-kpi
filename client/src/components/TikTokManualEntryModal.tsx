import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface TikTokManualEntryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: number;
  onSuccess?: () => void;
}

export function TikTokManualEntryModal({ open, onOpenChange, companyId, onSuccess }: TikTokManualEntryModalProps) {
  const [formData, setFormData] = useState({
    recordDate: new Date().toISOString().split('T')[0], // today's date in YYYY-MM-DD
    followers: 0,
    videos: 0,
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
    totalShares: 0,
    notes: '',
  });

  const saveMutation = trpc.tiktokMetrics.save.useMutation({
    onSuccess: () => {
      toast.success("Métricas do TikTok salvas com sucesso!");
      onOpenChange(false);
      // Reset form
      setFormData({
        recordDate: new Date().toISOString().split('T')[0],
        followers: 0,
        videos: 0,
        totalViews: 0,
        totalLikes: 0,
        totalComments: 0,
        totalShares: 0,
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
      ...formData,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar Métricas do TikTok Manualmente</DialogTitle>
          <DialogDescription>
            Insira as métricas do TikTok para criar um registro histórico. Esses dados serão usados para calcular KPIs e crescimento.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Data */}
            <div className="col-span-2">
              <Label htmlFor="recordDate">Data do Registro</Label>
              <Input
                id="recordDate"
                type="date"
                value={formData.recordDate}
                onChange={(e) => setFormData({ ...formData, recordDate: e.target.value })}
                required
              />
            </div>

            {/* Seguidores */}
            <div>
              <Label htmlFor="followers">Seguidores</Label>
              <Input
                id="followers"
                type="number"
                min="0"
                value={formData.followers}
                onChange={(e) => setFormData({ ...formData, followers: parseInt(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>

            {/* Vídeos */}
            <div>
              <Label htmlFor="videos">Total de Vídeos</Label>
              <Input
                id="videos"
                type="number"
                min="0"
                value={formData.videos}
                onChange={(e) => setFormData({ ...formData, videos: parseInt(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>

            {/* Visualizações */}
            <div>
              <Label htmlFor="totalViews">Total de Visualizações</Label>
              <Input
                id="totalViews"
                type="number"
                min="0"
                value={formData.totalViews}
                onChange={(e) => setFormData({ ...formData, totalViews: parseInt(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>

            {/* Likes */}
            <div>
              <Label htmlFor="totalLikes">Total de Likes</Label>
              <Input
                id="totalLikes"
                type="number"
                min="0"
                value={formData.totalLikes}
                onChange={(e) => setFormData({ ...formData, totalLikes: parseInt(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>

            {/* Comentários */}
            <div>
              <Label htmlFor="totalComments">Total de Comentários</Label>
              <Input
                id="totalComments"
                type="number"
                min="0"
                value={formData.totalComments}
                onChange={(e) => setFormData({ ...formData, totalComments: parseInt(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>

            {/* Compartilhamentos */}
            <div>
              <Label htmlFor="totalShares">Total de Compartilhamentos</Label>
              <Input
                id="totalShares"
                type="number"
                min="0"
                value={formData.totalShares}
                onChange={(e) => setFormData({ ...formData, totalShares: parseInt(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>

            {/* Notas */}
            <div className="col-span-2">
              <Label htmlFor="notes">Notas (opcional)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Ex: Dados coletados do TikTok Analytics em 30/10/2025"
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

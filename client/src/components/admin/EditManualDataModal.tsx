import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { format } from "date-fns";

interface EditManualDataModalProps {
  record: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditManualDataModal({
  record,
  open,
  onOpenChange,
  onSuccess,
}: EditManualDataModalProps) {
  const [formData, setFormData] = useState({
    recordDate: "",
    followers: "",
    videos: "",
    posts: "",
    totalViews: "",
    totalLikes: "",
    totalComments: "",
    totalShares: "",
    totalReach: "",
    totalImpressions: "",
    notes: "",
  });

  useEffect(() => {
    if (record) {
      setFormData({
        recordDate: format(new Date(record.recordDate), "yyyy-MM-dd"),
        followers: record.followers?.toString() || "",
        videos: record.videos?.toString() || "",
        posts: record.posts?.toString() || "",
        totalViews: record.totalViews?.toString() || "",
        totalLikes: record.totalLikes?.toString() || "",
        totalComments: record.totalComments?.toString() || "",
        totalShares: record.totalShares?.toString() || "",
        totalReach: record.totalReach?.toString() || "",
        totalImpressions: record.totalImpressions?.toString() || "",
        notes: record.notes || "",
      });
    }
  }, [record]);

  const updateTikTokMutation = trpc.tiktokMetrics.update.useMutation({
    onSuccess: () => {
      toast.success("Registro atualizado com sucesso!");
      onSuccess();
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar: ${error.message}`);
    },
  });

  const updateSocialMutation = trpc.socialMediaMetrics.update.useMutation({
    onSuccess: () => {
      toast.success("Registro atualizado com sucesso!");
      onSuccess();
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const baseData = {
      id: record.id,
      recordDate: new Date(formData.recordDate),
      followers: formData.followers ? parseInt(formData.followers) : null,
      totalLikes: formData.totalLikes ? parseInt(formData.totalLikes) : null,
      totalComments: formData.totalComments ? parseInt(formData.totalComments) : null,
      totalShares: formData.totalShares ? parseInt(formData.totalShares) : null,
      notes: formData.notes || null,
    };

    if (record.network === "tiktok") {
      updateTikTokMutation.mutate({
        ...baseData,
        videos: formData.videos ? parseInt(formData.videos) : null,
        totalViews: formData.totalViews ? parseInt(formData.totalViews) : null,
      });
    } else {
      updateSocialMutation.mutate({
        ...baseData,
        posts: formData.posts ? parseInt(formData.posts) : null,
        totalViews: formData.totalViews ? parseInt(formData.totalViews) : null,
        totalReach: formData.totalReach ? parseInt(formData.totalReach) : null,
        totalImpressions: formData.totalImpressions ? parseInt(formData.totalImpressions) : null,
      });
    }
  };

  const isTikTok = record?.network === "tiktok";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Registro Manual - {record?.networkLabel}</DialogTitle>
          <DialogDescription>
            Atualize as métricas do registro selecionado
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="recordDate">Data do Registro *</Label>
              <Input
                id="recordDate"
                type="date"
                value={formData.recordDate}
                onChange={(e) => setFormData({ ...formData, recordDate: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="followers">Seguidores</Label>
              <Input
                id="followers"
                type="number"
                min="0"
                value={formData.followers}
                onChange={(e) => setFormData({ ...formData, followers: e.target.value })}
              />
            </div>

            {isTikTok ? (
              <div className="space-y-2">
                <Label htmlFor="videos">Total de Vídeos</Label>
                <Input
                  id="videos"
                  type="number"
                  min="0"
                  value={formData.videos}
                  onChange={(e) => setFormData({ ...formData, videos: e.target.value })}
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="posts">Total de Posts</Label>
                <Input
                  id="posts"
                  type="number"
                  min="0"
                  value={formData.posts}
                  onChange={(e) => setFormData({ ...formData, posts: e.target.value })}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="totalViews">Total de Visualizações</Label>
              <Input
                id="totalViews"
                type="number"
                min="0"
                value={formData.totalViews}
                onChange={(e) => setFormData({ ...formData, totalViews: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalLikes">Total de Likes</Label>
              <Input
                id="totalLikes"
                type="number"
                min="0"
                value={formData.totalLikes}
                onChange={(e) => setFormData({ ...formData, totalLikes: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalComments">Total de Comentários</Label>
              <Input
                id="totalComments"
                type="number"
                min="0"
                value={formData.totalComments}
                onChange={(e) => setFormData({ ...formData, totalComments: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalShares">Total de Compartilhamentos</Label>
              <Input
                id="totalShares"
                type="number"
                min="0"
                value={formData.totalShares}
                onChange={(e) => setFormData({ ...formData, totalShares: e.target.value })}
              />
            </div>

            {!isTikTok && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="totalReach">Alcance Total</Label>
                  <Input
                    id="totalReach"
                    type="number"
                    min="0"
                    value={formData.totalReach}
                    onChange={(e) => setFormData({ ...formData, totalReach: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="totalImpressions">Impressões Totais</Label>
                  <Input
                    id="totalImpressions"
                    type="number"
                    min="0"
                    value={formData.totalImpressions}
                    onChange={(e) => setFormData({ ...formData, totalImpressions: e.target.value })}
                  />
                </div>
              </>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas (opcional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Adicione observações sobre este registro..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={updateTikTokMutation.isLoading || updateSocialMutation.isLoading}
            >
              {updateTikTokMutation.isLoading || updateSocialMutation.isLoading
                ? "Salvando..."
                : "Salvar Alterações"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

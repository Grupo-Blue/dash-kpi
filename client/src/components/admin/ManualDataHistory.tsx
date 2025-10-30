import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Filter, X } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { EditManualDataModal } from "./EditManualDataModal";

export function ManualDataHistory() {
  const [companyFilter, setCompanyFilter] = useState<string>("all");
  const [networkFilter, setNetworkFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editRecord, setEditRecord] = useState<any>(null);

  // Fetch all manual data records
  const { data: tiktokRecords, refetch: refetchTikTok } = trpc.tiktokMetrics.getAll.useQuery();
  const { data: socialRecords, refetch: refetchSocial } = trpc.socialMediaMetrics.getAll.useQuery();
  const { data: companies } = trpc.companies.getAll.useQuery();

  // Delete mutations
  const deleteTikTokMutation = trpc.tiktokMetrics.delete.useMutation({
    onSuccess: () => {
      toast.success("Registro excluído com sucesso!");
      refetchTikTok();
      setDeleteId(null);
    },
    onError: (error) => {
      toast.error(`Erro ao excluir: ${error.message}`);
    },
  });

  const deleteSocialMutation = trpc.socialMediaMetrics.delete.useMutation({
    onSuccess: () => {
      toast.success("Registro excluído com sucesso!");
      refetchSocial();
      setDeleteId(null);
    },
    onError: (error) => {
      toast.error(`Erro ao excluir: ${error.message}`);
    },
  });

  // Combine and format all records
  const allRecords = [
    ...(tiktokRecords || []).map(r => ({
      ...r,
      network: "tiktok" as const,
      networkLabel: "TikTok",
    })),
    ...(socialRecords || []).map(r => ({
      ...r,
      networkLabel: r.network === "twitter" ? "Twitter/X" :
                    r.network === "linkedin" ? "LinkedIn" :
                    r.network === "threads" ? "Threads" : r.network,
    })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Filter records
  const filteredRecords = allRecords.filter(record => {
    const matchesCompany = companyFilter === "all" || record.companyId === parseInt(companyFilter);
    const matchesNetwork = networkFilter === "all" || record.network === networkFilter;
    const companyName = companies?.find(c => c.id === record.companyId)?.name || "";
    const matchesSearch = searchTerm === "" ||
      companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.networkLabel.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCompany && matchesNetwork && matchesSearch;
  });

  const handleDelete = (id: number, network: string) => {
    if (network === "tiktok") {
      deleteTikTokMutation.mutate({ id });
    } else {
      deleteSocialMutation.mutate({ id });
    }
  };

  const getCompanyName = (companyId: number) => {
    return companies?.find(c => c.id === companyId)?.name || "Desconhecida";
  };

  const formatMetrics = (record: any) => {
    if (record.network === "tiktok") {
      return `${record.followers || 0} seguidores, ${record.videos || 0} vídeos, ${record.totalViews || 0} views`;
    } else {
      return `${record.followers || 0} seguidores, ${record.posts || 0} posts`;
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Registros Manuais</CardTitle>
          <CardDescription>
            Visualize, edite e exclua registros manuais de redes sociais
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                placeholder="Buscar por empresa ou rede social..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={companyFilter} onValueChange={setCompanyFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Todas as empresas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as empresas</SelectItem>
                {companies?.map(company => (
                  <SelectItem key={company.id} value={company.id.toString()}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={networkFilter} onValueChange={setNetworkFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Todas as redes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as redes</SelectItem>
                <SelectItem value="tiktok">TikTok</SelectItem>
                <SelectItem value="twitter">Twitter/X</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
                <SelectItem value="threads">Threads</SelectItem>
              </SelectContent>
            </Select>
            {(companyFilter !== "all" || networkFilter !== "all" || searchTerm) && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  setCompanyFilter("all");
                  setNetworkFilter("all");
                  setSearchTerm("");
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Rede Social</TableHead>
                  <TableHead>Métricas</TableHead>
                  <TableHead>Registrado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      Nenhum registro encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRecords.map((record) => (
                    <TableRow key={`${record.network}-${record.id}`}>
                      <TableCell>
                        {format(new Date(record.recordDate), "dd/MM/yyyy", { locale: ptBR })}
                      </TableCell>
                      <TableCell>{getCompanyName(record.companyId)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{record.networkLabel}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatMetrics(record)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(record.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditRecord(record)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteId(record.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Summary */}
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span>
              {filteredRecords.length} registro{filteredRecords.length !== 1 ? "s" : ""} encontrado{filteredRecords.length !== 1 ? "s" : ""}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este registro? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId) {
                  const record = allRecords.find(r => r.id === deleteId);
                  if (record) {
                    handleDelete(deleteId, record.network);
                  }
                }
              }}
              className="bg-destructive hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Modal */}
      {editRecord && (
        <EditManualDataModal
          record={editRecord}
          open={!!editRecord}
          onOpenChange={(open) => !open && setEditRecord(null)}
          onSuccess={() => {
            refetchTikTok();
            refetchSocial();
            setEditRecord(null);
          }}
        />
      )}
    </>
  );
}

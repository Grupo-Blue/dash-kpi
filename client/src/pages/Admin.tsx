import DashboardLayout from "@/components/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, ListChecks, Settings as SettingsIcon } from "lucide-react";
import { ManualDataHistory } from "@/components/admin/ManualDataHistory";

export default function Admin() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Administração</h1>
          <p className="text-muted-foreground">
            Gerencie dados manuais, status das APIs e configurações das empresas
          </p>
        </div>

        <Tabs defaultValue="history" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[600px]">
            <TabsTrigger value="history" className="flex items-center gap-2">
              <ListChecks className="h-4 w-4" />
              <span>Histórico de Registros</span>
            </TabsTrigger>
            <TabsTrigger value="apis" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span>Status das APIs</span>
            </TabsTrigger>
            <TabsTrigger value="companies" className="flex items-center gap-2">
              <SettingsIcon className="h-4 w-4" />
              <span>Gerenciar Empresas</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="history" className="space-y-4">
            <ManualDataHistory />
          </TabsContent>

          <TabsContent value="apis" className="space-y-4">
            <div className="rounded-lg border p-8 text-center text-muted-foreground">
              <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Status das APIs será implementado em breve</p>
            </div>
          </TabsContent>

          <TabsContent value="companies" className="space-y-4">
            <div className="rounded-lg border p-8 text-center text-muted-foreground">
              <SettingsIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Gerenciamento de empresas será implementado em breve</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  QrCode,
  Bike,
  ClipboardList,
  Utensils,
  MessageCircle,
  Award,
  Star,
  FileText,
  Gift,
  Heart,
  RefreshCw,
  Check,
  Sparkles,
  Crown,
  Plus,
  Settings,
  ExternalLink,
  Loader2,
  Scissors,
  Percent,
  Monitor,
  Users,
  MessageSquare,
  Truck,
  Power,
  MoreVertical,
  Glasses,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getTools, seedTools, purchaseTool, getTestUserTools, deactivateTool } from "@/lib/actions/tools";
import { toolCategories } from "@/lib/constants/tools";
import { toast } from "sonner";

// Icon mapping
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Calendar,
  QrCode,
  Bike,
  ClipboardList,
  Utensils,
  MessageCircle,
  Award,
  Star,
  FileText,
  Gift,
  Heart,
  RefreshCw,
  Scissors,
  Percent,
  Monitor,
  Users,
  MessageSquare,
  Truck,
  Glasses,
};

type Tool = {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  price: number;
  features: string[];
  isActive: boolean;
  order: number;
};

export default function FerramentasPage() {
  const router = useRouter();
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [userPlan] = useState("STARTER"); // TODO: Get from auth
  const [purchasedTools, setPurchasedTools] = useState<string[]>([]);

  // TEMPORÁRIO: Liberar todas as ferramentas para o plano Starter
  const TEMP_FREE_TOOLS = true;
  const isProfessional = TEMP_FREE_TOOLS || userPlan === "PROFESSIONAL" || userPlan === "ENTERPRISE";

  useEffect(() => {
    loadTools();
  }, []);

  async function loadTools() {
    setLoading(true);
    try {
      const data = await getTools();
      if (data.length === 0) {
        // Seed default tools if none exist
        await seedTools();
        const seededData = await getTools();
        setTools(seededData);
      } else {
        setTools(data);
      }

      // Carrega ferramentas já ativadas (TEMPORÁRIO: usuário de teste)
      const userTools = await getTestUserTools();
      setPurchasedTools(userTools.map((ut) => ut.toolId));
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar ferramentas");
    } finally {
      setLoading(false);
    }
  }

  async function handlePurchase(toolId: string) {
    setPurchasing(toolId);
    try {
      // TEMPORÁRIO: Usa usuário de teste
      await purchaseTool("demo-user-id", toolId);
      toast.success("Ferramenta ativada com sucesso!");
      // Atualiza a lista de ferramentas compradas
      setPurchasedTools((prev) => [...prev, toolId]);
      // Refresh para atualizar o sidebar e outras áreas
      router.refresh();
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Erro ao adquirir ferramenta");
      }
    } finally {
      setPurchasing(null);
    }
  }

  async function handleDeactivate(toolId: string) {
    setPurchasing(toolId);
    try {
      await deactivateTool(toolId);
      toast.success("Ferramenta desativada com sucesso!");
      // Remove da lista de ferramentas compradas
      setPurchasedTools((prev) => prev.filter((id) => id !== toolId));
      // Refresh para atualizar o sidebar e outras áreas
      router.refresh();
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Erro ao desativar ferramenta");
      }
    } finally {
      setPurchasing(null);
    }
  }

  const categories = Array.from(new Set(tools.map((t) => t.category)));

  const groupedTools = categories.reduce((acc, category) => {
    acc[category] = tools.filter((t) => t.category === category);
    return acc;
  }, {} as Record<string, Tool[]>);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Loja de Ferramentas</h1>
              <p className="text-slate-500 text-sm">
                Expanda as funcionalidades do seu site com plug-ins profissionais
              </p>
            </div>
          </div>
        </div>

        {/* Plan Banner */}
        {TEMP_FREE_TOOLS ? (
          <Card className="mb-8 border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-green-100">
                    <Sparkles className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-slate-900 flex items-center gap-2">
                      🎉 Promoção de Lançamento!
                      <Badge className="bg-green-500 text-white">GRÁTIS</Badge>
                    </h3>
                    <p className="text-sm text-slate-500">
                      Todas as ferramentas estão liberadas gratuitamente por tempo limitado. Aproveite!
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className={`mb-8 border-2 ${isProfessional ? "border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50" : "border-slate-200"}`}>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${isProfessional ? "bg-purple-100" : "bg-slate-100"}`}>
                    <Crown className={`w-8 h-8 ${isProfessional ? "text-purple-600" : "text-slate-400"}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-slate-900">
                      {isProfessional ? "Plano Professional Ativo" : "Você está no Plano Starter"}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {isProfessional
                        ? "Você tem acesso a todas as ferramentas gratuitamente!"
                        : "Cada ferramenta custa R$ 10/mês. Faça upgrade para o plano Professional e tenha acesso a todas gratuitamente."}
                    </p>
                  </div>
                </div>
                {!isProfessional && (
                  <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                    <Crown className="w-4 h-4 mr-2" />
                    Fazer Upgrade
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tools by Category */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="bg-white border p-1 h-auto flex-wrap">
            <TabsTrigger value="all" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Todas
            </TabsTrigger>
            {categories.map((cat) => (
              <TabsTrigger
                key={cat}
                value={cat}
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                {toolCategories[cat] || cat}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <div className="space-y-10">
              {categories.map((category) => (
                <div key={category}>
                  <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    {toolCategories[category] || category}
                    <Badge variant="secondary">{groupedTools[category].length}</Badge>
                  </h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {groupedTools[category].map((tool) => (
                      <ToolCard
                        key={tool.id}
                        tool={tool}
                        isPurchased={purchasedTools.includes(tool.id)}
                        isProfessional={isProfessional}
                        purchasing={purchasing === tool.id}
                        onPurchase={() => handlePurchase(tool.id)}
                        onDeactivate={() => handleDeactivate(tool.id)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {categories.map((category) => (
            <TabsContent key={category} value={category} className="mt-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groupedTools[category].map((tool) => (
                  <ToolCard
                    key={tool.id}
                    tool={tool}
                    isPurchased={purchasedTools.includes(tool.id)}
                    isProfessional={isProfessional}
                    purchasing={purchasing === tool.id}
                    onPurchase={() => handlePurchase(tool.id)}
                    onDeactivate={() => handleDeactivate(tool.id)}
                  />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}

function ToolCard({
  tool,
  isPurchased,
  isProfessional,
  purchasing,
  onPurchase,
  onDeactivate,
}: {
  tool: Tool;
  isPurchased: boolean;
  isProfessional: boolean;
  purchasing: boolean;
  onPurchase: () => void;
  onDeactivate: () => void;
}) {
  const IconComponent = iconMap[tool.icon] || Sparkles;

  // Mapeamento de slugs para rotas de configuração
  const configRoutes: Record<string, string> = {
    "agendamentos-online": "/admin/agendamentos",
    "chat-whatsapp": "/admin/chat",
    "venda-lentes-oticas": "/admin/ferramentas/lentes",
  };

  const configRoute = configRoutes[tool.slug];

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-slate-200 overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="p-3 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl group-hover:from-blue-100 group-hover:to-purple-100 transition-colors">
            <IconComponent className="w-6 h-6 text-blue-600" />
          </div>
          <div className="text-right">
            {isPurchased ? (
              <Badge className="bg-green-100 text-green-700 border-green-200">
                Incluído
              </Badge>
            ) : isProfessional ? (
              <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                Incluído no Plano
              </Badge>
            ) : (
              <span className="text-xl font-bold text-slate-900">
                R$ {tool.price}
                <span className="text-xs font-normal text-slate-500">/mês</span>
              </span>
            )}
          </div>
        </div>
        <CardTitle className="text-lg mt-3">{tool.name}</CardTitle>
        <CardDescription className="text-sm">{tool.description}</CardDescription>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-2">
          {tool.features.slice(0, 4).map((feature, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-slate-600">
              <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
              <span>{feature}</span>
            </div>
          ))}
          {tool.features.length > 4 && (
            <p className="text-xs text-slate-400 pl-6">
              +{tool.features.length - 4} recursos
            </p>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-4 border-t">
        {isPurchased ? (
          <div className="flex gap-2 w-full">
            {configRoute ? (
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => window.location.href = configRoute}
              >
                <Settings className="w-4 h-4 mr-2" />
                Configurar
              </Button>
            ) : (
              <Button variant="outline" className="flex-1" disabled>
                <Settings className="w-4 h-4 mr-2" />
                Configurar
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {configRoute && (
                  <DropdownMenuItem onClick={() => window.open(configRoute, "_blank")}>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Abrir em nova aba
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={onDeactivate}
                  className="text-red-600 focus:text-red-600"
                  disabled={purchasing}
                >
                  <Power className="w-4 h-4 mr-2" />
                  Desativar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <Button
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            onClick={onPurchase}
            disabled={purchasing}
          >
            {purchasing ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Plus className="w-4 h-4 mr-2" />
            )}
            {isProfessional ? "Ativar Grátis" : "Adquirir Ferramenta"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

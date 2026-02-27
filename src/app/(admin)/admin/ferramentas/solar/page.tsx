'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sun,
  ArrowLeft,
  Plus,
  MoreVertical,
  FileText,
  Pencil,
  Trash2,
  Send,
  Phone,
  Mail,
  MapPin,
  Calculator,
  Users,
  Package,
  Calendar,
  BarChart3,
  TrendingUp,
  DollarSign,
  Zap,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  Paperclip,
  Download,
  File,
  Image,
  FileSpreadsheet,
  Upload,
  X,
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { SolarCalculatorsGrid } from '@/components/solar/SolarCalculators'
import { formatarMoeda, SOLAR_CONSTANTS } from '@/lib/solar-calculators'
import {
  getOrcamentos,
  createOrcamento,
  updateOrcamento,
  updateOrcamentoStatus,
  deleteOrcamento,
  getClientes,
  createCliente,
  getEstoque,
  createProdutoEstoque,
  registrarMovimentacao,
  getSolarStats,
  getArquivos,
} from '@/lib/actions/solar'

// Status labels
const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  orcamento_gerado: { label: 'Orçamento Gerado', color: 'bg-gray-500' },
  orcamento_aprovado: { label: 'Aprovado', color: 'bg-blue-500' },
  visita_tecnica: { label: 'Visita Técnica', color: 'bg-purple-500' },
  projeto_analise: { label: 'Projeto em Análise', color: 'bg-indigo-500' },
  instalacao_agendada: { label: 'Instalação Agendada', color: 'bg-orange-500' },
  instalacao_andamento: { label: 'Em Instalação', color: 'bg-amber-500' },
  instalacao_concluida: { label: 'Instalação Concluída', color: 'bg-lime-500' },
  homologacao: { label: 'Homologação', color: 'bg-teal-500' },
  concluido: { label: 'Concluído', color: 'bg-green-500' },
  cancelado: { label: 'Cancelado', color: 'bg-red-500' },
}

type Orcamento = {
  id: number
  nomeCliente: string
  telefone: string | null
  email: string | null
  endereco: string | null
  cidade: string | null
  valorConta: number
  consumo: number
  potencia: number
  qtdPlacas: number
  custoSistema: number
  economiaMensal: number
  economiaAnual: number
  retornoAnos: number
  status: string
  observacoes: string | null
  createdAt: Date
}

type Cliente = {
  id: string
  nome: string
  telefone: string | null
  email: string | null
  endereco: string | null
  cidade: string | null
  cpfCnpj: string | null
  orcamentos: { id: number; status: string; custoSistema: number }[]
}

type ProdutoEstoque = {
  id: string
  nome: string
  categoria: string
  unidade: string
  quantidade: number
  valorUnitario: number
  estoqueMinimo: number
}

type Stats = {
  totalOrcamentos: number
  orcamentosAprovados: number
  orcamentosConcluidos: number
  valorTotal: number
  orcamentosPorStatus: { status: string; count: number }[]
  orcamentosRecentes: number
}

export default function SolarAdminPage() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [loading, setLoading] = useState(true)
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [estoque, setEstoque] = useState<ProdutoEstoque[]>([])
  const [stats, setStats] = useState<Stats | null>(null)

  // Modal states
  const [showOrcamentoModal, setShowOrcamentoModal] = useState(false)
  const [showClienteModal, setShowClienteModal] = useState(false)
  const [showEstoqueModal, setShowEstoqueModal] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [showArquivosModal, setShowArquivosModal] = useState(false)
  const [selectedOrcamento, setSelectedOrcamento] = useState<Orcamento | null>(null)

  // Arquivos states
  type Arquivo = {
    id: string
    nome: string
    tipo: string
    tamanho: number
    categoria: string
    descricao: string | null
    createdAt: Date
  }
  const [arquivos, setArquivos] = useState<Arquivo[]>([])
  const [arquivosLoading, setArquivosLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadCategoria, setUploadCategoria] = useState('outros')

  // Opções de placas
  const [placasOptions, setPlacasOptions] = useState<number[]>([550, 560, 570, 580, 585, 590, 600, 610, 640])
  const [showAddPlaca, setShowAddPlaca] = useState(false)
  const [novaPlaca, setNovaPlaca] = useState('')

  // Form states
  const [orcamentoForm, setOrcamentoForm] = useState({
    nomeCliente: '',
    telefone: '',
    email: '',
    endereco: '',
    cidade: '',
    valorConta: '',
    perdaPercentual: '',
    potenciaPlaca: '580',
    observacoes: '',
  })
  const [clienteForm, setClienteForm] = useState({
    nome: '',
    telefone: '',
    email: '',
    endereco: '',
    cidade: '',
    cpfCnpj: '',
    observacoes: '',
  })
  const [estoqueForm, setEstoqueForm] = useState({
    nome: '',
    categoria: 'outros',
    unidade: 'un',
    quantidade: '0',
    valorUnitario: '0',
    estoqueMinimo: '0',
  })
  const [newStatus, setNewStatus] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [orcamentosData, clientesData, estoqueData, statsData] = await Promise.all([
        getOrcamentos(),
        getClientes(),
        getEstoque(),
        getSolarStats(),
      ])
      setOrcamentos(orcamentosData as Orcamento[])
      setClientes(clientesData as Cliente[])
      setEstoque(estoqueData as ProdutoEstoque[])
      setStats(statsData)
    } catch (error) {
      console.error(error)
      toast.error('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateOrcamento() {
    try {
      await createOrcamento({
        nomeCliente: orcamentoForm.nomeCliente,
        telefone: orcamentoForm.telefone || undefined,
        email: orcamentoForm.email || undefined,
        endereco: orcamentoForm.endereco || undefined,
        cidade: orcamentoForm.cidade || undefined,
        valorConta: parseFloat(orcamentoForm.valorConta),
        perdaPercentual: orcamentoForm.perdaPercentual ? parseFloat(orcamentoForm.perdaPercentual) : undefined,
        potenciaPlaca: parseInt(orcamentoForm.potenciaPlaca),
        observacoes: orcamentoForm.observacoes || undefined,
      })
      toast.success('Orçamento criado com sucesso!')
      setShowOrcamentoModal(false)
      setOrcamentoForm({
        nomeCliente: '',
        telefone: '',
        email: '',
        endereco: '',
        cidade: '',
        valorConta: '',
        perdaPercentual: '',
        potenciaPlaca: '580',
        observacoes: '',
      })
      loadData()
    } catch (error) {
      toast.error('Erro ao criar orçamento')
    }
  }

  async function handleCreateCliente() {
    try {
      await createCliente({
        nome: clienteForm.nome,
        telefone: clienteForm.telefone || undefined,
        email: clienteForm.email || undefined,
        endereco: clienteForm.endereco || undefined,
        cidade: clienteForm.cidade || undefined,
        cpfCnpj: clienteForm.cpfCnpj || undefined,
        observacoes: clienteForm.observacoes || undefined,
      })
      toast.success('Cliente criado com sucesso!')
      setShowClienteModal(false)
      setClienteForm({
        nome: '',
        telefone: '',
        email: '',
        endereco: '',
        cidade: '',
        cpfCnpj: '',
        observacoes: '',
      })
      loadData()
    } catch (error) {
      toast.error('Erro ao criar cliente')
    }
  }

  async function handleCreateEstoque() {
    try {
      await createProdutoEstoque({
        nome: estoqueForm.nome,
        categoria: estoqueForm.categoria,
        unidade: estoqueForm.unidade,
        quantidade: parseInt(estoqueForm.quantidade),
        valorUnitario: parseFloat(estoqueForm.valorUnitario),
        estoqueMinimo: parseInt(estoqueForm.estoqueMinimo),
      })
      toast.success('Produto criado com sucesso!')
      setShowEstoqueModal(false)
      setEstoqueForm({
        nome: '',
        categoria: 'outros',
        unidade: 'un',
        quantidade: '0',
        valorUnitario: '0',
        estoqueMinimo: '0',
      })
      loadData()
    } catch (error) {
      toast.error('Erro ao criar produto')
    }
  }

  async function handleUpdateStatus() {
    if (!selectedOrcamento || !newStatus) return
    try {
      await updateOrcamentoStatus(selectedOrcamento.id, newStatus)
      toast.success('Status atualizado!')
      setShowStatusModal(false)
      setSelectedOrcamento(null)
      setNewStatus('')
      loadData()
    } catch (error) {
      toast.error('Erro ao atualizar status')
    }
  }

  async function handleDeleteOrcamento(id: number) {
    if (!confirm('Tem certeza que deseja excluir este orçamento?')) return
    try {
      await deleteOrcamento(id)
      toast.success('Orçamento excluído!')
      loadData()
    } catch (error) {
      toast.error('Erro ao excluir orçamento')
    }
  }

  // Funções de arquivos
  async function openArquivosModal(orcamento: Orcamento) {
    setSelectedOrcamento(orcamento)
    setShowArquivosModal(true)
    await loadArquivos(orcamento.id)
  }

  async function loadArquivos(orcamentoId: number) {
    setArquivosLoading(true)
    try {
      const data = await getArquivos(orcamentoId)
      setArquivos(data as Arquivo[])
    } catch (error) {
      toast.error('Erro ao carregar arquivos')
    } finally {
      setArquivosLoading(false)
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0 || !selectedOrcamento) return

    setUploading(true)
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('orcamentoId', selectedOrcamento.id.toString())
        formData.append('categoria', uploadCategoria)

        const response = await fetch('/api/solar/upload', {
          method: 'POST',
          body: formData,
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Erro ao fazer upload')
        }
      }

      toast.success('Arquivo(s) enviado(s) com sucesso!')
      await loadArquivos(selectedOrcamento.id)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao fazer upload')
    } finally {
      setUploading(false)
      // Reset input
      e.target.value = ''
    }
  }

  async function handleDeleteArquivo(arquivoId: string) {
    if (!confirm('Tem certeza que deseja excluir este arquivo?')) return
    try {
      const response = await fetch(`/api/solar/arquivo/${arquivoId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Erro ao excluir arquivo')
      }

      toast.success('Arquivo excluído!')
      if (selectedOrcamento) {
        await loadArquivos(selectedOrcamento.id)
      }
    } catch (error) {
      toast.error('Erro ao excluir arquivo')
    }
  }

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  function getFileIcon(tipo: string) {
    if (tipo.startsWith('image/')) return Image
    if (tipo.includes('spreadsheet') || tipo.includes('excel') || tipo === 'text/csv') return FileSpreadsheet
    if (tipo === 'application/pdf') return FileText
    return File
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
      </div>
    )
  }

  return (
    <div className="flex-1 p-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin/ferramentas">
            <Button variant="ghost" className="mb-4 -ml-2">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para Ferramentas
            </Button>
          </Link>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl">
                <Sun className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Energia Solar</h1>
                <p className="text-slate-500 text-sm">
                  Gerencie orçamentos, clientes e estoque
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white border p-1">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">
              <BarChart3 className="w-4 h-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="orcamentos" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">
              <FileText className="w-4 h-4 mr-2" />
              Orçamentos
            </TabsTrigger>
            <TabsTrigger value="clientes" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">
              <Users className="w-4 h-4 mr-2" />
              Clientes
            </TabsTrigger>
            <TabsTrigger value="estoque" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">
              <Package className="w-4 h-4 mr-2" />
              Estoque
            </TabsTrigger>
            <TabsTrigger value="calculadoras" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">
              <Calculator className="w-4 h-4 mr-2" />
              Calculadoras
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {stats && (
              <>
                {/* Stats Cards */}
                <div className="grid md:grid-cols-4 gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-slate-500">Total Orçamentos</p>
                          <p className="text-3xl font-bold text-slate-900">{stats.totalOrcamentos}</p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-xl">
                          <FileText className="w-6 h-6 text-blue-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-slate-500">Aprovados</p>
                          <p className="text-3xl font-bold text-green-600">{stats.orcamentosAprovados}</p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-xl">
                          <CheckCircle2 className="w-6 h-6 text-green-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-slate-500">Concluídos</p>
                          <p className="text-3xl font-bold text-amber-600">{stats.orcamentosConcluidos}</p>
                        </div>
                        <div className="p-3 bg-amber-100 rounded-xl">
                          <Zap className="w-6 h-6 text-amber-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-slate-500">Valor Total</p>
                          <p className="text-2xl font-bold text-slate-900">{formatarMoeda(stats.valorTotal)}</p>
                        </div>
                        <div className="p-3 bg-purple-100 rounded-xl">
                          <DollarSign className="w-6 h-6 text-purple-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle>Últimos Orçamentos</CardTitle>
                    <CardDescription>Orçamentos criados recentemente</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {orcamentos.slice(0, 5).map((orc) => (
                        <div key={orc.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                              <span className="text-amber-600 font-semibold">
                                {orc.nomeCliente.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium">{orc.nomeCliente}</p>
                              <p className="text-sm text-slate-500">
                                {orc.potencia.toFixed(1)} kWp • {orc.qtdPlacas} placas
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{formatarMoeda(orc.custoSistema)}</p>
                            <Badge className={`${STATUS_LABELS[orc.status]?.color || 'bg-gray-500'} text-white`}>
                              {STATUS_LABELS[orc.status]?.label || orc.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                      {orcamentos.length === 0 && (
                        <p className="text-center text-slate-500 py-8">Nenhum orçamento ainda</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* Orçamentos Tab */}
          <TabsContent value="orcamentos" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">Orçamentos</h2>
                <p className="text-slate-500">Gerencie seus orçamentos de energia solar</p>
              </div>
              <Button onClick={() => setShowOrcamentoModal(true)} className="bg-amber-600 hover:bg-amber-700">
                <Plus className="w-4 h-4 mr-2" />
                Novo Orçamento
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Potência</TableHead>
                      <TableHead>Placas</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orcamentos.map((orc) => (
                      <TableRow key={orc.id}>
                        <TableCell className="font-medium">#{orc.id}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{orc.nomeCliente}</p>
                            {orc.telefone && (
                              <p className="text-sm text-slate-500">{orc.telefone}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{orc.potencia.toFixed(1)} kWp</TableCell>
                        <TableCell>{orc.qtdPlacas}</TableCell>
                        <TableCell className="font-semibold">{formatarMoeda(orc.custoSistema)}</TableCell>
                        <TableCell>
                          <Badge className={`${STATUS_LABELS[orc.status]?.color || 'bg-gray-500'} text-white`}>
                            {STATUS_LABELS[orc.status]?.label || orc.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openArquivosModal(orc)}>
                                <Paperclip className="w-4 h-4 mr-2" />
                                Arquivos / Anexos
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedOrcamento(orc)
                                  setNewStatus(orc.status)
                                  setShowStatusModal(true)
                                }}
                              >
                                <Clock className="w-4 h-4 mr-2" />
                                Alterar Status
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteOrcamento(orc.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                    {orcamentos.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                          Nenhum orçamento cadastrado
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Clientes Tab */}
          <TabsContent value="clientes" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">Clientes</h2>
                <p className="text-slate-500">Gerencie sua base de clientes</p>
              </div>
              <Button onClick={() => setShowClienteModal(true)} className="bg-amber-600 hover:bg-amber-700">
                <Plus className="w-4 h-4 mr-2" />
                Novo Cliente
              </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clientes.map((cliente) => (
                <Card key={cliente.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                        <span className="text-amber-600 font-semibold text-lg">
                          {cliente.nome.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <Badge variant="secondary">{cliente.orcamentos.length} orçamentos</Badge>
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{cliente.nome}</h3>
                    <div className="space-y-1 text-sm text-slate-500">
                      {cliente.telefone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          {cliente.telefone}
                        </div>
                      )}
                      {cliente.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          {cliente.email}
                        </div>
                      )}
                      {cliente.cidade && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {cliente.cidade}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              {clientes.length === 0 && (
                <Card className="col-span-full">
                  <CardContent className="p-12 text-center text-slate-500">
                    Nenhum cliente cadastrado
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Estoque Tab */}
          <TabsContent value="estoque" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">Estoque</h2>
                <p className="text-slate-500">Controle de materiais e equipamentos</p>
              </div>
              <Button onClick={() => setShowEstoqueModal(true)} className="bg-amber-600 hover:bg-amber-700">
                <Plus className="w-4 h-4 mr-2" />
                Novo Produto
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produto</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead className="text-center">Quantidade</TableHead>
                      <TableHead className="text-right">Valor Unit.</TableHead>
                      <TableHead className="text-right">Valor Total</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {estoque.map((produto) => (
                      <TableRow key={produto.id}>
                        <TableCell className="font-medium">{produto.nome}</TableCell>
                        <TableCell className="capitalize">{produto.categoria}</TableCell>
                        <TableCell className="text-center">
                          {produto.quantidade} {produto.unidade}
                        </TableCell>
                        <TableCell className="text-right">{formatarMoeda(produto.valorUnitario)}</TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatarMoeda(produto.quantidade * produto.valorUnitario)}
                        </TableCell>
                        <TableCell>
                          {produto.quantidade <= produto.estoqueMinimo ? (
                            <Badge variant="destructive" className="flex items-center gap-1 w-fit">
                              <AlertCircle className="w-3 h-3" />
                              Baixo
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-green-100 text-green-700">
                              OK
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {estoque.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                          Nenhum produto cadastrado
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Calculadoras Tab */}
          <TabsContent value="calculadoras" className="space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-2">Calculadoras</h2>
              <p className="text-slate-500 mb-6">
                Ferramentas para simulação de economia e dimensionamento
              </p>
            </div>
            <SolarCalculatorsGrid />
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal: Novo Orçamento */}
      <Dialog open={showOrcamentoModal} onOpenChange={setShowOrcamentoModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Novo Orçamento</DialogTitle>
            <DialogDescription>
              Preencha os dados do cliente e o valor da conta de luz
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Nome do Cliente *</Label>
              <Input
                value={orcamentoForm.nomeCliente}
                onChange={(e) => setOrcamentoForm({ ...orcamentoForm, nomeCliente: e.target.value })}
                placeholder="Ex: João Silva"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Telefone</Label>
                <Input
                  value={orcamentoForm.telefone}
                  onChange={(e) => setOrcamentoForm({ ...orcamentoForm, telefone: e.target.value })}
                  placeholder="(11) 99999-9999"
                />
              </div>
              <div className="grid gap-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={orcamentoForm.email}
                  onChange={(e) => setOrcamentoForm({ ...orcamentoForm, email: e.target.value })}
                  placeholder="email@exemplo.com"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Cidade</Label>
                <Input
                  value={orcamentoForm.cidade}
                  onChange={(e) => setOrcamentoForm({ ...orcamentoForm, cidade: e.target.value })}
                  placeholder="Ex: São Paulo"
                />
              </div>
              <div className="grid gap-2">
                <Label>Valor da Conta (R$) *</Label>
                <Input
                  type="number"
                  value={orcamentoForm.valorConta}
                  onChange={(e) => setOrcamentoForm({ ...orcamentoForm, valorConta: e.target.value })}
                  placeholder="Ex: 500"
                  step="0.01"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Perda do Sistema (%)</Label>
                <Input
                  type="number"
                  value={orcamentoForm.perdaPercentual}
                  onChange={(e) => setOrcamentoForm({ ...orcamentoForm, perdaPercentual: e.target.value })}
                  placeholder="Ex: 15"
                  min="0"
                  max="100"
                  step="0.1"
                />
                <p className="text-xs text-slate-500">Opcional. Perdas por sombra, sujeira, temperatura, etc.</p>
              </div>
              <div className="grid gap-2">
                <Label>Modelo da Placa</Label>
                <div className="flex items-center gap-2">
                  <Select
                    value={orcamentoForm.potenciaPlaca}
                    onValueChange={(v) => setOrcamentoForm({ ...orcamentoForm, potenciaPlaca: v })}
                  >
                    <SelectTrigger className="w-[100px] border-amber-200 focus:ring-amber-500">
                      <SelectValue placeholder="Potência" />
                    </SelectTrigger>
                    <SelectContent>
                      {placasOptions.sort((a, b) => a - b).map((potencia) => (
                        <SelectItem key={potencia} value={potencia.toString()}>
                          {potencia}W
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {showAddPlaca ? (
                    <>
                      <Input
                        type="number"
                        value={novaPlaca}
                        onChange={(e) => setNovaPlaca(e.target.value)}
                        placeholder="Ex: 600"
                        className="w-20 h-9 text-sm border-amber-200"
                        min="100"
                        max="1000"
                      />
                      <Button
                        type="button"
                        size="icon"
                        className="h-9 w-9 bg-amber-600 hover:bg-amber-700 text-white"
                        onClick={() => {
                          const valor = parseInt(novaPlaca)
                          if (valor && valor >= 100 && valor <= 1000 && !placasOptions.includes(valor)) {
                            setPlacasOptions([...placasOptions, valor])
                            setOrcamentoForm({ ...orcamentoForm, potenciaPlaca: valor.toString() })
                            setNovaPlaca('')
                            setShowAddPlaca(false)
                            toast.success(`Placa ${valor}W adicionada!`)
                          } else if (placasOptions.includes(valor)) {
                            toast.error('Esta potência já existe')
                          } else {
                            toast.error('Valor inválido (100-1000W)')
                          }
                        }}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-9 w-9"
                        onClick={() => {
                          setShowAddPlaca(false)
                          setNovaPlaca('')
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        className="h-9 w-9 border-amber-200 text-amber-700 hover:bg-amber-50"
                        onClick={() => setShowAddPlaca(true)}
                        title="Adicionar Placa"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        className="h-9 w-9 border-red-200 text-red-600 hover:bg-red-50"
                        onClick={() => {
                          const potenciaAtual = parseInt(orcamentoForm.potenciaPlaca)
                          if (placasOptions.length <= 1) {
                            toast.error('É necessário ter pelo menos uma opção')
                            return
                          }
                          const novasOpcoes = placasOptions.filter(p => p !== potenciaAtual)
                          setPlacasOptions(novasOpcoes)
                          setOrcamentoForm({ ...orcamentoForm, potenciaPlaca: novasOpcoes[0].toString() })
                          toast.success(`Placa ${potenciaAtual}W removida!`)
                        }}
                        title="Excluir Selecionada"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Endereço</Label>
              <Input
                value={orcamentoForm.endereco}
                onChange={(e) => setOrcamentoForm({ ...orcamentoForm, endereco: e.target.value })}
                placeholder="Rua, número, bairro"
              />
            </div>
            <div className="grid gap-2">
              <Label>Observações</Label>
              <Textarea
                value={orcamentoForm.observacoes}
                onChange={(e) => setOrcamentoForm({ ...orcamentoForm, observacoes: e.target.value })}
                placeholder="Observações adicionais..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowOrcamentoModal(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleCreateOrcamento}
              className="bg-amber-600 hover:bg-amber-700"
              disabled={!orcamentoForm.nomeCliente || !orcamentoForm.valorConta}
            >
              Criar Orçamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Novo Cliente */}
      <Dialog open={showClienteModal} onOpenChange={setShowClienteModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Novo Cliente</DialogTitle>
            <DialogDescription>Cadastre um novo cliente</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Nome *</Label>
              <Input
                value={clienteForm.nome}
                onChange={(e) => setClienteForm({ ...clienteForm, nome: e.target.value })}
                placeholder="Nome completo"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Telefone</Label>
                <Input
                  value={clienteForm.telefone}
                  onChange={(e) => setClienteForm({ ...clienteForm, telefone: e.target.value })}
                  placeholder="(11) 99999-9999"
                />
              </div>
              <div className="grid gap-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={clienteForm.email}
                  onChange={(e) => setClienteForm({ ...clienteForm, email: e.target.value })}
                  placeholder="email@exemplo.com"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>CPF/CNPJ</Label>
                <Input
                  value={clienteForm.cpfCnpj}
                  onChange={(e) => setClienteForm({ ...clienteForm, cpfCnpj: e.target.value })}
                  placeholder="000.000.000-00"
                />
              </div>
              <div className="grid gap-2">
                <Label>Cidade</Label>
                <Input
                  value={clienteForm.cidade}
                  onChange={(e) => setClienteForm({ ...clienteForm, cidade: e.target.value })}
                  placeholder="Ex: São Paulo"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Endereço</Label>
              <Input
                value={clienteForm.endereco}
                onChange={(e) => setClienteForm({ ...clienteForm, endereco: e.target.value })}
                placeholder="Rua, número, bairro"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowClienteModal(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleCreateCliente}
              className="bg-amber-600 hover:bg-amber-700"
              disabled={!clienteForm.nome}
            >
              Criar Cliente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Novo Produto Estoque */}
      <Dialog open={showEstoqueModal} onOpenChange={setShowEstoqueModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Novo Produto</DialogTitle>
            <DialogDescription>Adicione um produto ao estoque</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Nome do Produto *</Label>
              <Input
                value={estoqueForm.nome}
                onChange={(e) => setEstoqueForm({ ...estoqueForm, nome: e.target.value })}
                placeholder="Ex: Placa Solar 580W"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Categoria</Label>
                <Select
                  value={estoqueForm.categoria}
                  onValueChange={(v) => setEstoqueForm({ ...estoqueForm, categoria: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="placas">Placas Solares</SelectItem>
                    <SelectItem value="inversores">Inversores</SelectItem>
                    <SelectItem value="estruturas">Estruturas</SelectItem>
                    <SelectItem value="cabos">Cabos</SelectItem>
                    <SelectItem value="conectores">Conectores</SelectItem>
                    <SelectItem value="outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Unidade</Label>
                <Input
                  value={estoqueForm.unidade}
                  onChange={(e) => setEstoqueForm({ ...estoqueForm, unidade: e.target.value })}
                  placeholder="un, m, kg"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label>Quantidade</Label>
                <Input
                  type="number"
                  value={estoqueForm.quantidade}
                  onChange={(e) => setEstoqueForm({ ...estoqueForm, quantidade: e.target.value })}
                  min="0"
                />
              </div>
              <div className="grid gap-2">
                <Label>Valor Unit. (R$)</Label>
                <Input
                  type="number"
                  value={estoqueForm.valorUnitario}
                  onChange={(e) => setEstoqueForm({ ...estoqueForm, valorUnitario: e.target.value })}
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="grid gap-2">
                <Label>Estoque Mín.</Label>
                <Input
                  type="number"
                  value={estoqueForm.estoqueMinimo}
                  onChange={(e) => setEstoqueForm({ ...estoqueForm, estoqueMinimo: e.target.value })}
                  min="0"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEstoqueModal(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleCreateEstoque}
              className="bg-amber-600 hover:bg-amber-700"
              disabled={!estoqueForm.nome}
            >
              Criar Produto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Alterar Status */}
      <Dialog open={showStatusModal} onOpenChange={setShowStatusModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Alterar Status</DialogTitle>
            <DialogDescription>
              Orçamento #{selectedOrcamento?.id} - {selectedOrcamento?.nomeCliente}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label>Novo Status</Label>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(STATUS_LABELS).map(([key, { label }]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStatusModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateStatus} className="bg-amber-600 hover:bg-amber-700">
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Arquivos / Anexos */}
      <Dialog open={showArquivosModal} onOpenChange={setShowArquivosModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Paperclip className="w-5 h-5" />
              Arquivos do Orçamento
            </DialogTitle>
            <DialogDescription>
              #{selectedOrcamento?.id} - {selectedOrcamento?.nomeCliente}
            </DialogDescription>
          </DialogHeader>

          {/* Upload Section */}
          <div className="border rounded-lg p-4 bg-slate-50">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label className="text-sm font-medium">Categoria</Label>
                <Select value={uploadCategoria} onValueChange={setUploadCategoria}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="projeto">Projeto</SelectItem>
                    <SelectItem value="contrato">Contrato</SelectItem>
                    <SelectItem value="foto">Foto</SelectItem>
                    <SelectItem value="planilha">Planilha</SelectItem>
                    <SelectItem value="outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Label className="text-sm font-medium">Enviar Arquivo</Label>
                <div className="mt-1">
                  <label
                    className={`flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                      uploading
                        ? 'border-gray-300 bg-gray-100 cursor-not-allowed'
                        : 'border-amber-300 hover:border-amber-500 hover:bg-amber-50'
                    }`}
                  >
                    {uploading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    <span className="text-sm">
                      {uploading ? 'Enviando...' : 'Selecionar arquivo'}
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleFileUpload}
                      disabled={uploading}
                      multiple
                      accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt"
                    />
                  </label>
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Formatos: Imagens, PDF, Word, Excel, CSV, TXT. Máximo: 10MB por arquivo.
            </p>
          </div>

          {/* Files List */}
          <div className="flex-1 overflow-y-auto min-h-0 mt-4">
            {arquivosLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
              </div>
            ) : arquivos.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Paperclip className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>Nenhum arquivo anexado</p>
                <p className="text-sm">Faça upload de arquivos relacionados a este projeto</p>
              </div>
            ) : (
              <div className="space-y-2">
                {arquivos.map((arquivo) => {
                  const FileIcon = getFileIcon(arquivo.tipo)
                  return (
                    <div
                      key={arquivo.id}
                      className="flex items-center gap-3 p-3 border rounded-lg hover:bg-slate-50 group"
                    >
                      <div className="p-2 bg-slate-100 rounded-lg">
                        <FileIcon className="w-5 h-5 text-slate-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate" title={arquivo.nome}>
                          {arquivo.nome}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Badge variant="secondary" className="text-[10px]">
                            {arquivo.categoria}
                          </Badge>
                          <span>{formatFileSize(arquivo.tamanho)}</span>
                          <span>
                            {new Date(arquivo.createdAt).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => window.open(`/api/solar/arquivo/${arquivo.id}`, '_blank')}
                          title="Baixar / Visualizar"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteArquivo(arquivo.id)}
                          title="Excluir"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowArquivosModal(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Eye, Mail, Phone } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { supabase } from "@/lib/supabase"

export default function ClientesAtivosPage() {
  const [clientes, setClientes] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [clienteSelecionado, setClienteSelecionado] = useState<any | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchClientesAtivos() {
      setLoading(true)
      // Busca todas as propostas aprovadas
      const { data, error } = await supabase
        .from("propostas")
        .select("id, nome, email, telefone, whatsapp, plano, operadora, created_at, status, valor, sigla_plano, produto_nome, assinado_em")
        .eq("status", "aprovada")
        .order("assinado_em", { ascending: false })
      if (!error && data) {
        setClientes(data)
      }
      setLoading(false)
    }
    fetchClientesAtivos()
  }, [])

  const clientesFiltrados = clientes.filter((cliente) => {
    const termo = searchTerm.toLowerCase()
    return (
      (cliente.nome && cliente.nome.toLowerCase().includes(termo)) ||
      (cliente.email && cliente.email.toLowerCase().includes(termo)) ||
      (cliente.telefone && cliente.telefone.includes(termo)) ||
      (cliente.whatsapp && cliente.whatsapp.includes(termo))
    )
  })

  const handleViewCliente = (cliente: any) => {
    setClienteSelecionado(cliente)
    setIsDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Clientes Ativos</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Clientes Ativos</CardTitle>
          <CardDescription>Visualize todos os clientes com propostas aprovadas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Input
                placeholder="Buscar por nome, email ou telefone..."
                className="pl-4"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Data de Aprovação</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">Carregando...</TableCell>
                  </TableRow>
                ) : clientesFiltrados.length > 0 ? (
                  clientesFiltrados.map((cliente) => (
                    <TableRow key={cliente.id}>
                      <TableCell className="font-medium">{cliente.nome}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="flex items-center">
                            <Mail className="h-3 w-3 mr-1" /> {cliente.email}
                          </span>
                          <span className="flex items-center mt-1">
                            <Phone className="h-3 w-3 mr-1" /> {cliente.telefone || cliente.whatsapp}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{cliente.produto_nome || cliente.sigla_plano || cliente.plano}</span>
                        </div>
                      </TableCell>
                      <TableCell>{cliente.assinado_em ? new Date(cliente.assinado_em).toLocaleDateString() : "-"}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleViewCliente(cliente)}>
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">Ver detalhes</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
                      Nenhum cliente ativo encontrado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Detalhes do Cliente</DialogTitle>
            <DialogDescription>Informações completas do cliente selecionado.</DialogDescription>
          </DialogHeader>
          {clienteSelecionado && (
            <div className="space-y-2 mt-4">
              <div><strong>Nome:</strong> {clienteSelecionado.nome}</div>
              <div><strong>Email:</strong> {clienteSelecionado.email}</div>
              <div><strong>Telefone:</strong> {clienteSelecionado.telefone || clienteSelecionado.whatsapp}</div>
              <div><strong>Plano:</strong> {clienteSelecionado.produto_nome || clienteSelecionado.sigla_plano || clienteSelecionado.plano}</div>
              <div><strong>Data de Aprovação:</strong> {clienteSelecionado.assinado_em ? new Date(clienteSelecionado.assinado_em).toLocaleDateString() : "-"}</div>
              <div><strong>Status:</strong> {clienteSelecionado.status}</div>
              <div><strong>ID Proposta:</strong> {clienteSelecionado.id}</div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 

"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Clock,
  Phone,
  MapPin,
  ChevronRight,
  Loader2,
  RefreshCw,
  Printer,
  MessageCircle,
  X,
  CheckCircle,
  XCircle,
  Bike,
  ChefHat,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import {
  getDeliveryOrdersByStatus,
  updateDeliveryOrderStatus,
} from "@/lib/actions/delivery";

type DeliveryOrder = {
  id: string;
  code: string;
  customerName: string;
  customerPhone: string;
  addressStreet: string;
  addressNumber: string;
  addressNeighborhood: string;
  total: number;
  paymentMethod: string;
  status: string;
  customerNotes?: string;
  createdAt: string;
  estimatedDelivery?: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    customizations?: Array<{ name: string; price: number }>;
    notes?: string;
  }>;
};

const statusConfig = {
  NEW: {
    label: "Novos",
    color: "bg-blue-500",
    bgColor: "bg-blue-50",
    icon: Package,
    nextStatus: "CONFIRMED",
    nextLabel: "Confirmar",
  },
  CONFIRMED: {
    label: "Confirmados",
    color: "bg-yellow-500",
    bgColor: "bg-yellow-50",
    icon: CheckCircle,
    nextStatus: "PREPARING",
    nextLabel: "Preparar",
  },
  PREPARING: {
    label: "Preparando",
    color: "bg-orange-500",
    bgColor: "bg-orange-50",
    icon: ChefHat,
    nextStatus: "OUT_FOR_DELIVERY",
    nextLabel: "Saiu Entrega",
  },
  OUT_FOR_DELIVERY: {
    label: "Em Entrega",
    color: "bg-purple-500",
    bgColor: "bg-purple-50",
    icon: Bike,
    nextStatus: "DELIVERED",
    nextLabel: "Entregue",
  },
  DELIVERED: {
    label: "Entregues",
    color: "bg-green-500",
    bgColor: "bg-green-50",
    icon: CheckCircle,
    nextStatus: null,
    nextLabel: null,
  },
  CANCELLED: {
    label: "Cancelados",
    color: "bg-red-500",
    bgColor: "bg-red-50",
    icon: XCircle,
    nextStatus: null,
    nextLabel: null,
  },
};

export function DeliveryKanban() {
  const [orders, setOrders] = useState<Record<string, DeliveryOrder[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<DeliveryOrder | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [showDeliveryDialog, setShowDeliveryDialog] = useState(false);
  const [deliveryPerson, setDeliveryPerson] = useState({ name: "", phone: "" });
  const [updating, setUpdating] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    try {
      const data = await getDeliveryOrdersByStatus();
      setOrders(data);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar pedidos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadOrders, 30000);
    return () => clearInterval(interval);
  }, [loadOrders]);

  async function handleStatusChange(
    orderId: string,
    newStatus: string,
    extra?: any
  ) {
    setUpdating(orderId);
    try {
      await updateDeliveryOrderStatus(orderId, newStatus as any, extra);
      toast.success("Status atualizado!");
      loadOrders();
    } catch (error) {
      toast.error("Erro ao atualizar status");
    } finally {
      setUpdating(null);
      setShowCancelDialog(false);
      setShowDeliveryDialog(false);
      setSelectedOrder(null);
    }
  }

  function handleNextStatus(order: DeliveryOrder) {
    const config = statusConfig[order.status as keyof typeof statusConfig];
    if (!config.nextStatus) return;

    if (config.nextStatus === "OUT_FOR_DELIVERY") {
      setSelectedOrder(order);
      setShowDeliveryDialog(true);
    } else {
      handleStatusChange(order.id, config.nextStatus);
    }
  }

  function handleCancel(order: DeliveryOrder) {
    setSelectedOrder(order);
    setShowCancelDialog(true);
  }

  function formatTime(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  }

  function formatPhone(phone: string) {
    return `https://wa.me/55${phone.replace(/\D/g, "")}`;
  }

  function printOrder(order: DeliveryOrder) {
    const printContent = `
      <html>
        <head>
          <title>Pedido ${order.code}</title>
          <style>
            body { font-family: monospace; padding: 20px; }
            h1 { font-size: 18px; }
            .items { margin: 20px 0; }
            .item { margin: 10px 0; }
            .total { font-weight: bold; font-size: 16px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <h1>Pedido ${order.code}</h1>
          <p>${order.customerName} - ${order.customerPhone}</p>
          <p>${order.addressStreet}, ${order.addressNumber} - ${order.addressNeighborhood}</p>
          <div class="items">
            ${order.items.map((item) => `
              <div class="item">
                <strong>${item.quantity}x ${item.name}</strong> - R$ ${(item.price * item.quantity).toFixed(2)}
                ${item.customizations?.length ? `<br/>+ ${item.customizations.map((c) => c.name).join(", ")}` : ""}
                ${item.notes ? `<br/><em>${item.notes}</em>` : ""}
              </div>
            `).join("")}
          </div>
          ${order.customerNotes ? `<p><strong>Obs:</strong> ${order.customerNotes}</p>` : ""}
          <div class="total">TOTAL: R$ ${order.total.toFixed(2)}</div>
          <p>Pagamento: ${order.paymentMethod.toUpperCase()}</p>
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  const activeStatuses = ["NEW", "CONFIRMED", "PREPARING", "OUT_FOR_DELIVERY"];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            {Object.values(orders).flat().filter((o) => activeStatuses.includes(o.status)).length} pedidos ativos
          </Badge>
        </div>
        <Button variant="outline" size="sm" onClick={loadOrders}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {activeStatuses.map((status) => {
          const config = statusConfig[status as keyof typeof statusConfig];
          const statusOrders = orders[status] || [];

          return (
            <div key={status} className={cn("rounded-xl p-4", config.bgColor)}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className={cn("w-3 h-3 rounded-full", config.color)} />
                  <span className="font-semibold text-slate-700">{config.label}</span>
                </div>
                <Badge variant="secondary">{statusOrders.length}</Badge>
              </div>

              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {statusOrders.length === 0 ? (
                  <p className="text-center text-slate-400 py-8 text-sm">
                    Nenhum pedido
                  </p>
                ) : (
                  statusOrders.map((order) => (
                    <Card key={order.id} className="shadow-sm">
                      <CardHeader className="p-3 pb-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-red-600">{order.code}</span>
                          <span className="text-xs text-slate-500">
                            <Clock className="w-3 h-3 inline mr-1" />
                            {formatTime(order.createdAt)}
                          </span>
                        </div>
                        <div className="text-sm font-medium">{order.customerName}</div>
                      </CardHeader>
                      <CardContent className="p-3 pt-0 space-y-2">
                        {/* Items summary */}
                        <div className="text-xs text-slate-600">
                          {order.items.slice(0, 2).map((item, i) => (
                            <div key={i}>
                              {item.quantity}x {item.name}
                            </div>
                          ))}
                          {order.items.length > 2 && (
                            <div className="text-slate-400">
                              +{order.items.length - 2} itens
                            </div>
                          )}
                        </div>

                        {/* Address */}
                        <div className="text-xs text-slate-500 flex items-start gap-1">
                          <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          <span>
                            {order.addressStreet}, {order.addressNumber} - {order.addressNeighborhood}
                          </span>
                        </div>

                        {/* Notes */}
                        {order.customerNotes && (
                          <div className="text-xs bg-yellow-50 text-yellow-700 p-2 rounded">
                            {order.customerNotes}
                          </div>
                        )}

                        {/* Total & Payment */}
                        <div className="flex items-center justify-between pt-2 border-t">
                          <Badge variant="outline" className="text-xs">
                            {order.paymentMethod.toUpperCase()}
                          </Badge>
                          <span className="font-bold text-green-600">
                            R$ {order.total.toFixed(2)}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="flex-1 h-8"
                            onClick={() => printOrder(order)}
                          >
                            <Printer className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="flex-1 h-8"
                            asChild
                          >
                            <a
                              href={formatPhone(order.customerPhone)}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <MessageCircle className="w-3 h-3" />
                            </a>
                          </Button>
                          {status !== "DELIVERED" && status !== "CANCELLED" && (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="flex-1 h-8 text-red-600 hover:text-red-700"
                                onClick={() => handleCancel(order)}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                className="flex-1 h-8 bg-red-600 hover:bg-red-700"
                                onClick={() => handleNextStatus(order)}
                                disabled={updating === order.id}
                              >
                                {updating === order.id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <ChevronRight className="w-3 h-3" />
                                )}
                              </Button>
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Delivered/Cancelled */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {["DELIVERED", "CANCELLED"].map((status) => {
          const config = statusConfig[status as keyof typeof statusConfig];
          const statusOrders = orders[status] || [];

          return (
            <Card key={status}>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <div className={cn("w-3 h-3 rounded-full", config.color)} />
                  <span className="font-semibold">{config.label}</span>
                  <Badge variant="secondary" className="ml-auto">
                    {statusOrders.length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="max-h-48 overflow-y-auto">
                {statusOrders.length === 0 ? (
                  <p className="text-center text-slate-400 py-4 text-sm">
                    Nenhum pedido
                  </p>
                ) : (
                  <div className="space-y-2">
                    {statusOrders.slice(0, 5).map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between text-sm p-2 bg-slate-50 rounded"
                      >
                        <div>
                          <span className="font-medium">{order.code}</span>
                          <span className="text-slate-500 ml-2">
                            {order.customerName}
                          </span>
                        </div>
                        <span className="font-medium text-green-600">
                          R$ {order.total.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Cancel Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cancelar Pedido {selectedOrder?.code}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label>Motivo do cancelamento</Label>
              <Textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Informe o motivo..."
                rows={3}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
                Voltar
              </Button>
              <Button
                variant="destructive"
                onClick={() =>
                  selectedOrder &&
                  handleStatusChange(selectedOrder.id, "CANCELLED", { cancelReason })
                }
                disabled={updating === selectedOrder?.id}
              >
                {updating === selectedOrder?.id && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                Confirmar Cancelamento
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delivery Person Dialog */}
      <Dialog open={showDeliveryDialog} onOpenChange={setShowDeliveryDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Saiu para Entrega - {selectedOrder?.code}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label>Nome do entregador (opcional)</Label>
              <Input
                value={deliveryPerson.name}
                onChange={(e) =>
                  setDeliveryPerson({ ...deliveryPerson, name: e.target.value })
                }
                placeholder="Nome do motoboy"
              />
            </div>
            <div>
              <Label>Telefone do entregador (opcional)</Label>
              <Input
                value={deliveryPerson.phone}
                onChange={(e) =>
                  setDeliveryPerson({ ...deliveryPerson, phone: e.target.value })
                }
                placeholder="(00) 00000-0000"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowDeliveryDialog(false)}>
                Voltar
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700"
                onClick={() =>
                  selectedOrder &&
                  handleStatusChange(selectedOrder.id, "OUT_FOR_DELIVERY", {
                    deliveryPersonName: deliveryPerson.name,
                    deliveryPersonPhone: deliveryPerson.phone,
                  })
                }
                disabled={updating === selectedOrder?.id}
              >
                {updating === selectedOrder?.id && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                Confirmar Saída
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

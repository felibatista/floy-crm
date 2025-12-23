"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2,
  QrCode,
  Smartphone,
  RefreshCw,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import {
  ConnectionStatus,
  GowaResponse,
  LoginResult,
  LoginWithCodeResult,
} from "./types";

interface QRLoginProps {
  onConnected: () => void;
}

export function QRLogin({ onConnected }: QRLoginProps) {
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [status, setStatus] = useState<ConnectionStatus | null>(null);
  const [qrData, setQrData] = useState<LoginResult | null>(null);
  const [pairCode, setPairCode] = useState<string | null>(null);
  const [phoneInput, setPhoneInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const getToken = () => localStorage.getItem("admin_token");

  const checkStatus = useCallback(async () => {
    try {
      setChecking(true);
      const token = getToken();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/whatsapp/status`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok) {
        const data: ConnectionStatus = await res.json();
        setStatus(data);
        if (data.connected) {
          onConnected();
        }
      }
    } catch (err) {
      console.error("Error checking status:", err);
    } finally {
      setChecking(false);
    }
  }, [onConnected]);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  // Auto-refresh QR every 30 seconds if showing QR
  useEffect(() => {
    if (qrData) {
      const timeout = setTimeout(() => {
        handleLoginQR();
      }, (qrData.qr_duration || 30) * 1000);

      const checkInterval = setInterval(checkStatus, 5000);

      return () => {
        clearTimeout(timeout);
        clearInterval(checkInterval);
      };
    }
  }, [qrData, checkStatus]);

  const handleLoginQR = async () => {
    try {
      setLoading(true);
      setError(null);
      setPairCode(null);
      const token = getToken();

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/whatsapp/login`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        throw new Error("Error al generar QR");
      }

      const data: GowaResponse<LoginResult> = await res.json();
      setQrData(data.results);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginWithCode = async () => {
    if (!phoneInput.trim()) {
      setError("Ingresa tu número de teléfono");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setQrData(null);
      const token = getToken();

      // Clean phone number
      const phone = phoneInput.replace(/[^\d]/g, "");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/whatsapp/login-with-code?phone=${phone}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!res.ok) {
        throw new Error("Error al generar código");
      }

      const data: GowaResponse<LoginWithCodeResult> = await res.json();
      setPairCode(data.results.pair_code);

      // Start checking for connection
      const checkInterval = setInterval(async () => {
        await checkStatus();
      }, 3000);

      // Stop after 2 minutes
      setTimeout(() => clearInterval(checkInterval), 120000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReconnect = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getToken();

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/whatsapp/reconnect`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        throw new Error("Error al reconectar");
      }

      await checkStatus();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-2 text-muted-foreground">Verificando conexión...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-full p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
            <Smartphone className="h-6 w-6 text-green-500" />
          </div>
          <CardTitle>Conectar WhatsApp</CardTitle>
          <CardDescription>
            Vincula tu cuenta de WhatsApp para gestionar tus mensajes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status?.connected ? (
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2 text-green-500">
                <CheckCircle2 className="h-5 w-5" />
                <span>Conectado</span>
              </div>
              {status.devices.map((device, i) => (
                <p key={i} className="text-sm text-muted-foreground">
                  {device.name || device.device}
                </p>
              ))}
              <Button onClick={onConnected} className="w-full">
                Continuar a Chats
              </Button>
            </div>
          ) : (
            <Tabs defaultValue="qr" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="qr">
                  <QrCode className="h-4 w-4 mr-2" />
                  Código QR
                </TabsTrigger>
                <TabsTrigger value="code">
                  <Smartphone className="h-4 w-4 mr-2" />
                  Con Código
                </TabsTrigger>
              </TabsList>

              <TabsContent value="qr" className="space-y-4">
                {qrData?.qr_link ? (
                  <div className="space-y-4">
                    <div className="aspect-square bg-white rounded-lg p-4 flex items-center justify-center">
                      <img
                        src={qrData.qr_link}
                        alt="QR Code"
                        className="max-w-full max-h-full"
                      />
                    </div>
                    <p className="text-xs text-center text-muted-foreground">
                      Escanea este código con WhatsApp
                    </p>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleLoginQR}
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <RefreshCw className="h-4 w-4 mr-2" />
                      )}
                      Actualizar QR
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                      <QrCode className="h-16 w-16 text-muted-foreground/50" />
                    </div>
                    <Button
                      className="w-full"
                      onClick={handleLoginQR}
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <QrCode className="h-4 w-4 mr-2" />
                      )}
                      Generar Código QR
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="code" className="space-y-4">
                {pairCode ? (
                  <div className="space-y-4 text-center">
                    <p className="text-sm text-muted-foreground">
                      Ingresa este código en WhatsApp:
                    </p>
                    <div className="text-3xl font-mono font-bold tracking-widest p-4 bg-muted rounded-lg">
                      {pairCode}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      WhatsApp {">"} Dispositivos vinculados {">"} Vincular
                      dispositivo {">"} Vincular con número de teléfono
                    </p>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleLoginWithCode}
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <RefreshCw className="h-4 w-4 mr-2" />
                      )}
                      Generar nuevo código
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Número de teléfono</Label>
                      <Input
                        id="phone"
                        placeholder="549123456789"
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Incluye código de país sin el +
                      </p>
                    </div>
                    <Button
                      className="w-full"
                      onClick={handleLoginWithCode}
                      disabled={loading || !phoneInput.trim()}
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Smartphone className="h-4 w-4 mr-2" />
                      )}
                      Obtener código
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}

          {error && (
            <div className="mt-4 flex items-center gap-2 text-sm text-destructive">
              <XCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          <div className="mt-4 pt-4 border-t">
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={handleReconnect}
              disabled={loading}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Intentar reconectar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

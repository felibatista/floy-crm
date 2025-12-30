"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Save,
  Shield,
  CheckCircle,
  XCircle,
  Loader2,
  Upload,
  FileKey,
  Key,
  Copy,
  Download,
} from "lucide-react";

interface ArcaConfig {
  id?: number;
  cuit: string;
  razonSocial: string;
  domicilioFiscal: string;
  puntoVenta: number;
  condicionIva: string;
  hasCertificate: boolean;
}

const initialConfig: ArcaConfig = {
  cuit: "",
  razonSocial: "",
  domicilioFiscal: "",
  puntoVenta: 1,
  condicionIva: "monotributo",
  hasCertificate: false,
};

export default function ArcaConfigPage() {
  const router = useRouter();

  const [config, setConfig] = useState<ArcaConfig>(initialConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [validating, setValidating] = useState(false);
  const [uploadingCert, setUploadingCert] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    message: string;
  } | null>(null);

  const [certificado, setCertificado] = useState("");
  const [clavePrivada, setClavePrivada] = useState("");

  // Certificate generation
  const [generating, setGenerating] = useState(false);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [opensslCommand, setOpensslCommand] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Configuración ARCA | Acentus";
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/arca/config`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok) {
        const data = await res.json();
        if (data) {
          setConfig({
            ...initialConfig,
            ...data,
            domicilioFiscal: data.domicilioFiscal || "",
          });
        }
      }
    } catch (err) {
      console.error("Error fetching config:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!config.cuit || !config.razonSocial) {
      setError("CUIT y Razón Social son requeridos");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/arca/config`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(config),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al guardar configuración");
      }

      const data = await res.json();
      setConfig(data);
      setSuccess("Configuración guardada correctamente");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUploadCertificate = async () => {
    if (!certificado || !clavePrivada) {
      setError("Certificado y Clave Privada son requeridos");
      return;
    }

    setUploadingCert(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/arca/certificate`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ certificado, clavePrivada }),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al subir certificado");
      }

      setConfig({ ...config, hasCertificate: true });
      setCertificado("");
      setClavePrivada("");
      setSuccess("Certificado subido correctamente");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploadingCert(false);
    }
  };

  const handleValidateCertificate = async () => {
    setValidating(true);
    setError(null);
    setValidationResult(null);

    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/arca/certificate/validate`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();
      setValidationResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setValidating(false);
    }
  };

  const handleGenerateCertificate = async () => {
    if (!config.cuit || !config.razonSocial) {
      setError("Primero guarda tu CUIT y Razón Social");
      return;
    }

    setGenerating(true);
    setError(null);
    setSuccess(null);
    setGeneratedKey(null);
    setOpensslCommand(null);

    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/arca/certificate/generate`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            cuit: config.cuit,
            razonSocial: config.razonSocial,
          }),
        }
      );

      const data = await res.json();

      if (data.success) {
        setGeneratedKey(data.privateKey);
        setOpensslCommand(data.opensslCommand);
        setSuccess("Clave privada generada correctamente. Sigue los pasos para completar el proceso.");
      } else {
        throw new Error(data.error || "Error al generar certificado");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setSuccess(`${label} copiado al portapapeles`);
    setTimeout(() => setSuccess(null), 2000);
  };

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col p-4">
        <div className="flex items-center gap-4 mb-4">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-6 w-48" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/dashboard/facturacion")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold">Configuración ARCA</h1>
            <p className="text-sm text-muted-foreground">
              Configura tu conexión con AFIP para facturación electrónica
            </p>
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Guardar
        </Button>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-destructive/15 text-destructive px-4 py-3 m-4 rounded-md flex items-center gap-2">
          <XCircle className="h-4 w-4" />
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-500/15 text-green-600 px-4 py-3 m-4 rounded-md flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          {success}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        <div className="grid gap-4 md:grid-cols-2">
          {/* Datos Fiscales */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Datos Fiscales</CardTitle>
              <CardDescription>
                Información fiscal para la emisión de comprobantes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cuit">CUIT *</Label>
                <Input
                  id="cuit"
                  value={config.cuit}
                  onChange={(e) => setConfig({ ...config, cuit: e.target.value })}
                  placeholder="XX-XXXXXXXX-X"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="razonSocial">Razón Social *</Label>
                <Input
                  id="razonSocial"
                  value={config.razonSocial}
                  onChange={(e) =>
                    setConfig({ ...config, razonSocial: e.target.value })
                  }
                  placeholder="Tu nombre o razón social"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="domicilioFiscal">Domicilio Fiscal</Label>
                <Input
                  id="domicilioFiscal"
                  value={config.domicilioFiscal}
                  onChange={(e) =>
                    setConfig({ ...config, domicilioFiscal: e.target.value })
                  }
                  placeholder="Dirección fiscal"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="puntoVenta">Punto de Venta</Label>
                  <Input
                    id="puntoVenta"
                    type="number"
                    min="1"
                    value={config.puntoVenta}
                    onChange={(e) =>
                      setConfig({ ...config, puntoVenta: parseInt(e.target.value) || 1 })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="condicionIva">Condición IVA</Label>
                  <Select
                    value={config.condicionIva}
                    onValueChange={(value) =>
                      setConfig({ ...config, condicionIva: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monotributo">Monotributo</SelectItem>
                      <SelectItem value="responsable_inscripto">
                        Responsable Inscripto
                      </SelectItem>
                      <SelectItem value="exento">Exento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Certificado Digital */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Certificado Digital
              </CardTitle>
              <CardDescription>
                Certificado para autenticación con AFIP Web Services
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {config.hasCertificate ? (
                <div className="p-4 bg-green-500/10 rounded-md">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">Certificado configurado</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Ya tienes un certificado configurado. Puedes validarlo o reemplazarlo.
                  </p>
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleValidateCertificate}
                      disabled={validating}
                    >
                      {validating ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Shield className="h-4 w-4 mr-2" />
                      )}
                      Validar Certificado
                    </Button>
                  </div>

                  {validationResult && (
                    <div
                      className={`mt-4 p-3 rounded-md ${
                        validationResult.valid
                          ? "bg-green-500/20 text-green-600"
                          : "bg-destructive/20 text-destructive"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {validationResult.valid ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                        {validationResult.message}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-muted rounded-md">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <FileKey className="h-5 w-5" />
                    <span className="font-medium">Sin certificado</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Necesitas subir un certificado digital para poder facturar.
                  </p>
                </div>
              )}

              {/* Certificate Generator */}
              <div className="border-t pt-4">
                <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  Generar Clave Privada
                </h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Genera una clave privada RSA y obtén el comando OpenSSL para crear el CSR (Certificate Signing Request) que necesitas para solicitar tu certificado en AFIP.
                </p>

                <Button
                  onClick={handleGenerateCertificate}
                  disabled={generating || !config.cuit || !config.razonSocial}
                  variant="outline"
                  className="w-full mb-4"
                >
                  {generating ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Key className="h-4 w-4 mr-2" />
                  )}
                  Generar Nueva Clave Privada
                </Button>

                {(!config.cuit || !config.razonSocial) && (
                  <p className="text-xs text-muted-foreground mb-4">
                    Primero completa y guarda tu CUIT y Razón Social.
                  </p>
                )}

                {generatedKey && (
                  <div className="space-y-4 p-4 bg-muted rounded-md">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-xs font-medium">Paso 1: Guarda tu Clave Privada</Label>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(generatedKey, "Clave privada")}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => downloadFile(generatedKey, `clave_privada_${config.cuit}.key`)}
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <Textarea
                        value={generatedKey}
                        readOnly
                        rows={6}
                        className="font-mono text-xs"
                      />
                      <p className="text-xs text-amber-600 mt-2">
                        ⚠️ Guarda esta clave en un lugar seguro. La necesitarás después.
                      </p>
                    </div>

                    {opensslCommand && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-xs font-medium">Paso 2: Ejecuta este comando OpenSSL</Label>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(opensslCommand, "Comando OpenSSL")}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="bg-black text-green-400 p-3 rounded-md font-mono text-xs overflow-x-auto">
                          {opensslCommand}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Este comando genera el archivo CSR que debes subir a AFIP.
                        </p>
                      </div>
                    )}

                    <div className="text-xs text-muted-foreground space-y-1">
                      <p className="font-medium text-foreground">Paso 3: Sube el CSR a AFIP</p>
                      <ol className="list-decimal list-inside space-y-1 ml-2">
                        <li>Ingresa a AFIP con tu Clave Fiscal</li>
                        <li>Ve a "Administrador de Relaciones de Clave Fiscal"</li>
                        <li>Selecciona "Administrar Certificados"</li>
                        <li>Crea un nuevo certificado y sube el archivo .csr generado</li>
                        <li>Descarga el certificado (.crt) que te devuelve AFIP</li>
                      </ol>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      <p className="font-medium text-foreground">Paso 4: Sube el certificado aquí</p>
                      <p>Una vez que AFIP te entregue el certificado, pégalo en el formulario de abajo junto con la clave privada que guardaste.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Upload Certificate */}
              <div className="border-t pt-4">
                <h4 className="font-medium text-sm mb-3">
                  {config.hasCertificate ? "Reemplazar Certificado" : "Subir Certificado"}
                </h4>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="certificado">Certificado (.crt/.pem)</Label>
                    <Textarea
                      id="certificado"
                      value={certificado}
                      onChange={(e) => setCertificado(e.target.value)}
                      placeholder="-----BEGIN CERTIFICATE-----&#10;...&#10;-----END CERTIFICATE-----"
                      rows={4}
                      className="font-mono text-xs"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="clavePrivada">Clave Privada (.key)</Label>
                    <Textarea
                      id="clavePrivada"
                      value={clavePrivada}
                      onChange={(e) => setClavePrivada(e.target.value)}
                      placeholder="-----BEGIN RSA PRIVATE KEY-----&#10;...&#10;-----END RSA PRIVATE KEY-----"
                      rows={4}
                      className="font-mono text-xs"
                    />
                  </div>

                  <Button
                    onClick={handleUploadCertificate}
                    disabled={uploadingCert || !certificado || !clavePrivada}
                    className="w-full"
                  >
                    {uploadingCert ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    Subir Certificado
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-sm">Instrucciones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground space-y-4">
                <div>
                  <h4 className="font-medium text-foreground mb-2">
                    1. Generar Certificado en AFIP
                  </h4>
                  <ol className="list-decimal list-inside space-y-1 ml-2">
                    <li>
                      Ingresa a{" "}
                      <a
                        href="https://auth.afip.gob.ar/contribuyente_/login.xhtml"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        AFIP con Clave Fiscal
                      </a>
                    </li>
                    <li>Ve a "Administrador de Relaciones de Clave Fiscal"</li>
                    <li>Selecciona "Agregar Servicio" y busca "WSFE - Facturación Electrónica"</li>
                    <li>Genera un nuevo certificado desde "Administrar Certificados"</li>
                  </ol>
                </div>

                <div>
                  <h4 className="font-medium text-foreground mb-2">
                    2. Configurar Punto de Venta
                  </h4>
                  <ol className="list-decimal list-inside space-y-1 ml-2">
                    <li>Ve a "ABM de Puntos de Venta"</li>
                    <li>Crea un punto de venta tipo "Web Services"</li>
                    <li>Ingresa el número del punto de venta aquí</li>
                  </ol>
                </div>

                <div>
                  <h4 className="font-medium text-foreground mb-2">
                    3. Subir Certificado
                  </h4>
                  <p>
                    Copia y pega el contenido del certificado (.crt) y la clave privada
                    (.key) en los campos correspondientes arriba.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

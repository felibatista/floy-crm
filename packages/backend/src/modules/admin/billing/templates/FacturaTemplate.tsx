import React from "react";

// ==========================================
// TIPOS DE DATOS
// ==========================================

export interface FacturaData {
  // Datos del emisor
  razonSocial: string;
  domicilioFiscal: string;
  cuitEmisor: string;
  condicionIva: string;
  ingresosBrutos?: string;
  inicioActividades?: string;

  // Datos del comprobante
  tipoComprobante: "factura_c" | "nota_credito_c" | "nota_debito_c";
  puntoVenta: number;
  numero: number;
  fechaEmision: string;

  // Datos del receptor
  receptorNombre: string;
  receptorCuit?: string;
  receptorCondicionIva: string;
  receptorDomicilio?: string;

  // Importes
  importeNeto: string;
  importeIva?: string;
  importeTotal: string;

  // Concepto
  concepto: string;
  mostrarPeriodo: boolean;
  periodoDesde?: string;
  periodoHasta?: string;
  vencimientoPago?: string;

  // CAE
  cae: string;
  caeVencimiento: string;

  // QR
  qrCodeUrl?: string;

  // Personalización
  leyendaImpositiva?: string;
}

// ==========================================
// MAPEOS Y CONSTANTES - Edita según necesites
// ==========================================

const TIPO_COMPROBANTE_TEXTO = {
  factura_c: "FACTURA",
  nota_credito_c: "NOTA DE CRÉDITO",
  nota_debito_c: "NOTA DE DÉBITO",
};

const TIPO_COMPROBANTE_LETRA = {
  factura_c: "C",
  nota_credito_c: "C",
  nota_debito_c: "C",
};

const TIPO_COMPROBANTE_CODIGO = {
  factura_c: "011",
  nota_credito_c: "013",
  nota_debito_c: "012",
};

// ==========================================
// COMPONENTES AUXILIARES
// ==========================================

const Section: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = "",
}) => (
  <div className={`border-b-2 border-black ${className}`}>{children}</div>
);

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="font-bold">{children}</span>
);

// ==========================================
// COMPONENTE PRINCIPAL - TEMPLATE DE FACTURA
// ==========================================

export const FacturaTemplate: React.FC<{ data: FacturaData }> = ({ data }) => {
  const letra = TIPO_COMPROBANTE_LETRA[data.tipoComprobante];
  const tipoTexto = TIPO_COMPROBANTE_TEXTO[data.tipoComprobante];
  const codigoComprobante = TIPO_COMPROBANTE_CODIGO[data.tipoComprobante];

  return (
    <div className="font-sans text-[11px] leading-normal text-gray-800 bg-white p-4">
      <div className="max-w-[800px] mx-auto border-2 border-black">

        {/* ==========================================
            HEADER - Datos del emisor y comprobante
            ========================================== */}
        <Section>
          <div className="flex">
            {/* Columna izquierda - Datos del emisor */}
            <div className="w-[45%] p-4 border-r-2 border-black">
              <div className="text-base font-bold mb-2">{data.razonSocial}</div>
              <div className="mb-1">{data.domicilioFiscal}</div>
              <p>
                <Label>Condición frente al IVA:</Label> {data.condicionIva}
              </p>
            </div>

            {/* Centro - Letra del comprobante */}
            <div className="w-[10%] flex flex-col items-center justify-center border-r-2 border-black bg-gray-100">
              <div className="text-4xl font-bold leading-none">{letra}</div>
              <div className="text-[9px] text-center mt-1">
                Cód. {codigoComprobante}
              </div>
            </div>

            {/* Columna derecha - Datos del comprobante */}
            <div className="w-[45%] p-4">
              <div className="text-sm font-bold mb-2">{tipoTexto}</div>
              <div className="text-sm font-bold mb-2">
                Nº {data.puntoVenta.toString().padStart(4, "0")}-
                {data.numero.toString().padStart(8, "0")}
              </div>
              <div className="mb-1">
                <Label>Fecha de Emisión:</Label> {data.fechaEmision}
              </div>
              <div className="mb-1">
                <Label>CUIT:</Label> {data.cuitEmisor}
              </div>
              <div className="mb-1">
                <Label>Ingresos Brutos:</Label>{" "}
                {data.ingresosBrutos || data.cuitEmisor}
              </div>
              <div className="mb-1">
                <Label>Inicio de Actividades:</Label>{" "}
                {data.inicioActividades || "-"}
              </div>
            </div>
          </div>
        </Section>

        {/* ==========================================
            PERÍODO DE SERVICIOS (condicional)
            ========================================== */}
        {data.mostrarPeriodo && (
          <Section>
            <div className="px-4 py-2 bg-gray-50 text-[10px]">
              <span className="mr-5">
                <Label>Período Facturado Desde:</Label> {data.periodoDesde}
              </span>
              <span className="mr-5">
                <Label>Hasta:</Label> {data.periodoHasta}
              </span>
              <span>
                <Label>Vto. para el pago:</Label> {data.vencimientoPago}
              </span>
            </div>
          </Section>
        )}

        {/* ==========================================
            DATOS DEL RECEPTOR/CLIENTE
            ========================================== */}
        <Section>
          <div className="p-3 bg-gray-50">
            <div className="flex mb-1">
              <span className="font-bold w-[180px]">CUIT/CUIL/DNI:</span>
              <span className="flex-1">{data.receptorCuit || "-"}</span>
            </div>
            <div className="flex mb-1">
              <span className="font-bold w-[180px]">
                Apellido y Nombre / Razón Social:
              </span>
              <span className="flex-1">{data.receptorNombre}</span>
            </div>
            <div className="flex mb-1">
              <span className="font-bold w-[180px]">Condición frente al IVA:</span>
              <span className="flex-1">{data.receptorCondicionIva}</span>
            </div>
            <div className="flex">
              <span className="font-bold w-[180px]">Domicilio:</span>
              <span className="flex-1">{data.receptorDomicilio || "-"}</span>
            </div>
          </div>
        </Section>

        {/* ==========================================
            DETALLE DE ITEMS
            ========================================== */}
        <Section>
          <div className="min-h-[200px] p-3">
            {/* Header del detalle */}
            <div className="flex font-bold border-b border-gray-300 pb-1 mb-2">
              <div className="flex-1">Descripción</div>
              <div className="w-[80px] text-center">Cantidad</div>
              <div className="w-[100px] text-right">Precio Unit.</div>
              <div className="w-[100px] text-right">Subtotal</div>
            </div>

            {/* Fila de detalle */}
            <div className="flex py-1 border-b border-gray-100">
              <div className="flex-1">{data.concepto}</div>
              <div className="w-[80px] text-center">1</div>
              <div className="w-[100px] text-right">{data.importeNeto}</div>
              <div className="w-[100px] text-right">{data.importeNeto}</div>
            </div>

            {/* Puedes agregar más filas aquí si necesitas múltiples items */}
          </div>
        </Section>

        {/* ==========================================
            TOTALES
            ========================================== */}
        <Section>
          <div className="p-4">
            <div className="flex justify-end mb-1">
              <div className="w-[150px] text-right pr-4">Subtotal:</div>
              <div className="w-[120px] text-right font-bold">
                $ {data.importeNeto}
              </div>
            </div>

            {/* IVA (si aplica) */}
            {data.importeIva && (
              <div className="flex justify-end mb-1">
                <div className="w-[150px] text-right pr-4">IVA 21%:</div>
                <div className="w-[120px] text-right font-bold">
                  $ {data.importeIva}
                </div>
              </div>
            )}

            {/* Total */}
            <div className="flex justify-end border-t-2 border-black pt-2 mt-2">
              <div className="w-[150px] text-right pr-4 text-sm">TOTAL:</div>
              <div className="w-[120px] text-right font-bold text-sm">
                $ {data.importeTotal}
              </div>
            </div>
          </div>
        </Section>

        {/* ==========================================
            PIE - CAE Y QR
            ========================================== */}
        <div className="flex p-4">
          {/* Info CAE */}
          <div className="flex-1">
            <div className="mb-2">
              <p className="mb-1">
                <Label>CAE Nº:</Label>{" "}
                <span className="text-xs font-bold">{data.cae}</span>
              </p>
              <p>
                <Label>Fecha de Vto. de CAE:</Label> {data.caeVencimiento}
              </p>
            </div>
          </div>

          {/* QR Code */}
          <div className="w-[120px] text-center">
            <div className="w-[100px] h-[100px] border border-gray-300 flex items-center justify-center mx-auto">
              {data.qrCodeUrl ? (
                <img
                  src={data.qrCodeUrl}
                  alt="Código QR AFIP"
                  className="max-w-full max-h-full"
                />
              ) : (
                <span className="text-[8px] text-gray-400">QR Code</span>
              )}
            </div>
            <p className="text-[8px] mt-1">Comprobante autorizado</p>
          </div>
        </div>

        {/* ==========================================
            LEYENDAS LEGALES
            ========================================== */}
        <div className="px-4 py-2 text-[9px] text-gray-500 border-t border-gray-300">
          <p className="mb-1">
            {data.leyendaImpositiva ||
              "El importe de esta factura no incluye IVA por tratarse de un sujeto Monotributista."}
          </p>
          <p className="mb-1">
            Comprobante autorizado por AFIP - ARCA (Administración Federal de
            Ingresos Públicos)
          </p>
          <p>
            Esta factura electrónica tiene validez fiscal y fue generada según RG
            4291/2018
          </p>
        </div>
      </div>
    </div>
  );
};

export default FacturaTemplate;

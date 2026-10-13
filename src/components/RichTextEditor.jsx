import React, { useRef, useEffect, useState } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Table as TableIcon,
  Minus,
  RotateCcw,
  RotateCw,
  Eye,
  Code,
  Edit3,
  RemoveFormatting,
  PlusCircle,
} from 'lucide-react';

export const RichTextEditor = ({
  value = '',
  onChange,
  documentoMeta = {},
}) => {
  const editorRef = useRef(null);
  const [activeTab, setActiveTab] = useState('editor'); // 'editor', 'preview', 'html'
  const [rawHtml, setRawHtml] = useState(value || '');

  // Sincronizar valor inicial
  useEffect(() => {
    if (editorRef.current && activeTab === 'editor') {
      if (editorRef.current.innerHTML !== (value || '')) {
        editorRef.current.innerHTML = value || '';
      }
    }
    setRawHtml(value || '');
  }, [value, activeTab]);

  const emitChange = (html) => {
    setRawHtml(html);
    if (onChange) {
      onChange(html);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      emitChange(editorRef.current.innerHTML);
    }
  };

  const exec = (command, val = null) => {
    if (activeTab !== 'editor') {
      setActiveTab('editor');
      setTimeout(() => {
        editorRef.current?.focus();
        document.execCommand(command, false, val);
        handleInput();
      }, 50);
      return;
    }
    editorRef.current?.focus();
    document.execCommand(command, false, val);
    handleInput();
  };

  const handleFormatBlock = (tag) => {
    exec('formatBlock', `<${tag}>`);
  };

  const insertarTabla = () => {
    const tableHtml = `
      <table style="width: 100%; border-collapse: collapse; margin: 12px 0; border: 1px solid #94a3b8;">
        <thead>
          <tr style="background-color: #f1f5f9;">
            <th style="border: 1px solid #94a3b8; padding: 8px 12px; text-align: left; font-size: 13px;">No.</th>
            <th style="border: 1px solid #94a3b8; padding: 8px 12px; text-align: left; font-size: 13px;">Actividad / Paso</th>
            <th style="border: 1px solid #94a3b8; padding: 8px 12px; text-align: left; font-size: 13px;">Responsable</th>
            <th style="border: 1px solid #94a3b8; padding: 8px 12px; text-align: left; font-size: 13px;">Registro / Evidencia</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border: 1px solid #cbd5e1; padding: 8px 12px; font-size: 13px;">1.0</td>
            <td style="border: 1px solid #cbd5e1; padding: 8px 12px; font-size: 13px;">Descripción de la actividad...</td>
            <td style="border: 1px solid #cbd5e1; padding: 8px 12px; font-size: 13px;">Operador / Analista</td>
            <td style="border: 1px solid #cbd5e1; padding: 8px 12px; font-size: 13px;">Bitácora de registro</td>
          </tr>
          <tr>
            <td style="border: 1px solid #cbd5e1; padding: 8px 12px; font-size: 13px;">2.0</td>
            <td style="border: 1px solid #cbd5e1; padding: 8px 12px; font-size: 13px;">Siguiente paso del procedimiento...</td>
            <td style="border: 1px solid #cbd5e1; padding: 8px 12px; font-size: 13px;">Supervisor de Calidad</td>
            <td style="border: 1px solid #cbd5e1; padding: 8px 12px; font-size: 13px;">Formato de inspección</td>
          </tr>
        </tbody>
      </table>
      <p></p>
    `;
    exec('insertHTML', tableHtml);
  };

  const insertarPlantillaSeccion = (titulo, cuerpo) => {
    const seccionHtml = `
      <h3 style="color: #0f172a; font-size: 15px; font-weight: 700; border-bottom: 2px solid #006552; padding-bottom: 4px; margin-top: 18px; margin-bottom: 8px; text-transform: uppercase;">
        ${titulo}
      </h3>
      <p style="font-size: 13px; line-height: 1.6; color: #334155; margin-bottom: 12px;">
        ${cuerpo}
      </p>
    `;
    exec('insertHTML', seccionHtml);
  };

  const handleRawHtmlChange = (e) => {
    const newHtml = e.target.value;
    setRawHtml(newHtml);
    emitChange(newHtml);
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-300 shadow-xs overflow-hidden flex flex-col">
      {/* Barra superior de pestañas */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-100 border-b border-slate-200">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('editor')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'editor'
                ? 'bg-[#006552] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Editor Visual</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'preview'
                ? 'bg-[#006552] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Vista Previa Oficial</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('html')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'html'
                ? 'bg-[#006552] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Código HTML</span>
          </button>
        </div>

        {/* Plantillas rápidas de Procedimientos ISO / Estándar */}
        <div className="hidden sm:flex items-center gap-1">
          <span className="text-[11px] text-slate-500 font-medium mr-1">Insertar Sección:</span>
          <button
            type="button"
            onClick={() => insertarPlantillaSeccion('1. OBJETIVO', 'Establecer los lineamientos y actividades necesarias para...')}
            className="px-2 py-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded text-[11px] font-medium transition"
          >
            + Objetivo
          </button>
          <button
            type="button"
            onClick={() => insertarPlantillaSeccion('2. ALCANCE', 'Este procedimiento aplica para todas las áreas operativas de la organización...')}
            className="px-2 py-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded text-[11px] font-medium transition"
          >
            + Alcance
          </button>
          <button
            type="button"
            onClick={() => insertarPlantillaSeccion('3. RESPONSABILIDADES', 'Es responsabilidad del personal involucrado acatar las directrices...')}
            className="px-2 py-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded text-[11px] font-medium transition"
          >
            + Responsabilidades
          </button>
        </div>
      </div>

      {/* Barra de herramientas WYSIWYG */}
      {activeTab === 'editor' && (
        <div className="flex flex-wrap items-center gap-1 px-3 py-2 bg-slate-50 border-b border-slate-200 text-slate-700">
          {/* Deshacer / Rehacer */}
          <div className="flex items-center gap-0.5 pr-2 border-r border-slate-300">
            <button
              type="button"
              onClick={() => exec('undo')}
              title="Deshacer (Ctrl+Z)"
              className="p-1.5 rounded hover:bg-slate-200 text-slate-700"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => exec('redo')}
              title="Rehacer (Ctrl+Y)"
              className="p-1.5 rounded hover:bg-slate-200 text-slate-700"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>

          {/* Formatos de Texto */}
          <div className="flex items-center gap-0.5 px-2 border-r border-slate-300">
            <button
              type="button"
              onClick={() => exec('bold')}
              title="Negrita (Ctrl+B)"
              className="p-1.5 rounded hover:bg-slate-200 text-slate-700 font-bold"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => exec('italic')}
              title="Cursiva (Ctrl+I)"
              className="p-1.5 rounded hover:bg-slate-200 text-slate-700"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => exec('underline')}
              title="Subrayado (Ctrl+U)"
              className="p-1.5 rounded hover:bg-slate-200 text-slate-700"
            >
              <Underline className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => exec('strikeThrough')}
              title="Tachado"
              className="p-1.5 rounded hover:bg-slate-200 text-slate-700"
            >
              <Strikethrough className="w-4 h-4" />
            </button>
          </div>

          {/* Encabezados y Párrafos */}
          <div className="flex items-center gap-1 px-2 border-r border-slate-300">
            <button
              type="button"
              onClick={() => handleFormatBlock('h1')}
              title="Título Principal H1"
              className="px-2 py-1 rounded text-xs font-bold hover:bg-slate-200 text-slate-700"
            >
              H1
            </button>
            <button
              type="button"
              onClick={() => handleFormatBlock('h2')}
              title="Subtítulo H2"
              className="px-2 py-1 rounded text-xs font-semibold hover:bg-slate-200 text-slate-700"
            >
              H2
            </button>
            <button
              type="button"
              onClick={() => handleFormatBlock('h3')}
              title="Sección H3"
              className="px-2 py-1 rounded text-xs font-medium hover:bg-slate-200 text-slate-700"
            >
              H3
            </button>
            <button
              type="button"
              onClick={() => handleFormatBlock('p')}
              title="Texto Normal"
              className="px-2 py-1 rounded text-xs hover:bg-slate-200 text-slate-700"
            >
              Párrafo
            </button>
          </div>

          {/* Alineación */}
          <div className="flex items-center gap-0.5 px-2 border-r border-slate-300">
            <button
              type="button"
              onClick={() => exec('justifyLeft')}
              title="Alinear a la izquierda"
              className="p-1.5 rounded hover:bg-slate-200 text-slate-700"
            >
              <AlignLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => exec('justifyCenter')}
              title="Centrar"
              className="p-1.5 rounded hover:bg-slate-200 text-slate-700"
            >
              <AlignCenter className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => exec('justifyRight')}
              title="Alinear a la derecha"
              className="p-1.5 rounded hover:bg-slate-200 text-slate-700"
            >
              <AlignRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => exec('justifyFull')}
              title="Justificar"
              className="p-1.5 rounded hover:bg-slate-200 text-slate-700"
            >
              <AlignJustify className="w-4 h-4" />
            </button>
          </div>

          {/* Listas */}
          <div className="flex items-center gap-0.5 px-2 border-r border-slate-300">
            <button
              type="button"
              onClick={() => exec('insertUnorderedList')}
              title="Lista con viñetas"
              className="p-1.5 rounded hover:bg-slate-200 text-slate-700"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => exec('insertOrderedList')}
              title="Lista numerada"
              className="p-1.5 rounded hover:bg-slate-200 text-slate-700"
            >
              <ListOrdered className="w-4 h-4" />
            </button>
          </div>

          {/* Inserciones estructuradas */}
          <div className="flex items-center gap-0.5 pl-2">
            <button
              type="button"
              onClick={insertarTabla}
              title="Insertar Tabla de Procedimiento"
              className="inline-flex items-center gap-1 px-2 py-1 rounded bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-semibold"
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Insertar Tabla</span>
            </button>
            <button
              type="button"
              onClick={() => exec('insertHorizontalRule')}
              title="Línea divisoria horizontal"
              className="p-1.5 rounded hover:bg-slate-200 text-slate-700"
            >
              <Minus className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => exec('removeFormat')}
              title="Limpiar Formato"
              className="p-1.5 rounded hover:bg-slate-200 text-slate-700"
            >
              <RemoveFormatting className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Área del Contenido según Pestaña */}
      <div className="flex-1 min-h-[380px] bg-white">
        {/* Pestaña: Editor Visual */}
        {activeTab === 'editor' && (
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            onBlur={handleInput}
            className="w-full h-full min-h-[380px] p-6 focus:outline-none text-slate-800 text-sm leading-relaxed overflow-y-auto"
            style={{
              fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
            }}
            placeholder="Comienza a redactar el contenido oficial del procedimiento..."
          />
        )}

        {/* Pestaña: Vista Previa Oficial Institucional */}
        {activeTab === 'preview' && (
          <div className="p-6 bg-slate-100 overflow-y-auto max-h-[600px]">
            <div className="bg-white border border-slate-300 shadow-md p-8 max-w-4xl mx-auto rounded-xl">
              {/* Encabezado Institucional */}
              <table className="w-full border-collapse mb-4 border border-black text-xs">
                <tbody>
                  <tr>
                    <td rowSpan={5} className="border border-black p-3 w-28 text-center align-middle font-bold text-teal-800">
                      ACAMA
                    </td>
                    <td rowSpan={5} className="border border-black p-3 text-center align-middle font-bold text-sm uppercase">
                      {documentoMeta.documento || 'TÍTULO DEL PROCEDIMIENTO'}
                    </td>
                    <td className="border border-black p-2 font-semibold w-36">Procedimiento No.</td>
                    <td className="border border-black p-2 text-center font-bold w-36">
                      {documentoMeta.claveCompleta || 'PROC-001'}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-black p-2 font-semibold">Válido desde:</td>
                    <td className="border border-black p-2 text-center">{documentoMeta.validoDesde || '—'}</td>
                  </tr>
                  <tr>
                    <td className="border border-black p-2 font-semibold">Última Revisión:</td>
                    <td className="border border-black p-2 text-center">{documentoMeta.ultimaModificacion || '—'}</td>
                  </tr>
                  <tr>
                    <td className="border border-black p-2 font-semibold">Revisión:</td>
                    <td className="border border-black p-2 text-center font-bold">{documentoMeta.numeroRevision || '00'}</td>
                  </tr>
                  <tr>
                    <td className="border border-black p-2 font-semibold">Departamento:</td>
                    <td className="border border-black p-2 text-center">{documentoMeta.departamentoNombre || 'General'}</td>
                  </tr>
                </tbody>
              </table>

              {/* Firmas */}
              <table className="w-full border-collapse mb-6 border border-black text-xs">
                <tbody>
                  <tr>
                    <td className="border border-black p-3 w-1/2 text-center">
                      <p className="text-left font-bold text-[11px] text-slate-600 mb-1">Elaborado por:</p>
                      <div className="h-10 flex items-center justify-center italic text-slate-400">
                        [Firma Registrada de Elaboración]
                      </div>
                      <div className="border-t border-black w-4/5 mx-auto my-1"></div>
                      <p className="font-semibold text-xs mt-1">{documentoMeta.elaboraNombre || 'Nombre del Elaborador'}</p>
                    </td>
                    <td className="border border-black p-3 w-1/2 text-center">
                      <p className="text-left font-bold text-[11px] text-slate-600 mb-1">Autorizado por:</p>
                      <div className="h-10 flex items-center justify-center italic text-slate-400">
                        [Firma Registrada de Autorización]
                      </div>
                      <div className="border-t border-black w-4/5 mx-auto my-1"></div>
                      <p className="font-semibold text-xs mt-1">{documentoMeta.autorizaNombre || 'Nombre del Autorizador'}</p>
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Cuerpo del Documento */}
              <div
                className="prose max-w-none text-slate-800 text-sm leading-relaxed min-h-[220px]"
                dangerouslySetInnerHTML={{
                  __html: rawHtml || '<p style="color:#94a3b8; font-style:italic;">Sin contenido redactado aún...</p>',
                }}
              />

              {/* Pie de Página */}
              <div className="mt-8 pt-3 border-t border-black flex justify-between items-center text-[11px] text-slate-600">
                <span>{documentoMeta.departamentoNombre || 'General'} | AcamaDocs</span>
                <span>Laboratorio de Análisis de Calidad del Agua y Medio Ambiente, S.A. de C.V.</span>
              </div>
            </div>
          </div>
        )}

        {/* Pestaña: Código HTML Directo */}
        {activeTab === 'html' && (
          <div className="p-4 bg-slate-900 h-full min-h-[380px]">
            <textarea
              value={rawHtml}
              onChange={handleRawHtmlChange}
              placeholder="Escribe o pega código HTML estructurado aquí..."
              className="w-full h-full min-h-[350px] p-3 font-mono text-xs bg-slate-950 text-emerald-400 border border-slate-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        )}
      </div>

      {/* Barra de estado inferior */}
      <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-[11px] text-slate-500">
        <span>Formato: HTML Enriquecido Institucional (Compatible con reportes y tablas ISO)</span>
        <span>{rawHtml.length} caracteres</span>
      </div>
    </div>
  );
};

export default RichTextEditor;

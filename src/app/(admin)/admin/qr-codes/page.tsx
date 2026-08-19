'use client';

import React, { useState, useEffect } from 'react';
import { QR_TEMPLATES } from '@/lib/qr-templates';
import { generateBrandedQRCard } from '@/lib/qr-generator';
import jsPDF from 'jspdf';

interface TableQRItem {
  id?: string;
  table_number: string;
  table_label: string;
  template_id: string;
  scan_count: number;
  previewUrl?: string;
}

export default function AdminQRCodesPage() {
  const [cafeName, setCafeName] = useState('ChatChaska Cafe');
  const [cafeSlug, setCafeSlug] = useState('chatchaska-cafe');
  const [selectedTemplate, setSelectedTemplate] = useState('classic');
  const [tables, setTables] = useState<TableQRItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Table Inputs in Modal
  const [startTable, setStartTable] = useState(1);
  const [endTable, setEndTable] = useState(10);
  const [prefix, setPrefix] = useState('Table');

  // Load existing tables and generate previews
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        // Fetch tables from local API or generate default 1-10
        const res = await fetch('/api/tables');
        const data = await res.json();
        let loadedTables: TableQRItem[] = [];

        if (data && data.tables && data.tables.length > 0) {
          loadedTables = data.tables.map((t: any) => ({
            table_number: t.name || t.id.replace('table-', ''),
            table_label: t.name ? `Table ${t.name}` : t.id,
            template_id: selectedTemplate,
            scan_count: 0,
          }));
        } else {
          // Default 8 tables
          loadedTables = Array.from({ length: 8 }, (_, i) => ({
            table_number: `${i + 1}`,
            table_label: `Table ${i + 1}`,
            template_id: selectedTemplate,
            scan_count: 0,
          }));
        }

        // Render card previews
        const withPreviews = await Promise.all(
          loadedTables.map(async (t) => {
            const previewUrl = await generateBrandedQRCard({
              cafeName,
              tableLabel: t.table_label,
              tableNumber: t.table_number,
              cafeSlug,
              templateId: selectedTemplate,
            });
            return { ...t, previewUrl };
          })
        );

        setTables(withPreviews);
      } catch (err) {
        console.error('Error loading QR data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [cafeName, cafeSlug, selectedTemplate]);

  // Download Single QR as PNG
  const handleDownloadPNG = (table: TableQRItem) => {
    if (!table.previewUrl) return;
    const a = document.createElement('a');
    a.href = table.previewUrl;
    a.download = `${cafeSlug}-qr-table-${table.table_number}.png`;
    a.click();
  };

  // Download All QRs as PDF (Bulk PDF Export)
  const handleDownloadAllPDF = async () => {
    setGenerating(true);
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      for (let i = 0; i < tables.length; i++) {
        const table = tables[i];
        if (i > 0) doc.addPage();

        const imgData =
          table.previewUrl ||
          (await generateBrandedQRCard({
            cafeName,
            tableLabel: table.table_label,
            tableNumber: table.table_number,
            cafeSlug,
            templateId: selectedTemplate,
          }));

        // Center on A4 page (210 x 297 mm)
        doc.addImage(imgData, 'PNG', 25, 20, 160, 213);
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text(`ChatChaska Smart POS • Table ${table.table_number}`, 105, 250, { align: 'center' });
      }

      doc.save(`${cafeSlug}-all-table-qrs.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      setGenerating(false);
    }
  };

  // Generate batch tables
  const handleGenerateBatch = async () => {
    const newBatch: TableQRItem[] = [];
    for (let i = startTable; i <= endTable; i++) {
      newBatch.push({
        table_number: `${i}`,
        table_label: `${prefix} ${i}`,
        template_id: selectedTemplate,
        scan_count: 0,
      });
    }

    const withPreviews = await Promise.all(
      newBatch.map(async (t) => {
        const previewUrl = await generateBrandedQRCard({
          cafeName,
          tableLabel: t.table_label,
          tableNumber: t.table_number,
          cafeSlug,
          templateId: selectedTemplate,
        });
        return { ...t, previewUrl };
      })
    );

    setTables(withPreviews);
    setIsModalOpen(false);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 text-white">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/80 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-3xl text-orange-400">qr_code_2</span>
            <h1 className="text-2xl font-black tracking-tight">QR Code Standee Manager</h1>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Generate and print branded tabletop QR codes for instant self-ordering.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 border border-slate-700 cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">add_circle</span>
            <span>Batch Add Tables</span>
          </button>

          <button
            onClick={handleDownloadAllPDF}
            disabled={generating || tables.length === 0}
            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-lg">picture_as_pdf</span>
            <span>{generating ? 'Exporting PDF...' : 'Download All as PDF (A4)'}</span>
          </button>
        </div>
      </div>

      {/* Template Selector Carousel */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-slate-200 flex items-center gap-2">
          <span className="material-symbols-outlined text-orange-400">palette</span>
          <span>Choose Standee Theme & Branding</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {QR_TEMPLATES.map((tmpl) => {
            const isSelected = selectedTemplate === tmpl.id;
            return (
              <div
                key={tmpl.id}
                onClick={() => setSelectedTemplate(tmpl.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                  isSelected
                    ? 'bg-slate-800 border-orange-500 ring-2 ring-orange-500/30'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: tmpl.accentColor }} />
                  {isSelected && (
                    <span className="text-[11px] font-bold bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-sm text-slate-100">{tmpl.name}</h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{tmpl.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* QR Codes Grid */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-base font-bold text-slate-200">
            Active Table QR Standees ({tables.length})
          </h2>
          <span className="text-xs text-slate-400">Click any card to download high-res PNG</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-slate-900 border border-slate-800 rounded-3xl h-80 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {tables.map((table) => (
              <div
                key={table.table_number}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-4 flex flex-col items-center shadow-lg hover:border-slate-700 transition-all group"
              >
                {/* Preview Image */}
                <div className="w-full aspect-[3/4] bg-slate-950 rounded-2xl overflow-hidden mb-4 relative flex items-center justify-center p-2">
                  {table.previewUrl ? (
                    <img
                      src={table.previewUrl}
                      alt={table.table_label}
                      className="w-full h-full object-contain rounded-xl"
                    />
                  ) : (
                    <span className="material-symbols-outlined text-4xl text-slate-600 animate-spin">
                      progress_activity
                    </span>
                  )}
                </div>

                {/* Table Info & Actions */}
                <div className="w-full flex items-center justify-between pt-1">
                  <div>
                    <h3 className="font-bold text-slate-100 text-sm">{table.table_label}</h3>
                    <p className="text-xs text-slate-400">Scan to order</p>
                  </div>

                  <button
                    onClick={() => handleDownloadPNG(table)}
                    className="bg-slate-800 hover:bg-orange-500 text-slate-200 hover:text-white p-2.5 rounded-xl transition-all cursor-pointer"
                    title="Download PNG"
                  >
                    <span className="material-symbols-outlined text-lg">download</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Batch Generator Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 text-white">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold">Generate Table Range</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Prefix</label>
                <input
                  type="text"
                  value={prefix}
                  onChange={(e) => setPrefix(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm"
                  placeholder="e.g. Table, Booth, Terrace"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Start Table #</label>
                  <input
                    type="number"
                    value={startTable}
                    onChange={(e) => setStartTable(Number(e.target.value))}
                    min={1}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">End Table #</label>
                  <input
                    type="number"
                    value={endTable}
                    onChange={(e) => setEndTable(Number(e.target.value))}
                    min={startTable}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleGenerateBatch}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold py-3 rounded-xl shadow-lg transition-all cursor-pointer"
            >
              Generate Standees
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { X, UploadCloud, CheckCircle2, FileText, ChevronRight } from 'lucide-react';

interface CSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadCSV: (provider: string, csvContent: string) => Promise<any>;
}

export const CSVImportModal: React.FC<CSVImportModalProps> = ({
  isOpen,
  onClose,
  onUploadCSV,
}) => {
  const [selectedProvider, setSelectedProvider] = useState<string>('PHONEPE');
  const [csvContent, setCsvContent] = useState<string>('');
  const [uploading, setUploading] = useState<boolean>(false);
  const [importResult, setImportResult] = useState<any | null>(null);

  if (!isOpen) return null;

  const providers = [
    { code: 'RAZORPAY', name: 'Razorpay PG', badge: 'Test API / CSV' },
    { code: 'PHONEPE', name: 'PhonePe Merchant', badge: 'CSV Import' },
    { code: 'GPAY', name: 'Google Pay', badge: 'CSV Import' },
    { code: 'PAYTM', name: 'Paytm Business', badge: 'CSV Import' },
    { code: 'BANK', name: 'HDFC Bank Statement', badge: 'CSV Import' },
    { code: 'POS', name: 'Pine Labs POS', badge: 'Batch Export CSV' },
  ];

  const sampleCSVs: Record<string, string> = {
    PHONEPE: `TransactionId,OrderRef,Amount,Fee,NetSettled,Status,TxnDate
T2609011045001,ORD-1002,8000.00,144.00,7856.00,SUCCESS,2026-09-01
T2609011045002,ORD-1145,7600.00,570.00,7030.00,SUCCESS,2026-09-01`,
    GPAY: `Google Transaction ID,Merchant Reference,Amount,Payout Date,Status
GP-1003,ORD-1003,12000.00,2026-09-01,SETTLED
GP-1004,ORD-1004,4500.00,2026-09-01,SETTLED`,
    RAZORPAY: `id,amount,currency,status,method,created_at,email
pay_RZP_9001,5000.00,INR,captured,upi,1756720000,aarav.patel@example.com
pay_RZP_9002,12500.00,INR,captured,card,1756725000,rohan.mehta@example.com`,
  };

  const handleSelectProvider = (code: string) => {
    setSelectedProvider(code);
    setCsvContent(sampleCSVs[code] || `TransactionId,OrderRef,Amount\nTXN-001,ORD-9901,5000.00`);
    setImportResult(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCsvContent(event.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  const handleSubmit = async () => {
    if (!csvContent.trim()) return;
    setUploading(true);
    setImportResult(null);

    try {
      const res = await onUploadCSV(selectedProvider, csvContent);
      setImportResult(res);
    } catch (err: any) {
      setImportResult({
        provider: selectedProvider,
        totalRecords: 0,
        imported: 0,
        duplicates: 0,
        invalid: 1,
        errors: [`Upload Error: ${err.message}`],
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#141414] border border-[#252525] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-5 border-b border-[#252525] bg-[#141414] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#00D09C]/10 border border-[#00D09C]/30 flex items-center justify-center text-[#00D09C]">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-['Outfit']">Connect Payment & Data Sources</h3>
              <p className="text-xs text-gray-400">Upload provider settlement reports or bank statements to normalize & reconcile</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg bg-[#1E1E1E] hover:bg-[#252525] text-gray-400 hover:text-white border border-[#252525] transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs">
          {/* Provider Grid */}
          <div className="space-y-2">
            <label className="text-gray-300 font-bold block uppercase text-[10px] tracking-wider">
              1. Select Payment Adapter
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {providers.map((p) => (
                <button
                  key={p.code}
                  onClick={() => handleSelectProvider(p.code)}
                  className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                    selectedProvider === p.code
                      ? 'bg-[#00D09C]/10 border-[#00D09C] text-white shadow-md'
                      : 'bg-[#0B0B0B] border-[#252525] text-gray-400 hover:border-gray-700 hover:text-gray-200'
                  }`}
                >
                  <span className="font-bold text-xs font-['Outfit']">{p.name}</span>
                  <span className="text-[10px] opacity-75 font-mono mt-1">{p.badge}</span>
                </button>
              ))}
            </div>
          </div>

          {/* CSV File Upload / Text Area */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-gray-300 font-bold uppercase text-[10px] tracking-wider">
                2. CSV Report Data ({selectedProvider})
              </label>
              <label className="text-[#00D09C] hover:underline cursor-pointer font-medium text-xs flex items-center space-x-1">
                <FileText className="w-3.5 h-3.5" />
                <span>Choose File</span>
                <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>

            <textarea
              rows={5}
              value={csvContent}
              onChange={(e) => setCsvContent(e.target.value)}
              placeholder="Paste raw CSV text here..."
              className="w-full bg-[#0B0B0B] border border-[#252525] rounded-xl p-3 font-mono text-xs text-gray-200 focus:outline-none focus:border-[#00D09C]"
            />
          </div>

          {/* Import Result Stats Box */}
          {importResult && (
            <div className="bg-[#0B0B0B] border border-[#00D09C]/30 rounded-xl p-4 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center space-x-2 text-[#00D09C] font-bold text-sm">
                <CheckCircle2 className="w-5 h-5" />
                <span>{selectedProvider} Report Processed & Normalized Successfully</span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center border-t border-[#252525] pt-3">
                <div className="bg-[#141414] p-2 rounded-lg border border-[#252525]">
                  <span className="text-gray-400 block text-[10px]">Total Rows</span>
                  <span className="font-mono font-bold text-gray-200">{importResult.totalRecords}</span>
                </div>
                <div className="bg-[#141414] p-2 rounded-lg border border-[#252525]">
                  <span className="text-gray-400 block text-[10px]">Imported</span>
                  <span className="font-mono font-bold text-[#00D09C]">{importResult.imported}</span>
                </div>
                <div className="bg-[#141414] p-2 rounded-lg border border-[#252525]">
                  <span className="text-gray-400 block text-[10px]">Duplicates</span>
                  <span className="font-mono font-bold text-amber-400">{importResult.duplicates || 0}</span>
                </div>
                <div className="bg-[#141414] p-2 rounded-lg border border-[#252525]">
                  <span className="text-gray-400 block text-[10px]">Invalid</span>
                  <span className="font-mono font-bold text-red-400">{importResult.invalid || 0}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#252525] bg-[#141414] flex items-center justify-between">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-[#1E1E1E] text-gray-300 border border-[#252525] text-xs">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={uploading || !csvContent.trim()}
            className="px-5 py-2 rounded-lg bg-[#00D09C] hover:bg-[#00B88A] disabled:opacity-50 text-black font-semibold text-xs shadow-md transition flex items-center space-x-1.5"
          >
            {uploading ? (
              <span>Normalizing & Ingesting...</span>
            ) : (
              <>
                <span>Parse, Normalize & Reconcile</span>
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

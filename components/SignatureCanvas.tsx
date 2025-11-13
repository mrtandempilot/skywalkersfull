'use client';

import { useRef, useEffect, useState } from 'react';
import SignaturePad from 'react-signature-canvas';

interface SignatureCanvasProps {
  onSave: (signature: string) => void;
  onClear?: () => void;
  label?: string;
}

export default function SignatureCanvas({ onSave, onClear, label = 'Customer Signature' }: SignatureCanvasProps) {
  const sigPadRef = useRef<SignaturePad>(null);
  const [isEmpty, setIsEmpty] = useState(true);

  const handleClear = () => {
    sigPadRef.current?.clear();
    setIsEmpty(true);
    if (onClear) onClear();
  };

  const handleSave = () => {
    if (sigPadRef.current && !sigPadRef.current.isEmpty()) {
      const signatureData = sigPadRef.current.toDataURL('image/png');
      onSave(signatureData);
      setIsEmpty(false);
    }
  };

  const handleEnd = () => {
    if (sigPadRef.current && !sigPadRef.current.isEmpty()) {
      setIsEmpty(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-300">
        {label}
      </label>
      <div className="border-2 border-dashed border-gray-600 rounded-lg p-2 bg-white">
        <SignaturePad
          ref={sigPadRef}
          canvasProps={{
            className: 'w-full h-32 bg-white rounded',
            style: { touchAction: 'none' }
          }}
          onEnd={handleEnd}
        />
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleClear}
          className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={isEmpty}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
          Save Signature
        </button>
      </div>
    </div>
  );
}

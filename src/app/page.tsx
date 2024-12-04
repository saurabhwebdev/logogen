'use client';

import { Palette, Download, ChevronDown, FileImage, Package } from 'lucide-react';
import LogoGenerator from '../components/LogoGenerator';
import AnimatedIconsShowcase from '../components/AnimatedIconsShowcase';
import UndoRedoButtons from '../components/UndoRedoButtons';
import { useRef, useState } from 'react';

export default function Home() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const logoGeneratorRef = useRef<{ 
    undo: () => void; 
    redo: () => void; 
    downloadLogo: (format: 'png' | 'jpeg' | 'package') => void; 
  } | null>(null);

  const handleUndo = () => {
    logoGeneratorRef.current?.undo();
  };

  const handleRedo = () => {
    logoGeneratorRef.current?.redo();
  };

  const handleDownload = (format: 'png' | 'jpeg' | 'package') => {
    if (logoGeneratorRef.current) {
      logoGeneratorRef.current.downloadLogo(format);
      setShowDropdown(false);
    }
  };

  const handleClickOutside = () => {
    setShowDropdown(false);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]" onClick={handleClickOutside}>
      <header className="bg-white border-b border-gray-200 relative">
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Palette className="w-6 h-6 text-indigo-600" />
              <h1 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">
                GenFast-IconMaker
              </h1>
            </div>

            <div className="flex-1 max-w-lg mx-4">
              <AnimatedIconsShowcase />
            </div>

            <div className="flex items-center gap-4">
              <UndoRedoButtons
                canUndo={canUndo}
                canRedo={canRedo}
                onUndo={handleUndo}
                onRedo={handleRedo}
              />
              
              <div className="relative">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDropdown(!showDropdown);
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                  <ChevronDown 
                    className={`w-4 h-4 transition-transform duration-200 ease-in-out ${
                      showDropdown ? 'rotate-180' : 'rotate-0'
                    }`}
                  />
                </button>

                <div 
                  className={`absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-100 transition-all duration-200 ease-in-out origin-top z-[9999] ${
                    showDropdown 
                      ? 'opacity-100 scale-100 translate-y-0' 
                      : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                  }`}
                >
                  <div className="py-1">
                    <button
                      onClick={() => handleDownload('png')}
                      className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors duration-150"
                    >
                      <FileImage className="w-4 h-4" />
                      <div className="text-left">
                        <div>Download PNG</div>
                        <div className="text-xs text-gray-500">High quality with transparency</div>
                      </div>
                    </button>
                    <button
                      onClick={() => handleDownload('jpeg')}
                      className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors duration-150"
                    >
                      <FileImage className="w-4 h-4" />
                      <div className="text-left">
                        <div>Download JPEG</div>
                        <div className="text-xs text-gray-500">Smaller file size, white background</div>
                      </div>
                    </button>
                    <div className="h-[1px] bg-gray-100 my-1"></div>
                    <div className="relative group">
                      <button
                        disabled
                        className="w-full px-4 py-2 text-sm text-gray-400 flex items-center gap-2 cursor-not-allowed"
                      >
                        <Package className="w-4 h-4" />
                        <div className="text-left">
                          <div>Download Icon Package</div>
                          <div className="text-xs text-gray-400">Complete set of web & app icons</div>
                        </div>
                      </button>
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        Coming Soon
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <LogoGenerator 
          ref={logoGeneratorRef} 
          onStateChange={(canUndo, canRedo) => {
            setCanUndo(canUndo);
            setCanRedo(canRedo);
          }}
        />
      </main>
    </div>
  );
}
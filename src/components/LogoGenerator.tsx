'use client';

import React, { useState, useRef, useCallback, forwardRef, useImperativeHandle, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';
import { 
  Apple,
  Leaf,
  Heart,
  Star,
  Sun,
  Moon,
  Cloud,
  Zap,
  Music,
  Camera,
  Coffee,
  Gift,
  Globe,
  Book,
  Palette,
  Feather,
  Diamond,
  Crown,
  Trophy,
  Rocket,
  Anchor,
  Compass,
  Mountain,
  Flag,
  Target,
  Shield,
  Award,
  Medal,
  Badge,
  Github,
  Twitter,
  Smile2 as Smile,
  Download,
  LucideIcon,
  ChevronDown,
  FileImage,
  Package,
  X,
  Search,
  Layout,
  Sparkles
} from 'lucide-react';
import ReactDOM from 'react-dom';
import ReactDOMServer from 'react-dom/server';
import html2canvas from 'html2canvas';
import JSZip from 'jszip';
import Confetti from './Confetti';

interface LogoState {
  iconColor: string;
  backgroundColor: string;
  rotation: number;
  scale: number;
  size: number;
  borderWidth: number;
  borderColor: string;
  borderRadius: number;
  padding: number;
  shadowIntensity: number;
  fillOpacity: number;
  fillColor: string;
  backgroundType: 'solid' | 'gradient';
  solidColor: string;
  gradientColors: {
    from: string;
    via: string;
    to: string;
  };
  gradientAngle: number;
  hasBackground: boolean;
  selectedIcon: LucideIcon;
}

interface LogoGeneratorProps {
  defaultSize?: number;
  onDownload?: (withBackground: boolean) => void;
  onStateChange?: (canUndo: boolean, canRedo: boolean) => void;
}

interface LogoGeneratorRef {
  undo: () => void;
  redo: () => void;
  downloadLogo: (format: 'png' | 'jpeg' | 'package') => void;
}

const LogoGenerator = forwardRef<LogoGeneratorRef, LogoGeneratorProps>(
  ({ defaultSize = 350, onStateChange }, ref) => {
    const allIcons: { icon: LucideIcon; name: string }[] = [
      { icon: Apple, name: 'Apple' },
      { icon: Leaf, name: 'Leaf' },
      { icon: Heart, name: 'Heart' },
      { icon: Star, name: 'Star' },
      { icon: Sun, name: 'Sun' },
      { icon: Moon, name: 'Moon' },
      { icon: Cloud, name: 'Cloud' },
      { icon: Zap, name: 'Zap' },
      { icon: Music, name: 'Music' },
      { icon: Camera, name: 'Camera' },
      { icon: Smile, name: 'Smile' },
      { icon: Coffee, name: 'Coffee' },
      { icon: Gift, name: 'Gift' },
      { icon: Globe, name: 'Globe' },
      { icon: Book, name: 'Book' },
      { icon: Palette, name: 'Palette' },
      { icon: Feather, name: 'Feather' },
      { icon: Diamond, name: 'Diamond' },
      { icon: Crown, name: 'Crown' },
      { icon: Trophy, name: 'Trophy' },
      { icon: Rocket, name: 'Rocket' },
      { icon: Anchor, name: 'Anchor' },
      { icon: Compass, name: 'Compass' },
      { icon: Mountain, name: 'Mountain' },
      { icon: Flag, name: 'Flag' },
      { icon: Target, name: 'Target' },
      { icon: Shield, name: 'Shield' },
      { icon: Award, name: 'Award' },
      { icon: Medal, name: 'Medal' },
      { icon: Badge, name: 'Badge' },
      { icon: Github, name: 'Github' },
      { icon: Twitter, name: 'Twitter' }
    ];
    
    const [history, setHistory] = useState<LogoState[]>([{
      iconColor: '#000000',
      backgroundColor: '#ffffff',
      rotation: 0,
      scale: 1,
      size: defaultSize,
      borderWidth: 0,
      borderColor: '#000000',
      borderRadius: 28,
      padding: 20,
      shadowIntensity: 0.1,
      fillOpacity: 0,
      fillColor: '#ffffff',
      backgroundType: 'gradient',
      solidColor: '#6366f1',
      gradientColors: {
        from: '#6366f1',
        via: '#a855f7',
        to: '#ec4899'
      },
      gradientAngle: 135,
      hasBackground: true,
      selectedIcon: Apple
    }]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showConfetti, setShowConfetti] = useState(false);
    const logoRef = useRef<HTMLDivElement>(null);

    const [selectedIcon, setSelectedIcon] = useState<LucideIcon>(Apple);
    const [size, setSize] = useState(defaultSize);
    const [rotate, setRotate] = useState(0);
    const [borderWidth, setBorderWidth] = useState(0);
    const [borderColor, setBorderColor] = useState('#000000');
    const [borderRadius, setBorderRadius] = useState(28);
    const [padding, setPadding] = useState(20);
    const [shadowIntensity, setShadowIntensity] = useState(0.1);
    const [fillOpacity, setFillOpacity] = useState(0);
    const [fillColor, setFillColor] = useState('#ffffff');
    const [backgroundType, setBackgroundType] = useState<'solid' | 'gradient'>('gradient');
    const [solidColor, setSolidColor] = useState('#6366f1');
    const [gradientColors, setGradientColors] = useState({
      from: '#6366f1',
      via: '#a855f7',
      to: '#ec4899'
    });
    const [gradientAngle, setGradientAngle] = useState(135);
    const [hasBackground, setHasBackground] = useState(true);
    const [iconColor, setIconColor] = useState('#000000');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'icon' | 'background'>('icon');
    const [showBorderPicker, setShowBorderPicker] = useState(false);
    const [showFillPicker, setShowFillPicker] = useState(false);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [showFromPicker, setShowFromPicker] = useState(false);
    const [showViaPicker, setShowViaPicker] = useState(false);
    const [showToPicker, setShowToPicker] = useState(false);

    useImperativeHandle(ref, () => ({
      undo: handleUndo,
      redo: handleRedo,
      downloadLogo: handleDownload
    }));

    useEffect(() => {
      if (onStateChange) {
        onStateChange(currentIndex > 0, currentIndex < history.length - 1);
      }
    }, [currentIndex, history.length, onStateChange]);

    useEffect(() => {
      setIconColor(hasBackground ? '#ffffff' : '#000000');
    }, [hasBackground]);

    const handleUndo = useCallback(() => {
      if (currentIndex > 0) {
        setCurrentIndex(prev => prev - 1);
        const currentState = history[currentIndex - 1];
        setSelectedIcon(currentState.selectedIcon);
        setSize(currentState.size);
        setRotate(currentState.rotation);
        setBorderWidth(currentState.borderWidth);
        setBorderColor(currentState.borderColor);
        setBorderRadius(currentState.borderRadius);
        setPadding(currentState.padding);
        setShadowIntensity(currentState.shadowIntensity);
        setFillOpacity(currentState.fillOpacity);
        setFillColor(currentState.fillColor);
        setBackgroundType(currentState.backgroundType);
        setSolidColor(currentState.solidColor);
        setGradientColors(currentState.gradientColors);
        setGradientAngle(currentState.gradientAngle);
        setHasBackground(currentState.hasBackground);
        setIconColor(currentState.iconColor);
      }
    }, [currentIndex, history]);

    const handleRedo = useCallback(() => {
      if (currentIndex < history.length - 1) {
        setCurrentIndex(prev => prev + 1);
        const currentState = history[currentIndex + 1];
        setSelectedIcon(currentState.selectedIcon);
        setSize(currentState.size);
        setRotate(currentState.rotation);
        setBorderWidth(currentState.borderWidth);
        setBorderColor(currentState.borderColor);
        setBorderRadius(currentState.borderRadius);
        setPadding(currentState.padding);
        setShadowIntensity(currentState.shadowIntensity);
        setFillOpacity(currentState.fillOpacity);
        setFillColor(currentState.fillColor);
        setBackgroundType(currentState.backgroundType);
        setSolidColor(currentState.solidColor);
        setGradientColors(currentState.gradientColors);
        setGradientAngle(currentState.gradientAngle);
        setHasBackground(currentState.hasBackground);
        setIconColor(currentState.iconColor);
      }
    }, [currentIndex, history]);

    const updateHistory = useCallback((newState: Partial<LogoState>) => {
      const currentState = history[currentIndex];
      const newFullState = { ...currentState, ...newState };
      const newHistory = history.slice(0, currentIndex + 1);
      setHistory([...newHistory, newFullState]);
      setCurrentIndex(prev => prev + 1);
    }, [history, currentIndex]);

    const filteredIcons = searchQuery
      ? allIcons.filter(icon => 
          icon && icon.name && icon.name.toLowerCase().includes(searchQuery.toLowerCase()) && icon.icon
        )
      : allIcons;

    const visibleFilteredIcons = searchQuery
      ? filteredIcons.slice(0, 5)
      : allIcons.slice(0, 12);

    const visibleIcons = visibleFilteredIcons.filter(icon => icon && icon.icon);

    const handleRandomIcon = () => {
      const filteredIconsList = searchQuery 
        ? filteredIcons 
        : allIcons;
      
      const randomIndex = Math.floor(Math.random() * filteredIconsList.length);
      const randomIconData = filteredIconsList[randomIndex];
      
      setSelectedIcon(randomIconData.icon);
      updateHistory({ selectedIcon: randomIconData.icon });
      setSearchQuery('');
      
      const startIndex = Math.max(0, randomIndex - 2);
      const newVisibleIcons = filteredIconsList.slice(startIndex, startIndex + 5);
      // setVisibleIconsList(newVisibleIcons);
    };

    const handleIconSelect = (iconData: { icon: LucideIcon; name: string }) => {
      setSelectedIcon(iconData.icon);
      updateHistory({ selectedIcon: iconData.icon });
    };

    const containerStyle = {
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: `${borderRadius}%`,
      padding: `${padding}px`,
      position: 'relative' as const,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      ...(hasBackground && {
        background: backgroundType === 'solid'
          ? solidColor
          : `linear-gradient(${gradientAngle}deg, ${gradientColors.from}, ${gradientColors.via}, ${gradientColors.to})`,
        border: `${borderWidth}px solid ${borderColor}`,
        boxShadow: `0 8px ${32 * shadowIntensity}px rgba(0, 0, 0, ${shadowIntensity})`
      })
    };

    const iconStyle = {
      transform: `rotate(${rotate}deg)`,
      transition: 'all 0.3s ease',
      position: 'relative' as const,
      zIndex: 2,
      opacity: 1 - fillOpacity,
      display: 'inline-block'
    };

    const fillStyle = {
      position: 'absolute' as const,
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      backgroundColor: fillColor,
      opacity: fillOpacity,
      borderRadius: '25%',
      zIndex: 1
    };

    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    const generateIconForSize = async (width: number, height: number) => {
      try {
        if (!selectedIcon) return null;

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        // Clear background
        ctx.clearRect(0, 0, width, height);

        // Save the current context state
        ctx.save();

        // Set up the context for drawing
        ctx.translate(width / 2, height / 2);
        ctx.rotate((rotate * Math.PI) / 180);
        ctx.scale(width / 350, width / 350);

        // Set up stroke style
        ctx.strokeStyle = iconColor;
        ctx.lineWidth = 2 * (width / 350); // Scale line width based on icon size
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Create a temporary div to render the icon
        const tempDiv = document.createElement('div');
        const IconComponent = selectedIcon;
        
        // Render the icon to get its SVG content
        const iconElement = React.createElement(IconComponent, {
          color: iconColor,
          size: 24,
          strokeWidth: 2
        });
        
        // Use ReactDOM to render and get SVG content
        const root = ReactDOM.createRoot(tempDiv);
        root.render(iconElement);
        
        // Wait for the render to complete
        await new Promise(resolve => setTimeout(resolve, 0));
        
        const svgElement = tempDiv.querySelector('svg');
        if (!svgElement) throw new Error('SVG element not found');

        const paths = svgElement.querySelector('path');
        if (!paths) throw new Error('No paths found in SVG');

        // Draw the path
        const pathData = paths.getAttribute('d');
        if (pathData) {
          const path = new Path2D(pathData);
          ctx.translate(-width / 4, -height / 4); // Center the path
          ctx.stroke(path);
        }

        // Restore the context state
        ctx.restore();

        return canvas.toDataURL('image/png');
      } catch (error) {
        console.error('Error generating icon:', error);
        return null;
      }
    };

    const generateIconBatch = async (iconSizes: { size: number, name: string }[], manifest: any, zip: JSZip) => {
      for (const { size, name } of iconSizes) {
        try {
          const dataUrl = await generateIconForSize(size, size);
          if (dataUrl) {
            const data = dataUrl.split(',')[1];
            zip.file(`icons/${name}.png`, data, { base64: true });
            manifest.icons.push({
              src: `icons/${name}.png`,
              sizes: `${size}x${size}`,
              type: "image/png"
            });
          }
          // Add a small delay between generations
          await delay(100);
        } catch (error) {
          console.error(`Error generating icon ${name}:`, error);
        }
      }
    };

    const downloadIconPackage = async () => {
      try {
        const zip = new JSZip();
        const manifest = {
          name: "GenFast-IconMaker",
          short_name: "GenFast-IconMaker",
          description: "Generated with GenFast-IconMaker",
          icons: [] as Array<{ src: string; sizes: string; type: string; purpose?: string }>
        };

        // Split icon sizes into smaller batches
        const iconSizes = [
          { size: 16, name: 'favicon-16x16' },
          { size: 32, name: 'favicon-32x32' },
          { size: 48, name: 'favicon-48x48' },
          { size: 64, name: 'favicon-64x64' },
          { size: 72, name: 'icon-72x72' },
          { size: 96, name: 'icon-96x96' },
          { size: 128, name: 'icon-128x128' },
          { size: 144, name: 'icon-144x144' },
          { size: 152, name: 'icon-152x152' },
          { size: 192, name: 'icon-192x192' },
          { size: 384, name: 'icon-384x384' },
          { size: 512, name: 'icon-512x512' },
        ];

        // Process icons in smaller batches
        const batchSize = 3;
        for (let i = 0; i < iconSizes.length; i += batchSize) {
          const batch = iconSizes.slice(i, i + batchSize);
          await generateIconBatch(batch, manifest, zip);
          // Add a delay between batches
          await delay(500);
        }

        // Add maskable icon
        const maskableIcon = await generateIconForSize(512, 512);
        if (maskableIcon) {
          const data = maskableIcon.split(',')[1];
          zip.file('icons/maskable-512x512.png', data, { base64: true });
          manifest.icons.push({
            src: "icons/maskable-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
          });
        }

        // Add manifest file
        zip.file('site.webmanifest', JSON.stringify(manifest, null, 2));

        // Add HTML meta tags file
        const metaTags = `<!-- Favicon -->
<link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png">
<link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="48x48" href="/icons/favicon-48x48.png">

<!-- Apple Touch Icons -->
<link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png">
<link rel="apple-touch-icon" sizes="144x144" href="/icons/icon-144x144.png">

<!-- PWA -->
<link rel="manifest" href="/site.webmanifest">
<meta name="theme-color" content="${backgroundType === 'solid' ? solidColor : gradientColors.from}">

<!-- Microsoft -->
<meta name="msapplication-TileColor" content="${backgroundType === 'solid' ? solidColor : gradientColors.from}">
<meta name="msapplication-TileImage" content="/icons/icon-144x144.png">`;

        zip.file('meta-tags.html', metaTags);

        // Add README
        const readme = `# Icon Package

This package contains all the necessary icons for your web application.

## Contents
- Various sizes of favicon and app icons
- Maskable icon for PWA
- Web manifest file
- Meta tags for HTML

## Installation
1. Copy the 'icons' folder to your public directory
2. Copy 'site.webmanifest' to your public directory
3. Add the meta tags from 'meta-tags.html' to your HTML head section

## Icon Sizes
${iconSizes.map(({ size, name }) => `- ${name}.png (${size}x${size})`).join('\n')}
- maskable-512x512.png (512x512) - For PWA maskable icon

## Generated with GenFast-IconMaker`;

        zip.file('README.md', readme);

        // Generate zip file
        const content = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(content);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'icon-package.zip';
        link.click();
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Error generating icon package:', error);
      }
    };

    const downloadLogo = async (format: 'png' | 'jpeg' | 'package' = 'png') => {
      try {
        if (format === 'package') {
          await downloadIconPackage();
        } else {
          const previewDiv = document.querySelector('.logo-preview') as HTMLDivElement;
          if (!previewDiv) {
            throw new Error('Preview div not found');
          }

          // Calculate a size that ensures high quality for modern displays
          const scaleFactor = 8; // Increased for higher resolution
          const targetSize = Math.max(previewDiv.offsetWidth, previewDiv.offsetHeight) * scaleFactor;

          const result = await html2canvas(previewDiv, {
            backgroundColor: null,
            scale: scaleFactor, // Increased scale factor for higher resolution
            logging: false,
            useCORS: true,
            allowTaint: true,
            width: previewDiv.offsetWidth,
            height: previewDiv.offsetHeight,
            imageTimeout: 0, // No timeout for better quality
            onclone: (clonedDoc) => {
              const clonedPreview = clonedDoc.querySelector('.logo-preview') as HTMLDivElement;
              if (clonedPreview) {
                // Copy all styles from the original preview
                const computedStyle = window.getComputedStyle(previewDiv);
                Array.from(computedStyle).forEach(key => {
                  clonedPreview.style[key as any] = computedStyle.getPropertyValue(key);
                });

                // Ensure background is properly set with high-quality gradient
                clonedPreview.style.background = backgroundType === 'solid'
                  ? solidColor
                  : `linear-gradient(${gradientAngle}deg, ${gradientColors.from}, ${gradientColors.via}, ${gradientColors.to})`;
                
                // Ensure crisp edges
                clonedPreview.style.imageRendering = 'crisp-edges';
                clonedPreview.style.webkitFontSmoothing = 'antialiased';
                clonedPreview.style.mozOsxFontSmoothing = 'grayscale';
                
                // Copy fill layer styles
                const originalFill = previewDiv.querySelector('.fill-layer') as HTMLDivElement;
                const clonedFill = clonedPreview.querySelector('.fill-layer') as HTMLDivElement;
                if (originalFill && clonedFill) {
                  const fillComputedStyle = window.getComputedStyle(originalFill);
                  Array.from(fillComputedStyle).forEach(key => {
                    clonedFill.style[key as any] = fillComputedStyle.getPropertyValue(key);
                  });
                }

                // Copy and enhance icon styles
                const originalIcon = previewDiv.querySelector('svg');
                const clonedIcon = clonedPreview.querySelector('svg');
                if (originalIcon && clonedIcon) {
                  const iconComputedStyle = window.getComputedStyle(originalIcon);
                  Array.from(iconComputedStyle).forEach(key => {
                    clonedIcon.style[key as any] = iconComputedStyle.getPropertyValue(key);
                  });
                  
                  // Ensure specific properties are set for high quality
                  clonedIcon.style.transform = `rotate(${rotate}deg)`;
                  clonedIcon.style.opacity = String(1 - fillOpacity);
                  clonedIcon.style.color = '#ffffff';
                  clonedIcon.setAttribute('shape-rendering', 'geometricPrecision');
                  clonedIcon.style.imageRendering = 'crisp-edges';
                }
              }
            }
          });

          const link = document.createElement('a');
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          link.download = `icon-${timestamp}.${format}`;
          
          if (format === 'jpeg') {
            const canvas = document.createElement('canvas');
            // Set canvas size to maintain high resolution
            canvas.width = result.width;
            canvas.height = result.height;
            const ctx = canvas.getContext('2d', { alpha: false });
            if (ctx) {
              // Enable high-quality image settings
              ctx.imageSmoothingEnabled = true;
              ctx.imageSmoothingQuality = 'high';
              
              // Draw white background
              ctx.fillStyle = '#FFFFFF';
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              
              // Draw the image
              ctx.drawImage(result, 0, 0);
              
              // Convert to high-quality JPEG
              link.href = canvas.toDataURL('image/jpeg', 1.0); // Maximum quality
            }
          } else {
            // For PNG, use maximum quality settings
            link.href = result.toDataURL('image/png');
          }
          
          link.click();
        }
        // Show confetti on successful download
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2000);
      } catch (error) {
        console.error('Error downloading logo:', error);
      }
    };

    const handleDownload = (format: 'png' | 'jpeg' | 'package') => {
      downloadLogo(format);
    };

    return (
      <div className="flex flex-col min-h-screen">
        {showConfetti && <Confetti />}
        <div className="flex flex-1">
          <div className="w-[300px] bg-white border-r border-gray-200">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('icon')}
                className={`flex items-center gap-2 flex-1 justify-center py-4 px-4 text-sm font-medium transition-colors
                  ${activeTab === 'icon' 
                    ? 'text-indigo-600 border-b-2 border-indigo-600' 
                    : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                <Layout className="w-4 h-4" />
                Icon
              </button>
              <button
                onClick={() => setActiveTab('background')}
                className={`flex items-center gap-2 flex-1 justify-center py-4 px-4 text-sm font-medium transition-colors
                  ${activeTab === 'background' 
                    ? 'text-indigo-600 border-b-2 border-indigo-600' 
                    : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                <Palette className="w-4 h-4" />
                Background
              </button>
            </div>

            <div className="p-6">
              {activeTab === 'icon' ? (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Icon</h2>
                    <div className="relative mb-4">
                      <input
                        type="text"
                        placeholder="Search icons..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm 
                          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                          placeholder-gray-400 text-gray-900"
                      />
                      <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-6">
                      {visibleIcons.map((icon, index) => (
                        icon && icon.icon ? (
                          <button
                            key={index}
                            onClick={() => handleIconSelect(icon)}
                            className={`w-12 h-12 flex items-center justify-center rounded-xl ${
                              icon.icon === selectedIcon 
                                ? 'bg-white shadow-md border border-gray-200' 
                                : 'bg-gray-50 hover:bg-white hover:shadow-sm'
                            } transition-all duration-300`}
                          >
                            {React.createElement(icon.icon, { 
                              size: 24,
                              className: icon.icon === selectedIcon ? 'text-gray-900' : 'text-gray-600'
                            })}
                          </button>
                        ) : null
                      ))}
                      
                      <button
                        onClick={handleRandomIcon}
                        className="w-12 h-12 flex items-center justify-center rounded-xl 
                          bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 
                          hover:shadow-lg hover:scale-105 
                          transition-all duration-300 relative group"
                      >
                        <Sparkles size={24} className="text-white animate-pulse" />
                        <div className="absolute -top-8 scale-0 group-hover:scale-100 transition-transform duration-200 bg-gray-800 text-white text-xs py-1 px-2 rounded">
                          Random Icon
                        </div>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <h2 className="text-lg font-semibold text-gray-900">Icon Settings</h2>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-sm font-medium text-gray-700">Size</label>
                        <span className="text-sm text-gray-500 tabular-nums">{size}px</span>
                      </div>
                      <input
                        type="range"
                        min="100"
                        max="500"
                        value={size}
                        onChange={(e) => {
                          setSize(Number(e.target.value));
                          updateHistory({ size: Number(e.target.value) });
                        }}
                        className="w-full accent-indigo-600"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-sm font-medium text-gray-700">Rotate</label>
                        <span className="text-sm text-gray-500">{rotate}°</span>
                      </div>
                      <input
                        type="range"
                        min="-180"
                        max="180"
                        value={rotate}
                        onChange={(e) => {
                          setRotate(Number(e.target.value));
                          updateHistory({ rotation: Number(e.target.value) });
                        }}
                        className="w-full accent-indigo-600"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-gray-900">Background Settings</h2>
                  
                  <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
                    <button
                      onClick={() => {
                        setBackgroundType('solid');
                        updateHistory({ backgroundType: 'solid' });
                      }}
                      className={`flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition-colors
                        ${backgroundType === 'solid' 
                          ? 'bg-white shadow-sm text-gray-900' 
                          : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                      Solid
                    </button>
                    <button
                      onClick={() => {
                        setBackgroundType('gradient');
                        updateHistory({ backgroundType: 'gradient' });
                      }}
                      className={`flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition-colors
                        ${backgroundType === 'gradient' 
                          ? 'bg-white shadow-sm text-gray-900' 
                          : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                      Gradient
                    </button>
                  </div>

                  {backgroundType === 'solid' ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
                      <button
                        onClick={() => setShowColorPicker(!showColorPicker)}
                        className="w-full h-10 rounded-lg shadow-sm transition-all duration-300 hover:shadow-md"
                        style={{ backgroundColor: solidColor }}
                      />
                      {showColorPicker && (
                        <div className="absolute z-10 mt-2">
                          <HexColorPicker 
                            color={solidColor} 
                            onChange={(color) => {
                              setSolidColor(color);
                              updateHistory({ solidColor: color });
                            }} 
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <label className="text-sm font-medium text-gray-700">Angle</label>
                          <span className="text-sm text-gray-500">{gradientAngle}°</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="360"
                          value={gradientAngle}
                          onChange={(e) => {
                            setGradientAngle(Number(e.target.value));
                            updateHistory({ gradientAngle: Number(e.target.value) });
                          }}
                          className="w-full accent-indigo-600"
                        />
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
                          <button
                            onClick={() => setShowFromPicker(!showFromPicker)}
                            className="w-full h-10 rounded-lg shadow-sm transition-all duration-300 hover:shadow-md"
                            style={{ backgroundColor: gradientColors.from }}
                          />
                          {showFromPicker && (
                            <div className="absolute z-10 mt-2">
                              <HexColorPicker 
                                color={gradientColors.from} 
                                onChange={(color) => {
                                  setGradientColors(prev => ({ ...prev, from: color }));
                                  updateHistory({ gradientColors: { ...gradientColors, from: color } });
                                }} 
                              />
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Via</label>
                          <button
                            onClick={() => setShowViaPicker(!showViaPicker)}
                            className="w-full h-10 rounded-lg shadow-sm transition-all duration-300 hover:shadow-md"
                            style={{ backgroundColor: gradientColors.via }}
                          />
                          {showViaPicker && (
                            <div className="absolute z-10 mt-2">
                              <HexColorPicker 
                                color={gradientColors.via} 
                                onChange={(color) => {
                                  setGradientColors(prev => ({ ...prev, via: color }));
                                  updateHistory({ gradientColors: { ...gradientColors, via: color } });
                                }} 
                              />
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
                          <button
                            onClick={() => setShowToPicker(!showToPicker)}
                            className="w-full h-10 rounded-lg shadow-sm transition-all duration-300 hover:shadow-md"
                            style={{ backgroundColor: gradientColors.to }}
                          />
                          {showToPicker && (
                            <div className="absolute z-10 mt-2">
                              <HexColorPicker 
                                color={gradientColors.to} 
                                onChange={(color) => {
                                  setGradientColors(prev => ({ ...prev, to: color }));
                                  updateHistory({ gradientColors: { ...gradientColors, to: color } });
                                }} 
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700">Border Width</label>
                      <span className="text-sm text-gray-500">{borderWidth}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      step="0.1"
                      value={borderWidth}
                      onChange={(e) => {
                        setBorderWidth(Number(e.target.value));
                        updateHistory({ borderWidth: Number(e.target.value) });
                      }}
                      className="w-full accent-indigo-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Border Color</label>
                    <button
                      onClick={() => setShowBorderPicker(!showBorderPicker)}
                      className="w-full h-10 rounded-lg border transition-all duration-300 hover:shadow-lg"
                      style={{ backgroundColor: borderColor }}
                    />
                    {showBorderPicker && (
                      <div className="absolute z-10 mt-2">
                        <HexColorPicker 
                          color={borderColor} 
                          onChange={(color) => {
                            setBorderColor(color);
                            updateHistory({ borderColor: color });
                          }} 
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700">Rounded</label>
                      <span className="text-sm text-gray-500">{borderRadius}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={borderRadius}
                      onChange={(e) => {
                        setBorderRadius(Number(e.target.value));
                        updateHistory({ borderRadius: Number(e.target.value) });
                      }}
                      className="w-full accent-indigo-600"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700">Padding</label>
                      <span className="text-sm text-gray-500">{padding}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={padding}
                      onChange={(e) => {
                        setPadding(Number(e.target.value));
                        updateHistory({ padding: Number(e.target.value) });
                      }}
                      className="w-full accent-indigo-600"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700">Shadow</label>
                      <span className="text-sm text-gray-500">{Math.round(shadowIntensity * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={shadowIntensity}
                      onChange={(e) => {
                        setShadowIntensity(Number(e.target.value));
                        updateHistory({ shadowIntensity: Number(e.target.value) });
                      }}
                      className="w-full accent-indigo-600"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700">Fill Opacity</label>
                      <span className="text-sm text-gray-500">{Math.round(fillOpacity * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={fillOpacity}
                      onChange={(e) => {
                        setFillOpacity(Number(e.target.value));
                        updateHistory({ fillOpacity: Number(e.target.value) });
                      }}
                      className="w-full accent-indigo-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fill Color</label>
                    <button
                      onClick={() => setShowFillPicker(!showFillPicker)}
                      className="w-full h-10 rounded-lg border transition-all duration-300 hover:shadow-lg"
                      style={{ backgroundColor: fillColor }}
                    />
                    {showFillPicker && (
                      <div className="absolute z-10 mt-2">
                        <HexColorPicker 
                          color={fillColor} 
                          onChange={(color) => {
                            setFillColor(color);
                            updateHistory({ fillColor: color });
                          }} 
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 bg-[#FAFAFA]">
            <div className="h-full flex items-center justify-center p-8">
              <div className="relative bg-white rounded-2xl shadow-lg p-20">
                <div 
                  className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"
                  style={{
                    backgroundSize: '40px 40px',
                    opacity: 0.5
                  }}
                />
                <div 
                  className="logo-preview" 
                  style={{
                    ...containerStyle,
                    background: backgroundType === 'solid'
                      ? solidColor
                      : `linear-gradient(${gradientAngle}deg, ${gradientColors.from}, ${gradientColors.via}, ${gradientColors.to})`
                  }}
                >
                  <div className="fill-layer" style={fillStyle} />
                  {React.createElement(selectedIcon, { 
                    style: iconStyle,
                    size: size * 0.6,
                    color: '#ffffff',
                    strokeWidth: 2
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        <footer className="border-t border-gray-200 bg-white">
          <div className="max-w-7xl mx-auto pt-3 pb-0 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-gray-500">
                <span>Made with</span>
                <svg 
                  className="w-3.5 h-3.5 text-red-500 fill-current" 
                  viewBox="0 0 24 24"
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
                <span>by</span>
                <a 
                  href="https://x.com/FlowStitch" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-700"
                >
                  Saurabh Thakur
                </a>
              </div>

              <div className="flex items-center gap-3">
                <a 
                  href="https://github.com/saurabhwebdev" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <Github className="w-4 h-4" />
                </a>
                <a 
                  href="https://x.com/FlowStitch" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <Twitter className="w-4 h-4" />
                </a>
                <span className="text-gray-400">•</span>
                <span className="text-gray-500">&copy; {new Date().getFullYear()} GenFast-IconMaker</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    );
  }
);

LogoGenerator.displayName = 'LogoGenerator';

export default LogoGenerator;

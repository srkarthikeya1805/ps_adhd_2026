import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Maximize2, Minimize2, RotateCcw, Info, Sparkles, Layers, Zap } from 'lucide-react';
import { ELECTRODE_10_20_COORDS } from '../brain/BrainCanvas';
import { BrainRegionKey } from '../../types';
import { BRAIN_REGIONS } from '../../utils/sampleData';

export interface Interactive3DBrainViewerProps {
  className?: string;
  isADHD?: boolean;
}

export const Interactive3DBrainViewer: React.FC<Interactive3DBrainViewerProps> = ({
  className = '',
  isADHD = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedElectrode, setSelectedElectrode] = useState<string | null>('Fz');
  const [hoveredElectrode, setHoveredElectrode] = useState<string | null>(null);

  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const rotationRef = useRef({ x: 0.15, y: 0.4 });
  const targetRotationRef = useRef({ x: 0.15, y: 0.4 });
  const zoomRef = useRef(4.2);
  const targetZoomRef = useRef(4.2);

  // Mapping electrode to region
  const getElectrodeRegion = (channel: string): BrainRegionKey => {
    if (['Fp1', 'Fp2', 'F7', 'F3', 'Fz', 'F4', 'F8'].includes(channel)) return 'frontal';
    if (['P3', 'Pz', 'P4'].includes(channel)) return 'parietal';
    if (['T3', 'T4', 'T5', 'T6'].includes(channel)) return 'temporal';
    if (['O1', 'O2'].includes(channel)) return 'occipital';
    return 'frontal'; // default for C3, Cz, C4
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = container.clientWidth || 600;
    let height = container.clientHeight || 450;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x030712, 0.04);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0.2, zoomRef.current);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      return;
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    container.appendChild(renderer.domElement);

    // 2. Lighting
    const ambientLight = new THREE.AmbientLight(0x07152b, 2.5);
    scene.add(ambientLight);

    const keyCyan = new THREE.PointLight(0x00f0ff, 4.0, 14);
    keyCyan.position.set(-3.5, 2.5, 4.0);
    scene.add(keyCyan);

    const rimPink = new THREE.PointLight(0xf02bd5, 3.8, 14);
    rimPink.position.set(3.5, -2.0, 3.5);
    scene.add(rimPink);

    const topViolet = new THREE.DirectionalLight(0x8b5cf6, 3.2);
    topViolet.position.set(0, 4.5, -2.5);
    scene.add(topViolet);

    // 3. Brain Master Model
    const brainMaster = new THREE.Group();
    scene.add(brainMaster);

    // Dual stylized hemisphere cortical meshes
    const hemiGeoL = new THREE.SphereGeometry(1.3, 36, 28);
    hemiGeoL.scale(0.85, 1.05, 1.25);
    hemiGeoL.translate(-0.46, 0.08, 0);

    const hemiGeoR = new THREE.SphereGeometry(1.3, 36, 28);
    hemiGeoR.scale(0.85, 1.05, 1.25);
    hemiGeoR.translate(0.46, 0.08, 0);

    const brainMat = new THREE.MeshPhysicalMaterial({
      color: 0x00d4ff,
      emissive: 0x032a4a,
      emissiveIntensity: 0.5,
      metalness: 0.15,
      roughness: 0.22,
      transmission: 0.45,
      thickness: 1.4,
      transparent: true,
      opacity: 0.88,
    });

    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      wireframe: true,
      transparent: true,
      opacity: 0.2,
    });

    brainMaster.add(new THREE.Mesh(hemiGeoL, brainMat));
    brainMaster.add(new THREE.Mesh(hemiGeoR, brainMat));
    brainMaster.add(new THREE.Mesh(hemiGeoL, wireMat));
    brainMaster.add(new THREE.Mesh(hemiGeoR, wireMat));

    // Transparent cranial shell contour
    const cranialGeo = new THREE.SphereGeometry(1.65, 36, 28);
    cranialGeo.scale(0.92, 1.18, 1.25);
    const cranialMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.15,
      roughness: 0.1,
      transmission: 0.85,
    });
    brainMaster.add(new THREE.Mesh(cranialGeo, cranialMat));

    // 4. Clickable 10-20 Electrodes
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const electrodeMeshes: Map<THREE.Mesh, string> = new Map();
    const electrodeNodes: Array<{ name: string; mesh: THREE.Mesh; ring: THREE.Mesh; pos: THREE.Vector3 }> = [];

    const sphereGeo = new THREE.SphereGeometry(0.08, 16, 16);
    const ringGeo = new THREE.RingGeometry(0.11, 0.15, 24);

    Object.entries(ELECTRODE_10_20_COORDS).forEach(([chName, coords]) => {
      const pos = new THREE.Vector3(...coords);
      const isSelected = chName === selectedElectrode;

      const elMat = new THREE.MeshBasicMaterial({
        color: isSelected ? 0xffffff : 0x00f0ff,
      });

      const elRingMat = new THREE.MeshBasicMaterial({
        color: isSelected ? 0xf02bd5 : 0x00f0ff,
        transparent: true,
        opacity: 0.7,
        side: THREE.DoubleSide,
      });

      const elMesh = new THREE.Mesh(sphereGeo, elMat);
      elMesh.position.copy(pos);

      const elRing = new THREE.Mesh(ringGeo, elRingMat);
      elRing.position.copy(pos);
      elRing.lookAt(new THREE.Vector3(0, 0, 0));

      brainMaster.add(elMesh);
      brainMaster.add(elRing);

      electrodeMeshes.set(elMesh, chName);
      electrodeNodes.push({ name: chName, mesh: elMesh, ring: elRing, pos });
    });

    // Neural Connection Lines
    const connectionPairs = [
      ['Fp1', 'Fp2'], ['Fp1', 'F3'], ['Fp2', 'F4'], ['F3', 'Fz'], ['Fz', 'F4'],
      ['F3', 'C3'], ['Fz', 'Cz'], ['F4', 'C4'], ['C3', 'Cz'], ['Cz', 'C4'],
      ['C3', 'P3'], ['Cz', 'Pz'], ['C4', 'P4'], ['P3', 'Pz'], ['Pz', 'P4'],
      ['P3', 'O1'], ['P4', 'O2'], ['O1', 'O2']
    ];

    connectionPairs.forEach(([a, b], idx) => {
      const pA = ELECTRODE_10_20_COORDS[a];
      const pB = ELECTRODE_10_20_COORDS[b];
      if (pA && pB) {
        const lineGeo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(...pA),
          new THREE.Vector3(...pB),
        ]);
        const lineMat = new THREE.LineBasicMaterial({
          color: idx % 2 === 0 ? 0x00f0ff : 0x8b5cf6,
          transparent: true,
          opacity: 0.45,
        });
        brainMaster.add(new THREE.Line(lineGeo, lineMat));
      }
    });

    // 5. Interactive Mouse & Orbit Controls
    const onMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      // Raycast hover detection
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(Array.from(electrodeMeshes.keys()));
      if (intersects.length > 0) {
        const ch = electrodeMeshes.get(intersects[0].object as THREE.Mesh);
        setHoveredElectrode(ch || null);
        container.style.cursor = 'pointer';
      } else {
        setHoveredElectrode(null);
        container.style.cursor = isDraggingRef.current ? 'grabbing' : 'grab';
      }

      if (!isDraggingRef.current) return;
      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;

      targetRotationRef.current.y += deltaX * 0.008;
      targetRotationRef.current.x += deltaY * 0.008;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = (e: MouseEvent) => {
      isDraggingRef.current = false;
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(Array.from(electrodeMeshes.keys()));
      if (intersects.length > 0) {
        const ch = electrodeMeshes.get(intersects[0].object as THREE.Mesh);
        if (ch) setSelectedElectrode(ch);
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      targetZoomRef.current = Math.min(Math.max(targetZoomRef.current + e.deltaY * 0.003, 2.5), 7.0);
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('wheel', onWheel, { passive: false });

    // 6. Animation Tick
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Smooth rotation interpolation
      rotationRef.current.x += (targetRotationRef.current.x - rotationRef.current.x) * 0.1;
      rotationRef.current.y += (targetRotationRef.current.y - rotationRef.current.y) * 0.1;
      zoomRef.current += (targetZoomRef.current - zoomRef.current) * 0.1;

      // Auto subtle drift when idle
      if (!isDraggingRef.current) {
        targetRotationRef.current.y += 0.002;
      }

      brainMaster.rotation.x = rotationRef.current.x;
      brainMaster.rotation.y = rotationRef.current.y;
      camera.position.z = zoomRef.current;

      // Pulse electrode rings
      electrodeNodes.forEach((node) => {
        const isSel = node.name === selectedElectrode;
        const isHov = node.name === hoveredElectrode;
        const pulse = 1.0 + Math.sin(elapsed * 3.5) * 0.2;

        if (isSel) {
          (node.mesh.material as THREE.MeshBasicMaterial).color.setHex(0xffffff);
          (node.ring.material as THREE.MeshBasicMaterial).color.setHex(0xf02bd5);
          node.ring.scale.set(1.6 * pulse, 1.6 * pulse, 1.6 * pulse);
        } else if (isHov) {
          (node.mesh.material as THREE.MeshBasicMaterial).color.setHex(0x38bdf8);
          (node.ring.material as THREE.MeshBasicMaterial).color.setHex(0x00f0ff);
          node.ring.scale.set(1.3 * pulse, 1.3 * pulse, 1.3 * pulse);
        } else {
          (node.mesh.material as THREE.MeshBasicMaterial).color.setHex(0x00f0ff);
          (node.ring.material as THREE.MeshBasicMaterial).color.setHex(0x00f0ff);
          node.ring.scale.set(pulse, pulse, pulse);
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || 600;
      height = container.clientHeight || 450;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', handleResize);

      try {
        renderer.dispose();
        if (renderer.domElement && renderer.domElement.parentElement) {
          renderer.domElement.parentElement.removeChild(renderer.domElement);
        }
      } catch (e) {
        console.warn('Three.js dispose note:', e);
      }
    };
  }, [selectedElectrode, isFullscreen]);

  // Reset Camera View
  const handleResetCamera = () => {
    targetRotationRef.current = { x: 0.15, y: 0.4 };
    targetZoomRef.current = 4.2;
  };

  const activeRegionKey = selectedElectrode ? getElectrodeRegion(selectedElectrode) : 'frontal';
  const activeRegionData = BRAIN_REGIONS.find((r) => r.key === activeRegionKey) || BRAIN_REGIONS[0];

  return (
    <div
      className={`relative rounded-3xl glass-panel border border-cyan-500/30 overflow-hidden shadow-2xl transition-all ${
        isFullscreen ? 'fixed inset-4 z-50 bg-slate-950/95 flex flex-col' : 'w-full'
      } ${className}`}
    >
      {/* Top Controls Strip */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/60 backdrop-blur-xl">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          <h3 className="text-sm font-heading font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span>Interactive 3D Brain & 10-20 Electrode Map</span>
          </h3>
          <span className="hidden sm:inline text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
            Click any electrode • Drag to rotate 360°
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetCamera}
            title="Reset Camera View"
            className="p-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-cyan-400 transition-all text-xs flex items-center gap-1 font-mono"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Reset View</span>
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'Exit Fullscreen' : 'Expand Fullscreen'}
            className="p-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-cyan-400 transition-all"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main 3D Canvas Stage & Floating Info Card */}
      <div className="relative w-full h-[380px] sm:h-[480px]">
        {/* 3D WebGL Canvas */}
        <div ref={containerRef} className="w-full h-full cursor-grab" />

        {/* Floating Active Electrode Card */}
        {selectedElectrode && (
          <div className="absolute top-4 left-4 p-4 rounded-2xl bg-slate-950/85 border border-cyan-500/40 backdrop-blur-2xl shadow-[0_0_25px_rgba(0,0,0,0.8)] max-w-xs space-y-2 pointer-events-auto">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-sm font-mono font-bold text-white">
                  Lead {selectedElectrode}
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 font-bold">
                {activeRegionData.name}
              </span>
            </div>

            <p className="text-[11px] text-slate-300 leading-snug font-sans">
              {activeRegionData.functionDescription}
            </p>

            <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-[10px] font-mono text-cyan-300 space-y-1">
              <span className="font-bold block text-white">ADHD Spectral Observation:</span>
              <p className="text-slate-400 leading-tight">
                {isADHD
                  ? `Elevated Theta (4-8 Hz) slow-wave activity recorded at ${selectedElectrode}; contributes to fronto-central TBR elevation.`
                  : `Well-regulated resting alpha and balanced beta oscillations synchronized across ${selectedElectrode}.`}
              </p>
            </div>
          </div>
        )}

        {/* Bottom Right Floating Quick Electrode Matrix */}
        <div className="absolute bottom-4 right-4 p-3 rounded-2xl bg-slate-950/80 border border-slate-800 backdrop-blur-xl shadow-xl max-w-xs space-y-2 hidden sm:block">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">
            10-20 Standard Leads:
          </span>
          <div className="grid grid-cols-5 gap-1">
            {Object.keys(ELECTRODE_10_20_COORDS).map((ch) => (
              <button
                key={ch}
                onClick={() => setSelectedElectrode(ch)}
                className={`py-1 px-1.5 rounded-lg text-[10px] font-mono font-bold transition-all ${
                  selectedElectrode === ch
                    ? 'bg-cyan-500 text-slate-950 font-extrabold shadow-[0_0_10px_rgba(0,240,255,0.6)]'
                    : 'bg-slate-900/80 text-slate-400 hover:text-white hover:border-cyan-400'
                }`}
              >
                {ch}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

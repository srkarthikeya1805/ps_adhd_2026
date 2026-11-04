import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { BrainRegionKey } from '../../types';
import { STANDARD_19_CHANNELS } from '../../utils/sampleData';

// 10-20 Standard Electrode coordinates normalized on brain cranial sphere
export const ELECTRODE_10_20_COORDS: Record<string, [number, number, number]> = {
  Fp1: [-0.38, 0.45, 1.45],
  Fp2: [0.38, 0.45, 1.45],
  F7:  [-1.15, 0.35, 0.95],
  F3:  [-0.65, 0.85, 0.95],
  Fz:  [0.0, 1.15, 0.95],
  F4:  [0.65, 0.85, 0.95],
  F8:  [1.15, 0.35, 0.95],
  T3:  [-1.45, 0.15, 0.0],
  C3:  [-0.85, 0.95, 0.0],
  Cz:  [0.0, 1.35, 0.0],
  C4:  [0.85, 0.95, 0.0],
  T4:  [1.45, 0.15, 0.0],
  T5:  [-1.15, 0.25, -0.95],
  P3:  [-0.65, 0.85, -0.95],
  Pz:  [0.0, 1.15, -0.95],
  P4:  [0.65, 0.85, -0.95],
  T6:  [1.15, 0.25, -0.95],
  O1:  [-0.38, 0.35, -1.45],
  O2:  [0.38, 0.35, -1.45],
};

export interface BrainCanvasProps {
  activeRegion?: BrainRegionKey | null;
  onRegionHover?: (region: BrainRegionKey | null) => void;
  onRegionClick?: (region: BrainRegionKey) => void;
  activeElectrode?: string | null;
  onElectrodeClick?: (channel: string) => void;
  scrollProgress?: number; // 0.0 to 1.0
  mode?: 'cinematic_stage' | 'contained_explorer';
  interactive?: boolean;
  isOpeningCycleActive?: boolean;
  introDuration?: number;
  className?: string;
}

export const BrainCanvas: React.FC<BrainCanvasProps> = ({
  activeRegion,
  onRegionHover,
  onRegionClick,
  activeElectrode,
  onElectrodeClick,
  scrollProgress = 0,
  mode = 'contained_explorer',
  interactive = true,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0, isHovered: false });
  const scrollRef = useRef(scrollProgress);
  const activeRegionRef = useRef<BrainRegionKey | null>(activeRegion ?? null);
  const activeElectrodeRef = useRef<string | null>(activeElectrode ?? null);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [webGlAvailable, setWebGlAvailable] = useState(true);

  // Synchronize dynamic refs to avoid recreation of Three.js loop
  useEffect(() => {
    activeRegionRef.current = activeRegion ?? null;
  }, [activeRegion]);

  useEffect(() => {
    activeElectrodeRef.current = activeElectrode ?? null;
  }, [activeElectrode]);

  useEffect(() => {
    scrollRef.current = scrollProgress;
  }, [scrollProgress]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check WebGL support
    try {
      const testCanvas = document.createElement('canvas');
      const gl = testCanvas.getContext('webgl2') || testCanvas.getContext('webgl');
      if (!gl) {
        setWebGlAvailable(false);
        return;
      }
    } catch {
      setWebGlAvailable(false);
      return;
    }

    const isCinematicStage = mode === 'cinematic_stage';
    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    // 1. SCENE SETUP
    const scene = new THREE.Scene();
    if (isCinematicStage) {
      scene.fog = new THREE.FogExp2(0x030712, 0.04);
    }

    const camera = new THREE.PerspectiveCamera(
      isCinematicStage ? 38 : 42,
      width / height,
      0.1,
      100
    );
    camera.position.set(0, 0.2, isCinematicStage ? 5.2 : 4.4);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebGlAvailable(false);
      return;
    }

    // Clamped pixel ratio for smooth 60fps on Iris Xe graphics
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    container.appendChild(renderer.domElement);

    // 2. CINEMATIC MULTI-POINT LIGHTING
    const ambientLight = new THREE.AmbientLight(0x060f24, 2.2);
    scene.add(ambientLight);

    // Front-Left Key Electric Cyan Light
    const cyanLight = new THREE.PointLight(0x00f0ff, 4.5, 14);
    cyanLight.position.set(-3.5, 2.2, 4.0);
    scene.add(cyanLight);

    // Front-Right Magenta / Violet Rim Light
    const magentaLight = new THREE.PointLight(0xf02bd5, 4.2, 14);
    magentaLight.position.set(3.5, -1.5, 4.0);
    scene.add(magentaLight);

    // Superior Deep Violet Backlight
    const violetLight = new THREE.DirectionalLight(0x8b5cf6, 3.5);
    violetLight.position.set(0, 4.5, -3.0);
    scene.add(violetLight);

    // Bio-Teal Under-Glow
    const tealLight = new THREE.PointLight(0x35f5c8, 2.8, 10);
    tealLight.position.set(0, -3.0, 1.5);
    scene.add(tealLight);

    // Active Region Flare Light
    const regionLight = new THREE.PointLight(0x00f0ff, 0, 8);
    scene.add(regionLight);

    // 3. BRAIN ROOT GROUP
    const brainMasterGroup = new THREE.Group();
    scene.add(brainMasterGroup);

    // 4. PROCEDURAL FALLBACK BRAIN MESH (Instant render in 0.05s)
    const fallbackGroup = new THREE.Group();
    brainMasterGroup.add(fallbackGroup);

    // Dual-hemisphere stylized brain geometry
    const hemiGeoL = new THREE.SphereGeometry(1.3, 32, 24);
    hemiGeoL.scale(0.85, 1.05, 1.25);
    hemiGeoL.translate(-0.45, 0, 0);

    const hemiGeoR = new THREE.SphereGeometry(1.3, 32, 24);
    hemiGeoR.scale(0.85, 1.05, 1.25);
    hemiGeoR.translate(0.45, 0, 0);

    const fallbackMat = new THREE.MeshPhysicalMaterial({
      color: 0x00d4ff,
      emissive: 0x042848,
      emissiveIntensity: 0.5,
      metalness: 0.1,
      roughness: 0.2,
      transmission: 0.45,
      thickness: 1.5,
      transparent: true,
      opacity: 0.85,
      wireframe: false,
    });

    const meshL = new THREE.Mesh(hemiGeoL, fallbackMat);
    const meshR = new THREE.Mesh(hemiGeoR, fallbackMat);
    fallbackGroup.add(meshL);
    fallbackGroup.add(meshR);

    // Wireframe lattice overlay
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      wireframe: true,
      transparent: true,
      opacity: 0.18,
    });
    const wireL = new THREE.Mesh(hemiGeoL, wireMat);
    const wireR = new THREE.Mesh(hemiGeoR, wireMat);
    fallbackGroup.add(wireL);
    fallbackGroup.add(wireR);

    // 5. REAL 3D ANATOMICAL MODEL LOADER (.GLB)
    const realBrainGroup = new THREE.Group();
    realBrainGroup.visible = false;
    brainMasterGroup.add(realBrainGroup);

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('/draco/gltf/');

    const gltfLoader = new GLTFLoader();
    gltfLoader.setDRACOLoader(dracoLoader);

    const meshMaterials: Map<THREE.Mesh, { normalMat: THREE.Material; highlightMat: THREE.Material; region: BrainRegionKey | 'vessel' | 'cerebellum' | 'other' }> = new Map();

    gltfLoader.load(
      '/models/brain.glb',
      (gltf) => {
        const model = gltf.scene;

        // Compute model bounding box to scale and center reliably
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scaleFactor = 3.3 / (maxDim || 1);

        model.position.x = -center.x * scaleFactor;
        model.position.y = -center.y * scaleFactor;
        model.position.z = -center.z * scaleFactor;
        model.scale.setScalar(scaleFactor);

        // Apply neuroscience shader materials across all 437 anatomical meshes
        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            const name = (mesh.name || '').toLowerCase();

            let region: BrainRegionKey | 'vessel' | 'cerebellum' | 'other' = 'other';
            let baseColor = new THREE.Color(0x00e5ff); // Default cyan
            let emissiveColor = new THREE.Color(0x003355);
            let opacity = 0.88;
            let transmission = 0.35;

            if (name.includes('artery') || name.includes('vein') || name.includes('sinus') || name.includes('vessel')) {
              region = 'vessel';
              baseColor = new THREE.Color(0x35f5c8); // Bio-teal
              emissiveColor = new THREE.Color(0x0a4433);
              opacity = 0.95;
            } else if (name.includes('frontal') || name.includes('prefrontal')) {
              region = 'frontal';
              baseColor = new THREE.Color(0x00e5ff); // Electric cyan
              emissiveColor = new THREE.Color(0x004060);
            } else if (name.includes('parietal')) {
              region = 'parietal';
              baseColor = new THREE.Color(0x8b5cf6); // Electric violet
              emissiveColor = new THREE.Color(0x32135c);
            } else if (name.includes('temporal') || name.includes('hippocamp')) {
              region = 'temporal';
              baseColor = new THREE.Color(0xf02bd5); // Neon magenta
              emissiveColor = new THREE.Color(0x521148);
            } else if (name.includes('occipital') || name.includes('calcarine')) {
              region = 'occipital';
              baseColor = new THREE.Color(0x35f5c8); // Mint teal
              emissiveColor = new THREE.Color(0x0c4235);
            } else if (name.includes('cerebell') || name.includes('vermis') || name.includes('stem')) {
              region = 'cerebellum';
              baseColor = new THREE.Color(0x287bff); // Deep royal blue
              emissiveColor = new THREE.Color(0x0d2a5e);
            }

            const normalMat = new THREE.MeshPhysicalMaterial({
              color: baseColor,
              emissive: emissiveColor,
              emissiveIntensity: 0.48,
              metalness: 0.15,
              roughness: 0.22,
              transmission: transmission,
              thickness: 1.2,
              transparent: true,
              opacity: opacity,
              ior: 1.45,
              clearcoat: 0.7,
              clearcoatRoughness: 0.18,
            });

            const highlightMat = new THREE.MeshPhysicalMaterial({
              color: 0xffffff,
              emissive: baseColor,
              emissiveIntensity: 1.2,
              metalness: 0.2,
              roughness: 0.1,
              transmission: 0.15,
              transparent: true,
              opacity: 1.0,
            });

            mesh.material = normalMat;
            meshMaterials.set(mesh, { normalMat, highlightMat, region });
          }
        });

        realBrainGroup.add(model);
        realBrainGroup.visible = true;
        fallbackGroup.visible = false;
        setModelLoaded(true);
      },
      undefined,
      (err) => {
        console.warn('Real brain model load note:', err);
        // Fallback procedural brain mesh remains active and visible
        setModelLoaded(true);
      }
    );

    // 6. 10-20 EEG ELECTRODE MARKERS & PULSING SENSORS
    const electrodeGroup = new THREE.Group();
    brainMasterGroup.add(electrodeGroup);

    const electrodeNodes: Array<{
      name: string;
      mesh: THREE.Mesh;
      ring: THREE.Mesh;
      basePos: THREE.Vector3;
      phase: number;
    }> = [];

    const electrodeSphereGeo = new THREE.SphereGeometry(0.065, 16, 16);
    const electrodeRingGeo = new THREE.RingGeometry(0.09, 0.12, 24);

    Object.entries(ELECTRODE_10_20_COORDS).forEach(([chName, coords], idx) => {
      const pos = new THREE.Vector3(...coords);

      const isChActive = activeElectrodeRef.current === chName;
      const chMat = new THREE.MeshBasicMaterial({
        color: isChActive ? 0xffffff : 0x00f0ff,
      });

      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x00f0ff,
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide,
      });

      const elMesh = new THREE.Mesh(electrodeSphereGeo, chMat);
      elMesh.position.copy(pos);

      const elRing = new THREE.Mesh(electrodeRingGeo, ringMat);
      elRing.position.copy(pos);
      elRing.lookAt(new THREE.Vector3(0, 0, 0));

      electrodeGroup.add(elMesh);
      electrodeGroup.add(elRing);

      electrodeNodes.push({
        name: chName,
        mesh: elMesh,
        ring: elRing,
        basePos: pos,
        phase: idx * 0.35,
      });
    });

    // 7. ORBITING SYNAPTIC PARTICLES (Neural Activity Impulses)
    const particleCount = isCinematicStage ? 220 : 120;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);
    const particleSpeeds: number[] = [];
    const particleRadii: number[] = [];
    const particlePhases: number[] = [];

    const cyanC = new THREE.Color(0x00f0ff);
    const magentaC = new THREE.Color(0xf02bd5);
    const violetC = new THREE.Color(0x8b5cf6);
    const tealC = new THREE.Color(0x35f5c8);
    const colorsList = [cyanC, magentaC, violetC, tealC];

    for (let i = 0; i < particleCount; i++) {
      const r = 1.6 + Math.random() * 1.2;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI;

      particlePositions[i * 3] = r * Math.cos(phi) * Math.sin(theta);
      particlePositions[i * 3 + 1] = r * Math.sin(phi);
      particlePositions[i * 3 + 2] = r * Math.cos(phi) * Math.cos(theta);

      const col = colorsList[Math.floor(Math.random() * colorsList.length)];
      particleColors[i * 3] = col.r;
      particleColors[i * 3 + 1] = col.g;
      particleColors[i * 3 + 2] = col.b;

      particleSpeeds.push(0.3 + Math.random() * 0.8);
      particleRadii.push(r);
      particlePhases.push(Math.random() * Math.PI * 2);
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.045,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // 8. GLOWING NEURAL SYNAPSE CURVES (Axonal Pathways)
    const curveLines: THREE.Line[] = [];
    const curvePointsList = [
      [new THREE.Vector3(-0.6, 0.4, 1.0), new THREE.Vector3(-0.2, 0.8, 0.4), new THREE.Vector3(-0.5, 0.2, -0.6)],
      [new THREE.Vector3(0.6, 0.4, 1.0), new THREE.Vector3(0.2, 0.8, 0.4), new THREE.Vector3(0.5, 0.2, -0.6)],
      [new THREE.Vector3(-0.8, 0.0, 0.2), new THREE.Vector3(0.0, 0.6, 0.1), new THREE.Vector3(0.8, 0.0, 0.2)],
      [new THREE.Vector3(0.0, 0.9, 0.6), new THREE.Vector3(0.0, 0.2, 0.0), new THREE.Vector3(0.0, -0.6, -0.5)],
    ];

    curvePointsList.forEach((pts, idx) => {
      const curve = new THREE.CatmullRomCurve3(pts);
      const points = curve.getPoints(40);
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const lineMat = new THREE.LineBasicMaterial({
        color: idx % 2 === 0 ? 0x00f0ff : 0xf02bd5,
        transparent: true,
        opacity: 0.45,
        blending: THREE.AdditiveBlending,
      });
      const line = new THREE.Line(lineGeo, lineMat);
      brainMasterGroup.add(line);
      curveLines.push(line);
    });

    // 9. EVENT LISTENERS: MOUSE MOVE & RESIZE
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const normY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseRef.current.targetX = normX;
      mouseRef.current.targetY = normY;
      mouseRef.current.isHovered = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.targetX = 0;
      mouseRef.current.targetY = 0;
      mouseRef.current.isHovered = false;
    };

    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    if (interactive) {
      window.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('mouseleave', handleMouseLeave);
    }
    window.addEventListener('resize', handleResize);

    // 10. ANIMATION TICK & SCROLL CHOREOGRAPHY LOOP
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Smooth mouse interpolation (lerp factor 0.05 for fluid cinematic motion)
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const sp = scrollRef.current; // 0.0 to 1.0

      // =========================================================================
      // SCROLL-DRIVEN CAMERA & BRAIN TRANSFORMATION CHOREOGRAPHY
      // =========================================================================
      if (isCinematicStage) {
        // Stage 1 (0.00 -> 0.25): Hero centered floating brain
        // Stage 2 (0.25 -> 0.50): Dive into Cortex & 10-20 Montage
        // Stage 3 (0.50 -> 0.75): Inside AI Model Pipeline (signal flow mode)
        // Stage 4 (0.75 -> 1.00): Neural Lab Diagnostic side monitor

        let targetCamX = 0;
        let targetCamY = 0.2;
        let targetCamZ = 5.2;

        let targetBrainX = 0;
        let targetBrainY = 0;
        let targetBrainZ = 0;
        let targetBrainRotY = elapsed * 0.15;
        let targetBrainRotX = 0;

        if (sp <= 0.25) {
          // Hero
          const t = sp / 0.25;
          targetCamX = mx * 0.35;
          targetCamY = 0.2 - my * 0.25;
          targetCamZ = 5.2 - t * 0.8;
          targetBrainRotY = elapsed * 0.15 + mx * 0.45;
          targetBrainRotX = my * 0.35;
        } else if (sp <= 0.5) {
          // Dive into cortex & 10-20 electrodes
          const t = (sp - 0.25) / 0.25;
          targetCamX = THREE.MathUtils.lerp(0.0, 0.7, t) + mx * 0.3;
          targetCamY = THREE.MathUtils.lerp(0.2, 0.45, t) - my * 0.2;
          targetCamZ = THREE.MathUtils.lerp(4.4, 2.9, t);
          targetBrainRotY = THREE.MathUtils.lerp(0.5, 1.4, t) + mx * 0.35;
          targetBrainRotX = THREE.MathUtils.lerp(0.1, 0.35, t) + my * 0.25;
        } else if (sp <= 0.75) {
          // Inside AI Model Pipeline
          const t = (sp - 0.5) / 0.25;
          targetCamX = THREE.MathUtils.lerp(0.7, -0.85, t) + mx * 0.25;
          targetCamY = THREE.MathUtils.lerp(0.45, 0.1, t) - my * 0.15;
          targetCamZ = THREE.MathUtils.lerp(2.9, 2.6, t);
          targetBrainRotY = THREE.MathUtils.lerp(1.4, 2.8, t) + mx * 0.25;
          targetBrainRotX = THREE.MathUtils.lerp(0.35, 0.15, t) + my * 0.15;
        } else {
          // Neural Lab: Dock brain to the right side as live 3D diagnostic monitor
          const t = (sp - 0.75) / 0.25;
          targetCamX = THREE.MathUtils.lerp(-0.85, 0.0, t) + mx * 0.2;
          targetCamY = THREE.MathUtils.lerp(0.1, 0.2, t) - my * 0.15;
          targetCamZ = THREE.MathUtils.lerp(2.6, 4.2, t);
          targetBrainX = THREE.MathUtils.lerp(0.0, 1.9, t);
          targetBrainY = THREE.MathUtils.lerp(0.0, 0.15, t);
          targetBrainRotY = elapsed * 0.2 + mx * 0.3;
          targetBrainRotX = my * 0.2;
        }

        // Camera lerp
        camera.position.x += (targetCamX - camera.position.x) * 0.08;
        camera.position.y += (targetCamY - camera.position.y) * 0.08;
        camera.position.z += (targetCamZ - camera.position.z) * 0.08;
        camera.lookAt(targetBrainX * 0.5, targetBrainY, 0);

        // Brain master group lerp
        brainMasterGroup.position.x += (targetBrainX - brainMasterGroup.position.x) * 0.08;
        brainMasterGroup.position.y += (targetBrainY + Math.sin(elapsed * 1.5) * 0.05 - brainMasterGroup.position.y) * 0.08;
        brainMasterGroup.position.z += (targetBrainZ - brainMasterGroup.position.z) * 0.08;
        brainMasterGroup.rotation.y += (targetBrainRotY - brainMasterGroup.rotation.y) * 0.08;
        brainMasterGroup.rotation.x += (targetBrainRotX - brainMasterGroup.rotation.x) * 0.08;
      } else {
        // Contained Explorer mode: smooth responsive rotation on cursor
        brainMasterGroup.rotation.y = elapsed * 0.12 + mx * 0.55;
        brainMasterGroup.rotation.x = my * 0.35;
        brainMasterGroup.position.y = Math.sin(elapsed * 1.2) * 0.05;
        camera.position.x += (mx * 0.25 - camera.position.x) * 0.08;
        camera.position.y += (0.2 - my * 0.2 - camera.position.y) * 0.08;
        camera.lookAt(0, 0, 0);
      }

      // 10-20 Electrode pulse animation
      electrodeNodes.forEach((node) => {
        const pulse = 1.0 + Math.sin(elapsed * 3.5 + node.phase) * 0.25;
        node.ring.scale.set(pulse, pulse, pulse);

        const isHighlighted = activeElectrodeRef.current === node.name;
        if (isHighlighted) {
          (node.mesh.material as THREE.MeshBasicMaterial).color.setHex(0xffffff);
          (node.ring.material as THREE.MeshBasicMaterial).color.setHex(0x00f0ff);
          node.ring.scale.set(1.5 * pulse, 1.5 * pulse, 1.5 * pulse);
        } else {
          (node.mesh.material as THREE.MeshBasicMaterial).color.setHex(0x00f0ff);
        }
      });

      // Highlight active brain region meshes
      const currentActiveLobe = activeRegionRef.current;
      meshMaterials.forEach((data, mesh) => {
        if (currentActiveLobe && data.region === currentActiveLobe) {
          mesh.material = data.highlightMat;
        } else {
          mesh.material = data.normalMat;
        }
      });

      // Animate orbiting synaptic particles
      const posAttr = particleGeo.attributes.position as THREE.BufferAttribute;
      const posArr = posAttr.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        const r = particleRadii[i];
        const theta = elapsed * particleSpeeds[i] * 0.2 + particlePhases[i];
        const phi = Math.sin(elapsed * 0.3 + particlePhases[i]) * 0.8;

        posArr[i * 3] = r * Math.cos(phi) * Math.sin(theta);
        posArr[i * 3 + 1] = r * Math.sin(phi);
        posArr[i * 3 + 2] = r * Math.cos(phi) * Math.cos(theta);
      }
      posAttr.needsUpdate = true;
      particleSystem.rotation.y = elapsed * 0.05;

      // Pulse curve lines
      curveLines.forEach((line, idx) => {
        (line.material as THREE.LineBasicMaterial).opacity =
          0.3 + Math.sin(elapsed * 2.5 + idx) * 0.25;
      });

      renderer.render(scene, camera);
    };

    animate();

    // 11. CLEANUP ON UNMOUNT
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);

      try {
        renderer.dispose();
        if (renderer.domElement && renderer.domElement.parentElement) {
          renderer.domElement.parentElement.removeChild(renderer.domElement);
        }
        fallbackMat.dispose();
        wireMat.dispose();
        particleGeo.dispose();
        particleMat.dispose();
      } catch (e) {
        console.warn('Three.js cleanup note:', e);
      }
    };
  }, [mode, interactive]);

  if (!webGlAvailable) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 text-center glass-panel rounded-3xl ${className}`}>
        <div className="w-16 h-16 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4 animate-pulse">
          ⚡
        </div>
        <h4 className="text-lg font-heading font-bold text-white mb-2">3D Neural Visualizer</h4>
        <p className="text-xs text-slate-400 max-w-sm font-mono">
          WebGL acceleration is disabled in your browser. Complete EEG analysis, pre-validation, and multi-model inference remain fully operational below.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden select-none ${className}`}
      style={{ touchAction: 'none' }}
    />
  );
};

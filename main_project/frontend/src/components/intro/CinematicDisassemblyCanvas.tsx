import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import gsap from 'gsap';
import { STANDARD_19_CHANNELS } from '../../utils/sampleData';
import { ELECTRODE_10_20_COORDS } from '../brain/BrainCanvas';

export interface CinematicDisassemblyCanvasProps {
  currentStage: 'idle' | 'opening' | 'disassembly' | 'core_dive' | 'eeg_head' | 'complete';
  progress: number; // 0.0 to 1.0 overall or stage-specific
  onAnimationComplete?: () => void;
  className?: string;
  isReducedMotion?: boolean;
}

export const CinematicDisassemblyCanvas: React.FC<CinematicDisassemblyCanvasProps> = ({
  currentStage,
  progress,
  onAnimationComplete,
  className = '',
  isReducedMotion = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef(currentStage);
  const progressRef = useRef(progress);
  const isReducedMotionRef = useRef(isReducedMotion);

  useEffect(() => {
    stageRef.current = currentStage;
  }, [currentStage]);

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    isReducedMotionRef.current = isReducedMotion;
  }, [isReducedMotion]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    // 1. SCENE & CAMERA
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020617, 0.035);

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 0.2, 5.0);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch (e) {
      console.warn('WebGL init failed:', e);
      return;
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    container.appendChild(renderer.domElement);

    // 2. CINEMATIC LIGHTING (Electric Blue, Cyan, Neon Magenta, Deep Violet)
    const ambientLight = new THREE.AmbientLight(0x051329, 2.4);
    scene.add(ambientLight);

    const keyCyanLight = new THREE.PointLight(0x00f0ff, 4.5, 16);
    keyCyanLight.position.set(-3.5, 2.5, 4.0);
    scene.add(keyCyanLight);

    const rimPinkLight = new THREE.PointLight(0xf02bd5, 4.2, 16);
    rimPinkLight.position.set(3.5, -1.8, 3.5);
    scene.add(rimPinkLight);

    const topVioletLight = new THREE.DirectionalLight(0x8b5cf6, 3.8);
    topVioletLight.position.set(0, 5.0, -2.0);
    scene.add(topVioletLight);

    const underTealLight = new THREE.PointLight(0x35f5c8, 3.0, 12);
    underTealLight.position.set(0, -3.2, 1.5);
    scene.add(underTealLight);

    // Central pulsing core light
    const coreLight = new THREE.PointLight(0x00f0ff, 0, 10);
    coreLight.position.set(0, 0, 0);
    scene.add(coreLight);

    // 3. MASTER GROUPS
    const masterGroup = new THREE.Group();
    scene.add(masterGroup);

    // Group for Scene A: Floating Brain & Disassembly Layers
    const brainDisassemblyGroup = new THREE.Group();
    masterGroup.add(brainDisassemblyGroup);

    // Group for Scene B: 3D Transparent EEG Head & Electrodes
    const eegHeadGroup = new THREE.Group();
    eegHeadGroup.visible = false;
    masterGroup.add(eegHeadGroup);

    // -------------------------------------------------------------------------
    // DISASSEMBLY LAYERS SETUP (Matching Reference Video)
    // -------------------------------------------------------------------------
    // Layer 1: Outer Cranial Shell (Glass dome / translucent skull top)
    const cranialShellGroup = new THREE.Group();
    // Layer 2: Cerebral Cortex (Upper lobes: Left & Right)
    const cortexGroup = new THREE.Group();
    const cortexLeft = new THREE.Group();
    const cortexRight = new THREE.Group();
    cortexGroup.add(cortexLeft);
    cortexGroup.add(cortexRight);
    // Layer 3: Vascular & Neural Network (Cyan & pink electric plexus mesh)
    const vascularGroup = new THREE.Group();
    // Layer 4: Inner Brain (Thalamus, Hippocampus, Ventricles, Limbic structures)
    const innerBrainGroup = new THREE.Group();
    // Layer 5: Midbrain
    const midbrainGroup = new THREE.Group();
    // Layer 6: Cerebellum (Back lower)
    const cerebellumGroup = new THREE.Group();
    // Layer 7: Brainstem & Spinal Cord (Lower trunk)
    const brainstemGroup = new THREE.Group();

    brainDisassemblyGroup.add(cranialShellGroup);
    brainDisassemblyGroup.add(cortexGroup);
    brainDisassemblyGroup.add(vascularGroup);
    brainDisassemblyGroup.add(innerBrainGroup);
    brainDisassemblyGroup.add(midbrainGroup);
    brainDisassemblyGroup.add(cerebellumGroup);
    brainDisassemblyGroup.add(brainstemGroup);

    // -------------------------------------------------------------------------
    // PROCEDURAL HIGH-DEFINITION ANATOMICAL GEOMETRIES (Render instantly)
    // -------------------------------------------------------------------------
    // Cranial Shell: Translucent Glass Dome
    const cranialGeo = new THREE.SphereGeometry(1.65, 48, 36, 0, Math.PI * 2, 0, Math.PI * 0.58);
    cranialGeo.scale(0.92, 1.15, 1.25);
    const cranialMat = new THREE.MeshPhysicalMaterial({
      color: 0x47b5ff,
      emissive: 0x07223b,
      emissiveIntensity: 0.35,
      metalness: 0.1,
      roughness: 0.12,
      transmission: 0.72,
      thickness: 1.8,
      transparent: true,
      opacity: 0.65,
      side: THREE.DoubleSide,
      clearcoat: 0.9,
    });
    const cranialMesh = new THREE.Mesh(cranialGeo, cranialMat);
    cranialMesh.rotation.x = 0.05;
    cranialShellGroup.add(cranialMesh);

    // Cranial rim glow wire
    const cranialRimGeo = new THREE.TorusGeometry(1.58, 0.018, 16, 64);
    cranialRimGeo.scale(0.92, 1.22, 1.0);
    cranialRimGeo.rotateX(Math.PI / 2);
    const cranialRimMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.8,
    });
    const cranialRim = new THREE.Mesh(cranialRimGeo, cranialRimMat);
    cranialRim.position.y = -0.28;
    cranialShellGroup.add(cranialRim);

    // Cerebral Cortex Left & Right Hemispheres
    const hemiGeoL = new THREE.SphereGeometry(1.35, 36, 28);
    hemiGeoL.scale(0.82, 0.98, 1.2);
    hemiGeoL.translate(-0.48, 0.22, 0);

    const hemiGeoR = new THREE.SphereGeometry(1.35, 36, 28);
    hemiGeoR.scale(0.82, 0.98, 1.2);
    hemiGeoR.translate(0.48, 0.22, 0);

    const cortexMat = new THREE.MeshPhysicalMaterial({
      color: 0x00d8f6,
      emissive: 0x02243d,
      emissiveIntensity: 0.52,
      metalness: 0.15,
      roughness: 0.22,
      transmission: 0.42,
      thickness: 1.4,
      transparent: true,
      opacity: 0.88,
    });

    const cortexWireMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      wireframe: true,
      transparent: true,
      opacity: 0.22,
    });

    const meshCortexL = new THREE.Mesh(hemiGeoL, cortexMat);
    const meshCortexR = new THREE.Mesh(hemiGeoR, cortexMat);
    const wireCortexL = new THREE.Mesh(hemiGeoL, cortexWireMat);
    const wireCortexR = new THREE.Mesh(hemiGeoR, cortexWireMat);
    cortexLeft.add(meshCortexL);
    cortexLeft.add(wireCortexL);
    cortexRight.add(meshCortexR);
    cortexRight.add(wireCortexR);

    // Vascular & Neural Network (Cyan & pink branching plexus lines and points)
    const vascularPointsCount = 140;
    const vascGeo = new THREE.BufferGeometry();
    const vascPositions = new Float32Array(vascularPointsCount * 3);
    const vascColors = new Float32Array(vascularPointsCount * 3);
    const vascColorA = new THREE.Color(0x00f0ff);
    const vascColorB = new THREE.Color(0xf02bd5);

    for (let i = 0; i < vascularPointsCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const r = 0.8 + Math.random() * 0.5;
      const y = (Math.random() - 0.5) * 0.6;
      vascPositions[i * 3] = Math.cos(theta) * r;
      vascPositions[i * 3 + 1] = y;
      vascPositions[i * 3 + 2] = Math.sin(theta) * r * 1.1;

      const col = i % 2 === 0 ? vascColorA : vascColorB;
      vascColors[i * 3] = col.r;
      vascColors[i * 3 + 1] = col.g;
      vascColors[i * 3 + 2] = col.b;
    }
    vascGeo.setAttribute('position', new THREE.BufferAttribute(vascPositions, 3));
    vascGeo.setAttribute('color', new THREE.BufferAttribute(vascColors, 3));

    const vascPointsMat = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
    });
    const vascPoints = new THREE.Points(vascGeo, vascPointsMat);
    vascularGroup.add(vascPoints);

    // Connecting plexus wire lattice
    const plexusLatticeGeo = new THREE.IcosahedronGeometry(0.95, 2);
    plexusLatticeGeo.scale(1.1, 0.65, 1.2);
    const plexusLatticeMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const plexusMesh = new THREE.Mesh(plexusLatticeGeo, plexusLatticeMat);
    vascularGroup.add(plexusMesh);

    // Inner Brain: Limbic System & Thalamic Core
    const innerBrainGeo = new THREE.SphereGeometry(0.72, 32, 24);
    innerBrainGeo.scale(0.9, 0.75, 1.15);
    const innerBrainMat = new THREE.MeshPhysicalMaterial({
      color: 0x8b5cf6,
      emissive: 0x2e1065,
      emissiveIntensity: 0.65,
      metalness: 0.1,
      roughness: 0.25,
      transmission: 0.35,
      thickness: 1.2,
      transparent: true,
      opacity: 0.88,
    });
    const innerBrainMesh = new THREE.Mesh(innerBrainGeo, innerBrainMat);
    innerBrainMesh.position.set(0, 0, 0);
    innerBrainGroup.add(innerBrainMesh);

    // Glowing Central Neural Core (appears when separated)
    const coreSphereGeo = new THREE.SphereGeometry(0.38, 32, 32);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    });
    const coreSphere = new THREE.Mesh(coreSphereGeo, coreMat);
    innerBrainGroup.add(coreSphere);

    // Glowing Core Halo
    const coreHaloGeo = new THREE.RingGeometry(0.42, 0.75, 36);
    const coreHaloMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
    const coreHalo = new THREE.Mesh(coreHaloGeo, coreHaloMat);
    coreHalo.rotation.x = Math.PI / 2;
    innerBrainGroup.add(coreHalo);

    // Midbrain & Brainstem
    const midbrainGeo = new THREE.CylinderGeometry(0.28, 0.35, 0.55, 24);
    const midbrainMat = new THREE.MeshPhysicalMaterial({
      color: 0xf02bd5,
      emissive: 0x4a044e,
      emissiveIntensity: 0.55,
      roughness: 0.28,
      transparent: true,
      opacity: 0.85,
    });
    const midbrainMesh = new THREE.Mesh(midbrainGeo, midbrainMat);
    midbrainMesh.position.set(0, -0.38, -0.05);
    midbrainGroup.add(midbrainMesh);

    // Cerebellum: Lower posterior lobes
    const cerebGeo = new THREE.SphereGeometry(0.58, 24, 20);
    cerebGeo.scale(1.2, 0.65, 0.85);
    const cerebMat = new THREE.MeshPhysicalMaterial({
      color: 0x2563eb,
      emissive: 0x1e3a8a,
      emissiveIntensity: 0.6,
      roughness: 0.3,
      transparent: true,
      opacity: 0.88,
    });
    const cerebMesh = new THREE.Mesh(cerebGeo, cerebMat);
    cerebMesh.position.set(0, -0.65, -0.72);
    cerebellumGroup.add(cerebMesh);

    // Brainstem & Spinal Cord (Trunk extending downwards)
    const stemGeo = new THREE.CylinderGeometry(0.22, 0.15, 1.4, 24);
    const stemMat = new THREE.MeshPhysicalMaterial({
      color: 0x06b6d4,
      emissive: 0x083344,
      emissiveIntensity: 0.5,
      roughness: 0.25,
      transparent: true,
      opacity: 0.82,
    });
    const stemMesh = new THREE.Mesh(stemGeo, stemMat);
    stemMesh.position.set(0, -1.2, -0.15);
    brainstemGroup.add(stemMesh);

    // Holographic Circular Alignment Radar Rings for exploded view
    const radarRings: THREE.Mesh[] = [];
    [-0.8, -0.2, 0.4, 1.1].forEach((yPos) => {
      const ringGeo = new THREE.RingGeometry(1.6, 1.63, 64);
      ringGeo.rotateX(Math.PI / 2);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x00f0ff,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.y = yPos;
      brainDisassemblyGroup.add(ringMesh);
      radarRings.push(ringMesh);
    });

    // Zigzag electrical connection sparks between separating layers
    const sparkLines: THREE.Line[] = [];
    for (let i = 0; i < 6; i++) {
      const sparkGeo = new THREE.BufferGeometry();
      const pts = [
        new THREE.Vector3((Math.random() - 0.5) * 0.8, 0.8, (Math.random() - 0.5) * 0.8),
        new THREE.Vector3((Math.random() - 0.5) * 0.4, 0.0, (Math.random() - 0.5) * 0.4),
        new THREE.Vector3((Math.random() - 0.5) * 0.6, -0.7, (Math.random() - 0.5) * 0.6),
      ];
      sparkGeo.setFromPoints(pts);
      const sparkMat = new THREE.LineBasicMaterial({
        color: i % 2 === 0 ? 0x00f0ff : 0xf02bd5,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
      });
      const sparkLine = new THREE.Line(sparkGeo, sparkMat);
      brainDisassemblyGroup.add(sparkLine);
      sparkLines.push(sparkLine);
    }

    // -------------------------------------------------------------------------
    // SCENE B: FUTURISTIC 3D EEG HEAD & 10-20 ELECTRODE CAP
    // -------------------------------------------------------------------------
    // Transparent anatomical human head contour
    const headOutlineGeo = new THREE.SphereGeometry(1.4, 36, 32);
    headOutlineGeo.scale(0.88, 1.25, 1.15);
    const headMat = new THREE.MeshPhysicalMaterial({
      color: 0x0ea5e9,
      emissive: 0x02192e,
      emissiveIntensity: 0.3,
      metalness: 0.1,
      roughness: 0.15,
      transmission: 0.8,
      thickness: 1.6,
      transparent: true,
      opacity: 0.55,
      wireframe: false,
    });
    const headWireMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      wireframe: true,
      transparent: true,
      opacity: 0.18,
    });
    const headMesh = new THREE.Mesh(headOutlineGeo, headMat);
    const headWire = new THREE.Mesh(headOutlineGeo, headWireMat);
    eegHeadGroup.add(headMesh);
    eegHeadGroup.add(headWire);

    // 19 Standard 10-20 Electrodes & Pulsing Beacons
    const electrodeNodes: Array<{ mesh: THREE.Mesh; ring: THREE.Mesh; label: string; pos: THREE.Vector3 }> = [];
    const elSphereGeo = new THREE.SphereGeometry(0.07, 16, 16);
    const elRingGeo = new THREE.RingGeometry(0.1, 0.14, 24);

    Object.entries(ELECTRODE_10_20_COORDS).forEach(([chName, coords]) => {
      const pos = new THREE.Vector3(...coords);

      const elMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xf02bd5,
        transparent: true,
        opacity: 0.75,
        side: THREE.DoubleSide,
      });

      const el = new THREE.Mesh(elSphereGeo, elMat);
      el.position.copy(pos);

      const ring = new THREE.Mesh(elRingGeo, ringMat);
      ring.position.copy(pos);
      ring.lookAt(new THREE.Vector3(0, 0, 0));

      eegHeadGroup.add(el);
      eegHeadGroup.add(ring);
      electrodeNodes.push({ mesh: el, ring, label: chName, pos });
    });

    // Dynamic electrical connections between electrode pairs
    const eegNetLines: THREE.Line[] = [];
    const electrodePairs = [
      ['Fp1', 'Fp2'], ['Fp1', 'F3'], ['Fp2', 'F4'], ['F3', 'Fz'], ['Fz', 'F4'],
      ['F3', 'C3'], ['Fz', 'Cz'], ['F4', 'C4'], ['C3', 'Cz'], ['Cz', 'C4'],
      ['C3', 'P3'], ['Cz', 'Pz'], ['C4', 'P4'], ['P3', 'Pz'], ['Pz', 'P4'],
      ['P3', 'O1'], ['P4', 'O2'], ['O1', 'O2'], ['F7', 'F3'], ['F4', 'F8'],
      ['T3', 'C3'], ['C4', 'T4'], ['T5', 'P3'], ['P4', 'T6']
    ];

    electrodePairs.forEach(([chA, chB], idx) => {
      const posA = ELECTRODE_10_20_COORDS[chA];
      const posB = ELECTRODE_10_20_COORDS[chB];
      if (posA && posB) {
        const lineGeo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(...posA),
          new THREE.Vector3(...posB),
        ]);
        const lineMat = new THREE.LineBasicMaterial({
          color: idx % 2 === 0 ? 0x00f0ff : 0x8b5cf6,
          transparent: true,
          opacity: 0.55,
        });
        const line = new THREE.Line(lineGeo, lineMat);
        eegHeadGroup.add(line);
        eegNetLines.push(line);
      }
    });

    // 3D Flowing EEG Waveform Ribbons (Cyan, Purple, Neon Pink)
    const waveRibbons: THREE.Line[] = [];
    const ribbonColors = [0x00f0ff, 0x8b5cf6, 0xf02bd5];
    for (let r = 0; r < 3; r++) {
      const ribGeo = new THREE.BufferGeometry();
      const ribPoints: THREE.Vector3[] = [];
      const numPts = 60;
      for (let p = 0; p < numPts; p++) {
        const x = -2.2 + (p / numPts) * 4.4;
        const y = -1.2 + r * 0.3;
        const z = 1.2 + Math.sin(p * 0.2) * 0.2;
        ribPoints.push(new THREE.Vector3(x, y, z));
      }
      ribGeo.setFromPoints(ribPoints);
      const ribMat = new THREE.LineBasicMaterial({
        color: ribbonColors[r],
        transparent: true,
        opacity: 0.7,
      });
      const ribbon = new THREE.Line(ribGeo, ribMat);
      eegHeadGroup.add(ribbon);
      waveRibbons.push(ribbon);
    }

    // Floating Synaptic Particles (Underneath and around)
    const particleCount = 260;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    const particleCol = new Float32Array(particleCount * 3);
    const colorPalette = [
      new THREE.Color(0x00f0ff),
      new THREE.Color(0x8b5cf6),
      new THREE.Color(0xf02bd5),
      new THREE.Color(0x38bdf8),
    ];

    for (let i = 0; i < particleCount; i++) {
      particlePos[i * 3] = (Math.random() - 0.5) * 6.5;
      particlePos[i * 3 + 1] = (Math.random() - 0.5) * 5.0;
      particlePos[i * 3 + 2] = (Math.random() - 0.5) * 6.0;

      const col = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      particleCol[i * 3] = col.r;
      particleCol[i * 3 + 1] = col.g;
      particleCol[i * 3 + 2] = col.b;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleCol, 3));
    const particleMat = new THREE.PointsMaterial({
      size: 0.045,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });
    const particlePoints = new THREE.Points(particleGeo, particleMat);
    scene.add(particlePoints);

    // -------------------------------------------------------------------------
    // LOAD REAL 3D BRAIN GLB MODEL IF AVAILABLE
    // -------------------------------------------------------------------------
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('/draco/gltf/');
    const gltfLoader = new GLTFLoader();
    gltfLoader.setDRACOLoader(dracoLoader);

    gltfLoader.load(
      '/models/brain.glb',
      (gltf) => {
        const model = gltf.scene;
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scaleFactor = 3.2 / (maxDim || 1);

        model.position.x = -center.x * scaleFactor;
        model.position.y = -center.y * scaleFactor;
        model.position.z = -center.z * scaleFactor;
        model.scale.setScalar(scaleFactor);

        // Classify anatomical sub-meshes into disassembly groups
        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            const name = (mesh.name || '').toLowerCase();

            if (mesh.material) {
              const mat = (mesh.material as THREE.Material).clone() as THREE.MeshPhysicalMaterial;
              mat.transparent = true;
              mat.opacity = 0.85;
              mat.roughness = 0.22;
              mat.metalness = 0.15;
              mesh.material = mat;
            }

            if (name.includes('artery') || name.includes('vein') || name.includes('vessel')) {
              (mesh.material as THREE.MeshPhysicalMaterial).color = new THREE.Color(0x35f5c8);
              vascularGroup.add(mesh.clone());
            } else if (name.includes('cerebell') || name.includes('vermis')) {
              (mesh.material as THREE.MeshPhysicalMaterial).color = new THREE.Color(0x287bff);
              cerebellumGroup.add(mesh.clone());
            } else if (name.includes('stem')) {
              (mesh.material as THREE.MeshPhysicalMaterial).color = new THREE.Color(0x06b6d4);
              brainstemGroup.add(mesh.clone());
            } else if (name.includes('hippocamp') || name.includes('thalam')) {
              (mesh.material as THREE.MeshPhysicalMaterial).color = new THREE.Color(0x8b5cf6);
              innerBrainGroup.add(mesh.clone());
            }
          }
        });
      },
      undefined,
      (err) => {
        // Fallback procedural anatomy is already fully built and ready
      }
    );

    // -------------------------------------------------------------------------
    // ANIMATION & TIMELINE INTERPOLATION LOOP
    // -------------------------------------------------------------------------
    let animId: number;
    const clock = new THREE.Clock();

    const render = () => {
      animId = requestAnimationFrame(render);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();
      const stg = stageRef.current;
      const prog = progressRef.current;

      // Rotate particle dust
      particlePoints.rotation.y = elapsed * 0.04;
      particlePoints.rotation.x = Math.sin(elapsed * 0.05) * 0.05;

      // -----------------------------------------------------------------------
      // STAGE-SPECIFIC THREE.JS CHOREOGRAPHY
      // -----------------------------------------------------------------------
      if (stg === 'idle') {
        // Scene 1: Glowing electric-blue floating brain, smooth continuous 360 rotation
        brainDisassemblyGroup.visible = true;
        eegHeadGroup.visible = false;

        brainDisassemblyGroup.rotation.y = elapsed * 0.28;
        brainDisassemblyGroup.position.y = Math.sin(elapsed * 1.5) * 0.06;

        // Reset layer separation to 0
        cranialShellGroup.position.y = THREE.MathUtils.lerp(cranialShellGroup.position.y, 0, 0.1);
        cortexLeft.position.x = THREE.MathUtils.lerp(cortexLeft.position.x, 0, 0.1);
        cortexRight.position.x = THREE.MathUtils.lerp(cortexRight.position.x, 0, 0.1);
        cortexGroup.position.y = THREE.MathUtils.lerp(cortexGroup.position.y, 0, 0.1);
        vascularGroup.position.y = THREE.MathUtils.lerp(vascularGroup.position.y, 0, 0.1);
        midbrainGroup.position.y = THREE.MathUtils.lerp(midbrainGroup.position.y, 0, 0.1);
        cerebellumGroup.position.y = THREE.MathUtils.lerp(cerebellumGroup.position.y, 0, 0.1);
        cerebellumGroup.position.z = THREE.MathUtils.lerp(cerebellumGroup.position.z, 0, 0.1);
        brainstemGroup.position.y = THREE.MathUtils.lerp(brainstemGroup.position.y, 0, 0.1);

        radarRings.forEach((r) => ((r.material as THREE.MeshBasicMaterial).opacity = 0));
        sparkLines.forEach((s) => ((s.material as THREE.LineBasicMaterial).opacity = 0));
        coreMat.opacity = 0;
        coreHaloMat.opacity = 0;
        coreLight.intensity = 0;

        camera.position.set(0, 0.2, 5.0);
        camera.lookAt(0, 0, 0);

      } else if (stg === 'opening' || stg === 'disassembly') {
        // Scene 2 & 3: Brain Disassembly Explosion matching Video Reference
        brainDisassemblyGroup.visible = true;
        eegHeadGroup.visible = false;

        // Rotation decelerates slightly into focused angle
        brainDisassemblyGroup.rotation.y = elapsed * 0.15;
        brainDisassemblyGroup.rotation.x = Math.sin(elapsed * 0.8) * 0.05;

        // Factor: disassembly separation distance
        const sepFactor = stg === 'disassembly' ? 1.0 : prog;

        // 1. Cranial shell lifts upwards (+Y)
        cranialShellGroup.position.y = THREE.MathUtils.lerp(cranialShellGroup.position.y, 1.8 * sepFactor, 0.08);

        // 2. Cerebral cortex separates upwards (+Y) and splits left & right (±X)
        cortexGroup.position.y = THREE.MathUtils.lerp(cortexGroup.position.y, 0.95 * sepFactor, 0.08);
        cortexLeft.position.x = THREE.MathUtils.lerp(cortexLeft.position.x, -0.42 * sepFactor, 0.08);
        cortexRight.position.x = THREE.MathUtils.lerp(cortexRight.position.x, 0.42 * sepFactor, 0.08);

        // 3. Vascular network expands in between
        vascularGroup.position.y = THREE.MathUtils.lerp(vascularGroup.position.y, 0.35 * sepFactor, 0.08);
        vascularGroup.scale.setScalar(1.0 + 0.15 * sepFactor);

        // 4. Inner brain holds central focus
        innerBrainGroup.position.y = THREE.MathUtils.lerp(innerBrainGroup.position.y, -0.05 * sepFactor, 0.08);

        // 5. Midbrain shifts downward
        midbrainGroup.position.y = THREE.MathUtils.lerp(midbrainGroup.position.y, -0.6 * sepFactor, 0.08);

        // 6. Cerebellum shifts downward and posterior
        cerebellumGroup.position.y = THREE.MathUtils.lerp(cerebellumGroup.position.y, -0.9 * sepFactor, 0.08);
        cerebellumGroup.position.z = THREE.MathUtils.lerp(cerebellumGroup.position.z, -0.55 * sepFactor, 0.08);

        // 7. Brainstem & spinal cord extends downward
        brainstemGroup.position.y = THREE.MathUtils.lerp(brainstemGroup.position.y, -1.35 * sepFactor, 0.08);

        // Glowing Core activation
        coreMat.opacity = THREE.MathUtils.lerp(coreMat.opacity, 0.85 * sepFactor, 0.1);
        coreHaloMat.opacity = THREE.MathUtils.lerp(coreHaloMat.opacity, 0.65 * sepFactor, 0.1);
        coreLight.intensity = THREE.MathUtils.lerp(coreLight.intensity, 5.0 * sepFactor, 0.1);

        // Radar alignment rings fade in
        radarRings.forEach((r) => {
          (r.material as THREE.MeshBasicMaterial).opacity = 0.35 * sepFactor;
          r.rotation.z = elapsed * 0.1;
        });

        // Electrical sparks arc between layers
        sparkLines.forEach((s, idx) => {
          (s.material as THREE.LineBasicMaterial).opacity =
            (0.3 + Math.sin(elapsed * 12.0 + idx) * 0.3) * sepFactor;
        });

        // Camera slowly approaches
        const camZ = THREE.MathUtils.lerp(5.0, 3.8, sepFactor);
        camera.position.set(0, 0.25, camZ);
        camera.lookAt(0, 0, 0);

      } else if (stg === 'core_dive') {
        // Stage 4: Camera travels directly forward through the central neural opening
        brainDisassemblyGroup.visible = true;
        eegHeadGroup.visible = true;

        // Accelerate into core opening
        const diveT = prog;
        camera.position.z = THREE.MathUtils.lerp(3.8, -1.5, diveT);
        coreLight.intensity = 8.0 * (1 - diveT);

        // Fade disassembly brain as camera plunges past
        if (diveT > 0.6) {
          brainDisassemblyGroup.visible = false;
        }

      } else if (stg === 'eeg_head' || stg === 'complete') {
        // Stage 5: Futuristic 3D EEG Head with 10-20 Electrodes & Live Waveforms
        brainDisassemblyGroup.visible = false;
        eegHeadGroup.visible = true;

        camera.position.set(0, 0.2, 4.4);
        camera.lookAt(0, 0, 0);

        // Smooth continuous 3D rotation of head
        eegHeadGroup.rotation.y = elapsed * 0.22;
        eegHeadGroup.position.y = Math.sin(elapsed * 1.4) * 0.04;

        // Electrode beacons pulse
        electrodeNodes.forEach((node, i) => {
          const pulse = 1.0 + Math.sin(elapsed * 4.0 + i * 0.4) * 0.3;
          node.ring.scale.set(pulse, pulse, pulse);
        });

        // Pulse EEG net conduits
        eegNetLines.forEach((line, idx) => {
          (line.material as THREE.LineBasicMaterial).opacity =
            0.35 + Math.sin(elapsed * 3.0 + idx) * 0.25;
        });

        // Animate 3D waveform ribbons
        waveRibbons.forEach((ribbon, rIdx) => {
          const posAttr = ribbon.geometry.attributes.position as THREE.BufferAttribute;
          const posArr = posAttr.array as Float32Array;
          const ptsCount = posArr.length / 3;
          for (let p = 0; p < ptsCount; p++) {
            const phase = p * 0.25 + elapsed * (3.0 + rIdx);
            posArr[p * 3 + 1] = -1.2 + rIdx * 0.35 + Math.sin(phase) * 0.15;
          }
          posAttr.needsUpdate = true;
        });
      }

      renderer.render(scene, camera);
    };

    render();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
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
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full select-none overflow-hidden ${className}`}
      style={{ touchAction: 'none' }}
    />
  );
};

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { League } from '@/stores/gameStore';

const leagueOrder: League[] = [
  'bronze', 'silver', 'gold', 'platinum', 'diamond',
  'master', 'grandmaster', 'champion', 'legend', 'immortal'
];

interface LeagueBadge3DProps {
  league: League;
  level?: number; // Optional, to match existing interface
}

export const LeagueBadge3D = ({ league }: LeagueBadge3DProps) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const badgeRef = useRef<THREE.Group | null>(null);
  const isDraggingRef = useRef(false);
  const previousMousePosition = useRef({ x: 0 });
  const rotationVelocity = useRef(0);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const rafRef = useRef<number>();

  // Map league string to index for the user's logic
  const currentLeagueIndex = leagueOrder.indexOf(league);

  const leagues = [
    { name: 'Bronze', theme: 'Bronze/Copper', primary: 0xCD7F32, secondary: 0x8B4513, accent: 0xD4A574 },
    { name: 'Silver', theme: 'Silver/Chrome', primary: 0xC0C0C0, secondary: 0x808080, accent: 0xE8E8E8 },
    { name: 'Gold', theme: 'Gold/Amber', primary: 0xFFD700, secondary: 0xDAA520, accent: 0xFFF8DC },
    { name: 'Platinum', theme: 'Ice/Crystal', primary: 0xE5F2FF, secondary: 0x87CEEB, accent: 0xB0E0E6 },
    { name: 'Diamond', theme: 'Blue Diamond', primary: 0x4ECFFF, secondary: 0x1E90FF, accent: 0x00BFFF },
    { name: 'Master', theme: 'Purple/Obsidian', primary: 0x9B59B6, secondary: 0x5B2C6F, accent: 0xC39BD3 },
    { name: 'Grandmaster', theme: 'Red/Crimson', primary: 0xDC143C, secondary: 0x8B0000, accent: 0xFF6347 },
    { name: 'Champion', theme: 'Rainbow/Aurora', primary: 0xFF69B4, secondary: 0x9400D3, accent: 0xFFD700 },
    { name: 'Legend', theme: 'Cosmic/Galaxy', primary: 0x4B0082, secondary: 0x191970, accent: 0x9370DB },
    { name: 'Immortal', theme: 'Divine Golden Flames', primary: 0xFFD700, secondary: 0xFF8C00, accent: 0xFFFAF0 }
  ];

  useEffect(() => {
    if (!mountRef.current) return;

    // Cleanup previous scene if exists
    if (rendererRef.current) {
      // We handle cleanup in return, but just in case
    }

    const scene = new THREE.Scene();
    // Enable transparency for integration
    // scene.background = new THREE.Color(0x0f0f0f); 
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      45,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    const width = mountRef.current.clientWidth;
    const baseSize = 170; // Original component size
    const baseZ = 7; // Original camera distance
    const dynamicZ = baseZ * (width / baseSize);

    camera.position.set(0, 0, dynamicZ);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 2.5); // Increased from 2.0
    mainLight.position.set(6, 8, 6);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    scene.add(mainLight);

    const keyLight = new THREE.SpotLight(0xffffff, 2.2); // Increased from 1.8
    keyLight.position.set(-5, 5, 5);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const fillLight = new THREE.PointLight(0x4080ff, 1.5); // Increased from 1.0
    fillLight.position.set(-4, 2, 4);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(0xffa040, 1.8); // Increased from 1.2
    rimLight.position.set(4, -3, -4);
    scene.add(rimLight);

    const topLight = new THREE.DirectionalLight(0xffffff, 1.0); // Increased from 0.5
    topLight.position.set(0, 10, 0);
    scene.add(topLight);

    const createMetalMaterial = (color: number, metalness = 0.9, roughness = 0.2, emissive = 0x000000, emissiveIntensity = 0) => {
      return new THREE.MeshStandardMaterial({
        color: color,
        metalness: metalness,
        roughness: roughness,
        emissive: emissive,
        emissiveIntensity: emissiveIntensity,
        envMapIntensity: 1.5
      });
    };

    const createCrystalMaterial = (color: number, emissiveIntensity = 0.4) => {
      return new THREE.MeshPhysicalMaterial({
        color: color,
        metalness: 0.0,
        roughness: 0.05,
        transmission: 0.7,
        thickness: 0.8,
        emissive: color,
        emissiveIntensity: emissiveIntensity,
        clearcoat: 1.0,
        clearcoatRoughness: 0.05,
        ior: 2.4,
        reflectivity: 1.0
      });
    };

    const createBadge = (leagueIndex: number) => {
      const group = new THREE.Group();
      // Fallback if index not found
      if (leagueIndex < 0) leagueIndex = 0;
      const league = leagues[leagueIndex];

      // Scale factor based on league to ensure fit/visibility
      let scale = 1.0;
      if (leagueIndex <= 1) scale = 1.25; // Bronze & Silver - Bigger
      else if (leagueIndex === 8) scale = 0.55; // Legend - smaller to fit in veils
      else if (leagueIndex === 9) scale = 0.52; // Immortal - smaller to fit flames
      else if (leagueIndex >= 6) scale = 0.72; // Grandmaster+ - slightly smaller

      group.scale.set(scale, scale, scale);

      switch (leagueIndex) {
        case 0: { // BRONZE
          const shieldGeo = new THREE.CylinderGeometry(1.3, 1.5, 0.35, 6);
          shieldGeo.rotateX(Math.PI / 2);
          const shield = new THREE.Mesh(shieldGeo, createMetalMaterial(league.primary, 0.7, 0.5));
          shield.castShadow = true;
          group.add(shield);

          const centerGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.4, 32);
          centerGeo.rotateX(Math.PI / 2);
          const center = new THREE.Mesh(centerGeo, createMetalMaterial(league.secondary, 0.8, 0.4));
          center.position.z = 0.25;
          center.castShadow = true;
          group.add(center);

          const ringGeo = new THREE.TorusGeometry(1.4, 0.1, 8, 32);
          const ring = new THREE.Mesh(ringGeo, createMetalMaterial(league.accent, 0.8, 0.3));
          ring.castShadow = true;
          group.add(ring);
          break;
        }

        case 1: { // SILVER - Enhanced with more colors
          const shieldGeo = new THREE.CylinderGeometry(1.35, 1.55, 0.4, 6);
          shieldGeo.rotateX(Math.PI / 2);
          const shield = new THREE.Mesh(shieldGeo, createMetalMaterial(league.primary, 0.95, 0.15));
          shield.castShadow = true;
          group.add(shield);

          // Inner plate with darker silver
          const innerGeo = new THREE.CylinderGeometry(1.1, 1.1, 0.35, 6);
          innerGeo.rotateX(Math.PI / 2);
          const inner = new THREE.Mesh(innerGeo, createMetalMaterial(league.secondary, 0.9, 0.2));
          inner.position.z = 0.05;
          inner.castShadow = true;
          group.add(inner);

          for (let side of [-1, 1]) {
            const wingGeo = new THREE.BoxGeometry(0.9, 0.5, 0.2);
            const wing = new THREE.Mesh(wingGeo, createMetalMaterial(league.accent, 0.95, 0.15));
            wing.position.set(side * 1.5, 0.35, 0.1);
            wing.rotation.z = side * 0.35;
            wing.castShadow = true;
            group.add(wing);
          }

          const starGeo = new THREE.CylinderGeometry(0, 0.55, 0.45, 5);
          starGeo.rotateX(Math.PI / 2);
          const star = new THREE.Mesh(starGeo, createMetalMaterial(0xFFFFFF, 0.98, 0.1, 0xCCCCCC, 0.3));
          star.position.z = 0.3;
          star.castShadow = true;
          group.add(star);

          const ringGeo = new THREE.TorusGeometry(1.5, 0.12, 12, 32);
          const ring = new THREE.Mesh(ringGeo, createMetalMaterial(league.primary, 0.95, 0.15));
          ring.castShadow = true;
          group.add(ring);

          // Accent ring
          const ring2Geo = new THREE.TorusGeometry(1.2, 0.08, 12, 32);
          const ring2 = new THREE.Mesh(ring2Geo, createMetalMaterial(0x606060, 0.9, 0.2));
          ring2.position.z = 0.1;
          ring2.castShadow = true;
          group.add(ring2);
          break;
        }

        case 2: { // GOLD
          const shieldShape = new THREE.Shape();
          for (let i = 0; i <= 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const x = Math.cos(angle) * 1.45;
            const y = Math.sin(angle) * 1.45;
            if (i === 0) shieldShape.moveTo(x, y);
            else shieldShape.lineTo(x, y);
          }
          const shieldGeo = new THREE.ExtrudeGeometry(shieldShape, {
            depth: 0.35,
            bevelEnabled: true,
            bevelThickness: 0.12,
            bevelSize: 0.08
          });
          const shield = new THREE.Mesh(shieldGeo, createMetalMaterial(league.primary, 0.95, 0.25, league.secondary, 0.3));
          shield.castShadow = true;
          group.add(shield);

          for (let side of [-1, 1]) {
            const wingGeo = new THREE.BoxGeometry(1.3, 0.7, 0.18);
            const wing = new THREE.Mesh(wingGeo, createMetalMaterial(league.primary, 0.9, 0.25, league.secondary, 0.25));
            wing.position.set(side * 1.7, 0.6, 0.1);
            wing.rotation.z = side * 0.45;
            wing.castShadow = true;
            group.add(wing);

            const wing2Geo = new THREE.BoxGeometry(0.9, 0.5, 0.12);
            const wing2 = new THREE.Mesh(wing2Geo, createMetalMaterial(league.secondary, 0.95, 0.2, league.accent, 0.3));
            wing2.position.set(side * 2.0, 0.85, 0.15);
            wing2.rotation.z = side * 0.55;
            wing2.castShadow = true;
            group.add(wing2);
          }

          const jewelGeo = new THREE.SphereGeometry(0.45, 32, 32);
          const jewel = new THREE.Mesh(jewelGeo, createMetalMaterial(league.accent, 1.0, 0.1, 0xFFDD00, 0.6));
          jewel.position.z = 0.4;
          jewel.castShadow = true;
          group.add(jewel);

          const ringGeo = new THREE.TorusGeometry(1.7, 0.14, 16, 32);
          const ring = new THREE.Mesh(ringGeo, createMetalMaterial(league.secondary, 0.95, 0.2, league.accent, 0.2));
          ring.castShadow = true;
          group.add(ring);
          break;
        }

        case 3: { // PLATINUM - Enhanced with more colors
          const shieldGeo = new THREE.CylinderGeometry(1.5, 1.7, 0.45, 8);
          shieldGeo.rotateX(Math.PI / 2);
          const shield = new THREE.Mesh(shieldGeo, createCrystalMaterial(0xD0E8FF, 0.3));
          shield.castShadow = true;
          group.add(shield);

          // Add colorful inner layer
          const innerGeo = new THREE.CylinderGeometry(1.2, 1.2, 0.38, 8);
          innerGeo.rotateX(Math.PI / 2);
          const inner = new THREE.Mesh(innerGeo, createCrystalMaterial(0xA0D8FF, 0.4));
          inner.position.z = 0.05;
          inner.castShadow = true;
          group.add(inner);

          for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
            // Main crystal
            const crystalGeo = new THREE.ConeGeometry(0.25, 1.3, 6);
            const crystal = new THREE.Mesh(crystalGeo, createCrystalMaterial(league.secondary, 0.5));
            crystal.position.set(Math.cos(angle) * 1.7, Math.sin(angle) * 1.7, 0.35);
            crystal.rotation.z = -angle + Math.PI / 2;
            crystal.castShadow = true;
            group.add(crystal);

            // Smaller accent crystal
            const smallCrystalGeo = new THREE.ConeGeometry(0.15, 0.8, 6);
            const smallCrystal = new THREE.Mesh(smallCrystalGeo, createCrystalMaterial(league.accent, 0.6));
            smallCrystal.position.set(Math.cos(angle + Math.PI / 8) * 1.5, Math.sin(angle + Math.PI / 8) * 1.5, 0.25);
            smallCrystal.rotation.z = -(angle + Math.PI / 8) + Math.PI / 2;
            smallCrystal.castShadow = true;
            group.add(smallCrystal);
          }

          const gemGeo = new THREE.OctahedronGeometry(0.55);
          const gem = new THREE.Mesh(gemGeo, createCrystalMaterial(0xFFFFFF, 0.7));
          gem.position.z = 0.45;
          gem.castShadow = true;
          group.add(gem);

          const ringGeo = new THREE.TorusGeometry(1.8, 0.16, 12, 32);
          const ring = new THREE.Mesh(ringGeo, createCrystalMaterial(league.primary, 0.4));
          ring.castShadow = true;
          group.add(ring);
          break;
        }

        case 4: { // DIAMOND
          const shieldGeo = new THREE.OctahedronGeometry(1.6);
          shieldGeo.scale(1, 1, 0.55);
          const shield = new THREE.Mesh(shieldGeo, createCrystalMaterial(0x88DDFF, 0.5));
          shield.castShadow = true;
          group.add(shield);

          for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const crystalGeo = new THREE.ConeGeometry(0.28, 1.6, 6);
            const crystal = new THREE.Mesh(crystalGeo, createCrystalMaterial(league.secondary, 0.7));
            crystal.position.set(Math.cos(angle) * 1.9, Math.sin(angle) * 1.9, 0.45);
            crystal.rotation.z = -angle + Math.PI / 2;
            crystal.castShadow = true;
            group.add(crystal);
          }

          const centerGeo = new THREE.OctahedronGeometry(0.65);
          const center = new THREE.Mesh(centerGeo, createCrystalMaterial(league.accent, 0.8));
          center.position.z = 0.55;
          center.castShadow = true;
          group.add(center);

          const ringGeo = new THREE.TorusGeometry(2.1, 0.14, 16, 32);
          const ring = new THREE.Mesh(ringGeo, createCrystalMaterial(league.primary, 0.6));
          ring.castShadow = true;
          group.add(ring);

          const ring2Geo = new THREE.TorusGeometry(1.3, 0.1, 12, 32);
          const ring2 = new THREE.Mesh(ring2Geo, createCrystalMaterial(0xFFFFFF, 0.7));
          ring2.position.z = 0.15;
          ring2.castShadow = true;
          group.add(ring2);
          break;
        }

        case 5: { // MASTER
          const shieldGeo = new THREE.CylinderGeometry(1.6, 1.8, 0.55, 8);
          shieldGeo.rotateX(Math.PI / 2);
          const shield = new THREE.Mesh(shieldGeo, createMetalMaterial(0x1a1a1a, 0.95, 0.15, league.primary, 0.4));
          shield.castShadow = true;
          group.add(shield);

          for (let side of [-1, 1]) {
            const wingGeo = new THREE.BoxGeometry(1.6, 0.9, 0.25);
            const wing = new THREE.Mesh(wingGeo, createMetalMaterial(league.secondary, 0.85, 0.25, league.primary, 0.5));
            wing.position.set(side * 1.9, 0.7, 0.15);
            wing.rotation.z = side * 0.4;
            wing.castShadow = true;
            group.add(wing);

            const bladeGeo = new THREE.BoxGeometry(0.35, 1.4, 0.12);
            const blade = new THREE.Mesh(bladeGeo, createMetalMaterial(league.primary, 0.7, 0.3, league.accent, 0.7));
            blade.position.set(side * 2.3, 1.1, 0.2);
            blade.rotation.z = side * 0.3;
            blade.castShadow = true;
            group.add(blade);
          }

          const crystalGeo = new THREE.OctahedronGeometry(0.55);
          const crystal = new THREE.Mesh(crystalGeo, createMetalMaterial(league.primary, 0.85, 0.2, league.accent, 0.8));
          crystal.position.z = 0.45;
          crystal.castShadow = true;
          group.add(crystal);

          const ring1Geo = new THREE.TorusGeometry(1.9, 0.16, 12, 32);
          const ring1 = new THREE.Mesh(ring1Geo, createMetalMaterial(league.primary, 0.9, 0.25, league.accent, 0.4));
          ring1.castShadow = true;
          group.add(ring1);

          const ring2Geo = new THREE.TorusGeometry(2.2, 0.12, 12, 32);
          const ring2 = new THREE.Mesh(ring2Geo, createMetalMaterial(league.secondary, 0.85, 0.3, league.primary, 0.35));
          ring2.position.z = -0.12;
          ring2.castShadow = true;
          group.add(ring2);
          break;
        }

        case 6: { // GRANDMASTER
          const baseGeo = new THREE.CylinderGeometry(1.7, 1.9, 0.65, 8);
          baseGeo.rotateX(Math.PI / 2);
          const base = new THREE.Mesh(baseGeo, createMetalMaterial(0x2a0000, 0.95, 0.2, league.primary, 0.5));
          base.castShadow = true;
          group.add(base);

          const plateGeo = new THREE.CylinderGeometry(1.4, 1.4, 0.3, 8);
          plateGeo.rotateX(Math.PI / 2);
          const plate = new THREE.Mesh(plateGeo, createMetalMaterial(league.primary, 0.9, 0.25, league.accent, 0.6));
          plate.position.z = 0.35;
          plate.castShadow = true;
          group.add(plate);

          for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;

            const armorGeo = new THREE.BoxGeometry(0.7, 0.9, 0.25);
            const armor = new THREE.Mesh(armorGeo, createMetalMaterial(league.secondary, 0.95, 0.2, league.primary, 0.5));
            armor.position.set(Math.cos(angle) * 2.0, Math.sin(angle) * 2.0, 0.1);
            armor.rotation.z = -angle + Math.PI / 2;
            armor.castShadow = true;
            group.add(armor);

            if (i % 2 === 0) {
              const spikeGeo = new THREE.ConeGeometry(0.18, 1.2, 6);
              const spike = new THREE.Mesh(spikeGeo, createMetalMaterial(league.accent, 0.95, 0.15, 0xFF0000, 0.7));
              spike.position.set(Math.cos(angle) * 2.5, Math.sin(angle) * 2.5, 0.4);
              spike.rotation.z = -angle + Math.PI / 2;
              spike.castShadow = true;
              group.add(spike);
            }
          }

          const coreGeo = new THREE.SphereGeometry(0.55, 32, 32);
          const core = new THREE.Mesh(coreGeo, createMetalMaterial(0xFF0000, 0.8, 0.1, 0xFF4500, 0.9));
          core.position.z = 0.6;
          core.castShadow = true;
          group.add(core);

          const ringGeo = new THREE.TorusGeometry(2.3, 0.2, 8, 32);
          const ring = new THREE.Mesh(ringGeo, createMetalMaterial(league.secondary, 0.95, 0.2, league.primary, 0.5));
          ring.castShadow = true;
          group.add(ring);
          group.scale.set(0.95, 0.95, 0.95);
          break;
        }

        case 7: { // CHAMPION
          const crownBaseGeo = new THREE.CylinderGeometry(1.8, 2.0, 0.5, 12);
          crownBaseGeo.rotateX(Math.PI / 2);
          const crownBase = new THREE.Mesh(crownBaseGeo, createMetalMaterial(0xFFD700, 0.95, 0.15, 0xFFAA00, 0.4));
          crownBase.castShadow = true;
          group.add(crownBase);

          for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const isMain = i % 3 === 0;
            const height = isMain ? 1.8 : 1.2;
            const width = isMain ? 0.35 : 0.25;

            const spikeGeo = new THREE.ConeGeometry(width, height, 6);
            const color = isMain ? 0xFF69B4 : (i % 2 === 0 ? 0x9400D3 : 0xFFD700);
            const spike = new THREE.Mesh(spikeGeo, createMetalMaterial(color, 0.9, 0.2, color, 0.6));
            spike.position.set(Math.cos(angle) * 2.2, Math.sin(angle) * 2.2, 0.5 + (isMain ? 0.3 : 0));
            spike.rotation.z = -angle + Math.PI / 2;
            spike.castShadow = true;
            group.add(spike);
          }

          for (let side of [-1, 1]) {
            const wing1Geo = new THREE.BoxGeometry(2.0, 1.4, 0.3);
            const wing1 = new THREE.Mesh(wing1Geo, createMetalMaterial(0xFFFFFF, 0.9, 0.2, 0xFFD700, 0.5));
            wing1.position.set(side * 2.5, 1.0, 0.2);
            wing1.rotation.z = side * 0.5;
            wing1.castShadow = true;
            group.add(wing1);

            const wing2Geo = new THREE.BoxGeometry(1.6, 1.0, 0.25);
            const wing2 = new THREE.Mesh(wing2Geo, createMetalMaterial(0xFF69B4, 0.9, 0.2, 0xFFD700, 0.5));
            wing2.position.set(side * 2.8, 1.3, 0.25);
            wing2.rotation.z = side * 0.55;
            wing2.castShadow = true;
            group.add(wing2);

            const wing3Geo = new THREE.BoxGeometry(1.2, 0.7, 0.2);
            const wing3 = new THREE.Mesh(wing3Geo, createMetalMaterial(0x9400D3, 0.9, 0.2, 0xFFD700, 0.5));
            wing3.position.set(side * 3.0, 1.7, 0.3);
            wing3.rotation.z = side * 0.6;
            wing3.castShadow = true;
            group.add(wing3);
          }

          const gemGeo = new THREE.SphereGeometry(0.7, 32, 32);
          const gem = new THREE.Mesh(gemGeo, createMetalMaterial(0xFF69B4, 0.95, 0.1, 0xFFD700, 0.8));
          gem.position.z = 0.7;
          gem.castShadow = true;
          group.add(gem);

          const ring1Geo = new THREE.TorusGeometry(2.1, 0.16, 16, 32);
          const ring1 = new THREE.Mesh(ring1Geo, createMetalMaterial(0xFFD700, 0.95, 0.15, 0xFFAA00, 0.4));
          ring1.castShadow = true;
          group.add(ring1);

          const ring2Geo = new THREE.TorusGeometry(2.5, 0.14, 16, 32);
          const ring2 = new THREE.Mesh(ring2Geo, createMetalMaterial(0xFF69B4, 0.95, 0.15, 0xFF1493, 0.4));
          ring2.position.z = -0.18;
          ring2.castShadow = true;
          group.add(ring2);
          group.scale.set(0.75, 0.75, 0.75);
          break;
        }

        case 8: { // LEGEND - Cosmic galaxy emperor with elaborate design
          // Multi-layered cosmic core
          const coreGeo = new THREE.CylinderGeometry(1.8, 2.0, 0.6, 12);
          coreGeo.rotateX(Math.PI / 2);
          const core = new THREE.Mesh(coreGeo, createMetalMaterial(0x1a0033, 0.9, 0.25, league.primary, 0.7));
          core.castShadow = true;
          group.add(core);

          // Inner cosmic layer
          const innerGeo = new THREE.CylinderGeometry(1.5, 1.5, 0.5, 12);
          innerGeo.rotateX(Math.PI / 2);
          const inner = new THREE.Mesh(innerGeo, createMetalMaterial(league.secondary, 0.85, 0.3, league.primary, 0.8));
          inner.position.z = 0.1;
          inner.castShadow = true;
          group.add(inner);

          // Galaxy wings/blades (8 large cosmic blades)
          for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const isMain = i % 2 === 0;

            // Main cosmic blade
            const bladeGeo = new THREE.BoxGeometry(0.6, isMain ? 2.4 : 2.0, 0.2);
            const blade = new THREE.Mesh(bladeGeo, createMetalMaterial(league.primary, 0.8, 0.3, league.accent, 0.8));
            blade.position.set(Math.cos(angle) * 2.3, Math.sin(angle) * 2.3, 0.5);
            blade.rotation.z = -angle + Math.PI / 2;
            blade.castShadow = true;
            group.add(blade);

            // Inner energy blade
            const innerBladeGeo = new THREE.BoxGeometry(0.4, isMain ? 2.0 : 1.6, 0.15);
            const innerBlade = new THREE.Mesh(innerBladeGeo, createMetalMaterial(league.accent, 0.75, 0.35, 0x9370DB, 0.9));
            innerBlade.position.set(Math.cos(angle) * 2.3, Math.sin(angle) * 2.3, 0.55);
            innerBlade.rotation.z = -angle + Math.PI / 2;
            innerBlade.castShadow = true;
            group.add(innerBlade);

            // Cosmic spike tips
            if (isMain) {
              const spikeGeo = new THREE.ConeGeometry(0.3, 1.2, 6);
              const spike = new THREE.Mesh(spikeGeo, createMetalMaterial(0x9370DB, 0.85, 0.25, 0xBA55D3, 1.0));
              spike.position.set(Math.cos(angle) * 2.3, Math.sin(angle) * 2.3, 1.6);
              spike.rotation.z = -angle + Math.PI / 2;
              spike.castShadow = true;
              group.add(spike);
            }
          }

          // Cosmic armor segments
          for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const segmentGeo = new THREE.BoxGeometry(0.5, 0.9, 0.25);
            const segment = new THREE.Mesh(segmentGeo, createMetalMaterial(league.secondary, 0.85, 0.3, league.primary, 0.65));
            segment.position.set(Math.cos(angle) * 1.9, Math.sin(angle) * 1.9, 0.2);
            segment.rotation.z = -angle + Math.PI / 2;
            segment.castShadow = true;
            group.add(segment);
          }

          // Galaxy halos with gradient
          const haloData = [
            { radius: 2.6, width: 0.18, color: league.primary, emissive: league.accent, intensity: 0.7, z: 0.15 },
            { radius: 3.0, width: 0.15, color: league.accent, emissive: 0x9370DB, intensity: 0.6, z: 0.08 },
            { radius: 3.3, width: 0.12, color: 0x9370DB, emissive: 0xBA55D3, intensity: 0.5, z: 0 }
          ];

          haloData.forEach(halo => {
            const ringGeo = new THREE.TorusGeometry(halo.radius, halo.width, 12, 32);
            const ring = new THREE.Mesh(ringGeo, createMetalMaterial(halo.color, 0.75, 0.35, halo.emissive, halo.intensity));
            ring.position.z = halo.z;
            ring.castShadow = true;
            group.add(ring);
          });

          // Central void galaxy orb
          const voidGeo = new THREE.SphereGeometry(0.85, 32, 32);
          const void_ = new THREE.Mesh(voidGeo, createMetalMaterial(0x4B0082, 0.85, 0.25, 0x9370DB, 1.0));
          void_.position.z = 0.6;
          void_.castShadow = true;
          group.add(void_);

          // Inner cosmic eye
          const eyeGeo = new THREE.SphereGeometry(0.5, 32, 32);
          const eye = new THREE.Mesh(eyeGeo, createMetalMaterial(0x8B00FF, 0.9, 0.2, 0xBA55D3, 1.2));
          eye.position.z = 0.6;
          eye.castShadow = true;
          group.add(eye);
          group.userData.void = eye;

          // Cosmic star particles
          const starCount = 50;
          const starGeo = new THREE.BufferGeometry();
          const starPos = new Float32Array(starCount * 3);
          for (let i = 0; i < starCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = 3.5 + Math.random() * 0.8;
            starPos[i * 3] = Math.cos(angle) * radius;
            starPos[i * 3 + 1] = Math.sin(angle) * radius;
            starPos[i * 3 + 2] = (Math.random() - 0.5) * 1.8;
          }
          starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
          const starMat = new THREE.PointsMaterial({
            color: 0x9370DB,
            size: 0.1,
            transparent: true,
            opacity: 0.85,
            blending: THREE.AdditiveBlending
          });
          const stars = new THREE.Points(starGeo, starMat);
          group.add(stars);
          group.userData.stars = stars;
          group.scale.set(0.75, 0.75, 0.75);
          break;
        }

        case 9: { // IMMORTAL - SUPREME DIVINE RELIC with sacred geometry
          // Base divine throne with sacred geometry patterns
          const baseGeo = new THREE.CylinderGeometry(2.0, 2.2, 0.8, 12);
          baseGeo.rotateX(Math.PI / 2);
          const base = new THREE.Mesh(baseGeo, createMetalMaterial(0xFFD700, 1.0, 0.08, 0xFFAA00, 0.8));
          base.castShadow = true;
          group.add(base);

          // Multi-layered throne with gradient
          const layers = [
            { radius1: 1.8, radius2: 2.0, height: 0.75, color: 0xFFE55C, emissive: 0xFFDD00, z: 0.08 },
            { radius1: 1.6, radius2: 1.8, height: 0.7, color: 0xFFF8DC, emissive: 0xFFEE88, z: 0.15 }
          ];

          layers.forEach(layer => {
            const layerGeo = new THREE.CylinderGeometry(layer.radius1, layer.radius2, layer.height, 12);
            layerGeo.rotateX(Math.PI / 2);
            const layerMesh = new THREE.Mesh(layerGeo, createMetalMaterial(layer.color, 1.0, 0.1, layer.emissive, 0.85));
            layerMesh.position.z = layer.z;
            layerMesh.castShadow = true;
            group.add(layerMesh);
          });

          // Sacred geometry pattern rings ON the base (Flower of Life inspired)
          for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const patternGeo = new THREE.TorusGeometry(0.35, 0.05, 8, 16);
            const pattern = new THREE.Mesh(patternGeo, createMetalMaterial(0xFFFFFF, 1.0, 0.05, 0xFFFFAA, 1.0));
            pattern.position.set(Math.cos(angle) * 1.5, Math.sin(angle) * 1.5, 0.45);
            pattern.castShadow = true;
            group.add(pattern);
          }

          // Central sacred pattern
          const centerPatternGeo = new THREE.TorusGeometry(0.35, 0.05, 8, 16);
          const centerPattern = new THREE.Mesh(centerPatternGeo, createMetalMaterial(0xFFFFFF, 1.0, 0.05, 0xFFFFAA, 1.1));
          centerPattern.position.z = 0.45;
          centerPattern.castShadow = true;
          group.add(centerPattern);

          // Ornate divine pillars with relic details (12 directions)
          for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const isMain = i % 3 === 0;

            // Main ornate pillar
            const pillarGeo = new THREE.BoxGeometry(0.5, isMain ? 2.8 : 2.2, 0.4);
            const pillar = new THREE.Mesh(pillarGeo, createMetalMaterial(0xFFD700, 1.0, 0.1, 0xFFAA00, 0.85));
            pillar.position.set(Math.cos(angle) * 2.5, Math.sin(angle) * 2.5, 0.8);
            pillar.rotation.z = -angle + Math.PI / 2;
            pillar.castShadow = true;
            group.add(pillar);

            // Inner relic pattern on pillar
            const relicGeo = new THREE.BoxGeometry(0.35, isMain ? 2.4 : 1.8, 0.35);
            const relic = new THREE.Mesh(relicGeo, createMetalMaterial(0xFFF8DC, 1.0, 0.08, 0xFFEE88, 0.9));
            relic.position.set(Math.cos(angle) * 2.5, Math.sin(angle) * 2.5, 0.85);
            relic.rotation.z = -angle + Math.PI / 2;
            relic.castShadow = true;
            group.add(relic);

            // Sacred geometry segments on pillars
            const segmentGeo = new THREE.BoxGeometry(0.2, isMain ? 0.6 : 0.4, 0.3);
            const segment = new THREE.Mesh(segmentGeo, createMetalMaterial(0xFFFFFF, 1.0, 0.05, 0xFFFFAA, 1.0));
            segment.position.set(Math.cos(angle) * 2.5, Math.sin(angle) * 2.5, 0.9);
            segment.rotation.z = -angle + Math.PI / 2;
            segment.castShadow = true;
            group.add(segment);

            // Divine flame crowns
            if (isMain) {
              const crownGeo = new THREE.ConeGeometry(0.4, 1.2, 6);
              const crown = new THREE.Mesh(crownGeo, createMetalMaterial(0xFFFFAA, 0.95, 0.12, 0xFFDD00, 1.1));
              crown.position.set(Math.cos(angle) * 2.5, Math.sin(angle) * 2.5, 2.0);
              crown.rotation.z = -angle + Math.PI / 2;
              crown.castShadow = true;
              group.add(crown);
            }

            // Smaller flame accents
            const smallFlameGeo = new THREE.ConeGeometry(0.28, 0.9, 6);
            const smallFlame = new THREE.Mesh(smallFlameGeo, createMetalMaterial(i % 2 === 0 ? 0xFF8C00 : 0xFFAA00, 0.9, 0.15, 0xFF6600, 1.2));
            smallFlame.position.set(Math.cos(angle + Math.PI / 12) * 2.8, Math.sin(angle + Math.PI / 12) * 2.8, isMain ? 1.7 : 1.4);
            smallFlame.rotation.z = -(angle + Math.PI / 12) + Math.PI / 2;
            smallFlame.castShadow = true;
            group.add(smallFlame);
          }

          // Supreme divine halos with ornate patterns
          const haloData = [
            { radius: 2.2, width: 0.22, color: 0xFFD700, emissive: 0xFFAA00, z: 0.3 },
            { radius: 2.7, width: 0.19, color: 0xFFE55C, emissive: 0xFFDD00, z: 0.22 },
            { radius: 3.2, width: 0.16, color: 0xFFF8DC, emissive: 0xFFEE88, z: 0.14 },
            { radius: 3.6, width: 0.13, color: 0xFFFFFF, emissive: 0xFFFFAA, z: 0.06 }
          ];

          haloData.forEach(halo => {
            const ringGeo = new THREE.TorusGeometry(halo.radius, halo.width, 16, 32);
            const ring = new THREE.Mesh(ringGeo, createMetalMaterial(halo.color, 1.0, 0.1, halo.emissive, 0.95));
            ring.position.z = halo.z;
            ring.castShadow = true;
            group.add(ring);
          });

          // Relic detail rings between halos
          for (let i = 0; i < 3; i++) {
            const detailRingGeo = new THREE.TorusGeometry(2.45 + i * 0.5, 0.08, 12, 32);
            const detailRing = new THREE.Mesh(detailRingGeo, createMetalMaterial(0xFFFFFF, 1.0, 0.05, 0xFFFFAA, 1.0));
            detailRing.position.z = 0.26 - i * 0.08;
            detailRing.castShadow = true;
            group.add(detailRing);
          }

          // Central radiant divine core (triple-layered)
          const core1Geo = new THREE.SphereGeometry(1.0, 64, 64);
          const core1 = new THREE.Mesh(core1Geo, createMetalMaterial(0xFFFAF0, 1.0, 0.02, 0xFFFFFF, 1.4));
          core1.position.z = 0.7;
          core1.castShadow = true;
          group.add(core1);

          const core2Geo = new THREE.SphereGeometry(0.7, 48, 48);
          const core2 = new THREE.Mesh(core2Geo, createMetalMaterial(0xFFFFAA, 1.0, 0.04, 0xFFDD00, 1.5));
          core2.position.z = 0.7;
          core2.castShadow = true;
          group.add(core2);

          const core3Geo = new THREE.SphereGeometry(0.45, 32, 32);
          const core3 = new THREE.Mesh(core3Geo, createMetalMaterial(0xFFD700, 1.0, 0.06, 0xFFAA00, 1.6));
          core3.position.z = 0.7;
          core3.castShadow = true;
          group.add(core3);

          // Sacred geometry etching on core sphere
          for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const etchGeo = new THREE.TorusGeometry(0.25, 0.03, 6, 16);
            const etch = new THREE.Mesh(etchGeo, createMetalMaterial(0xFFFFFF, 1.0, 0.02, 0xFFFFAA, 1.3));
            etch.position.set(Math.cos(angle) * 0.6, Math.sin(angle) * 0.6, 0.7);
            etch.castShadow = true;
            group.add(etch);
          }

          // Divine energy particles (more elaborate)
          const particleCount = 80;
          const particleGeo = new THREE.BufferGeometry();
          const particlePos = new Float32Array(particleCount * 3);
          for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = 3.8 + Math.random() * 1.2;
            particlePos[i * 3] = Math.cos(angle) * radius;
            particlePos[i * 3 + 1] = Math.sin(angle) * radius;
            particlePos[i * 3 + 2] = (Math.random() - 0.3) * 2.5;
          }
          particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
          const particleMat = new THREE.PointsMaterial({
            color: 0xFFFFDD,
            size: 0.18,
            transparent: true,
            opacity: 0.95,
            blending: THREE.AdditiveBlending
          });
          const particles = new THREE.Points(particleGeo, particleMat);
          group.add(particles);
          group.userData.particles = particles;
          group.scale.set(0.70, 0.70, 0.70);
          break;
        }
      }

      group.rotation.x = -0.3;

      // Enable self-shadowing for all parts
      group.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.castShadow = true;
          object.receiveShadow = true;
        }
      });

      return group;
    };

    const badge = createBadge(currentLeagueIndex);
    scene.add(badge);
    badgeRef.current = badge;

    const handleMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      previousMousePosition.current = { x: e.clientX };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !badgeRef.current) return;
      const deltaX = e.clientX - previousMousePosition.current.x;
      rotationVelocity.current = deltaX * 0.015;
      badgeRef.current.rotation.y += rotationVelocity.current;
      previousMousePosition.current = { x: e.clientX };
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    renderer.domElement.addEventListener('mousedown', handleMouseDown);
    renderer.domElement.addEventListener('mousemove', handleMouseMove);
    renderer.domElement.addEventListener('mouseup', handleMouseUp);
    renderer.domElement.addEventListener('mouseleave', handleMouseUp);

    // Touch support (basic)
    const handleTouchStart = (e: TouchEvent) => {
      isDraggingRef.current = true;
      previousMousePosition.current = { x: e.touches[0].clientX };
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current || !badgeRef.current) return;
      const deltaX = e.touches[0].clientX - previousMousePosition.current.x;
      rotationVelocity.current = deltaX * 0.015;
      badgeRef.current.rotation.y += rotationVelocity.current;
      previousMousePosition.current = { x: e.touches[0].clientX };
    };
    const handleTouchEnd = () => {
      isDraggingRef.current = false;
    };
    renderer.domElement.addEventListener('touchstart', handleTouchStart);
    renderer.domElement.addEventListener('touchmove', handleTouchMove);
    renderer.domElement.addEventListener('touchend', handleTouchEnd);


    let time = 0;
    const animate = () => {
      rafRef.current = requestAnimationFrame(animate);
      time += 0.01;

      if (badgeRef.current) {
        if (!isDraggingRef.current) {
          badgeRef.current.rotation.y += 0.007;
          rotationVelocity.current *= 0.96;
        } else {
          badgeRef.current.rotation.y += rotationVelocity.current;
          rotationVelocity.current *= 0.98;
        }

        // Legend void eye pulse
        if (currentLeagueIndex === 8 && badgeRef.current.userData.void) {
          const pulse = Math.sin(time * 2.5) * 0.3 + 0.7;
          badgeRef.current.userData.void.material.emissiveIntensity = pulse * 1.2;
        }

        // Immortal particle rotation
        if (currentLeagueIndex === 9 && badgeRef.current.userData.particles) {
          badgeRef.current.userData.particles.rotation.z += 0.008;
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };

    // Use ResizeObserver for more robust sizing in containers
    const resizeObserver = new ResizeObserver(() => handleResize());
    resizeObserver.observe(mountRef.current);

    return () => {
      resizeObserver.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
      // Dispose geometries/materials? Ideally yes, but sticking to user code structure mostly.
    };
  }, [currentLeagueIndex]); // Re-run when league changes

  return (
    <div ref={mountRef} className="w-full h-full text-transparent" />
  );
};

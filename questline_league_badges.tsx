import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const QuestLineLeagueBadges = () => {
  const mountRef = useRef(null);
  const [currentLeague, setCurrentLeague] = useState(0);
  const sceneRef = useRef(null);
  const badgeRef = useRef(null);
  const isDraggingRef = useRef(false);
  const previousMousePosition = useRef({ x: 0 });
  const rotationVelocity = useRef(0);

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

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f0f0f);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      45,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0.8, 7);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    mountRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
    mainLight.position.set(6, 8, 6);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    scene.add(mainLight);

    const keyLight = new THREE.SpotLight(0xffffff, 1.2);
    keyLight.position.set(-5, 5, 5);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const fillLight = new THREE.PointLight(0x4080ff, 0.6);
    fillLight.position.set(-4, 2, 4);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(0xffa040, 0.8);
    rimLight.position.set(4, -3, -4);
    scene.add(rimLight);

    const topLight = new THREE.DirectionalLight(0xffffff, 0.5);
    topLight.position.set(0, 10, 0);
    scene.add(topLight);

    const createMetalMaterial = (color, metalness = 0.9, roughness = 0.2, emissive = 0x000000, emissiveIntensity = 0) => {
      return new THREE.MeshStandardMaterial({
        color: color,
        metalness: metalness,
        roughness: roughness,
        emissive: emissive,
        emissiveIntensity: emissiveIntensity,
        envMapIntensity: 1.5
      });
    };

    const createCrystalMaterial = (color, emissiveIntensity = 0.4) => {
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

    const createBadge = (leagueIndex) => {
      const group = new THREE.Group();
      const league = leagues[leagueIndex];

      switch(leagueIndex) {
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
          break;
        }

        case 8: { // LEGEND - Enhanced with evil patterns on orb
          // Dark void sphere with evil patterns
          const coreGeo = new THREE.SphereGeometry(1.7, 64, 64);
          const core = new THREE.Mesh(coreGeo, createMetalMaterial(0x0a0015, 0.8, 0.3, league.primary, 0.7));
          core.castShadow = true;
          group.add(core);

          // Evil pattern rings on the sphere
          for (let i = 0; i < 6; i++) {
            const ringGeo = new THREE.TorusGeometry(1.72 + i * 0.02, 0.03, 8, 32);
            const yPos = -0.8 + i * 0.32;
            const ring = new THREE.Mesh(ringGeo, createMetalMaterial(league.accent, 0.9, 0.2, league.primary, 0.9));
            ring.position.y = yPos;
            ring.rotation.x = Math.PI / 2;
            ring.castShadow = true;
            group.add(ring);
          }

          // Vertical evil patterns
          for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const patternGeo = new THREE.TorusGeometry(1.73, 0.03, 8, 32);
            const pattern = new THREE.Mesh(patternGeo, createMetalMaterial(league.primary, 0.85, 0.25, league.accent, 0.85));
            pattern.position.set(Math.cos(angle) * 0.3, Math.sin(angle) * 0.3, 0);
            pattern.rotation.y = angle;
            pattern.castShadow = true;
            group.add(pattern);
          }

          // Cosmic armor plates
          for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const isLarge = i % 3 === 0;
            
            const plateGeo = new THREE.BoxGeometry(isLarge ? 0.8 : 0.5, isLarge ? 1.2 : 0.8, 0.25);
            const plate = new THREE.Mesh(plateGeo, createMetalMaterial(league.secondary, 0.85, 0.25, league.primary, 0.6));
            plate.position.set(Math.cos(angle) * 2.1, Math.sin(angle) * 2.1, 0.15);
            plate.rotation.z = -angle + Math.PI / 2;
            plate.castShadow = true;
            group.add(plate);
          }

          // Void spikes
          for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const spikeGeo = new THREE.ConeGeometry(0.25, 2.0, 6);
            const spike = new THREE.Mesh(spikeGeo, createMetalMaterial(league.primary, 0.75, 0.3, league.accent, 0.8));
            spike.position.set(Math.cos(angle) * 2.4, Math.sin(angle) * 2.4, 0.5);
            spike.rotation.z = -angle + Math.PI / 2;
            spike.castShadow = true;
            group.add(spike);
          }

          // Nebula rings
          for (let i = 0; i < 3; i++) {
            const ringGeo = new THREE.TorusGeometry(2.5 + i * 0.35, 0.12, 12, 32);
            const ring = new THREE.Mesh(ringGeo, createMetalMaterial(league.accent, 0.7, 0.35, league.primary, 0.6 - i * 0.15));
            ring.position.z = -i * 0.12;
            ring.castShadow = true;
            group.add(ring);
          }

          // Evil void eye at center
          const voidGeo = new THREE.SphereGeometry(0.75, 32, 32);
          const void_ = new THREE.Mesh(voidGeo, createMetalMaterial(0x8B00FF, 0.95, 0.15, 0xFF00FF, 1.0));
          void_.position.z = 0.4;
          void_.castShadow = true;
          group.add(void_);
          group.userData.void = void_;
          break;
        }

        case 9: { // IMMORTAL - Supreme redesign with gradients
          // Multi-layered divine throne with gradient effect
          const layers = [
            { radius1: 1.9, radius2: 2.1, height: 0.7, color: 0xFFD700, emissive: 0xFFAA00, intensity: 0.7, z: 0 },
            { radius1: 1.7, radius2: 1.9, height: 0.65, color: 0xFFE55C, emissive: 0xFFDD00, intensity: 0.75, z: 0.08 },
            { radius1: 1.5, radius2: 1.7, height: 0.6, color: 0xFFF8DC, emissive: 0xFFEE88, intensity: 0.8, z: 0.15 }
          ];

          layers.forEach(layer => {
            const layerGeo = new THREE.CylinderGeometry(layer.radius1, layer.radius2, layer.height, 12);
            layerGeo.rotateX(Math.PI / 2);
            const layerMesh = new THREE.Mesh(layerGeo, createMetalMaterial(layer.color, 1.0, 0.1, layer.emissive, layer.intensity));
            layerMesh.position.z = layer.z;
            layerMesh.castShadow = true;
            group.add(layerMesh);
          });

          // Divine halos with gradient colors
          const haloColors = [
            { color: 0xFFD700, emissive: 0xFFAA00, radius: 2.0, width: 0.18, z: 0.25 },
            { color: 0xFFE55C, emissive: 0xFFDD00, radius: 2.45, width: 0.16, z: 0.18 },
            { color: 0xFFF8DC, emissive: 0xFFEE88, radius: 2.85, width: 0.14, z: 0.1 }
          ];

          haloColors.forEach(halo => {
            const ringGeo = new THREE.TorusGeometry(halo.radius, halo.width, 16, 32);
            const ring = new THREE.Mesh(ringGeo, createMetalMaterial(halo.color, 1.0, 0.12, halo.emissive, 0.9));
            ring.position.z = halo.z;
            ring.castShadow = true;
            group.add(ring);
          });

          // Supreme divine wings (8 directions)
          for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            
            // Main wing blade (smooth gradient shape)
            const wingGeo = new THREE.BoxGeometry(0.5, 2.2, 0.15);
            const wingColor = i % 2 === 0 ? 0xFFFFFF : 0xFFE55C;
            const wing = new THREE.Mesh(wingGeo, createMetalMaterial(wingColor, 0.95, 0.1, 0xFFD700, 0.8));
            wing.position.set(Math.cos(angle) * 2.4, Math.sin(angle) * 2.4, 0.7);
            wing.rotation.z = -angle + Math.PI / 2;
            wing.castShadow = true;
            group.add(wing);

            // Inner divine blade
            const innerGeo = new THREE.BoxGeometry(0.35, 1.8, 0.12);
            const inner = new THREE.Mesh(innerGeo, createMetalMaterial(0xFFD700, 1.0, 0.08, 0xFFAA00, 0.9));
            inner.position.set(Math.cos(angle) * 2.4, Math.sin(angle) * 2.4, 0.75);
            inner.rotation.z = -angle + Math.PI / 2;
            inner.castShadow = true;
            group.add(inner);

            // Flame tips with gradient
            const flameGeo = new THREE.ConeGeometry(0.25, 0.9, 6);
            const flameColor = i % 3 === 0 ? 0xFF8C00 : (i % 3 === 1 ? 0xFFAA00 : 0xFFDD00);
            const flame = new THREE.Mesh(flameGeo, createMetalMaterial(flameColor, 0.8, 0.15, 0xFF4500, 1.0));
            flame.position.set(Math.cos(angle) * 2.4, Math.sin(angle) * 2.4, 1.5);
            flame.rotation.z = -angle + Math.PI / 2;
            flame.castShadow = true;
            group.add(flame);
          }

          // Central radiant core with smooth gradient
          const coreGeo = new THREE.SphereGeometry(0.9, 64, 64);
          const core = new THREE.Mesh(coreGeo, createMetalMaterial(0xFFFAF0, 1.0, 0.02, 0xFFFFFF, 1.3));
          core.position.z = 0.65;
          core.castShadow = true;
          group.add(core);

          // Inner radiant sphere
          const innerCoreGeo = new THREE.SphereGeometry(0.6, 32, 32);
          const innerCore = new THREE.Mesh(innerCoreGeo, createMetalMaterial(0xFFD700, 1.0, 0.05, 0xFFEE88, 1.4));
          innerCore.position.z = 0.65;
          innerCore.castShadow = true;
          group.add(innerCore);

          // Divine energy particles
          const particleCount = 60;
          const particleGeo = new THREE.BufferGeometry();
          const particlePos = new Float32Array(particleCount * 3);
          for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = 3.0 + Math.random() * 1.0;
            particlePos[i * 3] = Math.cos(angle) * radius;
            particlePos[i * 3 + 1] = Math.sin(angle) * radius;
            particlePos[i * 3 + 2] = (Math.random() - 0.3) * 2.0;
          }
          particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
          const particleMat = new THREE.PointsMaterial({
            color: 0xFFFFAA,
            size: 0.15,
            transparent: true,
            opacity: 0.9,
            blending: THREE.AdditiveBlending
          });
          const particles = new THREE.Points(particleGeo, particleMat);
          group.add(particles);
          group.userData.particles = particles;
          break;
        }
      }

      group.rotation.x = -0.3;
      return group;
    };

    const badge = createBadge(currentLeague);
    scene.add(badge);
    badgeRef.current = badge;

    const handleMouseDown = (e) => {
      isDraggingRef.current = true;
      previousMousePosition.current = { x: e.clientX };
    };

    const handleMouseMove = (e) => {
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

    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
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
        if (currentLeague === 8 && badgeRef.current.userData.void) {
          const pulse = Math.sin(time * 2.5) * 0.3 + 0.7;
          badgeRef.current.userData.void.material.emissiveIntensity = pulse * 1.2;
        }

        // Immortal particle rotation
        if (currentLeague === 9 && badgeRef.current.userData.particles) {
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

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('mousedown', handleMouseDown);
      renderer.domElement.removeEventListener('mousemove', handleMouseMove);
      renderer.domElement.removeEventListener('mouseup', handleMouseUp);
      renderer.domElement.removeEventListener('mouseleave', handleMouseUp);
      if (mountRef.current && renderer.domElement.parentNode === mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [currentLeague]);

  return (
    <div className="w-full h-screen bg-gray-900 flex flex-col">
      <div ref={mountRef} className="flex-1 w-full" />
      
      <div className="bg-gray-800 p-6 border-t border-gray-700">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-2 text-center">
            {leagues[currentLeague].name} League
          </h2>
          <p className="text-gray-400 text-center mb-6">
            {leagues[currentLeague].theme} • Drag to spin • Elite RPG badge design
          </p>
          
          <div className="grid grid-cols-5 gap-3">
            {leagues.map((league, index) => (
              <button
                key={index}
                onClick={() => setCurrentLeague(index)}
                className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                  currentLeague === index
                    ? 'bg-blue-600 text-white shadow-lg scale-105'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {league.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestLineLeagueBadges;
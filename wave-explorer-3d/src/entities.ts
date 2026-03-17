
import * as THREE from 'three';
import { WaveComponent } from './definitions';

// ==================== WAVE SURFACE ====================
export function createWaveSurface(): THREE.Group {
  const group = new THREE.Group();

  // Ground plane
  const groundGeo = new THREE.PlaneGeometry(80, 60, 1, 1);
  const groundMat = new THREE.MeshLambertMaterial({ 
    color: 0x0a1428,
    side: THREE.DoubleSide 
  });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -1.5;
  ground.receiveShadow = true;
  group.add(ground);

  // Grid lines on ground
  const gridHelper = new THREE.GridHelper(80, 20, 0x1a2840, 0x0f1e30);
  gridHelper.position.y = -1.49;
  group.add(gridHelper);

  return group;
}

// ==================== WAVE MESH ====================
export function createWaveMesh(): { mesh: THREE.Mesh; update: (t: number) => void } {
  const waveWidth = 32;
  const waveSegments = 128;
  const geo = new THREE.PlaneGeometry(waveWidth, 6, waveSegments, 1);
  geo.rotateX(-Math.PI / 2);

  const mat = new THREE.MeshPhongMaterial({
    color: 0x00ccff,
    emissive: 0x002244,
    transparent: true,
    opacity: 0.85,
    side: THREE.DoubleSide,
    shininess: 80,
    wireframe: false,
  });

  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(0, 0, -5);
  mesh.receiveShadow = true;
  mesh.castShadow = false;

  // Glow underlay
  const glowGeo = new THREE.PlaneGeometry(waveWidth, 6, 1, 1);
  glowGeo.rotateX(-Math.PI / 2);
  const glowMat = new THREE.MeshBasicMaterial({
    color: 0x0088ff,
    transparent: true,
    opacity: 0.15,
    side: THREE.DoubleSide,
  });
  const glow = new THREE.Mesh(glowGeo, glowMat);
  glow.position.y = -0.05;
  mesh.add(glow);

  const amplitude = 1.4;
  const frequency = 1.0;

  function update(t: number) {
    const positions = geo.attributes.position as THREE.BufferAttribute;
    const count = positions.count;
    for (let i = 0; i < count; i++) {
      const x = positions.getX(i);
      const y = amplitude * Math.sin(2 * Math.PI * frequency * (x / 8 - t * 0.4));
      positions.setY(i, y);
    }
    positions.needsUpdate = true;
    geo.computeVertexNormals();
  }

  return { mesh, update };
}

// ==================== STATIC WAVE LINE ====================
export function createStaticWaveLine(): THREE.Group {
  const group = new THREE.Group();
  const amplitude = 1.4;
  const points: THREE.Vector3[] = [];
  const segments = 200;
  const waveWidth = 32;

  for (let i = 0; i <= segments; i++) {
    const x = (i / segments) * waveWidth - waveWidth / 2;
    const y = amplitude * Math.sin(2 * Math.PI * (x / 8));
    points.push(new THREE.Vector3(x, y, 0));
  }

  const curve = new THREE.CatmullRomCurve3(points);
  const tubeGeo = new THREE.TubeGeometry(curve, 200, 0.04, 6, false);
  const tubeMat = new THREE.MeshBasicMaterial({ color: 0x00ffcc });
  const tube = new THREE.Mesh(tubeGeo, tubeMat);
  group.add(tube);

  // Equilibrium line
  const eqPoints = [
    new THREE.Vector3(-waveWidth / 2, 0, 0),
    new THREE.Vector3(waveWidth / 2, 0, 0)
  ];
  const eqGeo = new THREE.BufferGeometry().setFromPoints(eqPoints);
  const eqMat = new THREE.LineBasicMaterial({ color: 0x446688, transparent: true, opacity: 0.6 });
  const eqLine = new THREE.Line(eqGeo, eqMat);
  group.add(eqLine);

  group.position.set(0, 0, -5);
  return group;
}

// ==================== MARKER ====================
export function createMarker(component: WaveComponent, amplitude: number = 1.4): THREE.Group {
  const group = new THREE.Group();
  const col = component.color;

  // Pole
  const poleGeo = new THREE.CylinderGeometry(0.04, 0.04, 3.5, 8);
  const poleMat = new THREE.MeshPhongMaterial({ color: col, emissive: col, emissiveIntensity: 0.3 });
  const pole = new THREE.Mesh(poleGeo, poleMat);
  pole.position.y = 1.75;
  group.add(pole);

  // Top orb
  const orbGeo = new THREE.SphereGeometry(0.22, 16, 16);
  const orbMat = new THREE.MeshPhongMaterial({ 
    color: col, emissive: col, emissiveIntensity: 0.6,
    transparent: true, opacity: 0.9
  });
  const orb = new THREE.Mesh(orbGeo, orbMat);
  orb.position.y = 3.6;
  group.add(orb);

  // Ring pulse
  const ringGeo = new THREE.TorusGeometry(0.4, 0.04, 8, 32);
  const ringMat = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.6 });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.position.y = 3.6;
  group.add(ring);

  // Question mark sprite above
  const questionSprite = createTextSprite('?', col, 72);
  questionSprite.position.y = 4.5;
  group.add(questionSprite);

  // Name label
  const nameSprite = createTextSprite(component.nameTh, col, 36);
  nameSprite.position.y = 5.2;
  nameSprite.scale.set(3.5, 1.2, 1);
  group.add(nameSprite);

  // Point light
  const light = new THREE.PointLight(col, 0.8, 5);
  light.position.y = 3.6;
  group.add(light);

  // Animate
  let t = 0;
  (group as any).animateMarker = (dt: number) => {
    t += dt;
    orb.position.y = 3.6 + Math.sin(t * 2) * 0.15;
    ring.scale.set(1 + Math.sin(t * 3) * 0.2, 1 + Math.sin(t * 3) * 0.2, 1);
    ring.material.opacity = 0.3 + Math.sin(t * 3) * 0.3;
    light.intensity = 0.6 + Math.sin(t * 2) * 0.4;
  };

  (group as any).markAsFound = () => {
    // Replace ? with checkmark
    group.remove(questionSprite);
    const checkSprite = createTextSprite('✓', 0x00ff88, 72);
    checkSprite.position.y = 4.5;
    group.add(checkSprite);
    orbMat.color.set(0x00ff88);
    orbMat.emissive.set(0x00ff88);
    poleMat.color.set(0x00ff88);
  };

  return group;
}

export function createTextSprite(text: string, color: number, fontSize: number = 48): THREE.Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  
  ctx.clearRect(0, 0, 256, 128);
  
  const hex = '#' + color.toString(16).padStart(6, '0');
  ctx.fillStyle = hex;
  ctx.font = `bold ${fontSize}px Kanit, Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Shadow
  ctx.shadowColor = 'rgba(0,0,0,0.8)';
  ctx.shadowBlur = 8;
  ctx.fillText(text, 128, 64);
  
  const tex = new THREE.CanvasTexture(canvas);
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(2.5, 1.2, 1);
  return sprite;
}

// ==================== PLAYER ====================
export function createPlayer(): THREE.Group {
  const group = new THREE.Group();

  // Body
  const bodyGeo = new THREE.CapsuleGeometry(0.3, 0.7, 6, 12);
  const bodyMat = new THREE.MeshPhongMaterial({ 
    color: 0x00ffcc, 
    emissive: 0x004433,
    shininess: 60
  });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 0.85;
  body.castShadow = true;
  group.add(body);

  // Head
  const headGeo = new THREE.SphereGeometry(0.25, 12, 12);
  const headMat = new THREE.MeshPhongMaterial({ color: 0xffddbb, shininess: 40 });
  const head = new THREE.Mesh(headGeo, headMat);
  head.position.y = 1.6;
  head.castShadow = true;
  group.add(head);

  // Eyes
  const eyeGeo = new THREE.SphereGeometry(0.06, 8, 8);
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x000044 });
  const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
  eyeL.position.set(-0.1, 1.65, 0.22);
  group.add(eyeL);
  const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
  eyeR.position.set(0.1, 1.65, 0.22);
  group.add(eyeR);

  // Backpack (player identification)
  const packGeo = new THREE.BoxGeometry(0.35, 0.45, 0.15);
  const packMat = new THREE.MeshPhongMaterial({ color: 0x7c3aed });
  const pack = new THREE.Mesh(packGeo, packMat);
  pack.position.set(0, 0.9, -0.3);
  group.add(pack);

  // Player shadow
  const shadowGeo = new THREE.CircleGeometry(0.3, 12);
  const shadowMat = new THREE.MeshBasicMaterial({ 
    color: 0x000000, transparent: true, opacity: 0.4,
    depthWrite: false
  });
  const shadow = new THREE.Mesh(shadowGeo, shadowMat);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -0.02;
  group.add(shadow);

  // Walk animation
  let walkT = 0;
  let legAngle = 0;
  (group as any).animateWalk = (isMoving: boolean, dt: number) => {
    if (isMoving) {
      walkT += dt * 8;
      legAngle = Math.sin(walkT) * 0.25;
      body.rotation.z = Math.sin(walkT * 0.5) * 0.03;
      body.position.y = 0.85 + Math.abs(Math.sin(walkT)) * 0.05;
    } else {
      walkT = 0;
      body.rotation.z *= 0.8;
      body.position.y += (0.85 - body.position.y) * 0.2;
    }
  };

  return group;
}

// ==================== ENVIRONMENT ====================
export function createEnvironment(): THREE.Group {
  const group = new THREE.Group();

  // Floating islands / platforms
  const platformPositions = [
    { x: -15, z: 8 }, { x: 15, z: 8 }, { x: 0, z: 12 },
    { x: -18, z: -12 }, { x: 18, z: -12 }
  ];
  platformPositions.forEach((pos, i) => {
    const plat = createFloatingPlatform(i % 3);
    plat.position.set(pos.x, -0.8, pos.z);
    group.add(plat);
  });

  // Decorative pillars
  const pillarPositions = [
    { x: -20, z: 0 }, { x: 20, z: 0 },
    { x: -10, z: 10 }, { x: 10, z: 10 },
  ];
  pillarPositions.forEach(pos => {
    const pillar = createPillar();
    pillar.position.set(pos.x, 0, pos.z);
    group.add(pillar);
  });

  // Boundary walls (invisible)
  // Stars / particles
  const starGroup = createStarField();
  group.add(starGroup);

  return group;
}

function createFloatingPlatform(variant: number): THREE.Mesh {
  const colors = [0x1a3a6a, 0x1a4a2a, 0x3a1a4a];
  const geo = new THREE.CylinderGeometry(1.5, 1.8, 0.4, 8);
  const mat = new THREE.MeshPhongMaterial({ 
    color: colors[variant],
    emissive: colors[variant],
    emissiveIntensity: 0.1
  });
  return new THREE.Mesh(geo, mat);
}

function createPillar(): THREE.Group {
  const group = new THREE.Group();
  const geo = new THREE.CylinderGeometry(0.2, 0.3, 4, 8);
  const mat = new THREE.MeshPhongMaterial({ color: 0x1a2840, emissive: 0x0a1420, shininess: 30 });
  const pillar = new THREE.Mesh(geo, mat);
  pillar.position.y = 2;
  group.add(pillar);

  // Top crystal
  const crystalGeo = new THREE.OctahedronGeometry(0.3);
  const crystalMat = new THREE.MeshPhongMaterial({ 
    color: 0x00ffcc, emissive: 0x004433, transparent: true, opacity: 0.8 
  });
  const crystal = new THREE.Mesh(crystalGeo, crystalMat);
  crystal.position.y = 4.3;
  group.add(crystal);
  (group as any).crystal = crystal;

  return group;
}

function createStarField(): THREE.Points {
  const count = 300;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 120;
    positions[i * 3 + 1] = 10 + Math.random() * 30;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 120;
    
    const brightness = 0.4 + Math.random() * 0.6;
    colors[i * 3] = brightness * 0.7;
    colors[i * 3 + 1] = brightness * 0.9;
    colors[i * 3 + 2] = brightness;
  }
  
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  
  const mat = new THREE.PointsMaterial({ 
    size: 0.15, vertexColors: true, 
    transparent: true, opacity: 0.8,
    sizeAttenuation: true
  });
  
  return new THREE.Points(geo, mat);
}

// ==================== WAVE ARROWS ====================
export function createWaveAnnotations(): THREE.Group {
  const group = new THREE.Group();
  const amplitude = 1.4;
  const waveZ = -5;

  // Amplitude arrow
  const ampArrow = createArrow(0xffdd00, 0.05, amplitude, true);
  ampArrow.position.set(-12, 0, waveZ);
  group.add(ampArrow);

  // Wavelength arrow
  const wlArrow = createArrow(0xff8800, 8, 0.05, false);
  wlArrow.position.set(-4, amplitude + 0.3, waveZ);
  group.add(wlArrow);

  return group;
}

function createArrow(color: number, width: number, height: number, vertical: boolean): THREE.Group {
  const g = new THREE.Group();
  const mat = new THREE.MeshBasicMaterial({ color });

  if (vertical) {
    const lineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, height, 0)
    ]);
    g.add(new THREE.Line(lineGeo, new THREE.LineBasicMaterial({ color, linewidth: 2 })));
  } else {
    const lineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(width, 0, 0)
    ]);
    g.add(new THREE.Line(lineGeo, new THREE.LineBasicMaterial({ color, linewidth: 2 })));
  }
  return g;
}

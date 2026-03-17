
import * as THREE from 'three';
import { WAVE_COMPONENTS, GameState, PlayerData } from './definitions';
import {
  createWaveSurface, createWaveMesh, createStaticWaveLine,
  createMarker, createPlayer, createEnvironment, createWaveAnnotations
} from './entities';
import {
  showScreen, updateHUD, showInteractionPrompt,
  updateCollectedList, showQuiz, showInfoPanel, initInfoClose
} from './ui';
import { clamp, distance2D, lerp } from './utils';

interface JoystickState {
  active: boolean;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  dx: number;
  dy: number;
  touchId: number | null;
}

interface CameraState {
  yaw: number;
  pitch: number;
  touchStartX: number;
  touchStartY: number;
  touchId: number | null;
}

export class Game {
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private clock: THREE.Clock = new THREE.Clock();

  private player!: THREE.Group;
  private waveMesh!: { mesh: THREE.Mesh; update: (t: number) => void };
  private markers: Map<string, THREE.Group> = new Map();
  private environment!: THREE.Group;

  private state!: GameState;
  private joystick: JoystickState = {
    active: false, startX: 0, startY: 0, currentX: 0, currentY: 0,
    dx: 0, dy: 0, touchId: null
  };
  private camState: CameraState = {
    yaw: 0, pitch: 0.3, touchStartX: 0, touchStartY: 0, touchId: null
  };

  private nearbyComponent: string | null = null;
  private isQuizOpen = false;
  private isInfoOpen = false;
  private playerSpeed = 5;
  private playerPos = { x: 0, y: 0, z: 5 };
  private playerVelocity = { x: 0, z: 0 };
  private isMoving = false;
  private animationId: number = 0;

  constructor() {}

  init(playerData: PlayerData): void {
    this.state = {
      player: playerData,
      score: 0,
      collectedParts: [],
      wrongAnswers: [],
      totalQuestions: 0,
      currentQuizTarget: null,
      isGameRunning: true,
      isComplete: false
    };

    this.setupRenderer();
    this.setupScene();
    this.setupLights();
    this.setupCamera();
    this.buildWorld();
    this.setupControls();
    initInfoClose();
    updateHUD(this.state);
    this.startGameLoop();
  }

  private setupRenderer(): void {
    const canvas = document.getElementById('three-canvas') as HTMLCanvasElement;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;

    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  private setupScene(): void {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x050a1a);
    this.scene.fog = new THREE.FogExp2(0x050a1a, 0.025);
  }

  private setupLights(): void {
    const ambient = new THREE.AmbientLight(0x112233, 1.2);
    this.scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xaaddff, 1.8);
    sun.position.set(10, 20, 10);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 80;
    sun.shadow.camera.left = -30;
    sun.shadow.camera.right = 30;
    sun.shadow.camera.top = 30;
    sun.shadow.camera.bottom = -30;
    this.scene.add(sun);

    // Colored accent lights
    const blueLight = new THREE.PointLight(0x0044ff, 1.5, 25);
    blueLight.position.set(-10, 5, -5);
    this.scene.add(blueLight);

    const cyanLight = new THREE.PointLight(0x00ffcc, 1.0, 20);
    cyanLight.position.set(10, 3, 5);
    this.scene.add(cyanLight);

    const purpleLight = new THREE.PointLight(0x7c3aed, 0.8, 15);
    purpleLight.position.set(0, 8, -10);
    this.scene.add(purpleLight);
  }

  private setupCamera(): void {
    this.camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 150);
    this.updateCameraPosition();
  }

  private buildWorld(): void {
    // Wave surface
    const surface = createWaveSurface();
    this.scene.add(surface);

    // Animated wave mesh
    this.waveMesh = createWaveMesh();
    this.scene.add(this.waveMesh.mesh);

    // Static wave line
    const waveLine = createStaticWaveLine();
    this.scene.add(waveLine);

    // Wave annotations
    const annotations = createWaveAnnotations();
    this.scene.add(annotations);

    // Environment
    this.environment = createEnvironment();
    this.scene.add(this.environment);

    // Markers for each wave component
    WAVE_COMPONENTS.forEach(comp => {
      const marker = createMarker(comp);
      const waveY = 1.4 * Math.sin(2 * Math.PI * comp.position.x / 8);
      marker.position.set(
        comp.position.x,
        comp.position.z === -5 ? waveY + 0.1 : -0.5,
        comp.position.z
      );
      this.scene.add(marker);
      this.markers.set(comp.id, marker);
    });

    // Player
    this.player = createPlayer();
    this.player.position.set(0, 0, 5);
    this.scene.add(this.player);
  }

  private updateCameraPosition(): void {
    const dist = 6;
    const camX = this.playerPos.x + dist * Math.sin(this.camState.yaw) * Math.cos(this.camState.pitch);
    const camY = 2.5 + dist * Math.sin(this.camState.pitch);
    const camZ = this.playerPos.z + dist * Math.cos(this.camState.yaw) * Math.cos(this.camState.pitch);
    this.camera.position.set(camX, camY, camZ);
    this.camera.lookAt(
      this.playerPos.x, 
      this.playerPos.y + 1.2, 
      this.playerPos.z
    );
  }

  // ==================== CONTROLS ====================
  private setupControls(): void {
    this.setupJoystick();
    this.setupCameraTouch();
    this.setupButtons();
    this.setupKeyboard();
  }

  private setupJoystick(): void {
    const container = document.getElementById('joystick-container')!;
    const base = document.getElementById('joystick-base')!;
    const thumb = document.getElementById('joystick-thumb')!;
    const maxRadius = 40;

    const getCenter = () => {
      const rect = base.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    };

    const onStart = (cx: number, cy: number, id: number) => {
      this.joystick.active = true;
      this.joystick.startX = cx;
      this.joystick.startY = cy;
      this.joystick.touchId = id;
    };

    const onMove = (cx: number, cy: number) => {
      if (!this.joystick.active) return;
      const dx = cx - this.joystick.startX;
      const dy = cy - this.joystick.startY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const clamped = Math.min(dist, maxRadius);
      const angle = Math.atan2(dy, dx);
      const nx = Math.cos(angle) * clamped;
      const ny = Math.sin(angle) * clamped;
      
      this.joystick.dx = nx / maxRadius;
      this.joystick.dy = ny / maxRadius;
      
      thumb.style.transform = `translate(${nx}px, ${ny}px)`;
    };

    const onEnd = () => {
      this.joystick.active = false;
      this.joystick.dx = 0;
      this.joystick.dy = 0;
      this.joystick.touchId = null;
      thumb.style.transform = 'translate(0px, 0px)';
    };

    container.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const t = e.changedTouches[0];
      onStart(t.clientX, t.clientY, t.identifier);
    }, { passive: false });

    document.addEventListener('touchmove', (e) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        if (t.identifier === this.joystick.touchId) {
          e.preventDefault();
          onMove(t.clientX, t.clientY);
        }
      }
    }, { passive: false });

    document.addEventListener('touchend', (e) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === this.joystick.touchId) onEnd();
      }
    });
  }

  private setupCameraTouch(): void {
    const rightHalf = document.getElementById('game-hud')!;
    
    rightHalf.addEventListener('touchstart', (e) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        if (t.clientX > window.innerWidth * 0.35 && this.camState.touchId === null) {
          // Check if not touching buttons
          const target = e.target as HTMLElement;
          if (target.closest('#controls-right') || target.closest('#quiz-panel') || 
              target.closest('#info-panel')) continue;
          this.camState.touchId = t.identifier;
          this.camState.touchStartX = t.clientX;
          this.camState.touchStartY = t.clientY;
          break;
        }
      }
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        if (t.identifier === this.camState.touchId) {
          const dx = t.clientX - this.camState.touchStartX;
          const dy = t.clientY - this.camState.touchStartY;
          this.camState.yaw -= dx * 0.004;
          this.camState.pitch = clamp(this.camState.pitch - dy * 0.003, 0.05, 1.0);
          this.camState.touchStartX = t.clientX;
          this.camState.touchStartY = t.clientY;
        }
      }
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === this.camState.touchId) {
          this.camState.touchId = null;
        }
      }
    });
  }

  private setupButtons(): void {
    const interactBtn = document.getElementById('interact-btn')!;
    const handleInteract = (e?: Event) => {
      if (e) e.preventDefault();
      if (this.nearbyComponent && !this.isQuizOpen && !this.state.collectedParts.includes(this.nearbyComponent)) {
        this.openQuiz(this.nearbyComponent);
      } else if (this.nearbyComponent && this.state.collectedParts.includes(this.nearbyComponent)) {
        showInfoPanel(this.nearbyComponent);
        this.isInfoOpen = true;
      }
    };
    interactBtn.addEventListener('click', handleInteract);
    interactBtn.addEventListener('touchend', (e) => handleInteract(e));

    const jumpBtn = document.getElementById('jump-btn')!;
    jumpBtn.addEventListener('click', () => {});
    jumpBtn.addEventListener('touchend', (e) => e.preventDefault());

    const infoBtn = document.getElementById('info-btn')!;
    const handleInfo = (e?: Event) => {
      if (e) e.preventDefault();
      if (this.nearbyComponent) showInfoPanel(this.nearbyComponent);
      else if (this.state.collectedParts.length > 0) {
        const lastId = this.state.collectedParts[this.state.collectedParts.length - 1];
        showInfoPanel(lastId);
      }
    };
    infoBtn.addEventListener('click', handleInfo);
    infoBtn.addEventListener('touchend', (e) => handleInfo(e));
  }

  private setupKeyboard(): void {
    const keys: Record<string, boolean> = {};
    document.addEventListener('keydown', (e) => {
      keys[e.key] = true;
      if (e.key === 'e' || e.key === 'E') {
        if (this.nearbyComponent && !this.isQuizOpen) this.openQuiz(this.nearbyComponent);
      }
    });
    document.addEventListener('keyup', (e) => { keys[e.key] = false; });

    // Store keys for game loop
    (this as any)._keys = keys;
  }

  // ==================== GAME LOOP ====================
  private startGameLoop(): void {
    const loop = () => {
      this.animationId = requestAnimationFrame(loop);
      const dt = Math.min(this.clock.getDelta(), 0.05);
      this.update(dt);
      this.renderer.render(this.scene, this.camera);
    };
    loop();
  }

  private update(dt: number): void {
    if (!this.state.isGameRunning) return;

    this.updatePlayerMovement(dt);
    this.updateCamera();
    this.updateMarkers(dt);
    this.updateNearbyDetection();
    this.waveMesh.update(this.clock.elapsedTime);
    this.updateEnvironmentAnimations(dt);
  }

  private updatePlayerMovement(dt: number): void {
    const keys = (this as any)._keys as Record<string, boolean> || {};
    
    // Input from joystick
    let inputX = this.joystick.dx;
    let inputZ = this.joystick.dy;

    // Keyboard input
    if (keys['ArrowLeft'] || keys['a'] || keys['A']) inputX -= 1;
    if (keys['ArrowRight'] || keys['d'] || keys['D']) inputX += 1;
    if (keys['ArrowUp'] || keys['w'] || keys['W']) inputZ -= 1;
    if (keys['ArrowDown'] || keys['s'] || keys['S']) inputZ += 1;

    // Normalize
    const len = Math.sqrt(inputX * inputX + inputZ * inputZ);
    if (len > 1) { inputX /= len; inputZ /= len; }

    // Camera-relative movement
    const cosYaw = Math.cos(this.camState.yaw);
    const sinYaw = Math.sin(this.camState.yaw);
    const worldX = inputX * cosYaw + inputZ * sinYaw;
    const worldZ = -inputX * sinYaw + inputZ * cosYaw;

    const speed = this.playerSpeed;
    const friction = 0.1;

    this.playerVelocity.x = lerp(this.playerVelocity.x, worldX * speed, 1 - Math.pow(friction, dt * 60));
    this.playerVelocity.z = lerp(this.playerVelocity.z, worldZ * speed, 1 - Math.pow(friction, dt * 60));

    this.playerPos.x = clamp(this.playerPos.x + this.playerVelocity.x * dt, -25, 25);
    this.playerPos.z = clamp(this.playerPos.z + this.playerVelocity.z * dt, -20, 20);

    // Smooth player mesh position
    this.player.position.x = lerp(this.player.position.x, this.playerPos.x, 0.3);
    this.player.position.z = lerp(this.player.position.z, this.playerPos.z, 0.3);
    this.player.position.y = 0;

    this.isMoving = len > 0.05;

    // Rotate player to face movement direction
    if (this.isMoving) {
      const targetAngle = Math.atan2(worldX, worldZ) + Math.PI;
      const currentAngle = this.player.rotation.y;
      let diff = targetAngle - currentAngle;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      this.player.rotation.y += diff * 0.15;
    }

    (this.player as any).animateWalk?.(this.isMoving, dt);
  }

  private updateCamera(): void {
    this.updateCameraPosition();
  }

  private updateMarkers(dt: number): void {
    this.markers.forEach((marker, id) => {
      (marker as any).animateMarker?.(dt);
    });
  }

  private updateNearbyDetection(): void {
    if (this.isQuizOpen) return;
    
    let closest: string | null = null;
    let closestDist = Infinity;
    const threshold = 3.5;

    WAVE_COMPONENTS.forEach(comp => {
      if (this.state.collectedParts.includes(comp.id)) return;
      const d = distance2D(this.playerPos.x, this.playerPos.z, comp.position.x, comp.position.z);
      if (d < threshold && d < closestDist) {
        closestDist = d;
        closest = comp.id;
      }
    });

    // Also detect already-found ones for info
    if (!closest) {
      WAVE_COMPONENTS.forEach(comp => {
        if (!this.state.collectedParts.includes(comp.id)) return;
        const d = distance2D(this.playerPos.x, this.playerPos.z, comp.position.x, comp.position.z);
        if (d < threshold && d < closestDist) {
          closestDist = d;
          closest = comp.id;
        }
      });
    }

    if (closest !== this.nearbyComponent) {
      this.nearbyComponent = closest;
      if (closest) {
        const comp = WAVE_COMPONENTS.find(c => c.id === closest)!;
        const isCollected = this.state.collectedParts.includes(closest);
        if (isCollected) {
          showInteractionPrompt(true, `${comp.icon} กด ✋ เพื่อดูข้อมูล ${comp.nameTh}`);
        } else {
          showInteractionPrompt(true, `${comp.icon} กด ✋ เพื่อระบุ "${comp.nameTh}"`);
        }
      } else {
        showInteractionPrompt(false);
      }
    }
  }

  private updateEnvironmentAnimations(dt: number): void {
    // Animate crystals on pillars
    const t = this.clock.elapsedTime;
    this.environment.traverse((obj) => {
      if ((obj as any).crystal) {
        (obj as any).crystal.rotation.y += dt * 1.5;
        (obj as any).crystal.position.y = 4.3 + Math.sin(t * 2) * 0.1;
      }
    });
  }

  // ==================== QUIZ FLOW ====================
  private openQuiz(componentId: string): void {
    if (this.isQuizOpen) return;
    this.isQuizOpen = true;
    this.state.currentQuizTarget = componentId;
    showInteractionPrompt(false);

    showQuiz(
      componentId,
      (correct, id) => {
        this.state.totalQuestions++;
        if (correct) {
          this.state.score += 10;
        } else {
          this.state.wrongAnswers.push(id);
        }
        this.state.collectedParts.push(id);
        updateHUD(this.state);
        updateCollectedList(this.state.collectedParts, this.state.wrongAnswers);

        // Mark the 3D marker as found
        const marker = this.markers.get(id);
        if (marker) (marker as any).markAsFound?.();
      },
      () => {
        this.isQuizOpen = false;
        this.state.currentQuizTarget = null;
        
        if (this.state.collectedParts.length >= WAVE_COMPONENTS.length) {
          setTimeout(() => this.completeGame(), 800);
        }
      }
    );
  }

  private completeGame(): void {
    this.state.isGameRunning = false;
    this.state.isComplete = true;
    cancelAnimationFrame(this.animationId);
    
    import('./ui').then(({ showResultScreen, initResultActions }) => {
      showResultScreen(this.state);
      initResultActions(() => this.restart());
    });
  }

  private restart(): void {
    // Clean up
    cancelAnimationFrame(this.animationId);
    this.scene.clear();
    this.markers.clear();
    
    // Show login
    showScreen('login-screen');
  }

  destroy(): void {
    cancelAnimationFrame(this.animationId);
    this.renderer.dispose();
  }
}

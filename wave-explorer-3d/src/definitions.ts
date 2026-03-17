
// Wave component definitions
export interface WaveComponent {
  id: string;
  nameTh: string;
  nameEn: string;
  icon: string;
  color: number;
  description: string;
  formula: string;
  explanation: string;
  position: { x: number; y: number; z: number };
  markerType: 'crest' | 'trough' | 'amplitude' | 'displacement' | 'wavelength' | 'period' | 'frequency' | 'phase';
}

export interface PlayerData {
  firstName: string;
  lastName: string;
  className: string;
  number: string;
}

export interface QuizQuestion {
  componentId: string;
  question: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
}

export interface GameState {
  player: PlayerData;
  score: number;
  collectedParts: string[];
  wrongAnswers: string[];
  totalQuestions: number;
  currentQuizTarget: string | null;
  isGameRunning: boolean;
  isComplete: boolean;
}

export const WAVE_COMPONENTS: WaveComponent[] = [
  {
    id: 'crest',
    nameTh: 'สันคลื่น',
    nameEn: 'Crest',
    icon: '🔴',
    color: 0xff4444,
    description: 'จุดสูงสุดของคลื่น มีการกระจัดสูงสุดในทิศบวก',
    formula: 'y = +A (max)',
    explanation: 'สันคลื่น (Crest) คือจุดที่มีการกระจัดสูงสุด มีค่าเท่ากับแอมพลิจูด (+A) คลื่นที่สมบูรณ์จะมีสันคลื่นหนึ่งลูกต่อหนึ่งความยาวคลื่น',
    position: { x: -8, y: 0, z: -5 },
    markerType: 'crest'
  },
  {
    id: 'trough',
    nameTh: 'ท้องคลื่น',
    nameEn: 'Trough',
    icon: '🔵',
    color: 0x4488ff,
    description: 'จุดต่ำสุดของคลื่น มีการกระจัดต่ำสุดในทิศลบ',
    formula: 'y = -A (min)',
    explanation: 'ท้องคลื่น (Trough) คือจุดที่มีการกระจัดต่ำสุด มีค่าเท่ากับ -A (ลบแอมพลิจูด) อยู่ตรงข้ามกับสันคลื่น',
    position: { x: -4, y: 0, z: -5 },
    markerType: 'trough'
  },
  {
    id: 'amplitude',
    nameTh: 'แอมพลิจูด',
    nameEn: 'Amplitude (A)',
    icon: '🟡',
    color: 0xffdd00,
    description: 'ระยะทางสูงสุดจากแนวสมดุลถึงสันหรือท้องคลื่น',
    formula: 'A = ymax',
    explanation: 'แอมพลิจูด (A) คือระยะห่างสูงสุดจากตำแหน่งสมดุลไปยังสันหรือท้องคลื่น หน่วย: เมตร (m) บอกถึงความเข้มของพลังงานคลื่น',
    position: { x: -6, y: 0, z: 2 },
    markerType: 'amplitude'
  },
  {
    id: 'displacement',
    nameTh: 'การกระจัด',
    nameEn: 'Displacement (y)',
    icon: '🟢',
    color: 0x00ff88,
    description: 'ระยะทางจากแนวสมดุลถึงอนุภาค ณ เวลาใดเวลาหนึ่ง',
    formula: 'y = A sin(ωt + φ)',
    explanation: 'การกระจัด (y) คือระยะห่างของอนุภาคจากตำแหน่งสมดุล ณ เวลาใดๆ มีทั้งขนาดและทิศทาง (เป็นปริมาณเวกเตอร์)',
    position: { x: 0, y: 0, z: 2 },
    markerType: 'displacement'
  },
  {
    id: 'wavelength',
    nameTh: 'ความยาวคลื่น',
    nameEn: 'Wavelength (λ)',
    icon: '🟠',
    color: 0xff8800,
    description: 'ระยะทางระหว่างจุดที่มีเฟสเดียวกันสองจุดที่อยู่ใกล้กันที่สุด',
    formula: 'λ = v/f = vT',
    explanation: 'ความยาวคลื่น (λ) คือระยะทางระหว่างสันคลื่นสองลูกที่อยู่ติดกัน หรือท้องคลื่นสองลูกที่อยู่ติดกัน หน่วย: เมตร (m)',
    position: { x: 4, y: 0, z: -5 },
    markerType: 'wavelength'
  },
  {
    id: 'period',
    nameTh: 'คาบ',
    nameEn: 'Period (T)',
    icon: '🟣',
    color: 0xaa44ff,
    description: 'เวลาที่ใช้ในการสั่นครบหนึ่งรอบ',
    formula: 'T = 1/f (วินาที)',
    explanation: 'คาบ (T) คือเวลาที่อนุภาคใช้ในการสั่นสะเทือนครบหนึ่งรอบสมบูรณ์ หน่วย: วินาที (s) สัมพันธ์กับความถี่โดย T = 1/f',
    position: { x: 8, y: 0, z: 2 },
    markerType: 'period'
  },
  {
    id: 'frequency',
    nameTh: 'ความถี่',
    nameEn: 'Frequency (f)',
    icon: '⚪',
    color: 0xffffff,
    description: 'จำนวนรอบการสั่นต่อหนึ่งวินาที',
    formula: 'f = 1/T (Hz)',
    explanation: 'ความถี่ (f) คือจำนวนครั้งที่อนุภาคสั่นครบรอบใน 1 วินาที หน่วย: เฮิรตซ์ (Hz) ความถี่สูง = คลื่นถี่ มีพลังงานมาก',
    position: { x: 12, y: 0, z: -5 },
    markerType: 'frequency'
  },
  {
    id: 'phase',
    nameTh: 'เฟสของคลื่น',
    nameEn: 'Phase (φ)',
    icon: '🔶',
    color: 0xff6600,
    description: 'ค่าที่บ่งบอกสถานะการสั่นของคลื่น ณ ตำแหน่งและเวลาที่กำหนด',
    formula: 'φ = ωt + φ₀',
    explanation: 'เฟส (φ) บ่งบอกสถานะ (ตำแหน่งและทิศทาง) ของการสั่นในวงจรคลื่น คลื่นเฟสเดียวกันสั่นพร้อมกัน ต่างเฟส 180° สั่นสวนทางกัน',
    position: { x: -12, y: 0, z: 2 },
    markerType: 'phase'
  }
];

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    componentId: 'crest',
    question: '🔴 จุดสีแดงนี้คือส่วนใดของคลื่น?\n(จุดที่อยู่สูงสุดของคลื่น)',
    choices: ['ท้องคลื่น (Trough)', 'สันคลื่น (Crest)', 'แอมพลิจูด (Amplitude)', 'การกระจัด (Displacement)'],
    correctIndex: 1,
    explanation: 'สันคลื่น (Crest) คือจุดสูงสุดของคลื่น มีการกระจัด y = +A (บวกแอมพลิจูด)'
  },
  {
    componentId: 'trough',
    question: '🔵 จุดสีน้ำเงินนี้คือส่วนใดของคลื่น?\n(จุดที่อยู่ต่ำสุดของคลื่น)',
    choices: ['สันคลื่น (Crest)', 'แอมพลิจูด (Amplitude)', 'ท้องคลื่น (Trough)', 'เฟส (Phase)'],
    correctIndex: 2,
    explanation: 'ท้องคลื่น (Trough) คือจุดต่ำสุดของคลื่น มีการกระจัด y = -A (ลบแอมพลิจูด)'
  },
  {
    componentId: 'amplitude',
    question: '🟡 ระยะจากแนวสมดุลถึงจุดสูงสุดของคลื่นคือปริมาณใด?',
    choices: ['ความยาวคลื่น (λ)', 'คาบ (T)', 'แอมพลิจูด (A)', 'ความถี่ (f)'],
    correctIndex: 2,
    explanation: 'แอมพลิจูด (A) คือระยะทางสูงสุดจากแนวสมดุลถึงสันหรือท้องคลื่น บอกถึงพลังงานของคลื่น'
  },
  {
    componentId: 'displacement',
    question: '🟢 ระยะห่างของอนุภาคจากตำแหน่งสมดุล ณ เวลาใดๆ เรียกว่าอะไร?',
    choices: ['การกระจัด (Displacement)', 'แอมพลิจูด (Amplitude)', 'ความยาวคลื่น (λ)', 'คาบ (T)'],
    correctIndex: 0,
    explanation: 'การกระจัด (y) = A sin(ωt + φ) คือระยะห่างจากสมดุล มีทั้งขนาดและทิศทาง เปลี่ยนไปตามเวลา'
  },
  {
    componentId: 'wavelength',
    question: '🟠 ระยะทางระหว่างสันคลื่นสองลูกที่อยู่ติดกันคือปริมาณใด?',
    choices: ['แอมพลิจูด (A)', 'คาบ (T)', 'ความถี่ (f)', 'ความยาวคลื่น (λ)'],
    correctIndex: 3,
    explanation: 'ความยาวคลื่น (λ) คือระยะทางระหว่างจุดที่มีเฟสเดียวกัน สัมพันธ์กับ λ = v/f'
  },
  {
    componentId: 'period',
    question: '🟣 เวลาที่อนุภาคใช้ในการสั่นครบหนึ่งรอบ เรียกว่าอะไร?',
    choices: ['ความถี่ (f)', 'คาบ (T)', 'เฟส (φ)', 'แอมพลิจูด (A)'],
    correctIndex: 1,
    explanation: 'คาบ (T) คือเวลา 1 รอบสมบูรณ์ หน่วย: วินาที (s) และ f = 1/T'
  },
  {
    componentId: 'frequency',
    question: '⚪ จำนวนรอบการสั่นที่เกิดขึ้นในเวลา 1 วินาที คือปริมาณใด?',
    choices: ['คาบ (T)', 'ความยาวคลื่น (λ)', 'ความถี่ (f)', 'เฟส (φ)'],
    correctIndex: 2,
    explanation: 'ความถี่ (f) = 1/T มีหน่วยเป็น Hz (เฮิรตซ์) ความถี่สูง = คลื่นถี่ = พลังงานมาก'
  },
  {
    componentId: 'phase',
    question: '🔶 ค่าที่บ่งบอกสถานะการสั่นของคลื่น (ทั้งตำแหน่งและทิศทาง) ณ เวลาใดๆ คือ?',
    choices: ['แอมพลิจูด (A)', 'ความยาวคลื่น (λ)', 'คาบ (T)', 'เฟส (φ)'],
    correctIndex: 3,
    explanation: 'เฟส (φ = ωt + φ₀) บ่งบอกสถานะการสั่น คลื่น 2 ลูกที่ต่างเฟส 180° จะรวมกันหักล้าง'
  }
];

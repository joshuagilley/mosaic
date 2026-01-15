<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';

const determinant2x2 = (m: number[][]) => m[0][0] * m[1][1] - m[0][1] * m[1][0];

const multiplyMatrixVector = (m: number[][], v: number[]) => [
  m[0][0] * v[0] + m[0][1] * v[1],
  m[1][0] * v[0] + m[1][1] * v[1],
];

const transformPoints = (pts: number[][], m: number[][]) => pts.map(p => multiplyMatrixVector(m, p));

const generateGrid = (size = 20, rangeVal = 4.0) => {
  const points: number[][] = [];
  const step = (2 * rangeVal) / (size - 1);

  for (let i = 0; i < size; i++) {
    const y = -rangeVal + i * step;
    for (let j = 0; j < size; j++) {
      const x = -rangeVal + j * step;
      points.push([x, y]);
    }
  }

  for (let j = 0; j < size; j++) {
    const x = -rangeVal + j * step;
    for (let i = 0; i < size; i++) {
      const y = -rangeVal + i * step;
      points.push([x, y]);
    }
  }

  return points;
};

const eigenDecomposition2x2 = (m: number[][]) => {
  const a = m[0][0];
  const b = m[0][1];
  const c = m[1][0];
  const d = m[1][1];

  const trace = a + d;
  const det = determinant2x2(m);
  const disc = trace * trace - 4 * det;

  const sqrtDisc = Math.sqrt(disc);
  const lambda1 = (trace + sqrtDisc) / 2;
  const lambda2 = (trace - sqrtDisc) / 2;

  const buildVector = (lambda: number) => {
    if (Math.abs(b) > Math.abs(c)) {
      return [b, lambda - a];
    }
    return [lambda - d, c];
  };

  const normalize = (v: number[]) => {
    const norm = Math.hypot(v[0], v[1]) || 1;
    return [v[0] / norm, v[1] / norm];
  };

  return {
    eigenvalues: [lambda1, lambda2],
    eigenvectors: [normalize(buildVector(lambda1)), normalize(buildVector(lambda2))],
  };
};

const canvasRef = ref<HTMLCanvasElement | null>(null);
const matrix = ref([[1, 0], [0, 1]]);
const originalGrid = ref<number[][]>([]);
const transformedGrid = ref<number[][]>([]);
const vector = ref([2, 1]);
const transformedVector = ref([2, 1]);
const eigenvectors = ref<number[][] | null>(null);
const eigenvalues = ref<number[] | null>(null);
const determinant = ref(1);
const showEigen = ref(true);
const showGrid = ref(true);
const showVector = ref(true);
const pcaData = ref<number[][] | null>(null);
const pcaResult = ref<{
  principal_components: number[][];
  explained_variance: number[];
  projected_data: number[][];
  mean: number[];
} | null>(null);
const currentMode = ref('Transform');
const error = ref<string | null>(null);

const updateMatrix = () => {
  try {
    const grid = generateGrid(20, 4.0);
    const transformed = transformPoints(grid, matrix.value);
    originalGrid.value = grid;
    transformedGrid.value = transformed;

    const transformedVec = [
      matrix.value[0][0] * vector.value[0] + matrix.value[0][1] * vector.value[1],
      matrix.value[1][0] * vector.value[0] + matrix.value[1][1] * vector.value[1],
    ];
    transformedVector.value = transformedVec;

    determinant.value = matrix.value[0][0] * matrix.value[1][1] - matrix.value[0][1] * matrix.value[1][0];

    if (showEigen.value) {
      const { eigenvalues: vals, eigenvectors: vecs } = eigenDecomposition2x2(matrix.value);
      eigenvalues.value = vals;
      eigenvectors.value = vecs;
    } else {
      eigenvalues.value = null;
      eigenvectors.value = null;
    }

    error.value = null;
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error';
  }
};

const setupCanvas = () => {
  const canvas = canvasRef.value;
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const width = rect.width || 800;
  const height = rect.height || 800;

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
};

const drawGrid = (
  ctx: CanvasRenderingContext2D,
  points: number[][],
  toCanvas: (x: number, y: number) => { x: number; y: number },
) => {
  const totalPoints = points.length;
  const gridSize = Math.sqrt(totalPoints / 2);

  if (!Number.isInteger(gridSize) || gridSize < 2) {
    points.forEach(point => {
      const p = toCanvas(point[0], point[1]);
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2, 0, 2 * Math.PI);
      ctx.fill();
    });
    return;
  }

  const pointsPerLine = gridSize;
  const horizontalStart = 0;
  const verticalStart = gridSize * gridSize;

  for (let i = 0; i < gridSize; i++) {
    ctx.beginPath();
    let first = true;
    for (let j = 0; j < pointsPerLine; j++) {
      const idx = horizontalStart + i * pointsPerLine + j;
      if (idx < points.length) {
        const p = toCanvas(points[idx][0], points[idx][1]);
        if (first) {
          ctx.moveTo(p.x, p.y);
          first = false;
        } else {
          ctx.lineTo(p.x, p.y);
        }
      }
    }
    ctx.stroke();
  }

  for (let j = 0; j < gridSize; j++) {
    ctx.beginPath();
    let first = true;
    for (let i = 0; i < pointsPerLine; i++) {
      const idx = verticalStart + j * pointsPerLine + i;
      if (idx < points.length) {
        const p = toCanvas(points[idx][0], points[idx][1]);
        if (first) {
          ctx.moveTo(p.x, p.y);
          first = false;
        } else {
          ctx.lineTo(p.x, p.y);
        }
      }
    }
    ctx.stroke();
  }
};

const drawArrow = (ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) => {
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  const angle = Math.atan2(y2 - y1, x2 - x1);
  const arrowLength = 12;
  const arrowAngle = Math.PI / 6;

  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - arrowLength * Math.cos(angle - arrowAngle), y2 - arrowLength * Math.sin(angle - arrowAngle));
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - arrowLength * Math.cos(angle + arrowAngle), y2 - arrowLength * Math.sin(angle + arrowAngle));
  ctx.stroke();
};

const drawEigenvectors = (
  ctx: CanvasRenderingContext2D,
  eigvecs: number[][],
  eigvals: number[],
  toCanvas: (x: number, y: number) => { x: number; y: number },
  width: number,
  height: number,
  centerX: number,
  centerY: number,
) => {
  const length = 3.0;

  for (let i = 0; i < eigvecs.length; i++) {
    const eigenvec = eigvecs[i];
    const eigenval = eigvals[i] ?? 0;

    const scaledLength = length * Math.abs(eigenval);
    const x = eigenvec[0] * scaledLength;
    const y = eigenvec[1] * scaledLength;

    const p = toCanvas(x, y);
    const sign = eigenval >= 0 ? 1 : -1;
    ctx.strokeStyle = sign >= 0 ? '#10b981' : '#f59e0b';
    ctx.lineWidth = 3.5;
    drawArrow(ctx, centerX, centerY, p.x, p.y);

    ctx.fillStyle = sign >= 0 ? '#10b981' : '#f59e0b';
    ctx.font = 'bold 12px sans-serif';
    const label = `λ${i + 1} = ${eigenval.toFixed(2)}`;
    ctx.fillText(label, p.x + 10, p.y - 10);
  }
};

const drawPCA = (
  ctx: CanvasRenderingContext2D,
  toCanvas: (x: number, y: number) => { x: number; y: number },
  _width: number,
  _height: number,
  _centerX: number,
  _centerY: number,
) => {
  if (!pcaData.value || !pcaResult.value) return;

  ctx.fillStyle = '#8b5cf6';
  ctx.beginPath();
  pcaData.value.forEach(point => {
    const p = toCanvas(point[0], point[1]);
    ctx.arc(p.x, p.y, 4, 0, 2 * Math.PI);
    ctx.fill();
  });

  const mean = pcaResult.value.mean;
  const meanP = toCanvas(mean[0], mean[1]);
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.arc(meanP.x, meanP.y, 6, 0, 2 * Math.PI);
  ctx.fill();

  const pc = pcaResult.value.principal_components;
  const length = 2.0;

  for (let i = 0; i < pc.length; i++) {
    const component = pc[i];
    const x = component[0] * length;
    const y = component[1] * length;

    const p1 = toCanvas(mean[0] - x, mean[1] - y);
    const p2 = toCanvas(mean[0] + x, mean[1] + y);

    ctx.strokeStyle = i === 0 ? '#3b82f6' : '#f59e0b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();

    ctx.fillStyle = i === 0 ? '#3b82f6' : '#f59e0b';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText(`PC${i + 1} (${(pcaResult.value.explained_variance[i] * 100).toFixed(1)}%)`, p2.x + 10, p2.y - 10);
  }
};

const draw = () => {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const width = canvas.offsetWidth;
  const height = canvas.offsetHeight;
  const centerX = width / 2;
  const centerY = height / 2;
  const scale = 60;

  const toCanvas = (x: number, y: number) => ({
    x: centerX + x * scale,
    y: centerY - y * scale,
  });

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#f5f7fa';
  ctx.fillRect(0, 0, width, height);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  ctx.strokeStyle = '#cbd5e0';
  ctx.lineWidth = 1.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(0, centerY);
  ctx.lineTo(width, centerY);
  ctx.moveTo(centerX, 0);
  ctx.lineTo(centerX, height);
  ctx.stroke();

  ctx.fillStyle = '#64748b';
  ctx.font = '12px sans-serif';
  ctx.fillText('X', width - 20, centerY - 10);
  ctx.fillText('Y', centerX + 10, 20);

  if (currentMode.value === 'PCA' && pcaData.value && pcaResult.value) {
    drawPCA(ctx, toCanvas, width, height, centerX, centerY);
  } else {
    if (showGrid.value && originalGrid.value.length > 0) {
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1.5;
      drawGrid(ctx, originalGrid.value, toCanvas);
    }

    if (showGrid.value && transformedGrid.value.length > 0) {
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2.5;
      drawGrid(ctx, transformedGrid.value, toCanvas);
    }

    if (showVector.value) {
      const orig = toCanvas(vector.value[0], vector.value[1]);
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2.5;
      drawArrow(ctx, centerX, centerY, orig.x, orig.y);
    }

    if (showVector.value) {
      const trans = toCanvas(transformedVector.value[0], transformedVector.value[1]);
      ctx.strokeStyle = '#64ffda';
      ctx.lineWidth = 3.5;
      drawArrow(ctx, centerX, centerY, trans.x, trans.y);
    }

    if (showEigen.value && eigenvectors.value && eigenvalues.value) {
      drawEigenvectors(ctx, eigenvectors.value, eigenvalues.value, toCanvas, width, height, centerX, centerY);
    }
  }
};

const handleMatrixChange = (row: number, col: number, value: number) => {
  const newMatrix = matrix.value.map(r => [...r]);
  newMatrix[row][col] = value;
  matrix.value = newMatrix;
};

const setMatrixValue = (newMatrix: number[][]) => {
  matrix.value = newMatrix;
};

const generatePCAData = () => {
  const data: number[][] = [];
  const center = [0, 0];
  const numPoints = 100;

  for (let i = 0; i < numPoints; i++) {
    const angle = Math.random() * 2 * Math.PI;
    const radius = Math.random() * 2;
    const x = center[0] + radius * Math.cos(angle) + (Math.random() - 0.5) * 0.5;
    const y = center[1] + radius * Math.sin(angle) + (Math.random() - 0.5) * 0.5;
    data.push([x, y]);
  }

  pcaData.value = data;
};

const computePCA = () => {
  if (!pcaData.value || pcaData.value.length === 0) {
    alert('Please generate sample data first!');
    return;
  }

  const n = pcaData.value.length;
  const mean = pcaData.value.reduce((acc, [x, y]) => [acc[0] + x, acc[1] + y], [0, 0]).map(v => v / n);
  const centered = pcaData.value.map(([x, y]) => [x - mean[0], y - mean[1]]);

  let sxx = 0;
  let syy = 0;
  let sxy = 0;
  centered.forEach(([x, y]) => {
    sxx += x * x;
    syy += y * y;
    sxy += x * y;
  });
  sxx /= n;
  syy /= n;
  sxy /= n;

  const { eigenvalues: vals, eigenvectors: vecs } = eigenDecomposition2x2([
    [sxx, sxy],
    [sxy, syy],
  ]);

  const eigenPairs = vals.map((v, i) => ({ value: v, vec: vecs[i] }));
  const sorted = eigenPairs.sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

  const totalVar = sorted.reduce((acc, p) => acc + (p.value ?? 0), 0) || 1;
  const principal_components = sorted.map(p => p.vec);
  const explained_variance = sorted.map(p => (p.value ?? 0) / totalVar);

  pcaResult.value = {
    principal_components,
    explained_variance,
    projected_data: centered.map(([x, y]) => {
      const [pc1, pc2] = principal_components;
      return [
        pc1 ? x * pc1[0] + y * pc1[1] : 0,
        pc2 ? x * pc2[0] + y * pc2[1] : 0,
      ];
    }),
    mean,
  };
  currentMode.value = 'PCA';
};

const resetMatrix = () => {
  setMatrixValue([[1, 0], [0, 1]]);
  pcaData.value = null;
  pcaResult.value = null;
  currentMode.value = 'Transform';
};

const clearPCA = () => {
  pcaData.value = null;
  pcaResult.value = null;
  currentMode.value = 'Transform';
};

onMounted(() => {
  setupCanvas();
  updateMatrix();
});

watch(
  () => [matrix.value, showEigen.value],
  () => updateMatrix(),
  { deep: true },
);

watch(
  () => [
    originalGrid.value,
    transformedGrid.value,
    transformedVector.value,
    eigenvectors.value,
    eigenvalues.value,
    showEigen.value,
    showGrid.value,
    showVector.value,
    pcaData.value,
    pcaResult.value,
    currentMode.value,
  ],
  () => {
    if (canvasRef.value) {
      draw();
    }
  },
  { deep: true },
);
</script>

<template>
  <div class="min-h-screen bg-[#0a192f] text-[#e6f1ff] p-4 md:p-8">
    <div class="max-w-[1600px] mx-auto">
      <header class="text-center mb-8">
        <NuxtLink to="/data-science" class="text-[#64ffda] hover:underline mb-2 inline-block">
          ← Back to Data Science
        </NuxtLink>
        <h1 class="text-4xl md:text-5xl font-bold mb-2 text-white">Vektor</h1>
        <p class="text-lg md:text-xl text-[#8892b0]">Linear Algebra Playground</p>
      </header>

      <div class="grid grid-cols-1 lg:grid-cols-[1fr_minmax(350px,450px)] gap-5">
        <div class="relative bg-[#f5f7fa] rounded-lg overflow-hidden border border-[#233554] h-[800px]">
          <canvas ref="canvasRef" class="w-full h-full block cursor-crosshair" :style="{ width: '100%', height: '100%' }" />
          <div v-if="error" class="absolute top-4 left-4 bg-red-500 text-white p-3 rounded">
            Error: {{ error }}
          </div>
          <div class="absolute top-2 right-2 bg-[rgba(17,34,64,0.95)] p-4 rounded-lg border border-[#233554] backdrop-blur-sm">
            <div class="mb-2 text-sm">
              <span class="font-semibold text-[#8892b0]">Determinant:</span>
              <span class="ml-2">{{ determinant.toFixed(2) }}</span>
            </div>
            <div class="text-sm">
              <span class="font-semibold text-[#8892b0]">Mode:</span>
              <span class="ml-2">{{ currentMode }}</span>
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-5 overflow-y-auto h-[800px] pr-2">
          <div class="bg-[#112240] p-5 rounded-lg border border-[#233554]">
            <h2 class="text-xl mb-4 text-[#64ffda] font-semibold">Matrix</h2>
            <div class="grid grid-cols-2 gap-2">
              <input
                type="number"
                id="a"
                :value="matrix[0][0]"
                step="0.1"
                class="p-2 border border-[#233554] rounded bg-[#0a192f] text-[#e6f1ff] text-center focus:outline-none focus:border-[#64ffda]"
                @input="handleMatrixChange(0, 0, parseFloat(($event.target as HTMLInputElement).value) || 0)"
              />
              <input
                type="number"
                id="b"
                :value="matrix[0][1]"
                step="0.1"
                class="p-2 border border-[#233554] rounded bg-[#0a192f] text-[#e6f1ff] text-center focus:outline-none focus:border-[#64ffda]"
                @input="handleMatrixChange(0, 1, parseFloat(($event.target as HTMLInputElement).value) || 0)"
              />
              <input
                type="number"
                id="c"
                :value="matrix[1][0]"
                step="0.1"
                class="p-2 border border-[#233554] rounded bg-[#0a192f] text-[#e6f1ff] text-center focus:outline-none focus:border-[#64ffda]"
                @input="handleMatrixChange(1, 0, parseFloat(($event.target as HTMLInputElement).value) || 0)"
              />
              <input
                type="number"
                id="d"
                :value="matrix[1][1]"
                step="0.1"
                class="p-2 border border-[#233554] rounded bg-[#0a192f] text-[#e6f1ff] text-center focus:outline-none focus:border-[#64ffda]"
                @input="handleMatrixChange(1, 1, parseFloat(($event.target as HTMLInputElement).value) || 0)"
              />
            </div>
          </div>

          <div class="bg-[#112240] p-5 rounded-lg border border-[#233554]">
            <h2 class="text-xl mb-4 text-[#64ffda] font-semibold">Presets</h2>
            <div class="grid grid-cols-2 gap-2">
              <button
                class="p-3 border border-[#64ffda] rounded bg-transparent text-[#64ffda] hover:bg-[rgba(100,255,218,0.1)] transition"
                @click="() => {
                  const angle = Math.PI / 4;
                  setMatrixValue([[Math.cos(angle), -Math.sin(angle)], [Math.sin(angle), Math.cos(angle)]]);
                }"
              >
                Rotate
              </button>
              <button
                class="p-3 border border-[#64ffda] rounded bg-transparent text-[#64ffda] hover:bg-[rgba(100,255,218,0.1)] transition"
                @click="setMatrixValue([[1.5, 0], [0, 1.5]])"
              >
                Scale
              </button>
              <button
                class="p-3 border border-[#64ffda] rounded bg-transparent text-[#64ffda] hover:bg-[rgba(100,255,218,0.1)] transition"
                @click="setMatrixValue([[1, 0], [0, -1]])"
              >
                Reflect X
              </button>
              <button
                class="p-3 border border-[#64ffda] rounded bg-transparent text-[#64ffda] hover:bg-[rgba(100,255,218,0.1)] transition"
                @click="setMatrixValue([[-1, 0], [0, 1]])"
              >
                Reflect Y
              </button>
              <button
                class="p-3 border border-[#64ffda] rounded bg-transparent text-[#64ffda] hover:bg-[rgba(100,255,218,0.1)] transition"
                @click="setMatrixValue([[1, 0.5], [0, 1]])"
              >
                Shear
              </button>
              <button
                class="p-3 border border-[#ff6b6b] rounded bg-transparent text-[#ff6b6b] hover:bg-[rgba(255,107,107,0.1)] transition col-span-2"
                @click="resetMatrix"
              >
                Reset
              </button>
            </div>
          </div>

          <div class="bg-[#112240] p-5 rounded-lg border border-[#233554]">
            <h2 class="text-xl mb-4 text-[#64ffda] font-semibold">Visualization</h2>
            <div class="flex flex-col gap-2">
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" v-model="showEigen" class="w-5 h-5 cursor-pointer" />
                <span>Show Eigenvectors</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" v-model="showGrid" class="w-5 h-5 cursor-pointer" />
                <span>Show Grid</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" v-model="showVector" class="w-5 h-5 cursor-pointer" />
                <span>Show Vector</span>
              </label>
            </div>
          </div>

          <div class="bg-[#112240] p-5 rounded-lg border border-[#233554]">
            <h2 class="text-xl mb-4 text-[#64ffda] font-semibold">PCA Mode</h2>
            <div class="flex flex-col gap-2">
              <button
                class="p-3 border border-[#64ffda] rounded bg-transparent text-[#64ffda] hover:bg-[rgba(100,255,218,0.1)] transition"
                @click="generatePCAData"
              >
                Generate Sample Data
              </button>
              <button
                class="p-3 border border-[#64ffda] rounded bg-transparent text-[#64ffda] hover:bg-[rgba(100,255,218,0.1)] transition"
                @click="computePCA"
              >
                Compute PCA
              </button>
              <button
                class="p-3 border border-[#64ffda] rounded bg-transparent text-[#64ffda] hover:bg-[rgba(100,255,218,0.1)] transition"
                @click="clearPCA"
              >
                Clear PCA
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

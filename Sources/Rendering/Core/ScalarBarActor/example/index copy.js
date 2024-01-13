// Load the rendering pieces we want to use (for both WebGL and WebGPU)
import 'vtk.js/Sources/Rendering/Profiles/Geometry';
import vtkActor from 'vtk.js/Sources/Rendering/Core/Actor';
import vtkPlaneSource from 'vtk.js/Sources/Filters/Sources/PlaneSource';
import vtkFullScreenRenderWindow from 'vtk.js/Sources/Rendering/Misc/FullScreenRenderWindow';
import vtkMapper from 'vtk.js/Sources/Rendering/Core/Mapper';
import vtkPolydata from 'vtk.js/Sources/Common/DataModel/PolyData';
import 'vtk.js/Sources/Rendering/Profiles/Glyph'; // vtkGlyph3DMapper
import vtkGlyph3DMapper from 'vtk.js/Sources/Rendering/Core/Glyph3DMapper';
// import { mat4, vec3 } from 'gl-matrix';
import vtkDataArray from 'vtk.js/Sources/Common/Core/DataArray';
import vtkPixelSpaceCallbackMapper from 'vtk.js/Sources/Rendering/Core/PixelSpaceCallbackMapper';
import style from './style.module.css';

let dims = null;
let textCtx = null;
const windowWidth = 400;
const windowHeight = 400;
const bodyElement = document.querySelector('body');
const container = document.createElement('div');
container.classList.add(style.container);
// container.style.width = `${windowWidth}px`;
// container.style.height = `${windowHeight}px`;
bodyElement.appendChild(container);

const textCanvas = document.createElement('canvas');
// textCanvas.setAttribute('width', windowWidth);
// textCanvas.setAttribute('height', windowHeight);
textCanvas.classList.add(style.container, 'textCanvas');
container.appendChild(textCanvas);
textCtx = textCanvas.getContext('2d');
const fullScreenRenderer = vtkFullScreenRenderWindow.newInstance({
  rootContainer: container,
  background: [1, 1, 1],
});
const renderer = fullScreenRenderer.getRenderer();
const renderWindow = fullScreenRenderer.getRenderWindow();
const actor = vtkActor.newInstance();
const mapper = vtkGlyph3DMapper.newInstance();
actor.setMapper(mapper);

const coneSource = vtkPlaneSource.newInstance();
mapper.setInputConnection(coneSource.getOutputPort());
mapper.setOrientationArray('pressure');
mapper.setScalarRange(0.0, 0.1);

const xnum = 0.5;
const ynum = 0.2;
const xstart = 3;
const ystart = 3;
// const y = 1;
const xyStart = [
  xstart,
  ystart,
  0,
  xstart,
  ystart + ynum,
  0,
  xstart + xnum,
  ystart + ynum,
  0,
  xstart + xnum,
  ystart,
  0,
];
const colorsMap = [
  {
    color: [255, 255, 0],
    val: '12',
  },
  {
    color: [0, 255, 0],
    val: '120',
  },
  {
    color: [0, 0, 255],
    val: '120',
  },
  {
    color: [255, 0, 0],
    val: '1200',
  },
];
let cols = [];
let pointsd = [];
let xys = [];
colorsMap.map((it, h) => {
  xys = [...xys, ...xyStart];
  pointsd = [...pointsd, 5]; // 每个格子的总点数
  const n = 4;
  for (let i = 0; i < n; i++) {
    xyStart[i * 3 + 1] += ynum; // x轴不变,y轴递增
    cols = [...cols, ...it.color];
    pointsd = [...pointsd, h * n + i]; // 点的序号
  }
  pointsd = [...pointsd, h * 4]; // 闭合,第一个点
  return it;
});
const act = vtkActor.newInstance();
const mp = vtkMapper.newInstance();
const data = vtkPolydata.newInstance();
data.getPoints().setData(Float32Array.from(xys), 3);
data.getLines().setData(Uint16Array.from([...pointsd]));
data.getPolys().setData(Uint16Array.from([...pointsd]));
// data.getPolys().setData(Float32Array.from(points), 3);

const xyz = data.getPoints().getData();
const rgb = new Uint8Array(xyz.length);
rgb.fill(0);
for (let i = 0; i < xyz.length; i++) {
  rgb[i] += cols[i];
}
const dataArray = vtkDataArray.newInstance({
  numberOfComponents: 3,
  values: rgb,
  name: 'color',
});
data.getPointData().setScalars(dataArray);
mp.setInputData(data);
act.setMapper(mp);
renderer.addActor(act);

// for (let i = 0; i < colorsMap.length; i++) {
//   const item = colorsMap[i];
//   const act = vtkActor.newInstance();
//   const mp = vtkMapper.newInstance();
//   const data = vtkPolydata.newInstance();
//   data.getPoints().setData(Float32Array.from(squarePoints), 3);
//   data.getLines().setData(Uint16Array.from(item.data));
//   // data.getPolys().setData(Uint16Array.from(item.data));
//   mp.setInputData(data);
//   act.setMapper(mp);

//   act.getProperty().setColor(item.color);
//   renderer.addActor(act);

// const plane = vtkPlaneSource.newInstance({ xResolution: 1, yResolution: 10 });
const psMapper = vtkPixelSpaceCallbackMapper.newInstance();
psMapper.setInputData(data);
psMapper.setCallback((coordsList, camera, aspect, depthBuffer) => {
  if (textCtx && windowWidth > 0 && windowHeight > 0) {
    textCtx.clearRect(0, 0, windowWidth, windowHeight);
    const dataPoints = psMapper.getInputData().getPoints();
    coordsList.forEach((xy, idx) => {
      const pdPoint = dataPoints.getPoint(idx);
      console.log(pdPoint);
      // const vc = vec3.fromValues(pdPoint[0], pdPoint[1], pdPoint[2]);
      textCtx.font = '12px serif';
      textCtx.textAlign = 'center';
      textCtx.textBaseline = 'middle';
      textCtx.fillText(`p ${idx}`, xy[0], xy[1]);
    });
  }
});
const textActor = vtkActor.newInstance();
textActor.setMapper(psMapper);
renderer.addActor(textActor);

renderer.resetCamera();
// renderWindow.render();

function resize() {
  dims = container.getBoundingClientRect();
  const w = Math.floor(dims.width);
  const h = Math.floor(dims.height);
  // openglRenderWindow.setSize(windowWidth, windowHeight);
  textCanvas.setAttribute('width', w);
  textCanvas.setAttribute('height', h);
  renderWindow.render();
}
resize();

import 'vtk.js/Sources/favicon';

// Load the rendering pieces we want to use (for both WebGL and WebGPU)
import 'vtk.js/Sources/Rendering/Profiles/Geometry';
import 'vtk.js/Sources/Rendering/Profiles/Molecule'; // for vtkSphereMapper

import vtkActor from 'vtk.js/Sources/Rendering/Core/Actor';
// import vtkConeSource from 'vtk.js/Sources/Filters/Sources/ConeSource';
import vtkMapper from 'vtk.js/Sources/Rendering/Core/Mapper';
// import vtkSphereMapper from 'vtk.js/Sources/Rendering/Core/SphereMapper';
import vtkOpenGLRenderWindow from 'vtk.js/Sources/Rendering/OpenGL/RenderWindow';
import vtkPixelSpaceCallbackMapper from 'vtk.js/Sources/Rendering/Core/PixelSpaceCallbackMapper';
import vtkRenderWindow from 'vtk.js/Sources/Rendering/Core/RenderWindow';
import vtkRenderWindowInteractor from 'vtk.js/Sources/Rendering/Core/RenderWindowInteractor';
import vtkRenderer from 'vtk.js/Sources/Rendering/Core/Renderer';
import vtkInteractorStyleTrackballCamera from 'vtk.js/Sources/Interaction/Style/InteractorStyleTrackballCamera';
import vtkPolydata from 'vtk.js/Sources/Common/DataModel/PolyData';
import vtkDataArray from 'vtk.js/Sources/Common/Core/DataArray';

import style from './style.module.css';

// ----------------------------------------------------------------------------
// Standard rendering code setup
// ----------------------------------------------------------------------------

let textCtx = null;
let dims = null;

const renderWindow = vtkRenderWindow.newInstance();
const renderer = vtkRenderer.newInstance({ background: [1, 1, 1] });
renderWindow.addRenderer(renderer);

// ----------------------------------------------------------------------------
// Simple pipeline ConeSource --> Mapper --> Actor
// ----------------------------------------------------------------------------

// const coneSource = vtkConeSource.newInstance({ height: 1.0 });

const mapper = vtkMapper.newInstance();
// mapper.setInputConnection(coneSource.getOutputPort());

const actor = vtkActor.newInstance();
actor.setMapper(mapper);

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
// const act = vtkActor.newInstance();
// const mp = vtkMapper.newInstance();
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
mapper.setInputData(data);
// act.setMapper(mp);
// renderer.addActor(act);

const psMapper = vtkPixelSpaceCallbackMapper.newInstance();
psMapper.setInputData(data);
// psMapper.setInputConnection(coneSource.getOutputPort());
psMapper.setCallback((coordsList) => {
  if (textCtx && dims) {
    textCtx.clearRect(0, 0, dims.width, dims.height);
    coordsList.forEach((xy, idx) => {
      textCtx.font = '12px serif';
      textCtx.textAlign = 'center';
      textCtx.textBaseline = 'middle';
      textCtx.fillText(`ph ${idx}`, xy[0], dims.height - xy[1]);
    });
  }
});

const textActor = vtkActor.newInstance();
textActor.setMapper(psMapper);

// ----------------------------------------------------------------------------
// Add the actor to the renderer and set the camera based on it
// ----------------------------------------------------------------------------

renderer.addActor(actor);
renderer.addActor(textActor);
renderer.resetCamera();

// ----------------------------------------------------------------------------
// Use OpenGL as the backend to view the all this
// ----------------------------------------------------------------------------

const openglRenderWindow = vtkOpenGLRenderWindow.newInstance();
renderWindow.addView(openglRenderWindow);

// ----------------------------------------------------------------------------
// Create a div section to put this into
// ----------------------------------------------------------------------------

const container = document.createElement('div');
container.classList.add(style.container);
document.querySelector('body').appendChild(container);
openglRenderWindow.setContainer(container);

const textCanvas = document.createElement('canvas');
textCanvas.classList.add(style.container, 'textCanvas');
container.appendChild(textCanvas);

textCtx = textCanvas.getContext('2d');

// ----------------------------------------------------------------------------
// Setup an interactor to handle mouse events
// ----------------------------------------------------------------------------

const interactor = vtkRenderWindowInteractor.newInstance();
interactor.setView(openglRenderWindow);
interactor.initialize();
interactor.bindEvents(container);

interactor.setInteractorStyle(vtkInteractorStyleTrackballCamera.newInstance());

// Handle window resize
function resize() {
  dims = container.getBoundingClientRect();
  openglRenderWindow.setSize(dims.width, dims.height);
  textCanvas.setAttribute('width', dims.width);
  textCanvas.setAttribute('height', dims.height);
  renderWindow.render();
}

window.addEventListener('resize', resize);

resize();

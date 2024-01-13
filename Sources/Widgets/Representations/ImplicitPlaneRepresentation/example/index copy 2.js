import 'vtk.js/Sources/favicon';

// Load the rendering pieces we want to use (for both WebGL and WebGPU)
import 'vtk.js/Sources/Rendering/Profiles/All';
import '@kitware/vtk.js/Rendering/Profiles/Geometry';
import vtk from '@kitware/vtk.js/vtk';
import vtkFullScreenRenderWindow from '@kitware/vtk.js/Rendering/Misc/FullScreenRenderWindow';
import vtkActor from '@kitware/vtk.js/Rendering/Core/Actor';
import vtkMapper from '@kitware/vtk.js/Rendering/Core/Mapper';

import vtkInteractorStyleTrackballCamera from 'vtk.js/Sources/Interaction/Style/InteractorStyleTrackballCamera';
import vtkImplicitPlaneRepresentation from 'vtk.js/Sources/Widgets/Representations/ImplicitPlaneRepresentation';
import vtkPolydata from 'vtk.js/Sources/Common/DataModel/PolyData';

import controlPanel from './controlPanel.html';

// ----------------------------------------------------------------------------
// Standard rendering code setup
// ----------------------------------------------------------------------------

const fullScreenRenderer = vtkFullScreenRenderWindow.newInstance({
  background: [0, 0, 0],
});
const renderer = fullScreenRenderer.getRenderer();
const renderWindow = fullScreenRenderer.getRenderWindow();

const interactor = fullScreenRenderer.getInteractor();
const trackballCamera = vtkInteractorStyleTrackballCamera.newInstance();
interactor.setInteractorStyle(trackballCamera);
interactor.onLeftButtonPress((event) => {
  console.log('onLeftButtonPress', event);
});
interactor.onLeftButtonRelease((event) => {
  console.log('onLeftButtonRelease', event.position);
  // planeActor.SetUserTransform(transform);
});
// ----------------------------------------------------------------------------
// State / Representation
// ----------------------------------------------------------------------------
// 用于表示和交互隐式平面
const representation = vtkImplicitPlaneRepresentation.newInstance();

const state = vtkImplicitPlaneRepresentation.generateState();
representation.setInputData(state);

representation.getActors().forEach(renderer.addActor);

// prettier-ignore
const polydata = vtk({
  vtkClass: 'vtkPolyData',
  points: {
    vtkClass: 'vtkPoints',
    activeScalars: 0,
    dataType: 'Float32Array',
    numberOfComponents: 3,
    values: [
      0, 0, 0,
      0.5, 0, 0,
      0.5, 0.5, 0,
      // 0, 1, 0.25,
    ],
  },
  polys: {
    vtkClass: 'vtkCellArray',
    activeScalars: -1,
    dataType: 'Uint16Array',
    values: [
      3, 0, 1, 2,
      // 3, 0, 2, 3,
    ],
  },
  // pointData: {
  //   vtkClass: 'vtkDataSetAttributes',
  //   activeScalars: 1,
  //   arrays: [{
  //     data: {
  //       vtkClass: 'vtkDataArray',
  //       name: 'pointScalars',
  //       dataType: 'Float32Array',
  //       values: [0, 1, 0, 1],
  //     },
  //   }],
  // },
});

const actor = vtkActor.newInstance();
const mapper = vtkMapper.newInstance();
const data = vtkPolydata.newInstance();
actor.getProperty().setEdgeVisibility(true);
actor.getProperty().setEdgeColor([0.5, 0, 0.6]);
// actor.getProperty().setLineWidth(3);
actor.getProperty().setColor([1, 1, 0]);
const res = 10;
const points = new Float32Array(res * res * 3);
data.getPoints().setData(points, 3);
// console.log(polydata);
mapper.setInputData(polydata);
// mapper.setInputData(data);
actor.setMapper(mapper);
renderer.addActor(actor);

renderer.resetCamera();
renderer.resetCameraClippingRange();
renderWindow.render();

// -----------------------------------------------------------
// UI control handling
// -----------------------------------------------------------

fullScreenRenderer.addController(controlPanel);

function updateValue(e) {
  const value = Number(e.target.value);
  const name = e.currentTarget.dataset.name;
  const index = Number(e.currentTarget.dataset.index);
  const array = state.get(name)[name].slice(); // To make sure state get modified
  array[index] = value;
  console.log(name, array);
  state.set({ [name]: array });
  const came = renderer.getActiveCamera();
  came.setPosition(array[0], array[1], array[2]);
  if (name === 'normal') {
    // const array1 = state.get('origin')[name].slice(); // To make sure state get modified
    // came.setFocalPoint(array1[0], array1[1], array1[2]);
  }
  renderer.resetCamera();
  renderWindow.render();
}

const elems = document.querySelectorAll('.slider');
for (let i = 0; i < elems.length; i++) {
  elems[i].addEventListener('input', updateValue);
}

import 'vtk.js/Sources/favicon';

// Load the rendering pieces we want to use (for both WebGL and WebGPU)
import 'vtk.js/Sources/Rendering/Profiles/All';

import vtkFullScreenRenderWindow from 'vtk.js/Sources/Rendering/Misc/FullScreenRenderWindow';
import vtkInteractorStyleTrackballCamera from 'vtk.js/Sources/Interaction/Style/InteractorStyleTrackballCamera';
import vtkImplicitPlaneRepresentation from 'vtk.js/Sources/Widgets/Representations/ImplicitPlaneRepresentation';

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

const representation = vtkImplicitPlaneRepresentation.newInstance();

const state = vtkImplicitPlaneRepresentation.generateState();
representation.setInputData(state);

representation.getActors().forEach(renderer.addActor);

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
  came.setFocalPoint(0, 0, 0);
  renderer.resetCamera();
  renderWindow.render();
}

const elems = document.querySelectorAll('.slider');
for (let i = 0; i < elems.length; i++) {
  elems[i].addEventListener('input', updateValue);
}

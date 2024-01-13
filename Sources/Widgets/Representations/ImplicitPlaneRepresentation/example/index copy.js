import '@kitware/vtk.js/favicon';

// Load the rendering pieces we want to use (for both WebGL and WebGPU)
import '@kitware/vtk.js/Rendering/Profiles/Geometry';

import vtkFullScreenRenderWindow from '@kitware/vtk.js/Rendering/Misc/FullScreenRenderWindow';
import vtk from '@kitware/vtk.js/vtk';
import vtkActor from '@kitware/vtk.js/Rendering/Core/Actor';
import vtkMapper from '@kitware/vtk.js/Rendering/Core/Mapper';

// ----------------------------------------------------------------------------
// Standard rendering code setup
// ----------------------------------------------------------------------------

const fullScreenRenderer = vtkFullScreenRenderWindow.newInstance({
  background: [0, 0, 0],
});
const renderer = fullScreenRenderer.getRenderer();
const renderWindow = fullScreenRenderer.getRenderWindow();

// ----------------------------------------------------------------------------
// Inline PolyData definition
// ----------------------------------------------------------------------------

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
      1, 0, 0.25,
      1, 1, 0,
      0, 1, 0.25,
    ],
  },
  polys: {
    vtkClass: 'vtkCellArray',
    activeScalars: 1,
    dataType: 'Uint16Array',
    values: [
      3, 0, 1, 2,
      3, 0, 2, 3,
    ],
  },
  pointData: {
    vtkClass: 'vtkDataSetAttributes',
    activeScalars: 1,
    arrays: [{
      data: {
        vtkClass: 'vtkDataArray',
        name: 'pointScalars',
        dataType: 'Float32Array',
        values: [0, 1, 0, 1],
      },
    }],
  },
});

const mapper = vtkMapper.newInstance();
mapper.setInputData(polydata);

const actor = vtkActor.newInstance();
actor.setMapper(mapper);

renderer.addActor(actor);
renderer.resetCamera();
renderWindow.render();

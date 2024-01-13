import 'vtk.js/Sources/favicon';

// Load the rendering pieces we want to use (for both WebGL and WebGPU)
import 'vtk.js/Sources/Rendering/Profiles/Geometry';

import vtkFullScreenRenderWindow from 'vtk.js/Sources/Rendering/Misc/FullScreenRenderWindow';
import vtk from 'vtk.js/Sources/vtk';
import vtkActor from 'vtk.js/Sources/Rendering/Core/Actor';
import vtkMapper from 'vtk.js/Sources/Rendering/Core/Mapper';

const fullScreenRenderer = vtkFullScreenRenderWindow.newInstance({
  background: [0, 0, 0],
});
const renderer = fullScreenRenderer.getRenderer();
const renderWindow = fullScreenRenderer.getRenderWindow();

// ----------------------------------------------------------------------------
// Inline PolyData definition
// ----------------------------------------------------------------------------

// prettier-ignore
// const min = 0;
// const max = 1;
const offsetX = 1;
const offsetY = 1;
const polydata = vtk({
  vtkClass: 'vtkPolyData',
  points: {
    vtkClass: 'vtkPoints',
    dataType: 'Float32Array',
    numberOfComponents: 3,
    // size: 27,
    values: [
      offsetX,
      offsetY,
      0,
      offsetX + 0.25,
      offsetY,
      0,
      offsetX + 0.25,
      offsetY + 1,
      0,
      offsetX,
      offsetY + 1,
      0,
      offsetX,
      offsetY + 1,
      0,
      offsetX + 0.25,
      offsetY + 1,
      0,
      offsetX + 0.25,
      offsetY + 2,
      0,
      offsetX,
      offsetY + 2,
      0,
    ],
  },
  polys: {
    vtkClass: 'vtkCellArray',
    dataType: 'Uint16Array',
    values: [4, 0, 1, 2, 3, 4, 4, 5, 6, 7],
  },
  pointData: {
    vtkClass: 'vtkDataSetAttributes',
    activeScalars: 0,
    arrays: [
      {
        data: {
          vtkClass: 'vtkDataArray',
          name: 'rgbData',
          numberOfComponents: 3,
          // size: 12,
          dataType: 'Float32Array',
          values: [1, 0, 0, 1, 0, 0, 1, 0.4, 0.3, 1, 0.4, 0.3],
        },
      },
    ],
  },
});

const mapper = vtkMapper.newInstance();
// mapper.setColorModeToDirectScalars();
// mapper.setColorByArrayName('rgbData');
mapper.setInputData(polydata);
mapper.setInterpolateScalarsBeforeMapping(true);

// mapper.setScalarRange(0.0, 1);
// mapper.setOrientationArray('pressure');
// mapper.setSliceAtFocalPoint(true);

const actor = vtkActor.newInstance();
// actor.getProperty().setColor([1, 1, 0]); // 背景色
actor.getProperty().setEdgeVisibility(true);
actor.getProperty().setEdgeColor(1.0, 0.5, 0.5);
actor.setMapper(mapper);
renderer.addActor(actor);
renderer.resetCamera();
renderWindow.render();

// -----------------------------------------------------------
// Make some variables global so that you can inspect and
// modify objects in your browser's developer console:
// -----------------------------------------------------------

global.source = polydata;
global.mapper = mapper;
global.actor = actor;
// global.lut = lut;
global.renderer = renderer;
global.renderWindow = renderWindow;

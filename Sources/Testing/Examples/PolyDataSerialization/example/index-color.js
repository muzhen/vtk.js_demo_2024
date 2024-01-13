import '@kitware/vtk.js/favicon';
// import * as d3 from 'd3-scale';
// import { formatDefaultLocale } from 'd3-format';

// Load the rendering pieces we want to use (for both WebGL and WebGPU)
import '@kitware/vtk.js/Rendering/Profiles/Geometry';

// import vtkPlaneSource from 'vtk.js/Sources/Filters/Sources/PlaneSource';
import vtkActor from '@kitware/vtk.js/Rendering/Core/Actor';
// import vtkConeSource from '@kitware/vtk.js/Filters/Sources/ConeSource';
import vtkFullScreenRenderWindow from '@kitware/vtk.js/Rendering/Misc/FullScreenRenderWindow';
import vtkMapper from '@kitware/vtk.js/Rendering/Core/Mapper';
// import vtkScalarBarActor from '@kitware/vtk.js/Rendering/Core/ScalarBarActor';
// import vtkColorTransferFunction from '@kitware/vtk.js/Rendering/Core/ColorTransferFunction';
import vtkLookupTable from '@kitware/vtk.js/Common/Core/LookupTable';
import vtkDataArray from '@kitware/vtk.js/Common/Core/DataArray';
import vtkPolyData from '@kitware/vtk.js/Common/DataModel/PolyData';
import controlPanel from './controlPanel.html';

// ----------------------------------------------------------------------------
// Standard rendering code setup
// ----------------------------------------------------------------------------

const fullScreenRenderer = vtkFullScreenRenderWindow.newInstance();
const renderer = fullScreenRenderer.getRenderer();
const renderWindow = fullScreenRenderer.getRenderWindow();
fullScreenRenderer.addController(controlPanel);

const mapper = vtkMapper.newInstance();
// const lut = mapper.getLookupTable();
const lut = vtkLookupTable.newInstance();
lut.setIndexedLookup(true);
lut.setAnnotation(1.0, 'One');
lut.setAnnotation(2.0, 'Two');
lut.setAnnotation(10.0, 'Ten');
lut.setAnnotation(100.0, 'Many');
lut.setAnnotation(1000.0, 'Lots');
lut.setAnnotation(10000.0, 'Wowza');
lut.removeAnnotation(2.0);
lut.setNumberOfColors(4);
mapper.setLookupTable(lut);

const vtkdata = vtkPolyData.newInstance();
const res = 3;
// Points
const points = new Float32Array(res * res * 3);
vtkdata.getPoints().setData(points, 3);
// Cells
let cellLocation = 0;
const polys = new Uint32Array(8 * (res - 1) * (res - 1));
vtkdata.getPolys().setData(polys, 1);
// Scalars
const scalars = new Float32Array(res * res);

for (let i = 0; i < res; i++) {
  for (let j = 0; j < res; j++) {
    const idx = i * res + j;
    points[idx * 3] = j;
    points[idx * 3 + 1] = i;
    points[idx * 3 + 2] = 0.0;
    scalars[idx] = 10.0 ** Math.floor(j / 2);
    // also add nan for some data
    if (i === 4) {
      scalars[idx] = NaN;
    }
  }
}

for (let i = 0; i < res - 1; i++) {
  for (let j = 0; j < res - 1; j++) {
    const idx = i * res + j;
    polys[cellLocation++] = 3;
    polys[cellLocation++] = idx;
    polys[cellLocation++] = idx + 1;
    polys[cellLocation++] = idx + res;
    polys[cellLocation++] = 3;
    polys[cellLocation++] = idx + 1;
    polys[cellLocation++] = idx + res + 1;
    polys[cellLocation++] = idx + res;
  }
}
const da = vtkDataArray.newInstance({ numberOfComponents: 1, values: scalars });
vtkdata.getPointData().setScalars(da);

console.log('vtkdata', vtkdata);
mapper.setInputData(vtkdata);
mapper.setInterpolateScalarsBeforeMapping(true);

const actor = vtkActor.newInstance();
actor.getProperty().setEdgeVisibility(true);
actor.getProperty().setEdgeColor(1.0, 0.5, 0.5);
actor.setMapper(mapper);

renderer.addActor(actor);
renderer.resetCamera();
renderWindow.render();

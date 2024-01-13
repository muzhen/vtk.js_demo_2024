import '@kitware/vtk.js/favicon';
import '@kitware/vtk.js/Rendering/Profiles/Geometry';
// import vtk from 'vtk.js/Sources/vtk';
import vtkPlaneSource from 'vtk.js/Sources/Filters/Sources/PlaneSource';
import vtkActor from '@kitware/vtk.js/Rendering/Core/Actor';
import vtkFullScreenRenderWindow from '@kitware/vtk.js/Rendering/Misc/FullScreenRenderWindow';
import vtkMapper from '@kitware/vtk.js/Rendering/Core/Mapper';
import vtkDataArray from '@kitware/vtk.js/Common/Core/DataArray';
import controlPanel from './controlPanel.html';

// const { ColorMode, ScalarMode } = vtkMapper;

const fullScreenRenderer = vtkFullScreenRenderWindow.newInstance();
const renderer = fullScreenRenderer.getRenderer();
const renderWindow = fullScreenRenderer.getRenderWindow();
fullScreenRenderer.addController(controlPanel);
const actor = vtkActor.newInstance();
const mapper = vtkMapper.newInstance();
actor.getProperty().setEdgeVisibility(true);
const cone = vtkPlaneSource.newInstance({
  xResolution: 10,
  yResolution: 25,
});
cone.update();

// 方法1-1
const npts = cone.getOutputData().getPoints().getNumberOfPoints();
const scalars = vtkDataArray.newInstance({ size: npts });
for (let i = 0; i < npts; ++i) {
  scalars.setTuple(i, [i / npts]);
}
// cone.getOutputData().getPointData().setScalars(scalars);
// mapper.setInputData(cone.getOutputData());

// 方法1-2
const numberOfColors = 8;
const table = vtkDataArray.newInstance({
  numberOfComponents: 4,
  size: 4 * numberOfColors,
  dataType: 'Uint8Array',
});
table.setTuple(0, [215, 0, 0, 255]);
table.setTuple(1, [140, 60, 255, 255]);
table.setTuple(2, [2, 136, 0, 255]);
table.setTuple(3, [0, 172, 199, 255]);
table.setTuple(4, [152, 255, 0, 255]);
table.setTuple(5, [255, 127, 209, 255]);
table.setTuple(6, [108, 0, 79, 255]);
table.setTuple(7, [255, 165, 48, 255]);
cone.getOutputData().getPointData().setScalars(table);
// mapper.setInputData(cone.getOutputData());

// 方法1-3
// const dataArray = vtkDataArray.newInstance({
//   numberOfComponents: 3,
//   values: [255, 0, 0, 255, 255, 0, 255, 0, 255, 255, 0, 255],
//   name: 'color',
// });
// cone.getOutputData().getPointData().setScalars(dataArray);
mapper.setInputData(cone.getOutputData());

actor.setMapper(mapper);
actor.getProperty().setColor([255, 1, 0]); // 如果绘制物体有属性数据，这则无效

renderer.addActor(actor);
renderer.resetCamera();
renderWindow.render();

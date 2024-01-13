import 'vtk.js/Sources/favicon';

// Load the rendering pieces we want to use (for both WebGL and WebGPU)
import 'vtk.js/Sources/Rendering/Profiles/Geometry';

import vtkFullScreenRenderWindow from 'vtk.js/Sources/Rendering/Misc/FullScreenRenderWindow';
// import vtk from 'vtk.js/Sources/vtk';
import vtkActor from 'vtk.js/Sources/Rendering/Core/Actor';
import vtkMapper from 'vtk.js/Sources/Rendering/Core/Mapper';
import vtkDataArray from 'vtk.js/Sources/Common/Core/DataArray';
import vtkLookupTable from '@kitware/vtk.js/Common/Core/LookupTable';
// import * as vtkMath from 'vtk.js/Sources/Common/Core/Math';

import vtkPoints from 'vtk.js/Sources/Common/Core/Points';
import vtkPolyData from 'vtk.js/Sources/Common/DataModel/PolyData';

const fullScreenRenderer = vtkFullScreenRenderWindow.newInstance({
  background: [0, 0, 0],
});
const renderer = fullScreenRenderer.getRenderer();
const renderWindow = fullScreenRenderer.getRenderWindow();

const mapper = vtkMapper.newInstance();

const polyData = vtkPolyData.newInstance();
const points = vtkPoints.newInstance();
const numSegments = 4 * 4; //  4 8 12
points.setNumberOfPoints(numSegments + 1);
const pointData = new Float32Array(3 * (numSegments + 1));
// const pointsIndex = new Float32Array(5 * numSegments); // 点的序号
const scalarsData = new Float32Array(numSegments + 1);
const table = vtkDataArray.newInstance({
  numberOfComponents: 4,
  size: 4 * numSegments,
  dataType: 'Uint8Array',
});
// mapper.setColorModeToDirectScalars();
// mapper.setColorByArrayName('rgbData');
const xStardP = 1;
const xEndP = xStardP + 0.25;
const disY = 1; // y间隔
let offsetY = 1;
let pointsd = [];
const colorsMap = [
  {
    color: [68, 1, 84], // 紫
    val: '12',
  },
  {
    color: [58, 82, 136],
    val: '120',
  },
  {
    color: [32, 144, 140], // 绿色
    val: '120',
  },
  {
    color: [94, 201, 97],
    val: '1200',
  },
  {
    color: [253, 231, 36], // 黄色
    val: '1200',
  },
  // {
  //   color: [255, 255, 0], // 黄色
  //   val: '12',
  // },
  // {
  //   color: [0, 255, 0], // 绿
  //   val: '120',
  // },
  // {
  //   color: [255, 0, 0], // 红
  //   val: '120',
  // },
  // {
  //   color: [0, 0, 255], // 蓝
  //   val: '1200',
  // },
  // {
  //   color: [255, 0, 255], // 紫
  //   val: '1200',
  // },
];
for (let i = 0; i < numSegments; i++) {
  const n = 4;
  const pos = i % n; // 0-3 顶点
  if (pos === 0) pointsd = [...pointsd, n]; // 每个格子的总点数
  pointsd = [...pointsd, i];

  if (i < 2) {
    table.setTuple(i, [...colorsMap[0].color, 255]);
  } else {
    const index = Math.ceil((i - 1) / 4);
    table.setTuple(i, [...colorsMap[index].color, 255]);
    // table.setTuple(0, [255, 0, 0, 255]); // 红
  }
  if (pos === 0) {
    // 左下角
    pointData[3 * i + 0] = xStardP;
    pointData[3 * i + 1] = offsetY;
    pointData[3 * i + 2] = 0;
  } else if (pos === 1) {
    // 右下角
    pointData[3 * i + 0] = xEndP;
    pointData[3 * i + 1] = offsetY;
    pointData[3 * i + 2] = 0;
  } else if (pos === 2) {
    offsetY += disY;
    pointData[3 * i + 0] = xEndP;
    pointData[3 * i + 1] = offsetY;
    pointData[3 * i + 2] = 0;
    // 右上角
  } else {
    // 左上角
    pointData[3 * i + 0] = xStardP;
    pointData[3 * i + 1] = offsetY;
    pointData[3 * i + 2] = 0;
  }
  scalarsData[i] = i;
}

// 设定每个顶点的标量值
const scalars = vtkDataArray.newInstance({
  name: 'Scalars',
  values: scalarsData,
});
polyData.getPointData().setScalars(scalars);
points.setData(pointData);
// polyData.getPoints().setData(Float32Array.from(points), 3);
polyData.setPoints(points);
polyData.getPolys().setData(Uint16Array.from([...pointsd]));
// polyData.setPolys(points);

mapper.setInputData(polyData);
// 建立颜色映射查找表
const colorTable = vtkLookupTable.newInstance();
colorTable.setNumberOfColors(numSegments); // 设置颜色的分块

// colorTable.setRange(0.0, 255.0); // 要映射的标量数据的范围
// colorTable.setHueRange(0.8, 0.0); // 设置HSV颜色空间的Hue值范围，最大范围是[0,1]，设置色调范围
// colorTable.setValueRange(0.8, 0.0); // 设置HSV颜色空间的Value范围，最大范围是[0,1]
// colorTable.build(); // 生成颜色映射表
colorTable.setTable(table);

// 建立颜色映射
mapper.setLookupTable(colorTable);
// 插值开关
// mapper.setInterpolateScalarsBeforeMapping(true);
// 设置标量值的范围
mapper.setScalarRange(0.0, numSegments);
// mapper.setOrientationArray('pressure');
// mapper.setSliceAtFocalPoint(true);

const actor = vtkActor.newInstance();
// actor.getProperty().setColor([1, 1, 0]); // 背景色
// actor.getProperty().setEdgeVisibility(true);
// actor.getProperty().setEdgeColor(1.0, 0.5, 0.5);
actor.setMapper(mapper);
renderer.addActor(actor);
renderer.resetCamera();
renderWindow.render();

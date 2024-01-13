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
points.setNumberOfPoints(numSegments);
const pointData = new Float32Array(3 * numSegments);
// const pointsIndex = new Float32Array(5 * numSegments); // 点的序号
const scalarsData = new Float32Array(numSegments);
const table = vtkDataArray.newInstance({
  numberOfComponents: 4,
  size: 4 * numSegments, // 4为rgbx，
  dataType: 'Uint8Array',
});
// mapper.setColorModeToDirectScalars();
// mapper.setColorByArrayName('rgbData');
const xStardP = 1;
const xEndP = xStardP + 0.25;
const disY = 1; // y间隔
let offsetY = 1;
let pointsd = [];
function hexToRgba(hexColor, alpha = 255) {
  // 移除 # 号并提取颜色值
  const hex = hexColor.replace('#', '');
  // 将颜色值拆分成 R、G、B 三个部分
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  // 转换为 RGBA 格式并添加透明度
  // const rgba = `rgba(${r}, ${g}, ${b}, ${alpha})`;
  return [r, g, b];
}

const colorsMap = [
  {
    color: hexToRgba('#440154'), // 紫
    val: '12',
  },
  {
    color: hexToRgba('#3A5288'),
    val: '120',
  },
  {
    color: hexToRgba('#20908C'), // 绿色
    val: '120',
  },
  {
    color: hexToRgba('#5EC961'),
    val: '1200',
  },
  {
    color: hexToRgba('#FDE724'), // 黄色
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
  const n = 4; // 4个顶点
  const pos = i % n; // 0-3 顶点
  if (pos === 0) pointsd = [...pointsd, n]; // 每个格子的总点数
  pointsd = [...pointsd, i];
  console.log(colorsMap[0].color);

  const index = i < 2 ? 0 : Math.ceil((i - 1) / 4);
  table.setTuple(i, [...colorsMap[index].color, 255]);
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
mapper.setScalarRange(0, numSegments); // 设置标量值的范围
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

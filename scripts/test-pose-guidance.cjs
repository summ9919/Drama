const test = require('node:test');
const assert = require('node:assert/strict');
const { loadModule } = require('./helpers/load-ts.cjs');

const { POSE_TEMPLATES } = loadModule('src/constants/poseTemplates.ts');
const { POSE_KEYPOINT_NAMES, POSE_SKELETON_BONES, POSE_THRESHOLDS } = loadModule('src/constants/poseConfig.ts');
const { evaluatePoseMatch } = loadModule('src/lib/poseMatching.ts');

test('姿势模板关键点完整性与坐标范围验证', () => {
  assert.ok(POSE_TEMPLATES.length >= 5, '至少包含 5 种预置姿势模板');
  assert.equal(POSE_KEYPOINT_NAMES.length, 17, '必须覆盖全部 17 个关键点');

  for (const template of POSE_TEMPLATES) {
    assert.ok(template.id, '模板必须具备 ID');
    assert.ok(template.name, '模板必须具备显示名称');
    assert.ok(template.keypoints.length >= 13, `模板 ${template.name} 关键点至少包含主要骨骼点`);

    for (const kp of template.keypoints) {
      assert.ok(POSE_KEYPOINT_NAMES.includes(kp.name), `关键点名称 ${kp.name} 必须合法`);
      assert.ok(kp.x >= 0 && kp.x <= 1, `关键点 ${kp.name} x 坐标必须在 [0, 1]`);
      assert.ok(kp.y >= 0 && kp.y <= 1, `关键点 ${kp.name} y 坐标必须在 [0, 1]`);
    }
  }

  // 骨骼连线有效性
  for (const [from, to] of POSE_SKELETON_BONES) {
    assert.ok(POSE_KEYPOINT_NAMES.includes(from), `骨骼起点 ${from} 合法`);
    assert.ok(POSE_KEYPOINT_NAMES.includes(to), `骨骼终点 ${to} 合法`);
  }
});

test('姿势匹配评估算法准确性', () => {
  const target = POSE_TEMPLATES[0]; // 自然站立

  // 1. 完全对齐情况
  const exactDetected = target.keypoints.map(kp => ({
    name: kp.name,
    x: kp.x,
    y: kp.y,
    confidence: 0.95,
  }));

  const perfectMatch = evaluatePoseMatch(exactDetected, target.keypoints);
  assert.equal(perfectMatch.matched, true, '完全重合姿势应匹配成功');
  assert.ok(perfectMatch.score >= 0.90, `完全重合姿势得分应 >= 0.90，实测: ${perfectMatch.score}`);

  // 2. 明显偏离情况（例如手脚完全移位）
  const invertedDetected = target.keypoints.map(kp => ({
    name: kp.name,
    x: 1 - kp.x,
    y: 1 - kp.y,
    confidence: 0.9,
  }));

  const badMatch = evaluatePoseMatch(invertedDetected, target.keypoints);
  assert.equal(badMatch.matched, false, '颠倒偏离姿势不应匹配成功');
  assert.ok(badMatch.score < 0.50, `颠倒姿势得分应低于 0.50，实测: ${badMatch.score}`);

  // 3. 极少量检测点时的保底
  const fewPoints = exactDetected.slice(0, 3);
  const sparseMatch = evaluatePoseMatch(fewPoints, target.keypoints);
  assert.equal(sparseMatch.matched, false, '不足 5 个关键点时应提示站入画面');
});

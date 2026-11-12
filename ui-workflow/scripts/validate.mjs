#!/usr/bin/env node
// 校验一个 run 里所有 JSON 产物是否符合合同，以及证据链是否接得上。
// 用法: node scripts/validate.mjs runs/<name>
import fs from 'node:fs';
import path from 'node:path';
import {KIT, Report, list, readJson, require, resolveRun} from './lib.mjs';

export function validateRun(runAbs, report) {
  const Ajv = require('ajv');
  const ajv = new Ajv({allErrors: true, strict: false});
  const schema = (n) => ajv.compile(readJson(path.join(KIT, 'schemas', `${n}.schema.json`)));
  const check = (validator, file, name) => {
    let data;
    try {
      data = readJson(file);
    } catch (e) {
      report.fail('schema', `不是合法 JSON: ${e.message}`, path.relative(runAbs, file));
      return null;
    }
    if (!validator(data)) {
      for (const err of validator.errors) report.fail('schema', `${name}${err.instancePath} ${err.message}${err.params?.additionalProperty ? `: ${err.params.additionalProperty}` : ''}`, path.relative(runAbs, file));
      return null;
    }
    report.pass('schema', `${path.relative(runAbs, file)} 符合 ${name} 合同`);
    return data;
  };

  // brief
  const briefFile = path.join(runAbs, 'brief.json');
  if (!fs.existsSync(briefFile)) {
    report.fail('schema', '缺 brief.json（阶段 0）');
    return {};
  }
  const brief = check(schema('brief'), briefFile, 'brief');

  // analyses
  const vAnalysis = schema('analysis');
  const analyses = list(path.join(runAbs, 'refs/analysis'), ['.json']).map((f) => check(vAnalysis, f, 'analysis')).filter(Boolean);
  const analysisIds = new Set(analyses.map((a) => a.id));
  const shots = list(path.join(runAbs, 'refs/shots'), ['.png', '.jpg', '.jpeg', '.webp']);
  const hasRefs = shots.length > 0 || analyses.length > 0;

  if (!hasRefs) {
    report.warn('refs', '无参考模式：refs/shots 是空的。产出只受组件库和风格约束，没有真实产品的结构依据');
  } else {
    for (const s of shots) {
      const id = path.basename(s).replace(/\.[^.]+$/, '');
      if (!analysisIds.has(id)) report.fail('refs', `截图没有对应的读图结果 refs/analysis/${id}.json`, path.relative(runAbs, s));
    }
    if (brief) {
      const min = brief.function_refs.min_apps_per_screen;
      for (const sc of brief.screens) {
        const apps = new Set(analyses.filter((a) => a.for_screen === sc.id).map((a) => a.source.app.toLowerCase()));
        if (apps.size < min) report.fail('refs', `屏 ${sc.id} 只有 ${apps.size} 个不同 app 的参考，要求 ≥ ${min}（少于 3 个就会变成照抄某一个）`);
        else report.pass('refs', `屏 ${sc.id} 有 ${apps.size} 个不同 app 的参考`);
      }
    }
    const patternsFile = path.join(runAbs, 'refs/patterns.json');
    if (!fs.existsSync(patternsFile)) report.fail('refs', '有参考但缺 refs/patterns.json（阶段 2 的归纳）');
    else {
      const patterns = check(schema('patterns'), patternsFile, 'patterns');
      if (patterns) {
        const cited = patterns.screens.flatMap((s) => [
          ...s.consensus.flatMap((c) => c.evidence),
          ...(s.divergences ?? []).flatMap((d) => d.options.flatMap((o) => o.evidence)),
          ...s.decisions.flatMap((d) => d.evidence ?? []),
        ]);
        for (const id of new Set(cited)) if (!analysisIds.has(id)) report.fail('evidence', `patterns.json 引用了不存在的 analysis: ${id}`);
      }
    }
  }

  // specs
  const vSpec = schema('spec');
  const specs = list(path.join(runAbs, 'specs'), ['.json']).map((f) => check(vSpec, f, 'spec')).filter(Boolean);
  if (brief) {
    for (const sc of brief.screens) if (!specs.some((s) => s.screen_id === sc.id)) report.warn('spec', `brief 里的屏 ${sc.id} 还没有 specs/${sc.id}.json`);
  }
  for (const spec of specs) {
    const where = `specs/${spec.screen_id}.json`;
    const ids = spec.regions.map((r) => r.id);
    if (new Set(ids).size !== ids.length) report.fail('spec', 'region id 重复', where);
    if (!ids.includes(spec.primary_action.region)) report.fail('spec', `primary_action.region "${spec.primary_action.region}" 不是本屏的 region`, where);
    const primaries = spec.regions.filter((r) => r.priority === 'primary').length;
    if (primaries !== 1) report.fail('spec', `一屏只能有 1 个 primary 区，现在是 ${primaries} 个`, where);
    for (const r of spec.regions) {
      for (const e of r.evidence ?? []) if (!analysisIds.has(e)) report.fail('evidence', `region ${r.id} 引用了不存在的 analysis: ${e}`, where);
      if (hasRefs && !(r.evidence ?? []).length && !r.notes) report.fail('evidence', `region ${r.id} 既没有参考证据，也没有在 notes 里说明为什么需要它`, where);
    }
  }
  return {brief, specs, analyses, hasRefs};
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const {abs} = resolveRun(process.argv[2]);
  const report = new Report();
  validateRun(abs, report);
  report.print();
  process.exit(report.count('fail') ? 1 : 0);
}

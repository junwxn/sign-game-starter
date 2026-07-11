import { CV } from '../config';
import { FEAT_DIM, T, type Model } from './signfeat.js';

function assetUrl(path: string): string {
  return new URL(`${import.meta.env.BASE_URL}${path}`, window.location.href).href;
}

export async function loadSignModel(path = CV.modelPath): Promise<Model> {
  const response = await fetch(assetUrl(path));
  if (!response.ok) {
    throw new Error(`Sign model failed to load (${response.status}).`);
  }

  const model = (await response.json()) as Model;
  if (!Array.isArray(model.labels) || model.labels.length === 0 || !Array.isArray(model.layers)) {
    throw new Error('Sign model is malformed.');
  }
  if (model.meta?.featDim !== FEAT_DIM || model.meta?.T !== T) {
    throw new Error(
      `Sign model/feature mismatch (model ${model.meta?.T}×${model.meta?.featDim}, runtime ${T}×${FEAT_DIM}).`,
    );
  }

  const vectorLength = T * FEAT_DIM;
  for (const label of model.labels) {
    const proto = model.protos?.[label];
    if (!proto || proto.c.length !== vectorLength || !(proto.r > 0)) {
      throw new Error(`Sign model is missing a valid prototype for ${label}.`);
    }
  }
  return model;
}

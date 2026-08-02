export interface SignReference {
  variant: string;
  mediaType: "image" | "video";
  mediaUrl: string;
  sourceUrl: string;
}

const WORD_PAGE = "https://blogs.ntu.edu.sg/sgslsignbank/word/?frm-word=";

/**
 * Temporary teaching references from the official SgSL Sign Bank.
 *
 * These are remote links, not bundled assets. Variant IDs were not stored in
 * the landmark clips: default variants are used except alternate variant EATo,
 * whose Flat-O hand-to-mouth motion matches the collected data. Replace mediaUrl values
 * with team-owned files when those recordings are ready.
 */
export const SIGN_REFERENCES: Record<string, SignReference> = {
  coffee: {
    variant: "COFFEE",
    mediaType: "image",
    mediaUrl:
      "https://blogs.ntu.edu.sg/sgslsignbank/files/formidable/3/2024-03-18/P1090555_17-5c206c-6ea61ac42b995f7e.gif",
    sourceUrl: `${WORD_PAGE}Coffee`,
  },
  eat: {
    variant: "EATo · variant 2",
    mediaType: "image",
    mediaUrl:
      "https://blogs.ntu.edu.sg/sgslsignbank/files/formidable/3/gif_eat_signer3_v1-2b6918.gif",
    sourceUrl: `${WORD_PAGE}Eat`,
  },
  finish: {
    variant: "FINISH-A",
    mediaType: "image",
    mediaUrl:
      "https://blogs.ntu.edu.sg/sgslsignbank/files/formidable/3/gif_finish_signer5_v1-b8ae40.gif",
    sourceUrl: `${WORD_PAGE}Finish`,
  },
  go: {
    variant: "GO",
    mediaType: "image",
    mediaUrl:
      "https://blogs.ntu.edu.sg/sgslsignbank/files/formidable/3/2023-12-20/ezgif.com-crop-73-5008a0.gif",
    sourceUrl: `${WORD_PAGE}Go`,
  },
  good: {
    variant: "GOOD-A",
    mediaType: "image",
    mediaUrl:
      "https://blogs.ntu.edu.sg/sgslsignbank/files/formidable/3/gif_good_signer4_v1-14bed6.gif",
    sourceUrl: `${WORD_PAGE}Good`,
  },
  home: {
    variant: "HOME",
    mediaType: "image",
    mediaUrl: "https://blogs.ntu.edu.sg/sgslsignbank/files/formidable/3/gif_home_v1-59eb11.gif",
    sourceUrl: `${WORD_PAGE}Home`,
  },
  morning: {
    variant: "MORNINGb",
    mediaType: "image",
    mediaUrl:
      "https://blogs.ntu.edu.sg/sgslsignbank/files/formidable/3/gif_morning_signer3_v1-c0982a.gif",
    sourceUrl: `${WORD_PAGE}Morning`,
  },
  now: {
    variant: "NOW-A",
    mediaType: "image",
    mediaUrl:
      "https://blogs.ntu.edu.sg/sgslsignbank/files/formidable/3/gif_now_signer6_v2-f47021.gif",
    sourceUrl: `${WORD_PAGE}Now`,
  },
  toilet: {
    variant: "TOILET",
    mediaType: "image",
    mediaUrl:
      "https://blogs.ntu.edu.sg/sgslsignbank/files/formidable/3/2025-03-28/P1090578_29-dd3680.gif",
    sourceUrl: `${WORD_PAGE}Toilet`,
  },
  want: {
    variant: "WANT",
    mediaType: "image",
    mediaUrl:
      "https://blogs.ntu.edu.sg/sgslsignbank/files/formidable/3/gif_want_signer6_v1-b7f8bc.gif",
    sourceUrl: `${WORD_PAGE}Want`,
  },
  where: {
    variant: "WHERE",
    mediaType: "image",
    mediaUrl:
      "https://blogs.ntu.edu.sg/sgslsignbank/files/formidable/3/gif_where_signer4_v1-14dc73.gif",
    sourceUrl: `${WORD_PAGE}Where`,
  },
};

let renderGeneration = 0;

export function showSignReference(label: string | null): void {
  const panel = document.getElementById("sign-reference");
  const title = document.getElementById("sign-reference-label");
  const variant = document.getElementById("sign-reference-variant");
  const image = document.getElementById("sign-reference-media");
  const video = document.getElementById("sign-reference-video");
  const status = document.getElementById("sign-reference-status");
  const source = document.getElementById("sign-reference-source");
  if (
    !(panel instanceof HTMLElement) ||
    !(title instanceof HTMLElement) ||
    !(variant instanceof HTMLElement) ||
    !(image instanceof HTMLImageElement) ||
    !(video instanceof HTMLVideoElement) ||
    !(status instanceof HTMLElement) ||
    !(source instanceof HTMLAnchorElement)
  ) {
    return;
  }

  const key = label?.toLowerCase() ?? "";
  const reference = SIGN_REFERENCES[key];
  if (!reference) {
    renderGeneration += 1;
    panel.hidden = true;
    image.removeAttribute("src");
    video.pause();
    video.removeAttribute("src");
    video.load();
    image.dataset.label = "";
    return;
  }

  panel.hidden = false;
  title.textContent = key.toUpperCase();
  variant.textContent = `Bank variant ${reference.variant}`;
  source.href = reference.sourceUrl;
  if (image.dataset.label === key) return;

  const generation = ++renderGeneration;
  image.dataset.label = key;
  image.alt = `${key.toUpperCase()} sign demonstration, ${reference.variant}`;
  image.hidden = true;
  video.hidden = true;
  status.hidden = false;
  status.textContent = "loading reference…";
  if (reference.mediaType === "video") {
    image.removeAttribute("src");
    video.onloadeddata = () => {
      if (generation !== renderGeneration) return;
      video.hidden = false;
      status.hidden = true;
      void video.play();
    };
    video.onerror = () => showMediaError(generation, status, image, video);
    video.src = reference.mediaUrl;
    video.load();
  } else {
    video.pause();
    video.removeAttribute("src");
    video.load();
    image.onload = () => {
      if (generation !== renderGeneration) return;
      image.hidden = false;
      status.hidden = true;
    };
    image.onerror = () => showMediaError(generation, status, image, video);
    image.src = reference.mediaUrl;
  }
}

function showMediaError(
  generation: number,
  status: HTMLElement,
  image: HTMLImageElement,
  video: HTMLVideoElement,
): void {
  if (generation !== renderGeneration) return;
  image.hidden = true;
  video.hidden = true;
  status.hidden = false;
  status.textContent = "reference unavailable — open the Sign Bank link";
}
